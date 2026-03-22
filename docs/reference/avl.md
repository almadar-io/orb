---
sidebar_position: 4
title: "AVL: Almadar Visual Language"
---

import { AvlEntity, AvlOrbital, AvlTrait, AvlPage, AvlState, AvlTransition, AvlEvent, AvlGuard, AvlEffect, AvlField, AvlFieldType, AvlBinding, AvlPersistence, AvlOperator, AvlSExpr, AvlLiteral, AvlBindingRef, AvlStateMachine, AvlOrbitalUnit, AvlClosedCircuit, AvlEmitListen, AvlSlotMap, AvlExprTree } from '@almadar/ui/illustrations';
import OrbCosmicZoom from '@shared/OrbCosmicZoom';

# AVL: Almadar Visual Language

AVL is the formal visual notation for Orb programs. Every construct in the .orb language has a corresponding visual symbol. These diagrams are language-neutral: identical across English, Arabic, and Slovenian.

## The Orbital Unit

The fundamental building block. An Orbital Unit is: one Entity (the data), one or more Traits (the behavior), and Pages (the routes).

<div style={{maxWidth: 500, margin: '2rem auto'}}>
<AvlOrbitalUnit
  entityName="Task"
  fields={5}
  persistence="persistent"
  traits={[{ name: "Lifecycle" }, { name: "Assignment" }]}
  pages={[{ name: "/tasks" }, { name: "/task/:id" }]}
  animated
/>
</div>

Reading this diagram:
- The **outer circle** is the orbital boundary (the module shell)
- The **filled circle at center** is the Entity nucleus. Radiating lines = fields. "Task" with 5 fields.
- The **dashed ellipses** are Traits (state machines). "Lifecycle" and "Assignment" orbit around the entity.
- The **small squares** on the boundary are Pages (routes). "/tasks" and "/task/:id".

---

## Structural Primitives

### Entity

The data nucleus. The stroke style tells you how data is stored:

