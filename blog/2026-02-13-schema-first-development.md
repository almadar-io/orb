---
slug: schema-first-development
title: "Schema-First Development: Why We Write JSON Before TypeScript"
authors: [osamah]
tags: [architecture, tutorial]
image: /img/blog/schema-first-development.png
---

![Schema-First Development: The Blueprint That Becomes the Building](/img/blog/schema-first-development.png)

What if you defined your entire application in a single JSON file before writing any component code?

<!-- truncate -->

<OrbitalDiagram />

## The Traditional Flow

Most frontend development looks like this:

1. Design the UI mockups
2. Create component hierarchy
3. Define TypeScript interfaces
4. Build components
5. Add state management
6. Connect to backend
7. Realize the API doesn't match your types
8. Refactor everything

It's iterative, exploratory, and often leads to mismatches between frontend and backend.

## The Schema-First Alternative

Almadar inverts this flow:

1. **Define the schema** — Entities, traits, pages, state machines
2. **Validate it** — Catch errors before writing code
3. **Compile it** — Generate TypeScript, Python, or Rust
4. **Run it** — See it working immediately
5. **Customize** — Add business logic where needed

The schema becomes the **single source of truth** for your entire application.

## What Goes In a Schema?

An Almadar schema (`.orb` file) contains:

```json
{
  "name": "TaskApp",
  "version": "1.0.0",
  "orbitals": [
    {
      "name": "TaskManagement",
      "entity": {
        "name": "Task",
        "collection": "tasks",
        "fields": [
          { "name": "id", "type": "string", "required": true, "primaryKey": true },
          { "name": "title", "type": "string", "required": true },
          { "name": "status", "type": "enum", "values": ["todo", "in-progress", "done"] },
          { "name": "assigneeId", "type": "relation", "relation": { "entity": "User" } }
        ]
      },
      "traits": [
        {
          "name": "TaskBrowser",
          "linkedEntity": "Task",
          "stateMachine": {
            "states": [
              { "name": "Browsing", "isInitial": true },
              { "name": "Creating" },
              { "name": "Editing" }
            ],
            "events": [
                      { "key": "INIT", "name": "Initialize" },
                      { "key": "CREATE", "name": "Create" },
                      { "key": "EDIT", "name": "Edit" },
                      { "key": "SAVE", "name": "Save" },
                      { "key": "CANCEL", "name": "Cancel" }
                    ],
            "transitions": [
              {
                "from": "Browsing",
                "to": "Browsing",
                "event": "INIT",
                "effects": [
                  ["render-ui", "main", {
                    "type": "page-header",
                    "title": "Tasks",
                    "actions": [{ "label": "New Task", "event": "CREATE" }]
                  }],
                  ["render-ui", "main", {
                    "type": "entity-table",
                    "entity": "Task",
                    "columns": ["title", "status"],
                    "itemActions": [
                      { "label": "Edit", "event": "EDIT" }
                    ]
                  }]
                ]
              },
              {
                "from": "Browsing",
                "to": "Creating",
                "event": "CREATE",
                "effects": [
                  ["render-ui", "modal", {
                    "type": "form-section",
                    "entity": "Task",
                    "fields": ["title", "status"],
                    "submitEvent": "SAVE",
                    "cancelEvent": "CANCEL"
                  }]
                ]
              },
              {
                "from": "Creating",
                "to": "Browsing",
                "event": "SAVE",
                "effects": [
                  ["persist", "create", "Task", "@payload.data"],
                  ["render-ui", "modal", null],
                  ["emit", "INIT"]
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
          "traits": [{ "ref": "TaskBrowser" }]
        }
      ]
    }
  ]
}
```

This single file defines:
- **Data model** (Entity with fields)
- **Business logic** (State machine with transitions)
- **UI structure** (render-ui effects with patterns)
- **Routes** (Pages with paths)

## The Validation Safety Net

Before generating code, Almadar validates your schema:

```bash
$ orbital validate task-app.orb

✓ Schema structure valid
✓ Entity fields valid
✓ State machine complete
✓ All transitions have handlers
✓ Pattern props match registry
✓ Closed circuit verified

Validation passed! Ready to compile.
```

If there's an error:

```bash
✗ Error: CIRCUIT_NO_OVERLAY_EXIT
  State 'Creating' renders to 'modal' slot but has no exit transition.
  Users will be stuck in this overlay.
  
  Fix: Add a transition from 'Creating' with event 'CANCEL' or 'CLOSE'
```

This catches bugs **before you write any code**.

## Generating Applications

Once validated, compile to your target:

```bash
# TypeScript/React
orbital compile task-app.orb --shell typescript -o output/

# Python/FastAPI
orbital compile task-app.orb --shell python -o output/

# Rust/Axum
orbital compile task-app.orb --shell rust -o output/
```

Each generates:
- **Frontend**: React components with your state machine
- **Backend**: API routes with database models
- **Types**: Shared TypeScript/Python/Rust types
- **State Management**: Event bus and state transitions

## The "Never Edit Generated Code" Rule

Here's the counter-intuitive part: **you don't edit the generated files**.

If you need changes:
1. Edit the `.orb` schema
2. Recompile
3. The changes flow through

This ensures:
- **Consistency**: Schema and code always match
- **Reproducibility**: Same schema = same output
- **Portability**: Compile to different targets from one source

## Real-World Analogy: Database Schema Migration

If you've used Rails, Django, or Prisma, you know schema-first data modeling:

```ruby
# Rails migration
class CreateTasks < ActiveRecord::Migration
  def change
    create_table :tasks do |t|
      t.string :title
      t.string :status
      t.timestamps
    end
  end
end
```

Almadar extends this idea to the **entire application**:
- Not just database schema
- But also state machines, UI, routes, effects

## When to Use Schema-First

Schema-first development excels when:

| Scenario | Benefit |
|----------|---------|
| **New product** | Start with structure, iterate quickly |
| **Team scaling** | Schema is readable by all (PMs, designers, devs) |
| **Multi-platform** | One schema → web, mobile, desktop |
| **Regulated industries** | Schema = auditable specification |
| **AI-assisted** | LLMs excel at generating structured schemas |

## Try It: Build a Blog in 5 Minutes

Create `blog.orb`:

```json
{
  "name": "Blog",
  "version": "1.0.0",
  "orbitals": [
    {
      "name": "PostManagement",
      "uses": [{ "from": "std/List", "as": "List" }],
      "entity": {
        "name": "Post",
        "fields": [
          { "name": "title", "type": "string", "required": true },
          { "name": "content", "type": "string", "required": true },
          { "name": "published", "type": "boolean", "default": false }
        ]
      },
      "traits": [{ "ref": "List.traits.ListManagement" }],
      "pages": [{ "name": "PostsPage", "path": "/posts" }]
    }
  ]
}
```

Compile and run:
```bash
orbital compile blog.orb --shell typescript -o blog-app/
cd blog-app && npm install && npm run dev
```

You now have a working blog admin panel with list, create, edit, and delete.

## The Takeaway

Schema-first development isn't about removing flexibility — it's about **clarity first, flexibility second**.

By defining your application's structure declaratively:
- You catch errors early
- Your team has a shared, readable specification
- AI assistants can understand and modify your app
- You can target multiple platforms

The schema becomes the **documentation that executes**.

Ready to write your first schema? Check out the [Getting Started guide](https://orb.almadar.io/docs/getting-started/introduction).


