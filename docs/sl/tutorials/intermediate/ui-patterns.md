# Vzorci UI in render-ui

> Source: [`tests/schemas/08-patterns.orb`](../../../../tests/schemas/08-patterns.orb)

Orb UI is driven entirely by `render-ui` effects inside state machine transitions. There is no JSX, no template files, no separate component tree — the state machine *is* the UI logic.

<OrbitalDiagram />

---

## Kako render-ui deluje

```json
["render-ui", "slot", { "type": "pattern", ...props }]
```

| Argument | Description |
|----------|-------------|
| `"slot"` | Where on the page the component renders |
| `{ "type": "..." }` | Which pattern component to use |
| `...props` | Pattern-specific configuration |

**To clear a slot:**
```json
["render-ui", "slot", null]
```

---

## Rezine

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

## Kategorije vzorcev

### Prikazni vzorci

**`entity-table`** — Data table with columns, sorting, and row actions.

```json
["render-ui", "main", {
  "type": "entity-table",
  "entity": "Product",
  "columns": ["name", "price", "stock", "category"],
  "itemActions": [
    { "event": "VIEW", "label": "View" },
    { "event": "EDIT", "label": "Edit" },
    { "event": "DELETE", "label": "Delete" }
  ]
}]
```

**`entity-detail`** — Read-only detail view for a single record.

```json
["render-ui", "main", {
  "type": "entity-detail",
  "entity": "Product",
  "fields": ["name", "description", "price", "stock", "category"]
}]
```

**`stats`** — Dashboard stat cards (counts, totals, summaries).

```json
["render-ui", "main", {
  "type": "stats",
  "items": [
    { "label": "Total Products", "value": "@entity.count" },
    { "label": "Out of Stock", "value": "@entity.outOfStock" }
  ]
}]
```

---

### Obrazcni vzorci

**`form`** — Auto-generated form for an entity. Renders all fields or a specified subset.

```json
["render-ui", "main", {
  "type": "form",
  "entity": "Product",
  "fields": [
    { "name": "name", "label": "Product Name", "required": true },
    { "name": "description", "label": "Description", "type": "textarea" },
    { "name": "price", "label": "Price", "type": "number", "required": true },
    { "name": "stock", "label": "Stock", "type": "number" },
    { "name": "category", "label": "Category" }
  ]
}]
```

**`form-section`** — A form inside a modal or drawer, with submit/cancel wired to events.

```json
["render-ui", "modal", {
  "type": "form-section",
  "entity": "Task",
  "fields": ["title", "priority", "dueDate"],
  "submitEvent": "SAVE",
  "cancelEvent": "CANCEL"
}]
```

> **Important:** Use `submitEvent` and `cancelEvent` (not `onSubmit`/`onCancel` — those are deprecated).

---

### Navigacijski in naslovni vzorci

**`page-header`** — Page title with optional action buttons.

```json
["render-ui", "main", {
  "type": "page-header",
  "title": "Products",
  "subtitle": "Manage your product catalog",
  "actions": [
    { "event": "CREATE", "label": "New Product", "variant": "primary" }
  ]
}]
```

**`breadcrumb`** — Navigation trail.

```json
["render-ui", "main", {
  "type": "breadcrumb",
  "items": [
    { "label": "Products", "path": "/products" },
    { "label": "@entity.name" }
  ]
}]
```

---

### Vzorci stanj

**`empty-state`** — Shown when a list has no items.

```json
["render-ui", "main", {
  "type": "empty-state",
  "title": "No products yet",
  "description": "Add your first product to get started",
  "actions": [{ "event": "CREATE", "label": "Add Product" }]
}]
```

**`loading-state`** — Spinner while data loads.

```json
["render-ui", "main", {
  "type": "loading-state",
  "title": "Loading products..."
}]
```

---

## UI voden s stanji: celoten primer

The power of `render-ui` is that it changes based on state. Different states render different components into the same slot. Here's the full `ProductCRUD` trait from `08-patterns.orb`:

