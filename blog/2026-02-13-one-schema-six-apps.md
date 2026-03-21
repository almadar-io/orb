---
slug: one-schema-six-apps
title: "One Schema, Five Apps: How We Built a Government Tool, an AI Platform, and Two Games with the Same Language"
authors: [almadar]
tags: [case-study, architecture]
---

A government inspection system. An AI learning platform. A personal fitness tracker. A tactical strategy game. A 3D dungeon crawler.

Five applications. Five completely different domains. One language.

Here's how — and why it matters.

<!-- truncate -->

import HeroSchemaAnimation from '@site/src/components/HeroSchemaAnimation';

export const inspectionSchema = {
  name: "InspectionSystem",
  orbitals: [{
    name: "Inspection",
    entity: { name: "Inspection" },
    traits: [{
      name: "Workflow",
      stateMachine: {
        states: [
          { name: "Intro", isInitial: true },
          { name: "Content" },
          { name: "Prep" },
          { name: "Record" },
          { name: "Closing", isTerminal: true }
        ],
        transitions: [
          { from: "Intro", to: "Content", event: "PROCEED" },
          { from: "Content", to: "Prep", event: "PROCEED" },
          { from: "Prep", to: "Record", event: "SAVE" },
          { from: "Record", to: "Closing", event: "CLOSE" }
        ]
      }
    }],
    pages: [{ name: "Form" }]
  }]
};

export const kflowSchema = {
  name: "KFlowPlatform",
  orbitals: [{
    name: "Concept",
    entity: { name: "Concept" },
    traits: [{
      name: "Expansion",
      stateMachine: {
        states: [
          { name: "seed", isInitial: true },
          { name: "expanding" },
          { name: "expanded" },
          { name: "published", isTerminal: true }
        ],
        transitions: [
          { from: "seed", to: "expanding", event: "EXPAND" },
          { from: "expanding", to: "expanded", event: "AI_DONE" },
          { from: "expanded", to: "published", event: "PUBLISH" }
        ]
      }
    }],
    pages: [{ name: "Graph" }]
  }]
};

export const fitnessSchema = {
  name: "FitnessTracker",
  orbitals: [{
    name: "Session",
    entity: { name: "Session" },
    traits: [{
      name: "Booking",
      stateMachine: {
        states: [
          { name: "open", isInitial: true }, // available -> open to fit
          { name: "booked" },
          { name: "done", isTerminal: true }, // completed -> done
          { name: "cancelled" }
        ],
        transitions: [
          { from: "open", to: "booked", event: "BOOK" },
          { from: "booked", to: "cancelled", event: "CANCEL" },
          { from: "booked", to: "done", event: "COMPLETE" }
        ]
      }
    }],
    pages: [{ name: "Schedule" }]
  }]
};

export const traitWarsSchema = {
  name: "TraitWars",
  orbitals: [{
    name: "Unit",
    entity: { name: "Unit" },
    traits: [{
      name: "Combat",
      stateMachine: {
        states: [
          { name: "idle", isInitial: true },
          { name: "moving" },
          { name: "attacking" },
          { name: "dead", isTerminal: true }
        ],
        transitions: [
          { from: "idle", to: "moving", event: "MOVE" },
          { from: "moving", to: "attacking", event: "ATTACK" },
          { from: "attacking", to: "idle", event: "END_TURN" },
          { from: "idle", to: "dead", event: "DIE" }
        ]
      }
    }],
    pages: [{ name: "Battlefield" }]
  }]
};

export const iramSchema = {
  name: "Iram",
  orbitals: [{
    name: "Boss",
    entity: { name: "Boss" },
    traits: [{
      name: "Encounter",
      stateMachine: {
        states: [
          { name: "dormant", isInitial: true },
          { name: "phase1" },
          { name: "phase2" },
          { name: "defeated", isTerminal: true }
        ],
        transitions: [
          { from: "dormant", to: "phase1", event: "ENGAGE" },
          { from: "phase1", to: "phase2", event: "DAMAGE" },
          { from: "phase2", to: "defeated", event: "KILL" }
        ]
      }
    }],
    pages: [{ name: "Dungeon" }]
  }]
};

## The Claim

Every programming language claims to be "general purpose." But when was the last time you used the same framework to build a game *and* a government compliance tool?

