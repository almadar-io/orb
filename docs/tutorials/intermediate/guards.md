import { AvlStateMachine } from '@almadar/ui/illustrations';

# Guards & Business Rules

> Source: [`tests/schemas/03-guards.orb`](../../../../tests/schemas/03-guards.orb)

Guards are conditions that must be true for a transition to fire. They act as the gatekeepers of your business rules — written once, enforced everywhere, for both the UI and the API.

<div style={{margin: '2rem 0'}}>
<AvlStateMachine
  states={[
    { name: 'active', isInitial: true },
    { name: 'frozen' }
  ]}
  transitions={[
    { from: 'active', to: 'active', event: 'WITHDRAW', guard: 'balance >= amount AND isVerified' },
    { from: 'active', to: 'frozen', event: 'FREEZE' },
    { from: 'frozen', to: 'active', event: 'UNFREEZE' }
  ]}
  animated
/>
</div>

---

## What is a Guard?

A guard is an S-expression on a transition. If it evaluates to `false`, the transition is blocked:

```orb
{
  "from": "active",
  "event": "WITHDRAW",
  "to": "active",
  "guard": [">=", "@entity.balance", "@payload.amount"],
  "effects": [...]
}
```

The user can only withdraw if `balance >= amount`. If not, the transition is silently blocked (the UI can surface a disabled state or error message).

---

## S-Expression Syntax

Guards are written as nested arrays where the first element is the operator:

```
[operator, arg1, arg2, ...]
```

Arguments can be:
- **Literals:** `100`, `"active"`, `true`
- **Bindings:** `"@entity.field"`, `"@payload.field"`, `"@state"`, `"@now"`
- **Nested expressions:** `["+", "@entity.count", 1]`

---

## Comparison Operators

| Operator | Meaning | Example |
|----------|---------|---------|
| `=` | Equal | `["=", "@entity.status", "active"]` |
| `!=` | Not equal | `["!=", "@entity.role", "guest"]` |
| `>` | Greater than | `[">", "@entity.score", 0]` |
| `>=` | Greater or equal | `[">=", "@entity.balance", "@payload.amount"]` |
| `<` | Less than | `["<", "@entity.attempts", 3]` |
| `<=` | Less or equal | `["<=", "@entity.age", 65]` |

---

## Boolean Operators

Combine conditions with `and`, `or`, `not`:

```orb
["and",
  [">=", "@entity.balance", "@payload.amount"],
  ["=", "@entity.isVerified", true]
]
```

```orb
["or",
  ["=", "@entity.role", "admin"],
  ["=", "@entity.role", "manager"]
]
```

```orb
["not", ["=", "@entity.status", "frozen"]]
```

---

## Full Example: Account Manager

This is the complete `AccountManager` from `03-guards.orb`. It demonstrates:
- A guard using `and` to combine two conditions
- Using `@payload.amount` to check against user input
- Simple state transitions (freeze/unfreeze) without guards

```lolo
orbital AccountManager {
  entity Account [persistent: accounts] {
    id : string!
    balance : number
    isVerified : boolean
  }
  trait AccountActions -> Account [interaction] {
    initial: active
    state active {
      INIT -> active
        (fetch Account)
        (render-ui main { type: "entity-table", entity: "Account", fields: ["balance", "isVerified"], columns: ["balance", "isVerified"], itemActions: [{ event: "WITHDRAW", label: "Withdraw" }, { event: "FREEZE", label: "Freeze" }] })
      WITHDRAW -> active
        ? (and (>= @entity.balance @payload.amount) (= @entity.isVerified true))
        (set @entity.balance (- @entity.balance @payload.amount))
      FREEZE -> frozen
    }
    state frozen {
      UNFREEZE -> active
    }
  }
  page "/accounts" -> AccountActions
}
```

**Reading the WITHDRAW guard:**
```orb
["and",
  [">=", "@entity.balance", "@payload.amount"],  // Account has enough funds
  ["=", "@entity.isVerified", true]              // Account is verified
]
```

Both conditions must be true. If the account is unverified, or the balance is too low, the withdrawal is blocked.

---

## Guards with Computed Values

Guards can use arithmetic operators — the result of a nested expression is used as an argument:

```orb
// Only allow if balance after withdrawal stays above minimum
[">=",
  ["-", "@entity.balance", "@payload.amount"],
  100
]
```

```orb
// Only allow if item count is within limit
["<",
  ["+", "@entity.itemCount", 1],
  50
]
```

---

## Common Guard Patterns

### Role-based access

```orb
// Only admins can delete
{
  "from": "listing",
  "event": "DELETE",
  "to": "listing",
  "guard": ["=", "@currentUser.role", "admin"],
  "effects": [["persist", "delete", "Task", "@entity.id"]]
}
```

### Ownership check

```orb
// Only the assignee can start the task
{
  "from": "Pending",
  "event": "START",
  "to": "InProgress",
  "guard": ["=", "@entity.assigneeId", "@currentUser.id"],
  "effects": [["persist", "update", "Task", "@entity"]]
}
```

### Field validation

```orb
// Score must be between 0 and 100
{
  "guard": ["and",
    [">=", "@payload.score", 0],
    ["<=", "@payload.score", 100]
  ]
}
```

### Status precondition

```orb
// Can only approve if currently in review
{
  "guard": ["=", "@entity.status", "review"]
}
```

---

## Guards vs. Effects

Guards run **before** the transition. Effects run **after**. Never use effects to enforce business rules — that's what guards are for.

```orb
// ❌ Wrong: using effects to simulate a guard
"effects": [
  ["if", ["<", "@entity.balance", 0], ["notify", "error", "Insufficient funds"]]
]

// ✅ Correct: guard blocks the transition entirely
"guard": [">=", "@entity.balance", "@payload.amount"]
```

---

## Next Steps

- [Cross-Orbital Communication](./cross-orbital.md) — guards can reference data from other orbitals
- [UI Patterns & render-ui](./ui-patterns.md) — rendering feedback when guards block actions
- [Building a Full App](../advanced/full-app.md) — guards in a real multi-orbital application
