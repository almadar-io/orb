---
slug: one-schema-six-apps
title: "Ena shema, pet aplikacij: Kako smo zgradili vladno orodje, AI platformo in dve igri z istim jezikom"
authors: [almadar]
tags: [case-study, architecture]
---

Vladni inšpekcijski sistem. Platforma za učenje z AI. Osebni sledilnik fitnesa. Taktična strateška igra. 3D dungeon crawler.

Pet aplikacij. Pet popolnoma različnih domen. En jezik.

Tukaj je razlaga — in zakaj je to pomembno.

<!-- truncate -->

## Trditev

Vsak programski jezik trdi, da je "general purpose." Ampak kdaj ste nazadnje uporabili isti framework za gradnjo igre *in* vladnega compliance orodja?

Almadarjeva Orbital architecture je po zasnovi domain-agnostična. Orbital je: Entity + Traits + Pages. Ta formula deluje za katero koli domeno, ker modelira **vedênje**, ne **tehnologijo**.

Prehodimo vseh pet — in tokrat vam pokažemo dejanski schema kode.

## Kako deluje Orbital Schema

Preden se poglobimo v pet aplikacij, je tu hiter pregled, kaj boste videli v kodi. Vsak orbital schema je JSON datoteka s to strukturo:

```json
{
  "name": "app-name",
  "version": "1.0.0",
  "orbitals": [
    {
      "name": "OrbitalName",
      "entity": { ... },
      "traits": [ ... ],
      "pages": [ ... ]
    }
  ]
}
```

- **Entity** definira obliko podatkov — polja, tipe, persistence mode
- **Traits** definirajo vedênje — state machines s stanji, events, transitions, guards in effects
- **Pages** vežejo traits na routes — URL pot, ki aktivira en ali več traits

Effects so stranski primitivi: `set` posodobi polje, `render-ui` prikaže komponento, `persist` shrani v bazo, `emit` pošlje cross-orbital events, `navigate` spremeni route, `notify` prikaže sporočilo.

Guards so S-expression pogoji, ki morajo biti resnični, da se transition sproži. Če guard ne uspe, transition ne obstaja.

Zdaj pa poglejmo to v akciji čez pet domen.

## 1. Government Inspection System — Compliance Workflow

**Domena:** Strukturirane terenske inšpekcije za vladne regulatorje
**Ključni izziv:** 5-fazni workflow enforcement, zakonski guard zahtevki, audit trails

Zgrajen za vladne inšpektorje, ta sistem jih vodi skozi Introduction → Content → Preparation → Record → Closing faze. Zakonske zahteve so vsiljene z guards — ne morete napredovati brez izpolnitve obveznih polj.

### Entity

Inspection entity zajame vse, kar inšpektor potrebuje na terenu:

```json
{
  "entity": {
    "name": "Inspection",
    "persistence": "persistent",
    "collection": "inspections",
    "fields": [
      { "name": "id", "type": "string", "required": true },
      { "name": "inspectorId", "type": "string", "required": true },
      { "name": "companyId", "type": "string", "required": true },
      { "name": "legalBasis", "type": "string" },
      { "name": "findings", "type": "array", "items": { "type": "object" } },
      { "name": "measures", "type": "array", "items": { "type": "object" } },
      { "name": "inspectorSignature", "type": "boolean", "default": false },
      { "name": "subjectSignature", "type": "boolean", "default": false },
      { "name": "createdAt", "type": "timestamp" },
      { "name": "status", "type": "enum", "values": ["draft", "in_progress", "completed", "archived"] }
    ]
  }
}
```

### Traits

5-fazni workflow je jederni trait. Vsak transition na naslednjo fazo ima guards, ki vsilijo zakonske zahteve:

