# Zaprt krog

Ta dokument definira **vzorec zaprtega kroga** - temeljno arhitekturo, ki zagotavlja, da uporabniki nikoli niso obticali v neveljavnem stanju UI.

---

## Problem

Ko uporabnik klikne "Odpri modalno okno", avtomat stanj preide v `modalOpen` in upodobi modalno okno v rezino `modal`. Ce pa gumb za zapiranje (X) v modalnem oknu ne oddaja pravilno dogodka nazaj avtomatu stanj, je uporabnik **obtical** - vidi modalno okno, a ga ne more zapreti.

To je **prekinjen krog**.

---

## Nacelo zaprtega kroga

**Vsaka interakcija z UI mora zakljuciti poln krog nazaj do avtomata stanj.**

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│   ┌─────────┐    ┌──────────┐    ┌─────────────┐    ┌──────────────────┐  │
│   │ Dogodek │───►│  Pogoj   │───►│   Prehod    │───►│  Ucinki          │  │
│   │         │    │ Ovrednoti│    │  Izvedi     │    │  (render_ui)     │  │
│   └─────────┘    └──────────┘    └─────────────┘    └──────────────────┘  │
│        ▲                                                      │           │
│        │                                                      ▼           │
│   ┌─────────┐                                          ┌──────────────┐   │
│   │ Vodilo  │◄─────────────────────────────────────────│  UI rezina   │   │
│   │dogodkov │         UI:CLOSE, UI:SAVE itd.           │  Upodobljena │   │
│   └─────────┘                                          └──────────────┘   │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

**Pravila:**

1. **Vse interakcije UI oddajajo dogodke prek vodila dogodkov** - Nikoli ne uporabljajte notranjih povratnih klicev, kot je `onClick={() => setOpen(false)}`
2. **Vsi dogodki morajo imeti ustrezne prehode** - Ce komponenta oddaja `UI:CLOSE`, mora obstajati prehod, ki obdeluje `CLOSE`
3. **Neosnovne rezine se morajo vrniti na glavno** - Ce upodabljate v `modal`, `drawer` ali druge prekrivne rezine, MORA obstajati prehod, ki upodobi nazaj v `main`

---

## Hierarhija rezin in zahteve za vrnitev

| Rezina | Tip | Zahteva za vrnitev |
|--------|-----|---------------------|
| `main` | Primarna | Brez - to je izhodisce |
| `sidebar` | Sekundarna | Neobvezno - lahko soobstaja z main |
| `center` | Sekundarna | Neobvezno - lahko soobstaja z main |
| `modal` | Prekrivna | **OBVEZNO** - Mora imeti prehod CLOSE/CANCEL nazaj na main |
| `drawer` | Prekrivna | **OBVEZNO** - Mora imeti prehod CLOSE/CANCEL nazaj na main |
| `toast` | Obvestilna | Samodejno se zapre, prehod ni potreben |

**Prekrivne rezine (`modal`, `drawer`) so blokirajoci** - preprecujejo interakcijo z glavno vsebino. Uporabniki MORAJO imeti moznost, da jih zapustijo.

---

## Pogodbe dogodkov komponent

Komponente, ki lahko sprozijo prehode stanj, MORAJO oddajati dogodke prek vodila dogodkov:

### Komponente z lastnostjo `actions` (na ravni strani)

| Komponenta | Lastnost | Oddaja |
|------------|----------|--------|
| `page-header` | `actions` | `UI:{event}` za vsako akcijo |
| `form` | `actions` | `UI:SAVE`, `UI:CANCEL` |
| `toolbar` | `actions` | `UI:{event}` za vsako akcijo |

### Komponente z lastnostjo `itemActions` (na ravni vrstice)

| Komponenta | Lastnost | Oddaja |
|------------|----------|--------|
| `entity-table` | `itemActions` | `UI:{event}` z obremenitvijo `{ row }` |
| `entity-list` | `itemActions` | `UI:{event}` z obremenitvijo `{ row }` |
| `entity-cards` | `itemActions` | `UI:{event}` z obremenitvijo `{ row }` |

