import { AvlStateMachine, AvlEmitListen } from '@almadar/ui/illustrations';
import OrbPreviewBlock from '@shared/OrbPreviewBlock';
import schema1 from './traits-1.orb.json';
import schema2 from './traits-2.orb.json';

# Traits

> State machines that define how entities behave over time.

---

## What Is a Trait?

A Trait is a **state machine attached to an entity**. Where an [Entity](./entities.md) defines the shape of data, a Trait defines how that data changes: which states are valid, which events cause transitions between them, what conditions must hold for a transition to fire, and what side effects execute when it does.

The relationship is direct. An Entity is a noun. A Trait is the verb.

```
Orbital Unit = Entity + Traits + Pages
```

Every Trait has five parts:

1. **States** - The finite set of conditions the trait can be in
2. **Events** - Named signals that request a state change
3. **Transitions** - Rules mapping (state, event) pairs to new states
4. **Guards** - Boolean conditions that block or allow a transition
5. **Effects** - Actions executed when a transition fires (render UI, persist data, emit events)

<div style={{margin: '2rem 0'}}>
<AvlStateMachine
  states={[
    {name: 'browsing', isInitial: true},
    {name: 'creating'},
    {name: 'editing'},
    {name: 'viewing'}
  ]}
  transitions={[
    {from: 'browsing', to: 'creating', event: 'CREATE'},
    {from: 'browsing', to: 'viewing', event: 'SELECT'},
    {from: 'creating', to: 'browsing', event: 'SAVE', effects: ['persist']},
    {from: 'creating', to: 'browsing', event: 'CANCEL'},
    {from: 'viewing', to: 'editing', event: 'EDIT'},
    {from: 'viewing', to: 'browsing', event: 'BACK'},
    {from: 'editing', to: 'browsing', event: 'SAVE', effects: ['persist']},
    {from: 'editing', to: 'browsing', event: 'CANCEL'}
  ]}
  animated
/>
</div>

Think of it as the actor model applied to UI. Each Trait is an actor that holds state, receives messages (events), and produces effects. Multiple Traits on the same page are concurrent actors communicating through a shared event bus.

---

## States

States are the finite set of positions a Trait can occupy. Every Trait must declare exactly one `isInitial` state. States marked `isTerminal` signal that no further outgoing transitions are expected.

```lolo
trait MyTrait -> MyEntity [interaction] {
  initial: idle
  state idle { ... }
  state loading { ... }
  state active { ... }
  state error { ... }  ;; terminal — no outgoing transitions
}
```

| Property | Required | Description |
|----------|----------|-------------|
| `name` | Yes | Lowercase identifier for the state |
| `isInitial` | One required | The starting state when the Trait initializes |
| `isTerminal` | No | Marks a terminal state. No outgoing transitions expected. |
| `description` | No | Human-readable label |

Rules:

- Exactly **one** state must be `isInitial`.
- Every non-initial, non-terminal state must have at least one incoming transition. States with no incoming transitions cause validation errors (unreachable state).
- Any state rendering to a `modal` slot must have a `CLOSE` or `CANCEL` transition. Without it, the user gets trapped in a modal with no way to dismiss it. This is the [Closed Circuit](./closed-circuit.md) rule.

---

## Events

Events are named signals that request a state change. They use `UPPER_SNAKE_CASE` keys by convention and can optionally declare a payload schema describing the data they carry.

```lolo
trait TaskTrait -> Task [interaction] {
  initial: idle
  state idle {
    INIT -> idle
      (ref Task)
    SUBMIT -> loading
      when (!= ?title "")
      (persist create Task { title: ?title, priority: ?priority })
    CANCEL -> idle
  }
  state loading { ... }
}
```

| Property | Required | Description |
|----------|----------|-------------|
| `key` | Yes | Unique event identifier (`UPPER_SNAKE_CASE`) |
| `name` | No | Display name for UI buttons and tooling |
| `payload` | No | Array of field definitions describing event data |

If you reference `@payload.fieldName` anywhere in guards or effects, the field **must** appear in the event's `payload` schema. The compiler checks this.

