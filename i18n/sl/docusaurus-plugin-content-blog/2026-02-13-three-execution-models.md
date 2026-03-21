---
slug: three-execution-models
title: "Trije izvedbeni modeli, ena resnica: Kako smo rešili problem 'Napiši enkrat, zaženi povsod'"
authors: [osamah]
tags: [architecture]
image: /img/blog/three-execution-models.png
---

![Trije izvedbeni modeli, ena resnica](/img/blog/three-execution-models.png)

Ista `.orb` datoteka se izvaja v browserju, na serverju in se prevede v native kodo. Tukaj je razlaga.

Java je obljubila "napiši enkrat, zaženi povsod." Mi dostavljamo "napiši enkrat, zaženi *povsod primerno*."

<!-- truncate -->

## Oblačilo in neuspeh WORA

Leta 1995 je Java obljubila: *"Napiši enkrat, zaženi povsod."*

Realnost: *"Napiši enkrat, debuggaj povsod."*

Problem? Različna okolja potrebujejo različne kompromise:
- **IDE/Razvoj** — Potrebuje hitro iteracijo, interpretirano
- **Produkcijski Web** — Potrebuje performanco, prevedeno
- **Desktop/Mobilno** — Potrebuje native, povezano

Ena velikost ne ustreza vsem.

## Almadarjeva rešitev: Trije izvedbeni modeli

Iz ene same `.orb` sheme Almadar podpira tri izvedbene modele:

```
.orb Schema
     │
     ├─────────────────┬─────────────────┐
     │                 │                 │
     ▼                 ▼                 ▼
TypeScript      Rust Runtime      Generated Code
Runtime         (Native)          (Compiled)
(Interpreted)                     (Production)
```

Vsak je optimiziran za svoje okolje.

## Model 1: TypeScript Runtime

**Najboljše za:** Razvoj, IDE, hitra iteracija

```bash
# Zaženi razvojni server z live reload
almadar dev task-app.orb

# Odpre browser na localhost:3000
# Spremembe sheme se samodejno naložijo
```

**Značilnosti:**
- ⚡ Hiter zagon
- 🔄 Hot reload
- 🐛 Debugabilno
- 🌐 Browser/Node kompatibilno

**Use Cases:**
- Builder IDE preview
- Razvojno okolje
- Testiranje in debugging
- Izobraževalni demo

## Model 2: Rust Runtime

**Najboljše za:** Native aplikacije, CLI orodja, visoka performansa

```bash
# Prevedi v native Rust binary
almadar compile task-app.orb --shell rust -o native/

# Zgradi in poženi native aplikacijo
cd native && cargo build --release && ./target/release/task-app
```

Almadar compiler generira popoln Rust projekt z Axum za backend in egui za UI. Rezultat je samostojna native aplikacija — brez runtime odvisnosti, brez Node.js.

**Značilnosti:**
- 🚀 Native performanca
- 📦 Majhni binaryji
- 🔒 Memory safe
- 🖥️ Cross-platform

**Use Cases:**
- Desktop aplikacije
- CLI orodja
- Embedded sistemi
- Game clients

## Model 3: Generirana koda

**Najboljše za:** Produkcijski deployment, custom integracija

```bash
# Generiraj TypeScript
orbital compile app.orb --shell typescript -o output/

# Generiraj Python
orbital compile app.orb --shell python -o output/

# Generiraj Rust
orbital compile app.orb --shell rust -o output/
```

**Značilnosti:**
- 🎯 Optimizirano za cilj
- 🔧 Popolnoma prilagodljivo
- 📚 Berljiv output
- 🏭 Production-ready

**Use Cases:**
- Produkcijske web aplikacije
- Mikroservisi
- Mobilne aplikacije (preko React Native)
- Custom integracije

## OIR: Orbital Intermediate Representation

Kako ena shema postane tri izvedljive datoteke?

Skrivnost je **OIR** — Orbital Intermediate Representation:

```
.orb Schema
    │
    ▼
Parse → Validate → Enrich → Inline → Resolve
    │
    ▼
┌─────────────────────────────────────┐
│         OIR (Orbital IR)            │
│  - Resolved entities                │
│  - Normalized traits                │
│  - Flattened pages                  │
│  - Validated state machines         │
└─────────────────────────────────────┘
    │
    ├──────────────┬──────────────┐
    ▼              ▼              ▼
TS Runtime    Rust Runtime    Code Generator
```

OIR je **Rosetta Stone** — skupni format, ki ga vse cilje razumejo.

## Primer: Task App čez vse modele

### Shema

```json
{
  "name": "TaskApp",
  "orbitals": [{
    "name": "TaskManagement",
    "entity": {
      "name": "Task",
      "fields": [
        { "name": "title", "type": "string" },
        { "name": "status", "type": "enum", "values": ["todo", "done"] }
      ]
    },
    "traits": [{
      "name": "TaskBrowser",
      "linkedEntity": "Task",
      "stateMachine": {
        "states": [{ "name": "browsing", "isInitial": true }],
        "transitions": [{
          "from": "browsing",
          "to": "browsing",
          "event": "INIT",
          "effects": [
            ["render-ui", "main", { "type": "entity-table", "entity": "Task" }]
          ]
        }]
      }
    }],
    "pages": [{ "name": "TasksPage", "path": "/tasks" }]
  }]
}
```

### Model 1: TypeScript Runtime

```bash
# Zaženi razvojni server — shema se interpretira neposredno
almadar dev task-app.orb

# State machine teče v pomnilniku
# UI renderira preko React komponent
# Dogodki obdelani z EventBus
```

### Model 2: Rust Runtime

```bash
# Prevedi v samostojni native binary
almadar compile task-app.orb --shell rust -o native/
cd native && cargo build --release

# State machine teče kot native koda
# UI preko egui (immediate mode)
# Dogodki preko Rust kanalov
```

### Model 3: Generiran TypeScript

```typescript
// Generirana struktura kode:
src/
├── components/
│   └── TaskTable.tsx      // entity-table vzorec
├── pages/
│   └── TasksPage.tsx      // Route + trait binding
├── state/
│   └── TaskBrowser.ts     // State machine
├── types/
│   └── Task.ts            // Entity types
└── App.tsx                // Main app
```

Poženi:
```bash
cd output && npm install && npm run dev
```

## Kdaj uporabiti katerega

| Scenarij | Runtime | Zakaj |
|----------|---------|-----|
| IDE/Preview | TypeScript | Hitra iteracija |
| Razvoj | TypeScript | Hot reload |
| Testiranje | TypeScript | Hiter feedback |
| Desktop App | Rust | Native performanca |
| CLI Tool | Rust | Majhen, hiter binary |
| Igra | Rust | Real-time performanca |
| Web Produkcija | Generiran TS | Optimiziran bundle |
| API Backend | Generiran Python | FastAPI integracija |
| Mikroservis | Generiran Rust | Axum performanca |

## Build Pipeline

```bash
# Razvoj
orbital dev task-app.orb          # TypeScript Runtime

# Prevedi v Rust (Native)
orbital compile task-app.orb --shell rust -o native/  # Rust Runtime

# Produkcijski build
orbital compile task-app.orb --shell typescript -o prod/
orbital compile task-app.orb --shell python -o api/
orbital compile task-app.orb --shell rust -o native/
```

## Primerjava iz resničnega sveta: LLVM

LLVM (Low Level Virtual Machine) počne za sistemske jezike, kar Almadar počne za aplikacije:

**LLVM:**
- C/C++/Rust → LLVM IR → x86/ARM/WASM

**Almadar:**
- .orb Schema → OIR → TypeScript/Rust/Generated

Intermediate representation loči vir od cilja.

## Koristi te arhitekture

### Za razvijalce
- ✅ Ena shema, več ciljev
- ✅ Brez podvajanja kode
- ✅ Konsistentno vedênje čez platforme
- ✅ Enostavno preklapljanje ciljev

### Za ekipe
- ✅ Frontend in backend iz istega vira
- ✅ Mobilno in web iz istega vira
- ✅ Ni razhajanja med implementacijami
- ✅ Skupno razumevanje

