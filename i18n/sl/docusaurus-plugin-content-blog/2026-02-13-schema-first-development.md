---
slug: schema-first-development
title: "Razvoj shema-first: Zakaj pišemo JSON pred TypeScriptom"
authors: [osamah]
tags: [architecture, tutorial]
image: /img/blog/schema-first-development.png
---

![Schema-First Development: Načrt, ki postane stavba](/img/blog/schema-first-development.png)

Kaj če bi definirali celotno aplikacijo v eni sami JSON datoteki, preden napisali katero koli komponento kode?

<!-- truncate -->

## Tradicionalni tok

Večina frontend razvoja izgleda tako:

1. Oblikuj UI mockupe
2. Ustvari hierarhijo komponent
3. Definiraj TypeScript vmesnike
4. Zgradi komponente
5. Dodaj state management
6. Poveži z backendom
7. Ugotovi, da API ne ustreza tvojim tipom
8. Refaktoriraj vse

Je iterativen, raziskovalen in pogosto vodi do neskladnosti med frontendom in backendom.

## Alternativa shema-first

Almadar obrne ta tok:

1. **Definiraj shemo** — Entities, traits, strani, state machines
2. **Validiraj jo** — Ujemi napake pred pisanjem kode
3. **Prevedi jo** — Generiraj TypeScript, Python ali Rust
4. **Zaženi jo** — Takoj jo vidiš delovati
5. **Prilagodi** — Dodaj poslovno logiko, kjer je potrebno

Shema postane **en sam vir resnice** za celotno aplikacijo.

## Kaj gre v shemo?

Almadar shema (`.orb` datoteka) vsebuje:

```json
{
  "name": "TaskApp",
  "version": "1.0.0",
  "orbitals": [
    {
      "name": "TaskManagement",
      "entity": {
        "name": "Task",
        "collection": "tasks",
        "fields": [
          { "name": "id", "type": "string", "required": true, "primaryKey": true },
          { "name": "title", "type": "string", "required": true },
          { "name": "status", "type": "enum", "values": ["todo", "in-progress", "done"] },
          { "name": "assigneeId", "type": "relation", "relation": { "entity": "User" } }
        ]
      },
      "traits": [
        {
          "name": "TaskBrowser",
          "linkedEntity": "Task",
          "stateMachine": {
            "states": [
              { "name": "Browsing", "isInitial": true },
              { "name": "Creating" },
              { "name": "Editing" }
            ],
            "events": [
              { "key": "INIT", "name": "Initialize" },
              { "key": "CREATE", "name": "Create" },
              { "key": "EDIT", "name": "Edit" },
              { "key": "SAVE", "name": "Save" },
              { "key": "CANCEL", "name": "Cancel" }
            ],
            "transitions": [
              {
                "from": "Browsing",
                "to": "Browsing",
                "event": "INIT",
                "effects": [
                  ["render-ui", "main", {
                    "type": "page-header",
                    "title": "Tasks",
                    "actions": [{ "label": "New Task", "event": "CREATE" }]
                  }],
                  ["render-ui", "main", {
                    "type": "entity-table",
                    "entity": "Task",
                    "columns": ["title", "status"],
                    "itemActions": [
                      { "label": "Edit", "event": "EDIT" }
                    ]
                  }]
                ]
              },
              {
                "from": "Browsing",
                "to": "Creating",
                "event": "CREATE",
                "effects": [
                  ["render-ui", "modal", {
                    "type": "form-section",
                    "entity": "Task",
                    "fields": ["title", "status"],
                    "submitEvent": "SAVE",
                    "cancelEvent": "CANCEL"
                  }]
                ]
              },
              {
                "from": "Creating",
                "to": "Browsing",
                "event": "SAVE",
                "effects": [
                  ["persist", "create", "Task", "@payload.data"],
                  ["render-ui", "modal", null],
                  ["emit", "INIT"]
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
          "traits": [{ "ref": "TaskBrowser" }]
        }
      ]
    }
  ]
}
```

Ta ena datoteka definira:
- **Podatkovni model** (Entity s polji)
- **Poslovno logiko** (State machine s prehodi)
- **UI strukturo** (render-ui effects s patterni)
- **Poti** (Strani s potmi)

## Varnostna mreža validacije

Pred generiranjem kode Almadar validira vašo shemo:

```bash
$ orbital validate task-app.orb

✓ Schema structure valid
✓ Entity fields valid
✓ State machine complete
✓ All transitions have handlers
✓ Pattern props match registry
✓ Closed circuit verified

Validation passed! Ready to compile.
```

Če je napaka:

```bash
✗ Error: CIRCUIT_NO_OVERLAY_EXIT
  State 'Creating' renders to 'modal' slot but has no exit transition.
  Users will be stuck in this overlay.
  
  Fix: Add a transition from 'Creating' with event 'CANCEL' or 'CLOSE'
```

To ujame napake **preden napišete katero koli kodo**.

## Generiranje aplikacij

Ko je validirana, prevedite v svoj target:

```bash
# TypeScript/React
orbital compile task-app.orb --shell typescript -o output/

# Python/FastAPI
orbital compile task-app.orb --shell python -o output/

# Rust/Axum
orbital compile task-app.orb --shell rust -o output/
```

Vsak generira:
- **Frontend**: React komponente z vašo state machine
- **Backend**: API route z modeli podatkovne baze
- **Types**: Skupni TypeScript/Python/Rust tipi
- **State Management**: Event bus in state transitions

## Pravilo "Nikoli ne urejaj generirane kode"

Tu je protintuitiven del: **ne urejate generiranih datotek**.

Če potrebujete spremembe:
1. Uredite `.orb` shemo
2. Prevedite znova
3. Spremembe se prelijejo skozi

To zagotavlja:
- **Konsistentnost**: Shema in koda se vedno ujemata
- **Reproducibilnost**: Ista shema = isti rezultat
- **Prenosljivost**: Prevedite v različne targete iz enega vira

## Poskusite: Zgradite blog v 5 minutah

Ustvarite `blog.orb`:

```json
{
  "name": "Blog",
  "version": "1.0.0",
  "orbitals": [
    {
      "name": "PostManagement",
      "uses": [{ "from": "std/List", "as": "List" }],
      "entity": {
        "name": "Post",
        "fields": [
          { "name": "title", "type": "string", "required": true },
          { "name": "content", "type": "string", "required": true },
          { "name": "published", "type": "boolean", "default": false }
        ]
      },
      "traits": [{ "ref": "List.traits.ListManagement" }],
      "pages": [{ "name": "PostsPage", "path": "/posts" }]
    }
  ]
}
```

Prevedite in zaženi:
```bash
orbital compile blog.orb --shell typescript -o blog-app/
cd blog-app && npm install && npm run dev
```

Zdaj imate delujoč blog admin panel s seznamom, ustvarjanjem, urejanjem in brisanjem.

## Spoznanje

Razvoj shema-first ni o odstranjevanju fleksibilnosti — je o **jasnosti najprej, fleksibilnosti drugje**.

Z deklarativno definicijo strukture aplikacije:
- Ujameš napake zgodaj
- Tvoja ekipa ima skupno, berljivo specifikacijo
- AI asistenti lahko razumejo in spreminjajo tvojo aplikacijo
- Lahko targetiraš več platform

Shema postane **dokumentacija, ki se izvaja**.

Pripravljeni napisati svojo prvo shemo? Oglejte si [vodnik za začetek](https://orb.almadar.io/docs/getting-started/introduction).