```json
{
  "name": "InspectionWorkflow",
  "linkedEntity": "Inspection",
  "stateMachine": {
    "states": [
      { "name": "Introduction", "isInitial": true },
      { "name": "Content" },
      { "name": "Preparation" },
      { "name": "Record" },
      { "name": "Closing", "isTerminal": true }
    ],
    "events": [
      { "key": "PROCEED", "name": "Proceed to Next Phase" },
      { "key": "SAVE_FINDINGS", "name": "Save Findings", "payload": [
        { "name": "findings", "type": "array", "required": true }
      ]},
      { "key": "SIGN", "name": "Sign Document" },
      { "key": "CLOSE", "name": "Close Inspection" }
    ],
    "transitions": [
      {
        "from": "Introduction",
        "event": "PROCEED",
        "to": "Content",
        "guard": ["not-empty", "@entity.legalBasis"],
        "effects": [
          ["persist", "update", "Inspection", "@entity"],
          ["render-ui", "main", {
            "type": "form",
            "entity": "Inspection",
            "fields": [
              { "name": "findings", "label": "Findings", "type": "textarea", "required": true }
            ]
          }]
        ]
      },
      { "from": "Content", "event": "PROCEED", "to": "Preparation" },
      {
        "from": "Preparation",
        "event": "SAVE_FINDINGS",
        "to": "Record",
        "effects": [
          ["set", "@entity.findings", "@payload.findings"],
          ["persist", "update", "Inspection", "@entity"]
        ]
      },
      {
        "from": "Record",
        "event": "CLOSE",
        "to": "Closing",
        "guard": ["and",
          ["not-empty", "@entity.legalBasis"],
          ["not-empty", "@entity.findings"],
          ["not-empty", "@entity.measures"],
          ["=", "@entity.inspectorSignature", true],
          ["=", "@entity.subjectSignature", true]
        ],
        "effects": [
          ["set", "@entity.status", "completed"],
          ["persist", "update", "Inspection", "@entity"],
          ["notify", "success", "Inspection closed successfully"]
        ]
      }
    ]
  }
}
```

Closing guard je najbolj kritičen del: **pet pogojev** mora biti vseh resničnih. Pravna podlaga mora biti izpolnjena. Ugotovitve morajo obstajati. Ukrepi morajo biti navedeni. Tako inšpektor kot subjekt morata podpisati. Če kateri koli manjka, se CLOSE event preprosto ne sproži. Ni "preskoči" gumba, ni override — state machine nima prehoda.

Vsak `persist` effect samodejno generira audit trail. Inšpekcija prehaja skozi stanja in vsak prehod je zabeležen s časovnim žigom, uporabnikom in payload. Audit trail ni funkcija — je posledica arhitekture.

### Pages

```json
"pages": [
  {
    "name": "InspectionFormPage",
    "path": "/inspection/:id",
    "traits": [
      { "ref": "InspectionWorkflow", "linkedEntity": "Inspection" }
    ]
  },
  {
    "name": "InspectionListPage",
    "path": "/inspections",
    "traits": [
      { "ref": "InspectionBrowser", "linkedEntity": "Inspection" }
    ]
  }
]
```

Form page uporablja en trait, ki prikazuje različne forme glede na fazo preko `render-ui`. Route `/inspection/:id` naloži specifično inšpekcijo in prikaže, v kateri fazi je trenutno.

## 2. KFlow — Platforma za učenje z AI

**Domena:** LLM-powered generacija knowledge graph
**Ključni izziv:** Rekurzivna ekspanzija konceptov, AI generacija lekcij, objava tečajev

KFlow transformira seed topic (kot "JavaScript") v strukturiran knowledge graph z medsebojno povezanimi koncepti, AI-generiranimi lekcijami in objavljivimi tečaji.

### Entity

Concept entity je vozlišče knowledge graph:

```json
{
  "entity": {
    "name": "Concept",
    "persistence": "persistent",
    "collection": "concepts",
    "fields": [
      { "name": "id", "type": "string", "required": true },
      { "name": "title", "type": "string", "required": true },
      { "name": "difficulty", "type": "enum", "values": ["beginner", "intermediate", "advanced"] },
      { "name": "prerequisites", "type": "array", "items": { "type": "string" } },
      { "name": "followUps", "type": "array", "items": { "type": "string" } },
      { "name": "aiContent", "type": "string" },
      { "name": "graphId", "type": "string", "required": true }
    ]
  }
}
```

### Traits

Concept expansion trait je, kjer se AI sreča s state machines:

