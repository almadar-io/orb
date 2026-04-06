import { AvlStateMachine } from '@almadar/ui/illustrations';
import OrbPreviewBlock from '@shared/OrbPreviewBlock';

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

```orb
{
  "states": [
    { "name": "idle", "isInitial": true },
    { "name": "loading" },
    { "name": "active" },
    { "name": "error", "isTerminal": true }
  ]
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

```orb
{
  "events": [
    { "key": "INIT", "name": "Initialize" },
    { "key": "SUBMIT", "name": "Submit Form", "payload": [
      { "name": "title", "type": "string", "required": true },
      { "name": "priority", "type": "number" }
    ]},
    { "key": "CANCEL", "name": "Cancel" }
  ]
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

```orb
{
  "transitions": [
    {
      "from": "idle",
      "to": "loading",
      "event": "SUBMIT",
      "guard": ["!=", "@payload.title", ""],
      "effects": [
        ["persist", "create", "Task", "@payload"],
        ["notify", "Task created", "success"]
      ]
    },
    {
      "from": ["loading", "error"],
      "to": "idle",
      "event": "CANCEL"
    }
  ]
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

```orb
{ "from": ["idle", "error"], "to": "loading", "event": "RETRY" }
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

```orb
// Simple: entity field equals a literal
["=", "@entity.status", "active"]

// Compound: both payload fields must be non-empty
["and",
  ["!=", "@payload.email", ""],
  ["!=", "@payload.name", ""]
]

// Negation: entity is NOT in a terminal status
["not", ["or",
  ["=", "@entity.status", "cancelled"],
  ["=", "@entity.status", "archived"]
]]

// Numeric with array: cart must have items
[">", ["count", "@entity.items"], 0]

// Role-based access: only the owner or an admin can approve
["or",
  ["=", "@entity.ownerId", "@user.id"],
  ["=", "@user.role", "admin"]
]
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

```orb
["render-ui", "main", {
  "type": "entity-table",
  "entity": "Task",
  "columns": ["title", "status", "dueDate"]
}]
```

**persist**: Write to the database. Three operations: `create`, `update`, `delete`.

```orb
["persist", "create", "Task", "@payload"]
["persist", "update", "Task", "@entity.id", { "status": "completed" }]
["persist", "delete", "Task", "@entity.id"]
```

**fetch**: Query entity data.

```orb
["fetch", "Task", { "status": "active", "assigneeId": "@user.id" }]
```

**emit**: Publish an event. The event name must appear in the Trait's `emits` declaration.

```orb
["emit", "TASK_COMPLETED", { "taskId": "@entity.id" }]
```

**set**: Modify a field value. Supports S-expression math for increment/decrement.

```orb
["set", "@entity.id", "status", "active"]
["set", "@entity.id", "score", ["+", "@entity.score", 10]]
["set", "@entity.id", "health", ["-", "@entity.health", 5]]
["set", "@entity.id", "updatedAt", "@now"]
```

**notify**: Display a toast notification.

```orb
["notify", "Task saved successfully", "success"]
["notify", "Something went wrong", "error"]
```

**navigate**: Route to a different page. Supports entity-bound path segments.

```orb
["navigate", "/tasks/@entity.id"]
```

**call-service**: Invoke an external service.

```orb
["call-service", "email", "send", {
  "to": "@entity.email",
  "subject": "Task Assigned"
}]
```

---

## A Simple Trait

Here is a complete orbital with a shopping cart trait. The cart has two states: `browsing` (viewing the cart, managing items) and `checkout` (reviewing the order before confirmation). The trait demonstrates multi-state navigation, item actions, and persistence effects. This is the `std-cart` behavior, a molecule that composes three atomic traits: browse, modal, and confirmation.

<OrbPreviewBlock title="Shopping Cart: multi-trait molecule with browse, modal, and confirmation" schema={`{"name": "CartItemOrbital", "orbitals": [{"name": "CartItemOrbital", "entity": {"name": "CartItem", "persistence": "persistent", "collection": "cartitems", "fields": [{"name": "id", "type": "string"}, {"name": "name", "type": "string"}, {"name": "description", "type": "string"}, {"name": "status", "type": "string", "default": "active", "values": ["active", "inactive", "pending"]}, {"name": "createdAt", "type": "string"}, {"name": "pendingId", "type": "string", "default": ""}]}, "traits": [{"name": "CartItemCartBrowse", "linkedEntity": "CartItem", "category": "interaction", "stateMachine": {"states": [{"name": "browsing", "isInitial": true}, {"name": "checkout"}], "events": [{"key": "INIT", "name": "Initialize"}, {"key": "ADD_ITEM", "name": "Add Item"}, {"key": "REQUEST_REMOVE", "name": "Request Remove", "payload": [{"name": "id", "type": "string", "required": true}]}, {"key": "PROCEED_CHECKOUT", "name": "Proceed to Checkout"}, {"key": "BACK_TO_CART", "name": "Back to Cart"}, {"key": "CONFIRM_ORDER", "name": "Confirm Order"}], "transitions": [{"from": "browsing", "to": "browsing", "event": "INIT", "effects": [["ref", "CartItem"], ["render-ui", "main", {"type": "stack", "direction": "vertical", "gap": "lg", "children": [{"type": "stack", "direction": "horizontal", "gap": "md", "justify": "space-between", "children": [{"type": "stack", "direction": "horizontal", "gap": "md", "children": [{"type": "icon", "name": "shopping-cart", "size": "lg"}, {"type": "typography", "content": "Shopping Cart", "variant": "h2"}]}, {"type": "button", "label": "Add Item", "event": "ADD_ITEM", "variant": "primary", "icon": "plus"}]}, {"type": "divider"}, {"type": "simple-grid", "columns": 3, "children": [{"type": "stat-display", "label": "Items", "value": ["array/len", "@entity"], "icon": "package"}, {"type": "stat-display", "label": "Subtotal", "value": ["array/len", "@entity"], "icon": "dollar-sign"}, {"type": "stat-display", "label": "Total", "value": ["array/len", "@entity"], "icon": "receipt"}]}, {"type": "divider"}, {"type": "data-grid", "entity": "CartItem", "emptyIcon": "inbox", "emptyTitle": "Your cart is empty", "emptyDescription": "Add items to get started.", "itemActions": [{"label": "Remove", "event": "REQUEST_REMOVE", "variant": "danger", "size": "sm"}], "columns": [{"name": "name", "label": "Name", "variant": "h4", "icon": "shopping-cart"}, {"name": "description", "label": "Description", "variant": "caption", "format": "currency"}, {"name": "status", "label": "Status", "variant": "badge"}]}, {"type": "button", "label": "Proceed to Checkout", "event": "PROCEED_CHECKOUT", "variant": "primary", "icon": "arrow-right"}]}]]}, {"from": "browsing", "to": "checkout", "event": "PROCEED_CHECKOUT", "effects": [["ref", "CartItem"], ["render-ui", "main", {"type": "stack", "direction": "vertical", "gap": "lg", "children": [{"type": "stack", "direction": "horizontal", "gap": "sm", "children": [{"type": "icon", "name": "clipboard", "size": "lg"}, {"type": "typography", "content": "Checkout", "variant": "h2"}]}, {"type": "divider"}, {"type": "data-grid", "entity": "CartItem", "emptyIcon": "inbox", "emptyTitle": "Your cart is empty", "emptyDescription": "Add items to get started.", "itemActions": [{"label": "Remove", "event": "REQUEST_REMOVE", "variant": "danger", "size": "sm"}], "columns": [{"name": "name", "label": "Name", "variant": "h4", "icon": "shopping-cart"}, {"name": "description", "label": "Description", "variant": "caption", "format": "currency"}, {"name": "status", "label": "Status", "variant": "badge"}]}, {"type": "stack", "direction": "horizontal", "gap": "sm", "justify": "end", "children": [{"type": "button", "label": "Back to Cart", "event": "BACK_TO_CART", "variant": "ghost", "icon": "arrow-left"}, {"type": "button", "label": "Confirm Order", "event": "CONFIRM_ORDER", "variant": "primary", "icon": "check"}]}]}]]}, {"from": "checkout", "to": "browsing", "event": "BACK_TO_CART", "effects": [["ref", "CartItem"]]}, {"from": "checkout", "to": "browsing", "event": "CONFIRM_ORDER", "effects": [["ref", "CartItem"], ["render-ui", "main", {"type": "stack", "direction": "vertical", "gap": "lg", "align": "center", "children": [{"type": "icon", "name": "check-circle", "size": "lg"}, {"type": "typography", "content": "Order Confirmed", "variant": "h2"}, {"type": "typography", "content": "Your order has been placed successfully.", "variant": "body"}, {"type": "button", "label": "Continue Shopping", "event": "INIT", "variant": "primary"}]}]]}]}}, {"name": "CartItemAddItem", "linkedEntity": "CartItem", "category": "interaction", "stateMachine": {"states": [{"name": "closed", "isInitial": true}, {"name": "open"}], "events": [{"key": "INIT", "name": "Initialize"}, {"key": "ADD_ITEM", "name": "Open"}, {"key": "CLOSE", "name": "Close"}, {"key": "SAVE", "name": "Save", "payload": [{"name": "data", "type": "object", "required": true}]}], "transitions": [{"from": "closed", "to": "closed", "event": "INIT", "effects": [["ref", "CartItem"]]}, {"from": "closed", "to": "open", "event": "ADD_ITEM", "effects": [["fetch", "CartItem"], ["render-ui", "modal", {"type": "stack", "direction": "vertical", "gap": "md", "children": [{"type": "stack", "direction": "horizontal", "gap": "sm", "children": [{"type": "icon", "name": "plus-circle", "size": "md"}, {"type": "typography", "content": "Add Item", "variant": "h3"}]}, {"type": "divider"}, {"type": "form-section", "entity": "CartItem", "mode": "create", "submitEvent": "SAVE", "cancelEvent": "CLOSE", "fields": ["name", "description", "status"]}]}]]}, {"from": "open", "to": "closed", "event": "CLOSE", "effects": [["render-ui", "modal", null], ["notify", "Cancelled", "info"]]}, {"from": "open", "to": "closed", "event": "SAVE", "effects": [["persist", "create", "CartItem", "@payload.data"], ["render-ui", "modal", null], ["notify", "CartItem created successfully"]]}]}}, {"name": "CartItemRemoveConfirm", "linkedEntity": "CartItem", "category": "interaction", "stateMachine": {"states": [{"name": "idle", "isInitial": true}, {"name": "confirming"}], "events": [{"key": "INIT", "name": "Initialize"}, {"key": "REQUEST_REMOVE", "name": "Request Confirmation", "payload": [{"name": "id", "type": "string", "required": true}]}, {"key": "CONFIRM_REMOVE", "name": "Confirm"}, {"key": "CANCEL", "name": "Cancel"}, {"key": "CLOSE", "name": "Close"}], "transitions": [{"from": "idle", "to": "idle", "event": "INIT", "effects": [["ref", "CartItem"]]}, {"from": "idle", "to": "confirming", "event": "REQUEST_REMOVE", "effects": [["set", "@entity.pendingId", "@payload.id"], ["fetch", "CartItem", {"id": "@payload.id"}], ["render-ui", "modal", {"type": "stack", "direction": "vertical", "gap": "md", "children": [{"type": "stack", "direction": "horizontal", "gap": "sm", "align": "center", "children": [{"type": "icon", "name": "alert-triangle", "size": "md"}, {"type": "typography", "content": "Remove Item", "variant": "h3"}]}, {"type": "divider"}, {"type": "alert", "variant": "danger", "message": "Are you sure you want to remove this item from your cart?"}, {"type": "stack", "direction": "horizontal", "gap": "sm", "justify": "end", "children": [{"type": "button", "label": "Cancel", "event": "CANCEL", "variant": "ghost"}, {"type": "button", "label": "Remove", "event": "CONFIRM_REMOVE", "variant": "danger", "icon": "check"}]}]}]]}, {"from": "confirming", "to": "idle", "event": "CONFIRM_REMOVE", "effects": [["persist", "delete", "CartItem", "@entity.pendingId"], ["render-ui", "modal", null], ["ref", "CartItem"], ["notify", "CartItem deleted successfully"]]}, {"from": "confirming", "to": "idle", "event": "CANCEL", "effects": [["render-ui", "modal", null], ["ref", "CartItem"]]}, {"from": "confirming", "to": "idle", "event": "CLOSE", "effects": [["render-ui", "modal", null], ["ref", "CartItem"]]}]}}], "pages": [{"name": "CartItemPage", "path": "/cart", "traits": [{"ref": "CartItemCartBrowse"}, {"ref": "CartItemAddItem"}, {"ref": "CartItemRemoveConfirm"}]}]}], "description": "Shopping cart molecule. Composes atoms: - Cart-specific browse trait (empty/hasItems/checkout states) - stdModal for the add-item form (responds to ADD_ITEM)"}`} />

---

## Guards and Multiple Effects in Practice

This is the same cart orbital viewed from the angle of guards and effects. Notice the `CartItemRemoveConfirm` trait: it uses a confirmation dialog pattern where `REQUEST_REMOVE` transitions to a `confirming` state with a modal, and `CONFIRM_REMOVE` executes `["persist", "delete", ...]` to actually remove the item. The `CANCEL` and `CLOSE` transitions provide the closed-circuit exit paths.

<OrbPreviewBlock title="Cart: guards, persist, set, and confirmation effects" schema={`{"name": "CartItemOrbital", "orbitals": [{"name": "CartItemOrbital", "entity": {"name": "CartItem", "persistence": "persistent", "collection": "cartitems", "fields": [{"name": "id", "type": "string"}, {"name": "name", "type": "string"}, {"name": "description", "type": "string"}, {"name": "status", "type": "string", "default": "active", "values": ["active", "inactive", "pending"]}, {"name": "createdAt", "type": "string"}, {"name": "pendingId", "type": "string", "default": ""}]}, "traits": [{"name": "CartItemCartBrowse", "linkedEntity": "CartItem", "category": "interaction", "stateMachine": {"states": [{"name": "browsing", "isInitial": true}, {"name": "checkout"}], "events": [{"key": "INIT", "name": "Initialize"}, {"key": "ADD_ITEM", "name": "Add Item"}, {"key": "REQUEST_REMOVE", "name": "Request Remove", "payload": [{"name": "id", "type": "string", "required": true}]}, {"key": "PROCEED_CHECKOUT", "name": "Proceed to Checkout"}, {"key": "BACK_TO_CART", "name": "Back to Cart"}, {"key": "CONFIRM_ORDER", "name": "Confirm Order"}], "transitions": [{"from": "browsing", "to": "browsing", "event": "INIT", "effects": [["ref", "CartItem"], ["render-ui", "main", {"type": "stack", "direction": "vertical", "gap": "lg", "children": [{"type": "stack", "direction": "horizontal", "gap": "md", "justify": "space-between", "children": [{"type": "stack", "direction": "horizontal", "gap": "md", "children": [{"type": "icon", "name": "shopping-cart", "size": "lg"}, {"type": "typography", "content": "Shopping Cart", "variant": "h2"}]}, {"type": "button", "label": "Add Item", "event": "ADD_ITEM", "variant": "primary", "icon": "plus"}]}, {"type": "divider"}, {"type": "simple-grid", "columns": 3, "children": [{"type": "stat-display", "label": "Items", "value": ["array/len", "@entity"], "icon": "package"}, {"type": "stat-display", "label": "Subtotal", "value": ["array/len", "@entity"], "icon": "dollar-sign"}, {"type": "stat-display", "label": "Total", "value": ["array/len", "@entity"], "icon": "receipt"}]}, {"type": "divider"}, {"type": "data-grid", "entity": "CartItem", "emptyIcon": "inbox", "emptyTitle": "Your cart is empty", "emptyDescription": "Add items to get started.", "itemActions": [{"label": "Remove", "event": "REQUEST_REMOVE", "variant": "danger", "size": "sm"}], "columns": [{"name": "name", "label": "Name", "variant": "h4", "icon": "shopping-cart"}, {"name": "description", "label": "Description", "variant": "caption", "format": "currency"}, {"name": "status", "label": "Status", "variant": "badge"}]}, {"type": "button", "label": "Proceed to Checkout", "event": "PROCEED_CHECKOUT", "variant": "primary", "icon": "arrow-right"}]}]]}, {"from": "browsing", "to": "checkout", "event": "PROCEED_CHECKOUT", "effects": [["ref", "CartItem"], ["render-ui", "main", {"type": "stack", "direction": "vertical", "gap": "lg", "children": [{"type": "stack", "direction": "horizontal", "gap": "sm", "children": [{"type": "icon", "name": "clipboard", "size": "lg"}, {"type": "typography", "content": "Checkout", "variant": "h2"}]}, {"type": "divider"}, {"type": "data-grid", "entity": "CartItem", "emptyIcon": "inbox", "emptyTitle": "Your cart is empty", "emptyDescription": "Add items to get started.", "itemActions": [{"label": "Remove", "event": "REQUEST_REMOVE", "variant": "danger", "size": "sm"}], "columns": [{"name": "name", "label": "Name", "variant": "h4", "icon": "shopping-cart"}, {"name": "description", "label": "Description", "variant": "caption", "format": "currency"}, {"name": "status", "label": "Status", "variant": "badge"}]}, {"type": "stack", "direction": "horizontal", "gap": "sm", "justify": "end", "children": [{"type": "button", "label": "Back to Cart", "event": "BACK_TO_CART", "variant": "ghost", "icon": "arrow-left"}, {"type": "button", "label": "Confirm Order", "event": "CONFIRM_ORDER", "variant": "primary", "icon": "check"}]}]}]]}, {"from": "checkout", "to": "browsing", "event": "BACK_TO_CART", "effects": [["ref", "CartItem"]]}, {"from": "checkout", "to": "browsing", "event": "CONFIRM_ORDER", "effects": [["ref", "CartItem"], ["render-ui", "main", {"type": "stack", "direction": "vertical", "gap": "lg", "align": "center", "children": [{"type": "icon", "name": "check-circle", "size": "lg"}, {"type": "typography", "content": "Order Confirmed", "variant": "h2"}, {"type": "typography", "content": "Your order has been placed successfully.", "variant": "body"}, {"type": "button", "label": "Continue Shopping", "event": "INIT", "variant": "primary"}]}]]}]}}, {"name": "CartItemAddItem", "linkedEntity": "CartItem", "category": "interaction", "stateMachine": {"states": [{"name": "closed", "isInitial": true}, {"name": "open"}], "events": [{"key": "INIT", "name": "Initialize"}, {"key": "ADD_ITEM", "name": "Open"}, {"key": "CLOSE", "name": "Close"}, {"key": "SAVE", "name": "Save", "payload": [{"name": "data", "type": "object", "required": true}]}], "transitions": [{"from": "closed", "to": "closed", "event": "INIT", "effects": [["ref", "CartItem"]]}, {"from": "closed", "to": "open", "event": "ADD_ITEM", "effects": [["fetch", "CartItem"], ["render-ui", "modal", {"type": "stack", "direction": "vertical", "gap": "md", "children": [{"type": "stack", "direction": "horizontal", "gap": "sm", "children": [{"type": "icon", "name": "plus-circle", "size": "md"}, {"type": "typography", "content": "Add Item", "variant": "h3"}]}, {"type": "divider"}, {"type": "form-section", "entity": "CartItem", "mode": "create", "submitEvent": "SAVE", "cancelEvent": "CLOSE", "fields": ["name", "description", "status"]}]}]]}, {"from": "open", "to": "closed", "event": "CLOSE", "effects": [["render-ui", "modal", null], ["notify", "Cancelled", "info"]]}, {"from": "open", "to": "closed", "event": "SAVE", "effects": [["persist", "create", "CartItem", "@payload.data"], ["render-ui", "modal", null], ["notify", "CartItem created successfully"]]}]}}, {"name": "CartItemRemoveConfirm", "linkedEntity": "CartItem", "category": "interaction", "stateMachine": {"states": [{"name": "idle", "isInitial": true}, {"name": "confirming"}], "events": [{"key": "INIT", "name": "Initialize"}, {"key": "REQUEST_REMOVE", "name": "Request Confirmation", "payload": [{"name": "id", "type": "string", "required": true}]}, {"key": "CONFIRM_REMOVE", "name": "Confirm"}, {"key": "CANCEL", "name": "Cancel"}, {"key": "CLOSE", "name": "Close"}], "transitions": [{"from": "idle", "to": "idle", "event": "INIT", "effects": [["ref", "CartItem"]]}, {"from": "idle", "to": "confirming", "event": "REQUEST_REMOVE", "effects": [["set", "@entity.pendingId", "@payload.id"], ["fetch", "CartItem", {"id": "@payload.id"}], ["render-ui", "modal", {"type": "stack", "direction": "vertical", "gap": "md", "children": [{"type": "stack", "direction": "horizontal", "gap": "sm", "align": "center", "children": [{"type": "icon", "name": "alert-triangle", "size": "md"}, {"type": "typography", "content": "Remove Item", "variant": "h3"}]}, {"type": "divider"}, {"type": "alert", "variant": "danger", "message": "Are you sure you want to remove this item from your cart?"}, {"type": "stack", "direction": "horizontal", "gap": "sm", "justify": "end", "children": [{"type": "button", "label": "Cancel", "event": "CANCEL", "variant": "ghost"}, {"type": "button", "label": "Remove", "event": "CONFIRM_REMOVE", "variant": "danger", "icon": "check"}]}]}]]}, {"from": "confirming", "to": "idle", "event": "CONFIRM_REMOVE", "effects": [["persist", "delete", "CartItem", "@entity.pendingId"], ["render-ui", "modal", null], ["ref", "CartItem"], ["notify", "CartItem deleted successfully"]]}, {"from": "confirming", "to": "idle", "event": "CANCEL", "effects": [["render-ui", "modal", null], ["ref", "CartItem"]]}, {"from": "confirming", "to": "idle", "event": "CLOSE", "effects": [["render-ui", "modal", null], ["ref", "CartItem"]]}]}}], "pages": [{"name": "CartItemPage", "path": "/cart", "traits": [{"ref": "CartItemCartBrowse"}, {"ref": "CartItemAddItem"}, {"ref": "CartItemRemoveConfirm"}]}]}], "description": "Shopping cart molecule. Composes atoms: - Cart-specific browse trait (empty/hasItems/checkout states) - stdModal for the add-item form (responds to ADD_ITEM)"}`} />

The APPROVE transition's guard demonstrates composition: a reviewer cannot approve their own request (`!=` check), and requests above 1000 require the `manager` role (nested `or` inside `and`). If the guard fails, the state stays at `reviewing`, no effects run, and the UI does not change.

---

## linkedEntity: Binding a Trait to Its Data

The `linkedEntity` property specifies which entity a Trait operates on. When you write `@entity.title` in a guard or effect, the runtime resolves `@entity` to the linked entity.

### Default Binding

Every orbital has a primary entity defined in its `entity` property. Traits without an explicit `linkedEntity` use the primary entity:

```orb
{
  "name": "TaskManager",
  "entity": { "name": "Task", "fields": [...] },
  "traits": [
    { "name": "StatusTrait" }
  ]
}
```

Here `StatusTrait` operates on `Task` by default.

### Explicit Binding

Use `linkedEntity` when a trait needs to operate on a different entity, or when you want to make the binding explicit:

```orb
{
  "name": "ProjectDashboard",
  "entity": { "name": "Project", "fields": [...] },
  "traits": [
    { "name": "ProjectOverview", "linkedEntity": "Project" },
    { "name": "TaskList", "linkedEntity": "Task" },
    { "name": "MemberList", "linkedEntity": "Member" }
  ]
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

```orb
{
  "pages": [
    {
      "name": "DashboardPage",
      "path": "/dashboard",
      "traits": [
        { "ref": "ProjectOverview", "linkedEntity": "Project" },
        { "ref": "TaskList", "linkedEntity": "Task" },
        { "ref": "ActivityFeed", "linkedEntity": "Activity" }
      ]
    }
  ]
}
```

Here, three Traits render concurrently on the same page. If `TaskList` emits a `TASK_COMPLETED` event internally, `ActivityFeed` can listen for it and update. Each Trait manages its own state independently. `ProjectOverview` might be in state `active` while `TaskList` is in state `loading` and `ActivityFeed` is in state `idle`.

This is concurrency through composition, not through threads or callbacks. The event bus coordinates communication. Each Trait remains a self-contained state machine.

---

## Cross-Orbital Communication: emits and listens

Traits in different orbitals communicate through declared event contracts. This is the only mechanism for cross-orbital communication, and it requires explicit declarations on both sides.

### Emitting Events

A Trait declares the events it can emit in its `emits` array:

```orb
{
  "name": "OrderFlow",
  "emits": [
    {
      "event": "ORDER_PLACED",
      "scope": "external",
      "payload": [
        { "name": "orderId", "type": "string" },
        { "name": "total", "type": "number" }
      ]
    }
  ]
}
```

The event name used in an `["emit", "ORDER_PLACED", ...]` effect must match an entry in the `emits` array. The validator checks this. `scope: "external"` means the event can cross orbital boundaries. `scope: "internal"` restricts it to the same orbital.

### Listening for Events

A Trait declares the events it responds to in its `listens` array:

```orb
{
  "name": "InventorySync",
  "listens": [
    {
      "event": "ORDER_PLACED",
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
| `event` | The event name to listen for |
| `triggers` | The internal event key to fire when the external event arrives |
| `scope` | `internal` (same orbital only) or `external` (cross-orbital) |
| `payloadMapping` | Transform the incoming payload before triggering |
| `guard` | S-expression condition. If false, the event is ignored. |

### The Communication Flow

```
OrderManagement orbital            InventoryManagement orbital
┌─────────────────────┐            ┌─────────────────────┐
│                     │            │                     │
│  OrderFlow trait    │   emit     │  InventorySync trait │
│  state: confirmed   │──────────►│  state: idle         │
│                     │ ORDER_    │                     │
│  emits:             │ PLACED    │  listens:            │
│    ORDER_PLACED     │            │    ORDER_PLACED      │
│                     │            │    → RESERVE_STOCK   │
└─────────────────────┘            └─────────────────────┘
```

1. `OrderFlow` fires an `["emit", "ORDER_PLACED", ...]` effect
2. The event bus broadcasts to all traits with a matching `listens` entry
3. `InventorySync` receives the event, applies `payloadMapping`, checks the `guard`
4. If the guard passes, `RESERVE_STOCK` fires as an internal event on `InventorySync`
5. `InventorySync` processes the `RESERVE_STOCK` transition normally

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
