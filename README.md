# Orb

> **فيزياء البرمجيات** — The Physics of Software

Just as physics lets us predict how the physical world behaves, Orb lets us predict how software systems behave.

Orb (المدار) is a **world modeling language** — a semantic layer above programming languages that describes *how systems work*, not just *what they do*. Write a formal world model once, and AI agents generate valid implementations, the compiler validates correctness deterministically, and you can observe every possible state before a single line of code runs.

```
World Model (.orb) → Compiler → Valid System
        ▲                              │
        │                              ▼
   Natural Language              Observable
   (Human or AI)                 Behavior
```

**Built for the AI age:** Token-efficient representations that agents can generate and reason about. Deterministic validation that catches errors before runtime. Observable state spaces that let you prove correctness.

---

## Quick Start

```bash
# Install CLI globally
npm install -g @almadar/orb-cli

# Create a new project
orb new my-app
cd my-app

# Install dependencies
npm install

# Start development server
orb dev
```

---

## Core Philosophy

### Model the World, Not Just the Code

Traditional programming languages tell computers *what to do*. Orb describes *how things work*:

- **Entities** — What exists in your system (User, Order, Task)
- **Traits** — How those things behave and change over time
- **Pages** — How the world is observed and interacted with

This world model is a formal specification that both humans and AI can reason about.

### The Orbital Formula

```
World Unit = Entity + Traits + Pages
System     = Σ(World Units)
```

Each orbital is a self-contained world model describing a domain of your system. Compose them to build complex, observable applications.

### Observable by Design

Because Orb models behavior formally, you can:
- **Validate deterministically** — The compiler proves your model is valid before runtime
- **Exhaustively test** — Examine all possible states to ensure correctness
- **Generate efficiently** — AI agents produce valid systems from natural language
- **Reason precisely** — Both humans and machines understand the same model

### Closed Circuit Pattern

Every interaction flows through a predictable path:

```
User Action → Event → State Machine → Effects → World Update → (loop)
```

No hidden state mutations. No side effects you can't trace. Observable causality throughout.

---

## Architecture Overview

### High-Level System Flow

```
Natural Language ──┐
(Human or AI)      │
                   │
Human-written ─────┼──► ┌─────────────────┐
.orb Schema        │    │  Builder IDE    │  Generates/Edits
                   │    │  (LLM Agent)    │  .orb schema
                   └──► └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Rust Compiler   │  Parse → Validate → Resolve → Generate
                         │ (orbital-rust)  │
                         └────────┬────────┘
                                  │
                             ┌────┴────┐
                             ▼         ▼
                          TypeScript  Python
                             Shell     Shell
                          
                          (Rust shell coming soon)
```

### Three Execution Models

| Model | Use Case | Technology |
|-------|----------|------------|
| **TypeScript Runtime** | Preview, development | `@almadar/runtime` |
| **Rust Runtime** | Standalone apps, CLI | `orbital-rust` |
| **Compiled Code** | Production deployment | Generated TS/Python (Rust coming soon) |

---

## Why Orb?

### For AI-Generated Systems
Traditional code generation produces brittle outputs that break when requirements change. Orb's world models are **token-efficient** and **structurally valid** — AI agents can generate, modify, and reason about them reliably.

### For Guaranteed Correctness
Deterministic validation catches errors at compile time, not runtime. Exhaustive state space analysis lets you prove your system behaves correctly before deploying.

### For Observable Behavior
State machines make causality explicit. Every effect traces back to an event. Every guard is visible. The system's behavior is inspectable and predictable.

### For Complex Rules
Encode business logic, compliance requirements, or game mechanics in a formal model that can be validated, tested, and reasoned about — not buried in imperative code.

---

## Key Concepts

### 1. Entities

Define your data models:

```json
{
  "entity": {
    "name": "Task",
    "collection": "tasks",
    "fields": [
      { "name": "id", "type": "string", "primaryKey": true },
      { "name": "title", "type": "string", "required": true },
      { "name": "status", "type": "enum", "values": ["pending", "done"] }
    ]
  }
}
```