### Prekrivne komponente (MORAJO oddajati dogodke zapiranja)

| Komponenta | Sprozilec zapiranja | Mora oddajati |
|------------|----------------------|---------------|
| `modal` | Gumb X, Escape, klik na prekrivanje | `UI:CLOSE` |
| `drawer` | Gumb X, Escape, klik na prekrivanje | `UI:CLOSE` |
| `confirm-dialog` | Gumb Preklici | `UI:CANCEL` |
| `game-pause-overlay` | Gumb Nadaljuj | `UI:RESUME` |
| `game-over-screen` | Gumb Ponovno | `UI:RESTART` |

---

## Zahteve za preverjanje

Preverjevalnik uveljavlja naslednje:

### 1. Zaznavanje osirotenih dogodkov

Ce `actions` ali `itemActions` komponente definira dogodek, MORA obstajati prehod, ki ga obdeluje.

```json
// NAPACNO - OPEN_MODAL nima upravljalca
{
  "type": "page-header",
  "actions": [{ "label": "Open", "event": "OPEN_MODAL" }]
}
// Ampak ni prehoda: { "event": "OPEN_MODAL", ... }
```

**Napaka**: `CIRCUIT_ORPHAN_EVENT: Action 'Open' emits event 'OPEN_MODAL' which has no transition handler`

### 2. Izhodni prehod za modal/drawer

Ce prehod upodablja v rezino `modal` ali `drawer`, MORA obstajati prehod IZ tega ciljnega stanja, ki:
- Obdeluje `CLOSE`, `CANCEL` ali dogodek, ki ga zahteva vzorec (kot `SAVE`)
- Upodablja nazaj v rezino `main` (ali preide v stanje, ki to pocne)

```json
// NAPACNO - stanje modalOpen nima izhoda
{
  "from": "viewing",
  "event": "OPEN_MODAL",
  "to": "modalOpen",
  "effects": [["render-ui", "modal", { "type": "modal", ... }]]
}
// Ampak ni prehoda: { "from": "modalOpen", "event": "CLOSE", ... }
```

**Napaka**: `CIRCUIT_NO_EXIT: State 'modalOpen' renders to 'modal' slot but has no CLOSE/CANCEL transition. Users will be stuck.`

### 3. Zahteva za vrnitev na main

Stanja, ki upodabljajo SAMO v neosnovne rezine, se morajo na koncu vrniti v stanje, ki upodablja v `main`.

```json
// NAPACNO - modalOpen upodablja samo v modal, nikoli se ne vrne na main
{
  "from": "modalOpen",
  "event": "CLOSE",
  "to": "modalOpen",  // Vrne se vase!
  "effects": []       // In ne upodobi nicesar
}
```

**Napaka**: `CIRCUIT_NO_MAIN_RETURN: State 'modalOpen' has no path back to a state that renders to 'main' slot`

---

## Zahteve prevajalnika

Prevajalnik zagotavlja zaprte kroge prek:

### 1. Ovijaci rezin za prekrivanja

Prekrivne rezine so ovite v komponente ovijacev rezin, ki upravljajo komunikacijo z vodilom dogodkov:

| Rezina | Ovijac | Oddani dogodki |
|--------|--------|----------------|
| `modal` | `ModalSlot` | `UI:CLOSE`, `UI:CANCEL` |
| `drawer` | `DrawerSlot` | `UI:CLOSE`, `UI:CANCEL` |
| `toast` | `ToastSlot` | `UI:DISMISS`, `UI:CLOSE` |

Komponente ovijacev:
- Samodejno prikazejo, ko so prisotni otroci
- Upravljajo sprozilce zapiranja/opustitve (gumb X, Escape, klik na prekrivanje)
- Oddajajo dogodke prek vodila dogodkov, tako da avtomat stanj lahko preide

**Primer**: `ModalSlot` ovije katero koli vsebino, upodobljeno v rezino modal, in oddaja `UI:CLOSE` ob opustitvi:

```typescript
// ModalSlot.tsx
const handleClose = () => {
  eventBus.emit('UI:CLOSE');
  eventBus.emit('UI:CANCEL');
};

return (
  <Modal isOpen={Boolean(children)} onClose={handleClose}>
    {children}
  </Modal>
);
```

### 2. Generiranje lastnosti `event`, ne `onClick`

Za akcije v `page-header`, `form` itd. prevajalnik generira lastnost `event`, da komponenta oddaja prek vodila dogodkov:

```typescript
// Generirana koda:
<PageHeader actions={[{ label: "Open", event: "OPEN_MODAL" }]} />

// NE:
<PageHeader actions={[{ label: "Open", onClick: () => dispatch('OPEN_MODAL') }]} />
```

Komponenta oddaja `UI:OPEN_MODAL` prek vodila dogodkov, ki ga `useUIEvents` ujame in poslje naprej.

### 3. Stran mora upodobiti vse rezine z ovijaci

Generirane strani upodobijo VSE rezine, pri cemer so prekrivne rezine ovite v svoje ovijace rezin:

```typescript
// Generirana stran:
return (
  <>
    <VStack>
      {/* Vsebinske rezine - upodobljene vgrajeno */}
      {ui?.main}
      {ui?.sidebar}
      {ui?.center}
    </VStack>
    {/* Prekrivne rezine - ovite za zaprt krog */}
    <ModalSlot>{ui?.modal}</ModalSlot>
    <DrawerSlot>{ui?.drawer}</DrawerSlot>
    <ToastSlot>{ui?.toast}</ToastSlot>
  </>
);
```

**Kljucno**: Ovijaci rezin oddajajo dogodke prek vodila dogodkov, ko se prekrivanje zapre/opusti. To zakljuci krog nazaj do avtomata stanj.

---

## Vzorec programa za modalno okno

Pravilen vzorec programa za modalno okno:

```json
{
  "states": [
    { "name": "viewing", "isInitial": true },
    { "name": "modalOpen" }
  ],
  "events": [
    { "key": "OPEN_MODAL", "name": "Open Modal" },
    { "key": "CLOSE", "name": "Close" }
  ],
  "transitions": [
    {
      "from": "viewing",
      "event": "INIT",
      "to": "viewing",
      "effects": [
        ["render-ui", "main", {
          "type": "page-header",
          "title": "Example",
          "actions": [{ "label": "Open Modal", "event": "OPEN_MODAL" }]
        }]
      ]
    },
    {
      "from": "viewing",
      "event": "OPEN_MODAL",
      "to": "modalOpen",
      "effects": [
        ["render-ui", "modal", { "type": "modal", "title": "Modal" }]
      ]
    },
    {
      "from": "modalOpen",
      "event": "CLOSE",
      "to": "viewing",
      "effects": [
        ["render-ui", "main", {
          "type": "page-header",
          "title": "Example",
          "actions": [{ "label": "Open Modal", "event": "OPEN_MODAL" }]
        }]
      ]
    }
  ]
}
```

**Kljucne tocke:**
1. Prehod `OPEN_MODAL` upodablja v rezino `modal`
2. Prehod `CLOSE` IZ `modalOpen` upodablja nazaj v rezino `main`
3. Oba dogodka imata ustrezne prehode

---

## Povzetek

Vzorec zaprtega kroga zagotavlja:

1. **Uporabniki nikoli niso obticali** - Vsako stanje UI ima izhodno pot
2. **Dogodki tecejo skozi avtomat stanj** - Nobeno notranje upravljanje stanja ne zaobide kroga
3. **Prekrivne rezine se vrnejo na main** - Modalna okna in predalniki imajo vedno prehode zapiranja
4. **Preverjanje ujame prekinitve** - Prevajalnik preveri popolnost kroga pred generiranjem kode

Ko je krog prekinjen, uporabniki dozivijo "mrtve" gumbe, obtecana modalna okna in neodziven UI. Preverjevalnik in prevajalnik sodelujeta, da to preprecita.