---

## Transitions

A transition connects a source state to a target state, triggered by a specific event. Optionally, it includes a guard (a condition that must pass) and effects (actions to execute).

```lolo
state idle {
  SUBMIT -> loading
    when (!= ?title "")
    (persist create Task @payload)
    (notify "Task created" success)
}
state loading {
  CANCEL -> idle
}
state error {
  CANCEL -> idle
}
```

| Property | Required | Description |
|----------|----------|-------------|
| `from` | Yes | Source state (string) or states (array of strings) |
| `to` | Yes | Target state (always a single string) |
| `event` | Yes | The event key that triggers this transition |
| `guard` | No | S-expression that must evaluate to `true` |
| `effects` | No | Array of S-expression effects to execute |

When `from` is an array, the same transition rule applies from each listed state. This is shorthand for writing multiple identical transitions:

```lolo
state idle {
  RETRY -> loading
}
state error {
  RETRY -> loading
}
```

The processing pipeline for every incoming event:

1. Find transitions where `from` matches the current state and `event` matches the incoming event key
2. Evaluate the `guard`. If it returns `false`, the transition is blocked, no effects run, and the state does not change.
3. If the guard passes (or no guard exists), execute all `effects` in order
4. Move the Trait to the `to` state

---

## Guards

Guards are S-expression boolean conditions. They gate transitions: if the guard evaluates to `false`, the transition does not fire, no effects execute, and the state remains unchanged.

### Operators

| Category | Operators |
|----------|-----------|
| Comparison | `=`, `!=`, `<`, `>`, `<=`, `>=` |
| Logic | `and`, `or`, `not` |
| Array | `count`, `includes`, `every`, `some` |

### Bindings

Guards access data through binding roots:

| Binding | Description |
|---------|-------------|
| `@entity.field` | Field on the linked entity |
| `@payload.field` | Field from the event payload |
| `@state` | Current state name (string) |
| `@user.id` | Authenticated user ID |
| `@now` | Current timestamp in milliseconds |
| `@EntityName.field` | Singleton entity field (e.g., `@Player.health`) |

Note: `@result` is **not** a valid binding root. Call-service results flow through the runtime differently.

### Composition

Guards compose with `and`, `or`, and `not`. There is no limit to nesting depth.

```lolo
;; Simple: entity field equals a literal
when (= @entity.status "active")

;; Compound: both payload fields must be non-empty
when (and (!= ?email "") (!= ?name ""))

;; Negation: entity is NOT in a terminal status
when (not (or (= @entity.status "cancelled") (= @entity.status "archived")))

;; Numeric with array: cart must have items
when (> (count @entity.items) 0)

;; Role-based access: only the owner or an admin can approve
when (or (= @entity.ownerId @user.id) (= @user.role "admin"))
```

---

## Effects

Effects are S-expression actions executed when a transition fires. They are the Trait's way of changing the world: rendering UI, writing to the database, emitting events to other Traits, navigating to a new page.

### Effect Types

| Effect | Purpose |
|--------|---------|
| `render-ui` | Display a UI pattern in a named slot |
| `persist` | Create, update, or delete entity data in the database |
| `fetch` | Query entity data from the database |
| `emit` | Publish an event to other Traits |
| `set` | Modify a field on the entity |
| `notify` | Show a toast/notification |
| `navigate` | Change the current route |
| `call-service` | Call an external API or service |

### Client vs. Server Execution

Traits execute on both client and server simultaneously. Each effect type runs in one context or the other:

```
Client-side:   render-ui  navigate  notify
Server-side:   persist    fetch     call-service
Both:          emit       set
```

Server-only effects (`persist`, `fetch`, `call-service`) are skipped on the client. Client-only effects (`render-ui`, `navigate`, `notify`) are collected by the server and returned as `clientEffects` in the response. `emit` and `set` run in both contexts.

### Effect Reference

**render-ui**: Render a UI pattern into a named slot. The pattern type must exist in the [pattern registry](./patterns.md).

