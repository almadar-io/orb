---
id: project-structure
title: Project Structure
sidebar_label: Project Structure
---

# Project Structure

When you run `orb compile my-app.orb --shell typescript`, the compiler generates a complete full-stack application. This page explains what each part of the generated output does and how the pieces fit together.

## Top-Level Layout

```
my-app.orb                  # Your source program (you edit this)
my-app/                     # Generated application (never edit directly)
  packages/
    client/                 # React + Vite frontend
    server/                 # Express backend with mock data
    shared/                 # TypeScript types shared between client and server
  package.json              # Root package.json with workspace config
  tsconfig.json             # Root TypeScript configuration
```

The `.orb` file is your source of truth. The `my-app/` directory is compiler output. This separation is fundamental: you always edit the `.orb` file and recompile. Never edit files inside `my-app/` directly.

## `packages/client/` (Frontend)

The frontend is a React application bundled with Vite.

```
packages/client/
  src/
    App.tsx                 # Root component with route definitions
    main.tsx                # Vite entry point
    features/               # Generated trait components
      TaskCrud.tsx          # State machine component for the TaskCrud trait
    pages/                  # Route page components
      TaskListPage.tsx      # Binds TaskCrud trait to the /tasks route
    components/
      traits/               # Trait-specific UI fragments
        TaskCrud/
          Listing.tsx       # UI for the Listing state
          Creating.tsx      # UI for the Creating state
          Editing.tsx       # UI for the Editing state
  index.html
  vite.config.ts
  tsconfig.json
```

**Key files:**

- **`App.tsx`** defines all routes. Each page from your `.orb` file becomes a `<Route>` entry. This is where the page paths (`/tasks`, `/tasks/:id`, etc.) map to page components.

- **`features/`** contains one file per trait. Each feature component implements the state machine: it tracks the current state, dispatches events, evaluates guards, runs effects, and renders the appropriate UI. This is the runtime engine for your trait's behavior.

- **`pages/`** contains one file per page. Page components are thin wrappers that mount the traits declared in the page definition. A page with two traits will import and render both feature components.

- **`components/traits/`** contains the UI fragments for each state. When a trait's state machine is in the "Listing" state, the `Listing.tsx` component renders. When it transitions to "Creating", the `Creating.tsx` component renders. These are generated from the `render-ui` effects in your transitions.

## `packages/server/` (Backend)

The backend is an Express server that provides API routes for entity persistence.

```
packages/server/
  src/
    index.ts                # Server entry point (Express app setup)
    routes/
      tasks.ts              # CRUD routes for the Task entity
    data/
      mock.ts               # In-memory mock data store
  tsconfig.json
  package.json
```

**Key files:**

- **`routes/`** has one file per persistent entity. The compiler generates standard REST endpoints: `GET /api/tasks`, `POST /api/tasks`, `PUT /api/tasks/:id`, `DELETE /api/tasks/:id`. These correspond to the `["persist", ...]` effects in your traits.

- **`data/mock.ts`** provides an in-memory data store so the app works immediately without any database setup. For production, you replace this with a real database adapter (Firestore, PostgreSQL, etc.).

## `packages/shared/` (Shared Types)

```
packages/shared/
  src/
    index.ts                # Re-exports all types
    entities/
      Task.ts               # TypeScript interface for the Task entity
    events/
      TaskCrud.ts           # Event type definitions for the TaskCrud trait
```

Both the client and server import types from this package. When you add a field to an entity in your `.orb` file, the shared type updates on recompile, keeping client and server in sync automatically.

## The Recompile Workflow

When you change your `.orb` file, recompile to regenerate the application:

```bash
# Edit your .orb file
# Then:
orb compile my-app.orb --shell typescript

# If the dev server is running, it picks up changes via Vite hot reload
# Otherwise, restart:
cd my-app && npm run dev
```

The compiler overwrites the generated files on each run. Any manual edits to files inside `my-app/` will be lost. This is by design: the `.orb` file is the single source of truth for your application's structure and behavior.

**If something looks wrong in the generated code**, the fix is almost always in the `.orb` file. Change the entity fields, adjust the state machine transitions, update the `render-ui` pattern props, then recompile.

## How the Pieces Connect

```
.orb file
  |
  |-- entity "Task"
  |     |-- packages/shared/src/entities/Task.ts    (TypeScript interface)
  |     |-- packages/server/src/routes/tasks.ts     (REST API)
  |
  |-- trait "TaskCrud"
  |     |-- packages/client/src/features/TaskCrud.tsx         (state machine)
  |     |-- packages/client/src/components/traits/TaskCrud/   (state UI)
  |     |-- packages/shared/src/events/TaskCrud.ts            (event types)
  |
  |-- page "TaskListPage" at /tasks
        |-- packages/client/src/pages/TaskListPage.tsx  (route component)
        |-- packages/client/src/App.tsx                 (route entry)
```

Each concept in your `.orb` program maps to concrete files across the three packages. The compiler handles the wiring: imports, type references, API calls, and event dispatching are all generated from the relationships you declared.

## Next Steps

- [Core Concepts: Entities](/docs/en/core-concepts/entities) for field types, persistence modes, and relations
- [Core Concepts: Traits](/docs/en/core-concepts/traits) for state machines, guards, and effects
- [Core Concepts: Pages](/docs/en/core-concepts/pages) for routing and trait composition