```json
{
  "name": "ConceptExpansion",
  "linkedEntity": "Concept",
  "emits": [
    {
      "event": "CONCEPT_EXPANDED",
      "scope": "external",
      "payload": [
        { "name": "conceptId", "type": "string", "required": true },
        { "name": "childConcepts", "type": "array", "required": true }
      ]
    }
  ],
  "stateMachine": {
    "states": [
      { "name": "seed", "isInitial": true },
      { "name": "expanding" },
      { "name": "expanded" },
      { "name": "published", "isTerminal": true }
    ],
    "events": [
      { "key": "EXPAND", "name": "Expand Concept" },
      { "key": "AI_COMPLETE", "name": "AI Generation Complete", "payload": [
        { "name": "content", "type": "string", "required": true },
        { "name": "children", "type": "array", "required": true }
      ]},
      { "key": "PUBLISH", "name": "Publish" }
    ],
    "transitions": [
      {
        "from": "seed",
        "event": "EXPAND",
        "to": "expanding",
        "effects": [
          ["render-ui", "main", {
            "type": "stats",
            "title": "Expanding...",
            "value": "@entity.title",
            "subtitle": "AI is generating content"
          }]
        ]
      },
      {
        "from": "expanding",
        "event": "AI_COMPLETE",
        "to": "expanded",
        "effects": [
          ["set", "@entity.aiContent", "@payload.content"],
          ["set", "@entity.followUps", "@payload.children"],
          ["persist", "update", "Concept", "@entity"],
          ["emit", "CONCEPT_EXPANDED", {
            "conceptId": "@entity.id",
            "childConcepts": "@payload.children"
          }]
        ]
      },
      {
        "from": "expanded",
        "event": "PUBLISH",
        "to": "published",
        "guard": ["not-empty", "@entity.aiContent"],
        "effects": [
          ["persist", "update", "Concept", "@entity"],
          ["notify", "success", "Concept published"]
        ]
      }
    ]
  }
}
```

Cross-orbital event veriga poganja celoten pipeline:

```
Uporabnik vnese topic → Graph emitira TOPIC_CREATED →
  Concept posluša → razširi prerequisites → emitira CONCEPT_EXPANDED →
    Lesson posluša → generira AI vsebino → emitira LESSON_CREATED →
      Course posluša → doda v kurikulum
```

Vsaka puščica je `listens`/`emits` deklaracija:

```json
{
  "name": "LessonGenerator",
  "listens": [
    { "event": "CONCEPT_EXPANDED", "scope": "external" }
  ],
  "emits": [
    { "event": "LESSON_CREATED", "scope": "external" }
  ]
}
```

Celoten pipeline je deklarativen. Ni orchestration kode. Ni job queues. Samo dogodki, ki tečejo skozi Orbitale.

### Pages

```json
"pages": [
  {
    "name": "GraphExplorerPage",
    "path": "/graph/:graphId",
    "traits": [
      { "ref": "ConceptExpansion", "linkedEntity": "Concept" },
      { "ref": "GraphVisualization", "linkedEntity": "Graph" }
    ]
  },
  {
    "name": "CourseEditorPage",
    "path": "/course/:courseId/edit",
    "traits": [
      { "ref": "CourseCuration", "linkedEntity": "Course" }
    ]
  }
]
```

Graph explorer page komponira concept expansion z vizualizacijo — razširjanje konceptov in prikazovanje knowledge graph na enem route.

## 3. Fitness Tracker — Osebna trening platforma

**Domena:** Upravljanje trener-stranka s kreditnim sistemom
**Ključni izziv:** Kreditni sistem, sledenje vaj, AI analiza obrokov

Zgrajen za osebnega trenerja, ki upravlja več strank. Vključuje kreditni sistem rezervacij sej, sledenje dvigov, upravljanje obrokov in AI-powered nutricionistično analizo.

### Entity

Session entity upravlja rezervacije s sledenjem kreditov:

```json
{
  "entity": {
    "name": "Session",
    "persistence": "persistent",
    "collection": "sessions",
    "fields": [
      { "name": "id", "type": "string", "required": true },
      { "name": "traineeId", "type": "string", "required": true },
      { "name": "scheduledAt", "type": "timestamp" },
      { "name": "remainingCredits", "type": "number", "default": 0 },
      { "name": "creditsExpireAt", "type": "timestamp" },
      { "name": "notes", "type": "string" },
      { "name": "type", "type": "enum", "values": ["individual", "group", "online"] }
    ]
  }
}
```

