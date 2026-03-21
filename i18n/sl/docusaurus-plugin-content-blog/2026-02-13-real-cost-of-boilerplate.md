---
slug: real-cost-of-boilerplate
title: "Od 10.000 vrstic do 200: Pravi strošek boilerplate kode"
authors: [osamah]
tags: [startups, productivity, tutorial]
---

Želite zgraditi upravljalnik nalog. Preprost CRUD: ustvari, preberi, posodobi, izbriši.

Tradicionalni način: 10.000 vrstic v 50+ datotekah. Almadar način: 200 vrstic v eni datoteki.

To ni teoretična primerjava. Štejmo.

<!-- truncate -->

## Tradicionalni Stack: Revizija štetja vrstic

Gradnja upravljalnika nalog z React + Express + PostgreSQL. Preštejmo vsako datoteko, ki jo potrebujete:

### Frontend (~4.500 vrstic)

```
src/
  types/Task.ts                    ~30 vrstic   (interface, enums)
  api/tasks.ts                     ~80 vrstic   (fetch, create, update, delete)
  hooks/useTasks.ts                ~60 vrstic   (React Query wrapper)
  hooks/useCreateTask.ts           ~40 vrstic   (mutation hook)
  hooks/useUpdateTask.ts           ~40 vrstic   (mutation hook)
  hooks/useDeleteTask.ts           ~35 vrstic   (mutation hook)
  components/TaskList.tsx           ~120 vrstic  (table, loading, error, empty)
  components/TaskRow.tsx            ~60 vrstic   (row with actions)
  components/TaskForm.tsx           ~150 vrstic  (form with validation)
  components/TaskDetail.tsx         ~100 vrstic  (detail view)
  components/DeleteConfirm.tsx      ~50 vrstic   (confirmation modal)
  pages/TasksPage.tsx              ~80 vrstic   (page layout, routing)
  store/taskSlice.ts               ~120 vrstic  (Redux slice or Zustand store)
  App.tsx (routing)                ~40 vrstic   (React Router setup)
  main.tsx                         ~20 vrstic   (entry point)
```

Plus styling, testi in konfiguracija:

```
  components/*.css                 ~400 vrstic  (or Tailwind classes)
  __tests__/TaskList.test.tsx      ~150 vrstic
  __tests__/TaskForm.test.tsx      ~200 vrstic
  __tests__/TaskDetail.test.tsx    ~100 vrstic
  vite.config.ts                   ~30 vrstic
  tsconfig.json                    ~25 vrstic
  package.json                     ~40 vrstic
```

**Frontend skupaj: ~2.000 vrstic kode + ~500 vrstic testov + ~100 vrstic config = ~2.600**

### Backend (~3.200 vrstic)

```
src/
  models/Task.ts                   ~60 vrstic   (Prisma/TypeORM model)
  routes/tasks.ts                  ~150 vrstic  (CRUD endpoints)
  controllers/taskController.ts    ~200 vrstic  (business logic)
  middleware/auth.ts               ~80 vrstic   (authentication)
  middleware/validation.ts         ~100 vrstic  (request validation)
  services/taskService.ts          ~150 vrstic  (database queries)
  types/task.ts                    ~40 vrstic   (request/response types)
  index.ts                         ~60 vrstic   (Express setup)
  database/migrations/             ~80 vrstic   (table creation)
  database/seed.ts                 ~40 vrstic   (test data)
```

Plus testi in konfiguracija:

```
  __tests__/tasks.test.ts          ~300 vrstic  (API tests)
  __tests__/taskService.test.ts    ~200 vrstic  (unit tests)
  prisma/schema.prisma             ~30 vrstic
  tsconfig.json                    ~25 vrstic
  package.json                     ~35 vrstic
  .env                             ~10 vrstic
  Dockerfile                       ~20 vrstic
```

**Backend skupaj: ~960 vrstic kode + ~500 vrstic testov + ~120 vrstic config = ~1.580**

### Skupno/Infrastruktura (~800 vrstic)

```
  docker-compose.yml               ~40 vrstic
  .github/workflows/ci.yml         ~80 vrstic
  README.md                        ~100 vrstic
  package.json (root)              ~30 vrstic
  Shared types between FE/BE       ~50 vrstic
  Error handling utilities          ~80 vrstic
  Logger setup                     ~40 vrstic
```

### Skupaj: Tradicionalni Task Manager

| Kategorija | Vrstic |
|----------|-------|
| Frontend koda | 2.000 |
| Frontend testi | 500 |
| Backend koda | 960 |
| Backend testi | 500 |
| Config/infra | 920 |
| **Skupaj** | **~4.880** |

