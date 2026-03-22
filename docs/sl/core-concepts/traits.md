# Lastnosti

> Definicije lastnosti in tipi avtomatov stanj za Orb

---

> Kako lastnosti delujejo v arhitekturi Orb - avtomati stanj, pogoji, ucinki in med-orbitalna komunikacija.

**Povezano:** [Entitete](./entities.md)

---

## Pregled

V jeziku Orb je **Lastnost** avtomat stanj, ki definira obnasanje za entiteto. Temeljni sestav je:

```
Orbital enota = Entiteta + Lastnosti + Strani
```

Medtem ko [Entitete](./entities.md) definirajo obliko podatkov, Lastnosti definirajo, kako se ti podatki spreminjajo skozi cas prek **stanj**, **prehodov**, **pogojev** in **ucinkov**.

---

## Definicija lastnosti

Lastnost je definirana v `.orb` programu z naslednjo strukturo:

```orb
{
  "name": "TaskManagement",
  "category": "interaction",
  "linkedEntity": "Task",
  "description": "Manages task lifecycle and status changes",
  "emits": [
    { "event": "TASK_COMPLETED", "scope": "external" }
  ],
  "listens": [
    { "event": "USER_ASSIGNED", "triggers": "ASSIGN" }
  ],
  "stateMachine": {
    "states": [
      { "name": "idle", "isInitial": true },
      { "name": "active" },
      { "name": "completed", "isTerminal": true }
    ],
    "events": [
      { "key": "START", "name": "Start Task" },
      { "key": "COMPLETE", "name": "Complete Task" }
    ],
    "transitions": [
      {
        "from": "idle",
        "to": "active",
        "event": "START",
        "effects": [["set", "@entity.id", "status", "active"]]
      },
      {
        "from": "active",
        "to": "completed",
        "event": "COMPLETE",
        "guard": ["=", "@entity.assigneeId", "@user.id"],
        "effects": [
          ["set", "@entity.id", "status", "completed"],
          ["emit", "TASK_COMPLETED", { "taskId": "@entity.id" }]
        ]
      }
    ]
  }
}
```

### Lastnosti lastnosti

| Lastnost | Obvezno | Opis |
|----------|---------|------|
| `name` | Da | Identifikator lastnosti (PascalCase) |
| `category` | Ne | Kategorija lastnosti (glej spodaj) |
| `linkedEntity` | Ne | Entiteta, na kateri ta lastnost deluje |
| `description` | Ne | Cloveku berljiv opis |
| `emits` | Ne | Dogodki, ki jih ta lastnost lahko oddaja |
| `listens` | Ne | Dogodki, ki jih ta lastnost poslusa |
| `stateMachine` | Da | Definicija avtomata stanj |
| `ticks` | Ne | Nacrtovani/periodicni ucinki |
| `config` | Ne | Konfiguracijski program |

---

## Kategorije lastnosti

Lastnosti so kategorizirane po svojem primarnem namenu:

| Kategorija | Namen | Tipicni ucinki |
|------------|-------|-----------------|
| `interaction` | Upravljanje dogodkov uporabniskega vmesnika | `render-ui`, `navigate`, `notify` |
| `integration` | Strezniski operacije | `persist`, `fetch`, `call-service` |
| `lifecycle` | Upravljanje zivljenjskega cikla entitete | `persist`, `emit` |
| `gameCore` | Igralna zanka in fizika | `set`, `emit`, ticks |
| `gameEntity` | Obnasanje igralnih entitet | `set`, `emit`, `render-ui` |
| `gameUi` | Igralni UI, HUD, kontrole | `render-ui`, `notify` |

### Primeri kategorij

**Lastnost za interakcijo** - upravlja dogodke UI:
```orb
{
  "name": "FormInteraction",
  "category": "interaction",
  "stateMachine": {
    "transitions": [{
      "event": "SUBMIT",
      "effects": [
        ["render-ui", "main", { "type": "form", "loading": true }],
        ["emit", "FORM_SUBMITTED", "@payload"]
      ]
    }]
  }
}
```

**Lastnost za integracijo** - upravlja strezniski operacije:
```orb
{
  "name": "DataPersistence",
  "category": "integration",
  "stateMachine": {
    "transitions": [{
      "event": "SAVE",
      "effects": [
        ["persist", "update", "Task", "@entity.id", "@payload"],
        ["emit", "DATA_SAVED", { "id": "@entity.id" }]
      ]
    }]
  }
}
```

