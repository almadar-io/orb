---
slug: understanding-state-machines
title: Understanding State Machines in Almadar
authors: [osamah]
tags: [architecture, tutorial]
---

State machines are at the heart of Almadar. In this post, we explore why we chose state machines as the foundation for application behavior.

<!-- truncate -->

import HeroSchemaAnimation from '@site/src/components/HeroSchemaAnimation';

export const toggleSchema = {
  name: "ToggleApp",
  orbitals: [{
    name: "Toggle",
    entity: { name: "Switch" },
    traits: [{
      name: "Toggleable",
      stateMachine: {
        states: [
          { name: "off", isInitial: true },
          { name: "on" }
        ],
        transitions: [
          { from: "off", to: "on", event: "TOGGLE" },
          { from: "on", to: "off", event: "TOGGLE" }
        ]
      }
    }],
    pages: [{ name: "Demo" }]
  }]
};

<HeroSchemaAnimation schema={toggleSchema} />

## Why State Machines?

Traditional web applications often suffer from unpredictable behavior. A button might do different things depending on hidden state, race conditions, or implicit assumptions buried in code.

State machines solve this by making **every possible state explicit** and **every transition intentional**.

## Anatomy of an Almadar State Machine

Every trait in Almadar contains a state machine:

```json
{
  "name": "Toggleable",
  "stateMachine": {
    "states": [
      { "name": "off", "isInitial": true },
      { "name": "on" }
    ],
    "transitions": [
      {
        "from": "off",
        "event": "TOGGLE",
        "to": "on",
        "effects": [
          ["render-ui", "main", { "type": "toggle", "active": true }]
        ]
      },
      {
        "from": "on",
        "event": "TOGGLE",
        "to": "off",
        "effects": [
          ["render-ui", "main", { "type": "toggle", "active": false }]
        ]
      }
    ]
  }
}
```

## Key Concepts

### States
States represent the possible conditions of your entity. Each state is explicit and named.

### Events
Events trigger transitions. They can come from user actions, system events, or other orbitals.

### Transitions
Transitions define how your entity moves from one state to another. Each transition can have:
- **Guards**: Conditions that must be met
- **Effects**: Actions to perform (update fields, render UI, emit events)

### Effects
Effects are the side-effects of a transition. Almadar supports:
- `set` - Update an entity field
- `increment` / `decrement` - Modify numbers
- `render-ui` - Render a UI pattern
- `emit` - Publish events to other orbitals
- `persist` - Save to database
- `navigate` - Change routes

## Benefits

1. **Predictability**: You always know what state your app is in
2. **Testability**: Test every transition independently
3. **Security**: Guards prevent unauthorized state changes
4. **Debugging**: State history makes bugs reproducible

## Next Steps

Ready to build with state machines? Check out our [Getting Started guide](https://orb.almadar.io/docs/getting-started/introduction).
