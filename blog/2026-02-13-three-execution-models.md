---
slug: three-execution-models
title: "Three Execution Models, One Truth: How We Solved the 'Write Once, Run Anywhere' Problem"
authors: [osamah]
tags: [architecture]
image: /img/blog/three-execution-models.png
---

![Three Execution Models, One Source of Truth](/img/blog/three-execution-models.png)

The same `.orb` file runs in the browser, on the server, and compiles to native code. Here's how.

Java promised "write once, run anywhere." We deliver "write once, run *everywhere appropriately*."

<!-- truncate -->

<OrbitalDiagram />

## The Promise and Failure of WORA

In 1995, Java promised: *"Write once, run anywhere."*

The reality: *"Write once, debug everywhere."*

The problem? Different environments need different tradeoffs:
- **IDE/Development** — Need fast iteration, interpreted
- **Production Web** — Need performance, compiled
- **Desktop/Mobile** — Need native, bundled

One size doesn't fit all.

## Almadar's Solution: Three Execution Models

From a single `.orb` schema, Almadar supports three execution models:

```
.orb Schema
     │
     ├─────────────────┬─────────────────┐
     │                 │                 │
     ▼                 ▼                 ▼
TypeScript      Rust Runtime      Generated Code
Runtime         (Native)          (Compiled)
(Interpreted)                     (Production)
```

Each optimized for its environment.

## Model 1: TypeScript Runtime

**Best for:** Development, IDE, rapid iteration

```bash
# Start development server with live reload
almadar dev task-app.orb

# Opens browser at localhost:3000
# Schema changes auto-reload
```

**Characteristics:**
- ⚡ Fast startup
- 🔄 Hot reload
- 🐛 Debuggable
- 🌐 Browser/Node compatible

**Use Cases:**
- Builder IDE preview
- Development environment
- Testing and debugging
- Educational demos

## Model 2: Rust Runtime

**Best for:** Native apps, CLI tools, high performance

```bash
# Compile to native Rust binary
almadar compile task-app.orb --shell rust -o native/

# Build and run the native app
cd native && cargo build --release && ./target/release/task-app
```

The Almadar compiler generates a complete Rust project with Axum for the backend and egui for the UI. The resulting binary is a standalone native application — no runtime dependencies, no Node.js.

**Characteristics:**
- 🚀 Native performance
- 📦 Small binaries
- 🔒 Memory safe
- 🖥️ Cross-platform

**Use Cases:**
- Desktop applications
- CLI tools
- Embedded systems
- Game clients

## Model 3: Generated Code

**Best for:** Production deployment, custom integration

```bash
# Generate TypeScript
orbital compile app.orb --shell typescript -o output/

# Generate Python
orbital compile app.orb --shell python -o output/

# Generate Rust
orbital compile app.orb --shell rust -o output/
```

**Characteristics:**
- 🎯 Optimized for target
- 🔧 Fully customizable
- 📚 Readable output
- 🏭 Production-ready

**Use Cases:**
- Production web apps
- Microservices
- Mobile apps (via React Native)
- Custom integrations

## The OIR: Orbital Intermediate Representation

How does one schema become three executables?

The secret is **OIR** — Orbital Intermediate Representation:

```
.orb Schema
    │
    ▼
Parse → Validate → Enrich → Inline → Resolve
    │
    ▼
┌─────────────────────────────────────┐
│         OIR (Orbital IR)            │
│  - Resolved entities                │
│  - Normalized traits                │
│  - Flattened pages                  │
│  - Validated state machines         │
└─────────────────────────────────────┘
    │
    ├──────────────┬──────────────┐
    ▼              ▼              ▼
TS Runtime    Rust Runtime    Code Generator
```

OIR is the **Rosetta Stone** — a common format all targets understand.

## Example: Task App Across All Models

### The Schema

```json
{
  "name": "TaskApp",
  "orbitals": [{
    "name": "TaskManagement",
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
          "from": "browsing",
          "to": "browsing",
          "event": "INIT",
          "effects": [
            ["render-ui", "main", { "type": "entity-table", "entity": "Task" }]
          ]
        }]
      }
    }],
    "pages": [{ "name": "TasksPage", "path": "/tasks" }]
  }]
}
```

### Model 1: TypeScript Runtime

```bash
# Start development server — schema interpreted directly
almadar dev task-app.orb

# State machine runs in memory
# UI renders via React components
# Events handled by EventBus
```

### Model 2: Rust Runtime

```bash
# Compile to standalone native binary
almadar compile task-app.orb --shell rust -o native/
cd native && cargo build --release

# State machine runs as native code
# UI via egui (immediate mode)
# Events via Rust channels
```

### Model 3: Generated TypeScript

```typescript
// Generated code structure:
src/
├── components/
│   └── TaskTable.tsx      // entity-table pattern
├── pages/
│   └── TasksPage.tsx      // Route + trait binding
├── state/
│   └── TaskBrowser.ts     // State machine
├── types/
│   └── Task.ts            // Entity types
└── App.tsx                // Main app
```

Run it:
```bash
cd output && npm install && npm run dev
```

## When to Use Which