Almadar's Orbital architecture is domain-agnostic by design. An Orbital is: Entity + Traits + Pages. That formula works for any domain because it models **behavior**, not **technology**.

Let's walk through all five — and this time, we'll show you the actual schema code.

## How an Orbital Schema Works

Before diving into the five apps, here's a quick primer on what you'll see in the code. Every Orbital schema is a JSON file with this structure:

```json
{
  "name": "app-name",
  "version": "1.0.0",
  "orbitals": [
    {
      "name": "OrbitalName",
      "entity": { ... },
      "traits": [ ... ],
      "pages": [ ... ]
    }
  ]
}
```

- **Entity** defines the data shape — fields, types, persistence mode
- **Traits** define behavior — state machines with states, events, transitions, guards, and effects
- **Pages** bind traits to routes — a URL path that activates one or more traits

Effects are the side-effect primitives: `set` updates a field, `render-ui` renders a component, `persist` saves to database, `emit` sends cross-orbital events, `navigate` changes the route, `notify` shows a message.

Guards are S-expression conditions that must be true for a transition to fire. If a guard fails, the transition doesn't exist.

Now let's see this in action across five domains.

## 1. Government Inspection System — Compliance Workflow

**Domain:** Structured field inspections for government regulators
**Key Challenge:** 5-phase workflow enforcement, legal requirement guards, audit trails

Built for government inspectors, this system guides them through Introduction → Content → Preparation → Record → Closing phases. Legal requirements are enforced by guards — you can't advance without completing mandatory fields.

### The Entity
<HeroSchemaAnimation schema={inspectionSchema} />

The inspection entity captures everything an inspector needs in the field:

```json
{
  "entity": {
    "name": "Inspection",
    "persistence": "persistent",
    "collection": "inspections",
    "fields": [
      { "name": "id", "type": "string", "required": true },
      { "name": "inspectorId", "type": "string", "required": true },
      { "name": "companyId", "type": "string", "required": true },
      { "name": "legalBasis", "type": "string" },
      { "name": "findings", "type": "array", "items": { "type": "object" } },
      { "name": "measures", "type": "array", "items": { "type": "object" } },
      { "name": "inspectorSignature", "type": "boolean", "default": false },
      { "name": "subjectSignature", "type": "boolean", "default": false },
      { "name": "createdAt", "type": "timestamp" },
      { "name": "status", "type": "enum", "values": ["draft", "in_progress", "completed", "archived"] }
    ]
  }
}
```

### The Traits

The 5-phase workflow is the core trait. Each transition to the next phase has guards that enforce legal requirements:

```json
{
  "name": "InspectionWorkflow",
  "linkedEntity": "Inspection",
  "stateMachine": {
    "states": [
      { "name": "Introduction", "isInitial": true },
      { "name": "Content" },
      { "name": "Preparation" },
      { "name": "Record" },
      { "name": "Closing", "isTerminal": true }
    ],
    "events": [
      { "key": "PROCEED", "name": "Proceed to Next Phase" },
      { "key": "SAVE_FINDINGS", "name": "Save Findings", "payload": [
        { "name": "findings", "type": "array", "required": true }
      ]},
      { "key": "SIGN", "name": "Sign Document" },
      { "key": "CLOSE", "name": "Close Inspection" }
    ],
    "transitions": [
      {
        "from": "Introduction",
        "event": "PROCEED",
        "to": "Content",
        "guard": ["not-empty", "@entity.legalBasis"],
        "effects": [
          ["persist", "update", "Inspection", "@entity"],
          ["render-ui", "main", {
            "type": "form",
            "entity": "Inspection",
            "fields": [
              { "name": "findings", "label": "Findings", "type": "textarea", "required": true }
            ]
          }]
        ]
      },
      { "from": "Content", "event": "PROCEED", "to": "Preparation" },
      {
        "from": "Preparation",
        "event": "SAVE_FINDINGS",
        "to": "Record",
        "effects": [
          ["set", "@entity.findings", "@payload.findings"],
          ["persist", "update", "Inspection", "@entity"]
        ]
      },
      {
        "from": "Record",
        "event": "CLOSE",
        "to": "Closing",
        "guard": ["and",
          ["not-empty", "@entity.legalBasis"],
          ["not-empty", "@entity.findings"],
          ["not-empty", "@entity.measures"],
          ["=", "@entity.inspectorSignature", true],
          ["=", "@entity.subjectSignature", true]
        ],
        "effects": [
          ["set", "@entity.status", "completed"],
          ["persist", "update", "Inspection", "@entity"],
          ["notify", "success", "Inspection closed successfully"]
        ]
      }
    ]
  }
}
```

