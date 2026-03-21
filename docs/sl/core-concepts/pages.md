# Strani

> Kako strani delujejo v arhitekturi Orb - usmerjanje, vezava lastnosti, rezine in navigacija.

**Povezano:**
- [Entitete](./entities.md)
- [Lastnosti](./traits.md)

---

## Pregled

V jeziku Orb je **Stran** pot, ki sestavlja lastnosti za upodabljanje UI. Temeljni sestav je:

```
Orbital = Entiteta + Lastnosti + Strani
```

Medtem ko [Entitete](./entities.md) definirajo podatke in [Lastnosti](./traits.md) definirajo obnasanje, Strani definirajo, **kje** uporabniki komunicirajo s sistemom. Strani so **vodene z lastnostmi** - ne vsebujejo UI neposredno, ampak se sklicujejo na lastnosti, katerih ucinki `render-ui` zapolnijo stran.

---

## Definicija strani

Stran je definirana v `.orb` programu z naslednjo strukturo:

```json
{
  "name": "TaskListPage",
  "path": "/tasks",
  "viewType": "list",
  "primaryEntity": "Task",
  "traits": [
    { "ref": "TaskBrowser", "linkedEntity": "Task" },
    { "ref": "FilterPanel", "linkedEntity": "Task" }
  ]
}
```

### Lastnosti strani

| Lastnost | Obvezno | Opis |
|----------|---------|------|
| `name` | Da | Identifikator v PascalCase (npr. `TaskListPage`) |
| `path` | Da | URL pot, ki se zacne z `/` |
| `viewType` | Ne | Semanticni namig: `list`, `detail`, `create`, `edit`, `dashboard`, `custom` |
| `primaryEntity` | Ne | Glavna entiteta, na kateri ta stran deluje |
| `traits` | Da | Seznam referenc na lastnosti, ki poganjajo UI |
| `isInitial` | Ne | Ali je to vstopna stran |

---

## Poti in vzorci poti

Poti strani definirajo URL poti za vaso aplikacijo.

### Pravila poti

- Mora se zaceti z `/`
- Veljavni znaki: crke, stevilke, pomisljaji, podcrke, dvopicja, posevnice
- Mora biti edinstvena med vsemi stranmi v programu

### Staticne poti

Preproste poti brez dinamicnih segmentov:

```json
{ "path": "/tasks" }
{ "path": "/dashboard" }
{ "path": "/settings/profile" }
```

### Dinamicni segmenti

Uporabite sintakso z dvopicjem za dinamicne parametre:

```json
{ "path": "/tasks/:id" }
{ "path": "/users/:userId/tasks/:taskId" }
{ "path": "/projects/:projectId/members/:memberId" }
```

Dinamicni segmenti so izvleceni in na voljo v:
- Obremenitvah dogodkov (`@payload.id`)
- Ucinkih navigacije
- Iskanju entitet

### Primeri poti

| Pot | Opis |
|-----|------|
| `/tasks` | Stran seznama nalog |
| `/tasks/:id` | Podrobnosti posamezne naloge |
| `/tasks/create` | Ustvarjanje nove naloge |
| `/tasks/:id/edit` | Urejanje obstojece naloge |
| `/users/:id/profile` | Uporabniski profil |
| `/dashboard` | Pregledna plosca |

---

## Tipi pogledov

Tipi pogledov so semanticni namigi o namenu strani:

| Tip | Namen | Tipicni vzorci |
|-----|-------|-----------------|
| `list` | Prikaz zbirke entitet | `entity-table`, `entity-cards`, `entity-list` |
| `detail` | Prikaz posamezne entitete | `entity-detail`, `stats` |
| `create` | Ustvarjanje nove entitete | `form` |
| `edit` | Urejanje obstojece entitete | `form` |
| `dashboard` | Pregled z vec razdelki | `dashboard-grid`, `stats` |
| `custom` | Prilagojena postavitev | Katerikoli vzorci |

