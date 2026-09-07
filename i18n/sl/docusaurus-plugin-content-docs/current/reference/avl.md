---
sidebar_position: 4
title: "AVL: Almadar vizualni jezik"
---

import { AvlEntity, AvlOrbital, AvlTrait, AvlPage, AvlState, AvlTransition, AvlEvent, AvlGuard, AvlEffect, AvlField, AvlFieldType, AvlBinding, AvlPersistence, AvlOperator, AvlSExpr, AvlLiteral, AvlBindingRef, AvlStateMachine, AvlOrbitalUnit, AvlClosedCircuit, AvlEmitListen, AvlSlotMap, AvlExprTree } from '@almadar/ui/illustrations';

# AVL: Almadar vizualni jezik

AVL je formalni vizualni zapis za programe Orb. Vsak atom se izriše kot SVG element `<g>`, ki ga je mogoce sestavljati v vecje diagrame. AVL diagrami so jezikovno nevtralni: enaki v anglescini, arabscini in slovenscini.

## Strukturni primitivi

### Entiteta (Entity)

Jedro orbitalne enote. Sevajoci crte predstavljajo polja. Slog crte oznacuje vrsto obstojnosti.

| Obstojnost | Slog crte |
|------------|----------|
| `persistent` (obstojna) | Polna, debelina 2.5 |
| `runtime` (med izvajanjem) | Crtkan: `6 3` |
| `singleton` (edinec) | Dvojni rob, debelina 3.5 |
| `instance` (primerek) | Drobne crtkice: `2 3` |

### Orbital

Krozna meja, ki predstavlja orbitalno lupino, ki vsebuje entiteto, njene lastnosti in strani.

### Lastnost (Trait)

Elipticna orbita okoli jedra entitete. Vsaka lastnost je avtomat stanj, ki upravlja en vidik vedenja.

### Stran (Page)

Kvadratna oznaka na orbitalni meji. Predstavlja pot, ki poveze uporabniski vmesnik lastnosti z URL-jem.

## Vedenjski primitivi

### Stanje (State)

Zaobljen pravokotnik. Zacetno stanje ima majhno piko. Koncno stanje ima dvojni rob.

### Prehod (Transition)

Puscica med stanji. Lahko je ravna ali ukrivljena.

### Dogodek (Event)

Oblika strele. Sprozi prehod.

### Pogoj (Guard)

Pogoj, ki mora biti izpolnjen, da se prehod izvede. Prikazan kot besedilo v oglatih oklepajih: `[ime-pogoja]`.

### Ucinek (Effect)

14 vrst ucinkov, vsak z loceno ikono:

| Ucinek | Opis |
|--------|------|
| `render-ui` | Izrisi vzorec uporabniskega vmesnika |
| `set` | Nastavi vrednost polja entitete |
| `persist` | Shrani v shrambo |
| `fetch` | Nalozi iz shrambe |
| `emit` | Oddaj dogodek drugim lastnostim |
| `navigate` | Spremeni pot |
| `notify` | Prikazi obvestilo |
| `call-service` | Poklici zunanji API |
| `spawn` | Ustvari primerek entitete |
| `despawn` | Odstrani primerek entitete |
| `do` | Izvedi logiko |
| `if` | Pogojna veja |
| `log` | Zabeleži v konzolo |

## Podatkovni primitivi

### Oblike tipov polj

Vsak podatkovni tip ima loceno SVG obliko:

| Tip | Oblika |
|-----|--------|
| `string` (niz) | Krog |
| `number` (stevilo) | Trikotnik |
| `boolean` (logicna vrednost) | Kvadrat |
| `date` (datum) | Diamant |
| `enum` (naštevni tip) | Obroc |
| `object` (objekt) | Sestkotnik |
| `array` (tabela) | Stolpci |

### Vezava (Binding)

Sklicuje se na podatke iz sheme: `@entity`, `@payload`, `@state`, `@now`, `@config`, `@EntityName`.

## Izrazni primitivi

### Barve imenskih prostorov operaterjev

| Imenski prostor | Barva | Koda |
|-----------------|-------|------|
| aritmeticni (arithmetic) | Modra | `#4A90D9` |
| primerjalni (comparison) | Oranzna | `#E8913A` |
| logicni (logic) | Vijolicna | `#9B59B6` |
| nizovni (string) | Zelena | `#27AE60` |
| zbirni (collection) | Modrozelena | `#1ABC9C` |
| casovni (time) | Rumena | `#F39C12` |
| nadzorni (control) | Rdeca | `#E74C3C` |
| asinhroni (async) | Roza | `#E91E8F` |

## Sestavljeni diagrami (molekule)

### AvlStateMachine

Obroc stanj z ukrivljenimi prehodi, oznakami dogodkov, besedilom pogojev in ikonami ucinkov.

### AvlOrbitalUnit

Entiteta + lastnosti + strani v orbitalni lupini. Primarni diagram za prikaz vsebine orbitalne enote.

### AvlClosedCircuit

Zanka toka dogodkov. Prikazuje vzorec zaprte zanke.

### AvlEmitListen

Dve orbitalni enoti, povezani z oddaj/poslušaj žico. Prikazuje komunikacijo med lastnostmi.

### AvlSlotMap

Postavitev strani z imenovanimi regijami rež.

### AvlExprTree

Drevo operaterjev, literalov in sklicevanj na vezave. Vizualizira logiko izrazov.

## Uporaba v MDX

Uvozite AVL komponente v katero koli datoteko `.md` ali `.mdx`:

```jsx
import { AvlStateMachine, AvlOrbitalUnit } from '@almadar/ui/illustrations';

<AvlStateMachine
  states={[...]}
  transitions={[...]}
  animated
/>
```

## Kako brati AVL diagrame

1. **Poiščite jedro entitete** v sredini. Slog črte vam pove vrsto obstojnosti.
2. **Preštejte sevajočih črt** za število polj entitete.
3. **Sledite eliptičnim orbitam** za identifikacijo lastnosti (avtomati stanj).
4. **Poiščite kvadratne oznake** na orbitalni meji za strani (poti).
5. **Znotraj vsake lastnosti** stanja tvorijo obroč s puščicami prehodov med njimi.
6. **Oznake prehodov** prikazujejo: ime dogodka (krepko), pogoj (oglati oklepaji), ikone učinkov (spodaj).
7. **Barvno kodiranje**: barve imenskih prostorov operaterjev sledijo zgornji tabeli.
