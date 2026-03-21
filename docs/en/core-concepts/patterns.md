# Patterns

> The bridge between declarative schemas and UI components

---

## Overview

The **Pattern System** connects declarative schemas to actual UI components. When a trait's `render-ui` effect specifies a pattern type, the system uses three key mechanisms to:

1. **Validate** the pattern props against the schema
2. **Map** the pattern to a concrete component
3. **Enforce** the event contract for closed-circuit compliance

```
Schema (render-ui)  →  Pattern Registry  →  Component Mapping  →  Shell Component
                              ↓
                       Event Contract
                              ↓
                    Closed Circuit Validation
```

import { AvlOrbitalUnit } from '@almadar/ui/illustrations';

<div style={{margin: '2rem 0'}}>
<AvlOrbitalUnit
  entityName="Task"
  fields={3}
  persistence="persistent"
  traits={[{name: 'TaskBrowser'}, {name: 'FormHandler'}]}
  pages={[{name: 'TaskListPage'}]}
  animated
/>
</div>

---

## Pattern Registry

The pattern registry is the source of truth for all available patterns. Each pattern defines:

```json
{
  "entity-table": {
    "type": "entity-table",
    "category": "display",
    "description": "Data table with columns and sorting",
    "suggestedFor": ["data-dense views", "comparisons", "admin panels"],
    "typicalSize": "medium",
    "componentHints": ["row-action:*", "table-cell", "sort-header"],
    "implements": "EntityBoundPatternProps",
    "propsSchema": {
      "columns": {
        "required": true,
        "types": ["array"],
        "description": "Columns can be Column objects or simple string field names"
      },
      "entity": {
        "types": ["string", "array"],
        "description": "Entity name for auto-fetch OR data array"
      },
      "itemActions": {
        "types": ["array"],
        "description": "Item actions from generated code - maps to rowActions"
      }
    },
    "componentMapping": {
      "component": "DataTable",
      "eventContract": { }
    }
  }
}
```

### Pattern Properties

| Property | Description |
|----------|-------------|
| `type` | Unique pattern identifier (used in `render-ui`) |
| `category` | Grouping: `display`, `form`, `header`, `filter`, `navigation`, `layout`, `game`, `state` |
| `description` | Human-readable description |
| `suggestedFor` | Use case hints for LLM generation |
| `typicalSize` | UI footprint: `tiny`, `small`, `medium`, `large` |
| `componentHints` | Sub-component patterns this pattern may use |
| `implements` | Interface the component implements (e.g., `EntityBoundPatternProps`) |
| `propsSchema` | Prop definitions with types and requirements |
| `componentMapping` | Maps to shell component and event contract |

### Pattern Categories

| Category | Examples | Purpose |
|----------|----------|---------|
| `display` | `entity-table`, `entity-list`, `entity-cards`, `stats` | Data presentation |
| `form` | `form`, `form-section`, `form-fields` | Data input |
| `header` | `page-header`, `title-only` | Page titles and actions |
| `filter` | `search-bar`, `filter-group`, `search-input` | Data filtering |
| `navigation` | `tabs`, `breadcrumb`, `wizard-progress`, `pagination` | Navigation controls |
| `layout` | `modal`, `drawer`, `master-detail`, `dashboard-grid` | Page structure |
| `game` | `game-canvas`, `game-hud`, `game-controls` | Game UI elements |
| `state` | `empty-state`, `loading-state`, `error-state` | State feedback |

---

## Component Mapping

The component mapping connects pattern types to shell components:

```json
{
  "mappings": {
    "entity-table": {
      "component": "DataTable",
      "category": "display"
    },
    "form": {
      "component": "Form",
      "category": "form"
    },
    "page-header": {
      "component": "PageHeader",
      "category": "header"
    }
  }
}
```

### Mapping Properties

| Property | Description |
|----------|-------------|
| `component` | Component name in the shell |
| `category` | Same as pattern category |
| `client` | Optional - client-specific component |
| `deprecated` | Optional - marks pattern as deprecated |
| `replacedBy` | Optional - replacement pattern for deprecated ones |

---

## Event Contracts

