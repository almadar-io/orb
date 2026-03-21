---
title: Hitri zacetek
sidebar_label: Hitri zacetek
---

# Hitri zacetek

Zgradite in zazenite celotno aplikacijo v manj kot 5 minutah. Na koncu boste imeli delujoce upravljanje nalog s podatkovno tabelo, obrazci za ustvarjanje/urejanje in upravljanjem stanj.

## Predpogoji

- Namescen CLI `orb` ([Namestitev](./installation.md))
- Node.js 18+ in npm

## 1. Napisite svojo prvo .orb datoteko

Ustvarite datoteko z imenom `my-app.orb` z naslednjo vsebino:

```json
{
  "app": {
    "name": "my-app",
    "title": "My Task Manager"
  },
  "orbitals": [
    {
      "name": "TaskManager",
      "entity": {
        "name": "Task",
        "persistence": "persistent",
        "collection": "tasks",
        "fields": [
          { "name": "id", "type": "string", "required": true },
          { "name": "title", "type": "string", "required": true },
          { "name": "description", "type": "string" },
          { "name": "status", "type": "enum", "values": ["pending", "in_progress", "done"], "default": "pending" }
        ]
      },
      "traits": [
        {
          "name": "TaskCrud",
          "linkedEntity": "Task",
          "category": "interaction",
          "stateMachine": {
            "states": [
              { "name": "Listing", "isInitial": true },
              { "name": "Creating" },
              { "name": "Editing" }
            ],
            "events": [
              { "key": "INIT", "name": "Initialize" },
              { "key": "CREATE", "name": "Create Task" },
              { "key": "EDIT", "name": "Edit Task" },
              { "key": "SAVE", "name": "Save" },
              { "key": "CANCEL", "name": "Cancel" },
              { "key": "DELETE", "name": "Delete Task" }
            ],
            "transitions": [
              {
                "from": "Listing",
                "event": "INIT",
                "to": "Listing",
                "effects": [
                  ["fetch", "Task"],
                  ["render-ui", "main", {
                    "type": "entity-table",
                    "entity": "Task",
                    "columns": ["title", "status"],
                    "actions": [
                      { "event": "CREATE", "label": "New Task", "icon": "plus" }
                    ],
                    "itemActions": [
                      { "event": "EDIT", "label": "Edit" },
                      { "event": "DELETE", "label": "Delete", "variant": "danger" }
                    ]
                  }]
                ]
              },
              {
                "from": "Listing",
                "event": "CREATE",
                "to": "Creating",
                "effects": [
                  ["render-ui", "modal", {
                    "type": "entity-form",
                    "entity": "Task",
                    "fields": ["title", "description", "status"],
                    "submitEvent": "SAVE",
                    "cancelEvent": "CANCEL"
                  }]
                ]
              },
              {
                "from": "Creating",
                "event": "SAVE",
                "to": "Listing",
                "effects": [
                  ["persist", "create", "Task", "@payload"],
                  ["notify", "success", "Task created"]
                ]
              },
              {
                "from": "Creating",
                "event": "CANCEL",
                "to": "Listing"
              },
              {
                "from": "Listing",
                "event": "EDIT",
                "to": "Editing",
                "effects": [
                  ["render-ui", "modal", {
                    "type": "entity-form",
                    "entity": "Task",
                    "fields": ["title", "description", "status"],
                    "submitEvent": "SAVE",
                    "cancelEvent": "CANCEL"
                  }]
                ]
              },
              {
                "from": "Editing",
                "event": "SAVE",
                "to": "Listing",
                "effects": [
                  ["persist", "update", "Task", "@entity"],
                  ["notify", "success", "Task updated"]
                ]
              },
              {
                "from": "Editing",
                "event": "CANCEL",
                "to": "Listing"
              },
              {
                "from": "Listing",
                "event": "DELETE",
                "to": "Listing",
                "effects": [
                  ["persist", "delete", "Task", "@entity.id"],
                  ["notify", "success", "Task deleted"]
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
            { "ref": "TaskCrud", "linkedEntity": "Task" }
          ]
        }
      ]
    }
  ]
}
```

Ta ena datoteka definira celotno aplikacijo: entiteto `Task` s stirimi polji, lastnost `TaskCrud` s tokovi seznama/ustvarjanja/urejanja/brisanja in stran, ki jo povezuje na pot `/tasks`.

## 2. Preverite

Preverite, da je program pravilen, preden prevedete:

```bash
orb validate my-app.orb
```

Videli bi morali izpis, ki potrjuje nic napak in nic opozoril. Ce so tezave, preverjevalnik izpise natancno lokacijo in opis vsake tezave.

## 3. Prevedite

Generirajte celostezno TypeScript aplikacijo:

```bash
orb compile my-app.orb --shell typescript
```

To ustvari mapo `my-app/`, ki vsebuje generiran React sprednji del, Express zaledni del in deljene tipe.

## 4. Namestite odvisnosti

```bash
cd my-app
npm install
```

## 5. Zazenite razvojni streznik

```bash
npm run dev
```

To zazene tako sprednji del (Vite) kot zaledni del (Express) v razvojnem nacinu.

## 6. Odprite v brskalniku

Pojdite na [http://localhost:5173](http://localhost:5173). Videli boste:

- Podatkovno tabelo za naloge (sprva prazno)
- Gumb "New Task", ki odpre obrazec v modalnem oknu
- Akcije urejanja in brisanja na vsaki vrstici
- Obvestila toast ob ustvarjanju, posodabljanju in brisanju

Poskusite ustvariti nekaj nalog, urediti eno in izbrisati drugo. Celoten zivljenjski cikel CRUD deluje takoj iz avtomata stanj, ki ste ga definirali.

## Kaj ste pravkar zgradili

Iz ene same `.orb` datoteke je prevajalnik generiral:

- **React komponente** za tabelo entitet, modalni obrazec in postavitev strani
- **Express API poti** za operacije CRUD nad entiteto Task
- **Deljene TypeScript tipe** za entiteto Task, ki jih uporabljata tako odjemalec kot streznik
- **Logiko avtomata stanj**, ki poganja prehode UI (stanja Listing, Creating, Editing)
- **Plast testnih podatkov**, tako da aplikacija deluje takoj brez podatkovne baze

Vsak klik gumba, oddaja obrazca in akcija tabele sledi vzorcu zaprtega kroga: Dogodek, Pogoj, Prehod, Ucinki, Odziv UI. Avtomat stanj v vasi `.orb` datoteki nadzira celoten tok.

## Naslednji koraki

- [Struktura projekta](./project-structure.md) za razumevanje, kaj je bilo generirano
- [Kljucni koncepti: Entitete](/docs/sl/core-concepts/entities) za spoznavanje tipov entitet in polj
- [Kljucni koncepti: Lastnosti](/docs/sl/core-concepts/traits) za poglobitev v avtomate stanj
- [Zgradite upravljalnik nalog (Vadnica)](/docs/tutorials/beginner/task-manager) za podrobnejsi vodic z vec lastnostmi
