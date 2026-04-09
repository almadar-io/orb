import { AvlSlotMap } from '@almadar/ui/illustrations';

# UI Patterns & render-ui

> Source: [`tests/schemas/08-patterns.orb`](../../../../tests/schemas/08-patterns.orb)

Orb UI is driven entirely by `render-ui` effects inside state machine transitions. There is no JSX, no template files, no separate component tree — the state machine *is* the UI logic.

<div style={{margin: '2rem 0'}}>
<AvlSlotMap
  slots={[
    { name: 'header' },
    { name: 'sidebar' },
    { name: 'main' }
  ]}
  animated
/>
</div>

---

## How render-ui Works

```lolo
(render-ui slot { type: "pattern", ...props })
```

| Argument | Description |
|----------|-------------|
| `"slot"` | Where on the page the component renders |
| `{ "type": "..." }` | Which pattern component to use |
| `...props` | Pattern-specific configuration |

**To clear a slot:**
```lolo
(render-ui slot null)
```

---

## Slots

Slots divide the page into named regions. Each slot is owned by one trait at a time.

| Slot | Typical use |
|------|-------------|
| `main` | Primary content area |
| `modal` | Modal dialogs (forms, confirmations) |
| `drawer` | Side panel (detail view) |
| `sidebar` | Persistent side navigation |
| `overlay` | Full-screen overlays |
| `hud-top` / `hud-bottom` | Persistent headers/footers |
| `toast` | Notification toasts |

---

## Pattern Categories

### Display Patterns

**`entity-table`** — Data table with columns, sorting, and row actions.

```lolo
(render-ui main {
  type: "entity-table",
  entity: "Product",
  columns: ["name", "price", "stock", "category"],
  itemActions: [
    { event: "VIEW", label: "View" },
    { event: "EDIT", label: "Edit" },
    { event: "DELETE", label: "Delete" }
  ]
})
```

**`entity-detail`** — Read-only detail view for a single record.

```lolo
(render-ui main {
  type: "entity-detail",
  entity: "Product",
  fields: ["name", "description", "price", "stock", "category"]
})
```

**`stats`** — Dashboard stat cards (counts, totals, summaries).

```lolo
(render-ui main {
  type: "stats",
  items: [
    { label: "Total Products", value: "@entity.count" },
    { label: "Out of Stock", value: "@entity.outOfStock" }
  ]
})
```

---

### Form Patterns

**`form`** — Auto-generated form for an entity. Renders all fields or a specified subset.

```lolo
(render-ui main {
  type: "form",
  entity: "Product",
  fields: [
    { name: "name", label: "Product Name", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "price", label: "Price", type: "number", required: true },
    { name: "stock", label: "Stock", type: "number" },
    { name: "category", label: "Category" }
  ]
})
```

**`form-section`** — A form inside a modal or drawer, with submit/cancel wired to events.

```lolo
(render-ui modal {
  type: "form-section",
  entity: "Task",
  fields: ["title", "priority", "dueDate"],
  submitEvent: "SAVE",
  cancelEvent: "CANCEL"
})
```

> **Important:** Use `submitEvent` and `cancelEvent` (not `onSubmit`/`onCancel` — those are deprecated).

---

### Navigation & Header Patterns

**`page-header`** — Page title with optional action buttons.

```lolo
(render-ui main {
  type: "page-header",
  title: "Products",
  subtitle: "Manage your product catalog",
  actions: [
    { event: "CREATE", label: "New Product", variant: "primary" }
  ]
})
```

**`breadcrumb`** — Navigation trail.

```lolo
(render-ui main {
  type: "breadcrumb",
  items: [
    { label: "Products", path: "/products" },
    { label: "@entity.name" }
  ]
})
```

---

### State Patterns

**`empty-state`** — Shown when a list has no items.

```lolo
(render-ui main {
  type: "empty-state",
  title: "No products yet",
  description: "Add your first product to get started",
  actions: [{ event: "CREATE", label: "Add Product" }]
})
```

**`loading-state`** — Spinner while data loads.

```lolo
(render-ui main {
  type: "loading-state",
  title: "Loading products..."
})
```

---

## State-Driven UI: Full Example

The power of `render-ui` is that it changes based on state. Different states render different components into the same slot. Here's the full `ProductCRUD` trait from `08-patterns.orb`:

```lolo
trait ProductCRUD -> Product [interaction] {
  initial: listing
  state listing {
    INIT -> listing
      (fetch Product)
      (render-ui main {
        type: "entity-table",
        entity: "Product",
        columns: ["name", "price", "stock", "category"],
        itemActions: [
          { event: "VIEW", label: "View" },
          { event: "EDIT", label: "Edit" },
          { event: "DELETE", label: "Delete" }
        ]
      })
    VIEW -> viewing
      (fetch Product @payload.id)
      (render-ui main {
        type: "entity-detail",
        entity: "Product",
        fields: ["name", "description", "price", "stock", "category"]
      })
    CREATE -> creating
      (render-ui main {
        type: "form",
        entity: "Product",
        fields: [
          { name: "name", label: "Product Name", required: true },
          { name: "description", label: "Description", type: "textarea" },
          { name: "price", label: "Price", type: "number", required: true },
          { name: "stock", label: "Stock", type: "number" },
          { name: "category", label: "Category" }
        ]
      })
    DELETE -> listing
      (persist delete Product @payload.id)
      (notify info "Product deleted")
  }
  state viewing {
    EDIT -> editing
      (render-ui main { type: "form", entity: "Product", mode: "edit" })
    BACK -> listing
      (navigate "/products")
  }
  state editing {
    SAVE -> viewing
      (persist update Product @entity)
      (notify success "Product saved successfully")
    CANCEL -> viewing
  }
  state creating {
    SAVE -> listing
      (persist update Product @entity)
      (notify success "Product created successfully")
      (navigate "/products")
    CANCEL -> listing
      (navigate "/products")
  }
}
```

With pages:

```lolo
page "/products" -> ProductCRUD
page "/products/:id" -> ProductCRUD
```

**What the state machine renders per state:**

| State | `main` slot renders |
|-------|---------------------|
| `listing` | `entity-table` with row actions |
| `viewing` | `entity-detail` with fields |
| `editing` | `form` in edit mode |
| `creating` | `form` with all fields |

---

## Action Props Reference

Actions are defined **inside** the pattern props, not as separate patterns.

| Pattern | How to wire actions |
|---------|---------------------|
| `entity-table` | `itemActions: [{ "event": "EDIT", "label": "Edit" }]` |
| `entity-detail` | `actions: [{ "event": "EDIT", "label": "Edit" }]` |
| `form-section` | `submitEvent: "SAVE"`, `cancelEvent: "CANCEL"` |
| `page-header` | `actions: [{ "event": "CREATE", "label": "New" }]` |
| `empty-state` | `actions: [{ "event": "CREATE", "label": "Add" }]` |

---

## Bindings in Pattern Props

Pattern props accept bindings to read live data:

| Binding | Resolves to |
|---------|-------------|
| `@entity.field` | Current entity field value |
| `@payload.field` | Event payload field |
| `@state` | Current state name |
| `@now` | Current timestamp |

Example:
```lolo
(render-ui main { type: "stats", title: "Cart Total: $@entity.total" })
```

---

## Next Steps

- [Guards & Business Rules](./guards.md) — add conditions to control when transitions fire
- [Cross-Orbital Communication](./cross-orbital.md) — connect orbitals together
- [Building a Full App](../advanced/full-app.md) — put multiple orbitals together
