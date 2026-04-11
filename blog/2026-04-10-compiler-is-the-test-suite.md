---
slug: compiler-is-the-test-suite
title: "The Compiler Is the Test Suite"
authors: [osamah]
tags: [compiler, architecture]
---

`orbital validate` does not just check syntax. It walks the state machine graph and proves properties that would normally require dozens of hand-written tests. Closed circuits, emission contracts, binding validity, and operator arity — all checked before any code is generated.

<!-- truncate -->

## What the Compiler Checks

**Closed circuits.** Every overlay slot (`modal`, `drawer`) must have an exit path. If a state renders to a modal but has no transition that clears it, the user gets stuck. The compiler catches this:

```
Error: CIRCUIT_NO_OVERLAY_EXIT
  State 'EditModal' renders to 'modal' slot but has no exit transition.
  Fix: Add a transition from 'EditModal' with event 'CANCEL' or 'CLOSE'
```

**Emission contracts.** Every `emits` declaration must have a matching `listens` somewhere. No orphan events:

```
Error: ORB_X_ORPHAN_EMIT
  Trait 'OrderTrait' emits 'ORDER_COMPLETED' but no trait
  has a matching 'listens' declaration.
```

**Binding validation.** Every `@entity.field` reference is checked against the entity schema:

```
Error: BINDING_INVALID
  '@entity.prce' does not exist on entity 'Product'.
  Did you mean '@entity.price'?
```

**Operator validation.** S-expressions are verified for operator existence and arity. `(set @status)` with a missing value argument is a compile error, not a runtime surprise.

## A Concrete Example

```lolo
orbital ProductOrbital {
  entity Product [persistent: products] {
    id    : string!
    name  : string!
    price : number
  }

  trait ProductBrowser -> Product [interaction] {
    state browsing {
      INIT -> browsing
        (fetch Product)
        (render-ui main { type: "entity-table", entity: "Product", columns: ["name", "price"] })
      EDIT -> editing
        (render-ui modal { type: "form-section", entity: "Product", fields: ["name", "price"], submitEvent: "SAVE", cancelEvent: "CANCEL" })
    }
    state editing {
      SAVE -> browsing
        (persist update Product @payload.data)
        (render-ui modal null)
        (emit INIT)
      CANCEL -> browsing
        (render-ui modal null)
    }
  }

  page "/products" -> ProductBrowser
}
```

Run `orbital validate` and the compiler verifies: the modal in `editing` has two exits (`SAVE`, `CANCEL`), every `@payload.data` binding resolves, every `render-ui` references a known pattern, and the circuit from `browsing` through `editing` and back is complete.

## What This Replaces

Traditional testing catches these bugs by running specific scenarios and hoping you covered the broken path. The compiler proves correctness for every path, every time. No test file to write. No coverage to measure. The state machine *is* the specification, and the compiler validates the specification is sound.
