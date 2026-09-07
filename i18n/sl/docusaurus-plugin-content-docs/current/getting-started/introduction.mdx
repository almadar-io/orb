# Uvod v Orb

> **Fizika programske opreme**: Naravni jezik → Program → Produkcijska aplikacija

## Kaj je Orb?

Orb je **deklarativni programski jezik** za gradnjo celosteznih aplikacij. Namesto pisanja imperativne kode, razprsene po sprednjem in zalednem delu, svojo aplikacijo deklarirate kot program iz:

- **Entitet** - Vasih podatkovnih struktur s pravili trajnosti
- **Lastnosti** - Obnasanja, definiranega z avtomati stanj
- **Strani** - Poti z vezavami UI

Prevajalnik Orb pretvori ta program v celotno, za produkcijo pripravljeno aplikacijo.

<OrbitalDiagram />

## Problem, ki ga Orb resuje

### Tradicionalni razvoj

```
Ekipa za sprednji del   Ekipa za zaledni del   Ekipa za podatkovno bazo
     |                      |                      |
     v                      v                      v
  React koda    +     Express API    +      Shema/SQL
     |                      |                      |
     v                      v                      v
 Dovoljenja    +    Dovoljenja      +    Omejitve
     |                      |                      |
     v                      v                      v
  Testiranje   +    Testiranje      +    Testiranje
```

**Tezave:**
- Poslovna logika podvojena med plastmi
- Dovoljenja razprsena v middleware, poteh in poizvedbah
- Dokumentacija locena od kode
- Testiranje zahteva vec pristopov

### Razvoj z Orb

```
Orb program (.orb datoteka)
        |
        v
   orb compile
        |
        v
Celostezna aplikacija
  - React sprednji del
  - Express zaledni del
  - Modeli podatkovne baze
  - Dovoljenja
  - Dokumentacija
```

**Prednosti:**
- En vir resnice
- Dovoljenja v pogojih (na enem mestu)
- Program JE dokumentacija
- Avtomati stanj so inherentno preverljivi

## Kljucni koncepti

### 1. Entitete

Entitete definirajo, kaj vasa aplikacija upravlja:

```orb
{
  "name": "Task",
  "persistence": "persistent",
  "fields": [
    { "name": "title", "type": "string", "required": true },
    { "name": "status", "type": "enum", "values": ["pending", "in_progress", "done"] },
    { "name": "assignee", "type": "relation", "target": "User" },
    { "name": "dueDate", "type": "date" }
  ]
}
```

**Tipi trajnosti:**
- `persistent` - shranjeno v podatkovni bazi (Firestore, PostgreSQL)
- `runtime` - v pomnilniku (specificno za sejo)
- `singleton` - posamicen globalni primerek

### 2. Lastnosti

Lastnosti definirajo, kako se vasa aplikacija obnasa, z avtomati stanj:

```orb
{
  "name": "TaskLifecycle",
  "linkedEntity": "Task",
  "category": "interaction",
  "stateMachine": {
    "states": [
      { "name": "Pending", "isInitial": true },
      { "name": "InProgress" },
      { "name": "Done", "isTerminal": true }
    ],
    "events": [
      { "key": "INIT", "name": "Initialize" },
      { "key": "START", "name": "Start Working" },
      { "key": "COMPLETE", "name": "Mark Complete" }
    ],
    "transitions": [
      {
        "from": "Pending",
        "event": "INIT",
        "to": "Pending",
        "effects": [
          ["fetch", "Task"],
          ["render-ui", "main", {
            "type": "entity-table",
            "entity": "Task",
            "columns": ["title", "status", "assignee"],
            "itemActions": [
              { "event": "START", "label": "Start" },
              { "event": "COMPLETE", "label": "Complete" }
            ]
          }]
        ]
      },
      {
        "from": "Pending",
        "to": "InProgress",
        "event": "START",
        "guard": ["=", "@entity.assignee", "@currentUser.id"],
        "effects": [
          ["set", "@entity.status", "in_progress"],
          ["persist", "update", "Task", "@entity"]
        ]
      },
      {
        "from": "InProgress",
        "to": "Done",
        "event": "COMPLETE",
        "effects": [
          ["persist", "update", "Task", "@entity"],
          ["notify", "success", "Task completed!"]
        ]
      }
    ]
  }
}
```

