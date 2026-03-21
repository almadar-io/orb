---
slug: schema-first-development
title: "Schema-First Development: Why We Write JSON Before TypeScript"
authors: [osamah]
tags: [architecture, tutorial]
image: /img/blog/schema-first-development.png
---
import { AvlOrbitalUnit } from '@almadar/ui/illustrations';

What if you defined your entire application in a single file before writing any component code? Not just the database model, but the state machines, the UI structure, the routes, and the business rules. That is how .orb works: write the schema, validate it, compile it, run it.

<!-- truncate -->

## The Traditional Flow vs. Schema-First

Most frontend development follows this path: design mockups, create components, define TypeScript interfaces, add state management, connect to the backend, discover that the API does not match your types, refactor everything. It is iterative, exploratory, and full of mismatches.

Schema-first inverts it:

1. **Define** the .orb program (entities, traits, pages)
2. **Validate** it (`orbital validate`)
3. **Compile** it (`orbital compile`)
4. **Run** it immediately

The .orb file becomes the single source of truth for your entire application.

## What Goes in a .orb Program

A single .orb file contains the data model, business logic, UI structure, and routes:

<div style={{margin: '2rem 0'}}>
<AvlOrbitalUnit
  entityName="Task"
  fields={4}
  traits={[{name: "TaskBrowser"}]}
  pages={[{name: "/tasks"}]}
  animated
/>
</div>

```json
{
  "name": "TaskApp",
  "orbitals": [{
    "entity": {
      "name": "Task",
      "fields": [
        { "name": "title", "type": "string", "required": true },
        { "name": "status", "type": "enum", "values": ["todo", "in-progress", "done"] },
        { "name": "assigneeId", "type": "relation", "relation": { "entity": "User" } }
      ]
    },
    "traits": [{
      "name": "TaskBrowser",
      "linkedEntity": "Task",
      "stateMachine": {
        "states": [
          { "name": "Browsing", "isInitial": true },
          { "name": "Creating" }
        ],
        "transitions": [
          {
            "from": "Browsing", "to": "Browsing", "event": "INIT",
            "effects": [
              ["render-ui", "main", { "type": "entity-table", "entity": "Task", "columns": ["title", "status"] }]
            ]
          },
          {
            "from": "Browsing", "to": "Creating", "event": "CREATE",
            "effects": [
              ["render-ui", "modal", { "type": "form-section", "entity": "Task", "fields": ["title", "status"], "submitEvent": "SAVE", "cancelEvent": "CANCEL" }]
            ]
          },
          {
            "from": "Creating", "to": "Browsing", "event": "SAVE",
            "effects": [["persist", "create", "Task", "@payload.data"], ["render-ui", "modal", null], ["emit", "INIT"]]
          },
          {
            "from": "Creating", "to": "Browsing", "event": "CANCEL",
            "effects": [["render-ui", "modal", null]]
          }
        ]
      }
    }],
    "pages": [{ "name": "TaskListPage", "path": "/tasks" }]
  }]
}
```

That one file specifies the data model (entity with fields), business logic (state machine with transitions), UI structure (`render-ui` effects referencing patterns), and routes (pages with paths).

## The Validation Safety Net

Before generating any code, `orbital validate` checks your program:

```bash
$ orbital validate task-app.orb

✓ Schema structure valid
✓ Entity fields valid
✓ State machine complete
✓ All transitions have handlers
✓ Pattern props match registry
✓ Closed circuit verified
```

If a state renders to a modal but has no exit transition, the validator catches it:

```
✗ Error: CIRCUIT_NO_OVERLAY_EXIT
  State 'Creating' renders to 'modal' slot but has no exit transition.
  Fix: Add a transition from 'Creating' with event 'CANCEL' or 'CLOSE'
```

This catches bugs before any code exists. The validator enforces closed circuits (every modal has an exit), emission contracts (every emitted event has a listener), binding validity (every `@entity.field` reference exists on the entity), and unreachable state detection.

## Compile to Any Target

Once validated, compile to your target language:

```bash
orbital compile task-app.orb --shell typescript -o output/
orbital compile task-app.orb --shell python -o output/
orbital compile task-app.orb --shell rust -o output/
```

Each target generates frontend components, backend API routes, shared types, state management, and database models. Same .orb program, different output.

## The "Never Edit Generated Code" Rule

You do not edit the generated files. If you need changes, edit the .orb program and recompile. This guarantees consistency (schema and code always match), reproducibility (same schema produces identical output), and portability (compile to different targets from one source).

## When Schema-First Works Best

Schema-first development excels for new products (start with structure, iterate quickly), scaling teams (the .orb file is readable by PMs, designers, and developers), multi-platform targets (one program generates web, mobile, desktop), regulated industries (the schema is an auditable specification), and AI-assisted development (LLMs are excellent at generating structured JSON).

Ready to write your first .orb program? Check out the [Getting Started guide](https://orb.almadar.io/docs/getting-started/introduction).
