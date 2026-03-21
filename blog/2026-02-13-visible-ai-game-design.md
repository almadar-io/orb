---
slug: visible-ai-game-design
title: "Game AI in .orb"
authors: [almadar]
tags: [gaming, state-machines, game-design]
---
import { AvlStateMachine } from '@almadar/ui/illustrations';

In most games, enemy AI is a black box of nested conditionals and random weights. The player reacts to opaque decisions they cannot predict or outthink. In .orb, enemy behavior is a state machine the player can read, reason about, and exploit.

<!-- truncate -->

## The Black Box Problem

Traditional game AI looks like this under the hood:

```python
def decide_action(enemy, player):
    if enemy.hp < 30:
        if random() < 0.6:
            return "flee"
        else:
            return "desperate_attack"
    elif distance(enemy, player) < 3:
        return "melee_attack"
    else:
        return "approach"
```

Random weights, invisible conditions, no way for the player to engage strategically. Wins feel lucky, losses feel unfair.

## Enemy Behavior as a State Machine

In .orb, an enemy's AI is a trait with explicit states and transitions. Here is a Berserker enemy:

<div style={{margin: '2rem 0'}}>
<AvlStateMachine
  states={[{name: "Patrol", isInitial: true}, {name: "Chase"}, {name: "Attack"}, {name: "Flee"}]}
  transitions={[
    {from: "Patrol", to: "Chase", event: "SPOT_PLAYER"},
    {from: "Chase", to: "Attack", event: "IN_RANGE"},
    {from: "Attack", to: "Chase", event: "OUT_OF_RANGE"},
    {from: "Attack", to: "Flee", event: "LOW_HP"},
    {from: "Chase", to: "Patrol", event: "LOST_SIGHT"},
    {from: "Flee", to: "Patrol", event: "SAFE_DISTANCE"}
  ]}
  animated
/>
</div>

The corresponding .orb trait definition:

```json
{
  "name": "BerserkerAI",
  "linkedEntity": "Unit",
  "stateMachine": {
    "states": [
      { "name": "Patrol", "isInitial": true },
      { "name": "Chase" },
      { "name": "Attack" },
      { "name": "Flee" }
    ],
    "events": [
      { "key": "SPOT_PLAYER", "name": "Spot Player" },
      { "key": "IN_RANGE", "name": "In Range" },
      { "key": "OUT_OF_RANGE", "name": "Out of Range" },
      { "key": "LOW_HP", "name": "Low HP" },
      { "key": "LOST_SIGHT", "name": "Lost Sight" },
      { "key": "SAFE_DISTANCE", "name": "Safe Distance" }
    ],
    "transitions": [
      {
        "from": "Patrol",
        "to": "Chase",
        "event": "SPOT_PLAYER",
        "effects": [
          ["set", "@entity.speed", ["*", "@entity.baseSpeed", 1.5]]
        ]
      },
      {
        "from": "Chase",
        "to": "Attack",
        "event": "IN_RANGE",
        "effects": [
          ["set", "@entity.attackMultiplier", 1.5],
          ["set", "@entity.defenseMultiplier", 0.8]
        ]
      },
      {
        "from": "Attack",
        "to": "Flee",
        "event": "LOW_HP",
        "guard": ["<", "@entity.hp", ["*", "@entity.maxHp", 0.25]],
        "effects": [
          ["set", "@entity.speed", ["*", "@entity.baseSpeed", 2.0]],
          ["set", "@entity.defenseMultiplier", 0.4]
        ]
      },
      {
        "from": "Attack",
        "to": "Chase",
        "event": "OUT_OF_RANGE"
      },
      {
        "from": "Chase",
        "to": "Patrol",
        "event": "LOST_SIGHT",
        "effects": [
          ["set", "@entity.speed", "@entity.baseSpeed"],
          ["set", "@entity.attackMultiplier", 1.0]
        ]
      },
      {
        "from": "Flee",
        "to": "Patrol",
        "event": "SAFE_DISTANCE",
        "effects": [
          ["set", "@entity.hp", ["+", "@entity.hp", ["*", "@entity.maxHp", 0.1]]],
          ["set", "@entity.defenseMultiplier", 1.0]
        ]
      }
    ]
  }
}
```

## What the Player Sees

The state machine is visible in-game. The player knows:

- **Patrol**: Normal stats, predictable path. Safe to approach.
- **Chase**: 1.5x speed. The enemy is coming.
- **Attack**: 1.5x attack, 0.8x defense. Dangerous but fragile.
- **Flee**: Triggers below 25% HP. 2x speed, 0.4x defense. A glass cannon running away. Chase and finish, or let it escape and heal 10%.

Every transition has a trigger the player can see and a consequence they can plan around. Combat becomes strategy: manipulate the enemy into Attack, exploit the 0.8x defense window, keep pressure to prevent the Flee-to-heal loop.

## Guards Make It Deterministic

The `LOW_HP` transition has a guard: `["<", "@entity.hp", ["*", "@entity.maxHp", 0.25]]`. The enemy flees only when HP drops below 25% of max. No randomness. The player can calculate exactly when the transition fires and plan their burst damage to finish the enemy before it flees.

Guards also enable tiered behavior. A stronger variant of the Berserker could have:

```json
{
  "from": "Attack",
  "to": "Flee",
  "event": "LOW_HP",
  "guard": ["<", "@entity.hp", ["*", "@entity.maxHp", 0.10]]
}
```

Same state machine structure, different threshold. The player reads the trait and adjusts strategy accordingly.

## Trait Composition Creates Depth

A single trait is simple: 4 states, 6 transitions. But units equip multiple traits. A Berserker with a `VampireTrait` (heals on damage dealt) creates a different tactical problem than one with a `ShieldTrait` (absorbs a burst of damage before breaking).

The traits compose through events. `VampireTrait` listens for `DEAL_DAMAGE` and heals. `ShieldTrait` listens for `INCOMING_ATTACK` and absorbs. Neither trait references the other. The player reads both state machines on the unit and plans against the combination.

This is the core advantage of modeling game AI in .orb: behavior is explicit, composable, and readable. The .orb compiler validates that every state is reachable, every event has a handler, and every emit has a listener. The game designer gets correctness guarantees. The player gets a system they can understand and master.

No black boxes. No random weights. Just state machines.