### Za posel
- ✅ Hitrejši čas do trga
- ✅ Nižji stroški vzdrževanja
- ✅ Fleksibilnost platforme
- ✅ Pripravljenost na prihodnost

## Primerjava: Tradicionalno vs Almadar

### Tradicionalni pristop

```
Web App (React)     Mobile (React Native)    API (Node.js)
     │                      │                      │
     ▼                      ▼                      ▼
  Redux store         Different Redux        Different logic
  Component A         Component A'           Endpoint A
  Component B         Component B'           Endpoint B
  API client          API client             Controllers
     │                      │                      │
     └──────────────────────┼──────────────────────┘
                            │
                     Tri implementacije
                     iste logike
```

**Problemi:**
- ❌ Podvajanje kode
- ❌ Logic drift
- ❌ Trojno vzdrževanje
- ❌ Inkonsistentno vedênje

### Almadar pristop

```
                    .orb Schema
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    TypeScript        Rust            Generated
    Runtime (IDE)     Runtime         Code (Prod)
    (Preview)         (Desktop)       (Web/Mobile/API)
         │               │               │
         └───────────────┴───────────────┘
                            │
                     One source of truth
                     Three execution models
```

**Koristi:**
- ✅ Enotna shema
- ✅ Brez razhajanja
- ✅ Eno vzdrževalno mesto
- ✅ Zagotovljena konsistenca

## Poskusite: Multi-Target App

Ustvarite `multi-target.orb`:

```json
{
  "name": "MultiTargetApp",
  "orbitals": [{
    "name": "Counter",
    "entity": {
      "name": "Counter",
      "fields": [
      { "name": "count", "type": "number", "default": 0 }
      ]
    },
    "traits": [{
      "name": "CounterTrait",
      "linkedEntity": "Counter",
      "stateMachine": {
        "states": [{ "name": "counting", "isInitial": true }],
        "events": [
          { "key": "INIT", "name": "Initialize" },
          { "key": "INCREMENT", "name": "Increment" },
          { "key": "DECREMENT", "name": "Decrement" }
        ],
        "transitions": [
          {
            "from": "counting",
            "to": "counting",
            "event": "INIT",
            "effects": [
              ["render-ui", "main", {
                "type": "page-header",
                "title": "Counter: {{@entity.count}}",
                "actions": [
                  { "label": "+", "event": "INCREMENT" },
                  { "label": "-", "event": "DECREMENT" }
                ]
              }]
            ]
          },
          {
            "from": "counting",
            "to": "counting",
            "event": "INCREMENT",
            "effects": [
              ["set", "@entity.count", ["+", "@entity.count", 1]],
              ["emit", "INIT"]
            ]
          },
          {
            "from": "counting",
            "to": "counting",
            "event": "DECREMENT",
            "effects": [
              ["set", "@entity.count", ["-", "@entity.count", 1]],
              ["emit", "INIT"]
            ]
          }
        ]
      }
    }],
    "pages": [{ "name": "CounterPage", "path": "/" }]
  }]
}
```

Poženi na tri načine:

```bash
# 1. TypeScript Runtime (Razvoj)
orbital dev multi-target.orb

# 2. Rust Runtime (Native)
orbital compile multi-target.orb --shell rust -o counter-native/

# 3. Generiran TypeScript (Produkcija)
orbital compile multi-target.orb --shell typescript -o counter-web/
cd counter-web && npm install && npm run dev
```

Ista shema. Trije različni izvodi.

## Spoznanje

Javino "napiši enkrat, zaženi povsod" je poskušalo vsiliti en izvedbeni model vsakemu okolju.

Almadarjevo "napiši enkrat, zaženi povsod primerno" prepozna, da:
- Razvoj potrebuje hitrost
- Produkcija potrebuje optimizacijo
- Native potrebuje performanco

Ena shema. Trije modeli. Pravo orodje za pravo delo.

Ker cilj ni teči povsod — je teči **dobro** povsod.

Več o [Getting Started](https://orb.almadar.io/docs/getting-started/introduction).
