---
title: Struktura projekta
sidebar_label: Struktura projekta
---

# Struktura projekta

Ko zazenete `orb compile my-app.orb --shell typescript`, prevajalnik generira celotno celostezno aplikacijo. Ta stran pojasnjuje, kaj pocne vsak del generiranega izhoda in kako se deli skladajo.

## Postavitev na vrhu

```
my-app.orb                  # Vas izvorni program (to urejate)
my-app/                     # Generirana aplikacija (nikoli ne urejajte neposredno)
  packages/
    client/                 # React + Vite sprednji del
    server/                 # Express zaledni del s testnimi podatki
    shared/                 # TypeScript tipi, deljeni med odjemalcem in streznikom
  package.json              # Korenski package.json s konfiguracijo delovnega prostora
  tsconfig.json             # Korenska TypeScript konfiguracija
```

Datoteka `.orb` je vas vir resnice. Mapa `my-app/` je izhod prevajalnika. Ta locitev je temeljna: vedno urejate datoteko `.orb` in ponovno prevedete. Nikoli ne urejajte datotek neposredno v `my-app/`.

## `packages/client/` (sprednji del)

Sprednji del je React aplikacija, skupaj zapakirana z Vite.

```
packages/client/
  src/
    App.tsx                 # Korenska komponenta z definicijami poti
    main.tsx                # Vstopna tocka Vite
    features/               # Generirane komponente lastnosti
      TaskCrud.tsx          # Komponenta avtomata stanj za lastnost TaskCrud
    pages/                  # Komponente strani za poti
      TaskListPage.tsx      # Veze lastnost TaskCrud na pot /tasks
    components/
      traits/               # Fragmenti UI, specificni za lastnosti
        TaskCrud/
          Listing.tsx       # UI za stanje Listing
          Creating.tsx      # UI za stanje Creating
          Editing.tsx       # UI za stanje Editing
  index.html
  vite.config.ts
  tsconfig.json
```

**Kljucne datoteke:**

- **`App.tsx`** definira vse poti. Vsaka stran iz vase `.orb` datoteke postane vnos `<Route>`. Tu se poti strani (`/tasks`, `/tasks/:id` itd.) preslikajo na komponente strani.

- **`features/`** vsebuje eno datoteko na lastnost. Vsaka komponenta funkcionalnosti implementira avtomat stanj: sledi trenutnemu stanju, poslja dogodke, ovrednooti pogoje, izvaja ucinke in upodablja ustrezen UI. To je izvajalni pogon za obnasanje vase lastnosti.

- **`pages/`** vsebuje eno datoteko na stran. Komponente strani so tanke ovojnice, ki namescajo lastnosti, deklarirane v definiciji strani. Stran z dvema lastnostma bo uvozila in upodobila obe komponenti funkcionalnosti.

- **`components/traits/`** vsebuje fragmente UI za vsako stanje. Ko je avtomat stanj lastnosti v stanju "Listing", se upodobi komponenta `Listing.tsx`. Ko preide v "Creating", se upodobi komponenta `Creating.tsx`. Ti so generirani iz ucinkov `render-ui` v vasih prehodih.

## `packages/server/` (zaledni del)

Zaledni del je Express streznik, ki zagotavlja API poti za trajnost entitet.

```
packages/server/
  src/
    index.ts                # Vstopna tocka streznika (nastavitev Express aplikacije)
    routes/
      tasks.ts              # CRUD poti za entiteto Task
    data/
      mock.ts               # Shramba testnih podatkov v pomnilniku
  tsconfig.json
  package.json
```

**Kljucne datoteke:**

- **`routes/`** ima eno datoteko na trajno entiteto. Prevajalnik generira standardne REST koncne tocke: `GET /api/tasks`, `POST /api/tasks`, `PUT /api/tasks/:id`, `DELETE /api/tasks/:id`. Ti ustrezajo ucinkom `["persist", ...]` v vasih lastnostih.

- **`data/mock.ts`** zagotavlja shrambo podatkov v pomnilniku, tako da aplikacija deluje takoj brez kakrsne koli nastavitve podatkovne baze. Za produkcijo to zamenjate s pravim adapterjem podatkovne baze (Firestore, PostgreSQL itd.).

## `packages/shared/` (deljeni tipi)

```
packages/shared/
  src/
    index.ts                # Ponovno izvozi vse tipe
    entities/
      Task.ts               # TypeScript vmesnik za entiteto Task
    events/
      TaskCrud.ts           # Definicije tipov dogodkov za lastnost TaskCrud
```

Tako odjemalec kot streznik uvazata tipe iz tega paketa. Ko dodate polje v entiteto v vasi `.orb` datoteki, se deljeni tip posodobi ob ponovnem prevajanju, s cimer se odjemalec in streznik samodejno sinhonizirata.

## Potek ponovnega prevajanja

Ko spremenite svojo `.orb` datoteko, ponovno prevedite za regeneracijo aplikacije:

```bash
# Uredite svojo .orb datoteko
# Nato:
orb compile my-app.orb --shell typescript

# Ce razvojni streznik tece, pobere spremembe prek Vite hot reload
# Sicer ponovno zazenite:
cd my-app && npm run dev
```

Prevajalnik prepiše generirane datoteke ob vsakem zagonu. Kakrsnekoli rocne spremembe datotek v `my-app/` bodo izgubljene. To je po zasnovi: datoteka `.orb` je edini vir resnice za strukturo in obnasanje vase aplikacije.

**Ce je kaj narobe v generirani kodi**, je popravek skoraj vedno v datoteki `.orb`. Spremenite polja entitete, prilagodite prehode avtomata stanj, posodobite lastnosti vzorca `render-ui`, nato ponovno prevedite.

## Kako se deli povezujejo

```
.orb datoteka
  |
  |-- entiteta "Task"
  |     |-- packages/shared/src/entities/Task.ts    (TypeScript vmesnik)
  |     |-- packages/server/src/routes/tasks.ts     (REST API)
  |
  |-- lastnost "TaskCrud"
  |     |-- packages/client/src/features/TaskCrud.tsx         (avtomat stanj)
  |     |-- packages/client/src/components/traits/TaskCrud/   (UI stanja)
  |     |-- packages/shared/src/events/TaskCrud.ts            (tipi dogodkov)
  |
  |-- stran "TaskListPage" na /tasks
        |-- packages/client/src/pages/TaskListPage.tsx  (komponenta poti)
        |-- packages/client/src/App.tsx                 (vnos poti)
```

Vsak koncept v vasem `.orb` programu se preslika na konkretne datoteke v treh paketih. Prevajalnik upravlja povezovanje: uvozi, reference tipov, API klici in posiljanje dogodkov so vsi generirani iz relacij, ki ste jih deklarirali.

## Naslednji koraki

- [Kljucni koncepti: Entitete](/docs/sl/core-concepts/entities) za tipe polj, nacine trajnosti in relacije
- [Kljucni koncepti: Lastnosti](/docs/sl/core-concepts/traits) za avtomate stanj, pogoje in ucinke
- [Kljucni koncepti: Strani](/docs/sl/core-concepts/pages) za usmerjanje in sestavo lastnosti
