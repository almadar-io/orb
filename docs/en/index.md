# Orb

> **The Physics of Software**: Declare your application, compile to production

Welcome to the Orb programming language documentation. Orb is a declarative approach to building full-stack applications through state machines, entities, and traits.

## Quick Navigation

### Getting Started

- [Introduction](getting-started/introduction.md) - What is Orb and why should you use it?
- [Install the CLI](downloads/cli.md) - Get the Orb CLI on your system
- [Build a Task Manager](tutorials/beginner/task-manager.md) - Build a task manager in 10 minutes
- [Core Concepts: Entities](core-concepts/entities.md) - Entities, traits, and state machines

### Language Reference

- [Entities](core-concepts/entities.md) - Data structures and persistence
- [Traits](core-concepts/traits.md) - Behavior as state machines
- [S-Expressions](core-concepts/standard-library.md) - Guards and effects syntax
- [Effects & Standard Library](core-concepts/standard-library.md) - Server and client effects
- [Patterns](core-concepts/patterns.md) - UI pattern library

### Guides

#### Technical

- [Guards & Business Rules](tutorials/intermediate/guards.md) - S-expression conditions on transitions
- [Cross-Orbital Events](tutorials/intermediate/cross-orbital.md) - Emits, listens, and payload contracts

#### Business

- [Why Orb?](/enterprise) - Enterprise use cases and ROI
- [Case Studies](/enterprise) - Inspection and Trainer case studies

### Tutorials

#### Beginner

- [Anatomy of a Complete Orbital](tutorials/beginner/complete-orbital.md) - Entity, traits, state machine, and pages
- [Build a Task Manager](tutorials/beginner/task-manager.md) - Full CRUD with lifecycle states

#### Intermediate

- [UI Patterns & render-ui](tutorials/intermediate/ui-patterns.md) - All pattern types, slots, and action wiring
- [Guards & Business Rules](tutorials/intermediate/guards.md) - S-expression conditions on transitions
- [Cross-Orbital Communication](tutorials/intermediate/cross-orbital.md) - Emits, listens, and payload contracts

#### Advanced

- [Building a Full Multi-Orbital Application](tutorials/advanced/full-app.md) - Three connected orbitals from a real schema
- [Generating Schemas with an LLM](tutorials/advanced/ai-generation.md) - Prompting, validation, and fixing common mistakes

### Reference

- [CLI Reference](downloads/cli.md)
- [Standard Library](../reference/standard-library)
- [Behaviors Library](../reference/behaviors)
- [Operator Reference](/docs/reference/operators/)
- [Core Concepts: Patterns](core-concepts/patterns.md)

---

## The Orb Philosophy

### The Closed Circuit Pattern

Every user interaction in Orb follows a guaranteed flow:

```
Event (User Action)
    ↓
Guard Evaluation (Permission Check)
    ↓
State Transition (Behavior Logic)
    ↓
Effects Execution
    ↓
Response to UI
```

This pattern ensures:
- **Security by design** - Guards enforce permissions at the transition level
- **Predictable behavior** - State machines can only exist in valid states
- **Testability** - Every path is enumerable and testable

### Three Pillars

1. **Entities** - What your application manages (data)
2. **Traits** - How your application behaves (state machines)
3. **Pages** - Where your application appears (routes)

### Why "Orb"?

Like planets in orbit around a star, application components in Orb follow predictable, law-governed paths. The laws of physics ensure stability; Orb's state machines ensure application consistency.

---

## Community

- [Discord](https://discord.gg/YtWJCpnk) - Real-time chat and support
- [GitHub Discussions](https://github.com/almadar-io/orb/discussions) - Technical discussions
- [LinkedIn](https://www.linkedin.com/company/almadar-io) - Updates and announcements

---

*Built with passion by [Almadar](https://almadar.io)*