Event contracts define what events a component emits and requires. This is critical for **closed-circuit validation** - ensuring every UI interaction has a corresponding state machine transition.

```json
{
  "contracts": {
    "form": {
      "emits": [
        {
          "event": "SAVE",
          "trigger": "submit",
          "payload": { "type": "FormData" }
        },
        {
          "event": "CANCEL",
          "trigger": "click",
          "payload": { "type": "void" }
        }
      ],
      "requires": ["SAVE", "CANCEL"],
      "entityAware": true
    },
    "entity-table": {
      "emits": [
        {
          "event": "VIEW",
          "trigger": "action",
          "payload": { "type": "EntityRow" },
          "optional": true
        },
        {
          "event": "SELECT",
          "trigger": "select",
          "payload": { "type": "EntityRow" },
          "optional": true
        },
        {
          "event": "EDIT",
          "trigger": "action",
          "payload": { "type": "EntityRow" },
          "optional": true
        },
        {
          "event": "DELETE",
          "trigger": "action",
          "payload": { "type": "EntityRow" },
          "optional": true
        }
      ],
      "requires": [],
      "entityAware": true,
      "configDriven": true
    }
  }
}
```

### Contract Properties

| Property | Description |
|----------|-------------|
| `emits` | Events the component can emit |
| `requires` | Events that MUST have transitions (closed circuit) |
| `entityAware` | Component receives entity data |
| `configDriven` | Events are determined by config (e.g., `itemActions`) |

### Event Definition

| Property | Description |
|----------|-------------|
| `event` | Event name (e.g., `SAVE`, `CANCEL`, `SELECT`) |
| `trigger` | What triggers the event: `click`, `submit`, `change`, `action`, `close` |
| `payload` | Payload type: `void`, `FormData`, `EntityRow`, or custom shape |
| `optional` | If `true`, transition is not required |

### Closed Circuit Integration

Event contracts power the [Closed Circuit](/docs/en/core-concepts/closed-circuit) validation:

1. **Required Events**: If `requires: ["SAVE", "CANCEL"]`, the validator ensures transitions exist for both events
2. **Overlay Patterns**: `modal` and `drawer` require `CLOSE` transitions to prevent stuck UI states
3. **Config-Driven Events**: For `entity-table` with `itemActions: [{ event: "DELETE" }]`, the validator checks for a `DELETE` transition

---

## Component Interface Requirements

Components mapped to patterns must implement specific interfaces to participate in the closed circuit.

### EntityBoundPatternProps

For data-bound components (`entity-table`, `entity-list`, `form`, etc.):

```typescript
interface EntityBoundPatternProps {
  entity?: string;           // Entity type name
  data?: unknown[];          // Data array
  isLoading?: boolean;       // Loading state
  error?: Error | null;      // Error state
}
```

### Event Bus Integration

All interactive components must emit events via the Event Bus, not internal callbacks:

```typescript
// CORRECT - uses event bus
const handleRowClick = (row: EntityRow) => {
  eventBus.emit('UI:SELECT', { row });
};

// WRONG - internal state management
const handleRowClick = (row: EntityRow) => {
  setSelectedRow(row);  // Breaks the circuit!
};
```

### Action Props Pattern

Components with configurable actions receive them as props:

```typescript
interface ActionablePatternProps {
  actions?: Array<{
    label: string;
    event: string;        // Event to emit
    variant?: 'primary' | 'secondary' | 'danger';
    icon?: string;
  }>;
  itemActions?: Array<{   // For row-level actions
    label: string;
    event: string;
    icon?: string;
  }>;
}
```

The component emits `UI:{event}` when the action is triggered, completing the circuit back to the state machine.

---

## Design System

The design system contains the actual component implementations that patterns map to.

### Component Hierarchy

| Level | Purpose | Examples |
|-------|---------|----------|
| **Atoms** | Indivisible UI elements | `Button`, `Input`, `Badge`, `Icon`, `Spinner` |
| **Molecules** | Simple compositions | `SearchInput`, `Tabs`, `Breadcrumb`, `FilterGroup` |
| **Organisms** | Complex, self-contained | `DataTable`, `Form`, `PageHeader`, `ModalSlot` |
| **Templates** | Page-level layouts | Client-specific full-page components |

