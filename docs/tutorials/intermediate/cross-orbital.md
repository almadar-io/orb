import { AvlEmitListen } from '@almadar/ui/illustrations';

# Cross-Orbital Communication

> Source: [`tests/schemas/05-cross-orbital.orb`](../../../../tests/schemas/05-cross-orbital.orb)

Orbitals are self-contained — but real applications need features to talk to each other. Orb connects orbitals through a typed event bus: one orbital emits, others listen.

<div style={{margin: '2rem 0'}}>
<AvlEmitListen
  emitter={{name: "CartManager", fields: 4}}
  listener={{name: "NotificationManager", fields: 2}}
  eventName="ITEM_ADDED"
  animated
/>
</div>

<div style={{margin: '2rem 0'}}>
<AvlEmitListen
  emitter={{name: "CartManager", fields: 4}}
  listener={{name: "NotificationManager", fields: 2}}
  eventName="CART_CLEARED"
  animated
/>
</div>

---

## The Pattern

```
CartManager orbital          NotificationManager orbital
      |                               |
  CartActions trait              NotificationHandler trait
      |                               |
  emits: ITEM_ADDED  ──────────►  listens: ITEM_ADDED
  emits: CART_CLEARED ─────────►  listens: CART_CLEARED
```

The key properties:
- **`emits`** — declared on a trait and on the orbital (what events it publishes)
- **`listens`** — declared on a trait (which events it reacts to) and on the orbital (which orbitals it subscribes to)
- **`scope: "external"`** — marks an event as crossing orbital boundaries

---

## Step 1 — Declare Emits on the Emitting Trait

The trait declares what events it can publish, including the payload contract:

```orb
{
  "name": "CartActions",
  "linkedEntity": "Cart",
  "category": "interaction",
  "emits": [
    {
      "event": "ITEM_ADDED",
      "scope": "external",
      "description": "Emitted when an item is added to cart",
      "payload": [
        { "name": "itemCount", "type": "number", "required": true },
        { "name": "total", "type": "number", "required": true }
      ]
    },
    {
      "event": "CART_CLEARED",
      "scope": "external",
      "description": "Emitted when cart is cleared",
      "payload": [
        { "name": "timestamp", "type": "number", "required": true }
      ]
    }
  ],
  "stateMachine": { "..." : "..." }
}
```

`scope: "external"` is required for cross-orbital events. Without it, the event stays internal to the trait.

---

## Step 2 — Fire the Event in a Transition

Inside a transition's `effects`, use `["emit", "EVENT_NAME", payload]`:

```orb
{
  "from": "empty",
  "event": "ADD_ITEM",
  "to": "hasItems",
  "effects": [
    ["increment", "@entity.itemCount", 1],
    ["set", "@entity.total", ["+", "@entity.total", "@payload.price"]],
    ["emit", "ITEM_ADDED", {
      "itemCount": "@entity.itemCount",
      "total": "@entity.total"
    }]
  ]
}
```

The payload is a JSON object where values can be bindings (`@entity.*`) or literals.

---

## Step 3 — Declare Orbital-Level Emits

At the orbital level, list every event the orbital publishes:

```orb
{
  "name": "CartManager",
  "entity": { "...": "..." },
  "traits": [ { "...": "..." } ],
  "pages": [ { "...": "..." } ],
  "emits": ["ITEM_ADDED", "CART_CLEARED"]
}
```

---

## Step 4 — Declare Listens on the Receiving Trait

The receiving trait declares which external events it handles:

```orb
{
  "name": "NotificationHandler",
  "linkedEntity": "Notification",
  "category": "interaction",
  "listens": [
    { "event": "ITEM_ADDED", "scope": "external" },
    { "event": "CART_CLEARED", "scope": "external" }
  ],
  "stateMachine": { "..." : "..." }
}
```

These events become valid event keys in the state machine — add them to `events` and write transitions for them:

