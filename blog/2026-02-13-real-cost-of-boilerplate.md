---
slug: real-cost-of-boilerplate
title: "From 10,000 Lines to 200: The Real Cost of Boilerplate"
authors: [osamah]
tags: [startups, productivity, tutorial]
---

You want to build a task manager. Simple CRUD: create, read, update, delete.

The traditional way: 10,000 lines across 50+ files. The Almadar way: 200 lines in one file.

This isn't a theoretical comparison. Let's count.

<!-- truncate -->

<OrbitalDiagram />

## The Traditional Stack: A Line Count Audit

Building a task manager with React + Express + PostgreSQL. Let's count every file you need:

### Frontend (~4,500 lines)

```
src/
  types/Task.ts                    ~30 lines   (interface, enums)
  api/tasks.ts                     ~80 lines   (fetch, create, update, delete)
  hooks/useTasks.ts                ~60 lines   (React Query wrapper)
  hooks/useCreateTask.ts           ~40 lines   (mutation hook)
  hooks/useUpdateTask.ts           ~40 lines   (mutation hook)
  hooks/useDeleteTask.ts           ~35 lines   (mutation hook)
  components/TaskList.tsx           ~120 lines  (table, loading, error, empty)
  components/TaskRow.tsx            ~60 lines   (row with actions)
  components/TaskForm.tsx           ~150 lines  (form with validation)
  components/TaskDetail.tsx         ~100 lines  (detail view)
  components/DeleteConfirm.tsx      ~50 lines   (confirmation modal)
  pages/TasksPage.tsx              ~80 lines   (page layout, routing)
  store/taskSlice.ts               ~120 lines  (Redux slice or Zustand store)
  App.tsx (routing)                ~40 lines   (React Router setup)
  main.tsx                         ~20 lines   (entry point)
```

Plus styling, tests, and configuration:

```
  components/*.css                 ~400 lines  (or Tailwind classes)
  __tests__/TaskList.test.tsx      ~150 lines
  __tests__/TaskForm.test.tsx      ~200 lines
  __tests__/TaskDetail.test.tsx    ~100 lines
  vite.config.ts                   ~30 lines
  tsconfig.json                    ~25 lines
  package.json                     ~40 lines
```

**Frontend total: ~2,000 lines of code + ~500 lines of tests + ~100 lines of config = ~2,600**

### Backend (~3,200 lines)

```
src/
  models/Task.ts                   ~60 lines   (Prisma/TypeORM model)
  routes/tasks.ts                  ~150 lines  (CRUD endpoints)
  controllers/taskController.ts    ~200 lines  (business logic)
  middleware/auth.ts               ~80 lines   (authentication)
  middleware/validation.ts         ~100 lines  (request validation)
  services/taskService.ts          ~150 lines  (database queries)
  types/task.ts                    ~40 lines   (request/response types)
  index.ts                         ~60 lines   (Express setup)
  database/migrations/             ~80 lines   (table creation)
  database/seed.ts                 ~40 lines   (test data)
```

Plus tests and config:

```
  __tests__/tasks.test.ts          ~300 lines  (API tests)
  __tests__/taskService.test.ts    ~200 lines  (unit tests)
  prisma/schema.prisma             ~30 lines
  tsconfig.json                    ~25 lines
  package.json                     ~35 lines
  .env                             ~10 lines
  Dockerfile                       ~20 lines
```

**Backend total: ~960 lines of code + ~500 lines of tests + ~120 lines of config = ~1,580**

### Shared/Infrastructure (~800 lines)

```
  docker-compose.yml               ~40 lines
  .github/workflows/ci.yml         ~80 lines
  README.md                        ~100 lines
  package.json (root)              ~30 lines
  Shared types between FE/BE       ~50 lines
  Error handling utilities          ~80 lines
  Logger setup                     ~40 lines
```

### Grand Total: Traditional Task Manager

| Category | Lines |
|----------|-------|
| Frontend code | 2,000 |
| Frontend tests | 500 |
| Backend code | 960 |
| Backend tests | 500 |
| Config/infra | 920 |
| **Total** | **~4,880** |

And this is the *simple* version. No pagination, no search, no filters, no optimistic updates, no error boundaries. Real-world apps easily hit 10,000+ lines for what users perceive as "a simple task manager."

## The Almadar Version: 120 Lines