The closing guard is the most critical piece: **five conditions** must all be true. Legal basis must be filled. Findings must exist. Measures must be specified. Both the inspector and the subject must have signed. If any one is missing, the CLOSE event simply doesn't fire. There's no "skip" button, no override — the state machine has no transition.

Every `persist` effect auto-generates an audit trail. The inspection moves through states, and each transition is logged with timestamp, user, and payload. The audit trail isn't a feature — it's a consequence of the architecture.

### The Pages

```json
"pages": [
  {
    "name": "InspectionFormPage",
    "path": "/inspection/:id",
    "traits": [
      { "ref": "InspectionWorkflow", "linkedEntity": "Inspection" }
    ]
  },
  {
    "name": "InspectionListPage",
    "path": "/inspections",
    "traits": [
      { "ref": "InspectionBrowser", "linkedEntity": "Inspection" }
    ]
  }
]
```

The form page uses a single trait that renders different forms per phase via `render-ui`. The route `/inspection/:id` loads the specific inspection and shows whichever phase it's currently in.

## 2. KFlow — AI Learning Platform

**Domain:** LLM-powered knowledge graph generation
**Key Challenge:** Recursive concept expansion, AI lesson generation, course publishing

KFlow transforms a seed topic (like "JavaScript") into a structured knowledge graph with interconnected concepts, AI-generated lessons, and publishable courses.

### The Entity
<HeroSchemaAnimation schema={kflowSchema} />

The concept entity is the knowledge graph node:

```json
{
  "entity": {
    "name": "Concept",
    "persistence": "persistent",
    "collection": "concepts",
    "fields": [
      { "name": "id", "type": "string", "required": true },
      { "name": "title", "type": "string", "required": true },
      { "name": "difficulty", "type": "enum", "values": ["beginner", "intermediate", "advanced"] },
      { "name": "prerequisites", "type": "array", "items": { "type": "string" } },
      { "name": "followUps", "type": "array", "items": { "type": "string" } },
      { "name": "aiContent", "type": "string" },
      { "name": "graphId", "type": "string", "required": true }
    ]
  }
}
```

### The Traits

The concept expansion trait is where AI meets state machines:

```json
{
  "name": "ConceptExpansion",
  "linkedEntity": "Concept",
  "emits": [
    {
      "event": "CONCEPT_EXPANDED",
      "scope": "external",
      "payload": [
        { "name": "conceptId", "type": "string", "required": true },
        { "name": "childConcepts", "type": "array", "required": true }
      ]
    }
  ],
  "stateMachine": {
    "states": [
      { "name": "seed", "isInitial": true },
      { "name": "expanding" },
      { "name": "expanded" },
      { "name": "published", "isTerminal": true }
    ],
    "events": [
      { "key": "EXPAND", "name": "Expand Concept" },
      { "key": "AI_COMPLETE", "name": "AI Generation Complete", "payload": [
        { "name": "content", "type": "string", "required": true },
        { "name": "children", "type": "array", "required": true }
      ]},
      { "key": "PUBLISH", "name": "Publish" }
    ],
    "transitions": [
      {
        "from": "seed",
        "event": "EXPAND",
        "to": "expanding",
        "effects": [
          ["render-ui", "main", {
            "type": "stats",
            "title": "Expanding...",
            "value": "@entity.title",
            "subtitle": "AI is generating content"
          }]
        ]
      },
      {
        "from": "expanding",
        "event": "AI_COMPLETE",
        "to": "expanded",
        "effects": [
          ["set", "@entity.aiContent", "@payload.content"],
          ["set", "@entity.followUps", "@payload.children"],
          ["persist", "update", "Concept", "@entity"],
          ["emit", "CONCEPT_EXPANDED", {
            "conceptId": "@entity.id",
            "childConcepts": "@payload.children"
          }]
        ]
      },
      {
        "from": "expanded",
        "event": "PUBLISH",
        "to": "published",
        "guard": ["not-empty", "@entity.aiContent"],
        "effects": [
          ["persist", "update", "Concept", "@entity"],
          ["notify", "success", "Concept published"]
        ]
      }
    ]
  }
}
```

