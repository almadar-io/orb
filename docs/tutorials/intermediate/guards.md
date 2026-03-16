# Guards & Business Rules

> Source: [`tests/schemas/03-guards.orb`](../../../../tests/schemas/03-guards.orb)

Guards are conditions that must be true for a transition to fire. They act as the gatekeepers of your business rules — written once, enforced everywhere, for both the UI and the API.

<OrbitalDiagram />

---

## What is a Guard?

A guard is an S-expression on a transition. If it evaluates to `false`, the transition is blocked:

```json
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

```json
["and",
  [">=", "@entity.balance", "@payload.amount"],
  ["=", "@entity.isVerified", true]
]
```

```json
["or",
  ["=", "@entity.role", "admin"],
  ["=", "@entity.role", "manager"]
]
```

```json
["not", ["=", "@entity.status", "frozen"]]
```

---

## Full Example: Account Manager

This is the complete `AccountManager` from `03-guards.orb`. It demonstrates:
- A guard using `and` to combine two conditions
- Using `@payload.amount` to check against user input
- Simple state transitions (freeze/unfreeze) without guards

```json
{
  "name": "AccountManager",
  "version": "1.0.0",
  "orbitals": [
    {
      "name": "AccountManager",
      "entity": {
        "name": "Account",
        "persistence": "persistent",
        "collection": "accounts",
        "fields": [
          { "name": "id", "type": "string", "required": true },
          { "name": "balance", "type": "number", "default": 0 },
          { "name": "isVerified", "type": "boolean", "default": false }
        ]
      },
      "traits": [
        {
          "name": "AccountActions",
          "linkedEntity": "Account",
          "category": "interaction",
          "stateMachine": {
            "states": [
              { "name": "active", "isInitial": true },
              { "name": "frozen" }
            ],
            "events": [
              { "key": "INIT", "name": "Initialize" },
              { "key": "WITHDRAW", "name": "Withdraw Funds", "payload": [
                { "name": "amount", "type": "number", "required": true }
              ]},
              { "key": "FREEZE", "name": "Freeze Account" },
              { "key": "UNFREEZE", "name": "Unfreeze Account" }
            ],
            "transitions": [
              {
                "from": "active",
                "event": "INIT",
                "to": "active",
                "effects": [
                  ["fetch", "Account"],
                  ["render-ui", "main", {
                    "type": "entity-table",
                    "entity": "Account",
                    "columns": ["balance", "isVerified"],
                    "itemActions": [
                      { "event": "WITHDRAW", "label": "Withdraw" },
                      { "event": "FREEZE", "label": "Freeze" }
                    ]
                  }]
                ]
              },
              {
                "from": "active",
                "event": "WITHDRAW",
                "to": "active",
                "guard": ["and",
                  [">=", "@entity.balance", "@payload.amount"],
                  ["=", "@entity.isVerified", true]
                ],
                "effects": [
                  ["set", "@entity.balance", ["-", "@entity.balance", "@payload.amount"]]
                ]
              },
              {
                "from": "active",
                "event": "FREEZE",
                "to": "frozen"
              },
              {
                "from": "frozen",
                "event": "UNFREEZE",
                "to": "active"
              }
            ]
          }
        }
      ],
      "pages": [
        {
          "name": "AccountListPage",
          "path": "/accounts",
          "traits": [
            { "ref": "AccountActions", "linkedEntity": "Account" }
          ]
        }
      ]
    }
  ]
}
```

**Reading the WITHDRAW guard:**
```json
["and",
  [">=", "@entity.balance", "@payload.amount"],  // Account has enough funds
  ["=", "@entity.isVerified", true]              // Account is verified
]
```

Both conditions must be true. If the account is unverified, or the balance is too low, the withdrawal is blocked.

---

## Guards with Computed Values

Guards can use arithmetic operators — the result of a nested expression is used as an argument:

```json
// Only allow if balance after withdrawal stays above minimum
[">=",
  ["-", "@entity.balance", "@payload.amount"],
  100
]
```

```json
// Only allow if item count is within limit
["<",
  ["+", "@entity.itemCount", 1],
  50
]
```

---

## Common Guard Patterns

### Role-based access

```json
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

```json
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

```json
// Score must be between 0 and 100
{
  "guard": ["and",
    [">=", "@payload.score", 0],
    ["<=", "@payload.score", 100]
  ]
}
```

### Status precondition

```json
// Can only approve if currently in review
{
  "guard": ["=", "@entity.status", "review"]
}
```

---

## Guards vs. Effects

Guards run **before** the transition. Effects run **after**. Never use effects to enforce business rules — that's what guards are for.

```json
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