<div style={{display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', margin: '1.5rem 0'}}>
<div style={{textAlign: 'center'}}>
<svg viewBox="0 0 80 80" width="80" height="80"><AvlEntity x={40} y={40} r={20} fieldCount={4} persistence="persistent" /></svg>
<div style={{fontSize: 12, marginTop: 4}}>Persistent (solid)</div>
</div>
<div style={{textAlign: 'center'}}>
<svg viewBox="0 0 80 80" width="80" height="80"><AvlEntity x={40} y={40} r={20} fieldCount={3} persistence="runtime" /></svg>
<div style={{fontSize: 12, marginTop: 4}}>Runtime (dashed)</div>
</div>
<div style={{textAlign: 'center'}}>
<svg viewBox="0 0 80 80" width="80" height="80"><AvlEntity x={40} y={40} r={20} fieldCount={2} persistence="singleton" /></svg>
<div style={{fontSize: 12, marginTop: 4}}>Singleton (double)</div>
</div>
</div>

### Orbital, Trait, Page

<div style={{display: 'flex', gap: '3rem', justifyContent: 'center', flexWrap: 'wrap', margin: '1.5rem 0', alignItems: 'center'}}>
<div style={{textAlign: 'center'}}>
<svg viewBox="0 0 120 120" width="120" height="120"><AvlOrbital cx={60} cy={60} r={50} label="Module" /></svg>
<div style={{fontSize: 12, marginTop: 4}}>Orbital (boundary)</div>
</div>
<div style={{textAlign: 'center'}}>
<svg viewBox="0 0 140 80" width="140" height="80"><AvlTrait cx={70} cy={40} rx={60} ry={25} label="Behavior" /></svg>
<div style={{fontSize: 12, marginTop: 4}}>Trait (state machine)</div>
</div>
<div style={{textAlign: 'center'}}>
<svg viewBox="0 0 60 60" width="60" height="60"><AvlPage x={30} y={25} label="/route" /></svg>
<div style={{fontSize: 12, marginTop: 4}}>Page (route)</div>
</div>
</div>

---

## Behavioral Primitives

### States and Transitions

States are rounded rectangles arranged in a ring. Transitions are arrows between them. The initial state has a dot marker. Terminal states have a double border.

<div style={{maxWidth: 500, margin: '2rem auto'}}>
<AvlStateMachine
  states={[
    { name: "idle", isInitial: true },
    { name: "loading" },
    { name: "success" },
    { name: "error" },
  ]}
  transitions={[
    { from: "idle", to: "loading", event: "FETCH" },
    { from: "loading", to: "success", event: "DONE", effects: ["render-ui"] },
    { from: "loading", to: "error", event: "FAIL", effects: ["notify"] },
    { from: "error", to: "idle", event: "RETRY" },
    { from: "success", to: "idle", event: "RESET" },
  ]}
  animated
/>
</div>

### Events, Guards, Effects

Each transition can have:

<div style={{display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', margin: '1.5rem 0', alignItems: 'center'}}>
<div style={{textAlign: 'center'}}>
<svg viewBox="0 0 60 50" width="60" height="50"><AvlEvent x={30} y={20} label="CLICK" size={14} /></svg>
<div style={{fontSize: 12}}>Event (trigger)</div>
</div>
<div style={{textAlign: 'center'}}>
<svg viewBox="0 0 80 50" width="80" height="50"><AvlGuard x={40} y={20} label="isValid?" size={14} /></svg>
<div style={{fontSize: 12}}>Guard (condition)</div>
</div>
</div>

**14 Effect types**, each with a distinct icon:

<div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', margin: '1.5rem 0'}}>
{['render-ui', 'set', 'persist', 'fetch', 'emit', 'navigate', 'notify', 'call-service', 'log'].map(type => (
<div key={type} style={{textAlign: 'center', minWidth: 60}}>
<svg viewBox="0 0 40 40" width="40" height="40"><AvlEffect x={20} y={15} effectType={type} size={16} label={type} /></svg>
</div>
))}
</div>

---

## The Closed Circuit

Every user action follows a guaranteed loop: Event triggers a Transition, which checks a Guard, executes Effects, updates the UI, and is ready for the next Event.

<div style={{maxWidth: 500, margin: '2rem auto'}}>
<AvlClosedCircuit
  states={[
    { name: "Event" },
    { name: "Guard" },
    { name: "Transition" },
    { name: "Effects" },
    { name: "UI Response" },
  ]}
  transitions={[
    { from: "Event", to: "Guard" },
    { from: "Guard", to: "Transition" },
    { from: "Transition", to: "Effects" },
    { from: "Effects", to: "UI Response" },
    { from: "UI Response", to: "Event" },
  ]}
  animated
/>
</div>

---

## Cross-Orbital Communication

Traits emit events that other traits in other orbitals listen to. This is how orbitals communicate without coupling.

<div style={{maxWidth: 500, margin: '2rem auto'}}>
<AvlEmitListen
  emitter={{ name: "Orders", fields: 4 }}
  listener={{ name: "Inventory", fields: 3 }}
  eventName="ORDER_PLACED"
  animated
/>
</div>

---

## Data Primitives

### Field Types

Each data type has a distinct shape:

<div style={{display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', margin: '1.5rem 0'}}>
{['string', 'number', 'boolean', 'date', 'enum', 'object', 'array'].map(type => (
<div key={type} style={{textAlign: 'center'}}>
<svg viewBox="0 0 50 50" width="50" height="50"><AvlFieldType x={25} y={20} kind={type} label={type} size={12} /></svg>
</div>
))}
</div>

### Bindings

References to schema data: `@entity.field`, `@payload.value`, `@state`, `@now`.

<div style={{display: 'flex', gap: '2rem', justifyContent: 'center', margin: '1.5rem 0'}}>
<div style={{textAlign: 'center'}}>
<svg viewBox="0 0 100 50" width="100" height="50"><AvlBindingRef x={50} y={20} path="@entity.name" /></svg>
</div>
<div style={{textAlign: 'center'}}>
<svg viewBox="0 0 100 50" width="100" height="50"><AvlBindingRef x={50} y={20} path="@payload.id" /></svg>
</div>
</div>

---

## Expression Trees

Logic in Orb is written as s-expressions: `["gt", "@entity.age", 18]`. AVL renders these as trees:

<div style={{maxWidth: 400, margin: '2rem auto'}}>
<AvlExprTree
  expression={{
    label: "and",
    type: "operator",
    children: [
      { label: "gt", type: "operator", children: [
        { label: "@entity.age", type: "binding" },
        { label: "18", type: "literal" },
      ]},
      { label: "eq", type: "operator", children: [
        { label: "@entity.status", type: "binding" },
        { label: "active", type: "literal" },
      ]},
    ],
  }}
/>
</div>

---

## Slot Map

Pages have named regions where traits render their UI. The slot map shows which patterns appear where:

<div style={{maxWidth: 500, margin: '2rem auto'}}>
<AvlSlotMap
  slots={[
    { name: "header" },
    { name: "sidebar" },
    { name: "main" },
    { name: "modal" },
    { name: "toast" },
  ]}
/>
</div>

---

## Operator Namespace Colors

S-expression operators are color-coded by namespace:

| Namespace | Color | Example |
|-----------|-------|---------|
| arithmetic | Blue `#4A90D9` | `+`, `-`, `*`, `/` |
| comparison | Orange `#E8913A` | `gt`, `lt`, `eq`, `neq` |
| logic | Purple `#9B59B6` | `and`, `or`, `not` |
| string | Green `#27AE60` | `concat`, `upper`, `lower` |
| collection | Teal `#1ABC9C` | `map`, `filter`, `find` |
| time | Yellow `#F39C12` | `now`, `format-date` |
| control | Red `#E74C3C` | `if`, `cond`, `match` |
| async | Pink `#E91E8F` | `debounce`, `throttle` |

---

## Interactive Cosmic Zoom

The AVL Cosmic Zoom lets you explore an entire application interactively. Click orbitals to zoom into their traits, click traits to see their state machines, click transitions to see effect trees.

<OrbCosmicZoom schema={`{
  "name": "TaskManager",
  "orbitals": [{
    "name": "TaskOrbital",
    "entity": {
      "name": "Task",
      "persistence": "persistent",
      "fields": [
        { "name": "id", "type": "string" },
        { "name": "title", "type": "string" },
        { "name": "status", "type": "string", "default": "pending" },
        { "name": "assignee", "type": "string" }
      ]
    },
    "traits": [{
      "name": "TaskCrud",
      "linkedEntity": "Task",
      "category": "interaction",
      "stateMachine": {
        "states": [
          { "name": "Listing", "isInitial": true },
          { "name": "Creating" },
          { "name": "Editing" }
        ],
        "events": [
          { "key": "INIT", "name": "Initialize" },
          { "key": "CREATE", "name": "Create" },
          { "key": "EDIT", "name": "Edit" },
          { "key": "SAVE", "name": "Save" },
          { "key": "CANCEL", "name": "Cancel" }
        ],
        "transitions": [
          { "from": "Listing", "to": "Listing", "event": "INIT", "effects": [["fetch", "Task"], ["render-ui", "main", { "type": "stack" }]] },
          { "from": "Listing", "to": "Creating", "event": "CREATE", "effects": [["render-ui", "modal", { "type": "form" }]] },
          { "from": "Creating", "to": "Listing", "event": "SAVE", "effects": [["persist", "create", "Task"]] },
          { "from": "Creating", "to": "Listing", "event": "CANCEL" },
          { "from": "Listing", "to": "Editing", "event": "EDIT", "effects": [["render-ui", "modal", { "type": "form" }]] },
          { "from": "Editing", "to": "Listing", "event": "SAVE", "effects": [["persist", "update", "Task"]] },
          { "from": "Editing", "to": "Listing", "event": "CANCEL" }
        ]
      }
    }],
    "pages": [
      { "name": "TaskList", "path": "/tasks" },
      { "name": "TaskDetail", "path": "/tasks/:id" }
    ]
  }]
}`} height="500px" />

---

## How to Read AVL Diagrams

1. **Find the Entity nucleus** at the center. The stroke style tells you the persistence kind (solid = persistent, dashed = runtime, double = singleton).
2. **Count the radiating lines** to see how many fields the entity has.
3. **Follow the elliptical orbits** to identify traits (state machines).
4. **Look for square markers** on the orbital boundary for pages (routes).
5. **Inside each trait**, states form a layout with transition arrows between them.
6. **Transition labels** show: event name (bold), effect icons (below).
7. **Dashed arrows** between orbitals show cross-orbital event flow (emit/listen).
8. **Color coding**: operator namespace colors follow the table above.
