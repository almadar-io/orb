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
    {name: 'idle', isInitial: true},
    {name: 'loading'},
    {name: 'active'},
    {name: 'error', isTerminal: true}
  ]}
  transitions={[
    {from: 'idle', to: 'loading', event: 'INIT'},
    {from: 'loading', to: 'active', event: 'LOADED', effects: ['render-ui']},
    {from: 'loading', to: 'error', event: 'ERROR'},
    {from: 'active', to: 'loading', event: 'REFRESH'},
    {from: 'error', to: 'loading', event: 'RETRY'}
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

Here is a complete orbital with a single trait that manages a list of notes. The trait has three states: listing notes, creating a new note, and viewing a note. Every transition includes effects that render the appropriate UI and persist changes.

<OrbPreviewBlock title="Note Manager: basic trait with CRUD states" schema={`{
  "name": "note-manager",
  "app": {
    "name": "note-manager",
    "title": "Note Manager"
  },
  "orbitals": [
    {
      "name": "NoteManager",
      "entity": {
        "name": "Note",
        "persistence": "runtime",
        "fields": [
          {
            "name": "id",
            "type": "string",
            "required": true
          },
          {
            "name": "title",
            "type": "string",
            "required": true
          },
          {
            "name": "body",
            "type": "string"
          },
          {
            "name": "status",
            "type": "enum",
            "values": [
              "draft",
              "published"
            ],
            "default": "draft"
          },
          {
            "name": "createdAt",
            "type": "datetime"
          }
        ]
      },
      "traits": [
        {
          "name": "NoteLifecycle",
          "linkedEntity": "Note",
          "category": "interaction",
          "stateMachine": {
            "states": [
              {
                "name": "listing",
                "isInitial": true
              },
              {
                "name": "creating"
              },
              {
                "name": "viewing"
              }
            ],
            "events": [
              {
                "key": "INIT",
                "name": "Initialize"
              },
              {
                "key": "NEW",
                "name": "New Note"
              },
              {
                "key": "SAVE",
                "name": "Save",
                "payload": [
                  {
                    "name": "title",
                    "type": "string",
                    "required": true
                  },
                  {
                    "name": "body",
                    "type": "string"
                  }
                ]
              },
              {
                "key": "VIEW",
                "name": "View Note"
              },
              {
                "key": "BACK",
                "name": "Back to List"
              }
            ],
            "transitions": [
              {
                "from": "listing",
                "to": "listing",
                "event": "INIT",
                "effects": [
                  [
                    "fetch",
                    "Note"
                  ],
                  [
                    "render-ui",
                    "main",
                    {
                      "type": "stack",
                      "direction": "vertical",
                      "gap": "md",
                      "children": [
                        {
                          "type": "typography",
                          "content": "Notes",
                          "variant": "h2"
                        },
                        {
                          "type": "data-list",
                          "entity": "Note",
                          "fields": [
                            "title",
                            "status",
                            "createdAt"
                          ],
                          "itemActions": [
                            {
                              "event": "VIEW",
                              "label": "View"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                ]
              },
              {
                "from": "listing",
                "to": "creating",
                "event": "NEW",
                "effects": [
                  [
                    "render-ui",
                    "main",
                    {
                      "type": "form-section",
                      "entity": "Note",
                      "fields": [
                        "title",
                        "body"
                      ],
                      "submitEvent": "SAVE",
                      "cancelEvent": "BACK"
                    }
                  ]
                ]
              },
              {
                "from": "creating",
                "to": "listing",
                "event": "SAVE",
                "effects": [
                  [
                    "persist",
                    "create",
                    "Note",
                    "@payload"
                  ],
                  [
                    "notify",
                    "Note created",
                    "success"
                  ],
                  [
                    "fetch",
                    "Note"
                  ],
                  [
                    "render-ui",
                    "main",
                    {
                      "type": "stack",
                      "direction": "vertical",
                      "gap": "md",
                      "children": [
                        {
                          "type": "typography",
                          "content": "Notes",
                          "variant": "h2"
                        },
                        {
                          "type": "data-list",
                          "entity": "Note",
                          "fields": [
                            "title",
                            "status",
                            "createdAt"
                          ]
                        }
                      ]
                    }
                  ]
                ]
              },
              {
                "from": "creating",
                "to": "listing",
                "event": "BACK",
                "effects": [
                  [
                    "fetch",
                    "Note"
                  ],
                  [
                    "render-ui",
                    "main",
                    {
                      "type": "stack",
                      "direction": "vertical",
                      "gap": "md",
                      "children": [
                        {
                          "type": "typography",
                          "content": "Notes",
                          "variant": "h2"
                        },
                        {
                          "type": "data-list",
                          "entity": "Note",
                          "fields": [
                            "title",
                            "status",
                            "createdAt"
                          ]
                        }
                      ]
                    }
                  ]
                ]
              },
              {
                "from": "listing",
                "to": "viewing",
                "event": "VIEW",
                "effects": [
                  [
                    "fetch",
                    "Note"
                  ],
                  [
                    "render-ui",
                    "main",
                    {
                      "type": "detail-panel",
                      "entity": "Note",
                      "fields": [
                        "title",
                        "body",
                        "status",
                        "createdAt"
                      ],
                      "actions": [
                        {
                          "event": "BACK",
                          "label": "Back"
                        }
                      ]
                    }
                  ]
                ]
              },
              {
                "from": "viewing",
                "to": "listing",
                "event": "BACK",
                "effects": [
                  [
                    "fetch",
                    "Note"
                  ],
                  [
                    "render-ui",
                    "main",
                    {
                      "type": "stack",
                      "direction": "vertical",
                      "gap": "md",
                      "children": [
                        {
                          "type": "typography",
                          "content": "Notes",
                          "variant": "h2"
                        },
                        {
                          "type": "data-list",
                          "entity": "Note",
                          "fields": [
                            "title",
                            "status",
                            "createdAt"
                          ]
                        }
                      ]
                    }
                  ]
                ]
              }
            ]
          }
        }
      ],
      "pages": [
        {
          "name": "NotesPage",
          "path": "/notes",
          "traits": [
            {
              "ref": "NoteLifecycle",
              "linkedEntity": "Note"
            }
          ]
        }
      ]
    }
  ]
}`} />

---

## Guards and Multiple Effects in Practice

This example demonstrates a more complex trait with compound guards and multiple effects per transition. An approval workflow where only managers can approve items above a certain value, and rejected items get a reason logged.

<OrbPreviewBlock title="Approval Workflow: guards, persist, set effects" schema={`{
  "name": "approval-system",
  "app": {
    "name": "approval-system",
    "title": "Approval System"
  },
  "orbitals": [
    {
      "name": "ApprovalWorkflow",
      "entity": {
        "name": "Request",
        "persistence": "runtime",
        "fields": [
          {
            "name": "id",
            "type": "string",
            "required": true
          },
          {
            "name": "title",
            "type": "string",
            "required": true
          },
          {
            "name": "amount",
            "type": "number",
            "required": true
          },
          {
            "name": "status",
            "type": "enum",
            "values": [
              "pending",
              "approved",
              "rejected"
            ],
            "default": "pending"
          },
          {
            "name": "submittedBy",
            "type": "string"
          },
          {
            "name": "reviewedBy",
            "type": "string"
          },
          {
            "name": "rejectionReason",
            "type": "string",
            "default": ""
          },
          {
            "name": "reviewedAt",
            "type": "datetime"
          }
        ]
      },
      "traits": [
        {
          "name": "ApprovalFlow",
          "linkedEntity": "Request",
          "category": "interaction",
          "stateMachine": {
            "states": [
              {
                "name": "pending",
                "isInitial": true
              },
              {
                "name": "reviewing"
              },
              {
                "name": "approved",
                "isTerminal": true
              },
              {
                "name": "rejected",
                "isTerminal": true
              }
            ],
            "events": [
              {
                "key": "INIT",
                "name": "Initialize"
              },
              {
                "key": "REVIEW",
                "name": "Start Review"
              },
              {
                "key": "APPROVE",
                "name": "Approve"
              },
              {
                "key": "REJECT",
                "name": "Reject",
                "payload": [
                  {
                    "name": "reason",
                    "type": "string",
                    "required": true
                  }
                ]
              },
              {
                "key": "BACK",
                "name": "Back"
              }
            ],
            "transitions": [
              {
                "from": "pending",
                "to": "pending",
                "event": "INIT",
                "effects": [
                  [
                    "fetch",
                    "Request",
                    {
                      "status": "pending"
                    }
                  ],
                  [
                    "render-ui",
                    "main",
                    {
                      "type": "stack",
                      "direction": "vertical",
                      "gap": "md",
                      "children": [
                        {
                          "type": "typography",
                          "content": "Requests",
                          "variant": "h2"
                        },
                        {
                          "type": "data-list",
                          "entity": "Request",
                          "fields": [
                            "title",
                            "amount",
                            "status",
                            "submittedBy"
                          ],
                          "itemActions": [
                            {
                              "event": "REVIEW",
                              "label": "Review"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                ]
              },
              {
                "from": "pending",
                "to": "reviewing",
                "event": "REVIEW",
                "effects": [
                  [
                    "fetch",
                    "Request"
                  ],
                  [
                    "render-ui",
                    "main",
                    {
                      "type": "detail-panel",
                      "entity": "Request",
                      "fields": [
                        "title",
                        "amount",
                        "submittedBy"
                      ],
                      "actions": [
                        {
                          "event": "APPROVE",
                          "label": "Approve"
                        },
                        {
                          "event": "REJECT",
                          "label": "Reject"
                        },
                        {
                          "event": "BACK",
                          "label": "Back"
                        }
                      ]
                    }
                  ]
                ]
              },
              {
                "from": "reviewing",
                "to": "approved",
                "event": "APPROVE",
                "guard": [
                  "and",
                  [
                    "!=",
                    "@entity.submittedBy",
                    "@user.id"
                  ],
                  [
                    "or",
                    [
                      "<=",
                      "@entity.amount",
                      1000
                    ],
                    [
                      "=",
                      "@user.role",
                      "manager"
                    ]
                  ]
                ],
                "effects": [
                  [
                    "set",
                    "@entity.id",
                    "status",
                    "approved"
                  ],
                  [
                    "set",
                    "@entity.id",
                    "reviewedBy",
                    "@user.id"
                  ],
                  [
                    "set",
                    "@entity.id",
                    "reviewedAt",
                    "@now"
                  ],
                  [
                    "persist",
                    "update",
                    "Request",
                    "@entity.id",
                    {
                      "status": "approved",
                      "reviewedBy": "@user.id"
                    }
                  ],
                  [
                    "notify",
                    "Request approved",
                    "success"
                  ]
                ]
              },
              {
                "from": "reviewing",
                "to": "rejected",
                "event": "REJECT",
                "guard": [
                  "and",
                  [
                    "!=",
                    "@entity.submittedBy",
                    "@user.id"
                  ],
                  [
                    "!=",
                    "@payload.reason",
                    ""
                  ]
                ],
                "effects": [
                  [
                    "set",
                    "@entity.id",
                    "status",
                    "rejected"
                  ],
                  [
                    "set",
                    "@entity.id",
                    "rejectionReason",
                    "@payload.reason"
                  ],
                  [
                    "set",
                    "@entity.id",
                    "reviewedBy",
                    "@user.id"
                  ],
                  [
                    "set",
                    "@entity.id",
                    "reviewedAt",
                    "@now"
                  ],
                  [
                    "persist",
                    "update",
                    "Request",
                    "@entity.id",
                    {
                      "status": "rejected",
                      "rejectionReason": "@payload.reason"
                    }
                  ],
                  [
                    "notify",
                    "Request rejected",
                    "info"
                  ]
                ]
              },
              {
                "from": "reviewing",
                "to": "pending",
                "event": "BACK",
                "effects": [
                  [
                    "fetch",
                    "Request",
                    {
                      "status": "pending"
                    }
                  ],
                  [
                    "render-ui",
                    "main",
                    {
                      "type": "stack",
                      "direction": "vertical",
                      "gap": "md",
                      "children": [
                        {
                          "type": "typography",
                          "content": "Requests",
                          "variant": "h2"
                        },
                        {
                          "type": "data-list",
                          "entity": "Request",
                          "fields": [
                            "title",
                            "amount",
                            "status",
                            "submittedBy"
                          ]
                        }
                      ]
                    }
                  ]
                ]
              }
            ]
          }
        }
      ],
      "pages": [
        {
          "name": "ApprovalsPage",
          "path": "/approvals",
          "traits": [
            {
              "ref": "ApprovalFlow",
              "linkedEntity": "Request"
            }
          ]
        }
      ]
    }
  ]
}`} />

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
