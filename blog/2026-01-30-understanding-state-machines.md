---
slug: understanding-state-machines
title: Understanding State Machines in .orb
authors: [osamah]
tags: [architecture, tutorial]
image: /img/blog/understanding-state-machines.svg
---

![](/img/blog/understanding-state-machines.svg)

import { AvlStateMachine } from '@almadar/ui/illustrations';

State machines are the foundation of every .orb program. Every trait contains one, and the compiler enforces that they are well-formed. This post explains what a state machine is in .orb and walks through a concrete example.

<!-- truncate -->

## What Is a State Machine?

A state machine defines a set of **states** your entity can be in, a set of **events** that trigger change, and a set of **transitions** that move the entity from one state to another. At any moment, the entity is in exactly one state. Only defined transitions are allowed. Everything else is rejected.

This eliminates the most common source of UI bugs: impossible state combinations. With boolean flags, 5 variables create 32 possible states, most of them invalid. A state machine with 5 named states has exactly 5 valid states.

## A Concrete Example: Task Manager

Consider a task management trait with three states:

<div style={{margin: '2rem 0'}}>
<AvlStateMachine
  states={[{name: "browsing", isInitial: true}, {name: "editing"}, {name: "confirming"}]}
  transitions={[
    {from: "browsing", to: "editing", event: "EDIT"},
    {from: "editing", to: "browsing", event: "SAVE"},
    {from: "editing", to: "browsing", event: "CANCEL"},
    {from: "browsing", to: "confirming", event: "DELETE"},
    {from: "confirming", to: "browsing", event: "CONFIRM"},
    {from: "confirming", to: "browsing", event: "CANCEL"}
  ]}
  animated
/>
</div>

In .orb, this looks like:

```json
{
  "name": "TaskInteraction",
  "linkedEntity": "Task",
  "stateMachine": {
    "states": [
      { "name": "browsing", "isInitial": true },
      { "name": "editing" },
      { "name": "confirming" }
    ],
    "events": [
      { "key": "INIT", "name": "Initialize" },
      { "key": "EDIT", "name": "Edit" },
      { "key": "SAVE", "name": "Save" },
      { "key": "DELETE", "name": "Delete" },
      { "key": "CONFIRM", "name": "Confirm" },
      { "key": "CANCEL", "name": "Cancel" }
    ],
    "transitions": [
      {
        "from": "browsing",
        "to": "browsing",
        "event": "INIT",
        "effects": [
          ["render-ui", "main", { "type": "entity-table", "entity": "Task" }]
        ]
      },
      {
        "from": "browsing",
        "to": "editing",
        "event": "EDIT",
        "effects": [
          ["render-ui", "modal", { "type": "form-section", "entity": "Task" }]
        ]
      },
      {
        "from": "editing",
        "to": "browsing",
        "event": "SAVE",
        "effects": [
          ["persist", "update", "Task", "@entity.id", "@payload.data"],
          ["render-ui", "modal", null],
          ["emit", "INIT"]
        ]
      },
      {
        "from": "editing",
        "to": "browsing",
        "event": "CANCEL",
        "effects": [["render-ui", "modal", null]]
      },
      {
        "from": "browsing",
        "to": "confirming",
        "event": "DELETE",
        "effects": [
          ["render-ui", "modal", { "type": "page-header", "title": "Confirm delete?" }]
        ]
      },
      {
        "from": "confirming",
        "to": "browsing",
        "event": "CONFIRM",
        "effects": [
          ["persist", "delete", "Task", "@entity.id"],
          ["render-ui", "modal", null],
          ["emit", "INIT"]
        ]
      },
      {
        "from": "confirming",
        "to": "browsing",
        "event": "CANCEL",
        "effects": [["render-ui", "modal", null]]
      }
    ]
  }
}
```

## Key Concepts

**States** define the possible modes. `browsing` shows the table, `editing` shows a form in a modal, `confirming` shows a delete confirmation dialog. Exactly one state is active at a time.

**Events** trigger transitions. `EDIT` moves from `browsing` to `editing`. `CANCEL` moves back. The same event can appear in multiple transitions from different states.

**Effects** are the side-effects of a transition. The .orb language supports `set` (update a field), `render-ui` (display a UI pattern), `persist` (save to database), `emit` (publish an event to other traits), and `navigate` (change route).

**Guards** are optional boolean expressions that gate a transition. If the guard evaluates to false, the transition is blocked. Guards use s-expression syntax: `[">=", "@entity.priority", 3]`.

## What the Compiler Enforces

When you run `orbital validate`, the compiler checks:

- Exactly one state is marked `isInitial`
- Every state is reachable (has at least one incoming transition)
- Modal and drawer states have exit transitions (so users cannot get stuck)
- Every event referenced in UI actions has a matching transition
- All entity field references in effects and guards point to real fields

If any of these rules are violated, compilation fails with a specific error code and a suggested fix. You cannot generate a broken application from a valid .orb program.

## Why This Matters

State machines give you predictability (you always know what state the app is in), testability (test each transition independently), and security (guards prevent unauthorized state changes). The .orb compiler adds a layer that traditional state machine libraries do not: structural validation before any code is generated.

The result is applications where every user interaction flows through a verified circuit of states, events, and transitions.