In to je *preprosta* različica. Brez paginacije, brez iskanja, brez filtrov, brez optimistic updates, brez error boundaries. Aplikacije v resničnem svetu zlahka dosežejo 10.000+ vrstic za tisto, kar uporabniki dojemajo kot "preprost upravljalnik nalog."

## Almadar različica: 120 vrstic

```json
{
  "name": "Taskly",
  "version": "1.0.0",
  "orbitals": [{
    "name": "TaskManagement",
    "entity": {
      "name": "Task",
      "collection": "tasks",
      "fields": [
        { "name": "title", "type": "string", "required": true },
        { "name": "description", "type": "string" },
        { "name": "status", "type": "enum", "values": ["todo", "in-progress", "done"] },
        { "name": "priority", "type": "enum", "values": ["low", "medium", "high"] },
        { "name": "assignee", "type": "string" },
        { "name": "dueDate", "type": "date" }
      ]
    },
    "traits": [{
      "name": "TaskInteraction",
      "category": "interaction",
      "linkedEntity": "Task",
      "stateMachine": {
        "states": [
          { "name": "Browsing", "isInitial": true },
          { "name": "Creating" },
          { "name": "Viewing" },
          { "name": "Editing" },
          { "name": "Deleting" }
        ],
        "events": [
          { "key": "INIT", "name": "Initialize" },
          { "key": "CREATE", "name": "Create Task" },
          { "key": "VIEW", "name": "View Task" },
          { "key": "EDIT", "name": "Edit Task" },
          { "key": "DELETE", "name": "Delete Task" },
          { "key": "SAVE", "name": "Save" },
          { "key": "CANCEL", "name": "Cancel" },
          { "key": "CONFIRM_DELETE", "name": "Confirm Delete" }
        ],
        "transitions": [
          {
            "from": "Browsing", "to": "Browsing", "event": "INIT",
            "effects": [
              ["render-ui", "main", {
                "type": "page-header",
                "title": "Naloge",
                "actions": [{ "label": "Nova naloga", "event": "CREATE", "variant": "primary" }]
              }],
              ["render-ui", "main", {
                "type": "entity-table",
                "entity": "Task",
                "columns": ["title", "status", "priority", "assignee", "dueDate"],
                "itemActions": [
                  { "label": "Poglej", "event": "VIEW" },
                  { "label": "Uredi", "event": "EDIT" },
                  { "label": "Izbriši", "event": "DELETE" }
                ]
              }]
            ]
          },
          {
            "from": "Browsing", "to": "Creating", "event": "CREATE",
            "effects": [
              ["render-ui", "modal", {
                "type": "form-section",
                "entity": "Task",
                "fields": ["title", "description", "status", "priority", "assignee", "dueDate"],
                "submitEvent": "SAVE",
                "cancelEvent": "CANCEL"
              }]
            ]
          },
          {
            "from": "Creating", "to": "Browsing", "event": "SAVE",
            "effects": [
              ["persist", "create", "Task", "@payload.data"],
              ["render-ui", "modal", null],
              ["emit", "INIT"]
            ]
          },
          {
            "from": "Creating", "to": "Browsing", "event": "CANCEL",
            "effects": [["render-ui", "modal", null]]
          },
          {
            "from": "Browsing", "to": "Viewing", "event": "VIEW",
            "effects": [
              ["render-ui", "modal", {
                "type": "entity-detail",
                "entity": "Task",
                "fields": ["title", "description", "status", "priority", "assignee", "dueDate"],
                "actions": [
                  { "label": "Uredi", "event": "EDIT" },
                  { "label": "Zapri", "event": "CANCEL" }
                ]
              }]
            ]
          },
          {
            "from": "Viewing", "to": "Browsing", "event": "CANCEL",
            "effects": [["render-ui", "modal", null]]
          },
          {
            "from": "Viewing", "to": "Editing", "event": "EDIT",
            "effects": [
              ["render-ui", "modal", {
                "type": "form-section",
                "entity": "Task",
                "fields": ["title", "description", "status", "priority", "assignee", "dueDate"],
                "submitEvent": "SAVE",
                "cancelEvent": "CANCEL"
              }]
            ]
          },
          {
            "from": "Browsing", "to": "Editing", "event": "EDIT",
            "effects": [
              ["render-ui", "modal", {
                "type": "form-section",
                "entity": "Task",
                "fields": ["title", "description", "status", "priority", "assignee", "dueDate"],
                "submitEvent": "SAVE",
                "cancelEvent": "CANCEL"
              }]
            ]
          },
          {
            "from": "Editing", "to": "Browsing", "event": "SAVE",
            "effects": [
              ["persist", "update", "Task", "@entity"],
              ["render-ui", "modal", null],
              ["emit", "INIT"]
            ]
          },
          {
            "from": "Editing", "to": "Browsing", "event": "CANCEL",
            "effects": [["render-ui", "modal", null]]
          },
          {
            "from": "Browsing", "to": "Deleting", "event": "DELETE",
            "effects": [
              ["render-ui", "modal", {
                "type": "page-header",
                "title": "Ali ste prepričani, da želite izbrisati to nalogo?",
                "actions": [
                  { "label": "Izbriši", "event": "CONFIRM_DELETE", "variant": "danger" },
                  { "label": "Prekliči", "event": "CANCEL" }
                ]
              }]
            ]
          },
          {
            "from": "Deleting", "to": "Browsing", "event": "CONFIRM_DELETE",
            "effects": [
              ["persist", "delete", "Task", "@entity.id"],
              ["render-ui", "modal", null],
              ["emit", "INIT"]
            ]
          },
          {
            "from": "Deleting", "to": "Browsing", "event": "CANCEL",
            "effects": [["render-ui", "modal", null]]
          }
        ]
      }
    }],
    "pages": [{
      "name": "TasksPage",
      "path": "/tasks",
      "traits": [{ "ref": "TaskInteraction" }]
    }]
  }]
}
```

