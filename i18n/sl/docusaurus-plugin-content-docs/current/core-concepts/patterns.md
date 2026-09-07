# Vzorci

> Most med deklarativnimi programi in UI komponentami

---

## Pregled

**Sistem vzorcev** povezuje deklarativne programe z dejanskimi UI komponentami. Ko ucinek `render-ui` lastnosti doloci tip vzorca, sistem uporablja tri kljucne mehanizme za:

1. **Preverjanje** lastnosti vzorca glede na program
2. **Preslikavo** vzorca na konkretno komponento
3. **Uveljavljanje** pogodbe dogodkov za skladnost z zaprtim krogom

```
Program (render-ui)  →  Register vzorcev  →  Preslikava komponent  →  Komponenta lupine
                              ↓
                       Pogodba dogodkov
                              ↓
                    Preverjanje zaprtega kroga
```

---

## Register vzorcev

Register vzorcev je vir resnice za vse razpolozljive vzorce. Vsak vzorec definira:

```json
{
  "entity-table": {
    "type": "entity-table",
    "category": "display",
    "description": "Data table with columns and sorting",
    "suggestedFor": ["data-dense views", "comparisons", "admin panels"],
    "typicalSize": "medium",
    "componentHints": ["row-action:*", "table-cell", "sort-header"],
    "implements": "EntityBoundPatternProps",
    "propsSchema": {
      "columns": {
        "required": true,
        "types": ["array"],
        "description": "Columns can be Column objects or simple string field names"
      },
      "entity": {
        "types": ["string", "array"],
        "description": "Entity name for auto-fetch OR data array"
      },
      "itemActions": {
        "types": ["array"],
        "description": "Item actions from generated code - maps to rowActions"
      }
    },
    "componentMapping": {
      "component": "DataTable",
      "eventContract": { }
    }
  }
}
```

### Lastnosti vzorca

| Lastnost | Opis |
|----------|------|
| `type` | Edinstven identifikator vzorca (uporabljen v `render-ui`) |
| `category` | Skupina: `display`, `form`, `header`, `filter`, `navigation`, `layout`, `game`, `state` |
| `description` | Cloveku berljiv opis |
| `suggestedFor` | Namigi za primere uporabe za generiranje z LLM |
| `typicalSize` | Velikost UI: `tiny`, `small`, `medium`, `large` |
| `componentHints` | Vzorci pod-komponent, ki jih ta vzorec lahko uporablja |
| `implements` | Vmesnik, ki ga komponenta implementira (npr. `EntityBoundPatternProps`) |
| `propsSchema` | Definicije lastnosti s tipi in zahtevami |
| `componentMapping` | Preslikava na komponento lupine in pogodbo dogodkov |

### Kategorije vzorcev

| Kategorija | Primeri | Namen |
|------------|---------|-------|
| `display` | `entity-table`, `entity-list`, `entity-cards`, `stats` | Predstavitev podatkov |
| `form` | `form`, `form-section`, `form-fields` | Vnos podatkov |
| `header` | `page-header`, `title-only` | Naslovi strani in akcije |
| `filter` | `search-bar`, `filter-group`, `search-input` | Filtriranje podatkov |
| `navigation` | `tabs`, `breadcrumb`, `wizard-progress`, `pagination` | Navigacijski kontrolniki |
| `layout` | `modal`, `drawer`, `master-detail`, `dashboard-grid` | Struktura strani |
| `game` | `game-canvas`, `game-hud`, `game-controls` | Elementi igralnega UI |
| `state` | `empty-state`, `loading-state`, `error-state` | Povratne informacije o stanju |

---

## Preslikava komponent

Preslikava komponent povezuje tipe vzorcev s komponentami lupine:

```json
{
  "mappings": {
    "entity-table": {
      "component": "DataTable",
      "category": "display"
    },
    "form": {
      "component": "Form",
      "category": "form"
    },
    "page-header": {
      "component": "PageHeader",
      "category": "header"
    }
  }
}
```

### Lastnosti preslikave

| Lastnost | Opis |
|----------|------|
| `component` | Ime komponente v lupini |
| `category` | Enako kot kategorija vzorca |
| `client` | Neobvezno - specificna komponenta za odjemalca |
| `deprecated` | Neobvezno - oznaci vzorec kot zastarel |
| `replacedBy` | Neobvezno - nadomestni vzorec za zastarele |

---

## Pogodbe dogodkov

Pogodbe dogodkov definirajo, katere dogodke komponenta oddaja in zahteva. To je kljucno za **preverjanje zaprtega kroga** - zagotavljanje, da ima vsaka interakcija z UI ustrezen prehod avtomata stanj.

