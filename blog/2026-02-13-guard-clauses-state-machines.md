---
slug: guard-clauses-state-machines
title: "Guard Clauses in .orb State Machines"
authors: [osamah]
tags: [architecture, state-machines]
image: /img/blog/guard-clauses-state-machines.svg
---
import { AvlStateMachine } from '@almadar/ui/illustrations';

Authorization logic is usually scattered across components, API routes, and middleware. In .orb, guards are part of the state machine definition. One declaration, enforced everywhere.

<!-- truncate -->

## Guards on the State Machine

A guard is a boolean s-expression attached to a transition. If it evaluates to false, the transition is blocked. The event is received, but nothing happens.

Here is an approval workflow with guards controlling who can approve, reject, or escalate:

<div style={{margin: '2rem 0'}}>
<AvlStateMachine
  states={[
    {name: "draft", isInitial: true},
    {name: "pending"},
    {name: "approved", isTerminal: true},
    {name: "rejected"},
    {name: "escalated"}
  ]}
  transitions={[
    {from: "draft", to: "pending", event: "SUBMIT"},
    {from: "pending", to: "approved", event: "APPROVE (role>=5)"},
    {from: "pending", to: "rejected", event: "REJECT (role>=5)"},
    {from: "pending", to: "escalated", event: "ESCALATE (role>=5)"},
    {from: "escalated", to: "approved", event: "APPROVE (role>=9)"},
    {from: "rejected", to: "draft", event: "EDIT (owner)"}
  ]}
  animated
/>
</div>

## Guard Syntax

Guards use s-expression syntax with binding roots like `@entity`, `@user`, `@payload`, and `@now`:

**Simple comparison** (only the owner can submit):
```json
{
  "from": "draft",
  "to": "pending",
  "event": "SUBMIT",
  "guard": ["=", "@entity.authorId", "@user.id"]
}
```

**Role-based** (admin level required):
```json
{
  "from": "pending",
  "to": "approved",
  "event": "APPROVE",
  "guard": [">=", "@user.roleLevel", 5]
}
```

**Multi-condition** (tiered approval limits):
```json
{
  "from": "pending",
  "to": "approved",
  "event": "APPROVE",
  "guard": ["and",
    [">=", "@user.roleLevel", 5],
    ["not", "@entity.isFlagged"],
    ["or",
      ["<", "@entity.amount", 5000],
      ["and",
        [">=", "@user.roleLevel", 7],
        ["<", "@entity.amount", 50000]
      ]
    ]
  ]
}
```

This encodes: level 5+ can approve up to $5K, level 7+ up to $50K. Flagged orders cannot be approved at any level.

**Time-based** (action allowed only within 24 hours):
```json
{
  "guard": ["<",
    ["-", "@now", "@entity.createdAt"],
    86400000
  ]
}
```

## A Complete Approval Workflow

```json
{
  "name": "OrderApproval",
  "linkedEntity": "Order",
  "stateMachine": {
    "states": [
      { "name": "draft", "isInitial": true },
      { "name": "pending" },
      { "name": "approved" },
      { "name": "rejected" },
      { "name": "escalated" }
    ],
    "transitions": [
      {
        "from": "draft",
        "to": "pending",
        "event": "SUBMIT",
        "guard": ["and",
          [">", "@entity.amount", 0],
          ["not", ["is-empty", "@entity.description"]]
        ]
      },
      {
        "from": "pending",
        "to": "approved",
        "event": "APPROVE",
        "guard": ["and",
          [">=", "@user.roleLevel", 5],
          ["not", "@entity.isFlagged"],
          ["<", "@entity.amount", 5000]
        ],
        "effects": [
          ["set", "@entity.status", "approved"],
          ["set", "@entity.approvedAt", "@now"],
          ["persist", "update", "Order", "@entity.id", "@entity"]
        ]
      },
      {
        "from": "pending",
        "to": "escalated",
        "event": "ESCALATE",
        "guard": [">=", "@user.roleLevel", 5]
      },
      {
        "from": "escalated",
        "to": "approved",
        "event": "APPROVE",
        "guard": [">=", "@user.roleLevel", 9]
      },
      {
        "from": "pending",
        "to": "rejected",
        "event": "REJECT",
        "guard": [">=", "@user.roleLevel", 5]
      },
      {
        "from": "rejected",
        "to": "draft",
        "event": "EDIT",
        "guard": ["=", "@entity.authorId", "@user.id"]
      }
    ]
  }
}
```

The guard expressions encode the entire authorization matrix: who can do what, under which conditions, at each stage of the workflow. All in one place.

## Why Guards Beat Scattered Auth Logic

In a traditional application, the approval check lives in the component (`canApprove` computed property), the API route (middleware check), and possibly a database trigger. Three locations, three chances for them to drift out of sync.

In .orb, the guard is declared once on the transition. The compiler generates both the frontend check (button disabled when guard fails) and the backend check (request rejected when guard fails) from the same source. The guard is the single source of truth.

The compiler also validates guard expressions at compile time. It catches unknown operators (`"equals"` instead of `"="`), wrong argument counts (`"and"` with a single argument), type mismatches (comparing a string to a number), and unknown field references (`@entity.staus` when the field is `status`).

Guards are composable boolean expressions evaluated at transition time. They turn authorization from scattered imperative code into a declarative property of the state machine.