📚 [Entity Documentation](https://orb.almadar.io/docs/core-concepts/entities)

### 2. Traits (State Machines)

Define behavior with states, events, and transitions:

```json
{
  "trait": {
    "name": "TaskBrowser",
    "linkedEntity": "Task",
    "stateMachine": {
      "states": [
        { "name": "Browsing", "isInitial": true },
        { "name": "Creating" }
      ],
      "events": ["INIT", "CREATE", "SAVE", "CANCEL"],
      "transitions": [
        {
          "from": "Browsing",
          "to": "Browsing",
          "event": "INIT",
          "effects": [
            ["render-ui", "main", { "type": "entity-table", "entity": "Task" }]
          ]
        }
      ]
    }
  }
}
```

📚 [Trait Documentation](https://orb.almadar.io/docs/core-concepts/traits) | [Closed Circuit](https://orb.almadar.io/docs/core-concepts/closed-circuit)

### 3. Patterns & UI

Patterns bridge schemas to UI components:

```json
["render-ui", "main", {
  "type": "entity-table",
  "entity": "Task",
  "columns": ["title", "status"]
}]
```

📚 [Patterns Documentation](https://orb.almadar.io/docs/core-concepts/patterns)

### 4. Standard Library

Reuse pre-built behaviors:

```json
{
  "uses": [{ "from": "std/behaviors/crud", "as": "CRUD" }],
  "traits": [{ "name": "TaskCRUD", "uses": ["CRUD"] }]
}
```

📚 [Standard Library](https://orb.almadar.io/docs/core-concepts/standard-library)

---

## Installation

### CLI Installation

```bash
# npm (recommended)
npm install -g @almadar/orb-cli

# Or use npx
npx @almadar/orb-cli validate schema.orb

# macOS/Linux
curl -fsSL https://orb.almadar.io/install.sh | sh

# Windows PowerShell
irm https://orb.almadar.io/install.ps1 | iex

# Homebrew
brew install almadar-io/tap/orb
```

### NPM Packages

```bash
# Core packages
npm install @almadar/core @almadar/validation @almadar/evaluator

# Standard library
npm install @almadar/std

# UI patterns and components
npm install @almadar/patterns @almadar/ui

# Runtime
npm install @almadar/runtime @almadar/server

# AI agent infrastructure
npm install @almadar/agent @almadar/llm @almadar/skills
```

---

## Published Packages

All `@almadar` packages are published to [npm](https://www.npmjs.com/org/almadar).

### Core

| Package | Description |
|---------|-------------|
| `@almadar/core` | Core schema types and definitions |
| `@almadar/validation` | Schema validation rules |
| `@almadar/evaluator` | S-expression evaluator |
| `@almadar/std` | Standard library operators |
| `@almadar/patterns` | Pattern registry and component mappings |

### Runtime

| Package | Description |
|---------|-------------|
| `@almadar/runtime` | Interpreted runtime for orbital applications |
| `@almadar/server` | Server infrastructure (Express middleware) |
| `@almadar/ui` | React UI components, hooks, and providers |
| `@almadar/integrations` | External service integrations |

### AI & Agent

| Package | Description |
|---------|-------------|
| `@almadar/agent` | AI agent infrastructure |
| `@almadar/llm` | Multi-provider LLM client |
| `@almadar/skills` | AI skill generators and prompts |

### Tooling

| Package | Description |
|---------|-------------|
| `@almadar/orb-cli` | Orb CLI (validate, compile, dev) |
| `@almadar/extensions` | Editor extensions (VSCode, Zed) |

---

## Development Workflow

### The Fix Priority Rule

When something breaks, follow this order:

1. **Fix schema first** — 99% of issues are schema problems
2. **Update shell components** — Component bugs
3. **Modify compiler** — LAST RESORT (ask first!)

### Typical Flow

```
1. Edit Schema (.orb)
        ↓
2. Validate: orb validate schema.orb
        ↓
3. Compile: orb compile schema.orb --shell typescript
        ↓
4. Test generated code
        ↓
5. Iterate
```

📚 [Developer Guide](https://orb.almadar.io/docs/getting-started/introduction)

---

## Documentation

Full documentation is available at [orb.almadar.io/docs](https://orb.almadar.io/docs/getting-started/introduction):

### Core Concepts

| Document | Purpose |
|----------|---------|
| [Entities](https://orb.almadar.io/docs/core-concepts/entities) | Data models, field types, persistence |
| [Traits](https://orb.almadar.io/docs/core-concepts/traits) | State machines, guards, effects |
| [Pages](https://orb.almadar.io/docs/core-concepts/pages) | Routes, URL patterns, trait bindings |
| [Closed Circuit](https://orb.almadar.io/docs/core-concepts/closed-circuit) | Event flow pattern |
| [Patterns](https://orb.almadar.io/docs/core-concepts/patterns) | UI patterns and components |
| [Standard Library](https://orb.almadar.io/docs/core-concepts/standard-library) | Reusable behaviors and operators |

### Tutorials

| Level | Topic |
|-------|-------|
| Beginner | [Your First Schema](https://orb.almadar.io/docs/tutorials/beginner/complete-orbital) |
| Intermediate | [UI Patterns](https://orb.almadar.io/docs/tutorials/intermediate/ui-patterns), [Guards](https://orb.almadar.io/docs/tutorials/intermediate/guards) |
| Advanced | [Full App](https://orb.almadar.io/docs/tutorials/advanced/full-app) |

### Full Documentation

Visit [orb.almadar.io/docs](https://orb.almadar.io/docs/getting-started/introduction) for complete documentation.

---

## Website Development

This repository also contains the [orb.almadar.io](https://orb.almadar.io) documentation website, built with Docusaurus.

```bash
npm install
npm start          # Start dev server on port 3000
npm run build      # Production build
npm run serve      # Serve production build locally
```

---

## Community

- [Discord](https://discord.gg/q83VjPJx)
- [GitHub Discussions](https://github.com/almadar-io/orb/discussions)
- [LinkedIn](https://www.linkedin.com/company/almadar-io)

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## License

MIT — see [LICENSE](./LICENSE)

---

Built with ❤️ by [Almadar](https://almadar.io)