```json
{
  "contracts": {
    "form": {
      "emits": [
        {
          "event": "SAVE",
          "trigger": "submit",
          "payload": { "type": "FormData" }
        },
        {
          "event": "CANCEL",
          "trigger": "click",
          "payload": { "type": "void" }
        }
      ],
      "requires": ["SAVE", "CANCEL"],
      "entityAware": true
    },
    "entity-table": {
      "emits": [
        {
          "event": "VIEW",
          "trigger": "action",
          "payload": { "type": "EntityRow" },
          "optional": true
        },
        {
          "event": "SELECT",
          "trigger": "select",
          "payload": { "type": "EntityRow" },
          "optional": true
        },
        {
          "event": "EDIT",
          "trigger": "action",
          "payload": { "type": "EntityRow" },
          "optional": true
        },
        {
          "event": "DELETE",
          "trigger": "action",
          "payload": { "type": "EntityRow" },
          "optional": true
        }
      ],
      "requires": [],
      "entityAware": true,
      "configDriven": true
    }
  }
}
```

### Lastnosti pogodbe

| Lastnost | Opis |
|----------|------|
| `emits` | Dogodki, ki jih komponenta lahko oddaja |
| `requires` | Dogodki, ki MORAJO imeti prehode (zaprt krog) |
| `entityAware` | Komponenta prejme podatke entitete |
| `configDriven` | Dogodki so doloceni s konfiguracijo (npr. `itemActions`) |

### Definicija dogodka

| Lastnost | Opis |
|----------|------|
| `event` | Ime dogodka (npr. `SAVE`, `CANCEL`, `SELECT`) |
| `trigger` | Kaj sprozi dogodek: `click`, `submit`, `change`, `action`, `close` |
| `payload` | Tip obremenitve: `void`, `FormData`, `EntityRow` ali prilagojena oblika |
| `optional` | Ce je `true`, prehod ni obvezen |

### Integracija z zaprtim krogom

Pogodbe dogodkov poganjajo preverjanje [zaprtega kroga](/docs/sl/core-concepts/closed-circuit):

1. **Obvezni dogodki**: Ce `requires: ["SAVE", "CANCEL"]`, preverjevalnik zagotovi, da obstajata prehoda za oba dogodka
2. **Prekrivni vzorci**: `modal` in `drawer` zahtevata prehode `CLOSE` za preprecevanje obticanja UI stanj
3. **Konfiguracijski pogojeni dogodki**: Za `entity-table` z `itemActions: [{ event: "DELETE" }]` preverjevalnik preveri obstoj prehoda `DELETE`

---

## Zahteve za vmesnik komponent

Komponente, preslikane na vzorce, morajo implementirati dolocene vmesnike za sodelovanje v zaprtem krogu.

### EntityBoundPatternProps

Za podatkovne vezane komponente (`entity-table`, `entity-list`, `form` itd.):

```typescript
interface EntityBoundPatternProps {
  entity?: string;           // Ime tipa entitete
  data?: unknown[];          // Polje podatkov
  isLoading?: boolean;       // Stanje nalaganja
  error?: Error | null;      // Stanje napake
}
```

### Integracija z vodilom dogodkov

Vse interaktivne komponente morajo oddajati dogodke prek vodila dogodkov, ne notranjih povratnih klicev:

```typescript
// PRAVILNO - uporablja vodilo dogodkov
const handleRowClick = (row: EntityRow) => {
  eventBus.emit('UI:SELECT', { row });
};

// NAPACNO - notranje upravljanje stanja
const handleRowClick = (row: EntityRow) => {
  setSelectedRow(row);  // Prekine krog!
};
```

### Vzorec lastnosti akcij

Komponente z nastavljivimi akcijami jih prejmejo kot lastnosti:

```typescript
interface ActionablePatternProps {
  actions?: Array<{
    label: string;
    event: string;        // Dogodek za oddajanje
    variant?: 'primary' | 'secondary' | 'danger';
    icon?: string;
  }>;
  itemActions?: Array<{   // Za akcije na ravni vrstice
    label: string;
    event: string;
    icon?: string;
  }>;
}
```

Komponenta oddaja `UI:{event}`, ko se akcija sprozi, s cimer zakljuci krog nazaj do avtomata stanj.

---

## Sistem oblikovanja

Sistem oblikovanja vsebuje dejanske implementacije komponent, na katere se vzorci preslikujejo.

### Hierarhija komponent

| Raven | Namen | Primeri |
|-------|-------|---------|
| **Atomi** | Nedeljivi UI elementi | `Button`, `Input`, `Badge`, `Icon`, `Spinner` |
| **Molekule** | Preproste sestavne komponente | `SearchInput`, `Tabs`, `Breadcrumb`, `FilterGroup` |
| **Organizmi** | Kompleksne, samostojne komponente | `DataTable`, `Form`, `PageHeader`, `ModalSlot` |
| **Predloge** | Postavitve na ravni strani | Specificne komponente za celotno stran |

---

## Uporaba vzorcev v programih

### Ucinek render-ui

Vzorci se uporabljajo prek ucinka `render-ui` v prehodih lastnosti:

```json
{
  "from": "viewing",
  "to": "viewing",
  "event": "INIT",
  "effects": [
    ["render-ui", "main", {
      "type": "page-header",
      "title": "Tasks",
      "actions": [
        { "label": "Create Task", "event": "CREATE", "variant": "primary" }
      ]
    }],
    ["render-ui", "main", {
      "type": "entity-table",
      "entity": "Task",
      "columns": ["title", "status", "assignee"],
      "itemActions": [
        { "label": "Edit", "event": "EDIT" },
        { "label": "Delete", "event": "DELETE", "variant": "danger" }
      ]
    }]
  ]
}
```

### Preverjanje lastnosti

Prevajalnik preverja lastnosti glede na `propsSchema`:

1. **Obvezne lastnosti** morajo biti prisotne
2. **Tipi lastnosti** morajo ustrezati dovoljenim tipom
3. **Neznane lastnosti** generirajo opozorila

### Povezovanje dogodkov

Za vsak dogodek iz action/itemAction:

1. Komponenta oddaja `UI:{EVENT}` prek vodila dogodkov
2. Kavelj `useUIEvents` ujame in poslje lastnosti
3. Avtomat stanj obdela dogodek
4. Ucinki se izvedejo, potencialno ponovno upodobijo

---

## Razpolozljivi vzorci

Naslednji vzorci so na voljo takoj:

### Prikazni vzorci

| Vzorec | Opis | Pogoste lastnosti |
|--------|------|--------------------|
| `entity-table` | Podatkovna tabela s stolpci in razvrscanjem | `entity`, `columns`, `itemActions` |
| `entity-list` | Seznamski pogled elementov entitete | `entity`, `itemActions` |
| `entity-cards` | Mrezna postavitev kartic za entitete | `entity`, `columns`, `itemActions` |
| `stats` | Prikaz statistik s karticami | `items` |
| `detail-view` | Podrobnostni prikaz posamezne entitete | `entity`, `fields` |

### Obrazcni vzorci

| Vzorec | Opis | Pogoste lastnosti |
|--------|------|--------------------|
| `form` | Celoten obrazec s preverjanjem | `entity`, `fields`, `layout` |
| `form-section` | Skupinska polja obrazca | `title`, `fields` |
| `form-fields` | Vgrajena polja obrazca | `fields` |

### Vzorci glave

| Vzorec | Opis | Pogoste lastnosti |
|--------|------|--------------------|
| `page-header` | Naslov strani z akcijami | `title`, `subtitle`, `actions` |
| `title-only` | Preprost prikaz naslova | `title` |

### Vzorci filtrov

| Vzorec | Opis | Pogoste lastnosti |
|--------|------|--------------------|
| `search-bar` | Globalni vnos iskanja | `placeholder`, `entity` |
| `filter-group` | Filtrirani gumbi/znacke | `filters` |
| `search-input` | Samostojno polje iskanja | `placeholder` |

### Navigacijski vzorci

| Vzorec | Opis | Pogoste lastnosti |
|--------|------|--------------------|
| `tabs` | Navigacija z zavihki | `items`, `activeTab` |
| `breadcrumb` | Sled drobic | `items` |
| `wizard-progress` | Kazalnik korakov za carovnike | `steps`, `currentStep` |
| `pagination` | Navigacija po straneh | `page`, `totalPages` |

### Postavitveni vzorci

| Vzorec | Opis | Pogoste lastnosti |
|--------|------|--------------------|
| `modal` | Prekrivanje modalnega dialoga | `title`, `children` |
| `drawer` | Prekrivanje stranskega panela | `title`, `position` |
| `master-detail` | Deljena postavitev pogleda | `master`, `detail` |
| `dashboard-grid` | Mrezna postavitev za pregledne plosce | `items` |

### Vzorci stanj

| Vzorec | Opis | Pogoste lastnosti |
|--------|------|--------------------|
| `empty-state` | Oznacitveni prostor za prazne podatke | `title`, `description`, `action` |
| `loading-state` | Kazalnik nalaganja | `message` |
| `error-state` | Prikaz napake | `error`, `onRetry` |

---

## Povzetek

Sistem vzorcev zagotavlja:

1. **Register vzorcev** - Definira razpolozljive vzorce z lastnostmi, kategorijami in metapodatki
2. **Preslikava komponent** - Povezuje tipe vzorcev s komponentami lupine
3. **Pogodbe dogodkov** - Doloca, katere dogodke komponente oddajajo in zahtevajo
4. **Preverjanje zaprtega kroga** - Zagotavlja, da imajo vse interakcije UI upravljalce avtomata stanj
5. **Sistem oblikovanja** - Vsebuje dejanske implementacije komponent

Ta arhitektura zagotavlja, da programi ostanejo deklarativni, medtem ko prevajalnik obvladuje kompleksnost povezovanja komponent z dogodkovno vodenim sistemom avtomatov stanj.

---

*Za vec podrobnosti o povezanih konceptih glej [Lastnosti](/docs/sl/core-concepts/traits) in [Zaprt krog](/docs/sl/core-concepts/closed-circuit).*
