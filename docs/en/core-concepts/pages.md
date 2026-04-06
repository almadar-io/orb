import { AvlOrbitalUnit } from '@almadar/ui/illustrations';
import OrbPreviewBlock from '@shared/OrbPreviewBlock';

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

Each page contains a `traits` array. Each entry is a reference object with a `ref` field pointing to a trait name defined in the same orbital:

```orb
{
  "name": "TaskListPage",
  "path": "/tasks",
  "traits": [
    { "ref": "TaskBrowser", "linkedEntity": "Task" }
  ]
}
```

The `ref` value must match the `name` of a trait defined in the orbital's `traits` array. The compiler validates this at build time. If `ref` points to a trait that does not exist, compilation fails with `PageInvalidTraitRef`.

`linkedEntity` binds the trait to a specific entity on this page. When the trait uses `@entity` bindings, they resolve to the linked entity's data. When it calls `["persist", "create", "Task", "@payload"]`, it operates on the linked entity's collection.

---

## Multiple Traits on One Page

A page can reference multiple traits. All traits on a page share a single event bus. This means one trait can emit an event that another trait on the same page listens to. This is how you compose independent behaviors into a cohesive UI.

```orb
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

Each trait runs its own state machine independently. `StatsSummary` might be in its `loaded` state showing charts, while `RecentActivity` is still in `fetching`. They do not block each other. But if `QuickActions` emits a `TASK_CREATED` event, `RecentActivity` can listen for it and refresh.

The shared event bus is the key to multi-trait coordination. It follows the actor model: traits are independent actors communicating through messages. No trait reaches into another trait's state. Communication happens exclusively through the event bus, which the [closed circuit](./closed-circuit.md) governs.

Each trait's `render-ui` effects target specific slots (`main`, `sidebar`, `modal`). Multiple traits can render to different slots simultaneously, building up a complex page layout from independent state machines.

---

## Path Parameters

Use colon-prefixed segments for dynamic routes:

```orb
{ "path": "/tasks/:id" }
{ "path": "/users/:userId/tasks/:taskId" }
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

```orb
["navigate", "/tasks/:id", { "id": "@payload.taskId" }]
```

The format is `["navigate", path, params?]`. The path can include dynamic segments that get filled from the optional params object. If a segment value starts with `@`, it resolves from the current binding context (`@entity`, `@payload`, etc.).

**Simple navigation:**
```orb
["navigate", "/dashboard"]
```

**With entity data:**
```orb
["navigate", "/tasks/@entity.id"]
```

**With payload parameters:**
```orb
["navigate", "/tasks/:id", { "id": "@payload.taskId" }]
```

Navigation typically happens after a state change completes. A `TaskBrowser` trait in its `viewing` state handles a `VIEW` event, persists any needed data, then navigates to the detail page:

```orb
{
  "from": "viewing",
  "to": "viewing",
  "event": "VIEW",
  "effects": [
    ["navigate", "/tasks/@payload.id"]
  ]
}
```

On the target page, the `INIT` event fires automatically. If the page is at `/tasks/:id`, the `:id` value arrives in `@payload.id`, so the detail trait can fetch the right entity.

---

## Initial Page

Mark a page as the application entry point with `isInitial`:

```orb
{
  "name": "HomePage",
  "path": "/",
  "isInitial": true,
  "traits": [
    { "ref": "WelcomeBanner" }
  ]
}
```

The application loads this page first. Only one page per orbital should be marked initial. If no page is marked, the first page in the array is used.

---

## Live Example: Multi-Page Note App

This orbital defines two pages. The list page at `/notes` shows all notes with a button to create new ones. Clicking a note navigates to the detail page at `/notes/:id`. The detail page has a back button that navigates to the list.

