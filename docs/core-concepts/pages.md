import { AvlOrbitalUnit } from '@almadar/ui/illustrations';
import OrbPreviewBlock from '@shared/OrbPreviewBlock';
import pagesSchema from './pages.orb.json';

# Pages

> Routes that bind traits to URLs, composing state machines into navigable surfaces.

**Related:**
- [Entities](./entities.md)
- [Traits](./traits.md)
- [Closed Circuit](./closed-circuit.md)

---

## What a Page Is

A Page is a route. It maps a URL path to one or more traits, giving users a place to interact with the application. Pages do not contain UI directly. They reference traits by name, and those traits produce UI through `render-ui` effects.

The fundamental composition:

```
Orbital = Entity + Traits + Pages
```

[Entities](./entities.md) define data shapes. [Traits](./traits.md) define behavior through state machines. Pages define **where** those behaviors become accessible. A page at `/tasks` might reference a `TaskBrowser` trait. When a user navigates to `/tasks`, the runtime initializes that trait's state machine, fires `INIT`, and the resulting `render-ui` effects populate the page.

<div style={{margin: '2rem 0'}}>
<AvlOrbitalUnit
  entityName="Task"
  fields={4}
  persistence="persistent"
  traits={[{name: 'TaskBrowser'}, {name: 'TaskViewer'}]}
  pages={[{name: 'TaskListPage'}, {name: 'TaskDetailPage'}]}
  animated
/>
</div>

Pages are stateless. They hold no data, manage no lifecycle, and execute no logic. Every piece of state lives in the trait's state machine. The page is purely a composition frame.

---

## Referencing Traits by Name

Each page maps a path to a trait name defined in the same orbital:

```lolo
page "/tasks" -> TaskBrowser
```

The trait name after `->` must match a trait defined in the orbital's body. The compiler validates this at build time. If the name points to a trait that does not exist, compilation fails with `PageInvalidTraitRef`.

The `[entity: EntityName]` option binds the trait to a specific entity on this page. When the trait uses `@entity` bindings, they resolve to the linked entity's data. When it calls `(persist create Task @payload)`, it operates on the linked entity's collection.

---

## Multiple Traits on One Page

A page can reference multiple traits. All traits on a page share a single event bus. This means one trait can emit an event that another trait on the same page listens to. This is how you compose independent behaviors into a cohesive UI.

```lolo
page "/dashboard" -> StatsSummary, RecentActivity, QuickActions
```

Each trait runs its own state machine independently. `StatsSummary` might be in its `loaded` state showing charts, while `RecentActivity` is still in `fetching`. They do not block each other. But if `QuickActions` emits a `TASK_CREATED` event, `RecentActivity` can listen for it and refresh.

The shared event bus is the key to multi-trait coordination. It follows the actor model: traits are independent actors communicating through messages. No trait reaches into another trait's state. Communication happens exclusively through the event bus, which the [closed circuit](./closed-circuit.md) governs.

Each trait's `render-ui` effects target specific slots (`main`, `sidebar`, `modal`). Multiple traits can render to different slots simultaneously, building up a complex page layout from independent state machines.

---

## Path Parameters

Use colon-prefixed segments for dynamic routes:

```lolo
page "/tasks/:id" -> TaskViewer
page "/users/:userId/tasks/:taskId" -> TaskViewer
```

Path parameters are extracted at runtime and made available in event payloads. When a user navigates to `/tasks/abc123`, the `:id` segment becomes `abc123` and is accessible as `@payload.id` in transitions.

Rules for paths:
- Must start with `/`
- Valid characters: letters, numbers, hyphens, underscores, colons, slashes
- Must be unique across all pages in the orbital
- Dynamic segments use `:paramName` syntax

| Path | Description |
|------|-------------|
| `/tasks` | Static list route |
| `/tasks/:id` | Single entity by ID |
| `/tasks/create` | Static nested route |
| `/tasks/:id/edit` | Parameterized nested route |
| `/users/:userId/tasks/:taskId` | Multi-parameter route |

---

## Navigation Between Pages

Navigation is an effect, not a page property. Traits navigate between pages using the `navigate` effect in transitions:

```lolo
(navigate "/tasks/:id" { id: @payload.taskId })
```

The format is `(navigate path params?)`. The path can include dynamic segments that get filled from the optional params object. If a segment value starts with `@`, it resolves from the current binding context (`@entity`, `@payload`, etc.).

