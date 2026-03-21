---
slug: composing-behavior
title: "Composing Behavior with Emit/Listen in .orb"
authors: [osamah]
tags: [architecture, gaming, composition]
---
import { AvlEmitListen } from '@almadar/ui/illustrations';

In .orb, Orbital Units communicate through events. Each unit declares what it emits and what it listens to. The compiler verifies the wiring is complete. This is how you compose complex behavior from simple, independent parts.

<!-- truncate -->

## The Pattern: Emit and Listen

Two Orbital Units that know nothing about each other can work together through events. A `DefendOrbital` emits `SHIELD_DEPLETED` when its shield breaks. A `MendOrbital` listens for that event and triggers emergency healing.

<div style={{margin: '2rem 0'}}>
<AvlEmitListen
  emitter={{name: "DefendOrbital", fields: 3}}
  listener={{name: "MendOrbital", fields: 2}}
  eventName="SHIELD_DEPLETED"
  animated
/>
</div>

Neither orbital references the other by name. They communicate through the event bus, and the compiler checks that every `emits` declaration has a matching `listens` somewhere.

## How It Works in .orb

The Defend orbital's trait declares its emissions:

```json
{
  "name": "ShieldTrait",
  "linkedEntity": "Unit",
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
}
```

The Mend orbital's trait declares what it listens for:

```json
{
  "name": "HealTrait",
  "linkedEntity": "Unit",
  "listens": [
    { "event": "SHIELD_DEPLETED", "triggers": "EMERGENCY_HEAL" }
  ],
  "stateMachine": {
    "states": [
      { "name": "Idle", "isInitial": true },
      { "name": "Healing" }
    ],
    "transitions": [
      {
        "from": "Idle",
        "to": "Healing",
        "event": "EMERGENCY_HEAL",
        "effects": [
          ["set", "@entity.hp", ["+", "@entity.hp", ["*", "@entity.maxHp", 0.2]]]
        ]
      },
      {
        "from": "Healing",
        "to": "Idle",
        "event": "HEAL_COMPLETE"
      }
    ]
  }
}
```

When the shield breaks, `SHIELD_DEPLETED` fires. The Mend orbital receives it and triggers `EMERGENCY_HEAL`, healing 20% of max HP. Equip both orbitals together and you get automatic healing on shield break. Remove the Mend orbital and the Defend orbital still works on its own.

## The Compiler Guarantee

If a trait declares `"emits": ["ORDER_COMPLETED"]` but no other trait has a matching `listens` entry, the compiler rejects the program:

```
Error: ORB_X_ORPHAN_EMIT
  Trait 'OrderTrait' emits 'ORDER_COMPLETED' but no trait
  has a matching 'listens' declaration.
  Every emitted event must have at least one listener.
```

This prevents fire-and-forget events. In a microservices architecture, this would be a message published to a queue with no consumer, silently dropping data. In .orb, the compiler catches it before any code is generated.

## Business Application: Order Processing

The same pattern applies to business software. Three orbitals handle order processing:

```json
{
  "name": "OrderTrait",
  "emits": ["ORDER_PLACED"]
}
```

```json
{
  "name": "PaymentTrait",
  "listens": [
    { "event": "ORDER_PLACED", "triggers": "PROCESS_PAYMENT" }
  ],
  "emits": ["PAYMENT_CONFIRMED", "PAYMENT_FAILED"]
}
```

```json
{
  "name": "InventoryTrait",
  "listens": [
    { "event": "PAYMENT_CONFIRMED", "triggers": "RESERVE_STOCK" }
  ],
  "emits": ["STOCK_RESERVED"]
}
```

Order emits `ORDER_PLACED`. Payment listens and processes. On success, Payment emits `PAYMENT_CONFIRMED`. Inventory listens and reserves stock. Three self-contained units with verified event wiring.

Compare this to the microservices equivalent: three services, three deployments, a message queue, dead letter queues, saga patterns for distributed transactions, and monitoring for each service. The .orb version compiles to a single application with the same event-driven architecture, minus the infrastructure overhead. And the compiler guarantees no event goes unhandled.

## Composable Standard Library

.orb includes standard library behaviors that compose through the same emit/listen mechanism:

```json
{
  "uses": [{ "from": "std/Pagination", "as": "Paginate" }],
  "traits": [
    { "ref": "Paginate.traits.PaginationTrait" },
    { "ref": "TaskInteraction" }
  ]
}
```

Your task list now has pagination. No implementation code, just composition. The pagination trait emits page-change events, and the interaction trait listens and re-renders.

Composition in .orb is not a design recommendation. It is the only way units communicate, and the compiler enforces that every connection is valid.
