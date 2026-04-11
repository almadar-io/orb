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

Dve stanji. Stirje prehodi. Vsako modalno okno se odpre in zapre. Vsak dogodek ima obdelovalca. Podatkovni model, poslovna logika, struktura UI in usmerjanje — vse v eni datoteki.

## Zaprta zanka

Odstranite prehod `CANCEL` in zazenite `orbital validate`:

```
Error: CIRCUIT_NO_OVERLAY_EXIT
  State 'creating' renders to 'modal' slot but has no exit transition.
  Fix: Add a transition from 'creating' with event 'CANCEL' or 'CLOSE'
```

Prevajalnik dokazuje, da je zanka popolna za vsako pot. Modalno okno, ki se ne more zapreti, ni napaka za odkritje pri testiranju — je program, ki se ne prevede.

To je temeljna oblikovalska odlocitev: ce je vase obnasanje avtomat stanj, lahko prevajalnik sklepa o njem. Ce lahko prevajalnik sklepa o njem, postanejo celotne kategorije napak nemogoc.
