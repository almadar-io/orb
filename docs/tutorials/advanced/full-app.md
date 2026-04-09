import { AvlOrbitalUnit, AvlEmitListen } from '@almadar/ui/illustrations';

# Building a Full Multi-Orbital Application

> Source: [`tests/schemas/09-full-app.orb`](../../../../tests/schemas/09-full-app.orb)

This tutorial walks through the complete `full-app-test` schema — a real application with three connected orbitals. It combines everything from the previous tutorials: entities, state machines, render-ui, guards, and cross-orbital events.

<div style={{margin: '2rem 0'}}>
<AvlOrbitalUnit
  entityName="Task"
  fields={7}
  traits={[{ name: 'TaskLifecycle' }, { name: 'TaskCRUD' }]}
  pages={[{ name: 'TaskListPage' }]}
  animated
/>
</div>

<div style={{margin: '2rem 0'}}>
<AvlOrbitalUnit
  entityName="Project"
  fields={5}
  traits={[{ name: 'ProjectStats' }]}
  pages={[{ name: 'ProjectListPage' }]}
  animated
/>
</div>

<div style={{margin: '2rem 0'}}>
<AvlOrbitalUnit
  entityName="User"
  fields={4}
  traits={[{ name: 'UserBrowser' }]}
  pages={[{ name: 'UserListPage' }]}
  animated
/>
</div>

<div style={{margin: '2rem 0'}}>
<AvlEmitListen
  emitter={{name: "TaskManager", fields: 7}}
  listener={{name: "ProjectManager", fields: 5}}
  eventName="TASK_COMPLETED"
  animated
/>
</div>

---

## Application Overview

```
TaskManager orbital          ProjectManager orbital       UserManager orbital
  entity: Task                 entity: Project              entity: User
  traits:                      traits:                      traits:
    TaskLifecycle                ProjectStats                 UserBrowser
    TaskCRUD                   listens:                     pages:
  pages:                         TASK_COMPLETED               /users
    /tasks                       TASK_CREATED
  emits:
    TASK_COMPLETED
    TASK_CREATED
```

**The data flow:**
1. User creates or completes a task in `TaskManager`
2. `TaskManager` emits `TASK_CREATED` or `TASK_COMPLETED`
3. `ProjectManager` listens and updates its project counters

---

## Orbital 1: TaskManager

### Entity

```lolo
type Priority = low | medium | high

entity Task [persistent: tasks] {
  id : string!
  title : string!
  description : string
  priority : Priority = medium
  dueDate : date
  assigneeId : string
  projectId : string
}
```

### Trait 1: TaskLifecycle

Manages the task's workflow status. Emits `TASK_COMPLETED` when a task is approved or completed directly.

**States:** `todo → inProgress → review → done`

Key transitions:
```lolo
state review {
  APPROVE -> done
    (emit TASK_COMPLETED { taskId: @entity.id, projectId: @entity.projectId })
}
state inProgress {
  COMPLETE -> done
    (emit TASK_COMPLETED { taskId: @entity.id, projectId: @entity.projectId })
}
```

### Trait 2: TaskCRUD

Manages the list UI. Emits `TASK_CREATED` when a new task is saved.

**States:** `listing → creating | editing`

Key transitions:
```lolo
state creating {
  SAVE -> listing
    (persist update Task @entity)
    (emit TASK_CREATED { taskId: @entity.id, projectId: @entity.projectId })
    (notify success "Task created")
}
state listing {
  VIEW -> listing
    (navigate "/tasks/@payload.id")
}
```

### Pages

```lolo
page "/tasks" -> TaskCRUD
```

### Orbital-level emits

Declared inside the trait's `emits` block:

```lolo
emits {
  TASK_COMPLETED external { taskId: string, projectId: string }
  TASK_CREATED external { taskId: string, projectId: string }
}
```

---

## Orbital 2: ProjectManager

### Entity

Tracks aggregate stats per project, updated reactively when tasks change:

```lolo
entity Project [persistent: projects] {
  id : string!
  name : string!
  description : string
  taskCount : number = 0
  completedCount : number = 0
}
```

### Trait: ProjectStats

Listens to both `TASK_COMPLETED` and `TASK_CREATED` and increments counters:

```lolo
trait ProjectStats -> Project [interaction] {
  initial: idle
  state idle {
    INIT -> idle
      (fetch Project)
      (render-ui main { type: "stats", items: [{ label: "Total Tasks", value: "@entity.taskCount" }, { label: "Completed", value: "@entity.completedCount" }] })
    TASK_CREATED -> idle
      (increment @entity.taskCount 1)
    TASK_COMPLETED -> idle
      (increment @entity.completedCount 1)
  }
  listens {
    * TASK_CREATED -> TASK_CREATED
    * TASK_COMPLETED -> TASK_COMPLETED
  }
}
```

The `TASK_CREATED` and `TASK_COMPLETED` events are received from `TaskManager`. They trigger self-loop transitions that fire `increment` effects — updating the project stats in real time.

### Pages & orbital-level listens

The page declaration and the cross-orbital listens (wired via the trait's `listens` block above):

```lolo
page "/projects" -> ProjectStats
```

---

## Orbital 3: UserManager

The simplest orbital — a read-only browser for users with a navigate-to-detail action.

### Entity

```lolo
type Role = admin | member | guest

entity User [persistent: users] {
  id : string!
  name : string!
  email : string!
  role : Role = member
}
```

### Trait: UserBrowser

```lolo
trait UserBrowser -> User [interaction] {
  initial: browsing
  state browsing {
    INIT -> browsing
      (fetch User)
      (render-ui main { type: "entity-table", entity: "User", columns: ["name", "email", "role"], itemActions: [{ event: "VIEW", label: "View" }] })
    VIEW -> browsing
      (navigate "/users/@payload.id")
  }
}
```

### Pages

```lolo
page "/users" -> UserBrowser
```

---

## Application Routes Summary

| Path | Orbital | Trait | Description |
|------|---------|-------|-------------|
| `/tasks` | TaskManager | TaskCRUD | Browse, create, edit, delete tasks |
| `/tasks/:id` | TaskManager | TaskCRUD | Navigate to task detail (via `navigate` effect) |
| `/projects` | ProjectManager | ProjectStats | View project stats updated by task events |
| `/users` | UserManager | UserBrowser | Browse users, click to view detail |

---

## Patterns in This App

| Concept | Where it appears |
|---------|-----------------|
| Multiple traits per orbital | TaskManager has TaskLifecycle + TaskCRUD |
| Terminal states | `done` in TaskLifecycle (last state with no outgoing transitions) |
| Cross-orbital emit | TaskLifecycle emits `TASK_COMPLETED`, TaskCRUD emits `TASK_CREATED` |
| Cross-orbital listen | ProjectStats listens to both events and increments counters |
| Self-loop transitions | All INIT transitions; ProjectStats event handlers |
| Payload in events | `VIEW` carries `id`; `TASK_COMPLETED` carries `taskId` + `projectId` |
| navigate effect | TaskCRUD's VIEW transition navigates to `/tasks/@payload.id` |
| increment effect | ProjectStats uses `(increment @entity.taskCount 1)` |

---

## Next Steps

- [Generating Schemas with an LLM](./ai-generation.md) — have an AI generate schemas like this one
- [Guards & Business Rules](../intermediate/guards.md) — add permission guards to the task workflows
- [UI Patterns & render-ui](../intermediate/ui-patterns.md) — enhance the UI with more pattern types
