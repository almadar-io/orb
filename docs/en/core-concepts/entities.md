import { AvlOrbitalUnit } from '@almadar/ui/illustrations';
import OrbPreviewBlock from '@shared/OrbPreviewBlock';

# Entities

> The data nucleus of every Orbital Unit: typed fields, persistence modes, and the binding system that connects data to behavior.

**Related:** [Traits](./traits.md) | [Pages](./pages.md) | [Closed Circuit](./closed-circuit.md)

---

## What Is an Entity?

An Entity is the data definition at the center of an Orbital Unit. It declares the shape of the data that traits operate on, pages display, and effects modify. Every Orbital Unit has exactly one primary entity.

```
Orbital Unit = Entity + Traits + Pages
```

The entity defines **what data exists**. Traits define **how it changes**. Pages define **where users see it**. These three parts compose into a self-contained unit of functionality.

<div style={{margin: '2rem 0'}}>
<AvlOrbitalUnit
  entityName="Contact"
  fields={5}
  persistence="persistent"
  traits={[{name: 'ContactFlow'}, {name: 'StatusTracking'}]}
  pages={[{name: 'ContactListPage'}, {name: 'ContactDetailPage'}]}
  animated
/>
</div>

An entity declaration looks like this:

```orb
{
  "name": "Contact",
  "persistence": "persistent",
  "collection": "contacts",
  "fields": [
    { "name": "id", "type": "string", "required": true, "primaryKey": true },
    { "name": "fullName", "type": "string", "required": true },
    { "name": "email", "type": "string" },
    { "name": "status", "type": "enum", "values": ["active", "inactive", "archived"] },
    { "name": "tags", "type": "array", "items": { "type": "string" } },
    { "name": "createdAt", "type": "date" }
  ]
}
```

### Entity Properties

| Property | Required | Description |
|----------|----------|-------------|
| `name` | Yes | PascalCase identifier (e.g., `Contact`, `Order`, `GameState`) |
| `persistence` | No | Storage mode: `persistent` (default), `runtime`, or `singleton` |
| `collection` | For persistent | Database collection name (e.g., `contacts`, `orders`) |
| `fields` | Yes | Array of field definitions |

---

## Field Types

Every field has a `name`, a `type`, and optional modifiers. The .orb language supports these field types:

| Type | Description | Example Value | Compiles To |
|------|-------------|---------------|-------------|
| `string` | Text data | `"hello"` | `string` |
| `number` | Numeric values (float) | `42.5` | `number` |
| `boolean` | True/false | `true` | `boolean` |
| `date` | Date without time | `"2026-03-01"` | `Date` |
| `datetime` | Date with time | `"2026-03-01T10:30:00Z"` | `Date` |
| `timestamp` | Milliseconds since epoch | `1709312400000` | `number` |
| `enum` | Named constants from a fixed set | `"pending"` | Union type |
| `array` | Ordered collection | `["a", "b"]` | `T[]` |
| `object` | Structured nested data | `{ key: "value" }` | `Record<string, unknown>` |
| `relation` | Reference to another entity | `"user_123"` | `string` (FK) |

### Field Properties

Each field accepts these properties:

| Property | Description |
|----------|-------------|
| `name` | camelCase field identifier |
| `type` | One of the types listed above |
| `required` | Whether the field must have a value |
| `primaryKey` | Designates the primary key field |
| `unique` | Enforces uniqueness constraint |
| `default` | Default value (literal or S-expression) |
| `values` | For `enum` type: array of allowed values |
| `items` | For `array` type: element type definition |
| `properties` | For `object` type: nested field definitions |
| `relation` | For `relation` type: target entity and cardinality |

### Enum Fields

Enum fields restrict values to a predefined set. The `values` array lists every valid option:

```orb
{
  "name": "priority",
  "type": "enum",
  "values": ["low", "medium", "high", "critical"],
  "default": "medium"
}
```

The compiler generates a TypeScript union type: `"low" | "medium" | "high" | "critical"`.

### Array and Object Fields

Array fields declare the element type through `items`:

```orb
{
  "name": "tags",
  "type": "array",
  "items": { "type": "string" }
}
```

Object fields declare nested structure through `properties`:

```orb
{
  "name": "address",
  "type": "object",
  "properties": [
    { "name": "street", "type": "string" },
    { "name": "city", "type": "string" },
    { "name": "zipCode", "type": "string" }
  ]
}
```

### Relation Fields

Relations link entities together. The `relation` property specifies the target entity and how many references the field holds:

```orb
{
  "name": "assigneeId",
  "type": "relation",
  "relation": {
    "entity": "User",
    "cardinality": "one"
  }
}
```

