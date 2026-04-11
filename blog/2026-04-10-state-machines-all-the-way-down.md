---
slug: state-machines-all-the-way-down
title: "State Machines All the Way Down"
authors: [osamah]
tags: [architecture, state-machines]
---

In Orb, every feature is a state machine. Not a component tree, not a bag of hooks — a state machine with explicit states, guarded transitions, and a closed circuit the compiler enforces before any code is generated.

<!-- truncate -->

## The Orbital Unit

An orbital is the fundamental unit: an entity (data), one or more traits (behavior), and pages (routes). A trait *is* a state machine. Every user interaction follows a closed circuit:

```
Event → Guard → Transition → Effects → UI Response → Event
```

This is not a recommendation. The compiler rejects programs where the circuit is broken.

## A Complete Example

```lolo
orbital TaskOrbital {
  entity Task [persistent: tasks] {
    id     : string!
    title  : string!
    status : string
  }

  trait TaskBrowser -> Task [interaction] {
    state browsing {
      INIT -> browsing
        (fetch Task)
        (render-ui main { type: "entity-table", entity: "Task", columns: ["title", "status"] })
      CREATE -> creating
        (render-ui modal { type: "form-section", entity: "Task", fields: ["title", "status"], submitEvent: "SAVE", cancelEvent: "CANCEL" })
    }
    state creating {
      SAVE -> browsing
        (persist create Task @payload.data)
        (render-ui modal null)
        (emit INIT)
      CANCEL -> browsing
        (render-ui modal null)
    }
  }

  page "/tasks" -> TaskBrowser
}
```

Two states. Four transitions. Every modal opens and closes. Every event has a handler. The data model, business logic, UI structure, and routing live in one file.

## The Closed Circuit

Remove the `CANCEL` transition and run `orbital validate`:

```
Error: CIRCUIT_NO_OVERLAY_EXIT
  State 'creating' renders to 'modal' slot but has no exit transition.
  Fix: Add a transition from 'creating' with event 'CANCEL' or 'CLOSE'
```

The compiler proves the circuit is complete for every path. A modal that cannot close is not a bug to find in QA — it is a program that does not compile.

This is the foundational design bet: if your behavior is a state machine, the compiler can reason about it. If the compiler can reason about it, entire categories of bugs become impossible.