**Simple navigation:**
```lolo
(navigate "/dashboard")
```

**With entity data:**
```lolo
(navigate "/tasks/@entity.id")
```

**With payload parameters:**
```lolo
(navigate "/tasks/:id" { id: @payload.taskId })
```

Navigation typically happens after a state change completes. A `TaskBrowser` trait in its `viewing` state handles a `VIEW` event, persists any needed data, then navigates to the detail page:

```lolo
state viewing {
  VIEW -> viewing
    (navigate "/tasks/@payload.id")
}
```

On the target page, the `INIT` event fires automatically. If the page is at `/tasks/:id`, the `:id` value arrives in `@payload.id`, so the detail trait can fetch the right entity.

---

## Initial Page

Mark a page as the application entry point with the `initial` option:

```lolo
page "/" -> WelcomeBanner [initial]
```

The application loads this page first. Only one page per orbital should be marked initial. If no page is marked, the first page in the array is used.

---

## Live Example: Single-Page Browse App

This orbital defines a single page at `/browseitems` with one trait. The `BrowseItemBrowse` trait renders a data grid showing all `BrowseItem` entities. This is the simplest page setup: one path, one trait, one entity. The page itself is stateless. All behavior lives in the trait's state machine.

{/* height: 450px */}
```lolo
orbital BrowseItemOrbital {
  entity BrowseItem [runtime] {
    id : string
    name : string
    description : string
    status : string
    createdAt : string
  }
  trait BrowseItemBrowse -> BrowseItem [interaction] {
    state browsing {
      INIT -> browsing
        (ref BrowseItem)
        (render-ui main { type: "stack", direction: "vertical", gap: "lg", className: "max-w-5xl mx-auto w-full", children: [{ type: "stack", direction: "horizontal", gap: "md", justify: "space-between", align: "center", children: [{ type: "stack", direction: "horizontal", gap: "sm", align: "center", children: [{ type: "icon", name: "list", size: "lg" }, { type: "typography", content: "BrowseItems", variant: "h2" }] }] }, { type: "divider" }, { type: "data-grid", entity: "BrowseItem", emptyIcon: "inbox", emptyTitle: "No browseitems yet", emptyDescription: "Create your first browseitem to get started.", columns: [{ name: "name", label: "Name", variant: "h4", icon: "list" }, { name: "description", label: "Description", variant: "badge", colorMap: { active: "success", completed: "success", done: "success", pending: "warning", draft: "warning", scheduled: "warning", inactive: "neutral", archived: "neutral", disabled: "neutral", error: "destructive", cancelled: "destructive", failed: "destructive" } }, { name: "status", label: "Status", variant: "caption" }] }, { type: "floating-action-button", icon: "plus", event: "INIT", label: "Create", tooltip: "Create" }] })
    }
  }
  page "/browseitems" -> BrowseItemBrowse
}
```

<OrbPreviewBlock schema={JSON.stringify(pagesSchema)} showCode={false} />

The page definition is minimal. It maps the path `/browseitems` to the `BrowseItemBrowse` trait. When a user navigates to that URL, the runtime initializes the trait's state machine, fires `INIT`, and the resulting `render-ui` effects populate the page with the data grid.

---

## Validation

The compiler enforces these rules at build time:

| Error | Cause |
|-------|-------|
| `PageMissingName` | Page has no name |
| `PageMissingPath` | Page has no path |
| `PageInvalidPath` | Path contains invalid characters or does not start with `/` |
| `PageEmptyTraits` | No traits listed after `->` (a page with no traits renders nothing) |
| `PageInvalidTraitRef` | Trait name after `->` does not exist in the orbital |
| `PageDuplicatePath` | Another page already uses this path |
| `PageInvalidViewType` | `viewType` is not one of `list`, `detail`, `create`, `edit`, `dashboard`, `custom` |

---

## Key Principles

1. **Pages are stateless.** All state lives in trait state machines. The page is a composition frame, nothing more.

2. **Traits are referenced by name.** The `->` arrow creates a compile-time-verified link between the page and the trait definition.

3. **Shared event bus.** Multiple traits on the same page communicate through events, following the actor model. No trait directly accesses another trait's state.

4. **Navigation is an effect.** Moving between pages is a state machine transition effect, not an imperative call. This keeps navigation part of the deterministic event circuit.

5. **Path parameters flow into payloads.** Dynamic `:param` segments are extracted and injected into `@payload`, making them available to guards, effects, and bindings.
