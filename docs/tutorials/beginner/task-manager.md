import { AvlOrbitalUnit, AvlStateMachine } from '@almadar/ui/illustrations';

# Build a Task Manager

> Source: [`tests/schemas/09-full-app.orb`](../../../../tests/schemas/09-full-app.orb)

This tutorial builds a real task manager step by step. By the end you'll have a schema with:
- A `Task` entity with persistence
- A **lifecycle trait** (state machine for task status)
- A **CRUD trait** (list, create, edit, delete)
- Two pages wired to the traits

<div style={{margin: '2rem 0'}}>
<AvlOrbitalUnit
  entityName="Task"
  fields={7}
  traits={[{ name: 'TaskLifecycle' }, { name: 'TaskCRUD' }]}
  pages={[{ name: 'TaskListPage' }]}
  animated
/>
</div>

---

## What We're Building

```
/tasks        → TaskListPage  (browse, create, edit, delete tasks)
/tasks/:id    → navigated to from the list (view detail)
```

The `TaskManager` orbital has one entity (`Task`) and two traits: one for the task's status lifecycle, one for managing the list.

---

## Step 1 — The Task Entity

```lolo
type Priority = low | medium | high

entity Task [persistent: tasks] {
  id          : string!
  title       : string!
  description : string
  priority    : Priority = medium
  dueDate     : date
  assigneeId  : string
  projectId   : string
}
```

`[persistent: tasks]` means this is stored in your database. The identifier after the colon sets the database collection/table name.

---

## Step 2 — The Lifecycle Trait

The `TaskLifecycle` trait tracks where a task is in its workflow: `todo → inProgress → review → done`.

<div style={{margin: '2rem 0'}}>
<AvlStateMachine
  states={[
    { name: 'todo', isInitial: true },
    { name: 'inProgress' },
    { name: 'review' },
    { name: 'done', isTerminal: true }
  ]}
  transitions={[
    { from: 'todo', to: 'todo', event: 'INIT' },
    { from: 'todo', to: 'inProgress', event: 'START' },
    { from: 'inProgress', to: 'review', event: 'SUBMIT_FOR_REVIEW' },
    { from: 'review', to: 'done', event: 'APPROVE' },
    { from: 'review', to: 'inProgress', event: 'REJECT' },
    { from: 'inProgress', to: 'done', event: 'COMPLETE' }
  ]}
  animated
/>
</div>

```lolo
trait TaskLifecycle -> Task [interaction] {
  initial: todo
  state todo {
    INIT -> todo
      (fetch Task)
      (render-ui main {
        type: "stats",
        items: [
          { label: "Todo", value: "@entity.todo" },
          { label: "In Progress", value: "@entity.inProgress" },
          { label: "Done", value: "@entity.done" }
        ]
      })
    START -> inProgress
  }
  state inProgress {
    SUBMIT_FOR_REVIEW -> review
    COMPLETE -> done
      (emit TASK_COMPLETED { taskId: @entity.id, projectId: @entity.projectId })
  }
  state review {
    APPROVE -> done
      (emit TASK_COMPLETED { taskId: @entity.id, projectId: @entity.projectId })
    REJECT -> inProgress
  }
  state done {}
}
```

**Notable patterns here:**
- The `INIT` self-loop renders a `stats` dashboard showing count by status
- `isTerminal: true` on `done` means no further transitions are allowed from that state
- `emit` publishes a cross-orbital event (see [Cross-Orbital Communication](../intermediate/cross-orbital.md))

---

## Step 3 — The CRUD Trait

The `TaskCRUD` trait handles the list management UI: viewing the list, creating, editing, and deleting tasks.

