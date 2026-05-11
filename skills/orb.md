---
name: orb
description: Generate .orb programs using molecule-first composition. Atoms + molecules only, no organisms.
allowed-tools: Read, Write, Edit, generate_orbital, generate_schema_orchestrated, finish_task, query_schema_structure, extract_chunk, apply_chunk
version: 1.0.0
---

# Orb Generation Skill (Molecule-First)

> Generate .orb programs using Orbital Units: Entity x Traits x Patterns
> Pattern vocabulary: atoms + molecules only. No organisms.

## Orbital Architecture

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
Orbital Unit = Entity × Traits × Patterns
Application  = Σ(Orbital Units)
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
| **form-section has submitEvent** | Connects form to trait events (NOT onSubmit!) |
| **std/* are templates** | Guide LLM generation, not runtime code |

### Slot Ownership
```
┌─────────────────────────────────────────────┐
│ Page: /tasks                                │
├─────────────────────────────────────────────┤
│ TaskManagement trait OWNS:                  │
│   • main → entity-table, page-header        │
│   • modal → form-section (create/edit)      │
│   • drawer → detail-panel (view)            │
│                                             │
│ NO other trait should render to these slots │
└─────────────────────────────────────────────┘
```


---

## S-Expression Syntax

**Bindings** (read data):
- `@entity.field` - Entity field value
- `@payload.data` - Event payload data
- `@state` - Current state name
- `@now` - Current timestamp

**Guards** (boolean expressions):
```json
[">", "@entity.count", 0]
["and", ["=", "@state", "Active"], ["<", "@entity.value", 100]]
```

**Effects** (actions):
```json
["set", "@entity.count", ["+", "@entity.count", 1]]
["persist", "update", "Task", "@entity.id", "@payload.data"]
["emit", "TASK_COMPLETED", { "id": "@entity.id" }]
```


---

## Render-UI Molecule-First Design Guide

### The Five Rules of Composition (MANDATORY)

| Rule | Requirement |
|------|-------------|
| **1** | **Single Render-UI** per transition |
| **2** | **Two Levels**: Atoms (2+) + Molecules (1+) |
| **3** | **Layout Wrapper**: Root must be `stack`, `card`, `box`, or `simple-grid` |
| **4** | **Theme Variables**: ALL visual props use CSS vars |
| **5** | **Composable**: Build from small pieces, never use rigid organisms |

---

### Pattern Vocabulary

These are the ONLY patterns you may use. They are derived from 104 production behaviors across 18 domains.

#### Atoms (Basic UI Elements)

| Pattern | Purpose | Key Props |
|---------|---------|-----------|
| `typography` | All text content | `variant` (h1-h6, body, caption), `text`, `color` |
| `button` | User actions | `label`, `event`, `variant` (primary, secondary, ghost, destructive) |
| `icon` | Lucide icons | `name`, `size`, `color` |
| `badge` | Status indicators | `text`, `variant` (primary, success, warning, error) |
| `divider` | Visual separation | `orientation` |
| `avatar` | User/entity images | `src`, `name`, `size` |
| `progress-bar` | Progress indicators | `value`, `max`, `label` |
| `status-dot` | Status indicator dots | `status`, `label` |
| `star-rating` | Rating display | `value`, `max` |

#### Layout Molecules

| Pattern | Purpose | Key Props |
|---------|---------|-----------|
| `stack` | Flex layout (V/H) | `direction` (vertical/horizontal), `gap`, `align`, `justify`, `wrap` |
| `card` | Content grouping | `padding`, `border`, `rounded`, `shadow`, `children` |
| `box` | Visual container | `padding`, `bg`, `border`, `rounded`, `shadow`, `children` |
| `simple-grid` | Grid layout | `cols`, `gap`, `children` |

#### Data Molecules

| Pattern | Purpose | Key Props |
|---------|---------|-----------|
| `data-grid` | Tabular data display | `entity`, `fields`, `itemActions`, `cols`, `gap` |
| `data-list` | Vertical list display | `entity`, `fields`, `itemActions` |
| `form-section` | Form input groups | `entity`, `fields`, `submitEvent`, `cancelEvent` |
| `search-input` | Search fields | `placeholder`, `event` |
| `filter-group` | Filter controls | `filters`, `event` |
| `tabs` | Tabbed content | `tabs`, `activeTab` |

#### Metric/Chart Molecules

| Pattern | Purpose | Key Props |
|---------|---------|-----------|
| `stat-display` | Single KPI display | `label`, `value`, `icon` |
| `stat-badge` | Stat with badge | `label`, `value`, `variant` |
| `meter` | Metric gauge | `value`, `max`, `label` |
| `trend-indicator` | Trend up/down | `value`, `direction` |
| `score-display` | Score/count | `value`, `label` |

#### State Molecules

| Pattern | Purpose | Key Props |
|---------|---------|-----------|
| `empty-state` | No data fallback | `title`, `description`, `icon` |
| `loading-state` | Loading spinner | `message` |

#### Form Molecules

| Pattern | Purpose | Key Props |
|---------|---------|-----------|
| `textarea` | Multi-line input | `placeholder`, `rows` |
| `range-slider` | Range input | `min`, `max`, `step`, `value` |
| `upload-drop-zone` | File upload | `accept`, `maxSize` |
| `calendar-grid` | Date picker grid | `selectedDate`, `event` |

#### Navigation Molecules

| Pattern | Purpose | Key Props |
|---------|---------|-----------|
| `wizard-progress` | Multi-step progress | `steps`, `currentStep` |
| `wizard-navigation` | Step navigation | `steps`, `currentStep` |
| `action-buttons` | Action button group | `actions` |

#### Specialty Molecules

| Pattern | Purpose | Key Props |
|---------|---------|-----------|
| `lightbox` | Image/media viewer | `src`, `alt` |
| `map-view` | Map display | `center`, `zoom`, `markers` |
| `health-bar` | Health/HP bar | `value`, `max` |
| `d-pad` | Directional pad | `events` |
| `combat-log` | Event log | `entries` |
| `dialogue-box` | Dialogue/chat | `speaker`, `text` |

#### Game Canvas Molecules

| Pattern | Purpose | Key Props |
|---------|---------|-----------|
| `isometric-canvas` | 3D isometric canvas | `tiles`, `units` |
| `platformer-canvas` | 2D platformer | `entities`, `viewport` |
| `simulation-canvas` | Simulation display | `entities`, `viewport` |
| `canvas-effect` | Canvas visual effects | `effect`, `duration` |
| `game-hud` | Game HUD overlay | `stats`, `actions` |
| `game-menu` | Game menu | `items` |
| `game-over-screen` | End screen | `score`, `message` |
| `inventory-panel` | Inventory display | `items`, `slots` |

---

### BANNED Patterns (NEVER USE)

These organism-level patterns are deprecated. Use the molecule equivalents:

| Banned Pattern | Use Instead |
|---------------|-------------|
| `entity-table` | `data-grid` with `entity`, `fields`, `itemActions` |
| `entity-list` | `data-list` with `entity`, `fields`, `itemActions` |
| `entity-cards` | `data-grid` with `cols: 3`, or compose with `card` children in a `simple-grid` |
| `page-header` | Compose with `stack` (horizontal) + `typography` (h1) + `button` |
| `detail-panel` | Compose with `stack` (vertical) + `typography` + `badge` + `divider` |
| `timeline` | Compose with `data-list` or `stack` + timestamp items |
| `crud-template` | Compose from `data-grid` + `form-section` + layout molecules |
| `list-template` | Compose from `data-list` + `search-input` + layout molecules |
| `detail-template` | Compose from `stack` + `typography` + `badge` + `button` |

---

### Layout-First Structure (Rule 3)

Root element MUST be a layout molecule:

```json
{ "type": "stack", "direction": "vertical", "gap": "lg", "children": [...] }
{ "type": "stack", "direction": "horizontal", "gap": "md", "children": [...] }
{ "type": "box", "padding": "lg", "bg": "var(--color-card)", "children": [...] }
{ "type": "simple-grid", "cols": 3, "gap": "md", "children": [...] }
```

#### Layout Props Reference

**Stack (VStack/HStack)**
```json
{
  "type": "stack",
  "direction": "vertical" | "horizontal",
  "gap": "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl",
  "align": "start" | "center" | "end" | "stretch",
  "justify": "start" | "center" | "end" | "between" | "around",
  "wrap": true | false
}
```

**Box**
```json
{
  "type": "box",
  "padding": "none" | "xs" | "sm" | "md" | "lg" | "xl",
  "bg": "var(--color-card)" | "var(--color-muted)" | "var(--color-primary)",
  "border": true | false,
  "rounded": "var(--radius-md)" | "var(--radius-lg)",
  "shadow": "var(--shadow-sm)" | "var(--shadow-md)"
}
```

---

### Composition Pattern: Header Row

Instead of `page-header`, compose with atoms:

```json
{
  "type": "stack", "direction": "horizontal", "justify": "between", "align": "center",
  "children": [
    { "type": "typography", "variant": "h1", "text": "Tasks" },
    { "type": "button", "label": "New Task", "event": "CREATE", "variant": "primary", "icon": "plus" }
  ]
}
```

### Composition Pattern: Stat Cards

```json
{
  "type": "stack", "direction": "horizontal", "gap": "md", "wrap": true,
  "children": [
    { "type": "stat-display", "label": "Total", "value": "@entity.count", "icon": "list" },
    { "type": "stat-display", "label": "Active", "value": "@entity.activeCount", "icon": "activity" },
    { "type": "stat-display", "label": "Done", "value": "@entity.doneCount", "icon": "check-circle" }
  ]
}
```

### Composition Pattern: Data View with Actions

```json
{
  "type": "data-grid", "entity": "Task", "fields": ["title", "status", "priority"],
  "itemActions": [
    { "event": "VIEW", "label": "View" },
    { "event": "EDIT", "label": "Edit" },
    { "event": "DELETE", "label": "Delete" }
  ]
}
```

---

### Critical Validation Rules

| Element | Correct Format | Wrong Format | Error |
|---------|----------------|--------------|-------|
| **Events** | `{ "key": "INIT", "name": "Init" }` | `"INIT"` | ORB_T_EVT_INVALID_FORMAT |
| **Emits** | `[{ "event": "INIT", "scope": "internal" }]` | `["INIT"]` | ORB_T_UNDEFINED_TRAIT |
| **Payload events** | `{ "key": "SAVE", "payload": [...] }` | No payload | ORB_BINDING_PAYLOAD_FIELD_UNDECLARED |
| **Page traits** | `{ "ref": "TraitName" }` | With linkedEntity | ORB_P_INVALID_TRAIT_REF |
| **Category** | `"category": "interaction"` | Missing | ORB_T_MISSING_CATEGORY |
| **Page traits array** | `"traits": [{ "ref": "TraitName" }]` | Missing traits | Page renders blank |
| **Entity names** | `"Task"`, `"CartItem"` | `"Form"`, `"Button"`, `"Card"` | Name collision with UI component |

### Effect Operators (Use ONLY These)

| Operator | Purpose | Example |
|----------|---------|---------|
| `set` | Set entity field | `["set", "@entity.status", "active"]` |
| `fetch` | Load entity data | `["fetch", "Task"]` |
| `persist` | Create/update/delete | `["persist", "create", "Task", "@payload.data"]` |
| `notify` | Show notification | `["notify", "Saved!", "success"]` |

**BANNED**: `call-service` (external integrations only), `emit` (handled separately), `log`, `navigate`

### Binding Rules for Prop Values

- Each prop value can have at most ONE binding: `"value": "@entity.price"`
- NEVER concatenate bindings: `"@entity.price @entity.currency"` is INVALID
- NEVER use inline expressions: `"@entity.quantity <= 0"` is INVALID
- For conditional logic, use guards on transitions, not prop expressions

---

### Composition Quality Checklist

Before calling `finish_task`, verify:

```
[] Single render-ui per transition
[] Root element is layout (stack/box/simple-grid)
[] Contains 2+ atoms (typography, badge, button, icon)
[] Contains 1+ data molecules (data-grid, data-list, form-section, stats)
[] NO organism patterns (entity-table, entity-list, page-header, etc.)
[] Uses theme variables for ALL visual properties
[] Matches production quality from standard behaviors
[] Passes orbital validate with zero errors and zero warnings
```

---

### BANNED Patterns (Additional)

| Wrong | Correct |
|-------|---------|
| Multiple flat render-ui calls | Single composed render-ui |
| Root organism without layout | Layout wrapper required |
| Hex colors | Theme CSS variables |
| Pixel values | Theme spacing variables |
| Events as strings `"INIT"` | Event objects `{ "key": "INIT" }` |
| Emits as strings `["INIT"]` | Emit objects `[{ "event": "INIT" }]` |
| `onSubmit` / `onCancel` | `submitEvent` / `cancelEvent` |
| `headerActions` | `actions` |
| `entity-table` | `data-grid` |
| `entity-list` | `data-list` |
| `page-header` | `stack` + `typography` + `button` |

---

## Valid Binding References

Bindings reference runtime values using `@root.path` syntax:

| Binding | Description | Example |
|---------|-------------|---------|
| `@entity` | Reference to the linked entity for this trait | `@entity.health` |
| `@payload` | Reference to the event payload data | `@payload.amount` |
| `@state` | Current state machine state name | `@state` |
| `@now` | Current timestamp in milliseconds | `@now` |
| `@config` | Trait configuration values | `@config.apiEndpoint` |
| `@computed` | Computed/calculated values | `@computed.total` |
| `@trait` | Trait context data | `@trait.name` |

### Binding Rules

- `@entity.field` - Access entity fields (e.g., `@entity.status`, `@entity.count`)
- `@payload.field` - Access event payload data (read-only)
- `@state` - Current state name (no path)
- `@now` - Current timestamp (no path)
- `@config.field` - Trait configuration values

### Common Mistakes

| ❌ Invalid | ✅ Correct |
|------------|------------|
| `@count(tasks)` | Use static text `"Total Tasks"` or add a `taskCount` field to entity |
| `@find(orders, id=@payload.id)` | Use `@payload.data` — the runtime resolves entities |
| `@categories.find(c => c.id === @payload.id)` | Use `@payload.data` — no JavaScript in bindings |
| `@sum(orders, totalAmount)` | Add a `totalAmount` field to the entity |
| `@formatDate(@entity.createdAt, "MMM dd")` | Use `@entity.createdAt` — formatting is UI-side |
| `@length(items)` | Use `@entity.itemCount` — add the field to entity |
| `@filter(...)` | No function-call syntax exists in bindings |
| `@inc(@payload.delta)` | Use `@payload.data` or `@entity.field` |
| `@count` | Use static text or add a count field to entity |
| `@entity.task.title` | `@entity.title` (entity type is implicit) |
| `@payload.field` in `set` effect | `@entity.field` (set modifies entity only) |
| `@entity` (bare, no path) | `@entity.data` or `@entity.fieldName` — path required |

**ABSOLUTE RULE**: Bindings are ONLY `@root.path` (e.g., `@entity.name`). NO function calls, NO JavaScript expressions, NO query syntax. If you need computed values, add a field to the entity.



---

## BANNED PROPS (NEVER USE)

| Wrong Prop | Correct Prop | Pattern |
|------------|--------------|---------|
| `onSubmit` | `submitEvent` | form-section |
| `onCancel` | `cancelEvent` | form-section |
| `headerActions` | `actions` | detail-panel |
| `loading` | `isLoading` | all patterns |
| `fieldNames` | `fields` | detail-panel, form-section |
| `onConfirm` | (use event transitions) | confirmation |
| `placement` | (remove) | itemActions |
| `isDestructive` | (use variant: "danger") | itemActions |

### Banned Value Patterns

| Wrong | Correct |
|-------|---------|
| Hex colors: "#3b82f6" | Theme vars: "var(--color-primary)" |
| Named colors: "white", "red" | Theme vars: "var(--color-background)" |
| Pixel values: "16px" | Theme vars: "var(--spacing-lg)" |
| Events as strings: "INIT" | Event objects: { "key": "INIT", "name": "Init" } |
| Emits as strings: ["INIT"] | Emit objects: [{ "event": "INIT", "scope": "internal" }] |


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

**Flow → Orbital Structure:**
- hub-spoke: Dashboard orbital + feature orbitals with navigation
- master-detail: Entity orbital with detail drawer state
- crud-cycle: Entity orbital with modal form states
- linear: Step orbitals connected via navigation
- role-based: Shared orbitals with role-based guards


---

## Orbital Decomposition Protocol

### Step 0: Classify Domain
| Domain | Keywords | Key Traits |
|--------|----------|------------|
| business | manage, track, workflow | EntityManagement, SearchAndFilter |
| game | play, score, level | Physics2D, Health, GameState |
| form | wizard, onboarding | Wizard, FormSubmission |
| dashboard | metrics, KPI | EntityManagement |
| content | blog, CMS | none (page navigation) |
| social | chat, feed, profile, follow | EntityManagement |
| ecommerce | shop, store, cart, checkout | EntityManagement, SearchAndFilter |
| workflow | automate, process, pipeline | EntityManagement |

### Step 1: Identify Entities (ONE Orbital Per Entity)
- What are the core data objects?
- persistent (DB), runtime (memory), or singleton (config)?
- **CRITICAL: Create exactly ONE orbital per entity**
- **CRITICAL: If the prompt mentions N entities, create N orbitals** (e.g., "Product, Category, Order" → 3 orbitals)
- **CRITICAL: EVERY orbital MUST have an entity field**
- **NEVER** collapse multiple entities into a single dashboard orbital

### Step 2: Select Interaction Model
| Domain | Create | View | Edit | Delete |
|--------|--------|------|------|--------|
| business | modal | drawer | modal | confirm |
| game | none | none | none | none |
| form | wizard | drawer | page | confirm |

### Step 3: Choose Traits (UNIQUE NAMES REQUIRED)
- Business: `{Entity}Management` naming — e.g., `ProductManagement`, `OrderManagement`, `CustomerManagement`
- Game: Physics2D, Health, Score, Collision
- Form: Wizard (multi-step) or FormSubmission (single)
- **NEVER reuse the same trait name across orbitals. Each trait name MUST be globally unique.**

### Step 4: Define State Machine
```
states: Identify user-facing modes (browsing, creating, editing, viewing)
events: Identify user actions (INIT, CREATE, VIEW, EDIT, SAVE, CLOSE)
transitions: Map (from, event) → (to, effects)
```

### Step 5: Add INIT Transition (CRITICAL)
Every trait MUST have an INIT self-loop with render-ui effects. Without INIT, the page loads blank!

### Step 6: Define Pages
- ONE page per entity (business) or workflow (form)
- Attach traits to pages via `traits` array
- Add `"guard"` (singular) S-expressions on SAVE transitions for business rules


---

## Orbital Output Format

Each orbital MUST include embedded context for portability:

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

**Cross-orbital connectivity (for multi-entity apps):**
- `entity.fields[].relation` - Link to related entities
- `emits` - Events this orbital emits when state changes
- `listens` - Events from other orbitals to handle
- `relations` - Summary of entity relationships


---

## Orbital Connectivity

For multi-entity apps, connect orbitals:

```json
{
  "entity": {
    "fields": [
      { "name": "customerId", "type": "relation", "relation": { "entity": "Customer", "cardinality": "one" } }
    ]
  },
  "emits": ["ORDER_COMPLETED"],
  "listens": [{ "event": "MENU_ITEM_UNAVAILABLE", "triggers": "DISABLE_ITEM" }],
  "design": {
    "uxHints": {
      "relatedLinks": [{ "relation": "customerId", "label": "View Customer", "targetView": "detail" }]
    }
  }
}
```

- **relation fields**: Link entities (Order → Customer)
- **emits/listens**: Cross-orbital event communication
- **relatedLinks**: Navigation between related records


---

## Context Usage
- `domainContext.vocabulary` → labels (item, create, delete)
- `design.uxHints.listPattern` → entity-table | entity-cards | entity-list
- `design.uxHints.formPattern` → modal | drawer | page
- `design.uxHints.relatedLinks` → navigation to related orbitals


---

## Critical Rules

### 1. INIT Transition Required (CRITICAL)

Every trait MUST have an INIT self-loop transition. The runtime fires `INIT` when page loads.
The INIT render-ui MUST be a **single composed stack**, not flat calls:

```json
{
  "from": "Browsing",
  "to": "Browsing",
  "event": "INIT",
  "effects": [
    ["render-ui", "main", {
      "type": "stack", "direction": "vertical", "gap": "lg",
      "children": [
        { "type": "stack", "direction": "horizontal", "justify": "between", "align": "center",
          "children": [
            { "type": "typography", "variant": "h1", "text": "Title" },
            { "type": "button", "label": "Create", "event": "CREATE", "variant": "primary" }
          ]
        },
        { "type": "entity-table", "entity": "EntityName", "columns": ["..."], "searchable": true,
          "itemActions": [{ "label": "View", "event": "VIEW" }] }
      ]
    }]
  ]
}
```

Without INIT: Page loads blank, nothing renders, no UI appears.

### 2. NEVER Use @payload in set Effects

The `set` effect modifies entity state. **@payload is READ-ONLY**.

```json
// WRONG
["set", "@payload.data.status", "active"]

// CORRECT
["set", "@entity.status", "active"]
```

**Rule:** `set` target MUST start with `@entity`, never `@payload`.

### 3. Valid Patterns ONLY

**DO NOT invent custom patterns!** Only these patterns exist:

| Category | Valid Patterns |
|----------|----------------|
| Header | `form-section-header`, `header`, `page-header`, `section-header` |
| Display | `entity-cards`, `entity-list`, `entity-table`, `stats` |
| Form | `form-actions`, `form-field`, `form-section`, `form-section-header` |
| Filter | `doc-search`, `filter-group`, `search-input` |
| State | `avl-3d-state-node`, `avl-state`, `avl-state-machine`, `canvas-3d-loading-state`, `empty-state`, `error-state`, `jazari-state-machine`, `loading-state`, `mini-state-machine`, `trait-state-viewer` |
| Navigation | `breadcrumb`, `tabs` |
| Layout | `auth-layout`, `calendar-grid`, `dashboard-grid`, `dashboard-layout`, `data-grid`, `feature-grid`, `feature-grid-organism`, `grid`, `inventory-grid`, `layout-pattern`, `master-detail`, `pricing-grid`, `simple-grid`, `stats-grid`, `svg-grid` |
| Game | `dialogue-box`, `game-audio-provider`, `game-audio-toggle`, `game-canvas-2d`, `game-canvas-3d`, `game-canvas-3d-battle-template`, `game-canvas-3d-castle-template`, `game-canvas-3d-world-map-template`, `game-hud`, `game-menu`, `game-over-screen`, `game-shell`, `game-template`, `inventory-panel` |


**NEVER use**: `onboarding-welcome`, `category-selector`, `assessment-question`, etc.

Valid viewType values: `list`, `detail`, `create`, `edit`, `dashboard`, `custom`

### 4. Page Structure Required

Every page MUST have `path` and `traits` properties:

```json
{
  "pages": [{
    "name": "TasksPage",
    "path": "/tasks",
    "traits": [{ "ref": "TaskManagement" }]
  }]
}
```

Without `path`: Validation error `ORB_P_MISSING_PATH`
Without `traits`: Validation error `ORB_P_MISSING_TRAITS`

### 5. Valid Field Types ONLY

Field types MUST be one of: `string`, `number`, `boolean`, `date`, `timestamp`, `datetime`, `array`, `object`, `enum`, `relation`

```json
// WRONG - using entity name as type:
{ "name": "author", "type": "User" }

// CORRECT - use relation type:
{ "name": "author", "type": "relation", "relation": { "entity": "User", "cardinality": "one" } }
```

### 6. Modal/Drawer Exit Transitions (CRITICAL — MOST COMMON ERROR)

**EVERY state that renders to `"modal"` or `"drawer"` MUST have CANCEL and CLOSE transitions.**
Without these, the validator rejects the schema with `CIRCUIT_NO_OVERLAY_EXIT`.

```json
// Opening the modal: Browsing → Creating
{ "from": "Browsing", "to": "Creating", "event": "CREATE",
  "effects": [["render-ui", "modal", { "type": "form-section", "entity": "Task", "submitEvent": "SAVE", "cancelEvent": "CANCEL" }]] },

// REQUIRED: CANCEL exit (form cancel button)
{ "from": "Creating", "to": "Browsing", "event": "CANCEL",
  "effects": [["render-ui", "modal", null]] },

// REQUIRED: CLOSE exit (click outside / press Escape)
{ "from": "Creating", "to": "Browsing", "event": "CLOSE",
  "effects": [["render-ui", "modal", null]] },

// SAVE also dismisses modal
{ "from": "Creating", "to": "Browsing", "event": "SAVE",
  "effects": [["persist", "create", "Task", "@payload.data"], ["render-ui", "modal", null], ["emit", "INIT"]] }
```

**Checklist for EVERY modal/drawer state:**
- [ ] Has `CANCEL` transition → previous state with `["render-ui", "modal", null]`
- [ ] Has `CLOSE` transition → previous state with `["render-ui", "modal", null]`
- [ ] Has `SAVE` (or other action) transition that also dismisses with `["render-ui", "modal", null]`

**This applies to ALL states**: Creating, Editing, Viewing, Deleting — any state that renders to modal/drawer.

### 7. Valid Slots ONLY

render-ui slots MUST be one of: `"main"`, `"modal"`, `"drawer"`, `"sidebar"`

```json
// WRONG - invented slots:
["render-ui", "modal-close", null]
["render-ui", "notification", { ... }]
["render-ui", "confirm-modal", { ... }]

// CORRECT:
["render-ui", "modal", null]
["render-ui", "main", { ... }]
```

### 8. Every render-ui Pattern MUST Have "type"

Every pattern object in render-ui MUST include a `"type"` field. This applies to the top-level pattern AND every child in a stack.

```json
// WRONG - missing type:
["render-ui", "main", { "entity": "Product", "columns": ["name"] }]

// CORRECT:
["render-ui", "main", { "type": "entity-table", "entity": "Product", "columns": ["name"] }]

// WRONG - child missing type:
{ "type": "stack", "children": [{ "text": "Hello" }] }

// CORRECT:
{ "type": "stack", "children": [{ "type": "typography", "text": "Hello" }] }
```

### 9. Form Actions on Non-Form Patterns (CIRCUIT_ACTION_COMPONENT_MISMATCH)

**CANCEL, SAVE, SUBMIT, RESET are FORM actions.** They are ONLY valid in states that render form patterns (`form-section`, `form`).

Delete confirmation dialogs use `alert` or `confirmation` patterns, NOT `form-section`. So they must NOT use `CANCEL` as an action event.

```json
// WRONG - CANCEL is a form action, but alert is NOT a form pattern:
{ "from": "Browsing", "to": "Deleting", "event": "DELETE",
  "effects": [["render-ui", "modal", {
    "type": "alert", "variant": "danger", "title": "Delete?",
    "actions": [
      { "label": "Cancel", "event": "CANCEL" },
      { "label": "Delete", "event": "CONFIRM_DELETE" }
    ]
  }]] }

// CORRECT - use CLOSE (not CANCEL) to dismiss non-form modals:
{ "from": "Browsing", "to": "Deleting", "event": "DELETE",
  "effects": [["render-ui", "modal", {
    "type": "alert", "variant": "danger", "title": "Delete?",
    "actions": [
      { "label": "Cancel", "event": "CLOSE" },
      { "label": "Delete", "event": "CONFIRM_DELETE" }
    ]
  }]] }
```

**Rule:** In non-form modal states (alert, confirmation, detail-panel), use `CLOSE` to dismiss. Reserve `CANCEL` for `form-section` states only.

### 10. Dead Handler: Action Fires Event With No Transition From Current State (CIRCUIT_DEAD_HANDLER)

If a render-ui pattern in state X has an action that fires event E, there MUST be a transition `from: X, event: E`. A transition handling E from a DIFFERENT state does not count.

```json
// WRONG - detail-panel in "Viewing" has Edit action firing EDIT,
// but only Browsing handles EDIT:
{ "from": "Browsing", "to": "Viewing", "event": "VIEW",
  "effects": [["render-ui", "drawer", {
    "type": "detail-panel", "entity": "Todo",
    "actions": [{ "label": "Edit", "event": "EDIT" }]
  }]] }
{ "from": "Browsing", "to": "Editing", "event": "EDIT", ... }
// No transition from: "Viewing", event: "EDIT" -> CIRCUIT_DEAD_HANDLER!

// CORRECT - add transition from Viewing state:
{ "from": "Viewing", "to": "Editing", "event": "EDIT",
  "effects": [
    ["render-ui", "drawer", null],
    ["fetch", "Todo", { "id": "@payload.id" }],
    ["render-ui", "modal", { "type": "form-section", "entity": "Todo", "submitEvent": "SAVE", "cancelEvent": "CANCEL" }]
  ] }
```

**Rule:** For every action `{ "event": "X" }` in a render-ui effect of state S, verify there is a transition `from: S, event: X`.


---

## CRITICAL: Output Requirements

Every orbital MUST include:

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
    "listPattern": "data-grid",
    "formPattern": "modal"
  }
}
```

### 3. Business Rule Guards on SAVE (when rules exist)
If the user specifies validation constraints, add S-expression guards:
```json
{
  "from": "Creating", "to": "Browsing", "event": "SAVE",
  "guard": ["<=", "@payload.data.score", 100],
  "effects": [["persist", "create", "Entry", "@payload.data"], ...]
}
```

### 4. ONE Orbital Per Entity

### 5. Entity Field is REQUIRED (CRITICAL)
Every orbital MUST have an entity field. No exceptions.

---

## Example: INIT Transition (Molecule-First Composition)

The INIT transition is the most important: it defines the main view. This shows the correct composition pattern.

```json
{
  "from": "Browsing", "to": "Browsing", "event": "INIT",
  "effects": [
    ["fetch", "Task"],
    ["render-ui", "main", {
      "type": "stack", "direction": "vertical", "gap": "lg",
      "children": [
        {
          "type": "stack", "direction": "horizontal", "justify": "between", "align": "center",
          "children": [
            { "type": "typography", "variant": "h1", "text": "Task Management" },
            { "type": "button", "label": "New Task", "event": "CREATE", "variant": "primary", "icon": "plus" }
          ]
        },
        {
          "type": "stack", "direction": "horizontal", "gap": "md", "wrap": true,
          "children": [
            { "type": "stat-display", "label": "Total", "value": "@entity.count", "icon": "list" },
            { "type": "stat-display", "label": "Active", "value": "@entity.activeCount", "icon": "clock" }
          ]
        },
        {
          "type": "data-grid", "entity": "Task",
          "fields": ["title", "status", "priority"],
          "itemActions": [
            { "event": "VIEW", "label": "View" },
            { "event": "EDIT", "label": "Edit" },
            { "event": "DELETE", "label": "Delete" }
          ]
        }
      ]
    }]
  ]
}
```

**Other key transitions** (brief):
- **CREATE -> modal**: `["render-ui", "modal", { "type": "form-section", "entity": "Task", "fields": [...], "submitEvent": "SAVE", "cancelEvent": "CANCEL" }]`
- **SAVE -> close modal**: `["persist", "create", "Task", "@payload.data"], ["render-ui", "modal", null], ["fetch", "Task"]`
- **VIEW -> modal detail**: compose with `stack` + `typography` + `badge` + `divider` + `button` (NOT `detail-panel`)
- **CANCEL/CLOSE**: `["render-ui", "modal", null]`
- **DELETE**: `["persist", "delete", "Task", "@payload.id"], ["fetch", "Task"]`

**Key rules**: header = `stack` + `typography` + `button` (NOT `page-header`). Data = `data-grid` (NOT `entity-table`). Forms = `form-section` with `submitEvent`/`cancelEvent`.