```lolo
(render-ui main { type: "entity-table", entity: "Task", columns: ["title", "status", "dueDate"] })
```

**persist**: Write to the database. Three operations: `create`, `update`, `delete`.

```lolo
(persist create Task @payload)
(persist update Task @entity)
(persist delete Task @entity.id)
```

**fetch**: Query entity data.

```lolo
(fetch Task { status: "active", assigneeId: @user.id })
```

**emit**: Publish an event. The event name must appear in the Trait's `emits` block.

```lolo
(emit TASK_COMPLETED { taskId: @entity.id })
```

**set**: Modify a field value. Supports S-expression math for increment/decrement.

```lolo
(set @entity.status "active")
(set @entity.score (+ @entity.score 10))
(set @entity.health (- @entity.health 5))
(set @entity.updatedAt @now)
```

**notify**: Display a toast notification.

```lolo
(notify "Task saved successfully" success)
(notify "Something went wrong" error)
```

**navigate**: Route to a different page. Supports entity-bound path segments.

```lolo
(navigate "/tasks/@entity.id")
```

**call-service**: Invoke an external service.

```lolo
(call-service email send { to: @entity.email, subject: "Task Assigned" })
```

---

## A Simple Trait

Here is a complete orbital with a shopping cart trait. The cart has two states: `browsing` (viewing the cart, managing items) and `checkout` (reviewing the order before confirmation). The trait demonstrates multi-state navigation, item actions, and persistence effects. This is the `std-cart` behavior, a molecule that composes three atomic traits: browse, modal, and confirmation.

