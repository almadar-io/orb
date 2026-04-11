---
slug: compiler-is-the-test-suite
title: "Prevajalnik je testni nabor"
authors: [osamah]
tags: [compiler, architecture]
---

`orbital validate` ne preverja samo sintakse. Hodi po grafu avtomata stanj in dokazuje lastnosti, ki bi sicer zahtevale desetine rocno napisanih testov. Zaprte zanke, pogodbe oddajanja, veljavnost vezav in arnost operatorjev — vse preverjeno, preden se generira kakrsnakoli koda.

<!-- truncate -->

## Kaj prevajalnik preverja

**Zaprte zanke.** Vsaka prekrivna reza (`modal`, `drawer`) mora imeti izhodno pot. Ce stanje upodobi modalno okno, a nima prehoda, ki ga pocisti, uporabnik obstane. Prevajalnik to ujame:

```
Error: CIRCUIT_NO_OVERLAY_EXIT
  State 'EditModal' renders to 'modal' slot but has no exit transition.
  Fix: Add a transition from 'EditModal' with event 'CANCEL' or 'CLOSE'
```

**Pogodbe oddajanja.** Vsaka deklaracija `emits` mora imeti ujemajoc `listens` nekje. Brez osirotelih dogodkov:

```
Error: ORB_X_ORPHAN_EMIT
  Trait 'OrderTrait' emits 'ORDER_COMPLETED' but no trait
  has a matching 'listens' declaration.
```

**Veljavnost vezav.** Vsaka referenca `@entity.field` se preveri glede na shemo entitete:

```
Error: BINDING_INVALID
  '@entity.prce' does not exist on entity 'Product'.
  Did you mean '@entity.price'?
```

**Veljavnost operatorjev.** S-izrazi se preverijo za obstoj operatorja in arnost. `(set @status)` z manjkajocim argumentom vrednosti je napaka prevajanja, ne presenecenje ob zagonu.

## Konkreten primer

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

Zazenite `orbital validate` in prevajalnik preveri: modalno okno v `editing` ima dva izhoda (`SAVE`, `CANCEL`), vsaka vezava `@payload.data` se razresi, vsak `render-ui` kaze na znan vzorec in zanka od `browsing` skozi `editing` in nazaj je popolna.

## Kaj to nadomesti

Tradicionalno testiranje ujame te napake z izvajanjem specificnih scenarijev in upanjem, da ste pokrili pokvarjeno pot. Prevajalnik dokazuje pravilnost za vsako pot, vsakic. Brez testne datoteke za pisanje. Brez pokritosti za merjenje. Avtomat stanj *je* specifikacija in prevajalnik potrdi, da je specifikacija zdrava.
