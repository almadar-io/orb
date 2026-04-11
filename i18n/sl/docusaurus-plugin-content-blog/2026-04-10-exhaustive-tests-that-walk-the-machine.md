---
slug: exhaustive-tests-that-walk-the-machine
title: "Izcrpni testi, ki hodijo po avtomatu"
authors: [osamah]
tags: [compiler, state-machines]
---

`orb validate` dokazuje strukturne lastnosti. `orb test` gre dalje — hodi po vsaki povezavi vsakega avtomata stanj, sprozi vsak dogodek iz vsakega stanja in preveri, da varovalke pravilno blokirajo in prepuscajo. Ne napisete nobene testne kode. Graf je testni nacrt.

<!-- truncate -->

## Stiri kategorije testov

Prevajalnik ze pozna vsako stanje, vsak prehod in vsako varovalko. `orb test` uporablja ta graf za samodejno generiranje testov:

1. **Matrika prehodov** — sprozi vsak veljaven par `(stanje, dogodek)`, potrdi ciljno stanje.
2. **Uveljavljanje varoval** — za vsak varovan prehod sintetizira podatke, ki zadoscijo varovalki (mora uspeti), in prazne podatke (mora blokirati).
3. **Neveljavni prehodi** — sprozi vsak dogodek, ki *nima* obdelovalca v danem stanju, potrdi, da avtomat ostane na mestu.
4. **Potovanje** — BFS obhod, ki obisce vsako dosegljivo stanje v eni poti, s cimer dokazuje, da je graf povezan.

Vsak test vkljucuje `setup_path`: najkrajso pot od zacetnega stanja do zacetnega stanja testa. Brez rocnih priprav — avtomat sam hodi do tja.

## Delovni primer

```lolo
orbital OrderOrbital {
  entity Order [runtime] {
    id     : string
    status : string
    amount : number
  }

  trait OrderLifecycle -> Order [interaction] {
    initial: pending
    state pending {
      INIT -> pending
        (fetch Order)
        (render-ui main { type: "stack", direction: "vertical", gap: "md", children: [{ type: "typography", content: "Order", variant: "h2" }, { type: "typography", content: "@entity.status", variant: "body" }, { type: "button", label: "Approve", event: "APPROVE", variant: "primary" }, { type: "button", label: "Cancel", event: "CANCEL", variant: "secondary" }] })
      APPROVE -> approved when (>= @entity.amount 0)
        (set @status "approved")
        (render-ui main { type: "stack", direction: "vertical", gap: "md", children: [{ type: "typography", content: "Approved", variant: "h2" }, { type: "button", label: "Ship", event: "SHIP", variant: "primary" }] })
      CANCEL -> cancelled
        (set @status "cancelled")
        (render-ui main { type: "stack", direction: "vertical", gap: "md", children: [{ type: "typography", content: "Cancelled", variant: "h2" }] })
    }
    state approved {
      SHIP -> shipped
        (set @status "shipped")
        (render-ui main { type: "stack", direction: "vertical", gap: "md", children: [{ type: "typography", content: "Shipped", variant: "h2" }, { type: "button", label: "Deliver", event: "DELIVER", variant: "primary" }] })
    }
    state shipped {
      DELIVER -> delivered
        (set @status "delivered")
        (render-ui main { type: "stack", direction: "vertical", gap: "md", children: [{ type: "typography", content: "Delivered", variant: "h2" }] })
    }
    state delivered {
    }
    state cancelled {
    }
  }

  page "/order" -> OrderLifecycle
}
```

Pet stanj. Ena varovalka na `APPROVE`. Zazenite `orb test`:

```
$ orb test order.lolo --execute

Trait: OrderLifecycle
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  transition (5 tests):
    ✓ pending + INIT → pending
    ✓ pending + APPROVE → approved
    ✓ pending + CANCEL → cancelled
    ✓ approved + SHIP → shipped
    ✓ shipped + DELIVER → delivered

  guard_block (1 test):
    ✓ guard blocks APPROVE (invalid payload)

  guard_allow (1 test):
    ✓ guard allows APPROVE (valid payload)

  invalid (invalid pairs):
    ✓ approved + CANCEL (stays in approved)
    ✓ shipped + APPROVE (stays in shipped)
    ...

  journey (1 test):
    ✓ full journey: APPROVE → SHIP → DELIVER

Total: 1 trait — all tests passed
```

## Kako delujejo testi varoval

Prehod `APPROVE` ima varovalko: `(>= @entity.amount 0)`. Generator testov prebere S-izraz, vidi `@entity.amount` primerjan z `>=` z `0` in sintetizira dva primera:

- **Varovalka blokira:** prazni podatki entitete, brez polja `amount` — varovalka se ovrednoti kot neresnicna, avtomat ostane v `pending`.
- **Varovalka prepusti:** podatki entitete z `amount: 0` — varovalka uspe, avtomat preide v `approved`.

To deluje za vsak izraz varovalke: preverjanja enakosti, primerjave, sestave `and`/`or`, vezave podatkov. Generator hodi po drevesu izrazov in proizvede minimalne zadoscujoce (in krsece) vhode.

## Oblikovalska tocka

Dodajte stanje v `OrderLifecycle` in stevilo testov samodejno naraste. Odstranite prehod in testi neveljavnih prehodov se prilagodijo. Testni nabor je funkcija avtomata stanj — ne locen artefakt, ki se razhaja s sinhronizacijo.

`--execute` zazene vse primere brez glave proti pravemu izvajalnemu okolju avtomata stanj. Brez brskalnika, brez imitacij, brez testnega pogonjalnika za konfiguracijo.
