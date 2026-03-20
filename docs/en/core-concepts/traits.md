# Traits

> Trait definitions and state machine types for Orb

---

> How traits work in the Orb architecture - state machines, guards, effects, and cross-orbital communication.

**Related:** [Entities](./entities.md)

---

## Overview

In Orb, a **Trait** is a state machine that defines behavior for an entity. The fundamental composition is:

```
Orbital Unit = Entity + Traits + Pages
```

While [Entities](./entities.md) define the shape of data, Traits define how that data changes over time through **states**, **transitions**, **guards**, and **effects**.

---

## Trait Definition

A trait is defined in the `.orb` schema with the following structure:

```json
{
  "name": "TaskManagement",
  "category": "interaction",
  "linkedEntity": "Task",
  "description": "Manages task lifecycle and status changes",
  "emits": [
    { "event": "TASK_COMPLETED", "scope": "external" }
  ],
  "listens": [
    { "event": "USER_ASSIGNED", "triggers": "ASSIGN" }
  ],
  "stateMachine": {
    "states": [
      { "name": "idle", "isInitial": true },
      { "name": "active" },
      { "name": "completed", "isTerminal": true }
    ],
    "events": [
      { "key": "START", "name": "Start Task" },
      { "key": "COMPLETE", "name": "Complete Task" }
    ],
    "transitions": [
      {
        "from": "idle",
        "to": "active",
        "event": "START",
        "effects": [["set", "@entity.id", "status", "active"]]
      },
      {
        "from": "active",
        "to": "completed",
        "event": "COMPLETE",
        "guard": ["=", "@entity.assigneeId", "@user.id"],
        "effects": [
          ["set", "@entity.id", "status", "completed"],
          ["emit", "TASK_COMPLETED", { "taskId": "@entity.id" }]
        ]
      }
    ]
  }
}
```

### Trait Properties

| Property | Required | Description |
|----------|----------|-------------|
| `name` | Yes | Trait identifier (PascalCase) |
| `category` | No | Trait category (see below) |
| `linkedEntity` | No | Entity this trait operates on |
| `description` | No | Human-readable description |
| `emits` | No | Events this trait can emit |
| `listens` | No | Events this trait listens for |
| `stateMachine` | Yes | State machine definition |
| `ticks` | No | Scheduled/periodic effects |
| `config` | No | Configuration schema |

---

## Trait Categories

Traits are categorized by their primary purpose:

| Category | Purpose | Typical Effects |
|----------|---------|-----------------|
| `interaction` | Client-side UI event handling | `render-ui`, `navigate`, `notify` |
| `integration` | Server-side operations | `persist`, `fetch`, `call-service` |
| `lifecycle` | Entity lifecycle management | `persist`, `emit` |
| `gameCore` | Game loop and physics | `set`, `emit`, ticks |
| `gameEntity` | Game entity behaviors | `set`, `emit`, `render-ui` |
| `gameUi` | Game UI, HUD, controls | `render-ui`, `notify` |

### Category Examples

**Interaction Trait** - Handles UI events:
```json
{
  "name": "FormInteraction",
  "category": "interaction",
  "stateMachine": {
    "transitions": [{
      "event": "SUBMIT",
      "effects": [
        ["render-ui", "main", { "type": "form", "loading": true }],
        ["emit", "FORM_SUBMITTED", "@payload"]
      ]
    }]
  }
}
```

**Integration Trait** - Handles server operations:
```json
{
  "name": "DataPersistence",
  "category": "integration",
  "stateMachine": {
    "transitions": [{
      "event": "SAVE",
      "effects": [
        ["persist", "update", "Task", "@entity.id", "@payload"],
        ["emit", "DATA_SAVED", { "id": "@entity.id" }]
      ]
    }]
  }
}
```

---

## State Machine

Every trait has a state machine that defines its behavior.

### States

States represent the possible conditions of a trait:

```json
{
  "states": [
    { "name": "idle", "isInitial": true, "description": "Waiting for input" },
    { "name": "loading", "description": "Fetching data" },
    { "name": "active", "description": "Ready for interaction" },
    { "name": "error", "isTerminal": true, "description": "Error state" }
  ]
}
```

| Property | Description |
|----------|-------------|
| `name` | State identifier (lowercase) |
| `isInitial` | Starting state (exactly one required) |
| `isTerminal` | No outgoing transitions expected |
| `description` | Human-readable description |

### Events