```lolo
trait TaskCRUD -> Task [interaction] {
  initial: listing
  state listing {
    INIT -> listing
      (fetch Task)
      (render-ui main {
        type: "entity-table",
        entity: "Task",
        columns: ["title", "priority", "dueDate"],
        itemActions: [
          { event: "VIEW", label: "View" },
          { event: "EDIT", label: "Edit" },
          { event: "DELETE", label: "Delete" }
        ]
      })
    CREATE -> creating
      (render-ui main { type: "form", entity: "Task" })
    EDIT -> editing
    DELETE -> listing
      (persist delete Task @entity.id)
      (notify info "Task deleted")
    VIEW -> listing
      (navigate "/tasks/@payload.id")
  }
  state creating {
    SAVE -> listing
      (persist update Task @entity)
      (notify success "Task created")
    CANCEL -> listing
  }
  state editing {
    SAVE -> listing
      (persist update Task @entity)
    CANCEL -> listing
  }
}
```

**What the state machine does:**
- `listing` — INIT renders the table. User can VIEW, CREATE, EDIT, or DELETE from here.
- `creating` — transitions to a form; SAVE persists and returns to listing, CANCEL goes back
- `editing` — same pattern as creating but for an existing record
- `VIEW` navigates to a detail page using the payload's `id`

**Payload on events:** The `VIEW` event carries an `id` so the runtime knows which task was clicked. Access it in effects with `@payload.id`.

---

## Step 4 — Add Pages

```lolo
page "/tasks" -> TaskCRUD
```

The lifecycle trait (`TaskLifecycle`) doesn't need its own page here — it's wired to the same data and its events are triggered programmatically. The list page uses `TaskCRUD`, which manages the browsing experience.

---

## The Complete Schema

```lolo
orbital TaskManager {
  entity Task [persistent: tasks] {
    id : string!
    title : string!
    description : string
    priority : string
    dueDate : datetime
    assigneeId : string
    projectId : string
  }
  trait TaskLifecycle -> Task [interaction] {
    initial: todo
    state todo {
      INIT -> todo
        (fetch Task)
        (render-ui main { type: "stats", entity: "Task", title: "Task Overview" })
      START -> inProgress
    }
    state inProgress {
      SUBMIT_FOR_REVIEW -> review
      COMPLETE -> done
        (persist update Task @entity)
        (notify success "Task completed!")
    }
    state review {
      APPROVE -> done
        (persist update Task @entity)
        (notify success "Task approved!")
      REJECT -> inProgress
    }
    state done {}
  }
  trait TaskCRUD -> Task [interaction] {
    initial: listing
    state listing {
      INIT -> listing
        (fetch Task)
        (render-ui main { type: "entity-table", entity: "Task", fields: ["title", "priority", "dueDate"], columns: ["title", "priority", "dueDate"], itemActions: [{ event: "VIEW", label: "View" }, { event: "EDIT", label: "Edit" }, { event: "DELETE", label: "Delete" }] })
      CREATE -> creating
        (render-ui main { type: "form", entity: "Task", fields: ["title", "description", "priority", "dueDate"] })
      EDIT -> editing
      DELETE -> listing
        (persist delete Task @entity.id)
        (notify info "Task deleted")
      VIEW -> listing
        (navigate "/tasks/@payload.id")
    }
    state creating {
      SAVE -> listing
        (persist update Task @entity)
        (notify success "Task created")
      CANCEL -> listing
    }
    state editing {
      SAVE -> listing
        (persist update Task @entity)
      CANCEL -> listing
    }
  }
  page "/tasks" -> TaskCRUD
}
```

---

## Validate and Run

```bash
# Validate the schema
orb validate schema.orb

# Start the dev server
orb dev
```

Navigate to `http://localhost:3000/tasks` to see your task manager.

---

## Next Steps

- [UI Patterns & render-ui](../intermediate/ui-patterns.md) — deeper dive into `entity-table`, `form`, and more
- [Guards & Business Rules](../intermediate/guards.md) — restrict who can complete or delete tasks
- [Cross-Orbital Communication](../intermediate/cross-orbital.md) — connect TaskManager to a ProjectManager
- [Building a Full App](../advanced/full-app.md) — the complete 3-orbital app from this schema