<OrbPreviewBlock title="Multi-Page Notes App" height="450px" schema={`{
  "name": "NotesApp",
  "orbitals": [
    {
      "name": "NoteManager",
      "entity": {
        "name": "Note",
        "persistence": "runtime",
        "fields": [
          { "name": "id", "type": "string" },
          { "name": "title", "type": "string" },
          { "name": "body", "type": "string" },
          { "name": "updatedAt", "type": "string" }
        ]
      },
      "traits": [
        {
          "name": "NoteBrowser",
          "linkedEntity": "Note",
          "category": "interaction",
          "stateMachine": {
            "states": [
              { "name": "listing", "isInitial": true },
              { "name": "creating" }
            ],
            "events": [
              { "key": "INIT", "name": "Initialize" },
              { "key": "CREATE", "name": "Create" },
              { "key": "SAVE", "name": "Save" },
              { "key": "CANCEL", "name": "Cancel" },
              { "key": "CLOSE", "name": "Close" },
              { "key": "VIEW", "name": "View", "payload": [{ "name": "id", "type": "string" }] }
            ],
            "transitions": [
              {
                "from": "listing",
                "to": "listing",
                "event": "INIT",
                "effects": [
                  ["fetch", "Note"],
                  ["render-ui", "main", {
                    "type": "stack",
                    "direction": "vertical",
                    "gap": "lg",
                    "children": [
                      {
                        "type": "stack",
                        "direction": "horizontal",
                        "gap": "md",
                        "justify": "space-between",
                        "children": [
                          { "type": "typography", "content": "Notes", "variant": "h2" },
                          { "type": "button", "label": "New Note", "event": "CREATE", "variant": "primary", "icon": "plus" }
                        ]
                      },
                      { "type": "divider" },
                      { "type": "typography", "content": "No notes yet. Create your first note to get started.", "variant": "body", "color": "muted" }
                    ]
                  }]
                ]
              },
              {
                "from": "listing",
                "to": "creating",
                "event": "CREATE",
                "effects": [
                  ["render-ui", "modal", {
                    "type": "stack",
                    "direction": "vertical",
                    "gap": "md",
                    "children": [
                      { "type": "typography", "content": "New Note", "variant": "h3" },
                      { "type": "input", "label": "Title", "placeholder": "Note title" },
                      { "type": "textarea", "label": "Body", "placeholder": "Write your note..." },
                      {
                        "type": "stack",
                        "direction": "horizontal",
                        "gap": "md",
                        "children": [
                          { "type": "button", "label": "Save", "event": "SAVE", "variant": "primary" },
                          { "type": "button", "label": "Cancel", "event": "CANCEL", "variant": "secondary" }
                        ]
                      }
                    ]
                  }]
                ]
              },
              {
                "from": "creating",
                "to": "listing",
                "event": "SAVE",
                "effects": [
                  ["persist", "create", "Note", "@payload"],
                  ["notify", "success", "Note created"],
                  ["render-ui", "modal", null],
                  ["render-ui", "main", {
                    "type": "stack",
                    "direction": "vertical",
                    "gap": "lg",
                    "children": [
                      {
                        "type": "stack",
                        "direction": "horizontal",
                        "gap": "md",
                        "justify": "space-between",
                        "children": [
                          { "type": "typography", "content": "Notes", "variant": "h2" },
                          { "type": "button", "label": "New Note", "event": "CREATE", "variant": "primary", "icon": "plus" }
                        ]
                      },
                      { "type": "divider" },
                      { "type": "typography", "content": "No notes yet. Create your first note to get started.", "variant": "body", "color": "muted" }
                    ]
                  }]
                ]
              },
              {
                "from": "creating",
                "to": "listing",
                "event": "CANCEL",
                "effects": [
                  ["render-ui", "modal", null],
                  ["render-ui", "main", {
                    "type": "stack",
                    "direction": "vertical",
                    "gap": "lg",
                    "children": [
                      {
                        "type": "stack",
                        "direction": "horizontal",
                        "gap": "md",
                        "justify": "space-between",
                        "children": [
                          { "type": "typography", "content": "Notes", "variant": "h2" },
                          { "type": "button", "label": "New Note", "event": "CREATE", "variant": "primary", "icon": "plus" }
                        ]
                      },
                      { "type": "divider" },
                      { "type": "typography", "content": "No notes yet. Create your first note to get started.", "variant": "body", "color": "muted" }
                    ]
                  }]
                ]
              },
              {
                "from": "creating",
                "to": "listing",
                "event": "CLOSE",
                "effects": [
                  ["render-ui", "modal", null],
                  ["render-ui", "main", {
                    "type": "stack",
                    "direction": "vertical",
                    "gap": "lg",
                    "children": [
                      {
                        "type": "stack",
                        "direction": "horizontal",
                        "gap": "md",
                        "justify": "space-between",
                        "children": [
                          { "type": "typography", "content": "Notes", "variant": "h2" },
                          { "type": "button", "label": "New Note", "event": "CREATE", "variant": "primary", "icon": "plus" }
                        ]
                      },
                      { "type": "divider" },
                      { "type": "typography", "content": "No notes yet. Create your first note to get started.", "variant": "body", "color": "muted" }
                    ]
                  }]
                ]
              },
              {
                "from": "listing",
                "to": "listing",
                "event": "VIEW",
                "effects": [
                  ["navigate", "/notes/@payload.id"]
                ]
              }
            ]
          }
        },
        {
          "name": "NoteViewer",
          "linkedEntity": "Note",
          "category": "interaction",
          "stateMachine": {
            "states": [
              { "name": "loading", "isInitial": true },
              { "name": "viewing" }
            ],
            "events": [
              { "key": "INIT", "name": "Initialize", "payload": [{ "name": "id", "type": "string" }] },
              { "key": "BACK", "name": "Back" }
            ],
            "transitions": [
              {
                "from": "loading",
                "to": "viewing",
                "event": "INIT",
                "effects": [
                  ["fetch", "Note", { "id": "@payload.id" }],
                  ["render-ui", "main", {
                    "type": "stack",
                    "direction": "vertical",
                    "gap": "lg",
                    "children": [
                      {
                        "type": "stack",
                        "direction": "horizontal",
                        "gap": "md",
                        "children": [
                          { "type": "button", "label": "Back to Notes", "event": "BACK", "variant": "secondary", "icon": "arrow-left" },
                          { "type": "typography", "content": "Note Detail", "variant": "h2" }
                        ]
                      },
                      { "type": "divider" },
                      { "type": "typography", "content": "Select a note from the list to view its details here.", "variant": "body", "color": "muted" }
                    ]
                  }]
                ]
              },
              {
                "from": "viewing",
                "to": "viewing",
                "event": "BACK",
                "effects": [
                  ["navigate", "/notes"]
                ]
              }
            ]
          }
        }
      ],
      "pages": [
        {
          "name": "NoteListPage",
          "path": "/notes",
          "isInitial": true,
          "traits": [
            { "ref": "NoteBrowser", "linkedEntity": "Note" }
          ]
        },
        {
          "name": "NoteDetailPage",
          "path": "/notes/:id",
          "traits": [
            { "ref": "NoteViewer", "linkedEntity": "Note" }
          ]
        }
      ]
    }
  ]
}`} />