The cross-orbital event chain drives the entire pipeline:

```
User enters topic → Graph emits TOPIC_CREATED →
  Concept listens → expands prerequisites → emits CONCEPT_EXPANDED →
    Lesson listens → generates AI content → emits LESSON_CREATED →
      Course listens → adds to curriculum
```

Each arrow is a `listens`/`emits` declaration:

```json
{
  "name": "LessonGenerator",
  "listens": [
    { "event": "CONCEPT_EXPANDED", "scope": "external" }
  ],
  "emits": [
    { "event": "LESSON_CREATED", "scope": "external" }
  ]
}
```

The entire pipeline is declarative. No orchestration code. No job queues. Just events flowing through Orbitals.

### The Pages

```json
"pages": [
  {
    "name": "GraphExplorerPage",
    "path": "/graph/:graphId",
    "traits": [
      { "ref": "ConceptExpansion", "linkedEntity": "Concept" },
      { "ref": "GraphVisualization", "linkedEntity": "Graph" }
    ]
  },
  {
    "name": "CourseEditorPage",
    "path": "/course/:courseId/edit",
    "traits": [
      { "ref": "CourseCuration", "linkedEntity": "Course" }
    ]
  }
]
```

The graph explorer page composes concept expansion with visualization — expanding concepts and rendering the knowledge graph on one route.

## 3. Fitness Tracker — Personal Training Platform

**Domain:** Trainer-client management with credit-based scheduling
**Key Challenge:** Credit system, workout tracking, AI meal analysis

Built for a personal trainer managing multiple clients. Features a credit-based session booking system, lift tracking, meal plan management, and AI-powered nutritional analysis.

### The Entity
<HeroSchemaAnimation schema={fitnessSchema} />

The session entity manages bookings with credit tracking:

```json
{
  "entity": {
    "name": "Session",
    "persistence": "persistent",
    "collection": "sessions",
    "fields": [
      { "name": "id", "type": "string", "required": true },
      { "name": "traineeId", "type": "string", "required": true },
      { "name": "scheduledAt", "type": "timestamp" },
      { "name": "remainingCredits", "type": "number", "default": 0 },
      { "name": "creditsExpireAt", "type": "timestamp" },
      { "name": "notes", "type": "string" },
      { "name": "type", "type": "enum", "values": ["individual", "group", "online"] }
    ]
  }
}
```

### The Traits

The session booking trait enforces credit rules with guards:

```json
{
  "name": "SessionBooking",
  "linkedEntity": "Session",
  "emits": [
    {
      "event": "SESSION_BOOKED",
      "scope": "external",
      "payload": [
        { "name": "traineeId", "type": "string", "required": true },
        { "name": "scheduledAt", "type": "timestamp", "required": true }
      ]
    }
  ],
  "stateMachine": {
    "states": [
      { "name": "available", "isInitial": true },
      { "name": "booked" },
      { "name": "completed", "isTerminal": true },
      { "name": "cancelled" }
    ],
    "events": [
      { "key": "BOOK", "name": "Book Session" },
      { "key": "CANCEL", "name": "Cancel Session" },
      { "key": "COMPLETE", "name": "Complete Session" }
    ],
    "transitions": [
      {
        "from": "available",
        "event": "BOOK",
        "to": "booked",
        "guard": ["and",
          [">", "@entity.remainingCredits", 0],
          ["<", "@now", "@entity.creditsExpireAt"]
        ],
        "effects": [
          ["set", "@entity.remainingCredits", ["-", "@entity.remainingCredits", 1]],
          ["persist", "update", "Session", "@entity"],
          ["emit", "SESSION_BOOKED", {
            "traineeId": "@entity.traineeId",
            "scheduledAt": "@entity.scheduledAt"
          }],
          ["notify", "success", "Session booked"]
        ]
      },
      {
        "from": "booked",
        "event": "CANCEL",
        "to": "cancelled",
        "effects": [
          ["set", "@entity.remainingCredits", ["+", "@entity.remainingCredits", 1]],
          ["persist", "update", "Session", "@entity"],
          ["notify", "info", "Session cancelled, credit refunded"]
        ]
      },
      {
        "from": "booked",
        "event": "COMPLETE",
        "to": "completed",
        "effects": [
          ["persist", "update", "Session", "@entity"]
        ]
      }
    ]
  }
}
```

