---
slug: compiler-is-the-test-suite
title: "Prevajalnik je testni nabor"
authors: [osamah]
tags: [compiler, architecture]
---

`orb validate` ne preverja samo sintakse. Hodi po grafu avtomata stanj in dokazuje lastnosti, ki bi sicer zahtevale desetine rocno napisanih testov. Zaprte zanke, pogodbe oddajanja, veljavnost vezav in zahteve lastnosti vzorcev — vse preverjeno, preden se generira kakrsnakoli koda.

<!-- truncate -->

## Kaj prevajalnik preverja

**Zaprte zanke.** Vsaka prekrivna reza (`modal`, `drawer`) mora imeti izhodno pot. Ce stanje upodobi modalno okno, a nima prehoda, ki ga pocisti, uporabnik obstane. Prevajalnik to ujame:

```
Error: CIRCUIT_NO_OVERLAY_EXIT
  State 'editing' renders to 'modal' slot but has no exit transition.
  Fix: Add a transition from 'editing' with event 'CANCEL' or 'CLOSE'
```

**Popolnost izhoda modalnega okna.** Ko prehod zapre modalno okno, mora tudi ponovno upodobiti glavno rezo — sicer uporabnik vidi zastarelo vsebino pod njim:

```
Warning: CIRCUIT_MODAL_EXIT_INCOMPLETE
  Transition editing --[SAVE]--> browsing closes modal but doesn't re-render main slot.
  Fix: Add render-ui("main", {...}) alongside render-ui("modal", null)
```

**Zahteve lastnosti vzorcev.** Vsak klic `render-ui` se preveri glede na register vzorcev. Zahtevane lastnosti morajo biti prisotne:

```
Error: ORB_RUI_MISSING_REQUIRED_PROP
  Pattern 'data-list' requires prop 'fields' but it is not provided
  Fix: Add 'fields' to the render-ui config for 'data-list'
```

**Veljavnost vezav.** Vsaka referenca `@entity.field` se preveri glede na shemo entitete:

```
Error: ORB_BINDING_ENTITY_FIELD_UNDECLARED
  '@entity.prce' does not exist on entity 'Product'.
```

## Konkreten primer

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

Zazenite `orb validate` in prevajalnik preveri: modalno okno v `editing` ima dva izhoda (`SAVE`, `CANCEL`), oba izhoda ponovno upodobita glavno rezo, vsak `data-list` ima zahtevano lastnost `fields`, vsaka vezava `@entity.*` se razresi, in zanka od `browsing` skozi `editing` in nazaj je popolna.

## Kaj to nadomesti

Tradicionalno testiranje ujame te napake z izvajanjem specificnih scenarijev in upanjem, da ste pokrili pokvarjeno pot. Prevajalnik dokazuje pravilnost za vsako pot, vsakic. Brez testne datoteke za pisanje. Brez pokritosti za merjenje. Avtomat stanj *je* specifikacija in prevajalnik potrdi, da je specifikacija zdrava.
