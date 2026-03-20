# Anatomy of a Complete Orbital

> Every feature in Orb is an orbital. An orbital is not complete without all four parts.

<OrbitalDiagram />

## The Four Parts of an Orbital

An orbital is the fundamental unit of an Orb application. It must contain:

```
Orbital = Entity + Trait(s) + State Machine + Pages
```

| Part | Purpose | Missing it means... |
|------|---------|---------------------|
| `entity` | What data you manage | No data to work with |
| `traits` | How the app behaves | No behavior or UI |
| `stateMachine` | The states, events, and transitions | No lifecycle defined |
| `pages` | Where the UI appears (routes) | Page loads blank — nothing renders |

**Pages are the most commonly forgotten part.** Without `pages`, the trait exists but is never mounted to a route — the user sees nothing.

---

## Step 1 — Define the Entity

The entity is your data structure. It describes what you're managing and how it persists.

```json
{
  "name": "Task",
  "persistence": "persistent",
  "collection": "tasks",
  "fields": [
    { "name": "id", "type": "string", "required": true },
    { "name": "title", "type": "string", "required": true },
    { "name": "status", "type": "enum", "values": ["pending", "done"], "default": "pending" }
  ]
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

Every state machine needs at least one state marked `"isInitial": true`. States are **objects**, not strings:

```json
"states": [
  { "name": "Pending", "isInitial": true },
  { "name": "Done", "isTerminal": true }
]
```

### Events

Events are triggers — user actions, system events, or lifecycle hooks:

```json
"events": [
  { "key": "INIT", "name": "Initialize" },
  { "key": "COMPLETE", "name": "Complete Task" }
]
```

> **`INIT` is mandatory.** Without an INIT transition, the page loads but renders nothing.

### Transitions

Transitions wire states and events together. They can carry guards (conditions) and effects (actions):

```json
"transitions": [
  {
    "from": "Pending",
    "event": "INIT",
    "to": "Pending",
    "effects": [
      ["fetch", "Task"],
      ["render-ui", "main", {
        "type": "entity-table",
        "entity": "Task",
        "columns": ["title", "status"],
        "itemActions": [
          { "event": "COMPLETE", "label": "Complete" }
        ]
      }]
    ]
  },
  {
    "from": "Pending",
    "event": "COMPLETE",
    "to": "Done",
    "effects": [
      ["persist", "update", "Task", "@entity"],
      ["notify", "success", "Task completed!"]
    ]
  }
]
```

---

## Step 3 — Build the Trait

Wrap the state machine in a trait with `name`, `linkedEntity`, and `category`:

```json
{
  "name": "TaskLifecycle",
  "linkedEntity": "Task",
  "category": "interaction",
  "stateMachine": {
    "states": [
      { "name": "Pending", "isInitial": true },
      { "name": "Done", "isTerminal": true }
    ],
    "events": [
      { "key": "INIT", "name": "Initialize" },
      { "key": "COMPLETE", "name": "Complete Task" }
    ],
    "transitions": [
      {
        "from": "Pending",
        "event": "INIT",
        "to": "Pending",
        "effects": [
          ["fetch", "Task"],
          ["render-ui", "main", {
            "type": "entity-table",
            "entity": "Task",
            "columns": ["title", "status"],
            "itemActions": [
              { "event": "COMPLETE", "label": "Complete" }
            ]
          }]
        ]
      },
      {
        "from": "Pending",
        "event": "COMPLETE",
        "to": "Done",
        "effects": [
          ["persist", "update", "Task", "@entity"],
          ["notify", "success", "Task completed!"]
        ]
      }
    ]
  }
}
```

**`category`** can be:
- `interaction` — has UI, fires `render-ui` effects
- `integration` — backend service calls, no UI

---

## Step 4 — Add Pages

Pages bind traits to URL routes. This is the part most often missing.

```json
"pages": [
  {
    "name": "TaskListPage",
    "path": "/tasks",
    "traits": [
      { "ref": "TaskLifecycle", "linkedEntity": "Task" }
    ]
  }
]
```

- `path` is the URL route (supports `:id` params, e.g. `/tasks/:id`)
- `traits[].ref` references a trait by name defined in the same orbital
- `traits[].linkedEntity` tells the runtime which entity to bind

---

## The Complete Orbital

Putting it all together — a fully working `TaskManager` orbital:

```json
{
  "name": "TaskManager",
  "orbitals": [
    {
      "name": "Tasks",
      "entity": {
        "name": "Task",
        "persistence": "persistent",
        "collection": "tasks",
        "fields": [
          { "name": "id", "type": "string", "required": true },
          { "name": "title", "type": "string", "required": true },
          { "name": "status", "type": "enum", "values": ["pending", "done"], "default": "pending" }
        ]
      },
      "traits": [
        {
          "name": "TaskLifecycle",
          "linkedEntity": "Task",
          "category": "interaction",
          "stateMachine": {
            "states": [
              { "name": "Pending", "isInitial": true },
              { "name": "Done", "isTerminal": true }
            ],
            "events": [
              { "key": "INIT", "name": "Initialize" },
              { "key": "COMPLETE", "name": "Complete Task" }
            ],
            "transitions": [
              {
                "from": "Pending",
                "event": "INIT",
                "to": "Pending",
                "effects": [
                  ["fetch", "Task"],
                  ["render-ui", "main", {
                    "type": "entity-table",
                    "entity": "Task",
                    "columns": ["title", "status"],
                    "itemActions": [
                      { "event": "COMPLETE", "label": "Complete" }
                    ]
                  }]
                ]
              },
              {
                "from": "Pending",
                "event": "COMPLETE",
                "to": "Done",
                "effects": [
                  ["persist", "update", "Task", "@entity"],
                  ["notify", "success", "Task completed!"]
                ]
              }
            ]
          }
        }
      ],
      "pages": [
        {
          "name": "TaskListPage",
          "path": "/tasks",
          "traits": [
            { "ref": "TaskLifecycle", "linkedEntity": "Task" }
          ]
        }
      ]
    }
  ]
}
```

---

## Common Mistakes

### Missing `pages`

```json
// ❌ Incomplete — nothing renders at any route
{
  "name": "Tasks",
  "entity": { ... },
  "traits": [ { "name": "TaskLifecycle", ... } ]
}