### Traits

Session booking trait vsili kreditna pravila z guards:

```json
{
  "name": "SessionBooking",
  "linkedEntity": "Session",
  "emits": [
    {
      "event": "SESSION_BOOKED",
      "scope": "external",
      "payload": [
        { "name": "traineeId", "type": "string", "required": true },
        { "name": "scheduledAt", "type": "timestamp", "required": true }
      ]
    }
  ],
  "stateMachine": {
    "states": [
      { "name": "available", "isInitial": true },
      { "name": "booked" },
      { "name": "completed", "isTerminal": true },
      { "name": "cancelled" }
    ],
    "events": [
      { "key": "BOOK", "name": "Book Session" },
      { "key": "CANCEL", "name": "Cancel Session" },
      { "key": "COMPLETE", "name": "Complete Session" }
    ],
    "transitions": [
      {
        "from": "available",
        "event": "BOOK",
        "to": "booked",
        "guard": ["and",
          [">", "@entity.remainingCredits", 0],
          ["<", "@now", "@entity.creditsExpireAt"]
        ],
        "effects": [
          ["set", "@entity.remainingCredits", ["-", "@entity.remainingCredits", 1]],
          ["persist", "update", "Session", "@entity"],
          ["emit", "SESSION_BOOKED", {
            "traineeId": "@entity.traineeId",
            "scheduledAt": "@entity.scheduledAt"
          }],
          ["notify", "success", "Session booked"]
        ]
      },
      {
        "from": "booked",
        "event": "CANCEL",
        "to": "cancelled",
        "effects": [
          ["set", "@entity.remainingCredits", ["+", "@entity.remainingCredits", 1]],
          ["persist", "update", "Session", "@entity"],
          ["notify", "info", "Session cancelled, credit refunded"]
        ]
      },
      {
        "from": "booked",
        "event": "COMPLETE",
        "to": "completed",
        "effects": [
          ["persist", "update", "Session", "@entity"]
        ]
      }
    ]
  }
}
```

Ni mogoče rezervirati z nič krediti. Ni mogoče rezervirati s pretečenimi krediti. Guard `["and", [">", "@entity.remainingCredits", 0], ["<", "@now", "@entity.creditsExpireAt"]]` naredi oba pogoja obvezna. In ko prekličete, se kredit samodejno povrne preko `["+", "@entity.remainingCredits", 1]` — poslovno pravilo je v shemi, ne skrito v service layer.

Workout tracking trait uporablja iste effect primitive za popolnoma drug namen:

```json
{
  "from": "logging",
  "event": "LOG_SET",
  "to": "logging",
  "effects": [
    ["set", "@entity.lastWeight", "@payload.weight"],
    ["set", "@entity.lastReps", "@payload.reps"],
    ["increment", "@entity.totalSets", 1],
    ["persist", "update", "Workout", "@entity"]
  ]
}
```

Isti `set`, isti `increment`, isti `persist` — aplicirani na ponovitve in uteži namesto na igralne statistike ali inšpekcijske ugotovitve.

### Pages

```json
"pages": [
  {
    "name": "TraineeDashboard",
    "path": "/trainee/:id",
    "traits": [
      { "ref": "SessionBooking", "linkedEntity": "Session" },
      { "ref": "WorkoutLog", "linkedEntity": "Workout" },
      { "ref": "MealTracker", "linkedEntity": "Meal" }
    ]
  },
  {
    "name": "SchedulePage",
    "path": "/schedule",
    "traits": [
      { "ref": "SessionBrowser", "linkedEntity": "Session" }
    ]
  }
]
```

Trainee dashboard komponira tri traits na eni strani — rezervacije, vadbe in obroki so vsi vidni hkrati. Vsak trait upravlja svoj state machine neodvisno.

## 4. Trait Wars — Taktična strateška igra