Events trigger state transitions:

```json
{
  "events": [
    { "key": "INIT", "name": "Initialize" },
    { "key": "SUBMIT", "name": "Submit Form", "payload": [
      { "name": "email", "type": "string", "required": true },
      { "name": "name", "type": "string", "required": true }
    ]},
    { "key": "ERROR", "name": "Error Occurred" }
  ]
}
```

| Property | Description |
|----------|-------------|
| `key` | Event identifier (UPPER_SNAKE_CASE) |
| `name` | Display name |
| `payload` | Expected payload schema |

### Transitions

Transitions define how states change in response to events:

```json
{
  "transitions": [
    {
      "from": "idle",
      "to": "loading",
      "event": "SUBMIT",
      "guard": ["and", ["!=", "@payload.email", ""], ["!=", "@payload.name", ""]],
      "effects": [
        ["set", "@entity.id", "email", "@payload.email"],
        ["persist", "create", "User", "@payload"]
      ]
    },
    {
      "from": ["loading", "active"],
      "to": "error",
      "event": "ERROR"
    }
  ]
}
```

| Property | Description |
|----------|-------------|
| `from` | Source state(s) - string or array |
| `to` | Target state (always single) |
| `event` | Triggering event key |
| `guard` | Condition that must pass (optional) |
| `effects` | Effects to execute on transition (optional) |

**Multi-source transitions:** Use an array for `from` to handle the same event from multiple states:
```json
{ "from": ["idle", "error"], "to": "loading", "event": "RETRY" }
```

---

## Guards

Guards are conditions that must evaluate to `true` for a transition to occur. They use S-expression syntax.

### Guard Operators

| Category | Operators |
|----------|-----------|
| Comparison | `=`, `!=`, `<`, `>`, `<=`, `>=` |
| Logic | `and`, `or`, `not` |
| Math | `+`, `-`, `*`, `/`, `%` |
| Array | `count`, `includes`, `every`, `some` |

### Guard Examples

```json
// Simple equality
["=", "@entity.status", "active"]

// Compound condition
["and",
  ["!=", "@payload.email", ""],
  ["!=", "@payload.name", ""]
]

// Numeric comparison
[">=", "@entity.balance", "@payload.amount"]

// Array check
[">", ["count", "@entity.items"], 0]

// User permission
["=", "@entity.ownerId", "@user.id"]

// Complex guard
["and",
  ["=", "@entity.status", "pending"],
  ["or",
    ["=", "@user.role", "admin"],
    ["=", "@entity.assigneeId", "@user.id"]
  ]
]
```

### Guard Bindings