**120 vrstic.** To generira:

- React frontend s tabelo, formami, detail view, delete confirmation
- Express backend s CRUD API endpointi
- Modele baze in persistenco
- TypeScript tipe, deljene med frontendom in backendom
- State management preko event bus
- Route handling

```bash
orbital compile taskly.orb --shell typescript -o taskly-app/
cd taskly-app && npm install && npm run dev
```

## Multiplikator vzdrževanja

Vrstice kode niso samo strošek razvoja. So **davčni naložek vzdrževanja**.

Vsaka vrstica je:
- Vrstica, ki lahko ima napako
- Vrstica, ki jo mora nekdo razumeti med onboardingom
- Vrstica, ki potrebuje posodobitev, ko se zahteve spremenijo
- Vrstica, ki potrebuje testiranje

| Metrika | Tradicionalno (4.880 vrstic) | Almadar (120 vrstic) |
|--------|--------------------------|---------------------|
| Površina za napake | ~4.880 potencialnih lokacij napak | ~120 potencialnih lokacij napak |
| Čas onboardinga | Dnevi do tedni | Ure |
| Širjenje sprememb | Dotakni frontend + backend + tipe | Uredi shemo, prevedi |
| Pokritost s testi | ~1.000 vrstic testov | Schema validation + smoke tests |

Ko v tradicionalni različici spremenite ime polja, posodobite model baze, Prisma shemo, TypeScript interface, API endpoint, form komponento, table komponento, detail komponento in teste. **Sedem mest** za en rename.

V Almadarju ga spremenite v definiciji entity. Eno mesto. Prevedi.

## Kaj žrtvujete

Almadar ni magija. Tukaj je tisto, kar date:

1. **Custom UI** — Generirane komponente sledijo vzorcem. Za pixel-perfect designe zgradite custom design system (kar Almadar tudi podpira).
2. **Nenavadni vzorci dostopa do podatkov** — Če vaša poizvedba ne more biti izražena kot standardni CRUD, potrebujete custom effects.
3. **Nadzor** — Ne vidite ali urejate generiranih React komponent. Če generirana koda ima napako, popravite shemo, compiler ali shell template — ne outputa.

Za večino poslovnih aplikacij — tistih z formami, tabelami, modali in CRUD — so ti kompromisi popolnoma vredni.

## Spoznanje

Strošek programske opreme ni pisanje. Je vzdrževanje.

Schema s 120 vrsticami, ki generira 5.000-vrstično aplikacijo, pomeni:
- 40x manj kode za vzdrževanje
- 40x manjša površina za napake
- 40x hitrejši onboarding
- Eno mesto za spremembo, ne sedem

Resnično vprašanje ni "ali lahko napišem 5.000 vrstic?" Ampak "ali jih želim vzdrževati naslednjih 5 let?"

Začnite z [Getting Started vodnikom](https://orb.almadar.io/docs/getting-started/introduction) in sami vidite razliko.