**Domena:** Turn-based taktični boj
**Ključni izziv:** Kompleksen boj z vidnim AI, faze potez, kompozicija enot

Trait Wars je strategijska igra, navdihnjena z Heroes of Might and Magic, kjer enote opremijo **Traits** — vidne state machines, ki definirajo njihovo vedênje. Jederna inovacija: igralci lahko preberejo sovražnikove state machines in izkoristijo okna prehodov.

### Entity

Vsaka enota na bojišču je entity z bojnimi statistikami, pozicijo in opremljenimi traits:

```json
{
  "entity": {
    "name": "Unit",
    "persistence": "runtime",
    "fields": [
      { "name": "id", "type": "string", "required": true },
      { "name": "name", "type": "string", "required": true },
      { "name": "hp", "type": "number", "default": 100 },
      { "name": "attack", "type": "number", "default": 10 },
      { "name": "defense", "type": "number", "default": 5 },
      { "name": "position", "type": "object" },
      { "name": "equippedTraits", "type": "array", "items": { "type": "string" } },
      { "name": "status", "type": "enum", "values": ["alive", "stunned", "dead"] }
    ]
  }
}
```

Opazite `"persistence": "runtime"` — stanje igre živi v pomnilniku, ne v bazi podatkov. Entity je gravitacijsko jedro: vse drugo kroži okoli njega.

### Traits

Turn controller sam je state machine. Vsaka faza ima jasna pravila vstopa in izstopa:

```json
{
  "name": "TurnPhaseController",
  "linkedEntity": "Match",
  "stateMachine": {
    "states": [
      { "name": "ObservationPhase", "isInitial": true },
      { "name": "SelectionPhase" },
      { "name": "MovementPhase" },
      { "name": "ActionPhase" },
      { "name": "ResolutionPhase" }
    ],
    "events": [
      { "key": "BEGIN_SELECTION", "name": "Begin Selection" },
      { "key": "CONFIRM_SELECTION", "name": "Confirm Selection" },
      { "key": "MOVE_COMPLETE", "name": "Move Complete" },
      { "key": "RESOLVE", "name": "Resolve Actions" },
      { "key": "NEXT_TURN", "name": "Next Turn" }
    ],
    "transitions": [
      {
        "from": "ObservationPhase",
        "event": "BEGIN_SELECTION",
        "to": "SelectionPhase",
        "effects": [
          ["render-ui", "main", {
            "type": "entity-table",
            "entity": "Unit",
            "columns": ["name", "hp", "status", "equippedTraits"]
          }]
        ]
      },
      { "from": "SelectionPhase", "event": "CONFIRM_SELECTION", "to": "MovementPhase" },
      { "from": "MovementPhase", "event": "MOVE_COMPLETE", "to": "ActionPhase" },
      {
        "from": "ActionPhase",
        "event": "RESOLVE",
        "to": "ResolutionPhase",
        "effects": [
          ["emit", "TURN_RESOLVED", { "turnNumber": "@entity.turnCount" }]
        ]
      },
      { "from": "ResolutionPhase", "event": "NEXT_TURN", "to": "ObservationPhase" }
    ]
  }
}
```

Pet stanj. Čisti prehodi. `render-ui` effect v SelectionPhase prikaže tabelo enot z vidnimi traits — to je, kar igralcem omogoča branje sovražnikovih state machines in načrtovanje okoli njih. `emit` effect oddaja razrešitev poteze vsem drugim orbitalom (boj, teren, junaške sposobnosti).

Boj enot je ločen trait z guards, ki vsilijo pravila igre:

```json
{
  "from": "idle",
  "event": "ATTACK",
  "to": "attacking",
  "guard": ["and",
    [">", "@entity.hp", 0],
    ["!=", "@entity.status", "stunned"]
  ],
  "effects": [
    ["set", "@entity.lastAction", "attack"],
    ["emit", "DAMAGE_DEALT", {
      "attackerId": "@entity.id",
      "damage": "@entity.attack"
    }]
  ]
}
```

Mrtva ali ošametena enota dobesedno ne more napasti. Guard to onemogoči — ni `if` stavka, ki bi ga lahko pozabili.

### Pages

