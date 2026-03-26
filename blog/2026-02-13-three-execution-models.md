---
slug: three-execution-models
title: "Three Execution Models, One Truth: How We Solved the 'Write Once, Run Anywhere' Problem"
authors: [osamah]
tags: [architecture]
image: /img/blog/three-execution-models.svg
---
import { AvlOrbitalUnit } from '@almadar/ui/illustrations';

The same `.orb` file runs in the browser via an interpreter, compiles to a native Rust binary, and generates production TypeScript or Python code. Three execution models from one source of truth, each optimized for its environment.

<!-- truncate -->

## Why Three Models

Java promised "write once, run anywhere" and delivered "write once, debug everywhere." The problem: different environments need different tradeoffs. Development needs fast iteration. Production needs optimized bundles. Desktop needs native performance. One execution model cannot serve all three well.

.orb solves this with three distinct targets from a single source:

<div style={{margin: '2rem 0'}}>
<AvlOrbitalUnit
  entityName="Task"
  fields={3}
  traits={[{name: "TaskBrowser"}]}
  pages={[{name: "/tasks"}]}
  animated
/>
</div>

## Model 1: TypeScript Runtime (Development)

The interpreter reads your .orb file directly and runs it in the browser with hot reload:

```bash
orbital dev task-app.orb
# Opens browser at localhost:3000
# Schema changes auto-reload
```

Best for: development, IDE preview, testing, educational demos. The state machine runs in memory, UI renders via React components, and events flow through the EventBus. Fast startup, instant feedback.

## Model 2: Rust Runtime (Native)

The compiler generates a complete Rust project with Axum for the backend:

```bash
orbital compile task-app.orb --shell rust -o native/
cd native && cargo build --release
./target/release/task-app
```

Best for: desktop applications, CLI tools, game clients, embedded systems. The resulting binary is standalone with no runtime dependencies and no Node.js required.

## Model 3: Generated Code (Production)

The compiler generates a full project in your target language:

```bash
orbital compile task-app.orb --shell typescript -o prod/
orbital compile task-app.orb --shell python -o api/
```

Each generates frontend components, backend API routes, shared types, and state management. The output is readable, production-ready code you can deploy directly.

## One Schema, Three Targets

Here is a minimal .orb program and what each model does with it:

```json
{
  "name": "TaskApp",
  "orbitals": [{
    "entity": {
      "name": "Task",
      "fields": [
        { "name": "title", "type": "string" },
        { "name": "status", "type": "enum", "values": ["todo", "done"] }
      ]
    },
    "traits": [{
      "name": "TaskBrowser",
      "linkedEntity": "Task",
      "stateMachine": {
        "states": [{ "name": "browsing", "isInitial": true }],
        "transitions": [{
          "from": "browsing", "to": "browsing", "event": "INIT",
          "effects": [["render-ui", "main", { "type": "entity-table", "entity": "Task" }]]
        }]
      }
    }],
    "pages": [{ "name": "TasksPage", "path": "/tasks" }]
  }]
}
```

Run it three ways:

```bash
orbital dev task-app.orb                              # Interpreted (development)
orbital compile task-app.orb --shell rust -o native/   # Native binary
orbital compile task-app.orb --shell typescript -o web/ # Generated TypeScript
```

Same states. Same transitions. Same effects. Different execution targets, each optimized for its environment.

## The OIR: How It Works

The compiler parses your .orb file into an Orbital Intermediate Representation (OIR), similar to how LLVM uses IR to decouple source languages from target architectures. The OIR contains resolved entities, normalized traits, flattened pages, and validated state machines. Each target (TypeScript runtime, Rust runtime, code generator) reads from this common format.

## Choosing the Right Model

| Scenario | Model | Reason |
|----------|-------|--------|
| Development | TypeScript Runtime | Hot reload, fast feedback |
| Desktop app | Rust Runtime | Native performance, no dependencies |
| Web production | Generated TypeScript | Optimized bundle |
| API backend | Generated Python | FastAPI integration |
| CLI tool | Rust Runtime | Small, fast binary |

The goal is not to run everywhere identically. It is to run well everywhere, with the right tradeoffs for each environment.

Learn more in the [Getting Started guide](https://orb.almadar.io/docs/getting-started/introduction).
