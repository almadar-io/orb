# Zgradite upravljalnik nalog

> Source: [`tests/schemas/09-full-app.orb`](../../../../tests/schemas/09-full-app.orb)

Ta vadnica korak za korakom gradi pravi upravljalnik nalog. Na koncu boste imeli program z:
- Entiteto `Task` s trajnostjo
- **Lastnost zivljenjskega cikla** (avtomat stanj za status naloge)
- **Lastnost CRUD** (seznam, ustvari, uredi, izbrisi)
- Dve strani, povezani z lastnostmi

<OrbitalDiagram />

---

## Kaj gradimo

```
/tasks        → TaskListPage  (browse, create, edit, delete tasks)
/tasks/:id    → navigated to from the list (view detail)
```

The `TaskManager` orbital has one entity (`Task`) and two traits: one for the task's status lifecycle, one for managing the list.

---

## Korak 1 — Entiteta Task

```orb
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

`persistence: "persistent"` means this is stored in your database. The `collection` key sets the database collection/table name.

---

## Korak 2 — Lastnost zivljenjskega cikla

The `TaskLifecycle` trait tracks where a task is in its workflow: `todo → inProgress → review → done`.

```orb
{
  "name": "TaskLifecycle",
  "linkedEntity": "Task",
  "category": "interaction",
  "stateMachine": {
    "states": [
      { "name": "todo", "isInitial": true },
      { "name": "inProgress" },
      { "name": "review" },
      { "name": "done", "isTerminal": true, "description": "Task completed" }
    ],
    "events": [
      { "key": "INIT", "name": "Initialize" },
      { "key": "START", "name": "Start Task" },
      { "key": "SUBMIT_FOR_REVIEW", "name": "Submit for Review" },
      { "key": "APPROVE", "name": "Approve" },
      { "key": "REJECT", "name": "Request Changes" },
      { "key": "COMPLETE", "name": "Complete" }
    ],
    "transitions": [
      {
        "from": "todo",
        "event": "INIT",
        "to": "todo",
        "effects": [
          ["fetch", "Task"],
          ["render-ui", "main", {
            "type": "stats",
            "items": [
              { "label": "Todo", "value": "@entity.todo" },
              { "label": "In Progress", "value": "@entity.inProgress" },
              { "label": "Done", "value": "@entity.done" }
            ]
          }]
        ]
      },
      { "from": "todo", "event": "START", "to": "inProgress" },
      { "from": "inProgress", "event": "SUBMIT_FOR_REVIEW", "to": "review" },
      {
        "from": "review",
        "event": "APPROVE",
        "to": "done",
        "effects": [
          ["emit", "TASK_COMPLETED", { "taskId": "@entity.id", "projectId": "@entity.projectId" }]
        ]
      },
      { "from": "review", "event": "REJECT", "to": "inProgress" },
      {
        "from": "inProgress",
        "event": "COMPLETE",
        "to": "done",
        "effects": [
          ["emit", "TASK_COMPLETED", { "taskId": "@entity.id", "projectId": "@entity.projectId" }]
        ]
      }
    ]
  }
}
```

**Notable patterns here:**
- The `INIT` self-loop renders a `stats` dashboard showing count by status
- `isTerminal: true` on `done` means no further transitions are allowed from that state
- `emit` publishes a cross-orbital event (see [Cross-Orbital Communication](../intermediate/cross-orbital.md))

---

## Korak 3 — Lastnost CRUD

The `TaskCRUD` trait handles the list management UI: viewing the list, creating, editing, and deleting tasks.

```orb
{
  "name": "TaskCRUD",
  "linkedEntity": "Task",
  "category": "interaction",
  "stateMachine": {
    "states": [
      { "name": "listing", "isInitial": true },
      { "name": "creating" },
      { "name": "editing" }
    ],
    "events": [
      { "key": "INIT", "name": "Initialize" },
      { "key": "VIEW", "name": "View Task", "payload": [
        { "name": "id", "type": "string", "required": true }
      ]},
      { "key": "CREATE", "name": "Create Task" },
      { "key": "EDIT", "name": "Edit Task" },
      { "key": "SAVE", "name": "Save" },
      { "key": "CANCEL", "name": "Cancel" },
      { "key": "DELETE", "name": "Delete Task" }
    ],
    "transitions": [
      {
        "from": "listing",
        "event": "INIT",
        "to": "listing",
        "effects": [
          ["fetch", "Task"],
          ["render-ui", "main", {
            "type": "entity-table",
            "entity": "Task",
            "columns": ["title", "priority", "dueDate"],
            "itemActions": [
              { "event": "VIEW", "label": "View" },
              { "event": "EDIT", "label": "Edit" },
              { "event": "DELETE", "label": "Delete" }
            ]
          }]
        ]
      },
      {
        "from": "listing",
        "event": "CREATE",
        "to": "creating",
        "effects": [
          ["render-ui", "main", { "type": "form", "entity": "Task" }]
        ]
      },
      {
        "from": "creating",
        "event": "SAVE",
        "to": "listing",
        "effects": [
          ["persist", "update", "Task", "@entity"],
          ["notify", "success", "Task created"]
        ]
      },
      { "from": "creating", "event": "CANCEL", "to": "listing" },
      { "from": "listing", "event": "EDIT", "to": "editing" },
      {
        "from": "editing",
        "event": "SAVE",
        "to": "listing",
        "effects": [
          ["persist", "update", "Task", "@entity"]
        ]
      },
      { "from": "editing", "event": "CANCEL", "to": "listing" },
      {
        "from": "listing",
        "event": "DELETE",
        "to": "listing",
        "effects": [
          ["persist", "delete", "Task", "@entity.id"],
          ["notify", "info", "Task deleted"]
        ]
      },
      {
        "from": "listing",
        "event": "VIEW",
        "to": "listing",
        "effects": [
          ["navigate", "/tasks/@payload.id"]
        ]
      }
    ]
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

## Korak 4 — Dodajte strani

```orb
"pages": [
  {
    "name": "TaskListPage",
    "path": "/tasks",
    "traits": [
      { "ref": "TaskCRUD", "linkedEntity": "Task" }
    ]
  }
]
```

The lifecycle trait (`TaskLifecycle`) doesn't need its own page here — it's wired to the same data and its events are triggered programmatically. The list page uses `TaskCRUD`, which manages the browsing experience.

---

## Celoten program

```orb
{
  "name": "TaskManager",
  "version": "1.0.0",
  "orbitals": [
    {
      "name": "TaskManager",
      "entity": {
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
      },
      "traits": [
        {
          "name": "TaskLifecycle",
          "linkedEntity": "Task",
          "category": "interaction",
          "stateMachine": {
            "states": [
              { "name": "todo", "isInitial": true },
              { "name": "inProgress" },
              { "name": "review" },
              { "name": "done", "isTerminal": true }
            ],
            "events": [
              { "key": "INIT", "name": "Initialize" },
              { "key": "START", "name": "Start Task" },
              { "key": "SUBMIT_FOR_REVIEW", "name": "Submit for Review" },
              { "key": "APPROVE", "name": "Approve" },
              { "key": "REJECT", "name": "Request Changes" },
              { "key": "COMPLETE", "name": "Complete" }
            ],
            "transitions": [
              {
                "from": "todo", "event": "INIT", "to": "todo",
                "effects": [
                  ["fetch", "Task"],
                  ["render-ui", "main", { "type": "stats", "items": [
                    { "label": "Todo", "value": "@entity.todo" },
                    { "label": "In Progress", "value": "@entity.inProgress" },
                    { "label": "Done", "value": "@entity.done" }
                  ]}]
                ]
              },
              { "from": "todo", "event": "START", "to": "inProgress" },
              { "from": "inProgress", "event": "SUBMIT_FOR_REVIEW", "to": "review" },
              { "from": "review", "event": "APPROVE", "to": "done", "effects": [
                ["emit", "TASK_COMPLETED", { "taskId": "@entity.id", "projectId": "@entity.projectId" }]
              ]},
              { "from": "review", "event": "REJECT", "to": "inProgress" },
              { "from": "inProgress", "event": "COMPLETE", "to": "done", "effects": [
                ["emit", "TASK_COMPLETED", { "taskId": "@entity.id", "projectId": "@entity.projectId" }]
              ]}
            ]
          }
        },
        {
          "name": "TaskCRUD",
          "linkedEntity": "Task",
          "category": "interaction",
          "stateMachine": {
            "states": [
              { "name": "listing", "isInitial": true },
              { "name": "creating" },
              { "name": "editing" }
            ],
            "events": [
              { "key": "INIT", "name": "Initialize" },
              { "key": "VIEW", "name": "View Task", "payload": [
                { "name": "id", "type": "string", "required": true }
              ]},
              { "key": "CREATE", "name": "Create Task" },
              { "key": "EDIT", "name": "Edit Task" },
              { "key": "SAVE", "name": "Save" },
              { "key": "CANCEL", "name": "Cancel" },
              { "key": "DELETE", "name": "Delete Task" }
            ],
            "transitions": [
              {
                "from": "listing", "event": "INIT", "to": "listing",
                "effects": [
                  ["fetch", "Task"],
                  ["render-ui", "main", {
                    "type": "entity-table", "entity": "Task",
                    "columns": ["title", "priority", "dueDate"],
                    "itemActions": [
                      { "event": "VIEW", "label": "View" },
                      { "event": "EDIT", "label": "Edit" },
                      { "event": "DELETE", "label": "Delete" }
                    ]
                  }]
                ]
              },
              {
                "from": "listing", "event": "CREATE", "to": "creating",
                "effects": [["render-ui", "main", { "type": "form", "entity": "Task" }]]
              },
              {
                "from": "creating", "event": "SAVE", "to": "listing",
                "effects": [
                  ["persist", "update", "Task", "@entity"],
                  ["notify", "success", "Task created"]
                ]
              },
              { "from": "creating", "event": "CANCEL", "to": "listing" },
              { "from": "listing", "event": "EDIT", "to": "editing" },
              {
                "from": "editing", "event": "SAVE", "to": "listing",
                "effects": [["persist", "update", "Task", "@entity"]]
              },
              { "from": "editing", "event": "CANCEL", "to": "listing" },
              {
                "from": "listing", "event": "DELETE", "to": "listing",
                "effects": [
                  ["persist", "delete", "Task", "@entity.id"],
                  ["notify", "info", "Task deleted"]
                ]
              },
              {
                "from": "listing", "event": "VIEW", "to": "listing",
                "effects": [["navigate", "/tasks/@payload.id"]]
              }
            ]
          }
        }
      ],
      "pages": [
        {
          "name": "TaskListPage",
          "path": "/tasks",
          "traits": [{ "ref": "TaskCRUD", "linkedEntity": "Task" }]
        }
      ]
    }
  ]
}
```

---

## Preverite in zazenite

```bash
# Validate the schema
orb validate schema.orb

# Start the dev server
orb dev
```

Navigate to `http://localhost:3000/tasks` to see your task manager.

---

## Naslednji koraki

- [UI Patterns & render-ui](../intermediate/ui-patterns.md) — deeper dive into `entity-table`, `form`, and more
- [Guards & Business Rules](../intermediate/guards.md) — restrict who can complete or delete tasks
- [Cross-Orbital Communication](../intermediate/cross-orbital.md) — connect TaskManager to a ProjectManager
- [Building a Full App](../advanced/full-app.md) — the complete 3-orbital app from this schema
