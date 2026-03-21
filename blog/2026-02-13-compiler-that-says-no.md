---
slug: compiler-that-says-no
title: "The Compiler That Says No: How 50 Validators Prevent Bugs Before They Exist"
authors: [osamah]
tags: [compiler, rust, engineering]
---

Most compilers check syntax. Ours checks logic.

The Almadar compiler runs 50+ validation rules across 12 modules before generating a single line of code. It catches stuck modals, orphaned events, unreachable states, and broken circuits — bugs that would normally survive all the way to production.

Here's what it catches and how.

<!-- truncate -->

## Why Validation > Testing

Testing tells you: "This specific scenario works."

Validation tells you: "No scenario can break."

Tests are samples. Validation is proof. The Almadar compiler doesn't check if your app works *in the cases you tested*. It checks if your app *can possibly be broken*.

## The 12 Validation Modules

The compiler runs validators in sequence, each focusing on a different concern:

```
Schema → Entity → Trait → Effect → RenderUI → Slot →
S-Expression → Binding → Service → CrossOrbital → Icon → ClosedCircuit
```

Let's walk through the most interesting ones.

### 1. Entity Validator

Catches data model problems before they become runtime errors.

**Duplicate field names:**
```
Error: ORB_E_DUPLICATE_FIELD
  Entity 'Task' has duplicate field name 'status'.
  Each field name must be unique within an entity.
```

**Invalid relation targets:**
```
Error: ORB_E_INVALID_RELATION
  Field 'assigneeId' references entity 'User' but no entity
  named 'User' exists in this schema.
  Available entities: Task, Project, Comment
```

**Reserved field names:**
```
Error: ORB_E_RESERVED_FIELD
  Field name 'id' is reserved and automatically generated.
  Remove this field from your entity definition.
```

### 2. Trait Validator

Ensures state machines are well-formed.

**No initial state:**
```
Error: ORB_T_NO_INITIAL_STATE
  Trait 'TaskInteraction' has no initial state.
  Add 'isInitial: true' to exactly one state.
```

**Unreachable states:**
```
Error: ORB_T_UNREACHABLE_STATE
  State 'Archived' in trait 'TaskInteraction' has no incoming
  transitions. It can never be reached.
  Either add a transition to this state or remove it.
```

This one is subtle. You define a state but forget to create a transition *to* it. Without the validator, the state exists in your schema but can never be entered — dead code in your state machine.

**Duplicate transitions:**
```
Error: ORB_T_DUPLICATE_TRANSITION
  Trait 'TaskInteraction' has two transitions from 'Browsing'
  on event 'EDIT'. State machines must be deterministic.
```

### 3. Closed Circuit Validator

The crown jewel. Ensures every user interaction completes a full circuit.

**Stuck overlays:**
```
Error: CIRCUIT_NO_OVERLAY_EXIT
  State 'EditModal' renders to 'modal' slot but has no exit
  transition. Users will be stuck in this overlay.

  Fix: Add a transition from 'EditModal' with event 'CANCEL' or 'CLOSE'
  that includes the effect: ["render-ui", "modal", null]
```

This is the "modal you can't close" bug. In traditional apps, you find it when a user reports it. In Almadar, you find it before the code exists.

**Orphaned events:**
```
Error: CIRCUIT_ORPHAN_EVENT
  Action 'Delete' in state 'Viewing' emits event 'DELETE'
  which has no transition handler in the current state.

  The button will render but clicking it will do nothing.
```

You defined a button with an event, but no transition handles that event in the current state. The button would render, the user would click it, and nothing would happen. The validator catches this at compile time.

**Missing main slot:**
```
Error: CIRCUIT_NO_MAIN_RENDER
  State 'Browsing' has no render-ui effect targeting the 'main' slot.
  The page will be blank when entering this state.
```

You defined a state but forgot to render anything to the main UI slot. Users would see a blank page.

### 4. S-Expression Validator

Checks that your logic expressions are well-formed.

**Unknown operators:**
```
Error: ORB_S_UNKNOWN_OPERATOR
  Unknown operator 'equals' in guard expression.
  Did you mean '='?
  Available comparison operators: =, !=, >, >=, <, <=
```

**Wrong arity:**
```
Error: ORB_S_WRONG_ARITY
  Operator 'and' expects 2+ arguments, got 1.
  Expression: ["and", ["=", "@entity.status", "active"]]

  'and' with a single argument is always equal to that argument.
  Did you mean to add another condition?
```

