# Standard Library

> Standard library behaviors for Orb applications

---

## 1. Overview

The Standard Library provides **34 reusable behaviors** (standard traits) for the Orbital system. Each behavior is a self-contained `OrbitalSchema` that can function as a standalone `.orb` file.

### Behavior Categories

| Category | Behaviors |
|----------|-----------|
| **Game Core** | GameLoop, Physics2D, Input, Collision |
| **Game Entity** | Health, Score, Movement, Combat, Inventory |
| **Game UI** | GameFlow, Dialogue, LevelProgress |
| **UI Interaction** | List, Detail, Form, Modal, Drawer, Tabs, Wizard, MasterDetail, Filter |
| **Data Management** | Pagination, Selection, Sort, Filter, Search |
| **Async** | Loading, Fetch, Submit, Retry, Poll |
| **Feedback** | Notification, Confirmation, Undo |

---

## 2. Behavior Structure (OrbitalSchema)

Each behavior is a complete `OrbitalSchema` (aliased as `BehaviorSchema`):

```typescript
import type { BehaviorSchema } from '@almadar/std';

export const LIST_BEHAVIOR: BehaviorSchema = {
  name: 'std-list',
  version: '1.0.0',
  description: 'Entity list with selection and actions',
  orbitals: [{
    name: 'ListOrbital',
    entity: {
      name: 'ListState',
      persistence: 'runtime',
      fields: [
        { name: 'id', type: 'string', required: true },
        { name: 'selectedId', type: 'string', default: null },
        { name: 'items', type: 'array', default: [] },
      ],
    },
    traits: [{
      name: 'List',
      linkedEntity: 'ListState',
      category: 'interaction',
      stateMachine: {
        states: [
          { name: 'Empty', isInitial: true },
          { name: 'Loaded' },
          { name: 'ItemSelected' },
        ],
        events: [/* ... */],
        transitions: [/* ... */],
      },
    }],
    pages: [],
  }],
};
```

### Key Structure Points

- **`name`**: Kebab-case with `std-` prefix (e.g., `std-list`, `std-gameloop`)
- **`orbitals`**: Array containing one orbital with entity, traits, and pages
- **`entity`**: Runtime state fields
- **`traits`**: Array of trait definitions with `linkedEntity`
- **`pages`**: Empty array (required by type, can be populated for pages)

---

## 3. Type-Safe Pattern Validation

### PatternType Union

The `render-ui` effect enforces valid pattern types at compile-time:

```typescript
import type { PatternConfig } from '@almadar/core';

export interface PatternConfig {
  type: PatternType;  // 203 valid patterns
  [key: string]: unknown;
}
```

The `PatternType` union includes all registered patterns:

```typescript
export type PatternType =
  | 'entity-table'
  | 'card'
  | 'form'
  | 'button'
  // ... 199 more patterns
  ;
```

### Usage in Behaviors

```typescript
// ✅ Valid - 'entity-table' with typed props
['render-ui', 'main', { patternType: 'entity-table', columns: ['name', 'email'] }]

// ❌ TypeScript error - 'fake-pattern' is not a valid PatternType
['render-ui', 'main', { patternType: 'fake-pattern' }]

// ❌ TypeScript error - missing required 'columns' prop
['render-ui', 'main', { patternType: 'entity-table' }]
```

---

## 4. Usage

### Import Behaviors

```typescript
import { 
  LIST_BEHAVIOR,
  FORM_BEHAVIOR,
  LOADING_BEHAVIOR,
  STANDARD_BEHAVIORS,
} from '@almadar/std';

// Access all 34 behaviors
console.log(STANDARD_BEHAVIORS.length); // 34
```

### Type Imports

```typescript
import type { 
  BehaviorSchema,   // OrbitalSchema alias
  OrbitalSchema,    // Full schema type
  Orbital,          // Single orbital
  Entity,           // Entity definition
} from '@almadar/std';
```

### Registry Functions

```typescript
import { 
  getBehavior,
  isKnownBehavior,
  getAllBehaviorNames,
  getBehaviorLibraryStats,
} from '@almadar/std';

// Get behavior by name
const list = getBehavior('std-list');

// Check if valid
if (isKnownBehavior('std-form')) { /* ... */ }

// Get stats
const stats = getBehaviorLibraryStats();
// { totalBehaviors: 34, totalStates: X, totalEvents: X, ... }
```

---

## Complete Behavior Reference (34 Behaviors)

### Game Behaviors (12)

| Behavior | Description | States | Events |
|----------|-------------|--------|--------|
| `GAME_LOOP_BEHAVIOR` | Main game loop with update/render | Paused, Running | START, PAUSE, RESUME |
| `PHYSICS_2D_BEHAVIOR` | 2D physics simulation | Static, Dynamic | COLLISION, APPLY_FORCE |
| `INPUT_BEHAVIOR` | Input handling (keyboard, mouse, touch) | Idle, Active | KEY_DOWN, KEY_UP, CLICK |
| `COLLISION_BEHAVIOR` | Collision detection | Clear, Colliding | ENTER, EXIT |
| `HEALTH_BEHAVIOR` | Health/damage system | Healthy, Damaged, Dead | DAMAGE, HEAL, REVIVE |
| `SCORE_BEHAVIOR` | Points/scoring system | Idle, Updating | ADD_POINTS, RESET |
| `MOVEMENT_BEHAVIOR` | Entity movement | Idle, Moving | MOVE, STOP, TELEPORT |
| `COMBAT_BEHAVIOR` | Combat mechanics | Peaceful, InCombat, Cooldown | ATTACK, DEFEND, DODGE |
| `INVENTORY_BEHAVIOR` | Item inventory | Empty, HasItems | ADD_ITEM, REMOVE_ITEM |
| `GAME_FLOW_BEHAVIOR` | Game state management | Menu, Playing, Paused, GameOver | START, PAUSE, RESUME, END |
| `DIALOGUE_BEHAVIOR` | NPC dialogue system | Idle, Active | START_DIALOGUE, ADVANCE, END |
| `LEVEL_PROGRESS_BEHAVIOR` | Level/quest tracking | InProgress, Completed | COMPLETE_OBJECTIVE, UNLOCK |