Guards can reference data through bindings (see [Entity Bindings](./entities.md#entity-bindings-in-s-expressions)):

| Binding | Description |
|---------|-------------|
| `@entity.field` | Current entity field value |
| `@payload.field` | Event payload field |
| `@state` | Current trait state name |
| `@user.id` | Authenticated user ID |
| `@now` | Current timestamp |

### Guard Failure

If a guard evaluates to `false`:
1. Transition is **blocked**
2. No effects execute
3. State remains unchanged
4. Response indicates `transitioned: false`

---

## Effects

Effects are actions executed when a transition occurs. They use S-expression syntax.

### Effect Types

| Effect | Server | Client | Purpose |
|--------|--------|--------|---------|
| `render-ui` | Ignored | Executes | Display pattern to UI slot |
| `navigate` | Ignored | Executes | Route navigation |
| `notify` | Ignored | Executes | Show notification/toast |
| `fetch` | Executes | Ignored | Query database |
| `persist` | Executes | Ignored | Create/update/delete data |
| `call-service` | Executes | Ignored | Call external API |
| `emit` | Executes | Executes | Publish event |
| `set` | Executes | Executes | Modify entity field (supports increment/decrement via S-expressions) |

### Dual Execution Model

Traits execute on **both client and server** simultaneously:

```
┌─────────────────────────────────────────────────────────────┐
│  Client                          Server                     │
│  ───────                         ──────                     │
│  render-ui  ✓                    render-ui  → clientEffects │
│  navigate   ✓                    navigate   → clientEffects │
│  notify     ✓                    notify     → clientEffects │
│  fetch      ✗                    fetch      ✓ (queries DB)  │
│  persist    ✗                    persist    ✓ (writes DB)   │
│  call-service ✗                  call-service ✓ (API call)  │
│  emit       ✓ (EventBus)         emit       ✓ (cross-orbital)│
│  set        ✓                    set        ✓               │
└─────────────────────────────────────────────────────────────┘
```

### Effect Examples

**render-ui** - Display a UI pattern:
```json
["render-ui", "main", {
  "type": "entity-table",
  "entity": "Task",
  "columns": ["title", "status", "dueDate"]
}]
```

**persist** - Database operations:
```json
// Create
["persist", "create", "Task", "@payload"]

// Update
["persist", "update", "Task", "@entity.id", { "status": "completed" }]

// Delete
["persist", "delete", "Task", "@entity.id"]
```

**fetch** - Query data:
```json
["fetch", "Task", { "status": "active", "assigneeId": "@user.id" }]
```

**emit** - Publish event:
```json
["emit", "TASK_COMPLETED", { "taskId": "@entity.id", "completedBy": "@user.id" }]
```

**set** - Modify field:
```json
["set", "@entity.id", "status", "active"]
["set", "@entity.id", "updatedAt", "@now"]
// Increment/decrement using math operators:
["set", "@entity.id", "score", ["+", "@entity.score", 10]]  // Increment by 10
["set", "@entity.id", "health", ["-", "@entity.health", 5]]  // Decrement by 5
```

**Note:** `increment` and `decrement` are not separate effect types. Use the `set` effect with S-expression math operators (`+`, `-`) to modify numeric fields.

**navigate** - Route change:
```json
["navigate", "/tasks/@entity.id"]
```

**notify** - Show notification:
```json
["notify", "Task completed successfully", "success"]
```

**call-service** - External API:
```json
["call-service", "email", "send", {
  "to": "@entity.email",
  "subject": "Task Assigned",
  "body": "You have been assigned a new task."
}]
```

---

## linkedEntity - Trait-Entity Binding

The `linkedEntity` property specifies which entity a trait operates on.

### Primary Entity

Every orbital has a primary entity. Traits without `linkedEntity` use this entity:

```json
{
  "name": "TaskManagement",
  "entity": { "name": "Task", "fields": [...] },
  "traits": [
    { "name": "StatusTrait" }  // Uses Task entity
  ]
}
```

### Explicit linkedEntity

Specify `linkedEntity` to operate on a different entity:

```json
{
  "name": "TaskManagement",
  "entity": { "name": "Task" },
  "traits": [
    { "name": "StatusTrait", "linkedEntity": "Task" },
    { "name": "CommentTrait", "linkedEntity": "Comment" },
    { "name": "PlayerStatsTrait", "linkedEntity": "Player" }
  ]
}
```

### Why linkedEntity?

1. **Reusable traits** - A generic trait can work with any entity
2. **Cross-entity operations** - Operate on related entities
3. **Type safety** - Compiler verifies entity field references
4. **Clear dependencies** - Explicit binding improves readability

See [Entity Bindings](./entities.md#linkedentity-concept) for more details.

---

## Event Communication (emit/listen)

Traits communicate through events, enabling loose coupling between orbitals.

### Emitting Events

Declare events a trait can emit:

```json
{
  "name": "OrderFlow",
  "emits": [
    {
      "event": "ORDER_CONFIRMED",
      "scope": "external",
      "description": "Fired when order is confirmed",
      "payload": [
        { "name": "orderId", "type": "string" },
        { "name": "items", "type": "array" }
      ]
    }
  ]
}
```

Emit in effects:
```json
["emit", "ORDER_CONFIRMED", { "orderId": "@entity.id", "items": "@entity.items" }]
```

### Listening for Events

Declare events a trait listens for:

```json
{
  "name": "InventorySync",
  "listens": [
    {
      "event": "ORDER_CONFIRMED",
      "triggers": "RESERVE_STOCK",
      "scope": "external",
      "payloadMapping": {
        "items": "@payload.items"
      },
      "guard": [">", ["count", "@payload.items"], 0]
    }
  ]
}
```

| Property | Description |
|----------|-------------|
| `event` | Event name to listen for |
| `triggers` | Internal event to trigger (defaults to event name) |
| `scope` | `internal` (same orbital) or `external` (cross-orbital) |
| `payloadMapping` | Transform incoming payload |
| `guard` | Optional condition to filter events |

### Event Scope

| Scope | Description |
|-------|-------------|
| `internal` | Events within the same orbital only |
| `external` | Events can cross orbital boundaries |

### Cross-Orbital Communication Flow

```
┌──────────────────┐         ┌──────────────────┐
│  OrderManagement │         │ InventoryManagement│
│                  │         │                  │
│  ┌────────────┐  │  emit   │  ┌────────────┐  │
│  │ OrderFlow  │──┼────────►│  │InventorySync│  │
│  └────────────┘  │ ORDER_  │  └────────────┘  │
│                  │CONFIRMED│                  │
└──────────────────┘         └──────────────────┘
```

1. `OrderFlow` trait emits `ORDER_CONFIRMED` (external scope)
2. Event bus broadcasts to all listening traits
3. `InventorySync` receives event, maps payload
4. `RESERVE_STOCK` event triggers on `InventorySync`
5. State machine processes transition normally

---

## Ticks (Scheduled Effects)

Ticks run effects periodically, even without user interaction.

### Tick Definition

```json
{
  "ticks": [
    {
      "name": "cleanup_expired",
      "interval": "60000",
      "guard": [">", ["count", "@entity.expiredSessions"], 0],
      "effects": [
        ["persist", "delete", "Session", { "expiresAt": ["<", "@now"] }]
      ],
      "description": "Clean up expired sessions every minute"
    },
    {
      "name": "sync_status",
      "interval": "5000",
      "effects": [
        ["fetch", "ExternalStatus", {}],
        ["set", "@entity.id", "lastSync", "@now"]
      ]
    }
  ]
}
```

### Tick Properties

| Property | Description |
|----------|-------------|
| `name` | Tick identifier |
| `interval` | Milliseconds, or string like `"5s"`, `"1m"` |
| `guard` | Condition (tick skipped if false) |
| `effects` | Effects to execute |
| `appliesTo` | Specific entity IDs (optional) |
| `description` | Human description |

### Common Tick Patterns

**Cleanup:**
```json
{
  "name": "cleanup",
  "interval": "300000",
  "effects": [["persist", "delete", "TempData", { "createdAt": ["<", ["-", "@now", 86400000]] }]]
}
```

**Periodic Sync:**
```json
{
  "name": "sync",
  "interval": "10000",
  "effects": [
    ["call-service", "external-api", "fetch-updates", {}],
    ["emit", "DATA_SYNCED", { "timestamp": "@now" }]
  ]
}
```

**Game Loop:**
```json
{
  "name": "game_tick",
  "interval": "16",
  "effects": [
    ["set", "@entity.id", "position", ["+", "@entity.position", "@entity.velocity"]],
    ["render-ui", "canvas", { "type": "game-canvas" }]
  ]
}
```

---

## Trait References vs. Inline Traits

Traits can be defined inline or referenced from external sources.

### Inline Definition

Define the trait directly in the orbital:

```json
{
  "orbital": "TaskManagement",
  "traits": [
    {
      "name": "StatusTrait",
      "stateMachine": {
        "states": [...],
        "transitions": [...]
      }
    }
  ]
}
```

### Reference Definition

Reference a trait from the standard library or imports:

```json
{
  "orbital": "TaskManagement",
  "uses": [
    { "from": "std/behaviors/crud", "as": "CRUD" }
  ],
  "traits": [
    {
      "ref": "CRUD.traits.CRUDManagement",
      "linkedEntity": "Task",
      "config": {
        "allowDelete": true,
        "softDelete": false
      }
    }
  ]
}
```

### Reference Properties

| Property | Description |
|----------|-------------|
| `ref` | Path to trait (e.g., `"Alias.traits.TraitName"`) |
| `linkedEntity` | Override entity binding |
| `config` | Configuration overrides |

### When to Use References

- **Reusable patterns** - CRUD, authentication, pagination
- **Standard behaviors** - From `std/behaviors/`
- **Cross-project sharing** - Import from other schemas
- **Configuration-driven** - Same trait, different config

---

## Complete Example

A complete trait demonstrating all features:

```json
{
  "name": "CheckoutFlow",
  "category": "integration",
  "linkedEntity": "Order",
  "description": "Handles the checkout process from cart to confirmation",

  "emits": [
    { "event": "ORDER_PLACED", "scope": "external", "payload": [
      { "name": "orderId", "type": "string" },
      { "name": "total", "type": "number" }
    ]},
    { "event": "PAYMENT_FAILED", "scope": "internal" }
  ],

  "listens": [
    { "event": "CART_UPDATED", "triggers": "RECALCULATE", "scope": "internal" },
    { "event": "INVENTORY_RESERVED", "triggers": "CONFIRM_STOCK", "scope": "external" }
  ],

  "stateMachine": {
    "states": [
      { "name": "cart", "isInitial": true, "description": "Shopping cart" },
      { "name": "checkout", "description": "Entering shipping/payment" },
      { "name": "processing", "description": "Processing payment" },
      { "name": "confirmed", "description": "Order confirmed" },
      { "name": "failed", "isTerminal": true, "description": "Order failed" }
    ],

    "events": [
      { "key": "PROCEED", "name": "Proceed to Checkout" },
      { "key": "SUBMIT", "name": "Submit Order", "payload": [
        { "name": "paymentMethod", "type": "string", "required": true }
      ]},
      { "key": "PAYMENT_SUCCESS", "name": "Payment Succeeded" },
      { "key": "PAYMENT_FAILED", "name": "Payment Failed" },
      { "key": "RECALCULATE", "name": "Recalculate Totals" },
      { "key": "CONFIRM_STOCK", "name": "Stock Confirmed" }
    ],

    "transitions": [
      {
        "from": "cart",
        "to": "checkout",
        "event": "PROCEED",
        "guard": [">", ["count", "@entity.items"], 0],
        "effects": [
          ["render-ui", "main", { "type": "form", "schema": "checkout" }]
        ]
      },
      {
        "from": "checkout",
        "to": "processing",
        "event": "SUBMIT",
        "guard": ["and",
          ["!=", "@payload.paymentMethod", ""],
          [">=", "@entity.total", 0]
        ],
        "effects": [
          ["set", "@entity.id", "paymentMethod", "@payload.paymentMethod"],
          ["set", "@entity.id", "status", "processing"],
          ["call-service", "payment", "charge", {
            "amount": "@entity.total",
            "method": "@payload.paymentMethod"
          }],
          ["render-ui", "main", { "type": "stats", "loading": true }]
        ]
      },
      {
        "from": "processing",
        "to": "confirmed",
        "event": "PAYMENT_SUCCESS",
        "effects": [
          ["set", "@entity.id", "status", "confirmed"],
          ["set", "@entity.id", "confirmedAt", "@now"],
          ["persist", "update", "Order", "@entity.id", "@entity"],
          ["emit", "ORDER_PLACED", { "orderId": "@entity.id", "total": "@entity.total" }],
          ["notify", "Order confirmed!", "success"],
          ["navigate", "/orders/@entity.id"]
        ]
      },
      {
        "from": "processing",
        "to": "failed",
        "event": "PAYMENT_FAILED",
        "effects": [
          ["set", "@entity.id", "status", "failed"],
          ["emit", "PAYMENT_FAILED", { "orderId": "@entity.id" }],
          ["notify", "Payment failed. Please try again.", "error"]
        ]
      },
      {
        "from": ["cart", "checkout"],
        "to": "cart",
        "event": "RECALCULATE",
        "effects": [
          ["set", "@entity.id", "total", ["array/reduce", "@entity.items",
            ["lambda", ["sum", "item"], ["+", "@sum", "@item.price"]], 0]]
        ]
      }
    ]
  },

  "ticks": [
    {
      "name": "expire_abandoned",
      "interval": "300000",
      "guard": ["and",
        ["=", "@state", "checkout"],
        ["<", "@entity.updatedAt", ["-", "@now", 1800000]]
      ],
      "effects": [
        ["set", "@entity.id", "status", "abandoned"],
        ["persist", "update", "Order", "@entity.id", { "status": "abandoned" }]
      ]
    }
  ]
}
```

---

## Summary

The Orb trait system provides:

1. **State Machines** - Define possible states and transitions
2. **Guards** - Protect transitions with boolean conditions
3. **Effects** - Execute actions on transition (UI, database, events)
4. **Dual Execution** - Server effects (persist, fetch) + Client effects (render, navigate)
5. **Event Communication** - Emit/listen for cross-trait and cross-orbital messaging
6. **Ticks** - Scheduled periodic effects
7. **linkedEntity** - Explicit binding to [entity data](./entities.md)
8. **Categories** - Classify traits by purpose (interaction, integration, game)
9. **Reusability** - Reference traits from libraries or define inline

Traits are the behavioral core of Orbital Units - they define *how* entities change over time through a declarative, composable state machine model.

---

*Document created: 2026-02-02*
*Based on codebase analysis of orbital-rust and builder packages*
