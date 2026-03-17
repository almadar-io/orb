---
name: almadar-orbitals
description: Generate Almadar schemas using the Orbitals composition model. Decomposes applications into atomic Almadar Units (Entity x Traits x Patterns) with structural caching for efficiency.
allowed-tools: Read, Write, Edit
version: 3.1.0
---

# Almadar Generation Skill

> Generate Almadar applications using Almadar Units: Entity × Traits × Patterns

## Almadar Architecture

### Schema Format (IMPORTANT)

The correct schema format uses **orbitals** array at root:

```json
{
  "name": "MyApp",
  "version": "1.0.0",
  "orbitals": [           // ← CORRECT: orbitals array
    {
      "name": "Task Management",
      "entity": { ... },
      "traits": [ ... ],
      "pages": [ ... ]
    }
  ]
}
```

**DO NOT** confuse with legacy format that had `dataEntities`, `traits`, `pages` at root level.
The `orbitals[]` format IS the standard format - do not "fix" it to something else.

**NOTE**: There is NO schema-level `traits[]` array. All traits belong inside orbitals.

### Core Formula
```
Almadar Unit = Entity × Traits × Patterns
Application  = Σ(Almadar Units)
```

### The Closed Circuit Pattern
```
Trait State Machine → render-ui → UI Component → User Action → Event → Trait
        ↑                                                           |
        └───────────────────────────────────────────────────────────┘
```

1. **Trait** transitions to state, fires `render-ui` effect
2. **UI Component** renders with actions (buttons, forms)
3. **User clicks** → Component emits event (e.g., `UI:CREATE`)
4. **Trait receives** event, transitions, cycle repeats

### Key Principles

