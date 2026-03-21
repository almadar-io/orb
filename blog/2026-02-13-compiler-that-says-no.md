---
slug: compiler-that-says-no
title: "The .orb Compiler That Says No"
authors: [osamah]
tags: [compiler, rust, engineering]
---
import { AvlStateMachine } from '@almadar/ui/illustrations';

Most compilers check syntax. The .orb compiler checks logic. It runs 50+ validation rules across 12 modules before generating a single line of code, catching bugs that would normally survive all the way to production.

<!-- truncate -->

## What the Compiler Catches

Here is a state machine with several problems. The compiler finds all of them before any code is generated:

<div style={{margin: '2rem 0'}}>
<AvlStateMachine
  states={[{name: "browsing", isInitial: true}, {name: "editing"}, {name: "archived"}, {name: "modalOpen"}]}
  transitions={[
    {from: "browsing", to: "editing", event: "EDIT"},
    {from: "editing", to: "browsing", event: "SAVE"},
    {from: "browsing", to: "modalOpen", event: "OPEN"}
  ]}
  animated
/>
</div>

Three validation errors exist in this diagram:

1. **Unreachable state**: `archived` has no incoming transition. It can never be entered.
2. **No overlay exit**: `modalOpen` renders to a modal slot but has no `CLOSE` or `CANCEL` transition. Users will be stuck.
3. **Orphan action**: If the `editing` state renders a Delete button emitting `DELETE`, no transition handles that event.

## Concrete Validation Examples

**Unreachable state** (the compiler catches dead states in your machine):

```
Error: ORB_T_UNREACHABLE_STATE
  State 'Archived' in trait 'TaskInteraction' has no incoming
  transitions. It can never be reached.
  Either add a transition to this state or remove it.
```

**Stuck overlay** (the crown jewel of .orb validation):

```
Error: CIRCUIT_NO_OVERLAY_EXIT
  State 'EditModal' renders to 'modal' slot but has no exit
  transition. Users will be stuck in this overlay.
  Fix: Add a transition from 'EditModal' with event 'CANCEL'
  or 'CLOSE' that includes: ["render-ui", "modal", null]
```

**Orphaned event** (a button that does nothing when clicked):

```
Error: CIRCUIT_ORPHAN_EVENT
  Action 'Delete' in state 'Viewing' emits event 'DELETE'
  which has no transition handler in the current state.
  The button will render but clicking it will do nothing.
```

**Typo in a field reference** (with suggestions):

```
Error: ORB_B_UNKNOWN_FIELD
  Binding '@entity.staus' references field 'staus' which
  doesn't exist on entity 'Task'.
  Did you mean 'status'?
  Available fields: title, description, status, priority
```

**Wrong operator arity** (logic errors in s-expressions):

```
Error: ORB_S_WRONG_ARITY
  Operator 'and' expects 2+ arguments, got 1.
  Expression: ["and", ["=", "@entity.status", "active"]]
  'and' with a single argument is always equal to that argument.
```

**Emit without listener** (fire-and-forget events):

```
Error: ORB_X_ORPHAN_EMIT
  Trait 'OrderTrait' emits 'ORDER_COMPLETED' but no trait
  has a matching 'listens' declaration.
  Every emitted event must have at least one listener.
```

## The 12 Validation Modules

The compiler runs validators in sequence, each targeting a different concern:

```
Schema -> Entity -> Trait -> Effect -> RenderUI -> Slot ->
S-Expression -> Binding -> Service -> CrossOrbital -> Icon -> ClosedCircuit
```

**Entity** catches duplicate fields, invalid relation targets, and reserved field names. **Trait** checks for initial states, reachability, and determinism. **S-Expression** validates operator names, argument counts, and type compatibility. **Binding** ensures every `@entity.field` reference points to a real field on the linked entity. **CrossOrbital** verifies that every `emit` has a matching `listens` somewhere. **ClosedCircuit** proves every UI interaction completes a full loop.

## Error Quality

Compare a typical compiler error:

```
Error: unexpected token at line 47, column 12
```

With an .orb validation error:

```
Error: CIRCUIT_NO_OVERLAY_EXIT

  State 'EditModal' renders to 'modal' slot but has no exit
  transition. Users will be stuck in this overlay.

  Location: orbitals[0].traits[0].stateMachine.states[2]

  Fix: Add a transition from 'EditModal' with event 'CANCEL'
  or 'CLOSE' that includes: ["render-ui", "modal", null]
```

Every error includes a searchable code, a human explanation of impact, the exact location, and a concrete fix. Many include copy-paste solutions.

## Why Validation Beats Testing

Testing proves specific scenarios work. Validation proves no scenario can break. Tests are samples. Validation is proof.

The .orb compiler does not check whether your application works in the cases you tested. It checks whether your application can possibly produce a stuck modal, a dead-end state, a button that does nothing, or a broken event chain. 50+ rules, 12 modules, under 50ms.