```lolo
orbital CartItemOrbital {
  entity CartItem [persistent: cartitems] {
    id : string
    name : string
    description : string
    status : string
    createdAt : string
    pendingId : string
  }
  trait CartItemCartBrowse -> CartItem [interaction] {
    initial: browsing
    state browsing {
      INIT -> browsing
        (ref CartItem)
        (render-ui main { type: "stack", direction: "vertical", gap: "lg", children: [{ type: "stack", direction: "horizontal", gap: "md", justify: "space-between", children: [{ type: "stack", direction: "horizontal", gap: "md", children: [{ type: "icon", name: "shopping-cart", size: "lg" }, { type: "typography", content: "Shopping Cart", variant: "h2" }] }, { type: "button", label: "Add Item", event: "ADD_ITEM", variant: "primary", icon: "plus" }] }, { type: "divider" }, { type: "simple-grid", columns: 3, children: [{ type: "stat-display", label: "Items", value: ["array/len", "@entity"], icon: "package" }, { type: "stat-display", label: "Subtotal", value: ["array/len", "@entity"], icon: "dollar-sign" }, { type: "stat-display", label: "Total", value: ["array/len", "@entity"], icon: "receipt" }] }, { type: "divider" }, { type: "data-grid", entity: "CartItem", emptyIcon: "inbox", emptyTitle: "Your cart is empty", emptyDescription: "Add items to get started.", itemActions: [{ label: "Remove", event: "REQUEST_REMOVE", variant: "danger", size: "sm" }], columns: [{ name: "name", label: "Name", variant: "h4", icon: "shopping-cart" }, { name: "description", label: "Description", variant: "caption", format: "currency" }, { name: "status", label: "Status", variant: "badge" }] }, { type: "button", label: "Proceed to Checkout", event: "PROCEED_CHECKOUT", variant: "primary", icon: "arrow-right" }] })
      PROCEED_CHECKOUT -> checkout
        (ref CartItem)
        (render-ui main { type: "stack", direction: "vertical", gap: "lg", children: [{ type: "stack", direction: "horizontal", gap: "sm", children: [{ type: "icon", name: "clipboard", size: "lg" }, { type: "typography", content: "Checkout", variant: "h2" }] }, { type: "divider" }, { type: "data-grid", entity: "CartItem", emptyIcon: "inbox", emptyTitle: "Your cart is empty", emptyDescription: "Add items to get started.", itemActions: [{ label: "Remove", event: "REQUEST_REMOVE", variant: "danger", size: "sm" }], columns: [{ name: "name", label: "Name", variant: "h4", icon: "shopping-cart" }, { name: "description", label: "Description", variant: "caption", format: "currency" }, { name: "status", label: "Status", variant: "badge" }] }, { type: "stack", direction: "horizontal", gap: "sm", justify: "end", children: [{ type: "button", label: "Back to Cart", event: "BACK_TO_CART", variant: "ghost", icon: "arrow-left" }, { type: "button", label: "Confirm Order", event: "CONFIRM_ORDER", variant: "primary", icon: "check" }] }] })
    }
    state checkout {
      BACK_TO_CART -> browsing
        (ref CartItem)
      CONFIRM_ORDER -> browsing
        (ref CartItem)
        (render-ui main { type: "stack", direction: "vertical", gap: "lg", align: "center", children: [{ type: "icon", name: "check-circle", size: "lg" }, { type: "typography", content: "Order Confirmed", variant: "h2" }, { type: "typography", content: "Your order has been placed successfully.", variant: "body" }, { type: "button", label: "Continue Shopping", event: "INIT", variant: "primary" }] })
    }
  }
  trait CartItemAddItem -> CartItem [interaction] {
    initial: closed
    state closed {
      INIT -> closed
        (ref CartItem)
      ADD_ITEM -> open
        (fetch CartItem)
        (render-ui modal { type: "stack", direction: "vertical", gap: "md", children: [{ type: "stack", direction: "horizontal", gap: "sm", children: [{ type: "icon", name: "plus-circle", size: "md" }, { type: "typography", content: "Add Item", variant: "h3" }] }, { type: "divider" }, { type: "form-section", entity: "CartItem", mode: "create", submitEvent: "SAVE", cancelEvent: "CLOSE", fields: ["name", "description", "status"] }] })
    }
    state open {
      CLOSE -> closed
        (render-ui modal null)
        (notify Cancelled info)
      SAVE -> closed
        (persist create CartItem @payload.data)
        (render-ui modal null)
        (notify "CartItem created successfully")
    }
  }
  trait CartItemRemoveConfirm -> CartItem [interaction] {
    initial: idle
    state idle {
      INIT -> idle
        (ref CartItem)
      REQUEST_REMOVE -> confirming
        (set @entity.pendingId @payload.id)
        (fetch CartItem { id: "@payload.id" })
        (render-ui modal { type: "stack", direction: "vertical", gap: "md", children: [{ type: "stack", direction: "horizontal", gap: "sm", align: "center", children: [{ type: "icon", name: "alert-triangle", size: "md" }, { type: "typography", content: "Remove Item", variant: "h3" }] }, { type: "divider" }, { type: "alert", variant: "danger", message: "Are you sure you want to remove this item from your cart?" }, { type: "stack", direction: "horizontal", gap: "sm", justify: "end", children: [{ type: "button", label: "Cancel", event: "CANCEL", variant: "ghost" }, { type: "button", label: "Remove", event: "CONFIRM_REMOVE", variant: "danger", icon: "check" }] }] })
    }
    state confirming {
      CONFIRM_REMOVE -> idle
        (persist delete CartItem @entity.pendingId)
        (render-ui modal null)
        (ref CartItem)
        (notify "CartItem deleted successfully")
      CANCEL -> idle
        (render-ui modal null)
        (ref CartItem)
      CLOSE -> idle
        (render-ui modal null)
        (ref CartItem)
    }
  }
  page "/cart" -> CartItemCartBrowse, CartItemAddItem, CartItemRemoveConfirm
}
```

<OrbPreviewBlock schema={JSON.stringify(schema1)} showCode={false} />

---

## Guards and Multiple Effects in Practice

This is the same cart orbital viewed from the angle of guards and effects. Notice the `CartItemRemoveConfirm` trait: it uses a confirmation dialog pattern where `REQUEST_REMOVE` transitions to a `confirming` state with a modal, and `CONFIRM_REMOVE` executes `["persist", "delete", ...]` to actually remove the item. The `CANCEL` and `CLOSE` transitions provide the closed-circuit exit paths.