**Pomembno:** Tipi pogledov ne omejujejo UI - dejansko upodabljanje nadzirajo ucinki `render-ui` v [lastnostih](./traits.md#effects). Tipi pogledov so metapodatki za:
- Dokumentacijo
- Namige za generiranje kode
- Ogrodje UI

---

## Vezava Stran-Lastnost

Strani se sklicujejo na lastnosti, ki zagotavljajo njihovo obnasanje in UI.

### Reference na lastnosti

```json
{
  "pages": [
    {
      "name": "TaskListPage",
      "path": "/tasks",
      "traits": [
        { "ref": "TaskBrowser", "linkedEntity": "Task" },
        { "ref": "QuickActions", "linkedEntity": "Task", "config": { "showCreate": true } }
      ]
    }
  ]
}
```

### Struktura PageTraitRef

| Lastnost | Obvezno | Opis |
|----------|---------|------|
| `ref` | Da | Ime lastnosti ali pot (npr. `"TaskBrowser"`, `"Std.traits.CRUD"`) |
| `linkedEntity` | Ne | Entiteta, na kateri ta lastnost deluje |
| `config` | Ne | Konfiguracija, specificna za lastnost |

### Vec lastnosti na stran

Stran ima lahko vec lastnosti, od katerih vsaka prispeva UI v razlicne rezine:

```json
{
  "name": "DashboardPage",
  "path": "/dashboard",
  "traits": [
    { "ref": "StatsSummary", "linkedEntity": "Analytics" },
    { "ref": "RecentActivity", "linkedEntity": "Activity" },
    { "ref": "QuickActions", "linkedEntity": "Task" }
  ]
}
```

Ucinki `render-ui` vsake lastnosti ciljajo dolocene [rezine](#rezine-in-upodabljanje-ui).

### linkedEntity na lastnostih

Lastnost `linkedEntity` veze lastnost na doloceno entiteto:

```json
{ "ref": "StatusManager", "linkedEntity": "Task" }
```

To pomeni:
- Vezave `@entity` v lastnosti se razresijo na podatke `Task`
- Ucinki, kot je `persist`, delujejo na zbirki `Task`
- Avtomat stanj lastnosti upravlja primerke `Task`

Glej [Vezava Lastnost-Entiteta](./traits.md#linkedentity-trait-entity-binding) za podrobnosti.

---

## Primarna entiteta

Lastnost `primaryEntity` oznacuje glavno entiteto, na kateri stran deluje:

```json
{
  "name": "TaskDetailPage",
  "path": "/tasks/:id",
  "primaryEntity": "Task",
  "traits": [
    { "ref": "TaskViewer" },
    { "ref": "CommentList", "linkedEntity": "Comment" }
  ]
}
```

**Uporaba:**
- Privzeta entiteta za lastnosti brez eksplicitnega `linkedEntity`
- Preverjanje, da entiteta obstaja
- Namigi za generiranje kode
- Ni obvezno, ce vse lastnosti eksplicitno dolocijo svojo entiteto

---

## Rezine in upodabljanje UI

Lastnosti upodabljajo UI prek ucinkov `render-ui`, ki ciljajo **rezine** - poimenovana podrocja na strani.

### Razpolozljive rezine

| Rezina | Namen |
|--------|-------|
| `main` | Primarno podrocje vsebine |
| `sidebar` | Stranski panel |
| `modal` | Modalno prekrivanje |
| `drawer` | Predalni panel |
| `overlay` | Celozaslonsko prekrivanje |
| `center` | Srediscna vsebina |
| `toast` | Obvestila toast |
| `hud-top` | Zgornji HUD (igralni UI) |
| `hud-bottom` | Spodnji HUD (igralni UI) |
| `floating` | Plavajoci element |
| `system` | Nevidne sistemske komponente |

### Ucinek render-ui

Lastnosti zapolnijo rezine z ucinkom `render-ui`:

```json
["render-ui", "main", {
  "type": "entity-table",
  "entity": "Task",
  "columns": ["title", "status", "dueDate"],
  "itemActions": [
    { "event": "VIEW", "label": "View" },
    { "event": "EDIT", "label": "Edit" }
  ]
}]
```

### Tok rezin

```
┌─────────────────────────────────────────────────────────────┐
│  Stran: TaskListPage                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Rezina: main                                        │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │  Vzorec: entity-table (iz TaskBrowser)      │    │   │
│  │  │  - Stolpci: title, status, dueDate          │    │   │
│  │  │  - Akcije: VIEW, EDIT                       │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Rezina: sidebar                                     │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │  Vzorec: filter-panel (iz FilterPanel)      │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Vec upodobitev v isto rezino

Ce vec lastnosti upodablja v isto rezino, se zlagajo (kasnejsi nadomesti ali doda, odvisno od tipa vzorca):

```json
// Lastnost A
["render-ui", "main", { "type": "stats", ... }]

// Lastnost B (kasneje na strani)
["render-ui", "main", { "type": "entity-table", ... }]
```

---

## Navigacija

Navigacija med stranmi se izvaja prek ucinka `navigate` v lastnostih.

### Ucinek navigate

```json
["navigate", "/tasks/:id", { "id": "@payload.taskId" }]
```

**Format:** `["navigate", pot, parametri?]`

| Argument | Opis |
|----------|------|
| `pot` | Ciljna pot strani (lahko vkljucuje dinamicne segmente) |
| `parametri` | Neobvezni objekt za zapolnitev dinamicnih segmentov |

### Primeri navigacije

**Preprosta navigacija:**
```json
["navigate", "/dashboard"]
```

**Z ID-jem entitete:**
```json
["navigate", "/tasks/@entity.id"]
```

**Z obremenitvijo:**
```json
["navigate", "/tasks/:id", { "id": "@payload.taskId" }]
```

**Gnezdena pot:**
```json
["navigate", "/users/:userId/tasks/:taskId", {
  "userId": "@entity.assigneeId",
  "taskId": "@entity.id"
}]
```

### Navigacija v prehodih

Navigacija se tipicno zgodi po spremembi stanja:

```json
{
  "from": "editing",
  "to": "saved",
  "event": "SAVE",
  "effects": [
    ["persist", "update", "Task", "@entity.id", "@payload"],
    ["notify", "Task saved!", "success"],
    ["navigate", "/tasks/@entity.id"]
  ]
}
```

Glej [Ucinki](./traits.md#effects) za vec podrobnosti.

---

## Zacetna stran

Oznacite stran kot vstopno tocko z `isInitial`:

```json
{
  "name": "HomePage",
  "path": "/",
  "isInitial": true,
  "traits": [
    { "ref": "WelcomeBanner" }
  ]
}
```

**Obnasanje:**
- Aplikacija najprej nalozi to stran
- Preusmeritve iz korena (`/`) vodijo sem
- Samo ena stran naj bo oznacena kot zacetna na Orbital enoto

---

## Preverjanje strani

Strani se preverjajo ob prevajanju s temi pravili:

### Obvezna polja
- `name` - Mora biti v PascalCase
- `path` - Mora se zaceti z `/`, samo veljavni znaki
- `traits` - Mora imeti vsaj eno referenco na lastnost

### Napake pri preverjanju

| Napaka | Opis |
|--------|------|
| `PageMissingName` | Ime strani je obvezno |
| `PageMissingPath` | Pot strani je obvezna |
| `PageInvalidPath` | Pot ne ustreza vzorcu |
| `PageEmptyTraits` | Seznam lastnosti ne sme biti prazen |
| `PageInvalidTraitRef` | Referencirana lastnost ne obstaja |
| `PageInvalidViewType` | viewType ni na veljavnem seznamu |
| `PageDuplicatePath` | Druga stran uporablja isto pot |

---

## Celoten primer

Celoten primer strani z vec lastnostmi:

```json
{
  "orbitals": [
    {
      "name": "TaskManagement",
      "entity": {
        "name": "Task",
        "collection": "tasks",
        "fields": [
          { "name": "id", "type": "string", "required": true },
          { "name": "title", "type": "string", "required": true },
          { "name": "status", "type": "enum", "values": ["pending", "active", "done"] },
          { "name": "assigneeId", "type": "relation", "relation": { "entity": "User" } }
        ]
      },
      "traits": [
        {
          "name": "TaskBrowser",
          "linkedEntity": "Task",
          "stateMachine": {
            "states": [
              { "name": "idle", "isInitial": true },
              { "name": "viewing" }
            ],
            "transitions": [
              {
                "from": "idle",
                "to": "viewing",
                "event": "INIT",
                "effects": [
                  ["fetch", "Task", {}],
                  ["render-ui", "main", {
                    "type": "entity-table",
                    "entity": "Task",
                    "columns": ["title", "status", "assigneeId"],
                    "itemActions": [
                      { "event": "VIEW", "label": "View" },
                      { "event": "EDIT", "label": "Edit" }
                    ]
                  }]
                ]
              },
              {
                "from": "viewing",
                "to": "viewing",
                "event": "VIEW",
                "effects": [
                  ["navigate", "/tasks/@payload.id"]
                ]
              }
            ]
          }
        },
        {
          "name": "TaskViewer",
          "linkedEntity": "Task",
          "stateMachine": {
            "states": [
              { "name": "loading", "isInitial": true },
              { "name": "viewing" }
            ],
            "transitions": [
              {
                "from": "loading",
                "to": "viewing",
                "event": "INIT",
                "effects": [
                  ["fetch", "Task", { "id": "@payload.id" }],
                  ["render-ui", "main", {
                    "type": "entity-detail",
                    "entity": "Task",
                    "fields": ["title", "status", "assigneeId", "createdAt"]
                  }]
                ]
              },
              {
                "from": "viewing",
                "to": "viewing",
                "event": "EDIT",
                "effects": [
                  ["navigate", "/tasks/@entity.id/edit"]
                ]
              },
              {
                "from": "viewing",
                "to": "viewing",
                "event": "BACK",
                "effects": [
                  ["navigate", "/tasks"]
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
          "viewType": "list",
          "primaryEntity": "Task",
          "isInitial": true,
          "traits": [
            { "ref": "TaskBrowser", "linkedEntity": "Task" }
          ]
        },
        {
          "name": "TaskDetailPage",
          "path": "/tasks/:id",
          "viewType": "detail",
          "primaryEntity": "Task",
          "traits": [
            { "ref": "TaskViewer", "linkedEntity": "Task" }
          ]
        }
      ]
    }
  ]
}
```

---

## Kljucna nacela

1. **Strani vodene z lastnostmi** - Strani so vsebniki za reference na lastnosti. UI izhaja iz ucinkov `render-ui` v lastnostih, ne iz definicij strani.

2. **Arhitektura rezin** - UI tece skozi standardizirane rezine (`main`, `sidebar`, `modal`), kar omogoca sestavo postavitev brez trdega kodiranja.

3. **Pot kot pogodba** - Pot strani je primarni vmesnik - definira URL, na katerega uporabniki navigirajo.

4. **Eksplicitna vezava entitete** - `linkedEntity` na referencah lastnosti naredi relacije entitet eksplicitne.

5. **Brez stanja strani** - Strani so zgolj sestavne. Vse stanje zivi v avtomatih stanj lastnosti.

6. **Navigacija vodena z ucinki** - Navigacija je ucinek, ki ga sprozijo prehodi lastnosti, ne lastnost strani.

---

## Povzetek

Sistem strani v Orb zagotavlja:

1. **Usmerjanje** - Navigacija na osnovi poti z dinamicnimi segmenti
2. **Sestava lastnosti** - Vec lastnosti na stran, vsaka prispeva UI
3. **Rezine** - Poimenovana podrocja za postavitev UI (main, sidebar, modal itd.)
4. **Tipi pogledov** - Semanticni namigi za namen strani (list, detail, dashboard)
5. **Navigacija** - Usmerjanje med stranmi, vodeno z ucinki
6. **Vezava entitete** - Eksplicitne relacije entitet prek `linkedEntity`
7. **Preverjanje** - Prevajalnik uveljavlja edinstvenost poti in obstoj lastnosti

Strani so plast za usmerjanje in sestavo - definirajo, **kam** uporabniki gredo, medtem ko [lastnosti](./traits.md) definirajo, **kaj** se dogaja, in [entitete](./entities.md) definirajo, **kateri podatki** so vpleteni.
