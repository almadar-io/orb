import { AvlOrbitalUnit, AvlStateMachine } from '@almadar/ui/illustrations';

# Anatomy of a Complete Orbital

> Every feature in Orb is an orbital. An orbital is not complete without all four parts.

<div style={{margin: '2rem 0'}}>
<AvlOrbitalUnit
  entityName="Task"
  fields={3}
  traits={[{ name: 'TaskLifecycle' }]}
  pages={[{ name: 'TaskListPage' }]}
  animated
/>
</div>

## The Four Parts of an Orbital

An orbital is the fundamental unit of an Orb application. It must contain:

```
Orbital = Entity + Trait(s) + State Machine + Pages
```

| Part | Purpose | Missing it means... |
|------|---------|---------------------|
| `entity` | What data you manage | No data to work with |
| `trait` | How the app behaves | No behavior or UI |
| states + transitions | The states, events, and transitions inside the trait | No lifecycle defined |
| `page` | Where the UI appears (routes) | Page loads blank — nothing renders |

**Pages are the most commonly forgotten part.** Without a `page` declaration, the trait exists but is never mounted to a route — the user sees nothing.

---

## Step 1 — Define the Entity

The entity is your data structure. It describes what you're managing and how it persists.

```lolo
type Status = pending | done

entity Task [persistent: tasks] {
  id : string!
  title : string!
  status : Status = pending
}
```

**Field types:** `string`, `number`, `boolean`, `date`, `timestamp`, `enum`, `array`, `object`, `relation`

**Persistence modes:**
- `persistent` — stored in database (Firestore, PostgreSQL)
- `runtime` — in-memory, session-specific (cart, wizard state)
- `singleton` — one global instance (app config, current user)

---

## Step 2 — Define the State Machine

The state machine lives inside a trait. It describes what states the feature can be in and what events cause transitions.

### States

Every state machine needs at least one initial state, declared with `initial:`. States are named blocks:

<div style={{margin: '2rem 0'}}>
<AvlStateMachine
  states={[
    { name: 'Pending', isInitial: true },
    { name: 'Done', isTerminal: true }
  ]}
  transitions={[
    { from: 'Pending', to: 'Pending', event: 'INIT' },
    { from: 'Pending', to: 'Done', event: 'COMPLETE' }
  ]}
  animated
/>
</div>

```lolo
initial: Pending
state Pending { }
state Done { }
```

### Events

Events are triggers — user actions, system events, or lifecycle hooks. They are declared implicitly by the transitions that use them. For example, a trait handling `INIT` and `COMPLETE` would have transitions like:

> **`INIT` is mandatory.** Without an INIT transition, the page loads but renders nothing.

### Transitions

Transitions wire states and events together. They can carry guards (conditions) and effects (actions):

```lolo
state Pending {
  INIT -> Pending
    (fetch Task)
    (render-ui main { type: "entity-table", entity: "Task", columns: ["title", "status"], itemActions: [{ event: "COMPLETE", label: "Complete" }] })
  COMPLETE -> Done
    (persist update Task @entity)
    (notify success "Task completed!")
}
state Done { }
```

---

## Step 3 — Build the Trait

Wrap the state machine in a trait with a name, linked entity, and category:

```lolo
trait TaskLifecycle -> Task [interaction] {
  initial: Pending
  state Pending {
    INIT -> Pending
      (fetch Task)
      (render-ui main { type: "entity-table", entity: "Task", columns: ["title", "status"], itemActions: [{ event: "COMPLETE", label: "Complete" }] })
    COMPLETE -> Done
      (persist update Task @entity)
      (notify success "Task completed!")
  }
  state Done { }
}
```

The trait category (in brackets after the entity name) can be:
- `[interaction]` — has UI, fires `render-ui` effects
- `[integration]` — backend service calls, no UI

---

## Step 4 — Add Pages

Pages bind traits to URL routes. This is the part most often missing.

```lolo
page "/tasks" -> TaskLifecycle
```

- The path is the URL route (supports `:id` params, e.g. `/tasks/:id`)
- The trait name after `->` references a trait defined in the same orbital
- The orbital's entity is automatically bound to the page

---

## The Complete Orbital

Putting it all together — a fully working `TaskManager` orbital:

```lolo
;; app TaskManager

orbital Tasks {
  entity Task [persistent: tasks] {
    id : string!
    title : string!
    status : string
  }
  trait TaskLifecycle -> Task [interaction] {
    initial: Pending
    state Pending {
      INIT -> Pending
        (fetch Task)
        (render-ui main { type: "entity-table", entity: "Task", fields: ["title", "status"], columns: ["title", "status"], itemActions: [{ event: "COMPLETE", label: "Complete" }] })
      COMPLETE -> Done
        (persist update Task @entity)
        (notify success "Task completed!")
    }
    state Done {}
  }
  page "/tasks" -> TaskLifecycle
}
```

---

## Common Mistakes

### Missing `page`

```lolo
;; ❌ Incomplete — nothing renders at any route
orbital Tasks {
  entity Task [persistent: tasks] { ... }
  trait TaskLifecycle -> Task [interaction] { ... }
}

;; ✅ Complete — trait is mounted at /tasks
orbital Tasks {
  entity Task [persistent: tasks] { ... }
  trait TaskLifecycle -> Task [interaction] { ... }
  page "/tasks" -> TaskLifecycle
}
```

### States as strings (invalid)

In lolo, every state is a named block. There is no list of strings — declare each state with the `state` keyword:

```lolo
;; ❌ Not valid lolo
;; states: ["Pending", "Done"]

;; ✅ States are blocks, initial state declared with initial:
initial: Pending
state Pending { }
state Done { }
```

### Missing INIT transition

```lolo
;; ❌ Page opens but is blank — no initial render-ui
state Pending {
  COMPLETE -> Done
    (persist update Task @entity)
}

;; ✅ Add a self-loop on INIT to render the initial UI
state Pending {
  INIT -> Pending
    (fetch Task)
    (render-ui main { type: "entity-table", entity: "Task" })
  COMPLETE -> Done
    (persist update Task @entity)
}
```

---

## Next Steps

- [Build a Task Manager](./task-manager.md) — add full CRUD to this pattern
- [UI Patterns & render-ui](../intermediate/ui-patterns.md) — explore all pattern types
- [Guards & Business Rules](../intermediate/guards.md) — add conditions to transitions