```lolo
orbital CartItemOrbital {
  entity CartItem [persistent: cartitems] {
    id : string
    name : string
    description : string
    status : string
    createdAt : string
    pendingId : string
  }
  trait CartItemCartBrowse -> CartItem [interaction] {
    initial: browsing
    state browsing {
      INIT -> browsing
        (ref CartItem)
        (render-ui main { type: "stack", direction: "vertical", gap: "lg", children: [{ type: "stack", direction: "horizontal", gap: "md", justify: "space-between", children: [{ type: "stack", direction: "horizontal", gap: "md", children: [{ type: "icon", name: "shopping-cart", size: "lg" }, { type: "typography", content: "Shopping Cart", variant: "h2" }] }, { type: "button", label: "Add Item", event: "ADD_ITEM", variant: "primary", icon: "plus" }] }, { type: "divider" }, { type: "simple-grid", columns: 3, children: [{ type: "stat-display", label: "Items", value: ["array/len", "@entity"], icon: "package" }, { type: "stat-display", label: "Subtotal", value: ["array/len", "@entity"], icon: "dollar-sign" }, { type: "stat-display", label: "Total", value: ["array/len", "@entity"], icon: "receipt" }] }, { type: "divider" }, { type: "data-grid", entity: "CartItem", emptyIcon: "inbox", emptyTitle: "Your cart is empty", emptyDescription: "Add items to get started.", itemActions: [{ label: "Remove", event: "REQUEST_REMOVE", variant: "danger", size: "sm" }], columns: [{ name: "name", label: "Name", variant: "h4", icon: "shopping-cart" }, { name: "description", label: "Description", variant: "caption", format: "currency" }, { name: "status", label: "Status", variant: "badge" }] }, { type: "button", label: "Proceed to Checkout", event: "PROCEED_CHECKOUT", variant: "primary", icon: "arrow-right" }] })
      PROCEED_CHECKOUT -> checkout
        (ref CartItem)
        (render-ui main { type: "stack", direction: "vertical", gap: "lg", children: [{ type: "stack", direction: "horizontal", gap: "sm", children: [{ type: "icon", name: "clipboard", size: "lg" }, { type: "typography", content: "Checkout", variant: "h2" }] }, { type: "divider" }, { type: "data-grid", entity: "CartItem", emptyIcon: "inbox", emptyTitle: "Your cart is empty", emptyDescription: "Add items to get started.", itemActions: [{ label: "Remove", event: "REQUEST_REMOVE", variant: "danger", size: "sm" }], columns: [{ name: "name", label: "Name", variant: "h4", icon: "shopping-cart" }, { name: "description", label: "Description", variant: "caption", format: "currency" }, { name: "status", label: "Status", variant: "badge" }] }, { type: "stack", direction: "horizontal", gap: "sm", justify: "end", children: [{ type: "button", label: "Back to Cart", event: "BACK_TO_CART", variant: "ghost", icon: "arrow-left" }, { type: "button", label: "Confirm Order", event: "CONFIRM_ORDER", variant: "primary", icon: "check" }] }] })
    }
    state checkout {
      BACK_TO_CART -> browsing
        (ref CartItem)
      CONFIRM_ORDER -> browsing
        (ref CartItem)
        (render-ui main { type: "stack", direction: "vertical", gap: "lg", align: "center", children: [{ type: "icon", name: "check-circle", size: "lg" }, { type: "typography", content: "Order Confirmed", variant: "h2" }, { type: "typography", content: "Your order has been placed successfully.", variant: "body" }, { type: "button", label: "Continue Shopping", event: "INIT", variant: "primary" }] })
    }
  }
  trait CartItemAddItem -> CartItem [interaction] {
    initial: closed
    state closed {
      INIT -> closed
        (ref CartItem)
      ADD_ITEM -> open
        (fetch CartItem)
        (render-ui modal { type: "stack", direction: "vertical", gap: "md", children: [{ type: "stack", direction: "horizontal", gap: "sm", children: [{ type: "icon", name: "plus-circle", size: "md" }, { type: "typography", content: "Add Item", variant: "h3" }] }, { type: "divider" }, { type: "form-section", entity: "CartItem", mode: "create", submitEvent: "SAVE", cancelEvent: "CLOSE", fields: ["name", "description", "status"] }] })
    }
    state open {
      CLOSE -> closed
        (render-ui modal null)
        (notify Cancelled info)
      SAVE -> closed
        (persist create CartItem @payload.data)
        (render-ui modal null)
        (notify "CartItem created successfully")
    }
  }
  trait CartItemRemoveConfirm -> CartItem [interaction] {
    initial: idle
    state idle {
      INIT -> idle
        (ref CartItem)
      REQUEST_REMOVE -> confirming
        (set @entity.pendingId @payload.id)
        (fetch CartItem { id: "@payload.id" })
        (render-ui modal { type: "stack", direction: "vertical", gap: "md", children: [{ type: "stack", direction: "horizontal", gap: "sm", align: "center", children: [{ type: "icon", name: "alert-triangle", size: "md" }, { type: "typography", content: "Remove Item", variant: "h3" }] }, { type: "divider" }, { type: "alert", variant: "danger", message: "Are you sure you want to remove this item from your cart?" }, { type: "stack", direction: "horizontal", gap: "sm", justify: "end", children: [{ type: "button", label: "Cancel", event: "CANCEL", variant: "ghost" }, { type: "button", label: "Remove", event: "CONFIRM_REMOVE", variant: "danger", icon: "check" }] }] })
    }
    state confirming {
      CONFIRM_REMOVE -> idle
        (persist delete CartItem @entity.pendingId)
        (render-ui modal null)
        (ref CartItem)
        (notify "CartItem deleted successfully")
      CANCEL -> idle
        (render-ui modal null)
        (ref CartItem)
      CLOSE -> idle
        (render-ui modal null)
        (ref CartItem)
    }
  }
  page "/cart" -> CartItemCartBrowse, CartItemAddItem, CartItemRemoveConfirm
}
```