Can't book with zero credits. Can't book with expired credits. The guard `["and", [">", "@entity.remainingCredits", 0], ["<", "@now", "@entity.creditsExpireAt"]]` makes both conditions mandatory. And when you cancel, the credit is automatically refunded via `["+", "@entity.remainingCredits", 1]` — the business rule is in the schema, not hidden in a service layer.

The workout tracking trait uses the same effect primitives for a completely different purpose:

```json
{
  "from": "logging",
  "event": "LOG_SET",
  "to": "logging",
  "effects": [
    ["set", "@entity.lastWeight", "@payload.weight"],
    ["set", "@entity.lastReps", "@payload.reps"],
    ["increment", "@entity.totalSets", 1],
    ["persist", "update", "Workout", "@entity"]
  ]
}
```

Same `set`, same `increment`, same `persist` — applied to reps and weights instead of game stats or inspection findings.

### The Pages

```json
"pages": [
  {
    "name": "TraineeDashboard",
    "path": "/trainee/:id",
    "traits": [
      { "ref": "SessionBooking", "linkedEntity": "Session" },
      { "ref": "WorkoutLog", "linkedEntity": "Workout" },
      { "ref": "MealTracker", "linkedEntity": "Meal" }
    ]
  },
  {
    "name": "SchedulePage",
    "path": "/schedule",
    "traits": [
      { "ref": "SessionBrowser", "linkedEntity": "Session" }
    ]
  }
]
```

The trainee dashboard composes three traits on one page — bookings, workouts, and meals all visible at once. Each trait manages its own state machine independently.

## 4. Trait Wars — Tactical Strategy Game

**Domain:** Turn-based tactical combat
**Key Challenge:** Complex combat with visible AI, turn phases, unit composition

Trait Wars is a Heroes of Might and Magic-inspired strategy game where units equip **Traits** — visible state machines that define their behavior. The core innovation: players can read enemy state machines and exploit transition windows.

### The Entity
<HeroSchemaAnimation schema={traitWarsSchema} />

Every unit on the battlefield is an entity with combat stats, position, and equipped traits:

```json
{
  "entity": {
    "name": "Unit",
    "persistence": "runtime",
    "fields": [
      { "name": "id", "type": "string", "required": true },
      { "name": "name", "type": "string", "required": true },
      { "name": "hp", "type": "number", "default": 100 },
      { "name": "attack", "type": "number", "default": 10 },
      { "name": "defense", "type": "number", "default": 5 },
      { "name": "position", "type": "object" },
      { "name": "equippedTraits", "type": "array", "items": { "type": "string" } },
      { "name": "status", "type": "enum", "values": ["alive", "stunned", "dead"] }
    ]
  }
}
```

Notice `"persistence": "runtime"` — game state lives in memory, not a database. The entity is the gravitational core: everything else orbits around it.

### The Traits

The turn controller itself is a state machine. Each phase has clear entry and exit rules:

```json
{
  "name": "TurnPhaseController",
  "linkedEntity": "Match",
  "stateMachine": {
    "states": [
      { "name": "ObservationPhase", "isInitial": true },
      { "name": "SelectionPhase" },
      { "name": "MovementPhase" },
      { "name": "ActionPhase" },
      { "name": "ResolutionPhase" }
    ],
    "events": [
      { "key": "BEGIN_SELECTION", "name": "Begin Selection" },
      { "key": "CONFIRM_SELECTION", "name": "Confirm Selection" },
      { "key": "MOVE_COMPLETE", "name": "Move Complete" },
      { "key": "RESOLVE", "name": "Resolve Actions" },
      { "key": "NEXT_TURN", "name": "Next Turn" }
    ],
    "transitions": [
      {
        "from": "ObservationPhase",
        "event": "BEGIN_SELECTION",
        "to": "SelectionPhase",
        "effects": [
          ["render-ui", "main", {
            "type": "entity-table",
            "entity": "Unit",
            "columns": ["name", "hp", "status", "equippedTraits"]
          }]
        ]
      },
      { "from": "SelectionPhase", "event": "CONFIRM_SELECTION", "to": "MovementPhase" },
      { "from": "MovementPhase", "event": "MOVE_COMPLETE", "to": "ActionPhase" },
      {
        "from": "ActionPhase",
        "event": "RESOLVE",
        "to": "ResolutionPhase",
        "effects": [
          ["emit", "TURN_RESOLVED", { "turnNumber": "@entity.turnCount" }]
        ]
      },
      { "from": "ResolutionPhase", "event": "NEXT_TURN", "to": "ObservationPhase" }
    ]
  }
}
```