**Kljucno spoznanje:** Lastnost zdruzuje obnasanje (avtomat stanj) IN UI (ucinki `render-ui`).

### 3. Strani

Strani vezejo lastnosti na URL poti. Vsaka Orbital enota potrebuje vsaj eno stran:

```orb
{
  "name": "TaskListPage",
  "path": "/tasks",
  "traits": [
    { "ref": "TaskLifecycle", "linkedEntity": "Task" }
  ]
}
```

Celotna Orbital enota zdruzuje vse tri dele:

```orb
{
  "name": "TaskManager",
  "entity": {
    "name": "Task",
    "persistence": "persistent",
    "fields": [
      { "name": "title", "type": "string", "required": true },
      { "name": "status", "type": "enum", "values": ["pending", "in_progress", "done"] },
      { "name": "assignee", "type": "string" }
    ]
  },
  "traits": [
    {
      "name": "TaskLifecycle",
      "linkedEntity": "Task",
      "category": "interaction",
      "stateMachine": { "...": "see above" }
    }
  ],
  "pages": [
    {
      "name": "TaskListPage",
      "path": "/tasks",
      "traits": [{ "ref": "TaskLifecycle", "linkedEntity": "Task" }]
    }
  ]
}
```

### 4. S-izrazi

Vsa logika je izrazena kot seznami:

```orb
// Pogoj: preveri pogoje
["and",
  ["=", "@entity.status", "pending"],
  [">", "@entity.priority", 3]
]

// Ucinki: izvedi dejanja
["persist", "update", "Task", "@entity"]
["notify", "success", "Task saved!"]
["navigate", "/tasks"]
```

### 5. Zaprt krog

Vsako uporabnisko dejanje sledi tej poti:

```
1. Dogodek  → Uporabnik klikne "Zakljuci nalogo"
2. Pogoj    → Preveri: ali je uporabnik izvajalec?
3. Prehod   → Stanje: InProgress → Done
4. Ucinki   → Streznik: shrani v PB
              → Odjemalec: prikazi toast, osvezi seznam
5. Odgovor  → UI se posodobi s pravimi podatki
```

## Zakaj "Orb"?

Orb crpa svoje ime iz nebeske sfere. "Almadar" (المدار) v arabscini pomeni "orbita" in Orb je jezik, rojen iz te vizije. Ime izhaja iz nebeske mehanike:

| Fizika | Orb |
|--------|-----|
| Objekti v vesolju | Entitete (podatki) |
| Sile povzrocijo gibanje | Dogodki sprozijo obnasanje |
| Zakoni urejajo gibanje | Pogoji nadzirajo prehode |
| Reakcije | Ucinki |
| Stabilne orbite | Veljavna stanja aplikacije |

Tako kot planeti sledijo predvidljivim potem, ki jih urejajo fizikalni zakoni, aplikacije zgrajene z Orb sledijo predvidljivim potem, ki jih urejajo avtomati stanj.

## Kaj boste zgradili

Do konca te dokumentacije boste znali:

1. **Oblikovati programe** - modelirati kompleksne aplikacije kot entitete in lastnosti
2. **Pisati pogoje** - implementirati natancna dovoljenja
3. **Ustvarjati ucinke** - upravljati strezniski in odjemalska dejanja
4. **Povezovati Orbital enote** - graditi modularne, komunikatne funkcionalnosti
5. **Namescati aplikacije** - od programa do produkcije

## Naslednji koraki

1. [Namestite CLI](../downloads/cli.md) - pridobite CLI Orb na svoj sistem
2. [Zgradite upravljalnik nalog](/docs/tutorials/beginner/task-manager) - vas prvi program
3. [Kljucni koncepti: Entitete](../core-concepts/entities.md) - poglobitev v temelje

---

*Pripravljeni na revolucijo v nacinu gradnje programske opreme? Zacnimo!*