<OrbPreviewBlock schema={JSON.stringify(schema2)} showCode={false} />

The APPROVE transition's guard demonstrates composition: a reviewer cannot approve their own request (`!=` check), and requests above 1000 require the `manager` role (nested `or` inside `and`). If the guard fails, the state stays at `reviewing`, no effects run, and the UI does not change.

---

## linkedEntity: Binding a Trait to Its Data

The `linkedEntity` property specifies which entity a Trait operates on. When you write `@entity.title` in a guard or effect, the runtime resolves `@entity` to the linked entity.

### Default Binding

Every orbital has a primary entity defined in its `entity` property. Traits without an explicit `linkedEntity` use the primary entity:

```lolo
orbital TaskManager {
  entity Task [persistent: tasks] { ... }
  trait StatusTrait -> Task [interaction] { ... }
}
```

Here `StatusTrait` operates on `Task` via `-> Task`.

### Explicit Binding

Use `linkedEntity` when a trait needs to operate on a different entity, or when you want to make the binding explicit:

```lolo
orbital ProjectDashboard {
  entity Project [persistent: projects] { ... }
  trait ProjectOverview -> Project [interaction] { ... }
  trait TaskList -> Task [interaction] { ... }
  trait MemberList -> Member [interaction] { ... }
}
```

Each trait gets its own entity context. `@entity.title` in `TaskList` resolves to `Task.title`, while `@entity.title` in `ProjectOverview` resolves to `Project.title`.

### Why This Matters

1. **Reusable traits.** A generic `StatusTrait` can work with any entity that has a `status` field.
2. **Cross-entity operations.** An orbital can compose traits that act on different entities.
3. **Type safety.** The compiler verifies that every `@entity.fieldName` reference resolves to an actual field on the linked entity.

---

## Multi-Trait Composition

A single page can mount multiple Traits. Each Trait runs as an independent state machine, but they share the same event bus. When one Trait emits an event, other Traits on the same page can react to it.

