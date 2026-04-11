---
slug: state-machines-all-the-way-down
title: "Avtomati stanj do samega dna"
authors: [osamah]
tags: [architecture, state-machines]
---

V Orb-u je vsaka funkcionalnost avtomat stanj. Ne drevo komponent, ne zbirka hookov — avtomat stanj z eksplicitnimi stanji, varovanimi prehodi in zaprto zanko, ki jo prevajalnik uveljavlja, preden se generira kakršnakoli koda.

<!-- truncate -->

## Orbitalna enota

Orbital je osnovna enota: entiteta (podatki), ena ali vec lastnosti (obnasanje) in strani (poti). Lastnost *je* avtomat stanj. Vsaka uporabniska interakcija sledi zaprti zanki:

```
Dogodek → Varovalka → Prehod → Ucinki → Odziv UI → Dogodek
```

To ni priporocilo. Prevajalnik zavrne programe, kjer je zanka prekinjena.

## Celoten primer

```lolo
orbital TaskOrbital {
  entity Task [runtime] {
    id     : string
    title  : string
    status : string
  }

  trait TaskBrowser -> Task [interaction] {
    initial: browsing
    state browsing {
      INIT -> browsing
        (fetch Task)
        (render-ui main { type: "stack", direction: "vertical", gap: "lg", children: [{ type: "typography", content: "Tasks", variant: "h2" }, { type: "button", label: "New Task", event: "CREATE", variant: "primary" }, { type: "divider" }, { type: "data-list", entity: "Task", fields: ["title", "status"] }] })
      CREATE -> creating
        (render-ui modal { type: "stack", direction: "vertical", gap: "md", children: [{ type: "typography", content: "New Task", variant: "h3" }, { type: "input", label: "Title", placeholder: "Enter title" }, { type: "stack", direction: "horizontal", gap: "md", children: [{ type: "button", label: "Save", event: "SAVE", variant: "primary" }, { type: "button", label: "Cancel", event: "CANCEL", variant: "secondary" }] }] })
    }
    state creating {
      SAVE -> browsing
        (render-ui modal null)
        (fetch Task)
        (render-ui main { type: "stack", direction: "vertical", gap: "lg", children: [{ type: "typography", content: "Tasks", variant: "h2" }, { type: "divider" }, { type: "data-list", entity: "Task", fields: ["title", "status"] }] })
      CANCEL -> browsing
        (render-ui modal null)
        (render-ui main { type: "stack", direction: "vertical", gap: "lg", children: [{ type: "typography", content: "Tasks", variant: "h2" }, { type: "divider" }, { type: "data-list", entity: "Task", fields: ["title", "status"] }] })
    }
  }

  page "/tasks" -> TaskBrowser
}
```

Dve stanji. Stirje prehodi. Vsako modalno okno se odpre in zapre. Vsak dogodek ima obdelovalca. Podatkovni model, poslovna logika, struktura UI in usmerjanje — vse v eni datoteki.

## Zaprta zanka

Odstranite prehod `CANCEL` in zazenite `orb validate`:

```
Error: CIRCUIT_NO_OVERLAY_EXIT
  State 'creating' renders to 'modal' slot but has no exit transition.
  Fix: Add a transition from 'creating' with event 'CANCEL' or 'CLOSE'
```

Prevajalnik dokazuje, da je zanka popolna za vsako pot. Modalno okno, ki se ne more zapreti, ni napaka za odkritje pri testiranju — je program, ki se ne prevede.

To je temeljna oblikovalska odlocitev: ce je vase obnasanje avtomat stanj, lahko prevajalnik sklepa o njem. Ce lahko prevajalnik sklepa o njem, postanejo celotne kategorije napak nemogoc.
