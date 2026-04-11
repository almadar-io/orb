---
slug: atoms-molecules-and-uses
title: "Atomi, molekule in sistem uses"
authors: [osamah]
tags: [architecture, composition]
---

Orb sledi atomskemu oblikovanju za obnasanje, ne samo za UI. Standardna obnasanja so atomi — majhni avtomati stanj, ki imajo svojo topologijo. Vasa aplikacija jih sestavlja v molekule z uporabo uvozov `uses` in povozne povrsine. Stanja in prehodi atoma ostanejo nespremenjeni. Vi prevezete podatke, preimenujete dogodke in zamenjate ucinke.

<!-- truncate -->

## Atomi imajo topologijo

Standardno obnasanje, kot je `std-modal`, definira celoten avtomat stanj: zaprto → odprto → zaprto, s potmi za shranjevanje in preklic. Ta topologija je fiksna. Nobena molekula ne more dodati ali odstraniti stanj iz nje.

Kaj molekule *lahko* povozijo:

| Polje | Ucinek |
|---|---|
| `linkedEntity` | Preverze lastnost na vaso entiteto |
| `events` | Preimenuje dogodke (`OPEN` → `ADD_ITEM`) |
| `on EVENT { ... }` | Zamenja ucinke za posamezen dogodek |
| `emitsScope` | Nastavi `internal` ali `external` |

## Sestavljanje v praksi

```lolo
orbital InventoryOrbital {
  uses Modal from "std/behaviors/std-modal"
  uses Browse from "std/behaviors/std-browse"

  entity Item [runtime] {
    id   : string
    name : string
    sku  : string
  }

  trait ItemBrowse = Browse.traits.BrowseItemBrowse -> Item {
    on INIT {
      (ref Item)
      (render-ui main { type: "stack", direction: "vertical", gap: "lg", children: [{ type: "typography", content: "Inventory", variant: "h2" }, { type: "divider" }, { type: "data-list", entity: "Item", fields: ["name", "sku"] }] })
    }
  }

  trait ItemAdd = Modal.traits.ModalRecordModal -> Item {
    events { OPEN: ADD_ITEM }
    on ADD_ITEM {
      (fetch Item)
      (render-ui modal { type: "stack", direction: "vertical", gap: "md", children: [{ type: "typography", content: "New Item", variant: "h3" }, { type: "input", label: "Name" }, { type: "button", label: "Save", event: "SAVE", variant: "primary" }] })
    }
    on SAVE {
      (render-ui modal null)
      (render-ui main { type: "stack", direction: "vertical", gap: "lg", children: [{ type: "typography", content: "Inventory", variant: "h2" }, { type: "divider" }, { type: "data-list", entity: "Item", fields: ["name", "sku"] }] })
    }
    emitsScope internal
  }

  page "/inventory" -> ItemBrowse, ItemAdd
}
```

`Modal` ima avtomat stanj za odpiranje/shranjevanje/preklic. `ItemAdd` preverze entiteto na `Item`, preimenuje `OPEN` v `ADD_ITEM` in zamenja ucinke za `ADD_ITEM` in `SAVE`. Topologija modalnega okna — njegova stanja in prehodi — je nedotaknjena.

## Pogodba oddajanja/poslusanja

Komunikacija med orbitalnimi enotami uporablja `emits` in `listens`. Lastnost deklarira, katere dogodke oddaja. Druga lastnost deklarira, kaj poslusa. Prevajalnik preveri, da ima vsak oddan dogodek vsaj enega poslusavca:

```
Error: ORB_X_ORPHAN_EMIT
  Trait 'ItemAdd' emits 'ITEM_CREATED' but no trait
  has a matching 'listens' declaration.
```

Nobenih dogodkov brez potrosnika. Nobenih sporocil, objavljenih v vrsto brez bralca. Povezovanje je preverjeno ob prevajanju.

## Zakaj topologija ostane nespremenjena

Ce molekula potrebuje prehod, ki ga atom nima, je atom nepopoln. Popravite atom, ne molekule. Ta omejitev naredi sestavljanje predvidljivo: vedno veste, katera stanja obstajajo, z branjem atoma. Molekula nadzoruje samo, kaj se zgodi *znotraj* teh stanj — ne katera stanja obstajajo.