| Scenario | Runtime | Why |
|----------|---------|-----|
| IDE/Preview | TypeScript | Fast iteration |
| Development | TypeScript | Hot reload |
| Testing | TypeScript | Fast feedback |
| Desktop App | Rust | Native performance |
| CLI Tool | Rust | Small, fast binary |
| Game | Rust | Real-time performance |
| Web Production | Generated TS | Optimized bundle |
| API Backend | Generated Python | FastAPI integration |
| Microservice | Generated Rust | Axum performance |

## The Build Pipeline

```bash
# Development
orbital dev task-app.orb          # TypeScript Runtime

# Compile to Rust (Native)
orbital compile task-app.orb --shell rust -o native/  # Rust Runtime

# Production build
orbital compile task-app.orb --shell typescript -o prod/
orbital compile task-app.orb --shell python -o api/
orbital compile task-app.orb --shell rust -o native/
```

## Real-World Analogy: LLVM

LLVM (Low Level Virtual Machine) does for systems languages what Almadar does for applications:

**LLVM:**
- C/C++/Rust → LLVM IR → x86/ARM/WASM

**Almadar:**
- .orb Schema → OIR → TypeScript/Rust/Generated

The intermediate representation decouples source from target.

## Benefits of This Architecture

### For Developers
- ✅ One schema, multiple targets
- ✅ No code duplication
- ✅ Consistent behavior across platforms
- ✅ Easy to switch targets

### For Teams
- ✅ Frontend and backend from same source
- ✅ Mobile and web from same source
- ✅ No drift between implementations
- ✅ Shared understanding

### For Business
- ✅ Faster time to market
- ✅ Lower maintenance costs
- ✅ Platform flexibility
- ✅ Future-proof

## Comparison: Traditional vs Almadar

### Traditional Approach

```
Web App (React)     Mobile (React Native)    API (Node.js)
     │                      │                      │
     ▼                      ▼                      ▼
  Redux store         Different Redux        Different logic
  Component A         Component A'           Endpoint A
  Component B         Component B'           Endpoint B
  API client          API client             Controllers
     │                      │                      │
     └──────────────────────┼──────────────────────┘
                            │
                     Three implementations
                     of the same logic
```

**Problems:**
- ❌ Code duplication
- ❌ Logic drift
- ❌ Triple maintenance
- ❌ Inconsistent behavior

### Almadar Approach

```
                    .orb Schema
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    TypeScript        Rust            Generated
    Runtime (IDE)     Runtime         Code (Prod)
    (Preview)         (Desktop)       (Web/Mobile/API)
         │               │               │
         └───────────────┴───────────────┘
                            │
                     One source of truth
                     Three execution models
```

**Benefits:**
- ✅ Single schema
- ✅ No drift
- ✅ One maintenance point
- ✅ Guaranteed consistency

## Try It: Multi-Target App

Create `multi-target.orb`:

```json
{
  "name": "MultiTargetApp",
  "orbitals": [{
    "name": "Counter",
    "entity": {
      "name": "Counter",
      "fields": [
        { "name": "count", "type": "number", "default": 0 }
      ]
    },
    "traits": [{
      "name": "CounterTrait",
      "linkedEntity": "Counter",
      "stateMachine": {
        "states": [{ "name": "counting", "isInitial": true }],
        "events": [
          { "key": "INIT", "name": "Initialize" },
          { "key": "INCREMENT", "name": "Increment" },
          { "key": "DECREMENT", "name": "Decrement" }
        ],
        "transitions": [
          {
            "from": "counting",
            "to": "counting",
            "event": "INIT",
            "effects": [
              ["render-ui", "main", {
                "type": "page-header",
                "title": "Counter: {{@entity.count}}",
                "actions": [
                  { "label": "+", "event": "INCREMENT" },
                  { "label": "-", "event": "DECREMENT" }
                ]
              }]
            ]
          },
          {
            "from": "counting",
            "to": "counting",
            "event": "INCREMENT",
            "effects": [
              ["set", "@entity.count", ["+", "@entity.count", 1]],
              ["emit", "INIT"]
            ]
          },
          {
            "from": "counting",
            "to": "counting",
            "event": "DECREMENT",
            "effects": [
              ["set", "@entity.count", ["-", "@entity.count", 1]],
              ["emit", "INIT"]
            ]
          }
        ]
      }
    }],
    "pages": [{ "name": "CounterPage", "path": "/" }]
  }]
}
```

Run it three ways:

```bash
# 1. TypeScript Runtime (Development)
orbital dev multi-target.orb

# 2. Rust Runtime (Native)
orbital compile multi-target.orb --shell rust -o counter-native/

# 3. Generated TypeScript (Production)
orbital compile multi-target.orb --shell typescript -o counter-web/
cd counter-web && npm install && npm run dev
```

Same schema. Three different executions.

## The Takeaway

Java's "write once, run anywhere" tried to force one execution model on every environment.

Almadar's "write once, run everywhere appropriately" recognizes that:
- Development needs speed
- Production needs optimization
- Native needs performance

One schema. Three models. The right tool for the right job.

Because the goal isn't to run everywhere — it's to run **well** everywhere.

Learn more about [Getting Started](https://orb.almadar.io/docs/getting-started/introduction).