---

## Avtomat stanj

Vsaka lastnost ima avtomat stanj, ki definira njeno obnasanje.

### Stanja

Stanja predstavljajo mozne pogoje lastnosti:

```orb
{
  "states": [
    { "name": "idle", "isInitial": true, "description": "Waiting for input" },
    { "name": "loading", "description": "Fetching data" },
    { "name": "active", "description": "Ready for interaction" },
    { "name": "error", "isTerminal": true, "description": "Error state" }
  ]
}
```

| Lastnost | Opis |
|----------|------|
| `name` | Identifikator stanja (male crke) |
| `isInitial` | Zacetno stanje (natanko eno je obvezno) |
| `isTerminal` | Pricakovanih ni nobenih odhodnih prehodov |
| `description` | Cloveku berljiv opis |

### Dogodki

Dogodki sprozijo prehode stanj:

```orb
{
  "events": [
    { "key": "INIT", "name": "Initialize" },
    { "key": "SUBMIT", "name": "Submit Form", "payload": [
      { "name": "email", "type": "string", "required": true },
      { "name": "name", "type": "string", "required": true }
    ]},
    { "key": "ERROR", "name": "Error Occurred" }
  ]
}
```

| Lastnost | Opis |
|----------|------|
| `key` | Identifikator dogodka (UPPER_SNAKE_CASE) |
| `name` | Prikazno ime |
| `payload` | Pricakovana shema obremenitve |

### Prehodi

Prehodi definirajo, kako se stanja spreminjajo kot odziv na dogodke:

```orb
{
  "transitions": [
    {
      "from": "idle",
      "to": "loading",
      "event": "SUBMIT",
      "guard": ["and", ["!=", "@payload.email", ""], ["!=", "@payload.name", ""]],
      "effects": [
        ["set", "@entity.id", "email", "@payload.email"],
        ["persist", "create", "User", "@payload"]
      ]
    },
    {
      "from": ["loading", "active"],
      "to": "error",
      "event": "ERROR"
    }
  ]
}
```

| Lastnost | Opis |
|----------|------|
| `from` | Izvorno stanje/stanja - niz ali seznam |
| `to` | Ciljno stanje (vedno posamicno) |
| `event` | Sprozilni dogodek |
| `guard` | Pogoj, ki mora biti izpolnjen (neobvezno) |
| `effects` | Ucinki za izvedbo ob prehodu (neobvezno) |

**Prehodi z vec izvori:** Uporabite seznam za `from` za obdelavo istega dogodka iz vec stanj:
```orb
{ "from": ["idle", "error"], "to": "loading", "event": "RETRY" }
```

---

## Pogoji

Pogoji so izrazi, ki se morajo ovrednotiti na `true`, da se prehod izvede. Uporabljajo sintakso S-izrazov.

### Operatorji pogojev

| Kategorija | Operatorji |
|------------|------------|
| Primerjava | `=`, `!=`, `<`, `>`, `<=`, `>=` |
| Logika | `and`, `or`, `not` |
| Matematika | `+`, `-`, `*`, `/`, `%` |
| Seznami | `count`, `includes`, `every`, `some` |

### Primeri pogojev

```orb
// Preprosta enakost
["=", "@entity.status", "active"]

// Sestavljeni pogoj
["and",
  ["!=", "@payload.email", ""],
  ["!=", "@payload.name", ""]
]

// Numericna primerjava
[">=", "@entity.balance", "@payload.amount"]

// Preverjanje seznama
[">", ["count", "@entity.items"], 0]

// Uporabnisko dovoljenje
["=", "@entity.ownerId", "@user.id"]

// Kompleksen pogoj
["and",
  ["=", "@entity.status", "pending"],
  ["or",
    ["=", "@user.role", "admin"],
    ["=", "@entity.assigneeId", "@user.id"]
  ]
]
```

### Vezave v pogojih