```lolo
orbital ProjectDashboard {
  entity Project [persistent: projects] { ... }
  trait ProjectOverview -> Project [interaction] { ... }
  trait TaskList -> Task [interaction] { ... }
  trait ActivityFeed -> Activity [interaction] { ... }
  page "/dashboard" -> ProjectOverview
}
```

Here, three Traits render concurrently on the same page. If `TaskList` emits a `TASK_COMPLETED` event internally, `ActivityFeed` can listen for it and update. Each Trait manages its own state independently. `ProjectOverview` might be in state `active` while `TaskList` is in state `loading` and `ActivityFeed` is in state `idle`.

This is concurrency through composition, not through threads or callbacks. The event bus coordinates communication. Each Trait remains a self-contained state machine.

---

## Cross-Orbital Communication: emits and listens

Traits in different orbitals communicate through declared event contracts. This is the only mechanism for cross-orbital communication, and it requires explicit declarations on both sides.

### Emitting Events

A Trait declares the events it can emit in its `emits` array:

```lolo
trait OrderFlow -> Order [interaction] {
  ...
  emits {
    ORDER_PLACED external { orderId: string, total: number }
  }
}
```

The event name used in an `["emit", "ORDER_PLACED", ...]` effect must match an entry in the `emits` array. The validator checks this. `scope: "external"` means the event can cross orbital boundaries. `scope: "internal"` restricts it to the same orbital.

### Listening for Events

A Trait declares the events it responds to in its `listens` array:

```lolo
trait InventorySync -> Inventory [interaction] {
  ...
  listens {
    * ORDER_PLACED -> undefined
  }
  state idle {
    ORDER_PLACED -> reserving
      when (> (count ?items) 0)
      (persist update Inventory @entity)
  }
}
```

| Property | Description |
|----------|-------------|
| `event` | The event name to listen for |
| `triggers` | The internal event key to fire when the external event arrives |
| `scope` | `internal` (same orbital only) or `external` (cross-orbital) |
| `payloadMapping` | Transform the incoming payload before triggering |
| `guard` | S-expression condition. If false, the event is ignored. |

### The Communication Flow

<div style={{margin: '2rem 0'}}>
<AvlEmitListen
  emitter={{name: "OrderManagement", fields: 3}}
  listener={{name: "InventoryManagement", fields: 2}}
  eventName="ORDER_PLACED"
  animated
/>
</div>

1. `OrderFlow` fires `(emit ORDER_PLACED {...})` in a transition effect
2. The event bus broadcasts to all traits with a matching `listens` entry
3. `InventorySync` receives the event, checks the `when` guard
4. If the guard passes, the matching transition fires on `InventorySync`
5. `InventorySync` processes the transition normally — state changes, effects run

This is the .orb equivalent of pub/sub. Every `emits` declaration is a contract: "this trait publishes this event." Every `listens` declaration is a subscription: "this trait reacts to this event." The core rule: **every `emits` should have a matching `listens` somewhere**, or the event disappears into the void.

---

## Summary

Traits are the behavioral core of Orb. They define **how** entities change over time through a deterministic, composable state machine model.

| Concept | Role |
|---------|------|
| **States** | Finite set of conditions. One initial, zero or more terminal. |
| **Events** | Named signals with optional payload schemas. |
| **Transitions** | Rules: (from, event) → to, gated by guards, executing effects. |
| **Guards** | S-expression boolean conditions that block or allow transitions. |
| **Effects** | Actions on transition: render UI, persist data, emit events, navigate. |
| **linkedEntity** | Binds a Trait to the entity it operates on. |
| **Multi-trait pages** | Multiple concurrent state machines on one page, shared event bus. |
| **emits/listens** | Declared contracts for cross-orbital event communication. |

A Trait is a complete behavioral unit. Give it an entity, mount it on a page, and it handles the rest: the UI it renders, the data it persists, the events it publishes, the conditions it enforces. Every user interaction follows the same path through the Trait's state machine, and every path is accounted for in the transition table. No dead ends, no orphaned state, no ambiguity.

---

*Document created: 2026-02-02*
*Rewritten: 2026-04-06*
