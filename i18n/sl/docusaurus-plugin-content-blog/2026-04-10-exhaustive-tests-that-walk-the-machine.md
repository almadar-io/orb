---
slug: exhaustive-tests-that-walk-the-machine
title: "Izcrpni testi, ki hodijo po avtomatu"
authors: [osamah]
tags: [compiler, state-machines]
---

`orbital validate` dokazuje strukturne lastnosti. `orbital test` gre dalje — hodi po vsaki povezavi vsakega avtomata stanj, sprozi vsak dogodek iz vsakega stanja in preveri, da varovalke pravilno blokirajo in prepuscajo. Ne napisete nobene testne kode. Graf je testni nacrt.

<!-- truncate -->

## Stiri kategorije testov

Prevajalnik ze pozna vsako stanje, vsak prehod in vsako varovalko. `orbital test` uporablja ta graf za samodejno generiranje testov:

1. **Matrika prehodov** — sprozi vsak veljaven par `(stanje, dogodek)`, potrdi ciljno stanje.
2. **Uveljavljanje varoval** — za vsak varovan prehod sintetizira podatke, ki zadoscijo varovalki (mora uspeti), in prazne podatke (mora blokirati).
3. **Neveljavni prehodi** — sprozi vsak dogodek, ki *nima* obdelovalca v danem stanju, potrdi, da avtomat ostane na mestu.
4. **Potovanje** — BFS obhod, ki obisce vsako dosegljivo stanje v eni poti, s cimer dokazuje, da je graf povezan.

Vsak test vkljucuje `setup_path`: najkrajso pot od zacetnega stanja do zacetnega stanja testa. Brez rocnih priprav — avtomat sam hodi do tja.

## Delovni primer

```lolo
orbital OrderOrbital {
  entity Order [persistent: orders] {
    id     : string!
    status : string
    amount : int
  }

  trait OrderLifecycle -> Order [interaction] {
    state pending {
      APPROVE -> approved
        when (>= @entity.amount 0)
        (set @status "approved")
      CANCEL -> cancelled
        (set @status "cancelled")
    }
    state approved {
      SHIP -> shipped
        (set @status "shipped")
    }
    state shipped {
      DELIVER -> delivered
        (set @status "delivered")
    }
    state delivered {}
    state cancelled {}
  }
}
```

Pet stanj. Ena varovalka. Zazenite `orbital test`:

```
$ orbital test order.lolo --execute

Trait: OrderLifecycle
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  transition (4 tests):
    ✓ pending + APPROVE → approved
    ✓ pending + CANCEL → cancelled
    ✓ approved + SHIP → shipped
    ✓ shipped + DELIVER → delivered

  guard_block (1 test):
    ✓ guard blocks APPROVE (invalid payload)

  guard_allow (1 test):
    ✓ guard allows APPROVE (valid payload)

  invalid (6 tests):
    ✓ approved + CANCEL (invalid)
    ✓ shipped + APPROVE (invalid)
    ✓ delivered + SHIP (invalid)
    ✓ delivered + APPROVE (invalid)
    ✓ cancelled + APPROVE (invalid)
    ✓ cancelled + SHIP (invalid)

  journey (1 test):
    ✓ full journey: APPROVE → SHIP → DELIVER

Total: 1 trait, 13 test cases — 13 passed, 0 failed
```

## Kako delujejo testi varoval

Prehod `APPROVE` ima varovalko: `(>= @entity.amount 0)`. Generator testov prebere S-izraz, vidi `@entity.amount` primerjan z `>=` z `0` in sintetizira dva primera:

- **Varovalka blokira:** prazni podatki entitete, brez polja `amount` — varovalka se ovrednoti kot neresnicna, avtomat ostane v `pending`.
- **Varovalka prepusti:** podatki entitete z `amount: 0` — varovalka uspe, avtomat preide v `approved`.

To deluje za vsak izraz varovalke: preverjanja enakosti, primerjave, sestave `and`/`or`, vezave podatkov. Generator hodi po drevesu izrazov in proizvede minimalne zadoscujoce (in krsece) vhode.

## Oblikovalska tocka

Dodajte stanje v `OrderLifecycle` in stevilo testov samodejno naraste. Odstranite prehod in testi neveljavnih prehodov se prilagodijo. Testni nabor je funkcija avtomata stanj — ne locen artefakt, ki se razhaja s sinhronizacijo.

`--execute` zazene vse primere brez glave proti pravemu izvajalnemu okolju avtomata stanj. Brez brskalnika, brez imitacij, brez testnega pogonjalnika za konfiguracijo.
