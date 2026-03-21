# Standard Library

> 93 reusable behaviors organized as atoms, molecules, and organisms.

---

## Overview

The Standard Library provides **93 reusable behaviors** for Orb applications, organized in three tiers:

| Tier | Count | Role | Examples |
|------|-------|------|----------|
| **Atoms** | 50 | Self-contained, irreducible state machines | std-browse, std-modal, std-search, std-filter, std-timer |
| **Molecules** | 18 | Compose atoms via shared event bus | std-list, std-cart, std-detail, std-messaging |
| **Organisms** | 25 | Compose molecules into full applications | std-ecommerce, std-crm, std-lms, std-helpdesk |

Each behavior is a pure function that returns a complete `OrbitalDefinition` (entity + traits + pages). You call it with parameters (entity name, fields, page path) and get a ready-to-compile `.orb` structure.

import { AvlOrbitalUnit } from '@almadar/ui/illustrations';

<div style={{margin: '2rem 0'}}>
<AvlOrbitalUnit
  entityName="Product"
  fields={5}
  persistence="persistent"
  traits={[{name: 'Browse'}, {name: 'Create'}, {name: 'Edit'}, {name: 'View'}]}
  pages={[{name: 'ProductListPage'}]}
  animated
/>
</div>

```typescript
import { stdList } from '@almadar/std/behaviors/functions';

const orbital = stdList({
  entityName: 'Product',
  fields: [
    { name: 'title', type: 'string', required: true },
    { name: 'price', type: 'number', required: true },
  ],
  pagePath: '/products',
  pageTitle: 'Products',
});
// Returns: entity + 4 traits (browse, create, edit, view) + 1 page
```

---

## Composition Model

### Atoms: Building Blocks

Atoms are irreducible. Each is a single trait with a single state machine. They don't know about each other.

```
std-browse: Browsing ──INIT──► Browsing (fetch + render list)
std-modal:  Closed ──OPEN──► Open ──CLOSE──► Closed
std-search: Idle ──SEARCH──► Searching ──RESULTS──► Idle
std-filter: Idle ──FILTER──► Filtered ──CLEAR──► Idle
```

### Molecules: Composed Atoms

Molecules combine atoms using `extractTrait` (pull out the trait) and `wire` (connect emit/listen events between traits). A molecule is NOT a new behavior. It's atoms wired together.

```
std-list = std-browse + std-modal(create) + std-modal(edit) + std-modal(view)
  └─ browse emits SELECT ──► view listens
  └─ create emits SAVED ──► browse listens (refresh)
  └─ edit emits SAVED ──► browse listens (refresh)
```

```typescript
import { stdBrowse, stdModal } from '@almadar/std/behaviors/functions';
import { connect, compose } from '@almadar/core/builders';

// std-list is roughly this composition:
const browseTrait = extractTrait(stdBrowse({ entityName: 'Product', ... }));
const createTrait = extractTrait(stdModal({ mode: 'create', ... }));
const editTrait = extractTrait(stdModal({ mode: 'edit', ... }));
const viewTrait = extractTrait(stdModal({ mode: 'view', ... }));

// Wire events between traits
wire(createTrait, 'PRODUCT_CREATED', browseTrait, 'INIT');
wire(editTrait, 'PRODUCT_UPDATED', browseTrait, 'INIT');

// Compose into one orbital
const orbital = compose({
  entityName: 'Product',
  traits: [browseTrait, createTrait, editTrait, viewTrait],
  pages: [{ path: '/products', traits: ['ProductBrowse', 'ProductCreate', 'ProductEdit', 'ProductView'] }],
});
```

### Organisms: Full Applications

Organisms compose molecules into multi-page applications with cross-entity wiring.

```
std-ecommerce = std-list(Product) + std-cart(CartItem) + std-wizard(Checkout)
  └─ Product browse emits ADD_TO_CART ──► Cart listens
  └─ Cart emits CHECKOUT ──► Checkout listens
  └─ Checkout emits ORDER_PLACED ──► Cart listens (clear)
```

---

## Behavior Catalog

### Atoms (50)