```json
"pages": [
  {
    "name": "BattlefieldPage",
    "path": "/battle/:matchId",
    "traits": [
      { "ref": "TurnPhaseController", "linkedEntity": "Match" },
      { "ref": "UnitCombat", "linkedEntity": "Unit" }
    ]
  },
  {
    "name": "ArmyBuilderPage",
    "path": "/army",
    "traits": [
      { "ref": "UnitComposition", "linkedEntity": "Unit" }
    ]
  }
]
```

Page je preprosto route, ki veže traits. `/battle/:matchId` aktivira tako turn controller kot combat trait na istem zaslonu. Compiler generira UI iz `render-ui` effects.

## 5. Iram — 3D Action RPG

**Domena:** Dungeon-crawling ARPG
**Ključni izziv:** Real-time boj, proceduralni dungeons, kompozicija sposobnosti

Iram se dogaja znotraj Dyson Sphere z imenom Iram Dominion. Igralci se spuščajo skozi 5 dungeon con, premagujejo šefe in zbirajo **Orbital Shards** — fragmente vedênja, ki se komponirajo v nove sposobnosti.

### Entity

Player entity sledi zdravju, inventarju in 8 orbital slotom:

```json
{
  "entity": {
    "name": "Player",
    "persistence": "persistent",
    "collection": "players",
    "fields": [
      { "name": "id", "type": "string", "required": true },
      { "name": "health", "type": "number", "default": 100 },
      { "name": "maxHealth", "type": "number", "default": 100 },
      { "name": "equippedOrbitals", "type": "array", "items": { "type": "string" } },
      { "name": "inventory", "type": "array", "items": { "type": "object" } },
      { "name": "currentZone", "type": "number", "default": 1 },
      { "name": "orbitalShards", "type": "number", "default": 0 }
    ]
  }
}
```

Podatki igralca so `"persistent"` — napredek se shranjuje v bazo med sejami.

### Traits

Boss srečanja uporabljajo phase-based state machines — isti vzorec kot turn controller, ampak za enega sovražnika:

```json
{
  "name": "BossEncounter",
  "linkedEntity": "Boss",
  "stateMachine": {
    "states": [
      { "name": "dormant", "isInitial": true },
      { "name": "phase1" },
      { "name": "phase2" },
      { "name": "enraged" },
      { "name": "defeated", "isTerminal": true }
    ],
    "events": [
      { "key": "ENGAGE", "name": "Start Fight" },
      { "key": "DAMAGE", "name": "Take Damage", "payload": [
        { "name": "amount", "type": "number", "required": true }
      ]},
      { "key": "PHASE_SHIFT", "name": "Phase Shift" }
    ],
    "transitions": [
      { "from": "dormant", "event": "ENGAGE", "to": "phase1" },
      {
        "from": "phase1",
        "event": "DAMAGE",
        "to": "phase2",
        "guard": ["<", "@entity.hp", 50],
        "effects": [
          ["set", "@entity.attackPattern", "aggressive"],
          ["emit", "BOSS_PHASE_CHANGED", { "phase": 2 }]
        ]
      },
      {
        "from": "phase2",
        "event": "DAMAGE",
        "to": "enraged",
        "guard": ["<", "@entity.hp", 20],
        "effects": [
          ["set", "@entity.attackSpeed", ["+", "@entity.attackSpeed", 2]],
          ["set", "@entity.attackPattern", "berserk"]
        ]
      },
      {
        "from": ["phase1", "phase2", "enraged"],
        "event": "DAMAGE",
        "to": "defeated",
        "guard": ["<=", "@entity.hp", 0],
        "effects": [
          ["emit", "BOSS_DEFEATED", { "bossId": "@entity.id", "zone": "@entity.zone" }],
          ["emit", "LOOT_DROP", { "table": "@entity.lootTable" }]
        ]
      }
    ]
  }
}
```

Opazite `"from": ["phase1", "phase2", "enraged"]` — death transition deluje iz katere koli bojne faze. Guards preverjajo HP pragove za sprožitev faznih prehodov. `BOSS_DEFEATED` event teče v Dungeon orbital za odklepanje naslednje cone, medtem ko `LOOT_DROP` teče v inventarni sistem.