---

## Using Patterns in Schemas

### render-ui Effect

Patterns are used via the `render-ui` effect in trait transitions:

```json
{
  "from": "viewing",
  "to": "viewing",
  "event": "INIT",
  "effects": [
    ["render-ui", "main", {
      "type": "page-header",
      "title": "Tasks",
      "actions": [
        { "label": "Create Task", "event": "CREATE", "variant": "primary" }
      ]
    }],
    ["render-ui", "main", {
      "type": "entity-table",
      "entity": "Task",
      "columns": ["title", "status", "assignee"],
      "itemActions": [
        { "label": "Edit", "event": "EDIT" },
        { "label": "Delete", "event": "DELETE", "variant": "danger" }
      ]
    }]
  ]
}
```

### Prop Validation

The compiler validates props against `propsSchema`:

1. **Required props** must be present
2. **Prop types** must match allowed types
3. **Unknown props** generate warnings

### Event Wiring

For each action/itemAction event:

1. Component emits `UI:{EVENT}` via event bus
2. `useUIEvents` hook catches and dispatches to trait
3. State machine processes the event
4. Effects execute, potentially re-rendering

---

## Available Patterns

The following patterns are available out of the box:

### Display Patterns

| Pattern | Description | Common Props |
|---------|-------------|--------------|
| `entity-table` | Data table with columns and sorting | `entity`, `columns`, `itemActions` |
| `entity-list` | List view of entity items | `entity`, `itemActions` |
| `entity-cards` | Card grid layout for entities | `entity`, `columns`, `itemActions` |
| `stats` | Statistics display with cards | `items` |
| `detail-view` | Single entity detail display | `entity`, `fields` |

### Form Patterns

| Pattern | Description | Common Props |
|---------|-------------|--------------|
| `form` | Complete form with validation | `entity`, `fields`, `layout` |
| `form-section` | Grouped form fields | `title`, `fields` |
| `form-fields` | Inline form fields | `fields` |

### Header Patterns

| Pattern | Description | Common Props |
|---------|-------------|--------------|
| `page-header` | Page title with actions | `title`, `subtitle`, `actions` |
| `title-only` | Simple title display | `title` |

### Filter Patterns

| Pattern | Description | Common Props |
|---------|-------------|--------------|
| `search-bar` | Global search input | `placeholder`, `entity` |
| `filter-group` | Filter chips/buttons | `filters` |
| `search-input` | Standalone search field | `placeholder` |

### Navigation Patterns

| Pattern | Description | Common Props |
|---------|-------------|--------------|
| `tabs` | Tab navigation | `items`, `activeTab` |
| `breadcrumb` | Breadcrumb trail | `items` |
| `wizard-progress` | Step indicator for wizards | `steps`, `currentStep` |
| `pagination` | Page navigation | `page`, `totalPages` |

### Layout Patterns

| Pattern | Description | Common Props |
|---------|-------------|--------------|
| `modal` | Modal dialog overlay | `title`, `children` |
| `drawer` | Side panel overlay | `title`, `position` |
| `master-detail` | Split view layout | `master`, `detail` |
| `dashboard-grid` | Grid layout for dashboards | `items` |

### State Patterns

| Pattern | Description | Common Props |
|---------|-------------|--------------|
| `empty-state` | Empty data placeholder | `title`, `description`, `action` |
| `loading-state` | Loading indicator | `message` |
| `error-state` | Error display | `error`, `onRetry` |

---

## Summary

The Pattern System provides:

1. **Pattern Registry** - Defines available patterns with props, categories, and metadata
2. **Component Mapping** - Connects pattern types to shell components
3. **Event Contracts** - Specifies what events components emit and require
4. **Closed Circuit Validation** - Ensures all UI interactions have state machine handlers
5. **Design System** - Contains actual component implementations

This architecture ensures that schemas remain declarative while the compiler handles the complexity of wiring components to the event-driven state machine system.

---

*For more details on related concepts, see [Traits](/docs/en/core-concepts/traits) and [Closed Circuit](/docs/en/core-concepts/closed-circuit).*
