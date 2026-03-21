---
slug: visible-ai-game-design
title: "Visible AI: A New Game Design Paradigm"
authors: [almadar]
tags: [gaming, state-machines, game-design]
---

In most games, the AI is a black box. Enemies do things, and you react. There's no way to read their intentions, predict their moves, or outthink them — only out-reflex them.

What if the AI's behavior was visible? What if you could *read* an enemy's state machine and use it against them?

That's what we built in Trait Wars.

<!-- truncate -->

<OrbitalDiagram />

## The Black Box Problem

In traditional game AI, enemy behavior looks like this from the player's perspective:

```
Enemy does... something.
You take damage.
Why? Who knows.
```

Under the hood, it's a mess of weighted random decisions:

```python
# Traditional game AI
def decide_action(enemy, player):
    if enemy.hp < 30:
        if random() < 0.6:
            return "flee"
        else:
            return "desperate_attack"
    elif distance(enemy, player) < 3:
        if random() < 0.7:
            return "melee_attack"
        else:
            return "block"
    else:
        return "approach"
```

Random weights, nested conditionals, invisible state. The player can't meaningfully interact with this system. They can only react faster.

**This is why most game AI feels "unfair" or "stupid" — never intelligent.**

## The Visible AI Principle

Trait Wars inverts this. Every unit in the game has **Traits** — and traits are state machines. The player can see:

1. **What state the enemy is in** (Idle, Aggressive, Defending, Enraged)
2. **What events trigger transitions** (ATTACK, TAKE_DAMAGE, LOW_HP)
3. **What the enemy will do** when a transition fires (effects)

This transforms combat from a reflex game into a **strategy game about reading and manipulating state machines**.

## How It Works

### Trait: The Core of Every Unit

Each unit in Trait Wars equips traits. A trait is a visible state machine:

```json
{
  "name": "BerserkerTrait",
  "linkedEntity": "Unit",
  "stateMachine": {
    "states": [
      { "name": "Calm", "isInitial": true },
      { "name": "Aggressive" },
      { "name": "Enraged" }
    ],
    "events": [
      { "key": "TAKE_DAMAGE", "name": "Take Damage" },
      { "key": "KILL_ENEMY", "name": "Kill Enemy" },
      { "key": "REST", "name": "Rest" }
    ],
    "transitions": [
      {
        "from": "Calm",
        "to": "Aggressive",
        "event": "TAKE_DAMAGE",
        "guard": ["<", "@entity.hp", ["*", "@entity.maxHp", 0.5]],
        "effects": [
          ["set", "@entity.attackMultiplier", 1.5],
          ["set", "@entity.defenseMultiplier", 0.8]
        ]
      },
      {
        "from": "Aggressive",
        "to": "Enraged",
        "event": "TAKE_DAMAGE",
        "guard": ["<", "@entity.hp", ["*", "@entity.maxHp", 0.25]],
        "effects": [
          ["set", "@entity.attackMultiplier", 2.5],
          ["set", "@entity.defenseMultiplier", 0.4]
        ]
      },
      {
        "from": "Enraged",
        "to": "Calm",
        "event": "KILL_ENEMY",
        "effects": [
          ["set", "@entity.attackMultiplier", 1.0],
          ["set", "@entity.defenseMultiplier", 1.0],
          ["set", "@entity.hp", ["*", "@entity.maxHp", 0.3]]
        ]
      }
    ]
  }
}
```

The player can see this trait on the enemy unit. They know:

- **Calm** → Normal stats. Safe to ignore for now.
- **Aggressive** → 1.5x attack, 0.8x defense. Dangerous but fragile.
- **Enraged** → 2.5x attack, 0.4x defense. A glass cannon. Hit them now or die.
- **Kill trigger** → If the Berserker kills someone while Enraged, it resets to Calm and heals. Don't let it get the kill.

## Player Strategy Emerges

Because the AI is visible, combat becomes about **manipulating enemy state**:

### Strategy 1: Bait the Berserker

1. Send a tanky unit to absorb hits
2. Wait for the Berserker to enter **Enraged** (2.5x attack, 0.4x defense)
3. Strike with your ranged units — the 0.4x defense means they melt
4. Kill them before they kill your tank (which would reset them to Calm + heal)