```json
{
  "name": "Taskly",
  "version": "1.0.0",
  "orbitals": [{
    "name": "TaskManagement",
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
      "category": "interaction",
      "linkedEntity": "Task",
      "stateMachine": {
        "states": [
          { "name": "Browsing", "isInitial": true },
          { "name": "Creating" },
          { "name": "Viewing" },
          { "name": "Editing" },
          { "name": "Deleting" }
        ],
        "events": [
          { "key": "INIT", "name": "Initialize" },
          { "key": "CREATE", "name": "Create Task" },
          { "key": "VIEW", "name": "View Task" },
          { "key": "EDIT", "name": "Edit Task" },
          { "key": "DELETE", "name": "Delete Task" },
          { "key": "SAVE", "name": "Save" },
          { "key": "CANCEL", "name": "Cancel" },
          { "key": "CONFIRM_DELETE", "name": "Confirm Delete" }
        ],
        "transitions": [
          {
            "from": "Browsing", "to": "Browsing", "event": "INIT",
            "effects": [
              ["render-ui", "main", {
                "type": "page-header",
                "title": "Tasks",
                "actions": [{ "label": "New Task", "event": "CREATE", "variant": "primary" }]
              }],
              ["render-ui", "main", {
                "type": "entity-table",
                "entity": "Task",
                "columns": ["title", "status", "priority", "assignee", "dueDate"],
                "itemActions": [
                  { "label": "View", "event": "VIEW" },
                  { "label": "Edit", "event": "EDIT" },
                  { "label": "Delete", "event": "DELETE" }
                ]
              }]
            ]
          },
          {
            "from": "Browsing", "to": "Creating", "event": "CREATE",
            "effects": [
              ["render-ui", "modal", {
                "type": "form-section",
                "entity": "Task",
                "fields": ["title", "description", "status", "priority", "assignee", "dueDate"],
                "submitEvent": "SAVE",
                "cancelEvent": "CANCEL"
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
          },
          {
            "from": "Browsing", "to": "Viewing", "event": "VIEW",
            "effects": [
              ["render-ui", "modal", {
                "type": "entity-detail",
                "entity": "Task",
                "fields": ["title", "description", "status", "priority", "assignee", "dueDate"],
                "actions": [
                  { "label": "Edit", "event": "EDIT" },
                  { "label": "Close", "event": "CANCEL" }
                ]
              }]
            ]
          },
          {
            "from": "Viewing", "to": "Browsing", "event": "CANCEL",
            "effects": [["render-ui", "modal", null]]
          },
          {
            "from": "Viewing", "to": "Editing", "event": "EDIT",
            "effects": [
              ["render-ui", "modal", {
                "type": "form-section",
                "entity": "Task",
                "fields": ["title", "description", "status", "priority", "assignee", "dueDate"],
                "submitEvent": "SAVE",
                "cancelEvent": "CANCEL"
              }]
            ]
          },
          {
            "from": "Browsing", "to": "Editing", "event": "EDIT",
            "effects": [
              ["render-ui", "modal", {
                "type": "form-section",
                "entity": "Task",
                "fields": ["title", "description", "status", "priority", "assignee", "dueDate"],
                "submitEvent": "SAVE",
                "cancelEvent": "CANCEL"
              }]
            ]
          },
          {
            "from": "Editing", "to": "Browsing", "event": "SAVE",
            "effects": [
              ["persist", "update", "Task", "@entity"],
              ["render-ui", "modal", null],
              ["emit", "INIT"]
            ]
          },
          {
            "from": "Editing", "to": "Browsing", "event": "CANCEL",
            "effects": [["render-ui", "modal", null]]
          },
          {
            "from": "Browsing", "to": "Deleting", "event": "DELETE",
            "effects": [
              ["render-ui", "modal", {
                "type": "page-header",
                "title": "Are you sure you want to delete this task?",
                "actions": [
                  { "label": "Delete", "event": "CONFIRM_DELETE", "variant": "danger" },
                  { "label": "Cancel", "event": "CANCEL" }
                ]
              }]
            ]
          },
          {
            "from": "Deleting", "to": "Browsing", "event": "CONFIRM_DELETE",
            "effects": [
              ["persist", "delete", "Task", "@entity.id"],
              ["render-ui", "modal", null],
              ["emit", "INIT"]
            ]
          },
          {
            "from": "Deleting", "to": "Browsing", "event": "CANCEL",
            "effects": [["render-ui", "modal", null]]
          }
        ]
      }
    }],
    "pages": [{
      "name": "TasksPage",
      "path": "/tasks",
      "traits": [{ "ref": "TaskInteraction" }]
    }]
  }]
}
```

**120 lines.** This generates:

- React frontend with table, forms, detail view, delete confirmation
- Express backend with CRUD API endpoints
- Database models and persistence
- TypeScript types shared between frontend and backend
- State management via event bus
- Route handling

```bash
orbital compile taskly.orb --shell typescript -o taskly-app/
cd taskly-app && npm install && npm run dev
```

## The Maintenance Multiplier

Lines of code aren't just a development cost. They're a **maintenance tax**.

Every line is:
- A line that can have a bug
- A line someone needs to understand during onboarding
- A line that needs updating when requirements change
- A line that needs testing

| Metric | Traditional (4,880 lines) | Almadar (120 lines) |
|--------|--------------------------|---------------------|
| Bug surface area | ~4,880 potential bug locations | ~120 potential bug locations |
| Onboarding time | Days to weeks | Hours |
| Change propagation | Touch frontend + backend + types | Edit schema, recompile |
| Test coverage needed | ~1,000 test lines | Schema validation + smoke tests |

When you change a field name in the traditional version, you update the database model, the Prisma schema, the TypeScript interface, the API endpoint, the form component, the table component, the detail component, and the tests. **Seven places** for one rename.

In Almadar, you change it in the entity definition. One place. Recompile.

## What You Trade

Almadar isn't magic. Here's what you give up:

1. **Custom UI** — Generated components follow patterns. For pixel-perfect designs, you build a custom design system (which Almadar also supports).
2. **Unusual data access patterns** — If your query can't be expressed as standard CRUD, you need custom effects.
3. **Control** — You don't see or edit the generated React components. If the generated code has a bug, you fix the schema, the compiler, or the shell template — not the output.

For most business applications — the kind with forms, tables, modals, and CRUD — these tradeoffs are overwhelmingly worth it.

## The Takeaway

The cost of software isn't writing it. It's maintaining it.

A 120-line schema that generates a 5,000-line application means:
- 40x less code to maintain
- 40x smaller bug surface area
- 40x faster onboarding
- One place to change, not seven

The real question isn't "can I write 5,000 lines?" It's "do I want to maintain them for the next 5 years?"

Start with the [Getting Started guide](https://orb.almadar.io/docs/getting-started/introduction) and see the difference yourself.
