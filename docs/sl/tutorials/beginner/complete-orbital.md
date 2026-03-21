# Anatomija celotne Orbital enote

> Vsaka funkcionalnost v Orb je Orbital enota. Orbital enota ni popolna brez vseh stirih delov.

<OrbitalDiagram />

## Stirje deli Orbital enote

Orbital enota je temeljna enota Orb aplikacije. Vsebovati mora:

```
Orbital enota = Entiteta + Lastnost(i) + Avtomat stanj + Strani
```

| Del | Namen | Brez njega... |
|-----|-------|---------------|
| `entity` | Katere podatke upravljate | Ni podatkov za delo |
| `traits` | Kako se aplikacija obnasa | Ni obnasanja ali UI |
| `stateMachine` | Stanja, dogodki in prehodi | Ni definiranega zivljenjskega cikla |
| `pages` | Kje se UI pojavi (poti) | Stran se nalozi prazna - nic se ne upodobi |

**Strani so najpogosteje pozabljen del.** Brez `pages` lastnost obstaja, a ni nikoli prikljucena na pot - uporabnik ne vidi nicesar.

---

## Korak 1 - Definirajte entiteto

Entiteta je vasa podatkovna struktura. Opisuje, kaj upravljate in kako se shranjuje.

```json
{
  "name": "Task",
  "persistence": "persistent",
  "collection": "tasks",
  "fields": [
    { "name": "id", "type": "string", "required": true },
    { "name": "title", "type": "string", "required": true },
    { "name": "status", "type": "enum", "values": ["pending", "done"], "default": "pending" }
  ]
}
```

**Tipi polj:** `string`, `number`, `boolean`, `date`, `timestamp`, `enum`, `array`, `object`, `relation`

**Nacini trajnosti:**
- `persistent` - shranjeno v podatkovni bazi (Firestore, PostgreSQL)
- `runtime` - v pomnilniku, specificno za sejo (voz, stanje carovnika)
- `singleton` - en globalni primerek (konfiguracija aplikacije, trenutni uporabnik)

---

## Korak 2 - Definirajte avtomat stanj

Avtomat stanj zivi znotraj lastnosti. Opisuje, v katerih stanjih je lahko funkcionalnost in kateri dogodki povzrocijo prehode.

### Stanja

Vsak avtomat stanj potrebuje vsaj eno stanje, oznaceno z `"isInitial": true`. Stanja so **objekti**, ne nizi:

```json
"states": [
  { "name": "Pending", "isInitial": true },
  { "name": "Done", "isTerminal": true }
]
```

### Dogodki

Dogodki so sprozilci - uporabniska dejanja, sistemski dogodki ali zivljenjski kljuki:

```json
"events": [
  { "key": "INIT", "name": "Initialize" },
  { "key": "COMPLETE", "name": "Complete Task" }
]
```

> **`INIT` je obvezen.** Brez prehoda INIT se stran nalozi, a ne upodobi nicesar.

### Prehodi

Prehodi povezejo stanja in dogodke skupaj. Lahko nosijo pogoje (izrazi) in ucinke (dejanja):

```json
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
        "columns": ["title", "status"],
        "itemActions": [
          { "event": "COMPLETE", "label": "Complete" }
        ]
      }]
    ]
  },
  {
    "from": "Pending",
    "event": "COMPLETE",
    "to": "Done",
    "effects": [
      ["persist", "update", "Task", "@entity"],
      ["notify", "success", "Task completed!"]
    ]
  }
]
```

---

## Korak 3 - Zgradite lastnost

Ovijte avtomat stanj v lastnost z `name`, `linkedEntity` in `category`:

```json
{
  "name": "TaskLifecycle",
  "linkedEntity": "Task",
  "category": "interaction",
  "stateMachine": {
    "states": [
      { "name": "Pending", "isInitial": true },
      { "name": "Done", "isTerminal": true }
    ],
    "events": [
      { "key": "INIT", "name": "Initialize" },
      { "key": "COMPLETE", "name": "Complete Task" }
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
            "columns": ["title", "status"],
            "itemActions": [
              { "event": "COMPLETE", "label": "Complete" }
            ]
          }]
        ]
      },
      {
        "from": "Pending",
        "event": "COMPLETE",
        "to": "Done",
        "effects": [
          ["persist", "update", "Task", "@entity"],
          ["notify", "success", "Task completed!"]
        ]
      }
    ]
  }
}
```

