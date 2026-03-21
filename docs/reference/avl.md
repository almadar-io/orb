---
sidebar_position: 4
title: "AVL: Almadar Visual Language"
---

import { AvlEntity, AvlOrbital, AvlTrait, AvlPage, AvlState, AvlTransition, AvlEvent, AvlGuard, AvlEffect, AvlField, AvlFieldType, AvlBinding, AvlPersistence, AvlOperator, AvlSExpr, AvlLiteral, AvlBindingRef, AvlStateMachine, AvlOrbitalUnit, AvlClosedCircuit, AvlEmitListen, AvlSlotMap, AvlExprTree } from '@almadar/ui/illustrations';

# AVL: Almadar Visual Language

AVL is the formal visual notation for Orb programs. Every atom renders as an SVG `<g>` element, composable into larger diagrams. AVL diagrams are language-neutral: identical across English, Arabic, and Slovenian.

## Structural Primitives

### Entity

The nucleus of an Orbital Unit. Radiating lines represent fields. Stroke style indicates persistence kind.

| Persistence | Stroke Style |
|-------------|-------------|
| `persistent` | Solid, strokeWidth 2.5 |
| `runtime` | Dashed: `6 3` |
| `singleton` | Double border, strokeWidth 3.5 |
| `instance` | Fine dashes: `2 3` |

### Orbital

Circle boundary representing the orbital shell that contains an Entity, its Traits, and its Pages.

### Trait

Elliptical orbit around the Entity nucleus. Each trait is a state machine governing one aspect of behavior.

### Page

Square marker on the orbital boundary. Represents a route that binds a trait's UI to a URL.

## Behavioral Primitives

### State

Rounded rectangle. An initial state has a small dot marker. A terminal state has a double border.

### Transition

Arrow between states. Can be straight or curved (using `curveAwayFrom` to arc away from the ring center).

### Event

Lightning bolt shape. Triggers a transition.

### Guard

Condition that must be true for a transition to fire. Displayed as bracketed text: `[guard-name]`.

### Effect

14 effect types, each with a distinct icon:

| Effect | Description |
|--------|------------|
| `render-ui` | Render a UI pattern |
| `set` | Set entity field value |
| `persist` | Save to storage |
| `fetch` | Load from storage |
| `emit` | Emit event to other traits |
| `navigate` | Change route |
| `notify` | Show notification |
| `call-service` | Call external API |
| `spawn` | Create entity instance |
| `despawn` | Remove entity instance |
| `do` | Execute logic |
| `if` | Conditional branch |
| `log` | Log to console |

## Data Primitives

### Field Type Shapes

Each data type has a distinct SVG shape:

| Type | Shape |
|------|-------|
| `string` | Circle |
| `number` | Triangle |
| `boolean` | Square |
| `date` | Diamond |
| `enum` | Ring |
| `object` | Hexagon |
| `array` | Bars |

### Binding

References data from the schema: `@entity`, `@payload`, `@state`, `@now`, `@config`, `@EntityName`.

## Expression Primitives

### Operator Namespace Colors

| Namespace | Color | Hex |
|-----------|-------|-----|
| arithmetic | Blue | `#4A90D9` |
| comparison | Orange | `#E8913A` |
| logic | Purple | `#9B59B6` |
| string | Green | `#27AE60` |
| collection | Teal | `#1ABC9C` |
| time | Yellow | `#F39C12` |
| control | Red | `#E74C3C` |
| async | Pink | `#E91E8F` |

### S-Expression

Visual representation of a nested s-expression. Used alongside `AvlExprTree` for tree layout.

## Composed Diagrams (Molecules)

### AvlStateMachine

Ring of states with curved transitions, event labels, guard text, and effect icons.

```jsx
<AvlStateMachine
  states={[
    { name: "idle", isInitial: true },
    { name: "loading" },
    { name: "loaded", isTerminal: true },
  ]}
  transitions={[
    { from: "idle", to: "loading", event: "FETCH" },
    { from: "loading", to: "loaded", event: "SUCCESS" },
  ]}
  animated
/>
```

### AvlOrbitalUnit

Entity + Traits + Pages in orbital shell. The primary diagram for showing what an Orbital Unit contains.

```jsx
<AvlOrbitalUnit
  entityName="Task"
  fields={5}
  persistence="persistent"
  traits={[{ name: "Lifecycle" }, { name: "Assignment" }]}
  pages={[{ name: "/tasks" }, { name: "/task/:id" }]}
  animated
/>
```

### AvlClosedCircuit

Event flow loop with ambient rings. Shows the closed circuit pattern: Event > Guard > Transition > Effects > UI Response > back to Event.

### AvlEmitListen

Two orbital units connected by an emit/listen wire. Shows inter-trait communication.

### AvlSlotMap

Page layout with named slot regions. Shows which patterns render in which slots (header, main, sidebar, footer).

### AvlExprTree

Tree of operators, literals, and binding references. Visualizes s-expression logic.

## Usage in MDX

Import AVL components in any `.md` or `.mdx` doc:

```jsx
import { AvlStateMachine, AvlOrbitalUnit } from '@almadar/ui/illustrations';

<AvlStateMachine
  states={[...]}
  transitions={[...]}
  animated
/>
```

All AVL components are published via `@almadar/ui/illustrations`.

## How to Read AVL Diagrams

1. **Find the Entity nucleus** at the center. The stroke style tells you the persistence kind.
2. **Count the radiating lines** to see how many fields the entity has.
3. **Follow the elliptical orbits** to identify traits (state machines).
4. **Look for square markers** on the orbital boundary for pages (routes).
5. **Inside each trait**, states form a ring with transition arrows between them.
6. **Transition labels** show: event name (bold), guard condition (brackets), effect icons (below).
7. **Color coding**: operator namespace colors follow the table above.