```json
{
  "name": "ProductCRUD",
  "linkedEntity": "Product",
  "category": "interaction",
  "stateMachine": {
    "states": [
      { "name": "listing", "isInitial": true },
      { "name": "viewing" },
      { "name": "editing" },
      { "name": "creating" }
    ],
    "events": [
      { "key": "INIT", "name": "Initialize" },
      { "key": "VIEW", "name": "View Product", "payload": [
        { "name": "id", "type": "string", "required": true }
      ]},
      { "key": "EDIT", "name": "Edit Product" },
      { "key": "CREATE", "name": "Create Product" },
      { "key": "SAVE", "name": "Save" },
      { "key": "CANCEL", "name": "Cancel" },
      { "key": "BACK", "name": "Back to List" },
      { "key": "DELETE", "name": "Delete Product", "payload": [
        { "name": "id", "type": "string", "required": true }
      ]}
    ],
    "transitions": [
      {
        "from": "listing", "event": "INIT", "to": "listing",
        "effects": [
          ["fetch", "Product"],
          ["render-ui", "main", {
            "type": "entity-table",
            "entity": "Product",
            "columns": ["name", "price", "stock", "category"],
            "itemActions": [
              { "event": "VIEW", "label": "View" },
              { "event": "EDIT", "label": "Edit" },
              { "event": "DELETE", "label": "Delete" }
            ]
          }]
        ]
      },
      {
        "from": "listing", "event": "VIEW", "to": "viewing",
        "effects": [
          ["fetch", "Product", "@payload.id"],
          ["render-ui", "main", {
            "type": "entity-detail",
            "entity": "Product",
            "fields": ["name", "description", "price", "stock", "category"]
          }]
        ]
      },
      {
        "from": "listing", "event": "CREATE", "to": "creating",
        "effects": [
          ["render-ui", "main", {
            "type": "form",
            "entity": "Product",
            "fields": [
              { "name": "name", "label": "Product Name", "required": true },
              { "name": "description", "label": "Description", "type": "textarea" },
              { "name": "price", "label": "Price", "type": "number", "required": true },
              { "name": "stock", "label": "Stock", "type": "number" },
              { "name": "category", "label": "Category" }
            ]
          }]
        ]
      },
      {
        "from": "viewing", "event": "EDIT", "to": "editing",
        "effects": [
          ["render-ui", "main", { "type": "form", "entity": "Product", "mode": "edit" }]
        ]
      },
      {
        "from": "viewing", "event": "BACK", "to": "listing",
        "effects": [["navigate", "/products"]]
      },
      {
        "from": "editing", "event": "SAVE", "to": "viewing",
        "effects": [
          ["persist", "update", "Product", "@entity"],
          ["notify", "success", "Product saved successfully"]
        ]
      },
      { "from": "editing", "event": "CANCEL", "to": "viewing" },
      {
        "from": "creating", "event": "SAVE", "to": "listing",
        "effects": [
          ["persist", "update", "Product", "@entity"],
          ["notify", "success", "Product created successfully"],
          ["navigate", "/products"]
        ]
      },
      {
        "from": "creating", "event": "CANCEL", "to": "listing",
        "effects": [["navigate", "/products"]]
      },
      {
        "from": "listing", "event": "DELETE", "to": "listing",
        "effects": [
          ["persist", "delete", "Product", "@payload.id"],
          ["notify", "info", "Product deleted"]
        ]
      }
    ]
  }
}
```

With pages:

```json
"pages": [
  {
    "name": "ProductListPage",
    "path": "/products",
    "traits": [{ "ref": "ProductCRUD", "linkedEntity": "Product" }]
  },
  {
    "name": "ProductDetailPage",
    "path": "/products/:id",
    "traits": [{ "ref": "ProductCRUD", "linkedEntity": "Product" }]
  }
]
```

**What the state machine renders per state:**

| State | `main` slot renders |
|-------|---------------------|
| `listing` | `entity-table` with row actions |
| `viewing` | `entity-detail` with fields |
| `editing` | `form` in edit mode |
| `creating` | `form` with all fields |

---

## Referenca lastnosti akcij

Actions are defined **inside** the pattern props, not as separate patterns.

| Pattern | How to wire actions |
|---------|---------------------|
| `entity-table` | `itemActions: [{ "event": "EDIT", "label": "Edit" }]` |
| `entity-detail` | `actions: [{ "event": "EDIT", "label": "Edit" }]` |
| `form-section` | `submitEvent: "SAVE"`, `cancelEvent: "CANCEL"` |
| `page-header` | `actions: [{ "event": "CREATE", "label": "New" }]` |
| `empty-state` | `actions: [{ "event": "CREATE", "label": "Add" }]` |

---

## Vezave v lastnostih vzorcev

Pattern props accept bindings to read live data:

| Binding | Resolves to |
|---------|-------------|
| `@entity.field` | Current entity field value |
| `@payload.field` | Event payload field |
| `@state` | Current state name |
| `@now` | Current timestamp |

Example:
```json
{ "type": "stats", "title": "Cart Total: $@entity.total" }
```

---

## Naslednji koraki

- [Guards & Business Rules](./guards.md) — add conditions to control when transitions fire
- [Cross-Orbital Communication](./cross-orbital.md) — connect orbitals together
- [Building a Full App](../advanced/full-app.md) — put multiple orbitals together