**`category`** je lahko:
- `interaction` - ima UI, oddaja ucinke `render-ui`
- `integration` - klici zalednih storitev, brez UI

---

## Korak 4 - Dodajte strani

Strani vezejo lastnosti na URL poti. To je del, ki najpogosteje manjka.

```json
"pages": [
  {
    "name": "TaskListPage",
    "path": "/tasks",
    "traits": [
      { "ref": "TaskLifecycle", "linkedEntity": "Task" }
    ]
  }
]
```

- `path` je URL pot (podpira parametre `:id`, npr. `/tasks/:id`)
- `traits[].ref` se sklicuje na lastnost po imenu, definirano v isti Orbital enoti
- `traits[].linkedEntity` pove izvajalnemu okolju, katero entiteto naj veze

---

## Celotna Orbital enota

Vse skupaj - popolnoma delujoce Orbital enota `TaskManager`:

```json
{
  "name": "TaskManager",
  "orbitals": [
    {
      "name": "Tasks",
      "entity": {
        "name": "Task",
        "persistence": "persistent",
        "collection": "tasks",
        "fields": [
          { "name": "id", "type": "string", "required": true },
          { "name": "title", "type": "string", "required": true },
          { "name": "status", "type": "enum", "values": ["pending", "done"], "default": "pending" }
        ]
      },
      "traits": [
        {
          "name": "TaskLifecycle",
          "linkedEntity": "Task",
          "category": "interaction",
          "stateMachine": {
            "states": [
              { "name": "Pending", "isInitial": true },
              { "name": "Done", "isTerminal": true }
            ],
            "events": [
              { "key": "INIT", "name": "Initialize" },
              { "key": "COMPLETE", "name": "Complete Task" }
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
                    "columns": ["title", "status"],
                    "itemActions": [
                      { "event": "COMPLETE", "label": "Complete" }
                    ]
                  }]
                ]
              },
              {
                "from": "Pending",
                "event": "COMPLETE",
                "to": "Done",
                "effects": [
                  ["persist", "update", "Task", "@entity"],
                  ["notify", "success", "Task completed!"]
                ]
              }
            ]
          }
        }
      ],
      "pages": [
        {
          "name": "TaskListPage",
          "path": "/tasks",
          "traits": [
            { "ref": "TaskLifecycle", "linkedEntity": "Task" }
          ]
        }
      ]
    }
  ]
}
```

---

## Pogoste napake

### Manjkajoce `pages`

```json
// ❌ Nepopolno - na nobeni poti se ne upodobi nic
{
  "name": "Tasks",
  "entity": { ... },
  "traits": [ { "name": "TaskLifecycle", ... } ]
}

// ✅ Popolno - lastnost je prikljucena na /tasks
{
  "name": "Tasks",
  "entity": { ... },
  "traits": [ { "name": "TaskLifecycle", ... } ],
  "pages": [
    { "name": "TaskListPage", "path": "/tasks", "traits": [{ "ref": "TaskLifecycle", "linkedEntity": "Task" }] }
  ]
}
```

### Stanja kot nizi (neveljavno)

```json
// ❌ Napacna oblika
"states": ["Pending", "Done"]

// ✅ Stanja morajo biti objekti
"states": [
  { "name": "Pending", "isInitial": true },
  { "name": "Done", "isTerminal": true }
]
```

### Manjkajoci prehod INIT

```json
// ❌ Stran se odpre, a je prazna - ni zacetnega render-ui
"transitions": [
  { "from": "Pending", "event": "COMPLETE", "to": "Done", "effects": [...] }
]

// ✅ Dodajte samozanko na INIT za upodobitev zacetnega UI
"transitions": [
  {
    "from": "Pending", "event": "INIT", "to": "Pending",
    "effects": [["fetch", "Task"], ["render-ui", "main", { "type": "entity-table", "entity": "Task" }]]
  },
  { "from": "Pending", "event": "COMPLETE", "to": "Done", "effects": [...] }
]
```

---

## Naslednji koraki

- [Zgradite upravljalnik nalog](./task-manager.md) - dodajte celoten CRUD temu vzorcu
- [Vzorci UI in render-ui](../intermediate/ui-patterns.md) - razisCite vse tipe vzorcev
- [Pogoji in poslovna pravila](../intermediate/guards.md) - dodajte pogoje prehodom
