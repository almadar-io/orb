# Entities

> How entities work in the Orb architecture - from schema definition to runtime execution.

---

## Overview

In Orb, an **Entity** is the data model at the core of each Orbital Unit. The fundamental composition is:

```
Orbital Unit = Entity + Traits + Pages
```

Entities define the shape of data, while Traits define behavior (state machines) that operate on that data. The binding between them is explicit and type-safe.



## Entity Definition

An entity is defined in the `.orb` schema with the following structure:

```json
{
  "name": "Task",
  "collection": "tasks",
  "fields": [
    { "name": "id", "type": "string", "required": true, "primaryKey": true },
    { "name": "title", "type": "string", "required": true },
    { "name": "status", "type": "enum", "values": ["pending", "active", "done"] },
    { "name": "assigneeId", "type": "relation", "relation": { "entity": "User", "cardinality": "one" } },
    { "name": "dueDate", "type": "date" },
    { "name": "tags", "type": "array", "items": { "type": "string" } }
  ]
}
```

### Entity Properties

| Property | Required | Description |
|----------|----------|-------------|
| `name` | Yes | PascalCase identifier (e.g., `Task`, `User`, `GameState`) |
| `collection` | For persistent | Database collection name (e.g., `tasks`, `users`) |
| `persistence` | No | Storage mode: `persistent`, `runtime`, or `singleton` |
| `fields` | Yes | Array of field definitions |

---

## Field Types

Orb supports the following field types:

| Type | Description | Example | TypeScript | Storage |
|------|-------------|---------|------------|---------|
| `string` | Text data | `"hello"` | `string` | String |
| `number` | Numeric values (float) | `42.5` | `number` | Number |
| `boolean` | True/false | `true` | `boolean` | Boolean |
| `date` | Date without time | `"2026-03-01"` | `Date` | ISO string |
| `datetime` | Date with time | `"2026-03-01T10:30:00Z"` | `Date` | ISO string |
| `timestamp` | Milliseconds since epoch | `1709312400000` | `number` | Number |
| `array` | Collection of values | `["a", "b"]` | `T[]` | Array |
| `object` | Structured data | `{ key: "value" }` | `Record<string, unknown>` | JSON |
| `enum` | Named constants | `"pending"` | Union type | String |
| `relation` | Entity reference | `"user_123"` | `string` (FK) | String |

### Field Properties

```json
{
  "name": "status",
  "type": "enum",
  "required": true,
  "values": ["pending", "active", "done"],
  "default": ["quote", "pending"]
}
```

| Property | Description |
|----------|-------------|
| `name` | camelCase field identifier |
| `type` | One of the supported field types |
| `required` | Whether the field must have a value |
| `primaryKey` | Designates the primary key field |
| `unique` | Enforces uniqueness constraint |
| `default` | Default value (as S-expression) |
| `values` | For `enum` type - array of allowed values |
| `items` | For `array` type - element type definition |
| `properties` | For `object` type - nested field definitions |
| `relation` | For `relation` type - target entity and cardinality |

### Relation Fields

Relations link entities together:

```json
{
  "name": "assigneeId",
  "type": "relation",
  "relation": {
    "entity": "User",
    "cardinality": "one"
  },
  "required": false
}
```

**Cardinality options:**
- `one` - Single reference (foreign key)
- `many` - Multiple references (array of IDs)

---

## Entity Persistence Types

Entities have three persistence modes that fundamentally change their storage and sharing behavior:

### 1. Persistent Entities

**Storage:** Database (Firestore, PostgreSQL, etc.)
**Lifetime:** Survives restarts, shared across sessions
**Collection:** Required - explicit naming
**Default:** If `persistence` is not specified, it defaults to `persistent`

```json
{
  "name": "Task",
  "persistence": "persistent",  // Optional - defaults to "persistent" if omitted
  "collection": "tasks",
  "fields": [...]
}
```

**Characteristics:**
- All orbitals referencing the same entity name share the same collection
- CRUD operations go through the persistence adapter
- Suitable for domain objects (Task, User, Order, Product)

### 2. Runtime Entities

**Storage:** Memory only (JavaScript/Python objects)
**Lifetime:** Lost on restart/session end
**Collection:** None

```json
{
  "name": "Enemy",
  "persistence": "runtime",
  "fields": [...]
}
```