Five states. Clean transitions. The `render-ui` effect in SelectionPhase shows the unit table with their traits visible — this is what lets players read enemy state machines and plan around them. The `emit` effect broadcasts turn resolution to all other orbitals (combat, terrain, hero abilities).

Unit combat is a separate trait with guards that enforce game rules:

```json
{
  "from": "idle",
  "event": "ATTACK",
  "to": "attacking",
  "guard": ["and",
    [">", "@entity.hp", 0],
    ["!=", "@entity.status", "stunned"]
  ],
  "effects": [
    ["set", "@entity.lastAction", "attack"],
    ["emit", "DAMAGE_DEALT", {
      "attackerId": "@entity.id",
      "damage": "@entity.attack"
    }]
  ]
}
```

A dead or stunned unit literally cannot attack. The guard makes it impossible — no `if` statement to forget.

### The Pages

```json
"pages": [
  {
    "name": "BattlefieldPage",
    "path": "/battle/:matchId",
    "traits": [
      { "ref": "TurnPhaseController", "linkedEntity": "Match" },
      { "ref": "UnitCombat", "linkedEntity": "Unit" }
    ]
  },
  {
    "name": "ArmyBuilderPage",
    "path": "/army",
    "traits": [
      { "ref": "UnitComposition", "linkedEntity": "Unit" }
    ]
  }
]
```

A page is just a route that binds traits. `/battle/:matchId` activates both the turn controller and the combat trait on the same screen. The compiler generates the UI from the `render-ui` effects.

## 5. Iram — 3D Action RPG

**Domain:** Dungeon-crawling ARPG
**Key Challenge:** Real-time combat, procedural dungeons, ability composition

Iram is set inside a Dyson Sphere called the Iram Dominion. Players descend through 5 dungeon zones, defeat bosses, and collect **Orbital Shards** — fragments of behavior that compose into new abilities.

### The Entity
<HeroSchemaAnimation schema={iramSchema} />

The player entity tracks health, inventory, and the 8 orbital slots:

```json
{
  "entity": {
    "name": "Player",
    "persistence": "persistent",
    "collection": "players",
    "fields": [
      { "name": "id", "type": "string", "required": true },
      { "name": "health", "type": "number", "default": 100 },
      { "name": "maxHealth", "type": "number", "default": 100 },
      { "name": "equippedOrbitals", "type": "array", "items": { "type": "string" } },
      { "name": "inventory", "type": "array", "items": { "type": "object" } },
      { "name": "currentZone", "type": "number", "default": 1 },
      { "name": "orbitalShards", "type": "number", "default": 0 }
    ]
  }
}
```

Player data is `"persistent"` — progress saves to database between sessions.

### The Traits

Boss encounters use phase-based state machines — the same pattern as the turn controller, but for a single enemy:

```json
{
  "name": "BossEncounter",
  "linkedEntity": "Boss",
  "stateMachine": {
    "states": [
      { "name": "dormant", "isInitial": true },
      { "name": "phase1" },
      { "name": "phase2" },
      { "name": "enraged" },
      { "name": "defeated", "isTerminal": true }
    ],
    "events": [
      { "key": "ENGAGE", "name": "Start Fight" },
      { "key": "DAMAGE", "name": "Take Damage", "payload": [
        { "name": "amount", "type": "number", "required": true }
      ]},
      { "key": "PHASE_SHIFT", "name": "Phase Shift" }
    ],
    "transitions": [
      { "from": "dormant", "event": "ENGAGE", "to": "phase1" },
      {
        "from": "phase1",
        "event": "DAMAGE",
        "to": "phase2",
        "guard": ["<", "@entity.hp", 50],
        "effects": [
          ["set", "@entity.attackPattern", "aggressive"],
          ["emit", "BOSS_PHASE_CHANGED", { "phase": 2 }]
        ]
      },
      {
        "from": "phase2",
        "event": "DAMAGE",
        "to": "enraged",
        "guard": ["<", "@entity.hp", 20],
        "effects": [
          ["set", "@entity.attackSpeed", ["+", "@entity.attackSpeed", 2]],
          ["set", "@entity.attackPattern", "berserk"]
        ]
      },
      {
        "from": ["phase1", "phase2", "enraged"],
        "event": "DAMAGE",
        "to": "defeated",
        "guard": ["<=", "@entity.hp", 0],
        "effects": [
          ["emit", "BOSS_DEFEATED", { "bossId": "@entity.id", "zone": "@entity.zone" }],
          ["emit", "LOOT_DROP", { "table": "@entity.lootTable" }]
        ]
      }
    ]
  }
}
```

