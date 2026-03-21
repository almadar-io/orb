---
slug: one-schema-six-apps
title: "One Schema, Five Apps: How We Built a Government Tool, an AI Platform, and Two Games with the Same Language"
authors: [almadar]
tags: [case-study, architecture]
---
import { AvlOrbitalUnit } from '@almadar/ui/illustrations';

A government inspection system. A personal fitness tracker. A tactical strategy game. Three completely different domains, all built with the same .orb language. The vocabulary changes across domains. The structure does not.

<!-- truncate -->

## The Formula

Every .orb application follows one formula: Entity + Traits + Pages. An entity defines the data shape. Traits define behavior through state machines. Pages bind traits to URL routes. This formula works for any domain because it models behavior, not technology.

## 1. Government Inspection System

An inspector walks through five mandatory phases: Introduction, Content, Preparation, Record, Closing. Legal requirements are enforced by guards. You cannot close an inspection without findings, measures, and both signatures.

<div style={{margin: '2rem 0'}}>
<AvlOrbitalUnit
  entityName="Inspection"
  fields={10}
  traits={[{name: "InspectionWorkflow"}]}
  pages={[{name: "/inspection/:id"}, {name: "/inspections"}]}
  animated
/>
</div>

```json
{
  "entity": {
    "name": "Inspection",
    "fields": [
      { "name": "legalBasis", "type": "string" },
      { "name": "findings", "type": "array" },
      { "name": "measures", "type": "array" },
      { "name": "inspectorSignature", "type": "boolean", "default": false },
      { "name": "subjectSignature", "type": "boolean", "default": false },
      { "name": "status", "type": "enum", "values": ["draft", "in_progress", "completed"] }
    ]
  }
}
```

The closing guard enforces all five conditions:

```json
{
  "from": "Record",
  "to": "Closing",
  "event": "CLOSE",
  "guard": ["and",
    ["not-empty", "@entity.legalBasis"],
    ["not-empty", "@entity.findings"],
    ["not-empty", "@entity.measures"],
    ["=", "@entity.inspectorSignature", true],
    ["=", "@entity.subjectSignature", true]
  ],
  "effects": [
    ["set", "@entity.status", "completed"],
    ["persist", "update", "Inspection", "@entity"]
  ]
}
```

If any condition is missing, the CLOSE event simply does not fire. No skip button. No override. The state machine has no transition.

## 2. Fitness Tracker

A personal trainer manages clients with a credit-based booking system. Credits must be positive and not expired to book a session. Cancellation automatically refunds the credit.

<div style={{margin: '2rem 0'}}>
<AvlOrbitalUnit
  entityName="Session"
  fields={7}
  traits={[{name: "SessionBooking"}, {name: "WorkoutLog"}]}
  pages={[{name: "/trainee/:id"}, {name: "/schedule"}]}
  animated
/>
</div>

```json
{
  "entity": {
    "name": "Session",
    "fields": [
      { "name": "traineeId", "type": "string", "required": true },
      { "name": "scheduledAt", "type": "timestamp" },
      { "name": "remainingCredits", "type": "number", "default": 0 },
      { "name": "creditsExpireAt", "type": "timestamp" },
      { "name": "type", "type": "enum", "values": ["individual", "group", "online"] }
    ]
  }
}
```

The booking transition uses the same guard and effect primitives as the inspection system:

```json
{
  "from": "available",
  "to": "booked",
  "event": "BOOK",
  "guard": ["and",
    [">", "@entity.remainingCredits", 0],
    ["<", "@now", "@entity.creditsExpireAt"]
  ],
  "effects": [
    ["set", "@entity.remainingCredits", ["-", "@entity.remainingCredits", 1]],
    ["persist", "update", "Session", "@entity"],
    ["notify", "success", "Session booked"]
  ]
}
```

The business rule (deduct one credit on booking, refund on cancel) lives in the schema, not hidden in a service layer.

## 3. Tactical Strategy Game

Trait Wars is a turn-based strategy game where units equip behavioral traits. The turn controller moves through five phases: Observation, Selection, Movement, Action, Resolution.

<div style={{margin: '2rem 0'}}>
<AvlOrbitalUnit
  entityName="Unit"
  fields={8}
  traits={[{name: "TurnPhaseController"}, {name: "UnitCombat"}]}
  pages={[{name: "/battle/:matchId"}, {name: "/army"}]}
  animated
/>
</div>

```json
{
  "entity": {
    "name": "Unit",
    "persistence": "runtime",
    "fields": [
      { "name": "hp", "type": "number", "default": 100 },
      { "name": "attack", "type": "number", "default": 10 },
      { "name": "defense", "type": "number", "default": 5 },
      { "name": "status", "type": "enum", "values": ["alive", "stunned", "dead"] }
    ]
  }
}
```

Combat guards enforce game rules with the same operators:

```json
{
  "from": "idle",
  "to": "attacking",
  "event": "ATTACK",
  "guard": ["and",
    [">", "@entity.hp", 0],
    ["!=", "@entity.status", "stunned"]
  ],
  "effects": [
    ["emit", "DAMAGE_DEALT", { "attackerId": "@entity.id", "damage": "@entity.attack" }]
  ]
}
```

A dead or stunned unit cannot attack. The guard makes it structurally impossible.

## The Pattern

| Concept | Government | Fitness | Game |
|---------|-----------|---------|------|
| Entity | Inspection | Session | Unit |
| States | Intro...Closing | Available...Done | Idle...Dead |
| Guards | Fields filled, signed | Credits > 0 | HP > 0, not stunned |
| Effects | Save findings | Deduct credit | Deal damage |
| Pages | `/inspection/:id` | `/trainee/:id` | `/battle/:matchId` |

Three domains. The same five elements: entity, states, guards, effects, pages. You learn .orb once, then apply it to government compliance, fitness tracking, game development, or anything else that has behavior.

Explore all projects at [almadar.io](https://orb.almadar.io/docs/getting-started/introduction).
