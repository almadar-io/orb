---
slug: closed-circuit-pattern
title: "The Closed Circuit Pattern in .orb"
authors: [osamah]
tags: [architecture, state-machines]
image: /img/blog/closed-circuit-pattern.svg
---
![](/img/blog/closed-circuit-pattern.svg)

import { AvlClosedCircuit } from '@almadar/ui/illustrations';

Ever opened a modal and could not close it? That is a broken circuit. The .orb compiler makes it impossible to build one.

<!-- truncate -->

## The Problem: Users Get Stuck

A modal opens via `setIsOpen(true)`. The close button calls `setIsOpen(false)`. But if the handler has a bug, or the close button was never wired up, the user is trapped. In traditional codebases, this bug survives until someone reports it in production.

In .orb, every UI interaction must complete a full circuit: user action triggers an event, the event bus routes it to the state machine, the state machine transitions and updates the UI, and the updated UI is ready for the next action. No shortcuts, no direct state mutations.

<div style={{margin: '2rem 0'}}>
<AvlClosedCircuit
  states={[{name: "browsing"}, {name: "modalOpen"}, {name: "saving"}]}
  transitions={[
    {from: "browsing", to: "modalOpen", event: "OPEN"},
    {from: "modalOpen", to: "saving", event: "SAVE"},
    {from: "saving", to: "browsing", event: "SUCCESS"},
    {from: "modalOpen", to: "browsing", event: "CLOSE"},
    {from: "saving", to: "modalOpen", event: "ERROR"}
  ]}
  animated
/>
</div>

## How .orb Enforces the Circuit

The compiler runs a closed-circuit validator that checks three rules:

**Rule 1: Events must have transitions.** If a UI pattern includes a button with `"event": "OPEN_MODAL"`, a transition must handle that event in the current state. Otherwise:

```
Error: CIRCUIT_ORPHAN_EVENT
  Action 'Open' emits event 'OPEN_MODAL' which has no
  transition handler in the current state.
  The button will render but clicking it will do nothing.
```

**Rule 2: Overlay slots must have exits.** If a transition renders to the `modal` or `drawer` slot, another transition must exit that state and clear the overlay:

```
Error: CIRCUIT_NO_OVERLAY_EXIT
  State 'EditModal' renders to 'modal' slot but has no exit
  transition. Users will be stuck in this overlay.
  Fix: Add a transition from 'EditModal' with event 'CANCEL'
  or 'CLOSE' that includes: ["render-ui", "modal", null]
```

**Rule 3: Main slot must render.** Every state that the user can land in must render something to the main slot, or the page will be blank.

## Example: A Modal That Cannot Break

```json
{
  "states": [
    { "name": "browsing", "isInitial": true },
    { "name": "modalOpen" }
  ],
  "transitions": [
    {
      "from": "browsing",
      "to": "browsing",
      "event": "INIT",
      "effects": [
        ["render-ui", "main", {
          "type": "page-header",
          "title": "Tasks",
          "actions": [{ "label": "New Task", "event": "OPEN_MODAL" }]
        }]
      ]
    },
    {
      "from": "browsing",
      "to": "modalOpen",
      "event": "OPEN_MODAL",
      "effects": [
        ["render-ui", "modal", {
          "type": "form-section",
          "entity": "Task",
          "submitEvent": "SAVE",
          "cancelEvent": "CLOSE"
        }]
      ]
    },
    {
      "from": "modalOpen",
      "to": "browsing",
      "event": "CLOSE",
      "effects": [
        ["render-ui", "modal", null],
        ["emit", "INIT"]
      ]
    },
    {
      "from": "modalOpen",
      "to": "browsing",
      "event": "SAVE",
      "effects": [
        ["persist", "create", "Task", "@payload.data"],
        ["render-ui", "modal", null],
        ["emit", "INIT"]
      ]
    }
  ]
}
```

Three ways to exit: click Cancel (triggers `CLOSE`), click Save (triggers `SAVE`), or press Escape / click the overlay (the auto-generated modal wrapper emits `UI:CLOSE`, which the runtime routes to the `CLOSE` transition). All three paths transition back to `browsing` and clear the modal slot.

## The Slot Hierarchy

Different slots have different exit requirements:

| Slot | Exit Required? | Why |
|------|---------------|-----|
| `main` | No | This is home base |
| `sidebar` | No | Can coexist with main |
| `modal` | Yes | Blocks interaction |
| `drawer` | Yes | Blocks interaction |
| `toast` | No | Auto-dismisses |

The compiler only enforces exit transitions for overlay slots (`modal`, `drawer`) because those block the user from interacting with the rest of the application.

## Why This Matters

The closed circuit pattern turns a class of runtime bugs into compile-time errors. You cannot ship a modal without a close path. You cannot render a button that triggers nothing. You cannot leave a user on a blank page.

Remove the `CLOSE` transition from the example above and run `orbital validate`. The compiler will refuse to proceed. The circuit must be complete before code generation begins.

Traditional testing catches these bugs by running specific scenarios and hoping you covered the broken path. The .orb compiler proves the circuit is complete for every path, every time.
