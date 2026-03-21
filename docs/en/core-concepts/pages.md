# Pages

> How pages work in the Orb architecture - routing, trait binding, slots, and navigation.

**Related:**
- [Entities](./entities.md)
- [Traits](./traits.md)

---

## Overview

In Orb, a **Page** is a route that composes traits to render UI. The fundamental composition is:

```
Orbital = Entity + Traits + Pages
```

While [Entities](./entities.md) define data and [Traits](./traits.md) define behavior, Pages define **where** users interact with the system. Pages are **trait-driven** - they don't contain UI directly, but reference traits whose `render-ui` effects populate the page.

import { AvlOrbitalUnit } from '@almadar/ui/illustrations';

<div style={{margin: '2rem 0'}}>
<AvlOrbitalUnit
  entityName="Task"
  fields={4}
  persistence="persistent"
  traits={[{name: 'TaskBrowser'}, {name: 'TaskViewer'}]}
  pages={[{name: 'TaskListPage'}, {name: 'TaskDetailPage'}, {name: 'TaskCreatePage'}]}
  animated
/>
</div>

---

## Page Definition

A page is defined in the `.orb` schema with the following structure:

```json
{
  "name": "TaskListPage",
  "path": "/tasks",
  "viewType": "list",
  "primaryEntity": "Task",
  "traits": [
    { "ref": "TaskBrowser", "linkedEntity": "Task" },
    { "ref": "FilterPanel", "linkedEntity": "Task" }
  ]
}
```

### Page Properties

| Property | Required | Description |
|----------|----------|-------------|
| `name` | Yes | PascalCase identifier (e.g., `TaskListPage`) |
| `path` | Yes | URL route starting with `/` |
| `viewType` | No | Semantic hint: `list`, `detail`, `create`, `edit`, `dashboard`, `custom` |
| `primaryEntity` | No | Main entity this page operates on |
| `traits` | Yes | Array of trait references that drive the UI |
| `isInitial` | No | Whether this is the entry point page |

---

## Routes and Path Patterns

Page paths define the URL routes for your application.

### Path Rules

- Must start with `/`
- Valid characters: letters, numbers, hyphens, underscores, colons, slashes
- Must be unique across all pages in the schema

### Static Paths

Simple paths without dynamic segments:

```json
{ "path": "/tasks" }
{ "path": "/dashboard" }
{ "path": "/settings/profile" }
```

### Dynamic Segments

Use colon syntax for dynamic parameters:

```json
{ "path": "/tasks/:id" }
{ "path": "/users/:userId/tasks/:taskId" }
{ "path": "/projects/:projectId/members/:memberId" }
```

Dynamic segments are extracted and available in:
- Event payloads (`@payload.id`)
- Navigation effects
- Entity lookups

### Path Examples

| Path | Description |
|------|-------------|
| `/tasks` | Task list page |
| `/tasks/:id` | Single task detail |
| `/tasks/create` | Create new task |
| `/tasks/:id/edit` | Edit existing task |
| `/users/:id/profile` | User profile |
| `/dashboard` | Dashboard view |

---

## View Types

View types are semantic hints about the page's purpose:

| Type | Purpose | Typical Patterns |
|------|---------|------------------|
| `list` | Display collection of entities | `entity-table`, `entity-cards`, `entity-list` |
| `detail` | Display single entity | `entity-detail`, `stats` |
| `create` | Create new entity | `form` |
| `edit` | Edit existing entity | `form` |
| `dashboard` | Overview with multiple sections | `dashboard-grid`, `stats` |
| `custom` | Custom layout | Any patterns |

**Important:** View types don't constrain the UI - actual rendering is controlled by `render-ui` effects in [traits](./traits.md#effects). View types are metadata for:
- Documentation
- Code generation hints
- UI scaffolding

---

## Page-Trait Binding

Pages reference traits that provide their behavior and UI.

### Trait References

```json
{
  "pages": [
    {
      "name": "TaskListPage",
      "path": "/tasks",
      "traits": [
        { "ref": "TaskBrowser", "linkedEntity": "Task" },
        { "ref": "QuickActions", "linkedEntity": "Task", "config": { "showCreate": true } }
      ]
    }
  ]
}
```

### PageTraitRef Structure

| Property | Required | Description |
|----------|----------|-------------|
| `ref` | Yes | Trait name or path (e.g., `"TaskBrowser"`, `"Std.traits.CRUD"`) |
| `linkedEntity` | No | Entity this trait operates on |
| `config` | No | Trait-specific configuration |

### Multiple Traits Per Page

A page can have multiple traits, each contributing UI to different slots:

```json
{
  "name": "DashboardPage",
  "path": "/dashboard",
  "traits": [
    { "ref": "StatsSummary", "linkedEntity": "Analytics" },
    { "ref": "RecentActivity", "linkedEntity": "Activity" },
    { "ref": "QuickActions", "linkedEntity": "Task" }
  ]
}
```

Each trait's `render-ui` effects target specific [slots](#slots-and-ui-rendering).

### linkedEntity on Traits

The `linkedEntity` property binds a trait to a specific entity:

```json
{ "ref": "StatusManager", "linkedEntity": "Task" }
```

This means:
- `@entity` bindings in the trait resolve to `Task` data
- Effects like `persist` operate on the `Task` collection
- The trait's state machine manages `Task` instances

See [Trait-Entity Binding](./traits.md#linkedentity-trait-entity-binding) for details.

---

## Primary Entity

The `primaryEntity` property indicates the main entity a page operates on:

```json
{
  "name": "TaskDetailPage",
  "path": "/tasks/:id",
  "primaryEntity": "Task",
  "traits": [
    { "ref": "TaskViewer" },
    { "ref": "CommentList", "linkedEntity": "Comment" }
  ]
}
```

**Usage:**
- Default entity for traits without explicit `linkedEntity`
- Validation to ensure entity exists
- Code generation hints
- Not required if all traits explicitly specify their entity

---

## Slots and UI Rendering

Traits render UI through `render-ui` effects that target **slots** - named regions on the page.

### Available Slots

| Slot | Purpose |
|------|---------|
| `main` | Primary content area |
| `sidebar` | Side panel |
| `modal` | Modal overlay |
| `drawer` | Drawer panel |
| `overlay` | Full-screen overlay |
| `center` | Centered content |
| `toast` | Toast notifications |
| `hud-top` | Top HUD (game UI) |
| `hud-bottom` | Bottom HUD (game UI) |
| `floating` | Floating element |
| `system` | Invisible system components |

### render-ui Effect

Traits populate slots using the `render-ui` effect:

```json
["render-ui", "main", {
  "type": "entity-table",
  "entity": "Task",
  "columns": ["title", "status", "dueDate"],
  "itemActions": [
    { "event": "VIEW", "label": "View" },
    { "event": "EDIT", "label": "Edit" }
  ]
}]
```

### Slot Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Page: TaskListPage                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Slot: main                                          │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │  Pattern: entity-table (from TaskBrowser)   │    │   │
│  │  │  - Columns: title, status, dueDate          │    │   │
│  │  │  - Actions: VIEW, EDIT                      │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Slot: sidebar                                       │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │  Pattern: filter-panel (from FilterPanel)   │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Multiple Renders to Same Slot

If multiple traits render to the same slot, they stack (later replaces or appends based on pattern type):

```json
// Trait A
["render-ui", "main", { "type": "stats", ... }]

// Trait B (later in page)
["render-ui", "main", { "type": "entity-table", ... }]
```

---

## Navigation

Navigation between pages is handled through the `navigate` effect in traits.

### navigate Effect

```json
["navigate", "/tasks/:id", { "id": "@payload.taskId" }]
```

**Format:** `["navigate", path, params?]`

| Argument | Description |
|----------|-------------|
| `path` | Target page path (can include dynamic segments) |
| `params` | Optional object to fill dynamic segments |

### Navigation Examples

**Simple navigation:**
```json
["navigate", "/dashboard"]
```

**With entity ID:**
```json
["navigate", "/tasks/@entity.id"]
```

**With payload:**
```json
["navigate", "/tasks/:id", { "id": "@payload.taskId" }]
```

**Nested path:**
```json
["navigate", "/users/:userId/tasks/:taskId", {
  "userId": "@entity.assigneeId",
  "taskId": "@entity.id"
}]
```

### Navigation in Transitions

Navigation typically occurs after state changes:

```json
{
  "from": "editing",
  "to": "saved",
  "event": "SAVE",
  "effects": [
    ["persist", "update", "Task", "@entity.id", "@payload"],
    ["notify", "Task saved!", "success"],
    ["navigate", "/tasks/@entity.id"]
  ]
}
```

See [Effects](./traits.md#effects) for more details.

---

## Initial Page

Mark a page as the entry point with `isInitial`:

```json
{
  "name": "HomePage",
  "path": "/",
  "isInitial": true,
  "traits": [
    { "ref": "WelcomeBanner" }
  ]
}
```

**Behavior:**
- Application loads this page first
- Redirects from root (`/`) go here
- Only one page should be marked initial per orbital

---

## Page Validation

Pages are validated at compile time with these rules:

### Required Fields
- `name` - Must be PascalCase
- `path` - Must start with `/`, valid characters only
- `traits` - Must have at least one trait reference

### Validation Errors

| Error | Description |
|-------|-------------|
| `PageMissingName` | Page name is required |
| `PageMissingPath` | Page path is required |
| `PageInvalidPath` | Path doesn't match pattern |
| `PageEmptyTraits` | Traits array cannot be empty |
| `PageInvalidTraitRef` | Referenced trait doesn't exist |
| `PageInvalidViewType` | viewType not in valid list |
| `PageDuplicatePath` | Another page uses the same path |

---

## Complete Example

A complete page example with multiple traits:

```json
{
  "orbitals": [
    {
      "name": "TaskManagement",
      "entity": {
        "name": "Task",
        "collection": "tasks",
        "fields": [
          { "name": "id", "type": "string", "required": true },
          { "name": "title", "type": "string", "required": true },
          { "name": "status", "type": "enum", "values": ["pending", "active", "done"] },
          { "name": "assigneeId", "type": "relation", "relation": { "entity": "User" } }
        ]
      },
      "traits": [
        {
          "name": "TaskBrowser",
          "linkedEntity": "Task",
          "stateMachine": {
            "states": [
              { "name": "idle", "isInitial": true },
              { "name": "viewing" }
            ],
            "transitions": [
              {
                "from": "idle",
                "to": "viewing",
                "event": "INIT",
                "effects": [
                  ["fetch", "Task", {}],
                  ["render-ui", "main", {
                    "type": "entity-table",
                    "entity": "Task",
                    "columns": ["title", "status", "assigneeId"],
                    "itemActions": [
                      { "event": "VIEW", "label": "View" },
                      { "event": "EDIT", "label": "Edit" }
                    ]
                  }]
                ]
              },
              {
                "from": "viewing",
                "to": "viewing",
                "event": "VIEW",
                "effects": [
                  ["navigate", "/tasks/@payload.id"]
                ]
              }
            ]
          }
        },
        {
          "name": "TaskViewer",
          "linkedEntity": "Task",
          "stateMachine": {
            "states": [
              { "name": "loading", "isInitial": true },
              { "name": "viewing" }
            ],
            "transitions": [
              {
                "from": "loading",
                "to": "viewing",
                "event": "INIT",
                "effects": [
                  ["fetch", "Task", { "id": "@payload.id" }],
                  ["render-ui", "main", {
                    "type": "entity-detail",
                    "entity": "Task",
                    "fields": ["title", "status", "assigneeId", "createdAt"]
                  }]
                ]
              },
              {
                "from": "viewing",
                "to": "viewing",
                "event": "EDIT",
                "effects": [
                  ["navigate", "/tasks/@entity.id/edit"]
                ]
              },
              {
                "from": "viewing",
                "to": "viewing",
                "event": "BACK",
                "effects": [
                  ["navigate", "/tasks"]
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
          "viewType": "list",
          "primaryEntity": "Task",
          "isInitial": true,
          "traits": [
            { "ref": "TaskBrowser", "linkedEntity": "Task" }
          ]
        },
        {
          "name": "TaskDetailPage",
          "path": "/tasks/:id",
          "viewType": "detail",
          "primaryEntity": "Task",
          "traits": [
            { "ref": "TaskViewer", "linkedEntity": "Task" }
          ]
        }
      ]
    }
  ]
}
```

---

## Key Principles

1. **Trait-Driven Pages** - Pages are containers for trait references. UI emerges from `render-ui` effects in traits, not from page definitions.

2. **Slots Architecture** - UI flows through standardized slots (`main`, `sidebar`, `modal`), enabling layout composition without hardcoding.

3. **Path as Contract** - Page path is the primary interface - it defines the URL users navigate to.

4. **Explicit Entity Binding** - `linkedEntity` on trait refs makes entity relationships explicit.

5. **No Page State** - Pages are pure compositional. All state lives in trait state machines.

6. **Effect-Driven Navigation** - Navigation is an effect triggered by trait transitions, not a page property.

---

## Summary

The Orb pages system provides:

1. **Routing** - Path-based navigation with dynamic segments
2. **Trait Composition** - Multiple traits per page, each contributing UI
3. **Slots** - Named regions for UI placement (main, sidebar, modal, etc.)
4. **View Types** - Semantic hints for page purpose (list, detail, dashboard)
5. **Navigation** - Effect-driven routing between pages
6. **Entity Binding** - Explicit entity relationships via `linkedEntity`
7. **Validation** - Compiler enforces path uniqueness and trait existence

Pages are the routing and composition layer - they define **where** users go, while [traits](./traits.md) define **what** happens and [entities](./entities.md) define **what data** is involved.