**Cardinality options:**
- `one`: single reference (foreign key stored as a string ID)
- `many`: multiple references (stored as an array of string IDs)

---

## Persistence Modes

The `persistence` property controls where entity data lives and how it is shared. This choice fundamentally affects storage, lifetime, and isolation.

### persistent (default)

Data is stored in a database (Firestore, PostgreSQL, or another adapter). It survives restarts and is shared across all sessions. Requires a `collection` name.

```orb
{
  "name": "Order",
  "persistence": "persistent",
  "collection": "orders",
  "fields": [
    { "name": "id", "type": "string", "required": true },
    { "name": "total", "type": "number" },
    { "name": "status", "type": "enum", "values": ["pending", "paid", "shipped"] }
  ]
}
```

Use persistent entities for domain objects that must outlive a single session: users, orders, products, invoices, posts.

All orbitals referencing the same entity name share the same collection. If Orbital A and Orbital B both define an entity called `Order`, they read and write the same database records.

### runtime

Data exists only in memory for the duration of the session. No database, no collection. Lost on restart.

```orb
{
  "name": "Particle",
  "persistence": "runtime",
  "fields": [
    { "name": "id", "type": "string" },
    { "name": "x", "type": "number", "default": 0 },
    { "name": "y", "type": "number", "default": 0 },
    { "name": "velocity", "type": "number", "default": 1 }
  ]
}
```

Use runtime entities for temporary, session-scoped data: game enemies, particles, draft form state, undo history. Each orbital gets its own isolated instances. Orbital A's runtime entities are invisible to Orbital B.

### singleton

A single instance shared across all orbitals. Stored in memory, one record only. No collection needed.

```orb
{
  "name": "AppConfig",
  "persistence": "singleton",
  "fields": [
    { "name": "id", "type": "string" },
    { "name": "theme", "type": "enum", "values": ["light", "dark"], "default": "light" },
    { "name": "language", "type": "string", "default": "en" },
    { "name": "debugMode", "type": "boolean", "default": false }
  ]
}
```

Use singleton entities for global state that every orbital should see and modify: player profile in a game, app-wide configuration, current user session. Accessed in S-expressions via `@EntityName` (e.g., `@AppConfig.theme`).

### Comparison

| Aspect | persistent | runtime | singleton |
|--------|------------|---------|-----------|
| Storage | Database | Memory | Memory |
| Lifetime | Permanent | Session | Session |
| Sharing | Shared by entity name | Isolated per orbital | Single instance, global |
| Collection | Required | None | None |
| Typical use | Domain objects | Temporary/game entities | Global config, player state |

---

## Live Example: Entity with Browse

This complete .orb program defines a `BrowseItem` entity with five fields and a single-state trait that renders them in a data grid. The entity uses `runtime` persistence (in-memory, session-scoped) and demonstrates string fields with an enum-like `status` field constrained by a `values` array. Ten seed instances are provided so the grid has data to display immediately.

{/* height: 400px */}
```lolo preview
orbital BrowseItemOrbital {
  entity BrowseItem [runtime] {
    id : string
    name : string
    description : string
    status : string
    createdAt : string
  }
  trait BrowseItemBrowse -> BrowseItem [interaction] {
    state browsing {
      INIT -> browsing
        (ref BrowseItem)
        (render-ui main { type: "stack", direction: "vertical", gap: "lg", className: "max-w-5xl mx-auto w-full", children: [{ type: "stack", direction: "horizontal", gap: "md", justify: "space-between", align: "center", children: [{ type: "stack", direction: "horizontal", gap: "sm", align: "center", children: [{ type: "icon", name: "list", size: "lg" }, { type: "typography", content: "BrowseItems", variant: "h2" }] }] }, { type: "divider" }, { type: "data-grid", entity: "BrowseItem", emptyIcon: "inbox", emptyTitle: "No browseitems yet", emptyDescription: "Create your first browseitem to get started.", columns: [{ name: "name", label: "Name", variant: "h4", icon: "list" }, { name: "description", label: "Description", variant: "badge", colorMap: { active: "success", completed: "success", done: "success", pending: "warning", draft: "warning", scheduled: "warning", inactive: "neutral", archived: "neutral", disabled: "neutral", error: "destructive", cancelled: "destructive", failed: "destructive" } }, { name: "status", label: "Status", variant: "caption" }] }, { type: "floating-action-button", icon: "plus", event: "INIT", label: "Create", tooltip: "Create" }] })
    }
  }
  page "/browseitems" -> BrowseItemBrowse
}
```

---

## Bindings

Bindings are how S-expressions (guards, effects) access entity data at runtime. Every binding starts with `@` and resolves to a value from the current execution context.

### Core Binding Roots

