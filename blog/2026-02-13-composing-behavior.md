---
slug: composing-behavior
title: "Composing Behavior: What Games Teach Us About Software Architecture"
authors: [osamah]
tags: [architecture, gaming, composition]
---

In the game Iram, players collect Orbital Shards — fragments of behavior that snap together to create new abilities. Equip Defend and Mend together, and your shields heal 1.5x faster. Equip Disrupt and Fabricate, and your traps deal area damage.

This isn't just a game mechanic. It's a software architecture pattern that solves the microservices vs monolith debate.

<!-- truncate -->

<OrbitalDiagram />

## The Composition Problem

Software architecture is stuck between two bad options:

**Monolith:** Everything in one codebase. Easy to build, impossible to scale. Every change risks breaking something unrelated.

**Microservices:** Everything in its own service. Easy to scale, impossible to coordinate. Every feature requires orchestrating 5 services, 3 message queues, and a prayer.

Both approaches treat behavior as a *location* problem: where does the code live?

The real question is: how does behavior *compose*?

## Lessons from Game Design

In Iram, a dungeon-crawling action RPG built on Almadar, the player's character is defined by **which Orbitals they equip**:

| Orbital | Behavior |
|---------|----------|
| **Defend** | Absorb damage, generate shields |
| **Mend** | Heal over time, cure status effects |
| **Disrupt** | Interrupt enemies, apply debuffs |
| **Fabricate** | Create traps, build turrets |
| **Pathfind** | Reveal map, detect hidden enemies |
| **Transmute** | Convert resources, upgrade equipment |
| **Command** | Buff allies, coordinate group actions |
| **Archive** | Record enemy patterns, reveal weaknesses |

Each Orbital is a self-contained state machine. Defend doesn't know about Mend. Pathfind doesn't know about Fabricate.

But when you equip them together, **emergent behavior appears**.

## Resonance: Composition Creates Emergence

When compatible Orbitals are equipped simultaneously, they create **Resonance** — synergy effects that neither Orbital defines alone:

```json
{
  "resonance": [
    {
      "requires": ["Defend", "Mend"],
      "effect": "Shield regeneration rate increased by 1.5x",
      "multiplier": { "shieldRegen": 1.5 }
    },
    {
      "requires": ["Disrupt", "Fabricate"],
      "effect": "Traps apply disruption debuffs",
      "multiplier": { "trapDamage": 1.3 }
    },
    {
      "requires": ["Archive", "Command"],
      "effect": "Allies receive enemy weakness intel",
      "multiplier": { "allyDamage": 1.2 }
    }
  ]
}
```

The key insight: **neither Orbital changes**. Defend doesn't have code for "work better with Mend." The resonance is a property of the *combination*, not the individuals.

This is exactly how software composition should work.

## The Pattern: Orbital Composition

In Almadar, Orbitals communicate through **events**. Each Orbital declares what it emits and what it listens to:

```json
{
  "name": "DefendOrbital",
  "traits": [{
    "name": "ShieldTrait",
    "emits": ["SHIELD_ACTIVATED", "SHIELD_DEPLETED"],
    "stateMachine": {
      "states": [
        { "name": "Ready", "isInitial": true },
        { "name": "Active" },
        { "name": "Cooldown" }
      ],
      "transitions": [
        {
          "from": "Ready",
          "to": "Active",
          "event": "ACTIVATE_SHIELD",
          "effects": [
            ["set", "@entity.shieldHp", "@entity.maxShieldHp"],
            ["emit", "SHIELD_ACTIVATED"]
          ]
        },
        {
          "from": "Active",
          "to": "Cooldown",
          "event": "SHIELD_BROKEN",
          "effects": [
            ["set", "@entity.shieldHp", 0],
            ["emit", "SHIELD_DEPLETED"]
          ]
        }
      ]
    }
  }]
}
```

```json
{
  "name": "MendOrbital",
  "traits": [{
    "name": "HealTrait",
    "listens": [
      { "event": "SHIELD_DEPLETED", "triggers": "EMERGENCY_HEAL" }
    ],
    "stateMachine": {
      "transitions": [
        {
          "from": "Idle",
          "to": "Healing",
          "event": "EMERGENCY_HEAL",
          "effects": [
            ["set", "@entity.hp", ["+", "@entity.hp", ["*", "@entity.maxHp", 0.2]]]
          ]
        }
      ]
    }
  }]
}
```