// ✅ Complete — trait is mounted at /tasks
{
  "name": "Tasks",
  "entity": { ... },
  "traits": [ { "name": "TaskLifecycle", ... } ],
  "pages": [
    { "name": "TaskListPage", "path": "/tasks", "traits": [{ "ref": "TaskLifecycle", "linkedEntity": "Task" }] }
  ]
}
```

### States as strings (invalid)

```json
// ❌ Wrong format
"states": ["Pending", "Done"]

// ✅ States must be objects
"states": [
  { "name": "Pending", "isInitial": true },
  { "name": "Done", "isTerminal": true }
]
```

### Missing INIT transition

```json
// ❌ Page opens but is blank — no initial render-ui
"transitions": [
  { "from": "Pending", "event": "COMPLETE", "to": "Done", "effects": [...] }
]

// ✅ Add a self-loop on INIT to render the initial UI
"transitions": [
  {
    "from": "Pending", "event": "INIT", "to": "Pending",
    "effects": [["fetch", "Task"], ["render-ui", "main", { "type": "entity-table", "entity": "Task" }]]
  },
  { "from": "Pending", "event": "COMPLETE", "to": "Done", "effects": [...] }
]
```

---

## Next Steps

- [Build a Task Manager](./task-manager.md) — add full CRUD to this pattern
- [UI Patterns & render-ui](../intermediate/ui-patterns.md) — explore all pattern types
- [Guards & Business Rules](../intermediate/guards.md) — add conditions to transitions
