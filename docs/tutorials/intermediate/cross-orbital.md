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

The key blocks:
- **`emits { ... }`** — declared inside a trait; lists events the trait publishes with their payload types
- **`listens { ... }`** — declared inside a trait; lists external events the trait reacts to, with source orbital prefix
- **`external`** — keyword in the `emits` block marking an event as crossing orbital boundaries

---

## Step 1 — Declare Emits on the Emitting Trait

The trait declares what events it can publish, including the payload contract:

```lolo
trait CartActions -> Cart [interaction] {
  ;; ... state machine ...
  emits {
    ITEM_ADDED external { itemCount: number, total: number }
    CART_CLEARED external { timestamp: number }
  }
}
```

`external` is required for cross-orbital events. Without it, the event stays internal to the trait.

---

## Step 2 — Fire the Event in a Transition

Inside a transition, use `(emit EVENT_NAME payload)`:

```lolo
state empty {
  ADD_ITEM -> hasItems
    (increment @entity.itemCount 1)
    (set @entity.total (+ @entity.total @payload.price))
    (emit ITEM_ADDED { itemCount: @entity.itemCount, total: @entity.total })
}
```

The payload object's values can be bindings (`@entity.*`) or literals.

---

## Step 3 — Declare Orbital-Level Emits

At the orbital level, list every event the orbital publishes. In lolo, orbital-level emits are inferred automatically from the `external` emits declared in traits — no separate declaration is needed.

---

## Step 4 — Declare Listens on the Receiving Trait

The receiving trait declares which external events it handles and writes transitions for them:

```lolo
trait NotificationHandler -> Notification [interaction] {
  initial: idle
  state idle {
    ITEM_ADDED -> notified
      (increment @entity.count 1)
      (set @entity.message "Item added to cart")
  }
  state notified {
    CART_CLEARED -> idle
      (set @entity.message "Cart cleared")
      (set @entity.count 0)
  }
  listens {
    * ITEM_ADDED -> undefined
    * CART_CLEARED -> undefined
  }
}
```

---

## Step 5 — Declare Orbital-Level Listens

In lolo, the source orbital is specified directly inside the trait's `listens` block. Use the orbital name as the source prefix, or `*` to accept the event from any orbital:

```lolo
listens {
  CartManager ITEM_ADDED -> undefined
  CartManager CART_CLEARED -> undefined
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

- [ ] **Emitting trait** has an `emits { ... }` block with `external` scope and a typed payload
- [ ] **Emitting transition** calls `(emit EVENT_NAME { ...payload })` as an effect
- [ ] **Listening trait** has a `listens { ... }` block with the source orbital and event name
- [ ] **Listening trait's state machine** has transitions for each listened event
- [ ] **Listening orbital** imports the source orbital (the `listens` block handles routing)

---

## Next Steps

- [Building a Full App](../advanced/full-app.md) — cross-orbital events in a 3-orbital application
- [Guards & Business Rules](./guards.md) — guard a transition based on data from another orbital