In this example, the `NoteBrowser` trait handles list and create flows on the `/notes` page. The `VIEW` event triggers a `navigate` effect to `/notes/@payload.id`. On the detail page, `NoteViewer` fetches the specific note by ID from `@payload.id` (extracted from the `:id` path parameter) and renders it. The `BACK` event navigates back to `/notes`.

---

## Validation

The compiler enforces these rules at build time:

| Error | Cause |
|-------|-------|
| `PageMissingName` | Page has no `name` field |
| `PageMissingPath` | Page has no `path` field |
| `PageInvalidPath` | Path contains invalid characters or does not start with `/` |
| `PageEmptyTraits` | `traits` array is empty (a page with no traits renders nothing) |
| `PageInvalidTraitRef` | `ref` points to a trait name that does not exist in the orbital |
| `PageDuplicatePath` | Another page already uses this path |
| `PageInvalidViewType` | `viewType` is not one of `list`, `detail`, `create`, `edit`, `dashboard`, `custom` |

---

## Key Principles

1. **Pages are stateless.** All state lives in trait state machines. The page is a composition frame, nothing more.

2. **Traits are referenced by name.** The `ref` field creates a compile-time-verified link between the page and the trait definition.

3. **Shared event bus.** Multiple traits on the same page communicate through events, following the actor model. No trait directly accesses another trait's state.

4. **Navigation is an effect.** Moving between pages is a state machine transition effect, not an imperative call. This keeps navigation part of the deterministic event circuit.

5. **Path parameters flow into payloads.** Dynamic `:param` segments are extracted and injected into `@payload`, making them available to guards, effects, and bindings.