**Characteristics:**
- **Isolated per orbital** - each orbital gets its own instances
- No database operations
- Suitable for temporary state (Enemy, Projectile, Particle)
- Common in games where entities spawn/despawn frequently

### 3. Singleton Entities

**Storage:** Memory (single instance)
**Lifetime:** One instance per session
**Collection:** None (single record)

```json
{
  "name": "Player",
  "persistence": "singleton",
  "fields": [...]
}
```

**Characteristics:**
- Single instance shared across all orbitals
- Accessible via `@EntityName` binding (e.g., `@Player.health`)
- Suitable for global state (Player, GameConfig, Settings)

### Persistence Comparison

| Aspect | Persistent | Runtime | Singleton |
|--------|------------|---------|-----------|
| Storage | Database | Memory | Memory |
| Lifetime | Permanent | Session | Session |
| Sharing | Shared by name | Isolated per orbital | Single instance |
| Collection | Required | None | None |
| Use Case | Domain objects | Game entities | Global config |

---

## Entity Bindings in S-Expressions


### Core Bindings

| Binding | Description | Example |
|---------|-------------|---------|
| `@entity` | Current entity instance | `@entity.status`, `@entity.id` |
| `@payload` | Event payload data | `@payload.newStatus`, `@payload.amount` |
| `@state` | Current trait state name | `@state` returns `"active"` |
| `@now` | Current timestamp (ms) | `@now` returns `1709312400000` |
| `@user` | Authenticated user info | `@user.id`, `@user.email` |
| `@EntityName` | Singleton entity | `@Player.health`, `@GameConfig.level` |

### Usage in Guards

Guards use bindings to check conditions before transitions:

```json
{
  "from": "active",
  "to": "completed",
  "event": "COMPLETE",
  "guards": [
    [">=", "@entity.progress", 100],
    ["=", "@entity.assigneeId", "@user.id"]
  ]
}
```

### Usage in Effects

Effects use bindings to read and modify data:

```json
{
  "effects": [
    ["set", "@entity.id", "status", "@payload.newStatus"],
    ["set", "@entity.id", "updatedAt", "@now"],
    ["increment", "@entity.id", "completionCount", 1]
  ]
}
```

### Path Navigation

Bindings support dot notation for nested access:

```
@entity.user.name          → entity.user.name
@payload.metadata.tags[0]  → payload.metadata.tags[0]
@Player.inventory.slots    → Player.inventory.slots
```

### Binding Resolution Process

1. **Parse** - Extract `@` prefix and root name
2. **Lookup** - Check locals (from `let`), then core bindings
3. **Navigate** - Follow dot path through object structure
4. **Return** - Value or `undefined` if path fails

---

## Trait-Entity Binding (linkedEntity)

Traits are state machines that operate on entities. The binding between a trait and its entity is explicit.

### Primary Entity

Every orbital has a **primary entity** - the entity defined in its `entity` property:

```json
{
  "name": "TaskManagement",
  "entity": {
    "name": "Task",
    "collection": "tasks",
    "fields": [...]
  },
  "traits": [...]
}
```

Traits in this orbital automatically have access to `Task` via `@entity`.

### linkedEntity Property

When referencing a trait, you can specify which entity it should operate on:

```json
{
  "traits": [
    {
      "ref": "StatusManagement",
      "linkedEntity": "Task"
    },
    {
      "ref": "HealthManagement",
      "linkedEntity": "Player"
    }
  ]
}
```

**Why linkedEntity?**

1. **Reusable traits** - A generic `StatusManagement` trait can work with any entity that has a `status` field
2. **Cross-entity operations** - A trait can operate on a different entity than the orbital's primary
3. **Explicit binding** - Makes the entity dependency clear and type-checkable

### How It Works

When a trait is instantiated:

```typescript
const linkedEntity = traitDef.linkedEntity || orbitalEntityName;
this.traitEntityMap.set(trait.name, linkedEntity);
```

1. If `linkedEntity` is specified, use it
2. Otherwise, default to the orbital's primary entity
3. Store the mapping for runtime resolution

### Example: Multi-Entity Orbital

```json
{
  "name": "GameLevel",
  "entity": {
    "name": "Level",
    "persistence": "runtime",
    "fields": [...]
  },
  "traits": [
    { "ref": "LevelProgression", "linkedEntity": "Level" },
    { "ref": "PlayerHealth", "linkedEntity": "Player" },
    { "ref": "ScoreTracking", "linkedEntity": "GameState" }
  ]
}
```

