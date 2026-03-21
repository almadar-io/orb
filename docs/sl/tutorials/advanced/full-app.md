# Gradnja celotne vec-orbitalne aplikacije

> Source: [`tests/schemas/09-full-app.orb`](../../../../tests/schemas/09-full-app.orb)

This tutorial walks through the complete `full-app-test` schema — a real application with three connected orbitals. It combines everything from the previous tutorials: entities, state machines, render-ui, guards, and cross-orbital events.

<OrbitalDiagram />

---

## Pregled aplikacije

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

## Orbital enota 1: TaskManager

### Entiteta

```json
{
  "name": "Task",
  "persistence": "persistent",
  "collection": "tasks",
  "fields": [
    { "name": "id", "type": "string", "required": true },
    { "name": "title", "type": "string", "required": true },
    { "name": "description", "type": "string" },
    { "name": "priority", "type": "enum", "values": ["low", "medium", "high"], "default": "medium" },
    { "name": "dueDate", "type": "date" },
    { "name": "assigneeId", "type": "string" },
    { "name": "projectId", "type": "string" }
  ]
}
```

### Trait 1: TaskLifecycle

Manages the task's workflow status. Emits `TASK_COMPLETED` when a task is approved or completed directly.

**States:** `todo → inProgress → review → done`

Key transitions:
```json
{ "from": "review", "event": "APPROVE", "to": "done",
  "effects": [["emit", "TASK_COMPLETED", { "taskId": "@entity.id", "projectId": "@entity.projectId" }]]
},
{ "from": "inProgress", "event": "COMPLETE", "to": "done",
  "effects": [["emit", "TASK_COMPLETED", { "taskId": "@entity.id", "projectId": "@entity.projectId" }]]
}
```

### Trait 2: TaskCRUD

Manages the list UI. Emits `TASK_CREATED` when a new task is saved.

**States:** `listing → creating | editing`

Key transitions:
```json
{ "from": "creating", "event": "SAVE", "to": "listing",
  "effects": [
    ["persist", "update", "Task", "@entity"],
    ["emit", "TASK_CREATED", { "taskId": "@entity.id", "projectId": "@entity.projectId" }],
    ["notify", "success", "Task created"]
  ]
},
{ "from": "listing", "event": "VIEW", "to": "listing",
  "effects": [["navigate", "/tasks/@payload.id"]]
}
```

### Strani

```json
"pages": [
  {
    "name": "TaskListPage",
    "path": "/tasks",
    "traits": [{ "ref": "TaskCRUD", "linkedEntity": "Task" }]
  }
]
```

### Orbital-level emits

```json
"emits": ["TASK_COMPLETED", "TASK_CREATED"]
```

---

## Orbital enota 2: ProjectManager

### Entiteta

Tracks aggregate stats per project, updated reactively when tasks change:

```json
{
  "name": "Project",
  "persistence": "persistent",
  "collection": "projects",
  "fields": [
    { "name": "id", "type": "string", "required": true },
    { "name": "name", "type": "string", "required": true },
    { "name": "description", "type": "string" },
    { "name": "taskCount", "type": "number", "default": 0 },
    { "name": "completedCount", "type": "number", "default": 0 }
  ]
}
```

### Trait: ProjectStats

Listens to both `TASK_COMPLETED` and `TASK_CREATED` and increments counters:

```json
{
  "name": "ProjectStats",
  "linkedEntity": "Project",
  "category": "interaction",
  "listens": [
    { "event": "TASK_COMPLETED", "scope": "external" },
    { "event": "TASK_CREATED", "scope": "external" }
  ],
  "stateMachine": {
    "states": [{ "name": "idle", "isInitial": true }],
    "events": [
      { "key": "INIT", "name": "Initialize" },
      { "key": "TASK_COMPLETED", "name": "Task Completed" },
      { "key": "TASK_CREATED", "name": "Task Created" }
    ],
    "transitions": [
      {
        "from": "idle", "event": "INIT", "to": "idle",
        "effects": [
          ["fetch", "Project"],
          ["render-ui", "main", {
            "type": "stats",
            "items": [
              { "label": "Total Tasks", "value": "@entity.taskCount" },
              { "label": "Completed", "value": "@entity.completedCount" }
            ]
          }]
        ]
      },
      {
        "from": "idle", "event": "TASK_CREATED", "to": "idle",
        "effects": [["increment", "@entity.taskCount", 1]]
      },
      {
        "from": "idle", "event": "TASK_COMPLETED", "to": "idle",
        "effects": [["increment", "@entity.completedCount", 1]]
      }
    ]
  }
}
```