#### UI Interaction
| Behavior | Description |
|----------|-------------|
| `std-browse` | Entity list with fetch, render as data-grid or entity-cards |
| `std-modal` | Open/close overlay for create, edit, or view |
| `std-drawer` | Slide-in panel from edge of screen |
| `std-tabs` | Tab switching with content panels |
| `std-wizard` | Multi-step form with next/back navigation |
| `std-confirmation` | Yes/no dialog before destructive actions |
| `std-display` | Read-only entity detail view |
| `std-input` | Form input with validation |
| `std-upload` | File upload with progress |
| `std-gallery` | Image gallery with lightbox |
| `std-flip-card` | Card with front/back flip animation |
| `std-rating` | Star or numeric rating input |
| `std-text-effects` | Animated text (typewriter, fade, etc.) |
| `std-theme` | Theme switching (light/dark/custom) |

#### Data Management
| Behavior | Description |
|----------|-------------|
| `std-search` | Search input with debounced query + filtered results |
| `std-filter` | Filter controls that narrow a dataset |
| `std-sort` | Sort controls for column ordering |
| `std-pagination` | Page navigation for large datasets |
| `std-selection` | Multi-select with checkboxes |
| `std-undo` | Undo/redo stack for reversible actions |
| `std-calendar` | Date picker / calendar view |

#### Async + State
| Behavior | Description |
|----------|-------------|
| `std-async` | Loading/success/error state machine for async operations |
| `std-loading` | Loading spinner with timeout |
| `std-timer` | Countdown or stopwatch |
| `std-notification` | Toast notifications with auto-dismiss |
| `std-cache-aside` | Cache-aside pattern (check cache, fetch if miss) |
| `std-circuit-breaker` | Circuit breaker for failing external calls |
| `std-rate-limiter` | Rate limiting for API calls |

#### Game Core
| Behavior | Description |
|----------|-------------|
| `std-combat` | Turn-based or real-time combat system |
| `std-movement` | Grid or free movement on a map |
| `std-collision` | Collision detection between game objects |
| `std-physics2d` | 2D physics simulation (gravity, velocity) |
| `std-quest` | Quest/mission tracking with objectives |
| `std-overworld` | World map with location selection |
| `std-gameflow` | Game state machine (menu, playing, paused, game-over) |
| `std-sprite` | Sprite animation with frame sequences |
| `std-score` | Score tracking with multipliers |

#### Game UI
| Behavior | Description |
|----------|-------------|
| `std-game-hud` | Heads-up display (health, mana, minimap) |
| `std-score-board` | Leaderboard / high scores |
| `std-game-menu` | Main menu, settings, credits |
| `std-game-over-screen` | Game over with retry/quit |
| `std-dialogue-box` | NPC dialogue with choices |
| `std-inventory-panel` | Inventory grid with drag-and-drop |
| `std-combat-log` | Scrolling combat event log |
| `std-game-audio` | Music and sound effect management |

#### Game Canvas
| Behavior | Description |
|----------|-------------|
| `std-game-canvas2d` | 2D canvas rendering loop |
| `std-game-canvas3d` | 3D canvas with Three.js integration |
| `std-isometric-canvas` | Isometric tile-based game canvas |
| `std-platformer-canvas` | Side-scrolling platformer canvas |
| `std-simulation-canvas` | Physics/particle simulation canvas |

### Molecules (18)

| Behavior | Composed From | Description |
|----------|--------------|-------------|
| `std-list` | browse + modal(create/edit/view) | Full CRUD list with create, edit, view modals |
| `std-detail` | display + modal(edit) | Detail view with inline editing |
| `std-cart` | browse + selection + confirmation | Shopping cart with add/remove/checkout |
| `std-inventory` | browse + selection + modal | Inventory management with stock tracking |
| `std-messaging` | browse + input + async | Real-time message list with send |
| `std-geospatial` | browse + modal + map | Location-based data with map markers |
| `std-form-advanced` | wizard + input + validation | Multi-section form with conditional fields |
| `std-quiz` | wizard + score + timer | Timed quiz with scoring |
| `std-turn-based-battle` | combat + score + game-hud | Turn-based battle system |
| `std-platformer-game` | movement + collision + physics2d | Side-scrolling platformer mechanics |
| `std-puzzle-game` | selection + score + timer | Puzzle game with move counting |
| `std-builder-game` | selection + inventory + canvas | Builder/crafting game mechanics |
| `std-classifier-game` | selection + score + timer | Sorting/classification game |
| `std-sequencer-game` | timer + score + input | Sequence memorization game |
| `std-debugger-game` | browse + selection + score | Bug-finding debugging game |
| `std-negotiator-game` | dialogue + score + timer | Negotiation/dialogue game |
| `std-simulator-game` | simulation-canvas + timer + score | Physics simulation game |
| `std-event-handler-game` | timer + score + input | Event-driven reaction game |

