---
slug: real-cost-of-boilerplate
title: "From 10,000 Lines to 200: The Real Cost of Boilerplate"
authors: [osamah]
tags: [startups, productivity, tutorial]
---
import { AvlOrbitalUnit } from '@almadar/ui/illustrations';

You want to build a task manager. Simple CRUD: create, read, update, delete. The traditional way costs you roughly 5,000 lines across 40+ files. The .orb way: 120 lines in one file. This is not a theoretical estimate. Let's count both sides.

<!-- truncate -->

## The Traditional Stack

A task manager built with React, Express, and PostgreSQL breaks down like this:

**Frontend** (roughly 2,600 lines): TypeScript interfaces, API client functions, React Query hooks for each mutation, list/form/detail/modal components, a Redux or Zustand store, route setup, CSS, and tests.

**Backend** (roughly 1,600 lines): Prisma model, Express routes, controller logic, auth middleware, validation middleware, service layer, migration files, API tests, and config.

**Infrastructure** (roughly 800 lines): Docker Compose, CI workflow, README, shared types, error utilities, logger.

Grand total: around 5,000 lines for what users see as "a simple task manager." And this version has no pagination, no search filters, no optimistic updates.

## The .orb Version: 120 Lines

One file defines the entity, the state machine, the UI patterns, and the routes:

<div style={{margin: '2rem 0'}}>
<AvlOrbitalUnit
  entityName="Task"
  fields={6}
  traits={[{name: "TaskInteraction"}]}
  pages={[{name: "/tasks"}]}
  animated
/>
</div>

```json
{
  "name": "Taskly",
  "orbitals": [{
    "entity": {
      "name": "Task",
      "collection": "tasks",
      "fields": [
        { "name": "title", "type": "string", "required": true },
        { "name": "description", "type": "string" },
        { "name": "status", "type": "enum", "values": ["todo", "in-progress", "done"] },
        { "name": "priority", "type": "enum", "values": ["low", "medium", "high"] },
        { "name": "assignee", "type": "string" },
        { "name": "dueDate", "type": "date" }
      ]
    },
    "traits": [{
      "name": "TaskInteraction",
      "linkedEntity": "Task",
      "stateMachine": {
        "states": [
          { "name": "Browsing", "isInitial": true },
          { "name": "Creating" },
          { "name": "Editing" },
          { "name": "Deleting" }
        ],
        "transitions": [
          {
            "from": "Browsing", "to": "Browsing", "event": "INIT",
            "effects": [
              ["render-ui", "main", {
                "type": "entity-table", "entity": "Task",
                "columns": ["title", "status", "priority", "assignee", "dueDate"]
              }]
            ]
          },
          {
            "from": "Browsing", "to": "Creating", "event": "CREATE",
            "effects": [
              ["render-ui", "modal", {
                "type": "form-section", "entity": "Task",
                "fields": ["title", "description", "status", "priority"],
                "submitEvent": "SAVE", "cancelEvent": "CANCEL"
              }]
            ]
          },
          {
            "from": "Creating", "to": "Browsing", "event": "SAVE",
            "effects": [
              ["persist", "create", "Task", "@payload.data"],
              ["render-ui", "modal", null],
              ["emit", "INIT"]
            ]
          },
          {
            "from": "Creating", "to": "Browsing", "event": "CANCEL",
            "effects": [["render-ui", "modal", null]]
          }
        ]
      }
    }],
    "pages": [{ "name": "TasksPage", "path": "/tasks" }]
  }]
}
```

Compile and run:

```bash
orbital compile taskly.orb --shell typescript -o taskly-app/
cd taskly-app && npm install && npm run dev
```

This generates React components with table, forms, and delete confirmation. Express backend with CRUD endpoints. Database models. TypeScript types shared across frontend and backend. State management via event bus. Route handling.

## The Maintenance Multiplier

Lines of code are not just a development cost. They are a maintenance tax that compounds over time.

| Metric | Traditional (5,000 lines) | .orb (120 lines) |
|--------|---------------------------|-------------------|
| Bug surface area | 5,000 potential locations | 120 potential locations |
| Onboarding time | Days to weeks | Hours |
| Change propagation | Touch 7+ files per rename | Edit one field, recompile |
| Test coverage needed | 1,000+ test lines | Schema validation + smoke tests |

When you rename a field in the traditional version, you update the database model, the Prisma schema, the TypeScript interface, the API endpoint, the form component, the table component, the detail component, and the tests. Seven places for one rename.

In .orb, you change it in the entity definition. One place. Run `orbital compile`. Done.

## What You Trade

.orb is not magic. You give up pixel-perfect custom UI (generated components follow patterns, though custom design systems are supported). You give up unusual data access patterns that fall outside standard CRUD. You give up direct control over generated code (you fix the schema, the compiler, or the shell template, never the output).

For most business applications with forms, tables, modals, and CRUD workflows, those tradeoffs pay for themselves many times over.

## The Bottom Line

A 120-line .orb program that generates a 5,000-line application means 40x less code to maintain, 40x smaller bug surface, 40x faster onboarding, and one place to change instead of seven.

The real question is not "can I write 5,000 lines?" It is "do I want to maintain them for the next 5 years?"

Start with the [Getting Started guide](https://orb.almadar.io/docs/getting-started/introduction).