### Resonance sistem

Združljivi Orbitali ustvarjajo sinergijske effects:
- Defend + Mend → 1.5x shield healing
- Disrupt + Fabricate → Pasti uporabijo debuffe
- Archive + Command → Zavezniki prejmejo intel o slabostih sovražnikov

To je modelirano skozi cross-orbital `listens` — ko sta dva specifična orbitala hkrati opremljena, njuni skupni events sprožijo resonance effects.

### Pages

```json
"pages": [
  {
    "name": "DungeonPage",
    "path": "/dungeon/:zoneId",
    "traits": [
      { "ref": "DungeonExploration", "linkedEntity": "Dungeon" },
      { "ref": "PlayerCombat", "linkedEntity": "Player" },
      { "ref": "BossEncounter", "linkedEntity": "Boss" }
    ]
  },
  {
    "name": "OrbitalLoadoutPage",
    "path": "/loadout",
    "traits": [
      { "ref": "OrbitalEquip", "linkedEntity": "Player" }
    ]
  }
]
```

Dungeon page komponira tri traits na enem route — raziskovanje, boj in boss srečanja so vsi aktivni hkrati.

## Vzorec

Pet aplikacij. Pet različnih domen. Isti vzorec:

| Koncept | Vlada | Izobraževanje | Fitnes | Igra | RPG |
|---------|-------|-----------|---------|------|-----|
| **Entity** | Inšpekcija | Koncept | Seja | Enota | Igralec |
| **States** | Intro→Content→Close | Seed→Expanded→Published | Available→Booked→Done | Idle→Attack→Dead | Exploring→Combat→Boss |
| **Guards** | Polja izpolnjena, podpisano | Prerequisites izpolnjeni | Krediti > 0 | HP > 0, in range | Ima zahtevani orbital |
| **Effects** | Shrani ugotovitve, log | Generiraj lekcijo | Odbij kredit | Povzroči škodo, premakni | Drop loot |
| **Events** | PROCEED, CLOSE | EXPAND, PUBLISH | BOOK, CANCEL | ATTACK, MOVE, DIE | ENTER_ROOM, ATTACK |
| **Pages** | /inspection/:id | /graph/:graphId | /trainee/:id | /battle/:matchId | /dungeon/:zoneId |

Besedišče se spreminja. Struktura ne.

## Zakaj je to pomembno

### Za razvijalce

Almadar se naučite enkrat. Nato lahko gradite:
- Poslovna orodja
- Igre
- Vladne sisteme
- AI-powered produkti
- Health and fitness aplikacije

Ni nov framework na domeno. Ni nova state management library. Ni nova backend architecture. En jezik, en compiler, en mentalni model.

### Za podjetja

Ena ekipa lahko gradi več produktov. Arhitekt, ki je zasnoval inšpekcijski sistem, lahko zasnuje bojni sistem igre — vzorci so isti. Stanja, prehodi, guards, effects.

### Za industrijo

Dejstvo, da ista arhitektura obravnava turn-based boj in vladno compliance, kaže, da smo našli nekaj temeljnega. Ni framework optimiziran za eno domeno, ampak **model vedênja**, ki deluje čez domene.

Ker je vedênje vedênje. Naj bo to igralna enota, ki se odloči za napad, inšpektor, ki zaključi fazo, ali fitnes trener, ki rezervira sejo — je vse:

1. Začni v stanju
2. Prejmi event
3. Preveri guards
4. Izvedi effects
5. Premakni v naslednje stanje

To ni funkcija frameworka. Tako sistemi delujejo.

## Spoznanje

Vprašanje "kateri jezik naj uporabim?" je manj pomembno kot "kateri model vedênja uporabljam?"

React + Express. Django + PostgreSQL. Rails + Redis. To so tehnološke izbire. Ne spremenijo, kako modelirate vedênje — samo spremenijo, kje pišete iste vzorce.

Almadar je model vedênja, ki se prevede v tehnologijo. Ena shema. Pet aplikacij. Ker je model pravilen.

Raziščite vse projekte in poskusite zgraditi svojega na [almadar.io](https://orb.almadar.io/docs/getting-started/introduction).
