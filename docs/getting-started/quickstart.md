---
id: quickstart
title: Quickstart
sidebar_label: Quickstart
---

# Quickstart

Build and run a complete application in under 5 minutes. By the end, you will have a working task manager with a data table, create/edit forms, and status management.

## Prerequisites

- `orb` CLI installed ([Installation](./installation.md))
- Node.js 18+ and npm

## 1. Write Your First .orb File

Create a file called `my-app.orb` with the following content:

```json
{
  "app": {
    "name": "my-app",
    "title": "My Task Manager"
  },
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
          { "name": "status", "type": "enum", "values": ["pending", "in_progress", "done"], "default": "pending" }
        ]
      },
      "traits": [
        {
          "name": "TaskCrud",
          "linkedEntity": "Task",
          "category": "interaction",
          "stateMachine": {
            "states": [
              { "name": "Listing", "isInitial": true },
              { "name": "Creating" },
              { "name": "Editing" }
            ],
            "events": [
              { "key": "INIT", "name": "Initialize" },
              { "key": "CREATE", "name": "Create Task" },
              { "key": "EDIT", "name": "Edit Task" },
              { "key": "SAVE", "name": "Save" },
              { "key": "CANCEL", "name": "Cancel" },
              { "key": "DELETE", "name": "Delete Task" }
            ],
            "transitions": [
              {
                "from": "Listing",
                "event": "INIT",
                "to": "Listing",
                "effects": [
                  ["fetch", "Task"],
                  ["render-ui", "main", {
                    "type": "entity-table",
                    "entity": "Task",
                    "columns": ["title", "status"],
                    "actions": [
                      { "event": "CREATE", "label": "New Task", "icon": "plus" }
                    ],
                    "itemActions": [
                      { "event": "EDIT", "label": "Edit" },
                      { "event": "DELETE", "label": "Delete", "variant": "danger" }
                    ]
                  }]
                ]
              },
              {
                "from": "Listing",
                "event": "CREATE",
                "to": "Creating",
                "effects": [
                  ["render-ui", "modal", {
                    "type": "entity-form",
                    "entity": "Task",
                    "fields": ["title", "description", "status"],
                    "submitEvent": "SAVE",
                    "cancelEvent": "CANCEL"
                  }]
                ]
              },
              {
                "from": "Creating",
                "event": "SAVE",
                "to": "Listing",
                "effects": [
                  ["persist", "create", "Task", "@payload"],
                  ["notify", "success", "Task created"]
                ]
              },
              {
                "from": "Creating",
                "event": "CANCEL",
                "to": "Listing"
              },
              {
                "from": "Listing",
                "event": "EDIT",
                "to": "Editing",
                "effects": [
                  ["render-ui", "modal", {
                    "type": "entity-form",
                    "entity": "Task",
                    "fields": ["title", "description", "status"],
                    "submitEvent": "SAVE",
                    "cancelEvent": "CANCEL"
                  }]
                ]
              },
              {
                "from": "Editing",
                "event": "SAVE",
                "to": "Listing",
                "effects": [
                  ["persist", "update", "Task", "@entity"],
                  ["notify", "success", "Task updated"]
                ]
              },
              {
                "from": "Editing",
                "event": "CANCEL",
                "to": "Listing"
              },
              {
                "from": "Listing",
                "event": "DELETE",
                "to": "Listing",
                "effects": [
                  ["persist", "delete", "Task", "@entity.id"],
                  ["notify", "success", "Task deleted"]
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
            { "ref": "TaskCrud", "linkedEntity": "Task" }
          ]
        }
      ]
    }
  ]
}
```

This single file defines the full application: a `Task` entity with four fields, a `TaskCrud` trait with list/create/edit/delete flows, and a page that wires it to the `/tasks` route.

## 2. Validate

Check that the program is correct before compiling:

```bash
orb validate my-app.orb
```

You should see output confirming zero errors and zero warnings. If there are issues, the validator prints the exact location and a description of each problem.

## 3. Compile

Generate the full-stack TypeScript application:

```bash
orb compile my-app.orb --shell typescript
```

This creates a `my-app/` directory containing the generated React frontend, Express backend, and shared types.

## 4. Install Dependencies

```bash
cd my-app
npm install
```

## 5. Run the Dev Server

```bash
npm run dev
```

This starts both the frontend (Vite) and backend (Express) in development mode.

## 6. Open in Browser

Navigate to [http://localhost:5173](http://localhost:5173). You will see:

- A data table for tasks (initially empty)
- A "New Task" button that opens a form in a modal
- Edit and Delete actions on each row
- Toast notifications on create, update, and delete

Try creating a few tasks, editing one, and deleting another. The full CRUD lifecycle works out of the box from the state machine you defined.

## What You Just Built

From a single `.orb` file, the compiler generated:

- **React components** for the entity table, form modal, and page layout
- **Express API routes** for CRUD operations on the Task entity
- **Shared TypeScript types** for the Task entity, used by both client and server
- **State machine logic** that drives the UI transitions (Listing, Creating, Editing states)
- **Mock data layer** so the app works immediately without a database

Every button click, form submission, and table action follows the closed-circuit pattern: Event, Guard, Transition, Effects, UI Response. The state machine in your `.orb` file controls the entire flow.

## Next Steps

- [Project Structure](./project-structure.md) to understand what was generated
- [Core Concepts: Entities](/docs/en/core-concepts/entities) to learn about entity types and fields
- [Core Concepts: Traits](/docs/en/core-concepts/traits) for a deep dive into state machines
- [Build a Task Manager (Tutorial)](/docs/tutorials/beginner/task-manager) for a more detailed walkthrough with multiple traits