```orb
"events": [
  { "key": "INIT", "name": "Initialize" },
  { "key": "ITEM_ADDED", "name": "Item Added" },
  { "key": "CART_CLEARED", "name": "Cart Cleared" }
],
"transitions": [
  {
    "from": "idle",
    "event": "ITEM_ADDED",
    "to": "notified",
    "effects": [
      ["increment", "@entity.count", 1],
      ["set", "@entity.message", "Item added to cart"]
    ]
  },
  {
    "from": "notified",
    "event": "CART_CLEARED",
    "to": "idle",
    "effects": [
      ["set", "@entity.message", "Cart cleared"],
      ["set", "@entity.count", 0]
    ]
  }
]
```

---

## Step 5 — Declare Orbital-Level Listens

At the receiving orbital level, declare which orbital the events come from:

```orb
{
  "name": "NotificationManager",
  "entity": { "...": "..." },
  "traits": [ { "...": "..." } ],
  "pages": [ { "...": "..." } ],
  "listens": [
    { "event": "ITEM_ADDED", "from": "CartManager" },
    { "event": "CART_CLEARED", "from": "CartManager" }
  ]
}
```

---

## The Complete Schema

```lolo
;; app cross-orbital-test

orbital CartManager {
  entity Cart [runtime] {
    id : string!
    itemCount : number
    total : number
  }
  trait CartActions -> Cart [interaction] {
    initial: empty
    state empty {
      INIT -> empty
        (render-ui main { type: "stats", title: "Shopping Cart", value: "@entity.itemCount", subtitle: "Total: $@entity.total" })
      ADD_ITEM -> hasItems
        (increment @entity.itemCount 1)
        (set @entity.total (+ @entity.total @payload.price))
        (emit ITEM_ADDED { itemCount: "@entity.itemCount", total: "@entity.total" })
    }
    state hasItems {
      ADD_ITEM -> hasItems
        (increment @entity.itemCount 1)
        (set @entity.total (+ @entity.total @payload.price))
        (emit ITEM_ADDED { itemCount: "@entity.itemCount", total: "@entity.total" })
      CLEAR -> empty
        (set @entity.itemCount 0)
        (set @entity.total 0)
        (emit CART_CLEARED { timestamp: "@now" })
    }
    emits {
      ITEM_ADDED external { itemCount: number, total: number }
      CART_CLEARED external { timestamp: number }
    }
  }
  page "/cart" -> CartActions
}
orbital NotificationManager {
  entity Notification [runtime] {
    id : string!
    message : string
    count : number
  }
  trait NotificationHandler -> Notification [interaction] {
    initial: idle
    state idle {
      INIT -> idle
        (render-ui main { type: "stats", title: "Notifications", value: "@entity.count", subtitle: "@entity.message" })
      ITEM_ADDED -> notified
        (increment @entity.count 1)
        (set @entity.message "Item added to cart")
    }
    state notified {
      ITEM_ADDED -> notified
        (increment @entity.count 1)
      CART_CLEARED -> idle
        (set @entity.message "Cart cleared")
        (set @entity.count 0)
    }
    listens {
      * ITEM_ADDED -> undefined
      * CART_CLEARED -> undefined
    }
  }
  page "/notifications" -> NotificationHandler
}
```

---

## Checklist: Cross-Orbital Events

Use this checklist when wiring two orbitals together:

- [ ] **Emitting trait** has `"emits": [...]` with `scope: "external"` and a `payload` contract
- [ ] **Emitting transition** calls `["emit", "EVENT_NAME", {...payload}]` in `effects`
- [ ] **Emitting orbital** has top-level `"emits": ["EVENT_NAME"]`
- [ ] **Listening trait** has `"listens": [{ "event": "EVENT_NAME", "scope": "external" }]`
- [ ] **Listening trait's state machine** has the event in `events` and a `transition` for it
- [ ] **Listening orbital** has top-level `"listens": [{ "event": "EVENT_NAME", "from": "EmittingOrbital" }]`

---

## Next Steps

- [Building a Full App](../advanced/full-app.md) — cross-orbital events in a 3-orbital application
- [Guards & Business Rules](./guards.md) — guard a transition based on data from another orbital