| Binding | Resolves To | Example |
|---------|-------------|---------|
| `@entity` | The current entity instance being processed | `@entity.status`, `@entity.id` |
| `@payload` | Data attached to the incoming event | `@payload.newTitle`, `@payload.amount` |
| `@state` | Name of the current trait state (string) | `@state` returns `"active"` |
| `@now` | Current timestamp in milliseconds | `@now` returns `1709312400000` |
| `@user` | Authenticated user information | `@user.id`, `@user.email` |
| `@EntityName` | Singleton entity instance (by name) | `@AppConfig.theme`, `@Player.health` |

These are the valid binding roots. `@result` is not a binding root; call-service results flow through the runtime differently.

### Bindings in Guards

Guards use bindings to evaluate conditions before allowing a transition:

```orb
{
  "from": "active",
  "to": "completed",
  "event": "COMPLETE",
  "guard": ["and",
    [">=", "@entity.progress", 100],
    ["=", "@entity.assigneeId", "@user.id"]
  ]
}
```

This transition only fires if progress is at least 100 AND the current user is the assignee. If the guard fails, the transition is blocked and no effects execute.

### Bindings in Effects

Effects use bindings to read data and write changes:

```orb
{
  "effects": [
    ["set", "@entity.id", "status", "@payload.newStatus"],
    ["set", "@entity.id", "updatedAt", "@now"],
    ["set", "@entity.id", "score", ["+", "@entity.score", 10]]
  ]
}
```

The first effect reads `@payload.newStatus` and writes it to the entity's `status` field. The third uses an S-expression to increment `score` by 10.

### Dot Notation for Nested Access

Bindings support dot-separated paths to reach nested values:

```
@entity.address.city        → entity.address.city
@payload.metadata.tags      → payload.metadata.tags
@Player.inventory.slots     → Player (singleton).inventory.slots
```

### How Binding Resolution Works

1. **Parse**: extract the `@` prefix and root name
2. **Lookup**: check local bindings (from `let` expressions), then core binding roots
3. **Navigate**: follow dot path through the object structure
4. **Return**: the resolved value, or `undefined` if the path does not exist

---

## Live Example: Bindings in Action

This program demonstrates `@entity`, `@payload`, and `@state` bindings. The counter trait uses `@entity.count` to display the current value and S-expression math (`["+", "@entity.count", 1]`) to increment it.

```lolo
;; app CounterApp

orbital CounterUnit {
  entity Counter [runtime] {
    id : string!
    count : number
    label : string
  }
  trait CounterTrait -> Counter [interaction] {
    state Counting {
      INIT -> Counting
        (render-ui main { type: "stack", direction: "vertical", gap: "lg", align: "center", children: [{ type: "typography", content: "@entity.count", variant: "h1" }, { type: "stack", direction: "horizontal", gap: "md", children: [{ type: "button", label: "+1", event: "INCREMENT", variant: "primary" }, { type: "button", label: "-1", event: "DECREMENT", variant: "secondary" }, { type: "button", label: "Reset", event: "RESET", variant: "outline" }] }] })
      INCREMENT -> Counting
        (set @entity.count (+ @entity.count 1))
      DECREMENT -> Counting
        ? (> @entity.count 0)
        (set @entity.count (- @entity.count 1))
      RESET -> Counting
        (set @entity.count 0)
    }
  }
  page "/counter" -> CounterTrait
}
```

{/* height: 350px */}
```lolo preview
;; app CounterApp

orbital CounterUnit {
  entity Counter [runtime] {
    id : string!
    count : number
    label : string
  }
  trait CounterTrait -> Counter [interaction] {
    state Counting {
      INIT -> Counting
        (render-ui main { type: "stack", direction: "vertical", gap: "lg", align: "center", children: [{ type: "typography", content: "Counter", variant: "h2" }, { type: "typography", content: "0", variant: "h1" }, { type: "stack", direction: "horizontal", gap: "md", children: [{ type: "button", label: "+1", event: "INCREMENT", variant: "primary" }, { type: "button", label: "-1", event: "DECREMENT", variant: "secondary" }, { type: "button", label: "Reset", event: "RESET", variant: "outline" }] }] })
      INCREMENT -> Counting
        (set @entity.count (+ @entity.count 1))
      DECREMENT -> Counting
        (set @entity.count (- @entity.count 1))
      RESET -> Counting
        (set @entity.count 0)
    }
  }
  page "/counter" -> CounterTrait
}
```

---

## Trait-Entity Binding (linkedEntity)

Traits are state machines. Each trait operates on one entity. The connection between a trait and its entity is explicit through `linkedEntity`.

### Default Binding

Every orbital has a primary entity defined in its `entity` property. Traits that omit `linkedEntity` default to this primary entity:

