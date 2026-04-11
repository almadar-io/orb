---
slug: compiler-is-the-test-suite
title: "The Compiler Is the Test Suite"
authors: [osamah]
tags: [compiler, architecture]
---

`orb validate` does not just check syntax. It walks the state machine graph and proves properties that would normally require dozens of hand-written tests. Closed circuits, emission contracts, binding validity, and pattern prop requirements — all checked before any code is generated.

<!-- truncate -->

## What the Compiler Checks

**Closed circuits.** Every overlay slot (`modal`, `drawer`) must have an exit path. If a state renders to a modal but has no transition that clears it, the user gets stuck. The compiler catches this:

```
Error: CIRCUIT_NO_OVERLAY_EXIT
  State 'editing' renders to 'modal' slot but has no exit transition.
  Fix: Add a transition from 'editing' with event 'CANCEL' or 'CLOSE'
```

**Modal exit completeness.** When a transition closes a modal, it must also re-render the main slot — otherwise the user sees stale content underneath:

```
Warning: CIRCUIT_MODAL_EXIT_INCOMPLETE
  Transition editing --[SAVE]--> browsing closes modal but doesn't re-render main slot.
  Fix: Add render-ui("main", {...}) alongside render-ui("modal", null)
```

**Pattern prop requirements.** Every `render-ui` call is checked against the pattern registry. Required props must be present:

```
Error: ORB_RUI_MISSING_REQUIRED_PROP
  Pattern 'data-list' requires prop 'fields' but it is not provided
  Fix: Add 'fields' to the render-ui config for 'data-list'
```

**Binding validation.** Every `@entity.field` reference is checked against the entity schema:

```
Error: ORB_BINDING_ENTITY_FIELD_UNDECLARED
  '@entity.prce' does not exist on entity 'Product'.
```

## A Concrete Example

```lolo
orbital ProductOrbital {
  entity Product [runtime] {
    id    : string
    name  : string
    price : number
  }

  trait ProductBrowser -> Product [interaction] {
    initial: browsing
    state browsing {
      INIT -> browsing
        (fetch Product)
        (render-ui main { type: "stack", direction: "vertical", gap: "lg", children: [{ type: "typography", content: "Products", variant: "h2" }, { type: "button", label: "Edit", event: "EDIT", variant: "primary" }, { type: "divider" }, { type: "data-list", entity: "Product", fields: ["name", "price"] }] })
      EDIT -> editing
        (render-ui modal { type: "stack", direction: "vertical", gap: "md", children: [{ type: "typography", content: "Edit Product", variant: "h3" }, { type: "input", label: "Name" }, { type: "input", label: "Price" }, { type: "stack", direction: "horizontal", gap: "md", children: [{ type: "button", label: "Save", event: "SAVE", variant: "primary" }, { type: "button", label: "Cancel", event: "CANCEL", variant: "secondary" }] }] })
    }
    state editing {
      SAVE -> browsing
        (render-ui modal null)
        (fetch Product)
        (render-ui main { type: "stack", direction: "vertical", gap: "lg", children: [{ type: "typography", content: "Products", variant: "h2" }, { type: "divider" }, { type: "data-list", entity: "Product", fields: ["name", "price"] }] })
      CANCEL -> browsing
        (render-ui modal null)
        (render-ui main { type: "stack", direction: "vertical", gap: "lg", children: [{ type: "typography", content: "Products", variant: "h2" }, { type: "divider" }, { type: "data-list", entity: "Product", fields: ["name", "price"] }] })
    }
  }

  page "/products" -> ProductBrowser
}
```

Run `orb validate` and the compiler verifies: the modal in `editing` has two exits (`SAVE`, `CANCEL`), both exits re-render the main slot, every `data-list` has its required `fields` prop, every `@entity.*` binding resolves, and the circuit from `browsing` through `editing` and back is complete.

## What This Replaces

Traditional testing catches these bugs by running specific scenarios and hoping you covered the broken path. The compiler proves correctness for every path, every time. No test file to write. No coverage to measure. The state machine *is* the specification, and the compiler validates the specification is sound.