Notice `"from": ["phase1", "phase2", "enraged"]` — the death transition works from any combat phase. Guards check HP thresholds to trigger phase shifts. The `BOSS_DEFEATED` event flows to the Dungeon orbital to unlock the next zone, while `LOOT_DROP` flows to the inventory system.

### The Resonance System

Compatible Orbitals create synergy effects:
- Defend + Mend → 1.5x shield healing
- Disrupt + Fabricate → Traps apply debuffs
- Archive + Command → Allies receive enemy weakness intel

This is modeled through cross-orbital `listens` — when two specific orbitals are both equipped, their combined events trigger resonance effects.

### The Pages

```json
"pages": [
  {
    "name": "DungeonPage",
    "path": "/dungeon/:zoneId",
    "traits": [
      { "ref": "DungeonExploration", "linkedEntity": "Dungeon" },
      { "ref": "PlayerCombat", "linkedEntity": "Player" },
      { "ref": "BossEncounter", "linkedEntity": "Boss" }
    ]
  },
  {
    "name": "OrbitalLoadoutPage",
    "path": "/loadout",
    "traits": [
      { "ref": "OrbitalEquip", "linkedEntity": "Player" }
    ]
  }
]
```

The dungeon page composes three traits on one route — exploration, combat, and boss encounters all active simultaneously.

## The Pattern

Five applications. Five different domains. The same pattern:

| Concept | Government | Education | Fitness | Game | RPG |
|---------|-----------|-----------|---------|------|-----|
| **Entity** | Inspection | Concept | Session | Unit | Player |
| **States** | Intro→Content→Close | Seed→Expanded→Published | Available→Booked→Done | Idle→Attack→Dead | Exploring→Combat→Boss |
| **Guards** | Fields filled, signed | Prerequisites met | Credits > 0 | HP > 0, in range | Has required orbital |
| **Effects** | Save findings, log | Generate lesson | Deduct credit | Deal damage, move | Drop loot |
| **Events** | PROCEED, CLOSE | EXPAND, PUBLISH | BOOK, CANCEL | ATTACK, MOVE, DIE | ENTER_ROOM, ATTACK |
| **Pages** | /inspection/:id | /graph/:graphId | /trainee/:id | /battle/:matchId | /dungeon/:zoneId |

The vocabulary changes. The structure doesn't.

## Why This Matters

### For Developers

You learn Almadar once. Then you can build:
- Business tools
- Games
- Government systems
- AI-powered products
- Health and fitness apps

No new framework per domain. No new state management library. No new backend architecture. One language, one compiler, one mental model.

### For Companies

One team can build multiple products. The architect who designed the inspection system can design the game's combat system — the patterns are the same. States, transitions, guards, effects.

### For the Industry

The fact that the same architecture handles turn-based combat and government compliance suggests we've found something fundamental. Not a framework optimized for one domain, but a **model of behavior** that works across domains.

Because behavior is behavior. Whether it's a game unit deciding to attack, an inspector completing a phase, or a fitness trainer booking a session — it's all:

1. Start in a state
2. Receive an event
3. Check the guards
4. Execute the effects
5. Move to the next state

That's not a framework feature. That's how systems work.

## The Takeaway

The question "what language should I use?" is less important than "what model of behavior am I using?"

React + Express. Django + PostgreSQL. Rails + Redis. These are technology choices. They don't change how you model behavior — they just change where you write the same patterns.

Almadar is a behavior model that happens to compile to technology. One schema. Five apps. Because the model is right.

Explore all projects and try building your own at [almadar.io](https://orb.almadar.io/docs/getting-started/introduction).