| Principle | Rule |
|-----------|------|
| **One trait per slot** | Each slot (main, modal, drawer) owned by ONE trait |
| **INIT renders UI** | Every trait needs INIT self-loop to render initial UI |
| **One page per entity** | Use trait's render-ui for create/edit/view, not separate pages |
| **form-section has onSubmit** | Connects form to trait events |
| **std/* are templates** | Guide LLM generation, not runtime code |

### Slot Ownership
```
┌─────────────────────────────────────────────┐
│ Page: /tasks                                │
├─────────────────────────────────────────────┤
│ TaskManagement trait OWNS:                  │
│   • main → entity-table, page-header        │
│   • modal → form-section (create/edit)      │
│   • drawer → entity-detail (view)           │
│                                             │
│ NO other trait should render to these slots │
└─────────────────────────────────────────────┘
```


---

## Type Reference (Auto-Generated)

### UI Slots
`main`, `sidebar`, `modal`, `drawer`, `overlay`, `center`, `toast`, `hud-top`, `hud-bottom`, `floating`, `system`

### Pattern Types
`entity-table`, `entity-list`, `entity-cards`, `entity-detail`, `detail-panel`, `page-header`, `title-only`, `form`, `form-section`, `form-fields`, `search-bar`, `search-input`, `filter-group`, `tabs`, `tab-bar`, `breadcrumb`, `wizard-progress`, `wizard-navigation`, `wizard-container`, `pagination`, `empty-state`, `loading-state`, `error-state`, `notification`, `stats`, `dashboard-grid`, `modal`, `modal-container`, `drawer`, `drawer-container`, `confirm-dialog`, `split-layout`, `master-detail`, `tabbed-layout`, `vstack`, `hstack`, `box`, `grid`, `center`, `spacer`, `divider`, `game-canvas`, `game-hud`, `game-controls`, `game-menu`, `game-pause-overlay`, `game-over-screen`, `level-select`, `game-debug-panel`, `tilemap-renderer`, `inventory-panel`, `dialogue-box`, `input-listener`, `collision-detector`, `card-hand`, `card-deck`, `board-grid`, `turn-indicator`, `match3-grid`, `puzzle-board`, `runtime-debugger`, `pattern-proposal`, `button`, `button-group`, `icon-button`, `link`, `text`, `heading`, `badge`, `avatar`, `icon`, `image`, `card`, `progress-bar`, `spinner`, `input`, `textarea`, `select`, `checkbox`, `radio`, `switch`, `label`, `alert`, `tooltip`, `popover`, `menu`, `accordion`, `container`, `simple-grid`, `float-button`, `custom`

### Bindings
`@entity`, `@payload`, `@state`, `@now`, `@config`, `@computed`, `@trait`

### Operators
**Guard operators** (no side effects): `+`, `-`, `*`, `/`, `%`, `abs`, `min`, `max`, `floor`, `ceil`, `round`, `clamp`, `=`, `!=`, `<`, `>`, `<=`, `>=`, `and`, `or`, `not`, `if`, `let`, `fn`, `map`, `filter`, `find`, `count`, `sum`, `first`, `last`, `nth`, `concat`, `includes`, `empty`

**Effect operators** (have side effects): `do`, `when`, `set`, `emit`, `persist`, `navigate`, `notify`, `spawn`, `despawn`, `call-service`, `render-ui`

---

### S-Expression Syntax

```
[operator, arg1, arg2, ...]   # Call expression
"@entity.field"               # Entity binding
"@payload.data"               # Event payload binding
"@state"                      # Current state name
"@now"                        # Timestamp
```

**Guards** (return boolean, no side effects):
```
["=", "@entity.status", "active"]
[">", "@entity.count", 0]
["and", [">=", "@entity.x", 0], ["<", "@entity.x", 100]]
```

**Effects** (perform actions):
```
["set", "@entity.field", value]
["emit", "EVENT_NAME", { "key": "@entity.value" }]
["render-ui", "slot", { "type": "pattern", ... }]
["persist", "create", "Entity", "@payload.data"]
["navigate", "/path"]
```

---

### render-ui Effect

```
["render-ui", "slot", { "type": "pattern", ...props }]
["render-ui", "slot", null]  # Clear slot
```

**Slots**: `main`, `sidebar`, `modal`, `drawer`, `overlay`, `center`, `hud-top`, `hud-bottom`

**Patterns by category** (from registry):
**header**: `page-header`, `title-only`
**display**: `entity-table`, `entity-list`, `entity-cards`, `entity-detail`, `detail-panel`
**form**: `form`, `form-section`, `form-fields`
**filter**: `search-bar`, `search-input`, `filter-group`
**state**: `empty-state`, `loading-state`, `error-state`, `notification`
**navigation**: `tabs`, `tab-bar`, `breadcrumb`, `wizard-progress`, `wizard-navigation`, `wizard-container`, `pagination`
**layout**: `split-layout`, `master-detail`, `tabbed-layout`, `vstack`, `hstack`, `box`, `grid`, `center`, `spacer`, `divider`, `custom`
**dashboard**: `stats`, `dashboard-grid`
**container**: `modal`, `modal-container`, `drawer`, `drawer-container`, `confirm-dialog`
**game**: `game-canvas`, `game-hud`, `game-controls`, `game-menu`, `game-pause-overlay`, `game-over-screen`, `level-select`, `game-debug-panel`, `tilemap-renderer`, `inventory-panel`, `dialogue-box`, `input-listener`, `collision-detector`, `card-hand`, `card-deck`, `board-grid`, `turn-indicator`, `match3-grid`, `puzzle-board`
**component**: `button`, `button-group`, `icon-button`, `link`, `text`, `heading`, `badge`, `avatar`, `icon`, `image`, `card`, `progress-bar`, `spinner`, `input`, `textarea`, `select`, `checkbox`, `radio`, `switch`, `label`, `alert`, `tooltip`, `popover`, `menu`, `accordion`, `container`, `simple-grid`, `float-button`
**debug**: `runtime-debugger`
**meta**: `pattern-proposal`

**Key pattern details**:
- `entity-table`: Data table with columns and sorting (**columns**, **itemActions**, **emptyIcon**, **emptyTitle**)
- `form-section`: Group of related input fields (**onSubmit**, **onCancel**, **layout**, **gap**)
- `page-header`: Page title with optional breadcrumb and action buttons (**title**, **subtitle**, **showBack**, **backEvent**)
- `tabs`: Tab navigation within page (**items**, **tabs**, **defaultActiveTab**, **activeTab**)
- `dashboard-grid`: Multi-column grid for widgets and stats cards (**columns**, **gap**, **cells**)
- `confirmation`: confirmation
- `game-canvas`: Main game rendering area (canvas) (**renderEntities**, **renderers**, **renderer**, **background**)
- `runtime-debugger`: Debug overlay showing FPS, entity states, event logs (**position**, **defaultCollapsed**)
- `button`: undefined
- `input`: undefined
- `card`: undefined

### Pattern Actions Reference (CRITICAL - Use Unified Props)

**Actions are INSIDE patterns, NOT separate patterns!**

```
❌ WRONG: ["render-ui", "main", { "type": "form-actions", "actions": [...] }]  // form-actions does NOT exist!
✅ CORRECT: form-section has submitEvent/cancelEvent (NOT onSubmit/onCancel)
```

| Pattern | Action Props (UNIFIED) | Example |
|---------|------------------------|---------|
| `page-header` | `actions`, `showBack`, `backEvent` | `{"type": "page-header", "title": "Tasks", "showBack": true, "actions": [{"label": "New", "event": "CREATE"}]}` |
| `form-section` | `submitEvent`, `cancelEvent` | `{"type": "form-section", "entity": "Task", "submitEvent": "SAVE", "cancelEvent": "CANCEL"}` |
| `entity-table` | `itemActions: [{label, event}]` | `{"type": "entity-table", "itemActions": [{"label": "Edit", "event": "EDIT"}]}` |
| `entity-detail` | `actions: [{label, event}]` | `{"type": "entity-detail", "actions": [{"label": "Edit", "event": "EDIT"}]}` |
| `confirmation` | emits action events | `{"type": "confirmation", "title": "Delete?", "message": "..."}` |

**Key Rules**:
1. The pattern itself provides the action UI. Never create a separate "actions" pattern.
2. **NEVER use**: `onSubmit`, `onCancel`, `headerActions`, `onConfirm` (these are DEPRECATED)
3. **ALWAYS use**: `submitEvent`, `cancelEvent`, `actions` (unified props)

### Key Pattern Props (Unified)

**Use ONLY these props. Aliases will fail validation.**

| Interface | Key Props |
|-----------|----------|
| EntityBoundPatternProps | `isLoading`, `error`, `entity`, `data`, `fieldNames`, ... |
| FormPatternProps | `isLoading`, `error`, `entity`, `fields`, `initialData`, ... |
| InteractivePatternProps | `isLoading`, `error`, `action`, `payload`, `actions` |

**Common patterns:**
- `entity-table`, `entity-cards`, `entity-list` → EntityBoundPatternProps
- `form-section` → FormPatternProps (`submitEvent`, `cancelEvent`, `fields`)
- `page-header` → InteractivePatternProps (`actions`)

**❌ NEVER use:** `loading`, `onSubmit`, `primaryAction`, `cardFields`


---

## Key std/* Behaviors (Copy These Patterns)

**⚠️ UNIFIED PROPS: Use `submitEvent`/`cancelEvent` NOT `onSubmit`/`onCancel`. Use `actions` NOT `headerActions`.**

### std/List (CRUD Entity Management)
```
States: Browsing → Creating → Viewing → Editing → Deleting
Events: INIT, CREATE, VIEW, EDIT, DELETE, SAVE, CANCEL, CONFIRM_DELETE
```

**Pattern:**
```json
{
  "from": "Browsing", "to": "Browsing", "event": "INIT",
  "effects": [
    ["render-ui", "main", { "type": "page-header", "title": "Tasks", "actions": [{"label": "New", "event": "CREATE", "variant": "primary"}] }],
    ["render-ui", "main", { "type": "entity-table", "entity": "Task", "columns": ["title", "status"], "itemActions": [{"label": "View", "event": "VIEW"}, {"label": "Edit", "event": "EDIT"}, {"label": "Delete", "event": "DELETE"}] }]
  ]
},
{
  "from": "Browsing", "to": "Creating", "event": "CREATE",
  "effects": [["render-ui", "modal", { "type": "form-section", "entity": "Task", "fields": ["title", "status"], "submitEvent": "SAVE", "cancelEvent": "CANCEL" }]]
},
{
  "from": "Browsing", "to": "Viewing", "event": "VIEW",
  "effects": [["render-ui", "drawer", { "type": "entity-detail", "entity": "Task", "actions": [{"label": "Edit", "event": "EDIT"}, {"label": "Delete", "event": "DELETE", "variant": "danger"}] }]]
},
{
  "from": "Creating", "to": "Browsing", "event": "SAVE",
  "effects": [["persist", "create", "Task", "@payload.data"], ["render-ui", "modal", null], ["emit", "INIT"]]
},
{
  "from": "Creating", "to": "Browsing", "event": "CANCEL",
  "effects": [["render-ui", "modal", null]]
},
{
  "from": "Browsing", "to": "Deleting", "event": "DELETE",
  "effects": [["render-ui", "overlay", { "type": "confirmation", "title": "Delete Task?", "message": "This cannot be undone." }]]
}
```

**Note**: Actions are INSIDE patterns (page-header has `actions`, entity-table has `itemActions`, form-section has `submitEvent/cancelEvent`). No separate form-actions pattern!

### std/Wizard (Multi-Step Flow - States = Steps)
```
States: Step1 → Step2 → Step3 → Complete (each step is a STATE, not an index!)
Events: INIT, NEXT, PREV, SUBMIT
```

**Pattern:**
```json
{
  "from": "Step1", "to": "Step1", "event": "INIT",
  "effects": [
    ["render-ui", "hud-top", { "type": "wizard-progress", "steps": ["Basic Info", "Preferences", "Review"], "current": 0 }],
    ["render-ui", "main", { "type": "form-section", "entity": "User", "fields": ["name", "email"], "submitEvent": "NEXT" }]
  ]
},
{
  "from": "Step1", "to": "Step2", "event": "NEXT",
  "effects": [
    ["render-ui", "hud-top", { "type": "wizard-progress", "steps": ["Basic Info", "Preferences", "Review"], "current": 1 }],
    ["render-ui", "main", { "type": "form-section", "entity": "User", "fields": ["theme", "notifications"], "submitEvent": "NEXT", "cancelEvent": "PREV" }]
  ]
},
{
  "from": "Step2", "to": "Step1", "event": "PREV",
  "effects": [["emit", "INIT"]]
},
{
  "from": "Step2", "to": "Step3", "event": "NEXT",
  "effects": [
    ["render-ui", "hud-top", { "type": "wizard-progress", "steps": ["Basic Info", "Preferences", "Review"], "current": 2 }],
    ["render-ui", "main", { "type": "entity-detail", "entity": "User", "fieldNames": ["name", "email", "theme"] }],
    ["render-ui", "main", { "type": "form-section", "submitLabel": "Complete", "submitEvent": "SUBMIT", "cancelEvent": "PREV" }]
  ]
}
```

**Key**: Each wizard step is a STATE. form-section always has `submitEvent` to connect to the event.

### std/Filter + std/Search (Combined)
```
States: Active (single state)
Events: INIT, SET_FILTER, CLEAR_FILTER, SEARCH
```

**Combine with std/List by adding filter-group to INIT effects:**
```json
{
  "from": "Browsing", "to": "Browsing", "event": "INIT",
  "effects": [
    ["render-ui", "main", { "type": "page-header", "title": "Tasks", "actions": [{"label": "New", "event": "CREATE"}] }],
    ["render-ui", "main", { "type": "filter-group", "filterType": "tabs", "filters": [{"field": "status", "options": [{"value": null, "label": "All"}, {"value": "active", "label": "Active"}, {"value": "done", "label": "Done"}]}] }],
    ["render-ui", "main", { "type": "entity-table", "entity": "Task", "columns": ["title", "status"] }]
  ]
}
```


---

## std/* Behaviors (Generation Templates)

**IMPORTANT**: These are templates that guide the LLM. Copy the state machine pattern and adapt to your entity.

### ui-interaction

#### std/List

**Entity list management with CRUD operations**

Use for: Entity listing pages, Admin panels, Data management screens

```
States: Browsing → Creating → Viewing → Editing → Deleting
Initial: Browsing
Events: INIT, CREATE, VIEW, EDIT, DELETE, CONFIRM_DELETE, CANCEL, SAVE
```

**Key Transitions:**
```json
{ "from": "Browsing", "to": "Browsing", "event": "INIT", "effects": [["render-ui","main",{"type":"page-header","title":"@config.title","actions":[{"label":"Create","event":"CREATE","variant":"primary"}]}], ...] }
{ "from": "Browsing", "to": "Creating", "event": "CREATE", "effects": [["render-ui","modal",{"type":"form-section","entity":"@config.entity","mode":"create","submitEvent":"SAVE","cancelEvent":"CANCEL"}]] }
{ "from": "Browsing", "to": "Viewing", "event": "VIEW", "effects": [["set","@entity.selectedId","@payload.id"], ...] }
{ "from": "Browsing", "to": "Editing", "event": "EDIT", "effects": [["set","@entity.selectedId","@payload.id"], ...] }
{ "from": "Viewing", "to": "Editing", "event": "EDIT", "effects": [["render-ui","drawer",{"type":"form-section","entity":"@config.entity","id":"@entity.selectedId","mode":"edit","submitEvent":"SAVE","cancelEvent":"CANCEL"}]] }
```

#### std/Detail

**Single entity view with edit/delete capabilities**

Use for: Entity detail pages, Profile views, Settings pages

```
States: Viewing → Editing → Deleting
Initial: Viewing
Events: INIT, EDIT, SAVE, CANCEL, DELETE, CONFIRM_DELETE
```

**Key Transitions:**
```json
{ "from": "Viewing", "to": "Viewing", "event": "INIT", "effects": [["render-ui","main",{"type":"page-header","title":"@entity.name","actions":[{"label":"Edit","event":"EDIT"},{"label":"Delete","event":"DELETE","variant":"danger"}]}], ...] }
{ "from": "Viewing", "to": "Editing", "event": "EDIT", "effects": [["render-ui","main",{"type":"form-section","entity":"@config.entity","mode":"edit","fields":"@config.fields","submitEvent":"SAVE","cancelEvent":"CANCEL"}]] }
{ "from": "Editing", "to": "Viewing", "event": "SAVE", "effects": [["persist","update","@config.entity","@payload.data"], ...] }
{ "from": "Editing", "to": "Viewing", "event": "CANCEL", "effects": [["emit","INIT"]] }
{ "from": "Viewing", "to": "Deleting", "event": "DELETE", "effects": [["render-ui","modal",{"type":"confirmation","title":"Delete Confirmation","message":"Are you sure you want to delete this item?"}]] }
```

#### std/Form

**Form state management with validation and submission**

Use for: Create/edit forms, Settings forms, Multi-field input

```
States: Idle → Editing → Validating → Submitting → Success → Error
Initial: Idle
Events: INIT, FIELD_CHANGE, FIELD_BLUR, SUBMIT, VALIDATION_PASSED, VALIDATION_FAILED, SUBMIT_SUCCESS, SUBMIT_ERROR, RESET
```

**Key Transitions:**
```json
{ "from": "Idle", "to": "Editing", "event": "INIT", "effects": [["render-ui","main",{"type":"form-section","entity":"@config.entity","fields":"@config.fields","values":"@entity.values","errors":"@entity.errors","submitEvent":"SUBMIT","cancelEvent":"@config.cancelEvent"}]] }
{ "from": "Editing", "to": "Editing", "event": "FIELD_CHANGE", "effects": [["set","@entity.values",["object/set","@entity.values","@payload.field","@payload.value"]], ...] }
{ "from": "Editing", "to": "Editing", "event": "FIELD_BLUR", "effects": [["set","@entity.touched",["object/set","@entity.touched","@payload.field",true]]] }
{ "from": "Editing", "to": "Validating", "event": "SUBMIT", "effects": [["let",[["result",["validate/check","@entity.values","@config.validation"]]],["if","@result.valid",["emit","VALIDATION_PASSED"],["do",["set","@entity.errors","@result.errors"],["emit","VALIDATION_FAILED"]]]]] }
{ "from": "Validating", "to": "Submitting", "event": "VALIDATION_PASSED", "effects": [["set","@entity.isSubmitting",true], ...] }
```

#### std/Modal

**Modal dialog with open/close state management**

Use for: Confirmation dialogs, Create forms, Detail views

```
States: Closed → Open
Initial: Closed
Events: OPEN, CLOSE, CONFIRM
```

**Key Transitions:**
```json
{ "from": "Closed", "to": "Open", "event": "OPEN", "effects": [["set","@entity.content","@payload.content"], ...] }
{ "from": "Open", "to": "Closed", "event": "CLOSE", "effects": [["render-ui","modal",null]] }
{ "from": "Open", "to": "Closed", "event": "CONFIRM", "effects": [["render-ui","modal",null]] }
```

#### std/Drawer

**Side drawer panel for detail views and forms**

Use for: Detail panels, Edit forms, Property panels

```
States: Closed → Open
Initial: Closed
Events: OPEN, CLOSE
```

**Key Transitions:**
```json
{ "from": "Closed", "to": "Open", "event": "OPEN", "effects": [["set","@entity.content","@payload.content"], ...] }
{ "from": "Open", "to": "Closed", "event": "CLOSE", "effects": [["render-ui","drawer",null]] }
```

#### std/Tabs

**Tabbed navigation within a page**

Use for: Multi-view pages, Settings with sections, Dashboard tabs

```
States: Active
Initial: Active
Events: INIT, SELECT_TAB
```

**Key Transitions:**
```json
{ "from": "Active", "to": "Active", "event": "INIT", "effects": [["set","@entity.activeTab","@config.defaultTab"], ...] }
{ "from": "Active", "to": "Active", "event": "SELECT_TAB", "effects": [["set","@entity.activeTab","@payload.tabId"]] }
```

#### std/Wizard

**Multi-step wizard flow - each step is a state**

Use for: Onboarding flows, Multi-step forms, Setup wizards

```
States: Step1 → Step2 → Step3 → Complete
Initial: Step1
Events: INIT, NEXT, PREV, COMPLETE
```

**Key Transitions:**
```json
{ "from": "Step1", "to": "Step1", "event": "INIT", "effects": [["render-ui","main",{"type":"wizard-progress","steps":["Step 1","Step 2","Step 3"],"current":0}], ...] }
{ "from": "Step1", "to": "Step2", "event": "NEXT", "effects": [["set","@entity.stepData.step1","@payload"], ...] }
{ "from": "Step2", "to": "Step1", "event": "PREV", "effects": [["emit","INIT"]] }
{ "from": "Step2", "to": "Step3", "event": "NEXT", "effects": [["set","@entity.stepData.step2","@payload"], ...] }
{ "from": "Step3", "to": "Step2", "event": "PREV", "effects": [["render-ui","main",{"type":"wizard-progress","steps":["Step 1","Step 2","Step 3"],"current":1}], ...] }
```

#### std/MasterDetail

**Master-detail layout with synchronized list and detail views**

Use for: Email clients, File managers, Two-panel layouts

```
States: NoSelection → Selected
Initial: NoSelection
Events: INIT, SELECT, DESELECT
```

**Key Transitions:**
```json
{ "from": "NoSelection", "to": "NoSelection", "event": "INIT", "effects": [["render-ui","main",{"type":"master-detail","entity":"@config.entity","masterColumns":"@config.masterColumns","onSelect":"SELECT","selected":"@entity.selectedId"}], ...] }
{ "from": "NoSelection", "to": "Selected", "event": "SELECT", "effects": [["set","@entity.selectedId","@payload.id"], ...] }
{ "from": "Selected", "to": "Selected", "event": "SELECT", "effects": [["set","@entity.selectedId","@payload.id"], ...] }
{ "from": "Selected", "to": "NoSelection", "event": "DESELECT", "effects": [["set","@entity.selectedId",null], ...] }
```

#### std/Filter

**Filter and search management for lists**

Use for: Filtered lists, Search interfaces, Faceted navigation

```
States: Idle → Filtering
Initial: Idle
Events: INIT, SET_FILTER, CLEAR_FILTERS, SEARCH
```

**Key Transitions:**
```json
{ "from": "Idle", "to": "Idle", "event": "INIT", "effects": [["render-ui","main",{"type":"filter-group","filters":"@config.filters","values":"@entity.filters","onFilterChange":"SET_FILTER","onClear":"CLEAR_FILTERS"}]] }
{ "from": "Idle", "to": "Filtering", "event": "SET_FILTER", "effects": [["set","@entity.filters",["object/set","@entity.filters","@payload.field","@payload.value"]], ...] }
{ "from": "Filtering", "to": "Idle", "event": "SET_FILTER", "effects": [["set","@entity.filters",["object/set","@entity.filters","@payload.field","@payload.value"]], ...] }
{ "from": "Filtering", "to": "Idle", "event": "CLEAR_FILTERS", "effects": [["set","@entity.filters",{}], ...] }
{ "from": "Idle", "to": "Filtering", "event": "SEARCH", "effects": [["set","@entity.searchTerm","@payload.term"], ...] }
```

### data-management

#### std/Pagination

**Page-based navigation for large data sets**

Use for: Large lists, Table pagination, Infinite scroll alternative

```
States: Active
Initial: Active
Events: INIT, NEXT_PAGE, PREV_PAGE, GO_TO_PAGE, SET_PAGE_SIZE
```

**Key Transitions:**
```json
{ "from": "*", "to": "*", "event": "INIT", "effects": [["set","@entity.page",1], ...] }
{ "from": "*", "to": "*", "event": "NEXT_PAGE", "guard": ["<","@entity.page",["math/ceil",["/","@entity.totalItems","@entity.pageSize"]]], "effects": [["set","@entity.page",["+","@entity.page",1]]] }
{ "from": "*", "to": "*", "event": "PREV_PAGE", "guard": [">","@entity.page",1], "effects": [["set","@entity.page",["-","@entity.page",1]]] }
{ "from": "*", "to": "*", "event": "GO_TO_PAGE", "guard": ["and",[">=","@payload.page",1],["<=","@payload.page",["math/ceil",["/","@entity.totalItems","@entity.pageSize"]]]], "effects": [["set","@entity.page","@payload.page"]] }
{ "from": "*", "to": "*", "event": "SET_PAGE_SIZE", "effects": [["set","@entity.pageSize","@payload.size"], ...] }
```

#### std/Selection

**Single or multi-selection management**

Use for: Multi-select lists, Bulk operations, Item picking

```
States: Active
Initial: Active
Events: INIT, SELECT, DESELECT, TOGGLE, SELECT_ALL, CLEAR
```

**Key Transitions:**
```json
{ "from": "*", "to": "*", "event": "INIT", "effects": [["set","@entity.selected",[]], ...] }
{ "from": "*", "to": "*", "event": "SELECT", "effects": [["if",["=","@config.mode","single"],["do",["set","@entity.selected",["@payload.id"]],["set","@entity.lastSelected","@payload.id"]],["if",["or",["not","@config.maxSelection"],["<",["array/len","@entity.selected"],"@config.maxSelection"]],["do",["set","@entity.selected",["array/append","@entity.selected","@payload.id"]],["set","@entity.lastSelected","@payload.id"]],["notify",{"type":"warning","message":"Maximum selection reached"}]]]] }
{ "from": "*", "to": "*", "event": "DESELECT", "effects": [["set","@entity.selected",["array/filter","@entity.selected",["fn","id",["!=","@id","@payload.id"]]]]] }
{ "from": "*", "to": "*", "event": "TOGGLE", "effects": [["if",["array/includes","@entity.selected","@payload.id"],["set","@entity.selected",["array/filter","@entity.selected",["fn","id",["!=","@id","@payload.id"]]]],["if",["or",["=","@config.mode","single"],["or",["not","@config.maxSelection"],["<",["array/len","@entity.selected"],"@config.maxSelection"]]],["set","@entity.selected",["if",["=","@config.mode","single"],["@payload.id"],["array/append","@entity.selected","@payload.id"]]],["notify",{"type":"warning","message":"Maximum selection reached"}]]]] }
{ "from": "*", "to": "*", "event": "SELECT_ALL", "guard": ["=","@config.mode","multi"], "effects": [["set","@entity.selected","@payload.ids"]] }
```

#### std/Sort

**Sorting by field with direction toggle**

Use for: Sortable tables, List ordering, Column headers

```
States: Active
Initial: Active
Events: INIT, SORT, TOGGLE_DIRECTION, CLEAR_SORT
```

**Key Transitions:**
```json
{ "from": "*", "to": "*", "event": "INIT", "effects": [["set","@entity.sortField","@config.defaultField"], ...] }
{ "from": "*", "to": "*", "event": "SORT", "effects": [["if",["=","@entity.sortField","@payload.field"],["set","@entity.sortDirection",["if",["=","@entity.sortDirection","asc"],"desc","asc"]],["do",["set","@entity.sortField","@payload.field"],["set","@entity.sortDirection","asc"]]]] }
{ "from": "*", "to": "*", "event": "TOGGLE_DIRECTION", "guard": ["!=","@entity.sortField",null], "effects": [["set","@entity.sortDirection",["if",["=","@entity.sortDirection","asc"],"desc","asc"]]] }
{ "from": "*", "to": "*", "event": "CLEAR_SORT", "effects": [["set","@entity.sortField",null], ...] }
```

#### std/Filter

**Query Singleton pattern for explicit filtering - use with entity-table query prop**

Use for: Filterable lists, Advanced search, Filter panels

```
States: Active
Initial: Active
Events: INIT, FILTER, SEARCH, SORT, CLEAR_FILTERS
```

**Key Transitions:**
```json
{ "from": "*", "to": "*", "event": "INIT", "effects": [["render-ui","sidebar",{"type":"filter-group","query":"@QueryState","filters":"@config.filters"}], ...] }
{ "from": "*", "to": "*", "event": "FILTER", "effects": [["set","@QueryState.status","@payload.status"], ...] }
{ "from": "*", "to": "*", "event": "SEARCH", "effects": [["set","@QueryState.search","@payload.searchTerm"]] }
{ "from": "*", "to": "*", "event": "SORT", "effects": [["set","@QueryState.sortBy","@payload.field"], ...] }
{ "from": "*", "to": "*", "event": "CLEAR_FILTERS", "effects": [["set","@QueryState.status",null], ...] }
```

#### std/Search

**Search with debounce - updates QueryState.search field**

Use for: Search inputs, Quick filters, Global search

```
States: Idle → Searching
Initial: Idle
Events: INIT, SEARCH, CLEAR_SEARCH, SEARCH_COMPLETE
```

**Key Transitions:**
```json
{ "from": "*", "to": "*", "event": "INIT", "effects": [["set","@entity.search",""], ...] }
{ "from": "Idle", "to": "Searching", "event": "SEARCH", "guard": [">=",["str/len","@payload.term"],"@config.minLength"], "effects": [["set","@entity.search","@payload.term"], ...] }
{ "from": "Idle", "to": "Idle", "event": "SEARCH", "guard": ["<",["str/len","@payload.term"],"@config.minLength"], "effects": [["set","@entity.search","@payload.term"]] }
{ "from": "Searching", "to": "Idle", "event": "SEARCH_COMPLETE", "effects": [["set","@entity.isSearching",false]] }
{ "from": "*", "to": "*", "event": "CLEAR_SEARCH", "effects": [["set","@entity.search",""], ...] }
```

### async

#### std/Loading

**Loading state management with success/error handling**

Use for: Async data loading, API calls, Resource fetching

```
States: Idle → Loading → Success → Error
Initial: Idle
Events: START, SUCCESS, ERROR, RETRY, RESET
```

**Key Transitions:**
```json
{ "from": "Idle", "to": "Loading", "event": "START", "effects": [["set","@entity.isLoading",true], ...] }
{ "from": "Loading", "to": "Success", "event": "SUCCESS", "effects": [["set","@entity.isLoading",false], ...] }
{ "from": "Loading", "to": "Error", "event": "ERROR", "effects": [["set","@entity.isLoading",false], ...] }
{ "from": "Error", "to": "Loading", "event": "RETRY", "effects": [["set","@entity.isLoading",true], ...] }
{ "from": "Success|Error", "to": "Idle", "event": "RESET", "effects": [["set","@entity.isLoading",false], ...] }
```

#### std/Fetch

**Data fetching with caching and refresh capabilities**

Use for: API data fetching, Entity loading, Remote data

```
States: Idle → Fetching → Stale → Fresh → Error
Initial: Idle
Events: FETCH, FETCH_SUCCESS, FETCH_ERROR, REFRESH, INVALIDATE
```

**Key Transitions:**
```json
{ "from": "Idle|Stale", "to": "Fetching", "event": "FETCH", "effects": [["set","@entity.isFetching",true], ...] }
{ "from": "Fetching", "to": "Fresh", "event": "FETCH_SUCCESS", "effects": [["set","@entity.isFetching",false], ...] }
{ "from": "Fetching", "to": "Error", "event": "FETCH_ERROR", "effects": [["set","@entity.isFetching",false], ...] }
{ "from": "Fresh", "to": "Stale", "event": "INVALIDATE", "effects": [["set","@entity.lastFetchedAt",null]] }
{ "from": "Fresh|Stale|Error", "to": "Fetching", "event": "REFRESH", "effects": [["set","@entity.isFetching",true], ...] }
```

#### std/Submit

**Async submission with retry capabilities**

Use for: Form submission, Data saving, API mutations

```
States: Idle → Submitting → Success → Error
Initial: Idle
Events: SUBMIT, SUBMIT_SUCCESS, SUBMIT_ERROR, RETRY, RESET
```

**Key Transitions:**
```json
{ "from": "Idle", "to": "Submitting", "event": "SUBMIT", "effects": [["set","@entity.isSubmitting",true], ...] }
{ "from": "Submitting", "to": "Success", "event": "SUBMIT_SUCCESS", "effects": [["set","@entity.isSubmitting",false], ...] }
{ "from": "Submitting", "to": "Error", "event": "SUBMIT_ERROR", "effects": [["set","@entity.isSubmitting",false], ...] }
{ "from": "Error", "to": "Submitting", "event": "RETRY", "effects": [["set","@entity.isSubmitting",true], ...] }
{ "from": "Success|Error", "to": "Idle", "event": "RESET", "effects": [["set","@entity.isSubmitting",false], ...] }
```

#### std/Retry

**Automatic retry with exponential backoff**

Use for: Network requests, Unreliable operations, Transient failures

```
States: Idle → Attempting → Waiting → Success → Failed
Initial: Idle
Events: START, ATTEMPT_SUCCESS, ATTEMPT_ERROR, RETRY_TICK, GIVE_UP, RESET
```

**Key Transitions:**
```json
{ "from": "Idle", "to": "Attempting", "event": "START", "effects": [["set","@entity.attempt",1], ...] }
{ "from": "Attempting", "to": "Success", "event": "ATTEMPT_SUCCESS" }
{ "from": "Attempting", "to": "Waiting", "event": "ATTEMPT_ERROR", "guard": ["<","@entity.attempt","@config.maxAttempts"], "effects": [["set","@entity.error","@payload.error"], ...] }
{ "from": "Attempting", "to": "Failed", "event": "ATTEMPT_ERROR", "guard": [">=","@entity.attempt","@config.maxAttempts"], "effects": [["set","@entity.error","@payload.error"], ...] }
{ "from": "Waiting", "to": "Attempting", "event": "RETRY_TICK", "effects": [["set","@entity.attempt",["+","@entity.attempt",1]]] }
```

#### std/Poll

**Periodic polling with start/stop control**

Use for: Real-time updates, Status checking, Live data

```
States: Stopped → Polling → Paused
Initial: Stopped
Events: START, STOP, PAUSE, RESUME, POLL_TICK, POLL_SUCCESS, POLL_ERROR
```

**Key Transitions:**
```json
{ "from": "Stopped", "to": "Polling", "event": "START", "effects": [["set","@entity.isPolling",true], ...] }
{ "from": "Polling", "to": "Polling", "event": "POLL_TICK", "guard": ["or",["=","@config.maxPolls",null],["<","@entity.pollCount","@config.maxPolls"]], "effects": [["set","@entity.lastPollAt",["time/now"]]] }
{ "from": "Polling", "to": "Polling", "event": "POLL_SUCCESS", "effects": [["set","@entity.pollCount",["+","@entity.pollCount",1]], ...] }
{ "from": "Polling", "to": "Polling", "event": "POLL_ERROR", "effects": [["set","@entity.error","@payload.error"], ...] }
{ "from": "Polling", "to": "Paused", "event": "PAUSE", "effects": [["set","@entity.isPolling",false]] }
```

### feedback

#### std/Notification

**Toast notification with auto-dismiss**

Use for: Success messages, Error alerts, Status updates

```
States: Hidden → Visible → Dismissing
Initial: Hidden
Events: SHOW, HIDE, DISMISS, AUTO_DISMISS
```

**Key Transitions:**
```json
{ "from": "*", "to": "*", "event": "SHOW", "effects": [["let",[["id",["+","@entity.currentId",1]]],["do",["set","@entity.currentId","@id"],["set","@entity.notifications",["array/append","@entity.notifications",{"id":"@id","type":"@payload.type","message":"@payload.message","title":"@payload.title"}]],["when",[">","@config.autoDismissMs",0],["async/delay","@config.autoDismissMs",["emit","AUTO_DISMISS",{"id":"@id"}]]]]]] }
{ "from": "*", "to": "*", "event": "DISMISS", "effects": [["set","@entity.notifications",["array/filter","@entity.notifications",["fn","n",["!=","@n.id","@payload.id"]]]]] }
{ "from": "*", "to": "*", "event": "AUTO_DISMISS", "effects": [["set","@entity.notifications",["array/filter","@entity.notifications",["fn","n",["!=","@n.id","@payload.id"]]]]] }
{ "from": "*", "to": "*", "event": "HIDE", "effects": [["set","@entity.notifications",[]]] }
```

#### std/Confirmation

**Confirmation dialog with confirm/cancel actions**

Use for: Delete confirmation, Destructive actions, Important decisions

```
States: Closed → Open
Initial: Closed
Events: REQUEST, CONFIRM, CANCEL
```

**Key Transitions:**
```json
{ "from": "Closed", "to": "Open", "event": "REQUEST", "effects": [["set","@entity.title","@payload.title"], ...] }
{ "from": "Open", "to": "Closed", "event": "CONFIRM", "effects": [["render-ui","modal",null], ...] }
{ "from": "Open", "to": "Closed", "event": "CANCEL", "effects": [["render-ui","modal",null], ...] }
```

#### std/Undo

**Undo/redo stack for reversible actions**

Use for: Document editing, Form changes, Canvas operations

```
States: Ready
Initial: Ready
Events: PUSH, UNDO, REDO, CLEAR
```

**Key Transitions:**
```json
{ "from": "*", "to": "*", "event": "PUSH", "effects": [["set","@entity.undoStack",["array/slice",["array/prepend","@entity.undoStack",{"action":"@payload.action","data":"@payload.data","reverseAction":"@payload.reverseAction","reverseData":"@payload.reverseData","description":"@payload.description"}],0,"@config.maxHistory"]], ...] }
{ "from": "*", "to": "*", "event": "UNDO", "guard": [">",["array/len","@entity.undoStack"],0], "effects": [["let",[["action",["array/first","@entity.undoStack"]]],["do",["set","@entity.undoStack",["array/slice","@entity.undoStack",1]],["set","@entity.redoStack",["array/prepend","@entity.redoStack","@action"]],["emit","@action.reverseAction","@action.reverseData"]]]] }
{ "from": "*", "to": "*", "event": "REDO", "guard": [">",["array/len","@entity.redoStack"],0], "effects": [["let",[["action",["array/first","@entity.redoStack"]]],["do",["set","@entity.redoStack",["array/slice","@entity.redoStack",1]],["set","@entity.undoStack",["array/prepend","@entity.undoStack","@action"]],["emit","@action.action","@action.data"]]]] }
{ "from": "*", "to": "*", "event": "CLEAR", "effects": [["set","@entity.undoStack",[]], ...] }
```

---

**How to use std/* behaviors:**
1. Pick the behavior that matches your use case
2. Copy the state machine structure
3. Replace generic entity/fields with your specific entity
4. Adjust events and effects for your requirements
5. The trait becomes an inline trait in your orbital


---

## Flow Pattern Selection

Select a flow pattern based on application type:

| App Type | Flow Pattern | Structure |
|----------|--------------|-----------|
| Dashboard/Admin | hub-spoke | Central hub → feature pages → back to hub |
| CRM/List-focused | master-detail | List with drill-down drawer or split view |
| CRUD App | crud-cycle | List ↔ modal forms for create/edit |
| Onboarding/Checkout | linear | Step-by-step wizard flow |
| Multi-role | role-based | Role guards determine visible features |

**Flow → Almadar Structure:**
- hub-spoke: Dashboard almadar + feature orbitals with navigation
- master-detail: Entity almadar with detail drawer state
- crud-cycle: Entity almadar with modal form states
- linear: Step orbitals connected via navigation
- role-based: Shared orbitals with role-based guards


---

## Almadar Decomposition Protocol

### Step 0: Classify Domain
| Domain | Keywords | Key Traits |
|--------|----------|------------|
| business | manage, track, woralmadar | EntityManagement, SearchAndFilter |
| game | play, score, level | Physics2D, Health, GameState |
| form | wizard, onboarding | Wizard, FormSubmission |
| dashboard | metrics, KPI | EntityManagement |
| content | blog, CMS | none (page navigation) |

### Step 1: Identify Entities (ONE Almadar Per Entity)
- What are the core data objects?
- persistent (DB), runtime (memory), or singleton (config)?
- **CRITICAL: Create exactly ONE almadar per entity** - do NOT split CRUD operations into separate orbitals

### Step 2: Select Interaction Model
| Domain | Create | View | Edit | Delete |
|--------|--------|------|------|--------|
| business | modal | drawer | modal | confirm |
| game | none | none | none | none |
| form | wizard | drawer | page | confirm |

### Step 3: Choose Traits
- Business: EntityManagement (handles CRUD via render-ui)
- Game: Physics2D, Health, Score, Collision
- Form: Wizard (multi-step) or FormSubmission (single)

### Step 4: Define State Machine
```
states: Identify user-facing modes (browsing, creating, editing, viewing)
events: Identify user actions (INIT, CREATE, VIEW, EDIT, SAVE, CLOSE)
transitions: Map (from, event) → (to, effects)
```

### Step 5: Add INIT Transition (CRITICAL)
Every trait MUST have:
```json
{ "from": "initial", "to": "initial", "event": "INIT", "effects": [["render-ui", ...]] }
```
Without INIT, the page loads blank!

### Step 6: Define Pages
- ONE page per entity (business) or woralmadar (form)
- Attach traits to pages via `traits` array
- No `sections` array - UI comes from render-ui effects

### Step 7: Add Guards (CRITICAL for Business Rules)

**Guards enforce business rules as S-expressions on transitions.**

#### When to use guards:
1. **Business rule validation** - Enforce constraints on SAVE transitions
2. **Conditional routing** - Same (from, event) leads to different states

#### Business Rule Guards (on SAVE):
```json
{
  "from": "Editing", "to": "Browsing", "event": "SAVE",
  "guard": ["and",
    ["<=", "@payload.data.age", 120],
    [">=", "@payload.data.balance", 0]
  ],
  "effects": [["persist", "update", "Account", "@payload.data"], ...]
}
```

#### Conditional Routing Guards:
```json
{ "from": "A", "to": "B", "event": "X", "guard": [">", "@entity.health", 0] }
{ "from": "A", "to": "C", "event": "X", "guard": ["<=", "@entity.health", 0] }
```

**IMPORTANT**:
- Use `"guard"` (singular) on transitions, NOT `"guards"` (plural)
- Business rules MUST be S-expression guards on the transition, NOT just UI messages!


---

## Almadar Output Format

Each almadar MUST include embedded context for portability:

```json
{
  "name": "Order Management",
  "entity": {
    "name": "Order",
    "persistence": "persistent",
    "fields": [
      { "name": "customerId", "type": "relation", "relation": { "entity": "Customer", "cardinality": "one" } },
      { "name": "items", "type": "relation", "relation": { "entity": "MenuItem", "cardinality": "many" } }
    ]
  },
  "traits": ["EntityManagement"],
  "domainContext": {
    "request": "<full user request>",
    "requestFragment": "<verbatim excerpt for THIS orbital>",
    "category": "business",
    "vocabulary": { "item": "Order", "create": "Place Order", "delete": "Cancel" }
  },
  "design": {
    "style": "modern",
    "uxHints": { "flowPattern": "crud-cycle", "listPattern": "entity-table", "formPattern": "modal" }
  },
  "emits": ["ORDER_READY", "ORDER_COMPLETED"],
  "listens": [{ "event": "MENU_ITEM_UNAVAILABLE", "triggers": "DISABLE_ITEM" }],
  "relations": [
    { "entity": "Customer", "cardinality": "one" },
    { "entity": "MenuItem", "cardinality": "many" }
  ]
}
```

**Required context fields:**
- `domainContext.requestFragment` - What user said that produced this orbital
- `domainContext.category` - Domain classification
- `domainContext.vocabulary` - Domain-specific naming
- `design.uxHints` - Pattern selection hints

**Cross-almadar connectivity (for multi-entity apps):**
- `entity.fields[].relation` - Link to related entities
- `emits` - Events this almadar emits when state changes
- `listens` - Events from other orbitals to handle
- `relations` - Summary of entity relationships


---

## Almadar Connectivity (CRITICAL)

Orbitals must NOT be discrete islands. For multi-entity apps, connect orbitals properly:

### 1. Entity Relations (REQUIRED for related entities)
When Entity A references Entity B, add a relation field:
```json
// In Order orbital's entity.fields:
{ "name": "customerId", "type": "relation", "relation": { "entity": "Customer", "cardinality": "one" } }
{ "name": "items", "type": "relation", "relation": { "entity": "MenuItem", "cardinality": "many" } }
```

### 2. Navigation Links (in design.uxHints.relatedLinks)
Enable drill-down from one almadar to another:
```json
{ "relatedLinks": [{ "relation": "customerId", "label": "View Customer", "targetView": "detail" }] }
```

### 3. Cross-Almadar Events (emits/listens)
Orbitals communicate via events:
```json
// Order almadar emits when status changes:
{ "emits": ["ORDER_READY", "ORDER_COMPLETED"] }

// Notification almadar listens:
{ "listens": [{ "event": "ORDER_READY", "triggers": "NOTIFY_CUSTOMER" }] }
```

**CRITICAL: For multi-entity apps:**
- Add relation fields to connect entities (e.g., Order → Customer, Order → MenuItem)
- Add emits/listens when one orbital's state change affects another
- Add relatedLinks for navigation between related records


---

## Context Usage
- `domainContext.vocabulary` → labels (item, create, delete)
- `design.uxHints.listPattern` → entity-table | entity-cards | entity-list
- `design.uxHints.formPattern` → modal | drawer | page
- `design.uxHints.relatedLinks` → navigation to related orbitals


---

## Critical Rules

### NEVER Use @payload in set Effects (CRITICAL)

The `set` effect modifies entity state. **@payload is READ-ONLY** - it contains event data.

```json
// WRONG - @payload is read-only!
["set", "@payload.data.createdAt", "@now"]
["set", "@payload.data.status", "active"]

// CORRECT - Use @entity to modify state
["set", "@entity.createdAt", "@now"]
["set", "@entity.status", "active"]
```

**Rule:** `set` target MUST start with `@entity`, never `@payload`.

### INIT Transition Required (CRITICAL)

Every trait MUST have an INIT self-loop transition. The runtime fires `INIT` when page loads.

```json
// REQUIRED in EVERY trait:
{
  "from": "Browsing",
  "to": "Browsing",
  "event": "INIT",  // ← Runtime fires this on page load
  "effects": [
    ["render-ui", "main", { "type": "page-header", ... }],
    ["render-ui", "main", { "type": "entity-table", ... }]
  ]
}
```

Without INIT: Page loads blank, nothing renders, no UI appears.

### Valid Patterns ONLY (CRITICAL)

**DO NOT invent custom patterns!** Only these patterns exist:

| Category | Valid Patterns |
|----------|----------------|
| Header | `page-header`, `title-only` |
| Display | `entity-table`, `entity-list`, `entity-cards`, `entity-detail`, `stats` |
| Form | `form-section`, `form-fields` |
| Filter | `search-bar`, `search-input`, `filter-group` |
| State | `empty-state`, `loading-state`, `error-state` |
| Navigation | `tabs`, `breadcrumb` |
| Layout | `dashboard-grid`, `split-layout`, `master-detail`, `tabbed-layout`, `grid`, `board-grid`, `match3-grid`, `simple-grid` |
| Game | `game-canvas`, `game-hud`, `game-controls`, `game-menu`, `game-pause-overlay`, `game-over-screen`, `level-select`, `game-debug-panel`, `tilemap-renderer`, `inventory-panel`, `dialogue-box` |


**NEVER use**: `onboarding-welcome`, `category-selector`, `assessment-question`, etc. - these DO NOT exist!

### Valid viewType Values

Pages must use valid viewType values: `list`, `detail`, `create`, `edit`, `dashboard`, `custom`

Invalid values like `form`, `wizard`, `onboarding` will cause validation errors.

### Key Pattern Props (Unified)

**Use ONLY these props. Aliases will fail validation.**

| Interface | Key Props |
|-----------|----------|
| EntityBoundPatternProps | `isLoading`, `error`, `entity`, `data`, `fieldNames`, ... |
| FormPatternProps | `isLoading`, `error`, `entity`, `fields`, `initialData`, ... |
| InteractivePatternProps | `isLoading`, `error`, `action`, `payload`, `actions` |

**Common patterns:**
- `entity-table`, `entity-cards`, `entity-list` → EntityBoundPatternProps
- `form-section` → FormPatternProps (`submitEvent`, `cancelEvent`, `fields`)
- `page-header` → InteractivePatternProps (`actions`)

**❌ NEVER use:** `loading`, `onSubmit`, `primaryAction`, `cardFields`


### Pattern Actions Reference (CRITICAL - Use Unified Props)

**Actions are INSIDE patterns, NOT separate patterns!**

```
❌ WRONG: ["render-ui", "main", { "type": "form-actions", "actions": [...] }]  // form-actions does NOT exist!
✅ CORRECT: form-section has submitEvent/cancelEvent (NOT onSubmit/onCancel)
```

| Pattern | Action Props (UNIFIED) | Example |
|---------|------------------------|---------|
| `page-header` | `actions`, `showBack`, `backEvent` | `{"type": "page-header", "title": "Tasks", "showBack": true, "actions": [{"label": "New", "event": "CREATE"}]}` |
| `form-section` | `submitEvent`, `cancelEvent` | `{"type": "form-section", "entity": "Task", "submitEvent": "SAVE", "cancelEvent": "CANCEL"}` |
| `entity-table` | `itemActions: [{label, event}]` | `{"type": "entity-table", "itemActions": [{"label": "Edit", "event": "EDIT"}]}` |
| `entity-detail` | `actions: [{label, event}]` | `{"type": "entity-detail", "actions": [{"label": "Edit", "event": "EDIT"}]}` |
| `confirmation` | emits action events | `{"type": "confirmation", "title": "Delete?", "message": "..."}` |

**Key Rules**:
1. The pattern itself provides the action UI. Never create a separate "actions" pattern.
2. **NEVER use**: `onSubmit`, `onCancel`, `headerActions`, `onConfirm` (these are DEPRECATED)
3. **ALWAYS use**: `submitEvent`, `cancelEvent`, `actions` (unified props)

### Page Structure Required (CRITICAL)

Every page MUST have `path` and `traits` properties:

```json
// WRONG - missing path and traits:
{
  "pages": [{
    "name": "TasksPage",
    "entity": "Task"  // ❌ Missing path and traits!
  }]
}

// CORRECT - complete page definition:
{
  "pages": [{
    "name": "TasksPage",
    "path": "/tasks",           // ← REQUIRED: starts with /
    "traits": [{ "ref": "TaskManagement" }]  // ← REQUIRED: trait-driven UI
  }]
}
```

Without `path`: Validation error `ORB_P_MISSING_PATH`
Without `traits`: Validation error `ORB_P_MISSING_TRAITS`

### Valid Field Types ONLY (CRITICAL)

Field types MUST be one of: `string`, `number`, `boolean`, `date`, `timestamp`, `datetime`, `array`, `object`, `enum`, `relation`

```json
// WRONG - using entity name as type:
{ "name": "author", "type": "User" }           // ❌ "User" is not a valid type!
{ "name": "post", "type": "BlogPost" }         // ❌ Invalid!

// CORRECT - use relation type with entity reference:
{ "name": "author", "type": "relation", "relation": { "entity": "User", "cardinality": "one" } }
{ "name": "post", "type": "relation", "relation": { "entity": "BlogPost", "cardinality": "one" } }

// CORRECT for arrays of primitives:
{ "name": "tags", "type": "array", "items": { "type": "string" } }

// CORRECT for enums:
{ "name": "status", "type": "enum", "values": ["pending", "active", "done"] }
```

### Event Listeners Structure

Event listeners go INSIDE traits, not at almadar level:

```json
// WRONG - at almadar level:
{
  "name": "Task Management",
  "listens": ["SOME_EVENT"]  // ❌ Wrong location, wrong format
}

// CORRECT - inside trait:
{
  "traits": [{
    "name": "TaskInteraction",
    "listens": [
      { "event": "USER_UPDATED", "handler": "REFRESH_LIST" }  // ✅ Object format
    ]
  }]
}
```

---

## Common Errors (AVOID)

### 1. Missing INIT Transition
```
WRONG: No INIT transition → Page loads blank
CORRECT: { "from": "browsing", "to": "browsing", "event": "INIT", "effects": [...render-ui...] }
```

### 2. Over-Generating Pages
```
WRONG: TaskListPage, TaskCreatePage, TaskEditPage, TaskViewPage (4 pages!)
CORRECT: TasksPage with EntityManagement trait (1 page)
```

### 3. Duplicate Slot Rendering
```
WRONG: Two traits both render to "main" on page load
CORRECT: ONE trait owns each slot
```

### 4. Missing onSubmit in form-section
```
WRONG: { "type": "form-section", "entity": "Task" }
CORRECT: { "type": "form-section", "entity": "Task", "onSubmit": "SAVE" }
```

### 5. Duplicate Transitions (Same from+event)
```
WRONG: Two transitions with same "from" and "event" without guards
CORRECT: Use GUARDS to differentiate transitions
```

### 6. Using "render" Instead of "render-ui"
```
WRONG: ["render", "main", {...}]
CORRECT: ["render-ui", "main", {...}]
```

### 7. Generating Sections Array (Legacy)
```
WRONG: { "pages": [{ "sections": [...] }] }
CORRECT: { "pages": [{ "traits": [...] }] } - UI comes from render-ui effects
```

### 8. Using form-actions Pattern (DOES NOT EXIST!)
```
WRONG: ["render-ui", "main", { "type": "form-actions", "actions": [...] }]
CORRECT: Use form-section with onSubmit/onCancel props:
         { "type": "form-section", "entity": "Task", "fields": [...], "onSubmit": "SAVE", "onCancel": "CANCEL" }
```
Actions are INSIDE patterns, not separate patterns. The form-section pattern includes submit/cancel buttons.

### 9. Forgetting itemActions in entity-table
```
WRONG: { "type": "entity-table", "entity": "Task" }  // No row actions
CORRECT: { "type": "entity-table", "entity": "Task", "itemActions": [{"label": "Edit", "event": "EDIT"}, {"label": "Delete", "event": "DELETE"}] }
```

### 10. Duplicate Trait Names Across Orbitals
```
WRONG: UserOrbital uses "EntityManagement", TaskOrbital uses "EntityManagement"
CORRECT: UserOrbital uses "UserManagement", TaskOrbital uses "TaskManagement"
```
Each trait name MUST be unique. Pattern: `{Entity}{Purpose}`

### 11. Using @payload in set Effect
```
WRONG: ["set", "@payload.acceptedAt", "@now"]  // @payload is read-only!
CORRECT: ["set", "@entity.acceptedAt", "@now"]  // set modifies entity state
```
`set` effect MUST use `@entity.field` binding. `@payload` is read-only event data.

### 12. Hallucinated itemAction Properties
```
WRONG: { "label": "View", "event": "VIEW", "condition": "@entity.status === 'active'" }
CORRECT: { "label": "View", "event": "VIEW", "showWhen": ["=", "@entity.status", "active"] }
```
Valid itemAction props: `label`, `event`, `navigatesTo`, `placement`, `variant`, `showWhen`
Note: `showWhen` is defined but NOT yet implemented - actions always visible.

### 14. Missing Page Path
```
WRONG: { "pages": [{ "name": "TasksPage", "entity": "Task" }] }
CORRECT: { "pages": [{ "name": "TasksPage", "path": "/tasks", "traits": [...] }] }
```

### 15. Using Entity Name as Field Type
```
WRONG: { "name": "author", "type": "User" }
CORRECT: { "name": "author", "type": "relation", "relation": { "entity": "User", "cardinality": "one" } }
```

### 16. Missing Traits Array on Page
```
WRONG: { "pages": [{ "name": "TasksPage", "path": "/tasks" }] }
CORRECT: { "pages": [{ "name": "TasksPage", "path": "/tasks", "traits": [{ "ref": "TaskManagement" }] }] }
```

### 13. Wrong Filtering Pattern (Use Query Singleton)
```
WRONG: Individual filter buttons with manual FILTER events
       { "type": "button", "label": "Active", "action": "FILTER", "data": { "status": "active" } }

CORRECT: Use Query Singleton entity + filter-group pattern:
```

**Query Singleton Pattern for Filtering:**

1. Define a singleton entity to hold filter state:
```json
{
  "name": "TaskQuery",
  "entity": {
    "name": "TaskQuery",
    "singleton": true,
    "runtime": true,
    "fields": [
      { "name": "status", "type": "string" },
      { "name": "search", "type": "string" }
    ]
  }
}
```

2. Use `set` effects to update filter state:
```json
{
  "from": "Browsing", "to": "Browsing", "event": "FILTER",
  "effects": [["set", "@TaskQuery.status", "@payload.status"]]
}
```

3. Reference query in patterns:
```json
["render-ui", "main", {
  "type": "entity-table",
  "entity": "Task",
  "query": "@TaskQuery"
}]
```


---

## Custom Trait Guide

### When to Create Custom Traits

| Scenario | Approach |
|----------|----------|
| Standard CRUD list/view/edit | Use `std/List` behavior pattern |
| Multi-step wizard | Custom trait with states = steps |
| Approval woralmadar | Custom trait (Drafting → InReview → Published) |
| Payment processing | Custom `integration` trait with call-service |
| Domain-specific woralmadar | Custom trait matching business states |

### Trait Categories

| Category | Purpose | Requires render-ui? |
|----------|---------|---------------------|
| `interaction` | UI state machine | **YES** - must render UI |
| `integration` | Backend service calls | No |

### Interaction Trait Requirements (CRITICAL)

Every `interaction` trait MUST have:
1. **States as objects** with `isInitial` flag
2. **INIT transition** (self-loop on initial state) that renders UI
3. **render-ui effects** for every state transition
4. **form-section with onSubmit** to connect forms to events

### Example: Document Publishing Woralmadar

```json
{
  "name": "DocumentPublishing",
  "category": "interaction",
  "linkedEntity": "Document",
  "stateMachine": {
    "states": [
      { "name": "Drafting", "isInitial": true },
      { "name": "InReview" },
      { "name": "Published" }
    ],
    "events": [
      { "key": "INIT" },
      { "key": "SUBMIT" },
      { "key": "APPROVE" },
      { "key": "REJECT" }
    ],
    "transitions": [
      {
        "from": "Drafting",
        "to": "Drafting",
        "event": "INIT",
        "effects": [
          ["render-ui", "main", {
            "type": "page-header",
            "title": "Edit Document",
            "actions": [{ "label": "Submit", "event": "SUBMIT" }]
          }],
          ["render-ui", "main", {
            "type": "form-section",
            "entity": "Document",
            "fields": ["title", "content"],
            "onSubmit": "SUBMIT"
          }]
        ]
      },
      {
        "from": "Drafting",
        "to": "InReview",
        "event": "SUBMIT",
        "effects": [
          ["set", "@entity.status", "review"],
          ["persist", "update"],
          ["render-ui", "main", {
            "type": "page-header",
            "title": "In Review"
          }],
          ["render-ui", "main", {
            "type": "entity-detail",
            "entity": "Document",
            "fieldNames": ["title", "content"]
          }],
          ["render-ui", "main", {
            "type": "form-section",
            "submitLabel": "Approve",
            "cancelLabel": "Reject",
            "onSubmit": "APPROVE",
            "onCancel": "REJECT"
          }]
        ]
      },
      {
        "from": "InReview",
        "to": "Drafting",
        "event": "REJECT",
        "effects": [
          ["set", "@entity.status", "draft"],
          ["persist", "update"],
          ["emit", "INIT"]
        ]
      },
      {
        "from": "InReview",
        "to": "Published",
        "event": "APPROVE",
        "effects": [
          ["set", "@entity.status", "published"],
          ["set", "@entity.publishedAt", "@now"],
          ["persist", "update"],
          ["render-ui", "main", {
            "type": "page-header",
            "title": "Published!"
          }],
          ["render-ui", "main", {
            "type": "entity-detail",
            "entity": "Document"
          }]
        ]
      }
    ]
  }
}
```

**Key Points:**
- INIT is a self-loop that renders the initial UI
- Every state transition has render-ui effects
- form-section always has onSubmit
- REJECT emits INIT to re-render Drafting state

### Example: Integration Trait (Payment)

```json
{
  "name": "PaymentProcessing",
  "category": "integration",
  "linkedEntity": "Order",
  "emits": [
    {
      "event": "ORDER_PAID",
      "scope": "external",
      "description": "Emitted when payment succeeds",
      "payload": [
        { "name": "orderId", "type": "string", "required": true, "description": "The paid order ID" },
        { "name": "total", "type": "number", "required": true, "description": "Order total amount" }
      ]
    }
  ],
  "stateMachine": {
    "states": [
      { "name": "Pending", "isInitial": true },
      { "name": "Processing" },
      { "name": "Completed" },
      { "name": "Failed" }
    ],
    "events": [
      { "key": "PROCESS" },
      { "key": "SUCCESS" },
      { "key": "FAILURE" }
    ],
    "transitions": [
      {
        "from": "Pending",
        "to": "Processing",
        "event": "PROCESS",
        "effects": [
          ["call-service", "stripe", "charge", {
            "amount": "@entity.total",
            "onSuccess": "SUCCESS",
            "onError": "FAILURE"
          }]
        ]
      },
      {
        "from": "Processing",
        "to": "Completed",
        "event": "SUCCESS",
        "effects": [
          ["set", "@entity.paidAt", "@now"],
          ["persist", "update"],
          ["emit", "ORDER_PAID", { "orderId": "@entity.id", "total": "@entity.total" }]
        ]
      },
      {
        "from": "Processing",
        "to": "Failed",
        "event": "FAILURE",
        "effects": [
          ["notify", "Payment failed", "error"]
        ]
      }
    ]
  }
}
```

**Note:** Integration traits don't need INIT or render-ui - they're triggered by events, not page load.

### Cross-Almadar Communication (CRITICAL)

When traits need to communicate across orbitals, you MUST:

1. **Declare emits with payload contract:**
```json
"emits": [
  {
    "event": "ORDER_PAID",
    "scope": "external",
    "description": "Emitted when payment is confirmed",
    "payload": [
      { "name": "orderId", "type": "string", "required": true },
      { "name": "total", "type": "number", "required": true }
    ]
  }
]
```

2. **Include payload data in emit effect:**
```json
["emit", "ORDER_PAID", { "orderId": "@entity.id", "total": "@entity.total" }]
```

3. **Declare listeners with payloadMapping:**
```json
"listens": [
  {
    "event": "PaymentProcessing.ORDER_PAID",
    "scope": "external",
    "triggers": "SEND_RECEIPT",
    "payloadMapping": {
      "orderId": "@payload.orderId",
      "amount": "@payload.total"
    }
  }
]
```

### Anti-Patterns to Avoid

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| Missing INIT | Page is blank | Add self-loop with render-ui |
| States as strings | Validation fails | Use `{ "name": "...", "isInitial": true }` |
| No render-ui | UI doesn't update | Add render-ui to every transition |
| form-section no onSubmit | Form does nothing | Add `onSubmit: "EVENT"` |
| **Using form-actions** | **Pattern doesn't exist!** | **Use form-section with onSubmit/onCancel** |
| Duplicate (from, event) | Second unreachable | Use guards or different events |
| from: '*' | Non-deterministic | Use explicit from state |
| **External emit no payload** | **Listeners have no data** | **Add payload array with typed fields** |
| **emit effect no data** | **Payload is empty at runtime** | **Pass payload object: `["emit", "EVT", {...}]`** |

### Pattern Action Props Quick Reference

| Pattern | Action Props | Purpose |
|---------|--------------|---------|
| `page-header` | `actions: [{label, event}]` | Top-right buttons (New, Export) |
| `form-section` | `onSubmit`, `onCancel` | Form submit/cancel buttons |
| `entity-table` | `itemActions: [{label, event}]` | Row action buttons (Edit, Delete) |
| `entity-detail` | `headerActions: [{label, event}]` | Detail view header buttons |
| `confirmation` | `onConfirm`, `onCancel` | Confirmation dialog buttons |


---

## Tool Woralmadar

1. **DECOMPOSE**: Break requirements into OrbitalUnits
2. **GENERATE**: Call `generate_orbital` for each orbital
3. **COMBINE**: Call `construct_combined_schema` (FINAL STEP)

```
generate_orbital({ orbital: {...}, orbitalIndex: 0, totalOrbitals: N })
generate_orbital({ orbital: {...}, orbitalIndex: 1, totalOrbitals: N })
...
construct_combined_schema({ name: "App", description: "..." })
# STOP HERE - job is done
```


---

## Updating Existing Schemas

When modifying an existing almadar schema, follow this systematic approach:

### Step 1: Locate the Target

Use grep/search to find the right location:

```bash
# Find entity by name
grep -n '"entity"' schema.orb -A 5 | grep "TaskEntity"

# Find trait by name
grep -n '"traits"' schema.orb | head -10

# Find specific trait definition
grep -n '"TaskInteraction"' schema.orb

# Find state machine transitions
grep -n '"transitions"' schema.orb -A 30 | head -50

# Find all events
grep -n '"events"' schema.orb

# Find all pages
grep -n '"pages"' schema.orb -A 10
```

### Step 2: Identify What to Modify

| Change Type | Location to Find | What to Modify |
|-------------|------------------|----------------|
| Add field | `"fields": [` | Add to entity.fields array |
| Add event | `"events": [` | Add to stateMachine.events |
| Add state | `"states": [` | Add to stateMachine.states |
| Add transition | `"transitions": [` | Add to stateMachine.transitions |
| Add action button | `"page-header"` or `"itemActions"` | Add to pattern props |
| Add page | `"pages": [` | Add to orbital.pages array |
| Modify UI | `"render-ui"` | Find transition with target slot |

### Step 3: Common Modifications

**Add a new field to entity:**
```json
// Find: "fields": [
// Add before the closing bracket:
{ "name": "priority", "type": "enum", "values": ["low", "medium", "high"] }
```

**Add a new action button to page-header:**
```json
// Find: INIT transition's page-header
// Add to actions array:
{ "label": "Export", "event": "EXPORT", "variant": "secondary" }
```

**Add a new event:**
```json
// Find: "events": [
// Add the event:
{ "key": "EXPORT", "name": "Export Data" }
```

**Add a new transition:**
```json
// Find: "transitions": [
// Add after existing transitions:
{
  "from": "Browsing",
  "to": "Exporting",
  "event": "EXPORT",
  "effects": [
    ["render-ui", "modal", { "type": "confirmation", "title": "Export?", "onConfirm": "CONFIRM_EXPORT", "onCancel": "CANCEL" }]
  ]
}
```

**Add itemActions to entity-table:**
```json
// Find: "entity-table" in INIT transition
// Add itemActions prop:
"itemActions": [
  { "label": "View", "event": "VIEW" },
  { "label": "Edit", "event": "EDIT" },
  { "label": "Delete", "event": "DELETE", "isDestructive": true }
]
```

### Step 4: Ensure Completeness

After any modification, verify:

1. **New events have matching transitions** - Every event must have at least one transition that uses it
2. **New states are reachable** - Every state must have a transition leading to it
3. **New states have exit transitions** - Every state (except browsing) needs a way back
4. **UI slots are cleared** - Modals/drawers opened must be closed with `["render-ui", "modal", null]`

### Quick Reference: Finding Traits

Traits are defined in two places:

1. **Inline in orbital** (most common):
```json
"orbitals": [{
  "traits": [{
    "name": "TaskInteraction",
    "stateMachine": { ... }  // <-- trait definition here
  }]
}]
```

2. **Referenced from library**:
```json
"orbitals": [{
  "traits": [{
    "ref": "std/crud"  // <-- references external trait
  }]
}]
```

For inline traits, grep for the trait name. For library traits, find the library file.

---

## Large Schema Handling (40KB+)

For schemas exceeding 40KB, use the **chunking tools** instead of direct editing:

### Available Tools

| Tool | Purpose |
|------|---------|
| `query_schema_structure` | Get lightweight map (~500 bytes): orbitals, traits, sizes |
| `extract_chunk` | Extract orbital/trait to `.chunks/chunk-{id}.json` |
| `apply_chunk` | Merge edited chunk back into schema |

**Note**: These tools work with both `schema.json` and `schema.orb` files. Changes are auto-persisted.

### Chunking Woralmadar

```
1. DISCOVER: query_schema_structure("schema.orb")
   → Returns structure map with orbital/trait names

2. EXTRACT: extract_chunk({ file: "schema.orb", type: "orbital", name: "Task Management" })
   → Creates .chunks/chunk-{id}.json (2-5KB, easy to edit)

3. EDIT: Use edit_file on chunk file (NOT full schema)
   → Much smaller = reliable edits

4. APPLY: apply_chunk({ chunkId: "..." })
   → Merges changes back into schema.orb, auto-persists to database
```

### Chunk Types

| Type | When to Use |
|------|-------------|
| `orbital` | Adding fields, modifying inline traits |
| `inline-trait` | Editing trait inside an almadar (requires `parentOrbital`) |

**Note**: There is no schema-level `traits[]` array. All traits belong inside orbitals.

### When to Use Chunking

| Schema Size | Strategy |
|-------------|----------|
| < 15KB | Direct edit (works fine) |
| 15-40KB | Targeted edit_file |
| > 40KB | **Use chunking tools** |

---

## CRITICAL: Output Requirements

Every almadar MUST include:

### 1. domainContext (REQUIRED)
```json
"domainContext": {
  "request": "<original user request>",
  "requestFragment": "<what part produced THIS orbital>",
  "category": "business",
  "vocabulary": { "item": "Task", "create": "Add", "delete": "Remove" }
}
```

### 2. design (REQUIRED)
```json
"design": {
  "style": "modern",
  "uxHints": {
    "flowPattern": "crud-cycle",
    "listPattern": "entity-table",
    "formPattern": "modal"
  }
}
```

### 3. Business Rule Guards on SAVE (when rules exist)
If the user specifies validation constraints, add S-expression guards on transitions:
```json
{
  "from": "Creating", "to": "Browsing", "event": "SAVE",
  "guard": ["<=", "@payload.data.score", 100],
  "effects": [["persist", "create", "Entry", "@payload.data"], ...]
}
```

### 4. ONE Almadar Per Entity
Do NOT create multiple orbitals for the same entity. All CRUD operations belong in ONE orbital.

**Missing context fields = validation warnings. Missing guards = unenforced business rules!**

---

## Example: Task Manager

```json
{
  "name": "Taskly",
  "orbitals": [{
    "name": "Task Management",
    "entity": {
      "name": "Task",
      "collection": "tasks",
      "fields": [
        { "name": "title", "type": "string", "required": true },
        { "name": "status", "type": "enum", "values": ["pending", "active", "done"] }
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
        "events": ["INIT", "CREATE", "VIEW", "EDIT", "DELETE", "SAVE", "CANCEL", "CONFIRM_DELETE"],
        "transitions": [
          {
            "from": "Browsing", "to": "Browsing", "event": "INIT",
            "effects": [
              ["render-ui", "main", { "type": "page-header", "title": "Tasks", "actions": [{ "label": "New Task", "event": "CREATE", "variant": "primary" }] }],
              ["render-ui", "main", { "type": "entity-table", "entity": "Task", "columns": ["title", "status"], "itemActions": [{ "label": "View", "event": "VIEW" }, { "label": "Edit", "event": "EDIT" }, { "label": "Delete", "event": "DELETE" }] }]
            ]
          },
          {
            "from": "Browsing", "to": "Creating", "event": "CREATE",
            "effects": [["render-ui", "modal", { "type": "form-section", "entity": "Task", "fields": ["title", "status"], "submitEvent": "SAVE", "cancelEvent": "CANCEL" }]]
          },
          {
            "from": "Browsing", "to": "Viewing", "event": "VIEW",
            "effects": [["render-ui", "drawer", { "type": "entity-detail", "entity": "Task", "actions": [{ "label": "Edit", "event": "EDIT" }, { "label": "Delete", "event": "DELETE", "variant": "danger" }] }]]
          },
          {
            "from": "Browsing", "to": "Editing", "event": "EDIT",
            "effects": [["render-ui", "modal", { "type": "form-section", "entity": "Task", "fields": ["title", "status"], "submitEvent": "SAVE", "cancelEvent": "CANCEL" }]]
          },
          {
            "from": "Browsing", "to": "Deleting", "event": "DELETE",
            "effects": [["render-ui", "overlay", { "type": "confirmation", "title": "Delete Task?", "message": "This action cannot be undone." }]]
          },
          {
            "from": "Creating", "to": "Browsing", "event": "SAVE",
            "effects": [["persist", "create", "Task", "@payload.data"], ["render-ui", "modal", null], ["emit", "INIT"]]
          },
          {
            "from": "Creating", "to": "Browsing", "event": "CANCEL",
            "effects": [["render-ui", "modal", null]]
          },
          {
            "from": "Viewing", "to": "Browsing", "event": "CANCEL",
            "effects": [["render-ui", "drawer", null]]
          },
          {
            "from": "Editing", "to": "Browsing", "event": "SAVE",
            "effects": [["persist", "update", "Task", "@payload.data"], ["render-ui", "modal", null], ["emit", "INIT"]]
          },
          {
            "from": "Editing", "to": "Browsing", "event": "CANCEL",
            "effects": [["render-ui", "modal", null]]
          },
          {
            "from": "Deleting", "to": "Browsing", "event": "CONFIRM_DELETE",
            "effects": [["persist", "delete", "Task"], ["render-ui", "overlay", null], ["emit", "INIT"]]
          },
          {
            "from": "Deleting", "to": "Browsing", "event": "CANCEL",
            "effects": [["render-ui", "overlay", null]]
          }
        ]
      }
    }],
    "pages": [{ "name": "TasksPage", "path": "/tasks", "traits": [{ "ref": "TaskInteraction" }] }]
  }]
}
```

**Key points**:
- ONE page (TasksPage) not four (list/create/edit/view)
- INIT transition renders initial UI (page-header + entity-table)
- States are OBJECTS with `isInitial` flag
- **Actions are INSIDE patterns (use unified props)**:
  - `page-header` has `actions: [{label, event, variant}]`
  - `entity-table` has `itemActions: [{label, event}]`
  - `form-section` has `submitEvent` and `cancelEvent` (NOT onSubmit/onCancel!)
  - `entity-detail` has `actions` (NOT headerActions!)
  - `confirmation` emits action events
- **NEVER use**: `onSubmit`, `onCancel`, `headerActions`, `loading` (use `isLoading`)
- NO separate "form-actions" pattern - it doesn't exist!