### Organisms (25)

| Behavior | Domain | Description |
|----------|--------|-------------|
| `std-ecommerce` | Commerce | Product catalog + cart + checkout |
| `std-crm` | Sales | Contact/deal/pipeline management |
| `std-lms` | Education | Course/lesson/progress tracking |
| `std-cms` | Content | Article/page/media management |
| `std-helpdesk` | Support | Ticket triage, investigation, resolution |
| `std-hr-portal` | HR | Employee/leave/review management |
| `std-social-feed` | Social | Post/comment/like feed |
| `std-project-manager` | PM | Task/sprint/board management |
| `std-booking-system` | Hospitality | Room/slot/reservation management |
| `std-finance-tracker` | Finance | Transaction/budget/report tracking |
| `std-healthcare` | Medical | Patient/appointment/record management |
| `std-realtime-chat` | Communication | Chat rooms with real-time messages |
| `std-trading-dashboard` | Finance | Market data + order execution |
| `std-iot-dashboard` | IoT | Device monitoring + alerts |
| `std-devops-dashboard` | DevOps | Service health + deployment tracking |
| `std-cicd-pipeline` | DevOps | Build/test/deploy pipeline |
| `std-api-gateway` | Infrastructure | Route/rate-limit/auth management |
| `std-coding-academy` | Education | Interactive coding lessons |
| `std-stem-lab` | Education | Science experiment simulations |
| `std-logic-training` | Education | Logic puzzle training |
| `std-rpg-game` | Gaming | Role-playing game with quests + combat |
| `std-platformer-app` | Gaming | Full platformer game application |
| `std-puzzle-app` | Gaming | Puzzle game collection |
| `std-strategy-game` | Gaming | Turn-based strategy game |
| `std-arcade-game` | Gaming | Classic arcade game mechanics |

---

## Using Behaviors

### As Pure Functions

```typescript
import { stdList, stdEcommerce } from '@almadar/std/behaviors/functions';

// Simple: one entity with CRUD
const tasks = stdList({
  entityName: 'Task',
  fields: [
    { name: 'title', type: 'string', required: true },
    { name: 'status', type: 'enum', values: ['todo', 'doing', 'done'] },
  ],
  pagePath: '/tasks',
});

// Complex: multi-entity e-commerce
const shop = stdEcommerce({
  productEntity: 'Product',
  productFields: [...],
  cartEntity: 'CartItem',
  orderEntity: 'Order',
});
```

### As Golden .orb Files

Every behavior is also exported as a `.orb` file in `@almadar/std/behaviors/exports/`:

```bash
# List all available behaviors
ls node_modules/@almadar/std/behaviors/exports/atoms/
ls node_modules/@almadar/std/behaviors/exports/molecules/
ls node_modules/@almadar/std/behaviors/exports/organisms/
```

These golden files are used by:
- The Orb compiler for behavior matching
- The AI agent for schema generation
- The Masar planner for structural comparison

### Composing Custom Behaviors

```typescript
import { stdBrowse, stdModal, stdSearch } from '@almadar/std/behaviors/functions';
import { compose, wire, extractTrait } from '@almadar/core/builders';

// Create a custom molecule: searchable list with create modal
const searchableCatalog = compose({
  appName: 'Catalog',
  orbitals: [
    stdBrowse({ entityName: 'Item', fields: [...] }),
    stdSearch({ entityName: 'Item' }),
    stdModal({ entityName: 'Item', mode: 'create' }),
  ],
});
```

---

## Pattern Integration

Behaviors use patterns from the **pattern registry** (233 patterns) for their `render-ui` effects. Each pattern maps to a React component:

| Pattern Category | Examples | Used By |
|-----------------|----------|---------|
| Data display | `data-grid`, `entity-table`, `entity-cards`, `data-list` | std-browse |
| Forms | `form-section`, `form-field`, `form-wizard` | std-modal, std-wizard |
| Navigation | `page-header`, `breadcrumb`, `tabs` | std-tabs, pages |
| Feedback | `alert`, `toast`, `modal-dialog` | std-notification, std-confirmation |
| Layout | `stack`, `grid`, `sidebar-layout` | All organisms |
| Game | `game-canvas`, `game-hud`, `score-display` | Game behaviors |

---

## Next Steps

- [Entities](./entities.md): How entity data models work
- [Traits](./traits.md): How state machines define behavior
- [Patterns](./patterns.md): How render-ui effects map to components
- [Closed Circuit](./closed-circuit.md): The event flow pattern
