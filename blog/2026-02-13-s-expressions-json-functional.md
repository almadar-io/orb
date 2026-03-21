---
slug: s-expressions-json-functional
title: "S-Expressions: The JSON of Functional Programming (That Actually Makes Sense)"
image: /img/blog/s-expressions-json-functional.png
authors: [osamah]
tags: [architecture]
---
import { AvlExprTree } from '@almadar/ui/illustrations';

JSON holds data beautifully but has no answer for logic. String templates are error-prone and injectable. Custom DSLs are verbose and hard to validate. JavaScript functions are not serializable. S-expressions solve all three problems: they are structured, serializable, and executable, encoded as plain JSON arrays.

<!-- truncate -->

## The Problem

When you need conditional logic inside JSON, the options are all flawed:

**String templates** like `"user.age >= 18 && user.verified"` invite typos, injection, and zero validation.

**Custom DSL objects** like nested `"and"/"gte"/"eq"` structures work but are verbose and idiosyncratic.

**JavaScript functions** are readable but not serializable, not cross-platform, and not safe.

S-expressions give you the expressiveness of code with the safety of data.

## S-Expressions in .orb

The format is simple: `["operator", operand1, operand2, ...]`. In .orb, S-expressions appear in two places: guards (conditional logic) and effects (actions).

<div style={{margin: '2rem 0'}}>
<AvlExprTree
  expression={{label: "gt", type: "operator", children: [
    {label: "@entity.count", type: "binding"},
    {label: "5", type: "literal"}
  ]}}
  animated
/>
</div>

### Guards

A guard is an S-expression that must evaluate to `true` for a transition to fire:

```json
{
  "from": "pending",
  "to": "approved",
  "event": "APPROVE",
  "guard": ["and",
    [">=", "@user.roleLevel", 5],
    ["not", "@entity.isFlagged"],
    [">", "@entity.amount", 0]
  ]
}
```

Equivalent JavaScript: `if (user.roleLevel >= 5 && !entity.isFlagged && entity.amount > 0)`. But the S-expression version is serializable, validatable, secure (no eval), and cross-platform.

### Effects

Effects are S-expressions that run after a guard passes:

```json
"effects": [
  ["set", "@entity.status", "approved"],
  ["set", "@entity.approvedAt", "@now"],
  ["persist", "update", "Order", "@entity"]
]
```

`set` writes a field. `persist` saves to the database. `emit` sends cross-orbital events. `render-ui` renders a component. `notify` shows a message. Each is a single array.

## Composability

S-expressions nest to any depth:

```json
["if",
  ["and",
    [">", "@entity.score", 100],
    ["=", "@entity.status", "active"]
  ],
  ["emit", "ACHIEVEMENT_UNLOCKED"],
  ["emit", "KEEP_GOING"]
]
```

The `if` operator takes a condition, a then-branch, and an else-branch. Each branch can be another S-expression. There is no nesting limit.

## The Binding Context

S-expressions reference runtime data through prefixed bindings:

| Prefix | Meaning | Example |
|--------|---------|---------|
| `@entity.field` | Current entity field | `@entity.status` |
| `@payload.field` | Event payload | `@payload.userId` |
| `@state` | Current state name | `@state` |
| `@now` | Current timestamp | `@now` |
| `@config.field` | App configuration | `@config.maxRetries` |

Bindings are validated at compile time. Reference a nonexistent field and `orbital validate` catches it before any code runs.

## Standard Operators

.orb includes a standard library of operators:

**Comparison**: `=`, `!=`, `>`, `>=`, `<`, `<=`

**Logic**: `and`, `or`, `not`

**Math**: `+`, `-`, `*`, `/`

**Array**: `count`, `contains`, `filter`

**String**: `concat`, `length`, `matches`

**Existence**: `not-empty`, `is-null`

## A Real-World Guard

Here is a guard for an approval workflow with role-based access, lock checking, and amount limits:

```json
{
  "guard": ["and",
    ["or",
      [">=", "@user.roleLevel", 5],
      ["=", "@user.id", "@entity.ownerId"]
    ],
    ["not", "@entity.isLocked"],
    [">", "@entity.amount", 0],
    ["<", "@entity.amount", 10000]
  ]
}
```

This translates to: the user must be either a manager (role level 5+) or the owner. The entity must not be locked. The amount must be between 0 and 10,000. All four conditions enforced declaratively, serializable for audit logs, and validated at compile time.

## The Excel Analogy

If you have used Excel formulas, you have used S-expressions:

```
=IF(AND(A1>100, B1="active"), "Gold", "Silver")
```

In .orb:

```json
["if",
  ["and", [">", "@entity.score", 100], ["=", "@entity.status", "active"]],
  "Gold",
  "Silver"
]
```

Declarative, composable, safe. No arbitrary code execution, no injection risk, no eval.

S-expressions are not a Lisp curiosity. They are a practical, 65-year-old solution to "how do you put logic in data?" that actually works. Explore the full operator list in the [standard library](https://orb.almadar.io/docs/stdlib).
