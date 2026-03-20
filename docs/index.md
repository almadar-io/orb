# Orb

> **The Physics of Software**: Declare your application, compile to production

Welcome to the Orb programming language, a declarative approach to building full-stack applications through state machines, entities, and traits.

## What is Orb?

Orb is a **declarative language** that transforms how software is built. Instead of writing imperative code scattered across client and server, you declare applications as compositions of:

- **Entities** - Your data structures
- **Traits** - Behavior as state machines
- **Pages** - UI bindings

The compiler generates a complete, production-ready application.

```
Your Vision → OrbitalSchema (.orb) → Full-Stack Application
```

## Why Orb?

| Traditional Development | Orb Approach |
|------------------------|------------------|
| Months of development | Weeks to production |
| Scattered business logic | Centralized state machines |
| Manual API/UI coupling | Unified schema |
| Documentation as afterthought | Schema IS documentation |
| Testing is complex | State machines are inherently testable |

import HeroSchemaAnimation from '@site/src/components/HeroSchemaAnimation';

export const taskSchema = {
  name: "TaskManager",
  orbitals: [{
    name: "Tasks",
    entity: {
      name: "Task",
      fields: [
        { name: "title", type: "string" },
        { name: "status", type: "enum", values: ["pending", "done"] }
      ]
    },
    traits: [{
      name: "TaskLifecycle",
      stateMachine: {
        states: [
          { name: "Pending", isInitial: true },
          { name: "Done", isTerminal: true }
        ],
        transitions: [{
          from: "Pending",
          to: "Done",
          event: "COMPLETE"
        }]
      }
    }],
    pages: [{ name: "TaskList" }]
  }]
};

<HeroSchemaAnimation schema={taskSchema} />

## Quick Example

```json
{
  "name": "TaskManager",
  "orbitals": [{
    "name": "Tasks",
    "entity": {
      "name": "Task",
      "fields": [
        { "name": "title", "type": "string" },
        { "name": "status", "type": "enum", "values": ["pending", "done"] }
      ]
    },
    "traits": [{
      "name": "TaskLifecycle",
      "stateMachine": {
        "states": [
          { "name": "Pending", "isInitial": true },
          { "name": "Done" }
        ],
        "events": [{ "key": "COMPLETE", "name": "Complete Task" }],
        "transitions": [{
          "from": "Pending",
          "to": "Done",
          "event": "COMPLETE",
          "effects": [
            ["persist", "update", "Task", "@entity"],
            ["notify", "success", "Task completed!"]
          ]
        }]
      }
    }]
  }]
}
```

## Get Started

- **[Quick Start](en/getting-started/introduction.md)** — Build your first Orb application in 10 minutes
- **[Download CLI](en/downloads/cli.md)** — Get the Orb compiler for your platform
- **[Join Community](en/community/contributing.md)** — Connect with other Orb developers

## Language Selector

- [English Documentation](en/index.md)
- [التوثيق بالعربية](ar/index.md)

---

## Enterprise Services

Looking for a development partner? **Almadar** is the creator of the Orb language and a full-service software agency.

- [Almadar Enterprise](/enterprise) — Custom development, training, consulting
- [المدار للأعمال](/enterprise) — التطوير المخصص، التدريب، الاستشارات

---

*Built with passion by [Almadar](https://almadar.io)*
