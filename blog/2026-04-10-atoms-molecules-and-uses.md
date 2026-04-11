---
slug: atoms-molecules-and-uses
title: "Atoms, Molecules, and the uses System"
authors: [osamah]
tags: [architecture, composition]
---

Orb follows atomic design for behavior, not just UI. Standard behaviors are atoms — small state machines that own their topology. Your application composes them into molecules using `uses` imports and an override surface. The atom's states and transitions stay constant. You rebind the data, rename the events, and replace the effects.

<!-- truncate -->

## Atoms Own Topology

A standard behavior like `std-modal` defines a complete state machine: idle → open → saving → idle, with cancel and error paths. This topology is fixed. No molecule can add or remove states from it.

What molecules *can* override:

| Field | Effect |
|---|---|
| `linkedEntity` | Rebinds the trait to your entity |
| `events` | Renames events (`OPEN` → `ADD_ITEM`) |
| `effects` | Replaces effect arrays per event |
| `emitsScope` | Sets `internal` or `external` |

## Composition in Practice

```lolo
orbital InventoryOrbital {
  uses Modal from "std/behaviors/std-modal"
  uses Browse from "std/behaviors/std-browse"

  entity Item [persistent] {
    id   : string!
    name : string
    sku  : string
  }

  trait ItemBrowse = Browse.traits.BrowseItemBrowse -> Item {
    on INIT {
      (ref Item)
      (render-ui main { type: "data-grid", entity: "Item" })
    }
  }

  trait ItemAdd = Modal.traits.ModalRecordModal -> Item {
    events { OPEN: ADD_ITEM }
    on ADD_ITEM {
      (fetch Item)
      (render-ui modal { type: "form-section", entity: "Item", mode: "create" })
    }
    on SAVE {
      (persist create Item @payload.data)
      (render-ui modal null)
    }
  }

  page "/inventory" = Modal.pages.ModalRecordModalPage -> ItemBrowse, ItemAdd
}
```

`Modal` owns the open/save/cancel state machine. `ItemAdd` rebinds the entity to `Item`, renames `OPEN` to `ADD_ITEM`, and overrides the effects for `ADD_ITEM` and `SAVE`. The modal's topology — its states and transitions — is untouched.

## The Emit/Listen Contract

Cross-orbital communication uses `emits` and `listens`. A trait declares what events it emits. Another trait declares what it listens for. The compiler verifies every emitted event has at least one listener:

```
Error: ORB_X_ORPHAN_EMIT
  Trait 'ItemAdd' emits 'ITEM_CREATED' but no trait
  has a matching 'listens' declaration.
```

No fire-and-forget events. No messages published to a queue with no consumer. The wiring is verified at compile time.

## Why Topology Stays Constant

If a molecule needs a transition the atom does not have, the atom is incomplete. Fix the atom, not the molecule. This constraint keeps composition predictable: you always know what states exist by reading the atom. The molecule only controls what happens *within* those states — not which states exist.