Pogoji se lahko sklicujejo na podatke prek vezav (glej [Vezave entitet](./entities.md#entity-bindings-in-s-expressions)):

| Vezava | Opis |
|--------|------|
| `@entity.field` | Trenutna vrednost polja entitete |
| `@payload.field` | Polje obremenitve dogodka |
| `@state` | Ime trenutnega stanja lastnosti |
| `@user.id` | ID overjene osebe |
| `@now` | Trenutni casovni zig |

### Neuspesnost pogoja

Ce se pogoj ovrednoti na `false`:
1. Prehod je **blokiran**
2. Nobeni ucinki se ne izvedejo
3. Stanje ostane nespremenjeno
4. Odgovor oznaci `transitioned: false`

---

## Ucinki

Ucinki so dejanja, ki se izvedejo ob prehodu. Uporabljajo sintakso S-izrazov.

### Tipi ucinkov

| Ucinek | Streznik | Odjemalec | Namen |
|--------|----------|-----------|-------|
| `render-ui` | Prezrt | Izvede | Prikazi vzorec v rezino UI |
| `navigate` | Prezrt | Izvede | Navigacija po poteh |
| `notify` | Prezrt | Izvede | Prikazi obvestilo/toast |
| `fetch` | Izvede | Prezrt | Poizvedba v podatkovno bazo |
| `persist` | Izvede | Prezrt | Ustvari/posodobi/izbrisi podatke |
| `call-service` | Izvede | Prezrt | Klici zunanji API |
| `emit` | Izvede | Izvede | Objavi dogodek |
| `set` | Izvede | Izvede | Spremeni polje entitete (podpira povecanje/zmanjsanje prek S-izrazov) |

### Model dvojnega izvajanja

Lastnosti se izvajajo **hkrati na odjemalcu in strezniku**:

```
┌─────────────────────────────────────────────────────────────┐
│  Odjemalec                      Streznik                     │
│  ─────────                      ────────                     │
│  render-ui  ✓                    render-ui  → clientEffects │
│  navigate   ✓                    navigate   → clientEffects │
│  notify     ✓                    notify     → clientEffects │
│  fetch      ✗                    fetch      ✓ (poizvedba)   │
│  persist    ✗                    persist    ✓ (zapis)       │
│  call-service ✗                  call-service ✓ (API klic)  │
│  emit       ✓ (EventBus)         emit       ✓ (med-orbitalno)│
│  set        ✓                    set        ✓               │
└─────────────────────────────────────────────────────────────┘
```

### Primeri ucinkov

**render-ui** - Prikazi vzorec UI:
```orb
["render-ui", "main", {
  "type": "entity-table",
  "entity": "Task",
  "columns": ["title", "status", "dueDate"]
}]
```

**persist** - Operacije s podatkovno bazo:
```orb
// Ustvari
["persist", "create", "Task", "@payload"]

// Posodobi
["persist", "update", "Task", "@entity.id", { "status": "completed" }]

// Izbrisi
["persist", "delete", "Task", "@entity.id"]
```

**fetch** - Poizvedba podatkov:
```orb
["fetch", "Task", { "status": "active", "assigneeId": "@user.id" }]
```

**emit** - Objavi dogodek:
```orb
["emit", "TASK_COMPLETED", { "taskId": "@entity.id", "completedBy": "@user.id" }]
```

**set** - Spremeni polje:
```orb
["set", "@entity.id", "status", "active"]
["set", "@entity.id", "updatedAt", "@now"]
// Povecanje/zmanjsanje z matematicnimi operatorji:
["set", "@entity.id", "score", ["+", "@entity.score", 10]]  // Povecaj za 10
["set", "@entity.id", "health", ["-", "@entity.health", 5]]  // Zmanjsaj za 5
```

**Opomba:** `increment` in `decrement` nista locena tipa ucinkov. Uporabite ucinek `set` z matematicnimi operatorji S-izrazov (`+`, `-`) za spreminjanje numericnih polj.

**navigate** - Sprememba poti:
```orb
["navigate", "/tasks/@entity.id"]
```

**notify** - Prikazi obvestilo:
```orb
["notify", "Task completed successfully", "success"]
```

**call-service** - Zunanji API:
```orb
["call-service", "email", "send", {
  "to": "@entity.email",
  "subject": "Task Assigned",
  "body": "You have been assigned a new task."
}]
```

---

## linkedEntity - Vezava Lastnost-Entiteta

Lastnost `linkedEntity` doloca, na kateri entiteti lastnost deluje.

### Primarna entiteta

Vsaka Orbital enota ima primarno entiteto. Lastnosti brez `linkedEntity` uporabljajo to entiteto:

```orb
{
  "name": "TaskManagement",
  "entity": { "name": "Task", "fields": [...] },
  "traits": [
    { "name": "StatusTrait" }  // Uporablja entiteto Task
  ]
}
```

### Ekspliciten linkedEntity

Dolocite `linkedEntity` za delovanje na drugi entiteti:

```orb
{
  "name": "TaskManagement",
  "entity": { "name": "Task" },
  "traits": [
    { "name": "StatusTrait", "linkedEntity": "Task" },
    { "name": "CommentTrait", "linkedEntity": "Comment" },
    { "name": "PlayerStatsTrait", "linkedEntity": "Player" }
  ]
}
```

### Zakaj linkedEntity?

1. **Ponovno uporabne lastnosti** - Splosna lastnost lahko deluje s katero koli entiteto
2. **Med-entitetne operacije** - Delovanje na povezanih entitetah
3. **Tipska varnost** - Prevajalnik preveri reference na polja entitete
4. **Jasne odvisnosti** - Eksplicitna vezava izboljsa berljivost

Glej [Vezave entitet](./entities.md#linkedentity-concept) za vec podrobnosti.

---

## Komunikacija z dogodki (emit/listen)

Lastnosti komunicirajo prek dogodkov, kar omogoca ohlapno sklopljenost med Orbital enotami.

### Oddajanje dogodkov

Deklarirajte dogodke, ki jih lastnost lahko oddaja:

```orb
{
  "name": "OrderFlow",
  "emits": [
    {
      "event": "ORDER_CONFIRMED",
      "scope": "external",
      "description": "Fired when order is confirmed",
      "payload": [
        { "name": "orderId", "type": "string" },
        { "name": "items", "type": "array" }
      ]
    }
  ]
}
```

Oddajanje v ucinkih:
```orb
["emit", "ORDER_CONFIRMED", { "orderId": "@entity.id", "items": "@entity.items" }]
```

### Poslusanje dogodkov

Deklarirajte dogodke, ki jih lastnost poslusa:

```orb
{
  "name": "InventorySync",
  "listens": [
    {
      "event": "ORDER_CONFIRMED",
      "triggers": "RESERVE_STOCK",
      "scope": "external",
      "payloadMapping": {
        "items": "@payload.items"
      },
      "guard": [">", ["count", "@payload.items"], 0]
    }
  ]
}
```

| Lastnost | Opis |
|----------|------|
| `event` | Ime dogodka za poslusanje |
| `triggers` | Notranji dogodek za sprozitev (privzeto ime dogodka) |
| `scope` | `internal` (ista Orbital enota) ali `external` (med Orbital enotami) |
| `payloadMapping` | Pretvorba vhodne obremenitve |
| `guard` | Neobvezni pogoj za filtriranje dogodkov |

### Doseg dogodka

| Doseg | Opis |
|-------|------|
| `internal` | Dogodki samo znotraj iste Orbital enote |
| `external` | Dogodki lahko presezejo meje Orbital enot |

### Tok med-orbitalne komunikacije

```
┌──────────────────┐         ┌──────────────────┐
│  OrderManagement │         │ InventoryManagement│
│                  │         │                  │
│  ┌────────────┐  │  emit   │  ┌────────────┐  │
│  │ OrderFlow  │──┼────────►│  │InventorySync│  │
│  └────────────┘  │ ORDER_  │  └────────────┘  │
│                  │CONFIRMED│                  │
└──────────────────┘         └──────────────────┘
```

1. Lastnost `OrderFlow` oddaja `ORDER_CONFIRMED` (zunanji doseg)
2. Vodilo dogodkov posreduje vsem poslusajocim lastnostim
3. `InventorySync` prejme dogodek, preslika obremenitev
4. Dogodek `RESERVE_STOCK` se sprozi na `InventorySync`
5. Avtomat stanj obdela prehod normalno

---

## Cikli (nacrtovani ucinki)

Cikli izvajajo ucinke periodicno, tudi brez interakcije uporabnika.

### Definicija cikla

```orb
{
  "ticks": [
    {
      "name": "cleanup_expired",
      "interval": "60000",
      "guard": [">", ["count", "@entity.expiredSessions"], 0],
      "effects": [
        ["persist", "delete", "Session", { "expiresAt": ["<", "@now"] }]
      ],
      "description": "Clean up expired sessions every minute"
    },
    {
      "name": "sync_status",
      "interval": "5000",
      "effects": [
        ["fetch", "ExternalStatus", {}],
        ["set", "@entity.id", "lastSync", "@now"]
      ]
    }
  ]
}
```

### Lastnosti cikla

| Lastnost | Opis |
|----------|------|
| `name` | Identifikator cikla |
| `interval` | Milisekunde ali niz, kot `"5s"`, `"1m"` |
| `guard` | Pogoj (cikel se preskoci, ce je false) |
| `effects` | Ucinki za izvedbo |
| `appliesTo` | Doloceni ID-ji entitet (neobvezno) |
| `description` | Cloveski opis |

### Pogosti vzorci ciklov

**Ciscenje:**
```orb
{
  "name": "cleanup",
  "interval": "300000",
  "effects": [["persist", "delete", "TempData", { "createdAt": ["<", ["-", "@now", 86400000]] }]]
}
```

**Periodicna sinhronizacija:**
```orb
{
  "name": "sync",
  "interval": "10000",
  "effects": [
    ["call-service", "external-api", "fetch-updates", {}],
    ["emit", "DATA_SYNCED", { "timestamp": "@now" }]
  ]
}
```

**Igralna zanka:**
```orb
{
  "name": "game_tick",
  "interval": "16",
  "effects": [
    ["set", "@entity.id", "position", ["+", "@entity.position", "@entity.velocity"]],
    ["render-ui", "canvas", { "type": "game-canvas" }]
  ]
}
```

---

## Reference na lastnosti in vgrajene lastnosti

Lastnosti se lahko definirajo vgrajeno ali se nanje sklicujemo iz zunanjih virov.

### Vgrajena definicija

Definirajte lastnost neposredno v Orbital enoti:

```orb
{
  "orbital": "TaskManagement",
  "traits": [
    {
      "name": "StatusTrait",
      "stateMachine": {
        "states": [...],
        "transitions": [...]
      }
    }
  ]
}
```

### Referenca

Sklicevanje na lastnost iz standardne knjiznice ali uvozov:

```orb
{
  "orbital": "TaskManagement",
  "uses": [
    { "from": "std/behaviors/crud", "as": "CRUD" }
  ],
  "traits": [
    {
      "ref": "CRUD.traits.CRUDManagement",
      "linkedEntity": "Task",
      "config": {
        "allowDelete": true,
        "softDelete": false
      }
    }
  ]
}
```

### Lastnosti referenc

| Lastnost | Opis |
|----------|------|
| `ref` | Pot do lastnosti (npr. `"Alias.traits.TraitName"`) |
| `linkedEntity` | Preglasitev vezave entitete |
| `config` | Konfiguracijske preglasitve |

### Kdaj uporabiti reference

- **Ponovno uporabni vzorci** - CRUD, avtentikacija, stranjevanje
- **Standardna obnasanja** - Iz `std/behaviors/`
- **Med-projektno deljenje** - Uvoz iz drugih programov
- **Konfiguracijski pogojeno** - Ista lastnost, drugacna konfiguracija

---

## Celoten primer

Celotna lastnost, ki prikazuje vse zmoznosti:

```orb
{
  "name": "CheckoutFlow",
  "category": "integration",
  "linkedEntity": "Order",
  "description": "Handles the checkout process from cart to confirmation",

  "emits": [
    { "event": "ORDER_PLACED", "scope": "external", "payload": [
      { "name": "orderId", "type": "string" },
      { "name": "total", "type": "number" }
    ]},
    { "event": "PAYMENT_FAILED", "scope": "internal" }
  ],

  "listens": [
    { "event": "CART_UPDATED", "triggers": "RECALCULATE", "scope": "internal" },
    { "event": "INVENTORY_RESERVED", "triggers": "CONFIRM_STOCK", "scope": "external" }
  ],

  "stateMachine": {
    "states": [
      { "name": "cart", "isInitial": true, "description": "Shopping cart" },
      { "name": "checkout", "description": "Entering shipping/payment" },
      { "name": "processing", "description": "Processing payment" },
      { "name": "confirmed", "description": "Order confirmed" },
      { "name": "failed", "isTerminal": true, "description": "Order failed" }
    ],

    "events": [
      { "key": "PROCEED", "name": "Proceed to Checkout" },
      { "key": "SUBMIT", "name": "Submit Order", "payload": [
        { "name": "paymentMethod", "type": "string", "required": true }
      ]},
      { "key": "PAYMENT_SUCCESS", "name": "Payment Succeeded" },
      { "key": "PAYMENT_FAILED", "name": "Payment Failed" },
      { "key": "RECALCULATE", "name": "Recalculate Totals" },
      { "key": "CONFIRM_STOCK", "name": "Stock Confirmed" }
    ],

    "transitions": [
      {
        "from": "cart",
        "to": "checkout",
        "event": "PROCEED",
        "guard": [">", ["count", "@entity.items"], 0],
        "effects": [
          ["render-ui", "main", { "type": "form", "schema": "checkout" }]
        ]
      },
      {
        "from": "checkout",
        "to": "processing",
        "event": "SUBMIT",
        "guard": ["and",
          ["!=", "@payload.paymentMethod", ""],
          [">=", "@entity.total", 0]
        ],
        "effects": [
          ["set", "@entity.id", "paymentMethod", "@payload.paymentMethod"],
          ["set", "@entity.id", "status", "processing"],
          ["call-service", "payment", "charge", {
            "amount": "@entity.total",
            "method": "@payload.paymentMethod"
          }],
          ["render-ui", "main", { "type": "stats", "loading": true }]
        ]
      },
      {
        "from": "processing",
        "to": "confirmed",
        "event": "PAYMENT_SUCCESS",
        "effects": [
          ["set", "@entity.id", "status", "confirmed"],
          ["set", "@entity.id", "confirmedAt", "@now"],
          ["persist", "update", "Order", "@entity.id", "@entity"],
          ["emit", "ORDER_PLACED", { "orderId": "@entity.id", "total": "@entity.total" }],
          ["notify", "Order confirmed!", "success"],
          ["navigate", "/orders/@entity.id"]
        ]
      },
      {
        "from": "processing",
        "to": "failed",
        "event": "PAYMENT_FAILED",
        "effects": [
          ["set", "@entity.id", "status", "failed"],
          ["emit", "PAYMENT_FAILED", { "orderId": "@entity.id" }],
          ["notify", "Payment failed. Please try again.", "error"]
        ]
      },
      {
        "from": ["cart", "checkout"],
        "to": "cart",
        "event": "RECALCULATE",
        "effects": [
          ["set", "@entity.id", "total", ["array/reduce", "@entity.items",
            ["lambda", ["sum", "item"], ["+", "@sum", "@item.price"]], 0]]
        ]
      }
    ]
  },

  "ticks": [
    {
      "name": "expire_abandoned",
      "interval": "300000",
      "guard": ["and",
        ["=", "@state", "checkout"],
        ["<", "@entity.updatedAt", ["-", "@now", 1800000]]
      ],
      "effects": [
        ["set", "@entity.id", "status", "abandoned"],
        ["persist", "update", "Order", "@entity.id", { "status": "abandoned" }]
      ]
    }
  ]
}
```

---

## Povzetek

Sistem lastnosti v Orb zagotavlja:

1. **Avtomati stanj** - Definirajo mozna stanja in prehode
2. **Pogoji** - Scitijo prehode z logicnimi pogoji
3. **Ucinki** - Izvajajo dejanja ob prehodu (UI, podatkovna baza, dogodki)
4. **Dvojno izvajanje** - Strezniski ucinki (persist, fetch) + odjemalski ucinki (render, navigate)
5. **Komunikacija z dogodki** - Oddajanje/poslusanje za med-lastnostno in med-orbitalno sporocanje
6. **Cikli** - Nacrtovani periodicni ucinki
7. **linkedEntity** - Eksplicitna vezava na [podatke entitete](./entities.md)
8. **Kategorije** - Razvrstitev lastnosti po namenu (interakcija, integracija, igra)
9. **Ponovna uporabnost** - Sklicevanje na lastnosti iz knjiznic ali vgrajena definicija

Lastnosti so vedenjsko jedro Orbital enot - definirajo, *kako* se entitete spreminjajo skozi cas prek deklarativnega, sestavljajocega modela avtomatov stanj.

---

*Dokument ustvarjen: 2026-02-02*
*Na podlagi analize kodne baze orbital-rust in builder paketov*