**Defend** emits `SHIELD_DEPLETED`. **Mend** listens for it. When the shield breaks, healing kicks in automatically. Neither Orbital references the other by name. They communicate through the event bus.

This is:
- **Loosely coupled** — Defend works without Mend
- **Composable** — Add Mend and new behavior emerges
- **Verifiable** — The compiler checks that every `emit` has a `listen`
- **Discoverable** — Read the event declarations to understand interactions

## Software Architecture Implications

This pattern translates directly to business software:

### E-Commerce: Order Processing

```
OrderOrbital         PaymentOrbital         InventoryOrbital
    │                     │                      │
    ├─ emits:             ├─ listens:            ├─ listens:
    │  ORDER_PLACED       │  ORDER_PLACED        │  PAYMENT_CONFIRMED
    │                     │  → PROCESS_PAYMENT   │  → RESERVE_STOCK
    │                     │                      │
    │                     ├─ emits:              ├─ emits:
    │                     │  PAYMENT_CONFIRMED   │  STOCK_RESERVED
    │                     │  PAYMENT_FAILED      │  OUT_OF_STOCK
```

Three Orbitals. Each self-contained. Composition through events. The compiler verifies the event graph is complete — no message goes unhandled.

Compare this to the microservices version:
- Three services, three deployments, three databases
- A message queue (Kafka/RabbitMQ) to connect them
- Dead letter queues for failed messages
- Saga patterns for distributed transactions
- Monitoring and alerting for each service

The Almadar version compiles to a single deployment with the same event-driven architecture, but without the infrastructure overhead.

### Team Collaboration: Parallel Development

Because Orbitals communicate only through events, teams can work in parallel:

- **Team A** builds the Order Orbital
- **Team B** builds the Payment Orbital
- **Team C** builds the Inventory Orbital

They agree on the event contracts:
```json
{
  "event": "ORDER_PLACED",
  "payload": {
    "orderId": "string",
    "items": "array",
    "total": "number"
  }
}
```

Then they build independently. The compiler verifies the contracts match when the Orbitals are composed.

## The Standard Library: Pre-Built Behaviors

Almadar includes 11 standard library behaviors that snap into any project:

| Behavior | What It Does |
|----------|-------------|
| `std/Loading` | Loading states with success/error handling |
| `std/Fetch` | Async data fetching with retry |
| `std/Submit` | Form submission with validation |
| `std/Retry` | Exponential backoff retry logic |
| `std/Poll` | Long-polling patterns |
| `std/Pagination` | Cursor/offset pagination |
| `std/Search` | Full-text search with filtering |
| `std/Sort` | Multi-key sorting |
| `std/GameCore` | Core game loop (tick, update, render) |
| `std/UnitBehavior` | AI unit behaviors (patrol, guard, flee) |
| `std/Inventory` | Game inventory management |

Import them into any Orbital:

```json
{
  "uses": [{ "from": "std/Pagination", "as": "Paginate" }],
  "traits": [
    { "ref": "Paginate.traits.PaginationTrait" },
    { "ref": "TaskInteraction" }
  ]
}
```

Your Task list now has pagination. No code written. Just composed.

## Why Games Get This Right

Games have always understood composition. An RPG character is a composition of:
- Class (Warrior, Mage, Rogue)
- Equipment (Sword, Shield, Staff)
- Skills (Fireball, Heal, Sneak)
- Buffs/Debuffs (Poisoned, Blessed, Hasted)

Each is a self-contained behavior. Together, they create a unique character with emergent capabilities.

Business software should work the same way:
- An **Invoice** is a composition of CRUD + Approval + PDF Generation + Email Notification
- A **User** is a composition of Authentication + Profile + Preferences + Activity Log
- A **Dashboard** is a composition of Charts + Filters + Real-time Updates + Export

Each behavior is an Orbital. Composition through events. The compiler ensures the wiring is correct.

## The Takeaway

The microservices vs monolith debate is asking the wrong question. The question isn't where behavior lives. It's how behavior composes.

Orbitals give you:
- **Self-contained units** (like microservices) — each Orbital owns its state machine
- **Easy composition** (like a monolith) — import, compose, compile
- **Verified wiring** (like neither) — the compiler checks every event connection
- **Emergent behavior** (like games) — resonance effects from compatible combinations

The next time you're designing a system, don't start with "how many services?" Start with "what behaviors do I need, and how do they compose?"

Learn more about [cross-orbital events](https://orb.almadar.io/docs/traits) and the [standard library](https://orb.almadar.io/docs/stdlib).
