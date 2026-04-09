---
slug: json-that-thinks
title: "JSON That Thinks: How We Built a Turing-Complete Language Inside JSON"
authors: [osamah]
tags: [language-design, architecture]
image: /img/blog/json-that-thinks.svg
---

![](/img/blog/json-that-thinks.svg)

import { AvlExprTree } from '@almadar/ui/illustrations';

Every configuration language eventually hits the same wall: you need logic, but your format only holds data. YAML leads to Helm chart nightmares. HCL and Dhall invent new syntax with new parsers. Jsonnet gets close but breaks JSON compatibility. Almadar took a different route: S-expressions encoded as JSON arrays, giving you a Turing-complete language that every JSON tool already understands.

<!-- truncate -->

## S-Expressions Are Already JSON

In 1958, John McCarthy built Lisp on S-expressions: `(+ 1 2)`. An S-expression is a nested list with an operator in the first position. JSON arrays are nested lists. The mapping is direct:

```json
["+", 1, 2]
["if", [">", "x", 10], "big", "small"]
```

No new syntax. No custom parser. Just a convention for interpreting what JSON already provides.

## Guards: Logic That Controls Transitions

In .orb, S-expressions appear as guards on state machine transitions. A guard must evaluate to `true` for the transition to fire:

```json
{
  "from": "Pending",
  "to": "Approved",
  "event": "APPROVE",
  "guard": ["and",
    [">=", "@user.roleLevel", 3],
    ["<", "@entity.amount", 10000]
  ]
}
```

The evaluator resolves bindings (`@user.roleLevel` becomes `5`, `@entity.amount` becomes `7500`), evaluates inner expressions, then evaluates the outer `and`. If the result is `false`, the transition does not exist. There is no "skip" button, no override path.

<div style={{margin: '2rem 0'}}>
<AvlExprTree
  expression={{label: "and", type: "operator", children: [
    {label: "gte", type: "operator", children: [
      {label: "@user.roleLevel", type: "binding"},
      {label: "3", type: "literal"}
    ]},
    {label: "lt", type: "operator", children: [
      {label: "@entity.amount", type: "binding"},
      {label: "10000", type: "literal"}
    ]}
  ]}}
  animated
/>
</div>

## Effects: Actions That Follow Transitions

Effects are also S-expressions. They run after a guard passes:

```json
"effects": [
  ["set", "@entity.status", "approved"],
  ["set", "@entity.approvedAt", "@now"],
  ["emit", "REQUEST_APPROVED"]
]
```

`set` writes to entity fields. `emit` sends cross-orbital events. `persist` saves to the database. `render-ui` renders a component. Each effect is a single array with an operator and operands.

## Arithmetic, Branching, Recursion

S-expressions handle computed values inside effects:

```json
["set", "@entity.total", ["+", "@entity.subtotal", ["*", "@entity.subtotal", 0.15]]]
```

Conditional logic works with `if`:

```json
["if", [">", "@entity.score", 100],
  ["emit", "ACHIEVEMENT_UNLOCKED"],
  ["emit", "KEEP_GOING"]
]
```

Self-transitions with guards give you loops. This transition computes a running sum:

```json
{
  "from": "Computing",
  "to": "Computing",
  "event": "TICK",
  "guard": [">", "@entity.counter", 0],
  "effects": [
    ["set", "@entity.counter", ["-", "@entity.counter", 1]],
    ["set", "@entity.result", ["+", "@entity.result", "@entity.counter"]],
    ["emit", "TICK"]
  ]
}
```

State machine as loop. Entity fields as memory. Guard as termination condition. That combination makes .orb Turing-complete.

## The Binding Context

S-expressions reference runtime data through prefixed bindings:

| Prefix | Resolves To |
|--------|-------------|
| `@entity.field` | Current entity field value |
| `@payload.field` | Event payload data |
| `@state` | Current state name |
| `@now` | Current timestamp |
| `@config.field` | Application config |

These bindings are validated at compile time. Reference a field that does not exist on the entity, and `orbital validate` catches it before any code runs.

## The Tradeoff: Verbosity for Universality

A hypothetical custom syntax: `guard: user.roleLevel >= 3 and entity.amount < 10000` (50 characters).

The .orb version: `["and", [">=", "@user.roleLevel", 3], ["<", "@entity.amount", 10000]]` (75 characters).

About 50% more characters. In exchange: no custom parser, no custom LSP, no new syntax to learn, every JSON tool works, and LLMs generate it correctly on the first try. Verbosity is a one-time cost. Tooling compatibility compounds forever.

## Extending Without Breaking

New operators are additive. Adding `geo-distance` to the evaluator does not require a schema version bump:

```json
["geo-distance", "@entity.location", "@payload.target"]
```

If the evaluator knows the operator, it runs. If not, it returns a clear error. This extensibility model kept Lisp alive for 65 years.

Explore the full operator list in the [S-expression standard library](https://orb.almadar.io/playground).