### UI Interaction Behaviors (9)

| Behavior | Description | Use Case |
|----------|-------------|----------|
| `LIST_BEHAVIOR` | Entity list with selection | Data tables, lists |
| `DETAIL_BEHAVIOR` | Single entity display | Item detail, profile |
| `FORM_BEHAVIOR` | Input form handling | Create/edit forms |
| `MODAL_BEHAVIOR` | Modal dialog | Alerts, confirmations |
| `DRAWER_BEHAVIOR` | Side panel drawer | Navigation, filters |
| `TABS_BEHAVIOR` | Tab interface | Content sections |
| `WIZARD_BEHAVIOR` | Multi-step wizard | Onboarding, checkout |
| `MASTER_DETAIL_BEHAVIOR` | Master-detail layout | Email, file explorer |
| `FILTER_BEHAVIOR` | Data filtering | Search results, lists |

### Data Management Behaviors (5)

| Behavior | Description | Features |
|----------|-------------|----------|
| `PAGINATION_BEHAVIOR` | Page through data | Page size, navigation |
| `SELECTION_BEHAVIOR` | Multi-select items | Select all, range select |
| `SORT_BEHAVIOR` | Sort data columns | Multi-column sort |
| `SEARCH_BEHAVIOR` | Full-text search | Debounced, filters |

### Async Behaviors (5)

| Behavior | Description | States |
|----------|-------------|--------|
| `LOADING_BEHAVIOR` | Loading states | Idle, Loading, Success, Error |
| `FETCH_BEHAVIOR` | Data fetching | Fresh, Stale, Refreshing |
| `SUBMIT_BEHAVIOR` | Form submission | Ready, Submitting, Submitted |
| `RETRY_BEHAVIOR` | Retry with backoff | Failed, Retrying, Recovered |
| `POLL_BEHAVIOR` | Polling updates | Polling, Stopped |

### Feedback Behaviors (3)

| Behavior | Description | Features |
|----------|-------------|----------|
| `NOTIFICATION_BEHAVIOR` | Toast notifications | Auto-dismiss, actions |
| `CONFIRMATION_BEHAVIOR` | Confirm actions | OK/Cancel, custom buttons |
| `UNDO_BEHAVIOR` | Undo/redo stack | Time-limited undo |

---

## API Reference

### Behavior Registry

```typescript
// Get single behavior
import { getBehavior } from '@almadar/std';

// Check if exists
import { isKnownBehavior } from '@almadar/std';

// List all
import { getAllBehaviorNames, getAllBehaviors } from '@almadar/std';

// Metadata
import { getAllBehaviorMetadata } from '@almadar/std';

// Find by use case
import { findBehaviorsForUseCase } from '@almadar/std';

// Event filtering
import { getBehaviorsForEvent } from '@almadar/std';

// State filtering
import { getBehaviorsWithState } from '@almadar/std';

// Validation
import { validateBehaviorReference } from '@almadar/std';
```

### Standard Library Operators

```typescript
// Math operations
import { MATH_OPERATORS } from '@almadar/std';

// String operations
import { STR_OPERATORS } from '@almadar/std';

// Array operations
import { ARRAY_OPERATORS } from '@almadar/std';

// Object operations
import { OBJECT_OPERATORS } from '@almadar/std';

// Time operations
import { TIME_OPERATORS } from '@almadar/std';

// Validation
import { VALIDATE_OPERATORS } from '@almadar/std';

// Formatting
import { FORMAT_OPERATORS } from '@almadar/std';

// Async utilities
import { ASYNC_OPERATORS } from '@almadar/std';
```

### Registry Access

```typescript
// All operators lookup
import {
  STD_OPERATORS,
  STD_OPERATORS_BY_MODULE,
  getStdOperatorMeta,
  isKnownStdOperator,
} from '@almadar/std';

// Module queries
import {
  getModuleOperators,
  getAllStdOperators,
  getStdOperatorsByModule,
} from '@almadar/std';

// Classification
import {
  getLambdaOperators,
  getStdEffectOperators,
  getStdPureOperators,
} from '@almadar/std';

// Validation
import {
  validateStdOperatorArity,
  isStdGuardOperator,
  isStdEffectOperator,
} from '@almadar/std';
```

### Documentation Generation

```typescript
import {
  generateOperatorDoc,
  generateModuleDoc,
  generateBehaviorDoc,
  generateModulesDocs,
  generateBehaviorsDocs,
  generateStdLibDocs,
} from '@almadar/std';
```
