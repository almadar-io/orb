---
slug: machines-with-traits-part-1
title: "Machines with Traits: How Almadar Will Transform Robotics"
authors: [almadar]
tags: [robotics, vision, automation, state-machines]
image: /img/blog/machines-with-traits.svg
---

![](/img/blog/machines-with-traits.svg)

import { AvlOrbitalUnit } from '@almadar/ui/illustrations';

Programming a robot today means writing thousands of lines of tangled imperative code where every new condition doubles the complexity, hidden state transitions breed bugs, and documentation drifts from reality within weeks. .orb takes a different approach: declare machine behavior as composable traits with explicit states, guarded transitions, and structured effects.

<!-- truncate -->

## The Problem with Imperative Robot Code

A traditional robotic arm controller looks something like this:

```python
class RobotArm:
    def move_to(self, target):
        if self.error_state:
            self.handle_error()  # Where is this defined?
            return
        if self.is_holding and self.weight > MAX_WEIGHT:
            self.emergency_stop()  # What happens after?
            return
        # ... hundreds more lines of nested conditions
```

Every new condition adds branches. Missing a state creates a hidden bug. Testing all paths becomes combinatorially expensive. The code says one thing, the documentation says another.

## A Robotic Arm in .orb

The same arm, modeled with .orb, declares every state and transition explicitly:

<div style={{margin: '2rem 0'}}>
<AvlOrbitalUnit
  entityName="Arm"
  fields={4}
  traits={[{name: "MovementTrait"}]}
  pages={[{name: "/control"}]}
  animated
/>
</div>

```json
{
  "entity": {
    "name": "Arm",
    "persistence": "runtime",
    "fields": [
      { "name": "position", "type": "object" },
      { "name": "speed", "type": "number", "default": 0 },
      { "name": "isHolding", "type": "boolean", "default": false },
      { "name": "weight", "type": "number", "default": 0 }
    ]
  },
  "traits": [{
    "name": "MovementTrait",
    "linkedEntity": "Arm",
    "stateMachine": {
      "states": [
        { "name": "idle", "isInitial": true },
        { "name": "moving" },
        { "name": "holding" },
        { "name": "error" }
      ],
      "transitions": [
        {
          "from": "idle", "to": "moving", "event": "MOVE",
          "guard": ["and",
            ["not", "@entity.isHolding"],
            ["<", "@payload.speed", 100]
          ],
          "effects": [
            ["set", "@entity.speed", "@payload.speed"],
            ["emit", "MOVEMENT_STARTED", { "target": "@payload.target" }]
          ]
        },
        {
          "from": "moving", "to": "idle", "event": "STOP",
          "effects": [["set", "@entity.speed", 0]]
        },
        {
          "from": "idle", "to": "holding", "event": "GRAB",
          "guard": ["<", "@payload.weight", 50],
          "effects": [
            ["set", "@entity.isHolding", true],
            ["set", "@entity.weight", "@payload.weight"]
          ]
        },
        {
          "from": "holding", "to": "idle", "event": "RELEASE",
          "effects": [
            ["set", "@entity.isHolding", false],
            ["set", "@entity.weight", 0]
          ]
        },
        {
          "from": "idle", "to": "error", "event": "EMERGENCY",
          "effects": [
            ["set", "@entity.speed", 0],
            ["emit", "EMERGENCY_STOP", { "reason": "@payload.reason" }]
          ]
        },
        {
          "from": "moving", "to": "error", "event": "EMERGENCY",
          "effects": [
            ["set", "@entity.speed", 0],
            ["emit", "EMERGENCY_STOP", { "reason": "@payload.reason" }]
          ]
        },
        {
          "from": "holding", "to": "error", "event": "EMERGENCY",
          "effects": [
            ["set", "@entity.speed", 0],
            ["emit", "EMERGENCY_STOP", { "reason": "@payload.reason" }]
          ]
        }
      ]
    }
  }]
}
```

Four states: idle, moving, holding, error. Every transition is defined. The MOVE guard prevents movement while holding an object and caps speed at 100. The GRAB guard prevents grabbing anything heavier than 50 units. Emergency transitions exist from every operational state to error.

## Composing Traits for Complex Machines

A delivery robot needs navigation, package handling, and customer notification. In .orb, these are separate orbitals that communicate through events:

```json
{
  "name": "DeliveryRobot",
  "orbitals": [
    {
      "name": "Navigation",
      "entity": { "name": "NavState", "persistence": "runtime", "fields": [
        { "name": "position", "type": "object" },
        { "name": "destination", "type": "object" }
      ]},
      "traits": [{ "name": "GPSTrait", "linkedEntity": "NavState" },
                 { "name": "ObstacleAvoidance", "linkedEntity": "NavState" }]
    },
    {
      "name": "Delivery",
      "entity": { "name": "Package", "persistence": "runtime", "fields": [
        { "name": "status", "type": "enum", "values": ["loaded", "in_transit", "delivered"] }
      ]},
      "traits": [{ "name": "PackageHandling", "linkedEntity": "Package",
                   "emits": [{ "event": "DELIVERY_COMPLETE", "scope": "external" }] }]
    },
    {
      "name": "Communication",
      "entity": { "name": "Notification", "persistence": "runtime", "fields": [
        { "name": "message", "type": "string" }
      ]},
      "traits": [{ "name": "CustomerNotification", "linkedEntity": "Notification",
                   "listens": [{ "event": "DELIVERY_COMPLETE", "scope": "external" }] }]
    }
  ]
}
```

Three orbitals, each managing its own concern. When Delivery emits `DELIVERY_COMPLETE`, Communication listens and sends confirmation to the customer automatically. No orchestration code. No message bus configuration. Just `emits` and `listens` declarations.

## Why This Works for Robotics

| Need | How .orb addresses it |
|------|----------------------|
| Reliability | Every state and transition is explicit, no hidden paths |
| Safety | Guards prevent impossible actions at the state machine level |
| Documentation | The .orb file is the documentation, they cannot drift apart |
| Composability | Flat trait composition, independently testable behaviors |
| Validation | `orbital validate` catches unreachable states and unhandled events at compile time |

The .orb program is the specification, the documentation, and the runtime behavior. One artifact, not three that drift apart over time.

Get started with the [Getting Started guide](https://orb.almadar.io/docs/getting-started/introduction).