```orb
{
  "name": "TaskManager",
  "entity": {
    "name": "Task",
    "fields": [...]
  },
  "traits": [
    { "name": "StatusTrait" }
  ]
}
```

Here, `StatusTrait` automatically operates on `Task` because `Task` is the orbital's primary entity. All `@entity` bindings inside `StatusTrait` resolve to `Task` data.

### Explicit Binding

When a trait needs to operate on a different entity, specify `linkedEntity`:

```orb
{
  "name": "ProjectDashboard",
  "entity": { "name": "Project", "fields": [...] },
  "traits": [
    { "name": "ProjectOverview", "linkedEntity": "Project" },
    { "name": "MemberList", "linkedEntity": "Member" },
    { "name": "ActivityFeed", "linkedEntity": "Activity" }
  ]
}
```

Each trait targets a different entity. `@entity` inside `MemberList` resolves to `Member` data, not `Project`.

### Why This Matters

1. **Reusable traits**: a generic `StatusManagement` trait can work with any entity that has a `status` field
2. **Cross-entity operations**: a single orbital can coordinate multiple entity types
3. **Type safety**: the compiler validates that fields referenced in `@entity.fieldName` actually exist on the linked entity

---

## Entity Sharing and Isolation

How entities interact across orbitals depends on the persistence mode.

**Persistent entities share by name.** If two orbitals both define an entity named `Task` with `"persistence": "persistent"`, they read and write the same database collection. Changes made in one orbital are visible in the other.

```
Orbital A (entity: Task, persistent) ──┐
                                       ├──► Collection: "tasks"
Orbital B (entity: Task, persistent) ──┘
```

**Runtime entities are isolated.** Each orbital gets its own separate instances in memory:

```
Orbital A (entity: Enemy, runtime) ──► Memory: isolated set A
Orbital B (entity: Enemy, runtime) ──► Memory: isolated set B
```

**Singleton entities are global.** One instance, shared by every orbital:

```
Orbital A ──┐
Orbital B ──┼──► Single AppConfig instance
Orbital C ──┘
```

---

## Live Example: Enum Fields and Persistence Modes

This program shows an entity with string fields constrained by `values` arrays, simulating enum behavior. The `status` field accepts only `active`, `inactive`, or `pending`. The browse trait renders all instances in a data grid with columns for name, description, and status. This is the same `std-browse` behavior pattern used across all Almadar applications for list views.

{/* height: 400px */}
```lolo preview
orbital BrowseItemOrbital {
  entity BrowseItem [runtime] {
    id : string
    name : string
    description : string
    status : string
    createdAt : string
  }
  trait BrowseItemBrowse -> BrowseItem [interaction] {
    state browsing {
      INIT -> browsing
        (ref BrowseItem)
        (render-ui main { type: "stack", direction: "vertical", gap: "lg", className: "max-w-5xl mx-auto w-full", children: [{ type: "stack", direction: "horizontal", gap: "md", justify: "space-between", align: "center", children: [{ type: "stack", direction: "horizontal", gap: "sm", align: "center", children: [{ type: "icon", name: "list", size: "lg" }, { type: "typography", content: "BrowseItems", variant: "h2" }] }] }, { type: "divider" }, { type: "data-grid", entity: "BrowseItem", emptyIcon: "inbox", emptyTitle: "No browseitems yet", emptyDescription: "Create your first browseitem to get started.", columns: [{ name: "name", label: "Name", variant: "h4", icon: "list" }, { name: "description", label: "Description", variant: "badge", colorMap: { active: "success", completed: "success", done: "success", pending: "warning", draft: "warning", scheduled: "warning", inactive: "neutral", archived: "neutral", disabled: "neutral", error: "destructive", cancelled: "destructive", failed: "destructive" } }, { name: "status", label: "Status", variant: "caption" }] }, { type: "floating-action-button", icon: "plus", event: "INIT", label: "Create", tooltip: "Create" }] })
    }
  }
  page "/browseitems" -> BrowseItemBrowse
}
```

---

## Summary

Entities are the data foundation of every Orbital Unit:

1. **Typed fields**: string, number, boolean, date, enum (with values), array, object, relation
2. **Persistence modes**: persistent (database, shared), runtime (memory, isolated), singleton (memory, global)
3. **Binding system**: `@entity`, `@payload`, `@state`, `@now`, `@user`, `@EntityName` for S-expression access
4. **Trait binding**: `linkedEntity` connects traits to their data source explicitly
5. **Sharing rules**: persistent entities share by name, runtime entities isolate per orbital, singletons are global

Traits operate on entities. Pages display them. The runtime manages their lifecycle. Everything connects through the binding system and the [closed circuit](./closed-circuit.md).