The `TASK_CREATED` and `TASK_COMPLETED` events are received from `TaskManager`. They trigger self-loop transitions that fire `increment` effects — updating the project stats in real time.

### Strani & orbital-level listens

```json
"pages": [
  {
    "name": "ProjectListPage",
    "path": "/projects",
    "traits": [{ "ref": "ProjectStats", "linkedEntity": "Project" }]
  }
],
"listens": [
  { "event": "TASK_COMPLETED", "from": "TaskManager" },
  { "event": "TASK_CREATED", "from": "TaskManager" }
]
```

---

## Orbital enota 3: UserManager

The simplest orbital — a read-only browser for users with a navigate-to-detail action.

### Entiteta

```json
{
  "name": "User",
  "persistence": "persistent",
  "collection": "users",
  "fields": [
    { "name": "id", "type": "string", "required": true },
    { "name": "name", "type": "string", "required": true },
    { "name": "email", "type": "string", "required": true },
    { "name": "role", "type": "enum", "values": ["admin", "member", "guest"], "default": "member" }
  ]
}
```

### Trait: UserBrowser

```json
{
  "name": "UserBrowser",
  "linkedEntity": "User",
  "category": "interaction",
  "stateMachine": {
    "states": [{ "name": "browsing", "isInitial": true }],
    "events": [
      { "key": "INIT", "name": "Initialize" },
      { "key": "VIEW", "name": "View User", "payload": [
        { "name": "id", "type": "string", "required": true }
      ]}
    ],
    "transitions": [
      {
        "from": "browsing", "event": "INIT", "to": "browsing",
        "effects": [
          ["fetch", "User"],
          ["render-ui", "main", {
            "type": "entity-table",
            "entity": "User",
            "columns": ["name", "email", "role"],
            "itemActions": [{ "event": "VIEW", "label": "View" }]
          }]
        ]
      },
      {
        "from": "browsing", "event": "VIEW", "to": "browsing",
        "effects": [["navigate", "/users/@payload.id"]]
      }
    ]
  }
}
```

### Strani

```json
"pages": [
  {
    "name": "UserListPage",
    "path": "/users",
    "traits": [{ "ref": "UserBrowser", "linkedEntity": "User" }]
  }
]
```

---

## Povzetek poti aplikacije

| Path | Orbital | Trait | Description |
|------|---------|-------|-------------|
| `/tasks` | TaskManager | TaskCRUD | Browse, create, edit, delete tasks |
| `/tasks/:id` | TaskManager | TaskCRUD | Navigate to task detail (via `navigate` effect) |
| `/projects` | ProjectManager | ProjectStats | View project stats updated by task events |
| `/users` | UserManager | UserBrowser | Browse users, click to view detail |

---

## Vzorci v tej aplikaciji

| Concept | Where it appears |
|---------|-----------------|
| Multiple traits per orbital | TaskManager has TaskLifecycle + TaskCRUD |
| Terminal states | `done` in TaskLifecycle (`isTerminal: true`) |
| Cross-orbital emit | TaskLifecycle emits `TASK_COMPLETED`, TaskCRUD emits `TASK_CREATED` |
| Cross-orbital listen | ProjectStats listens to both events and increments counters |
| Self-loop transitions | All INIT transitions; ProjectStats event handlers |
| Payload in events | `VIEW` carries `id`; `TASK_COMPLETED` carries `taskId` + `projectId` |
| navigate effect | TaskCRUD's VIEW transition navigates to `/tasks/@payload.id` |
| increment effect | ProjectStats uses `["increment", "@entity.taskCount", 1]` |

---

## Naslednji koraki

- [Generating Schemas with an LLM](./ai-generation.md) — have an AI generate schemas like this one
- [Guards & Business Rules](../intermediate/guards.md) — add permission guards to the task workflows
- [UI Patterns & render-ui](../intermediate/ui-patterns.md) — enhance the UI with more pattern types