Each trait operates on its specified entity, but they're all part of the same orbital.

---

## Runtime Handling

The runtime manages entities at runtime through the following mechanisms:

### Event Processing Flow

1. **Receive Event** - `{ event: "UPDATE", payload: {...}, entityId: "task_123" }`
2. **Resolve Entity** - Load entity data from persistence or memory
3. **Build Context** - Create evaluation context with bindings
4. **Check Guards** - Evaluate guard expressions
5. **Execute Effects** - Run state change effects
6. **Persist Changes** - Save modified entity data
7. **Return Response** - Include updated data and client effects

### Persistence Adapter Interface

```typescript
interface PersistenceAdapter {
  create(entityType: string, data: Record<string, unknown>): Promise<{ id: string }>;
  update(entityType: string, id: string, data: Record<string, unknown>): Promise<void>;
  delete(entityType: string, id: string): Promise<void>;
  getById(entityType: string, id: string): Promise<Record<string, unknown> | null>;
  list(entityType: string): Promise<Record<string, unknown>[]>;
}
```

---

## Mock Mode vs. Real Mode

The runtime supports two modes for entity persistence:

### Mock Mode (Development)

**Configuration:**
```typescript
const runtime = new OrbitalServerRuntime({
  mode: 'mock',
  mockSeed: 12345  // Optional: deterministic data
});
```

**Characteristics:**
- Uses MockPersistenceAdapter
- Generates realistic fake data
- In-memory storage (no database)
- Field-type aware generation (emails look like emails, dates are valid dates)
- Deterministic with seed for reproducible testing
- Auto-seeds configured number of records per entity

**Field Type Generation:**

| Field Type | Generated Data |
|------------|----------------|
| `string` | Lorem words |
| `string` (name: "email") | Email address |
| `string` (name: "name") | Full name |
| `number` | Random integer |
| `boolean` | Random boolean |
| `date` | Recent date |
| `enum` | Random value from `values` array |

### Real Mode (Production)

**Configuration:**
```typescript
const runtime = new OrbitalServerRuntime({
  mode: 'real',
  persistence: new FirestorePersistenceAdapter(db)
});
```

**Characteristics:**
- Uses custom PersistenceAdapter implementation
- Real database operations (Firestore, PostgreSQL, etc.)
- Async CRUD operations
- Production-ready persistence

### Mode Comparison

| Aspect | Mock Mode | Real Mode |
|--------|-----------|-----------|
| Persistence | In-memory | Database |
| Data Source | Generated | Real user data |
| Determinism | Seedable | N/A |
| Use Case | Development, testing | Production |
| Setup | Zero config | Adapter required |

---

## Entity Sharing & Isolation

How entities are shared between orbitals depends on persistence type:

### Persistent Entities (Shared)

All orbitals using the same entity name share the same collection:

```
Orbital A (entity: Task) ──┐
                           ├──► Collection: "tasks"
Orbital B (entity: Task) ──┘
```

Changes in Orbital A are visible to Orbital B.

### Runtime Entities (Isolated)

Each orbital gets its own instances:

```
Orbital A (entity: Enemy) ──► Memory: "OrbitalA_enemies"
Orbital B (entity: Enemy) ──► Memory: "OrbitalB_enemies"
```

Orbital A's enemies are completely separate from Orbital B's.

### Singleton Entities (Single Instance)

One instance shared across all:

```
Orbital A ──┐
Orbital B ──┼──► Single Player instance
Orbital C ──┘
```

All orbitals see and modify the same `Player` data.

---

## Summary

The Orb entity system provides:

1. **Typed Fields** - Strong typing with string, number, boolean, date, enum, relation, array, object
2. **Persistence Modes** - Persistent (database), runtime (memory), singleton (global)
3. **Binding System** - `@entity`, `@payload`, `@state`, `@now`, `@user`, `@Singleton` for S-expression access
4. **Trait Binding** - Explicit `linkedEntity` connects traits to their data source
5. **Compiler Validation** - Schema validation ensures correctness
6. **Flexible Runtime** - Mock mode for development, real mode for production
7. **Sharing Control** - Persistent shares, runtime isolates, singleton is global

The entity is the foundation of the Orbital Unit - traits operate on it, pages display it, and the runtime manages its lifecycle.

---

*Document created: 2026-02-02*
*Based on codebase analysis of Orb*