**Type mismatch:**
```
Error: ORB_S_TYPE_MISMATCH
  Operator '>' expects numeric arguments.
  Got: "@entity.name" (string) > 10 (number)

  You're comparing a string to a number. This will always
  evaluate to false.
```

### 5. Binding Validator

Ensures all data references point to real fields.

**Unknown binding root:**
```
Error: ORB_B_UNKNOWN_ROOT
  Unknown binding root '@result' in expression.
  Valid roots: @entity, @payload, @state, @now, @config, @user
```

**Unknown entity field:**
```
Error: ORB_B_UNKNOWN_FIELD
  Binding '@entity.staus' references field 'staus' which doesn't
  exist on entity 'Task'.
  Did you mean 'status'?
  Available fields: title, description, status, priority
```

Typo detection with suggestions. `@entity.staus` → "Did you mean `status`?"

### 6. Cross-Orbital Validator

Ensures event communication between orbitals is complete.

**Emit without listener:**
```
Error: ORB_X_ORPHAN_EMIT
  Trait 'OrderTrait' emits 'ORDER_COMPLETED' but no trait
  has a matching 'listens' declaration.

  Every emitted event must have at least one listener.
  Either add a listener or remove the emission.
```

This prevents "fire and forget" events — emissions that go nowhere. In a microservices architecture, this would be a message published to a queue with no consumer. In Almadar, the compiler catches it.

## The Two-Pass Architecture

Some validations require forward references. Entity A references Entity B, but B is defined after A. A single-pass validator would reject this.

The Almadar compiler uses a **two-pass approach**:

**Pass 1: Collect**
- Gather all entity names, trait names, state names, event names
- Build a symbol table of everything that exists

**Pass 2: Validate**
- Check all references against the symbol table
- Run all 12 validation modules
- Report errors with context and suggestions

This means you can define orbitals in any order. The compiler figures out the dependency graph.

## Error Quality: The Difference Between "Error" and "Help"

Compare a typical compiler error:

```
Error: unexpected token at line 47, column 12
```

With an Almadar validation error:

```
Error: CIRCUIT_NO_OVERLAY_EXIT

  State 'EditModal' renders to 'modal' slot but has no exit transition.
  Users will be stuck in this overlay.

  Location: orbitals[0].traits[0].stateMachine.states[2]
  Schema: task-app.orb

  Fix: Add a transition from 'EditModal' with event 'CANCEL' or 'CLOSE'
  that includes the effect: ["render-ui", "modal", null]

  Example:
    {
      "from": "EditModal",
      "to": "Browsing",
      "event": "CANCEL",
      "effects": [["render-ui", "modal", null]]
    }
```

Every error includes:
- **Error code** — searchable, documentable
- **Human-readable description** — what's wrong
- **Impact** — why it matters (users will be stuck)
- **Location** — exactly where in the schema
- **Fix** — how to resolve it
- **Example** — copy-paste solution

## Built in Rust: Why It Matters

The compiler is written in Rust. This gives us:

**Exhaustive pattern matching:** When we add a new effect type, the Rust compiler forces us to handle it in every validator. We can't forget a case — it won't compile.

**Memory safety without GC:** The validator borrows the schema without copying it. For a 5,000-line schema, this saves significant memory and time.

**Compilation speed:** Full validation of a large schema takes &lt;50ms. You get feedback faster than your editor can refresh.

**Fearless concurrency:** Validation modules can run in parallel without data races. Rust's type system guarantees this at compile time.

## What We Don't Validate (Yet)

The validator is not omniscient. It doesn't currently check:

- **Semantic correctness of guards** — It knows `[">=", "@entity.amount", 0]` is syntactically valid, but not whether the business logic is correct
- **Performance implications** — A state machine with 1,000 states is valid but potentially slow
- **UI aesthetics** — Two tables rendering in the same slot is valid but probably ugly

These are areas for future improvement. But the 50+ rules we have today catch the vast majority of bugs that survive into production in traditional applications.

## The Takeaway

The best bug is the one that never exists.

Almadar's compiler doesn't just check syntax. It checks causality (closed circuits), completeness (no orphaned events), reachability (no dead states), correctness (type-safe expressions), and consistency (cross-orbital event matching).

50+ rules. 12 modules. &lt;50ms.

That's not a compiler. That's a code reviewer that never sleeps, never misses a case, and never approves broken code.

Explore the [compiler documentation](https://orb.almadar.io/docs/compiler) to learn more.
