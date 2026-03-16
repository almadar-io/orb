---
id: introduction
title: Introduction to Almadar
sidebar_label: Introduction
---
# Introduction to Almadar

> **The Physics of Software**: Natural Language → Schema → Production Application

## What is Almadar?

Almadar (المدار) is a **declarative programming language** for building full-stack applications. Instead of writing imperative code scattered across frontend and backend, you declare your application as a schema of:

- **Entities** - Your data structures with persistence rules
- **Traits** - Behavior defined as state machines
- **Pages** - Routes with UI bindings

The Almadar compiler transforms this schema into a complete, production-ready application.

<OrbitalDiagram />

## The Problem Almadar Solves

### Traditional Development

```
Frontend Team          Backend Team          Database Team
     |                      |                      |
     v                      v                      v
  React Code    +     Express API    +      Schema/SQL
     |                      |                      |
     v                      v                      v
 Permissions   +    Permissions     +    Constraints
     |                      |                      |
     v                      v                      v
  Testing      +      Testing       +      Testing
```

**Issues:**
- Business logic duplicated across layers
- Permissions scattered in middleware, routes, and queries
- Documentation separate from code
- Testing requires multiple approaches

### Almadar Development

```
Almadar Schema (.orb file)
        |
        v
   almadar compile
        |
        v
Full-Stack Application
  - React Frontend
  - Express Backend  
  - Database Models
  - Permissions
  - Documentation
```

**Benefits:**
- Single source of truth
- Permissions in guards (one place)
- Schema IS documentation
- State machines are inherently testable

## Key Concepts

### 1. Entities

Entities define what your application manages:

```json
{
  "name": "Task",
  "persistence": "persistent",
  "fields": [
    { "name": "title", "type": "string", "required": true },
    { "name": "status", "type": "enum", "values": ["pending", "in_progress", "done"] },
    { "name": "assignee", "type": "relation", "target": "User" },
    { "name": "dueDate", "type": "date" }
  ]
}
```

**Persistence types:**
- `persistent` - Stored in database (Firestore, PostgreSQL)
- `runtime` - In-memory (session-specific)
- `singleton` - Single global instance

### 2. Traits

Traits define how your application behaves using state machines:

```json
{
  "name": "TaskLifecycle",
  "linkedEntity": "Task",
  "category": "interaction",
  "stateMachine": {
    "states": [
      { "name": "Pending", "isInitial": true },
      { "name": "InProgress" },
      { "name": "Done", "isTerminal": true }
    ],
    "events": [
      { "key": "INIT", "name": "Initialize" },
      { "key": "START", "name": "Start Working" },
      { "key": "COMPLETE", "name": "Mark Complete" }
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
            "columns": ["title", "status", "assignee"],
            "itemActions": [
              { "event": "START", "label": "Start" },
              { "event": "COMPLETE", "label": "Complete" }
            ]
          }]
        ]
      },
      {
        "from": "Pending",
        "to": "InProgress",
        "event": "START",
        "guard": ["=", "@entity.assignee", "@currentUser.id"],
        "effects": [
          ["set", "@entity.status", "in_progress"],
          ["persist", "update", "Task", "@entity"]
        ]
      },
      {
        "from": "InProgress",
        "to": "Done",
        "event": "COMPLETE",
        "effects": [
          ["persist", "update", "Task", "@entity"],
          ["notify", "success", "Task completed!"]
        ]
      }
    ]
  }
}
```

**Key insight:** A trait combines behavior (state machine) AND UI (`render-ui` effects).

### 3. Pages

Pages bind traits to URL routes. Every orbital needs at least one page:

```json
{
  "name": "TaskListPage",
  "path": "/tasks",
  "traits": [
    { "ref": "TaskLifecycle", "linkedEntity": "Task" }
  ]
}
```

A complete orbital brings all three parts together:

```json
{
  "name": "TaskManager",
  "entity": {
    "name": "Task",
    "persistence": "persistent",
    "fields": [
      { "name": "title", "type": "string", "required": true },
      { "name": "status", "type": "enum", "values": ["pending", "in_progress", "done"] },
      { "name": "assignee", "type": "string" }
    ]
  },
  "traits": [
    {
      "name": "TaskLifecycle",
      "linkedEntity": "Task",
      "category": "interaction",
      "stateMachine": { "...": "see above" }
    }
  ],
  "pages": [
    {
      "name": "TaskListPage",
      "path": "/tasks",
      "traits": [{ "ref": "TaskLifecycle", "linkedEntity": "Task" }]
    }
  ]
}
```

### 4. S-Expressions

All logic is expressed as arrays:

```json
// Guard: Check conditions
["and",
  ["=", "@entity.status", "pending"],
  [">", "@entity.priority", 3]
]

// Effects: Perform actions
["persist", "update", "Task", "@entity"]
["notify", "success", "Task saved!"]
["navigate", "/tasks"]
```

### 5. The Closed Circuit

Every user action follows this path:

```
1. Event    → User clicks "Complete Task"
2. Guard    → Check: Is user the assignee?
3. Transition → State: InProgress → Done
4. Effects  → Server: Save to DB
             → Client: Show toast, refresh list
5. Response → UI updates with real data
```

## Why "Almadar"?

Almadar (المدار) means "orbit" in Arabic. The name comes from celestial mechanics:

| Physics | Almadar |
|---------|---------|
| Objects in space | Entities (data) |
| Forces cause motion | Events trigger behavior |
| Laws govern motion | Guards control transitions |
| Reactions | Effects |
| Stable orbits | Valid application states |

Just as planets follow predictable paths governed by physical laws, applications built with Almadar follow predictable paths governed by state machines.

## What You'll Build

By the end of this documentation, you'll be able to:

1. **Design schemas** - Model complex applications as entities and traits
2. **Write guards** - Implement fine-grained permissions
3. **Create effects** - Handle server and client-side actions
4. **Connect orbitals** - Build modular, communicating features
5. **Deploy applications** - Go from schema to production

## Next Steps

1. [Install the CLI](../downloads/cli.md) - Get Almadar on your system
2. [Build a Task Manager](/docs/tutorials/beginner/task-manager) - Your first schema
3. [Core Concepts: Entities](/docs/en/core-concepts/entities) - Deep dive into the fundamentals

---

*Ready to revolutionize how you build software? Let's go!*