### Strategy 2: Deny the Reset

1. The Berserker heals when it kills while Enraged
2. Keep your low-HP units out of its range
3. Starve it of kill targets while its defense is halved

### Strategy 3: Trait Counters

A unit with a **Shield Trait** can absorb the Enraged burst:

```
ShieldTrait: Calm → Shielded (on INCOMING_ATTACK)
  - Absorbs damage equal to @entity.shieldStrength
  - Transitions back to Calm after 2 turns
```

The player reads both trait machines and composes a counter-strategy. This isn't rock-paper-scissors. It's **reading the opponent's state machine and exploiting its transitions**.

## Why This Creates Better Games

### 1. Skill Is Knowledge, Not Reflexes

In a reflex-based game, a 15-year-old with fast thumbs beats a 35-year-old strategist every time. In Trait Wars, understanding state machines — reading which state an enemy is in, predicting what event will trigger next, positioning units to exploit transition windows — is the skill.

### 2. No Randomness Frustration

When you lose to a Berserker, you know exactly why: you let it reach Enraged and didn't punish the 0.4x defense window. The state machine is deterministic. Same inputs, same outputs. Every loss is a learning opportunity, not a dice roll.

### 3. Emergent Complexity from Simple Rules

Each trait has 3-5 states. Simple. But when a unit has 2-3 traits, and the enemy has 2-3 traits, and there are 6 units per side... the interaction space is enormous. Not because the rules are complex, but because **composition creates emergence**.

### 4. Players Become System Thinkers

Playing Trait Wars teaches you to think in terms of:
- States (what can happen)
- Transitions (what triggers change)
- Guards (what prevents change)
- Effects (what change causes)

These are the same concepts used in software engineering, business process design, and systems thinking. The game teaches a mental model that transfers to the real world.

## The Design Secret: Traits Are Game Mechanics

In traditional games, abilities are defined by designers in code. Adding a new ability means programming new behavior.

In Trait Wars, **traits ARE the game mechanics**. Adding new abilities is adding new state machines:

```json
{
  "name": "VampireTrait",
  "stateMachine": {
    "states": [
      { "name": "Hungry", "isInitial": true },
      { "name": "Fed" }
    ],
    "transitions": [
      {
        "from": "Hungry",
        "to": "Fed",
        "event": "DEAL_DAMAGE",
        "effects": [
          ["set", "@entity.hp", ["+", "@entity.hp", ["*", "@payload.damage", 0.3]]],
          ["set", "@entity.attackMultiplier", 0.8]
        ]
      },
      {
        "from": "Fed",
        "to": "Hungry",
        "event": "TURN_END",
        "guard": [">=", "@entity.turnsSinceFed", 3],
        "effects": [
          ["set", "@entity.attackMultiplier", 1.2]
        ]
      }
    ]
  }
}
```

Vampire heals 30% of damage dealt. After feeding, it's weaker for a while (0.8x attack). After 3 turns without feeding, it gets hungry again and hits harder (1.2x). The player reads this and plans accordingly.

No new code was written. Just a JSON state machine.

## Resonance: Trait Composition as Game Mechanic

When units equip compatible traits, they create **Resonance** — synergy multipliers:

| Combination | Resonance Effect |
|-------------|-----------------|
| Defend + Mend | 1.5x shield healing |
| Berserker + Vampire | Lifesteal scales with rage |
| Shield + Taunt | 2x aggro generation |

This creates a deckbuilding layer on top of tactical combat. Players don't just pick units — they pick **trait combinations** that create emergent strategies.

## The Takeaway

For game designers: **make the AI visible**. When players can read the system, they engage with it intellectually. Losses become learning opportunities. Wins feel earned. Depth emerges from simple, composable rules.

For developers: **state machines aren't just for forms and workflows**. They're a game design tool that creates deterministic, readable, composable behavior — exactly what players and designers need.

For players: **Trait Wars is coming**. And in this game, the smartest player wins.

Follow the development at [almadar.io](/blog).
