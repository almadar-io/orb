---
slug: closed-circuit-pattern
title: "Vzorec zaprtega kroga: Zakaj se vaši uporabniki zataknejo (in kako to preprečiti)"
authors: [osamah]
tags: [architecture, state-machines]
image: /img/blog/closed-circuit-pattern.png
---

![Vzorec zaprtega kroga: Zakaj se vaši uporabniki zataknejo (in kako to preprečiti)](/img/blog/closed-circuit-pattern.png)

Ste že odprli modal in ga niste mogli zapreti? To je prekinjen krog. Mi smo to naredili nemogoče za gradnjo.

<!-- truncate -->

## Problem zataknjenega uporabnika

Uporabljate aplikacijo. Kliknete "Odpri nastavitve." Pojavi se modal. Kliknete gumb X. Nič se ne zgodi. Pritisnete Escape. Nič. Kliknete zunaj modala. Še vedno nič.

**Zataknili ste se.**

To se zgodi, ker:
1. Modal se je odprl preko internega stanja (`setIsOpen(true)`)
2. Gumb za zaprtje sproži `setIsOpen(false)`
3. Ampak če je napaka, se stanje ne posodobi
4. Ali še huje — gumb za zaprtje ni bil nikoli povezan

V Almadarju je to arhitekturno nemogoče.

## Načelo zaprtega kroga

**Vsaka interakcija z UI mora zaključiti poln krog nazaj do state machine.**

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│   Uporabniški klik ──► Event Bus ──► State Machine ──► Posodobitev UI │
│       ▲                                              │         │
│       └──────────────────────────────────────────────┘         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

Brez bližnjic. Brez neposrednih mutacij stanja. Vsaka akcija teče skozi krog.

## Kako deluje v Almadarju

### 1. Uporabnik sproži dogodek

Ko kliknete gumb:

```typescript
// ❌ NE to:
onClick={() => setIsModalOpen(false)}

// ✅ To:
onClick={() => eventBus.emit('UI:CLOSE')}
```

Komponenta ne ve, kaj se zgodi potem. Samo emitira.

### 2. Event Bus usmeri do State Machine

Event bus prejme `UI:CLOSE` in ga usmeri do state machine aktivnega traita.

### 3. State Machine obdela

```json
{
  "from": "modalOpen",
  "to": "browsing",
  "event": "CLOSE",
  "effects": [
    ["render-ui", "modal", null],
    ["render-ui", "main", { "type": "page-header", ... }]
  ]
}
```

State machine:
1. Preide iz `modalOpen` v `browsing`
2. Počisti modal slot
3. Renderira glavno vsebino

### 4. UI se posodobi

Komponenta se ponovno renderira glede na novo stanje. Modal izgine, ker je tako rekla state machine.

## Zakaj to preprečuje zataknjena stanja

### 1. Dogodki morajo imeti prehode

Če definirate gumb z dogodkom:

```json
{
  "type": "page-header",
  "actions": [{ "label": "Odpri", "event": "OPEN_MODAL" }]
}
```

Validator **zahteva** ujemajoč prehod:

```json
{
  "from": "browsing",
  "to": "modalOpen",
  "event": "OPEN_MODAL"
  // ✅ Obstaja zahtevan prehod
}
```

Če pozabite:
```
✗ Napaka: CIRCUIT_ORPHAN_EVENT
  Akcija 'Odpri' emitira dogodek 'OPEN_MODAL', ki nima handlerja za prehod
```

### 2. Overlay sloti morajo imeti izhode

Če renderirate v `modal` ali `drawer`, validator zahteva izhod:

```json
{
  "from": "browsing",
  "to": "modalOpen",
  "event": "OPEN_MODAL",
  "effects": [
    ["render-ui", "modal", { "type": "form-section", ... }]
  ]
}
```

Mora imeti:
```json
{
  "from": "modalOpen",
  "to": "browsing",
  "event": "CLOSE"
  // ✅ Zahtevan izhodni prehod
}
```

Če pozabite:
```
✗ Napaka: CIRCUIT_NO_OVERLAY_EXIT
  Stanje 'modalOpen' renderira v slot 'modal' ampak nima izhodnega prehoda.
  Uporabniki se bodo zataknili v ta overlay.
```

### 3. Slot Wrappers obdelujejo Escape Hatches

Tudi če pozabite gumb za zaprtje, vas slot wrapper reši:

```typescript
// ModalSlot.tsx (avto-generirani wrapper)
const handleClose = () => {
  eventBus.emit('UI:CLOSE');
  eventBus.emit('UI:CANCEL');
};

return (
  <Modal 
    isOpen={Boolean(children)} 
    onClose={handleClose}  // Escape tipka, klik overlaya, gumb X
  >
    {children}
  </Modal>
);
```

Wrapper emitira dogodek. State machine ga obdela. Krog se zaključi.

## Primerjava iz resničnega sveta: Semaforji

Semaforji sledijo zaprtemu krogu:

```
Rdeča ──(timer)──► Zelena ──(timer)──► Rumena ──(timer)──► Rdeča
```

Ni "skoči iz Rdeče v Zeleno takoj" ali "zataknjen na Rumeni." Krog je zaprt — vsako stanje ima definirane prehode.

Zdaj si predstavljajte pokvarjen semafor:
- Zataknjen na Rdeči → prometni zastoj
- Zataknjen na Zeleni → nesreče
- Naključni prehodi → kaos

Almadarjev validator je kot prometni inženir, ki preveri:
- ✅ Vsaka luč ima prehode
- ✅ Ni nemogočih stanj
- ✅ Emergency načini definirani

## Primer: Modal, ki se ne more pokvariti

Tukaj je implementacija modala, **v katerega je nemogoče zatakniti**:

```json
{
  "states": [
    { "name": "browsing", "isInitial": true },
    { "name": "modalOpen" }
  ],
  "events": [
    { "key": "OPEN_MODAL", "name": "Odpri Modal" },
    { "key": "CLOSE", "name": "Zapri" },
    { "key": "SAVE", "name": "Shrani" }
  ],
  "transitions": [
    {
      "from": "browsing",
      "to": "browsing",
      "event": "INIT",
      "effects": [
        ["render-ui", "main", {
          "type": "page-header",
          "title": "Naloge",
          "actions": [{ "label": "Nova naloga", "event": "OPEN_MODAL" }]
        }]
      ]
    },
    {
      "from": "browsing",
      "to": "modalOpen",
      "event": "OPEN_MODAL",
      "effects": [
        ["render-ui", "modal", {
          "type": "form-section",
          "entity": "Task",
          "fields": ["title", "status"],
          "submitEvent": "SAVE",
          "cancelEvent": "CLOSE"
        }]
      ]
    },
    {
      "from": "modalOpen",
      "to": "browsing",
      "event": "CLOSE",
      "effects": [
        ["render-ui", "modal", null],
        ["emit", "INIT"]
      ]
    },
    {
      "from": "modalOpen",
      "to": "browsing",
      "event": "SAVE",
      "effects": [
        ["persist", "create", "Task", "@payload.data"],
        ["render-ui", "modal", null],
        ["emit", "INIT"]
      ]
    }
  ]
}
```

**Trije načini za izhod iz modala:**
1. Klik "Prekliči" → sproži `CLOSE` dogodek
2. Klik "Shrani" → sproži `SAVE` dogodek  
3. Pritisni Escape ali klikni overlay → ModalSlot emitira `UI:CLOSE`

Vsi trije preidejo nazaj v `browsing` in počistijo modal.

## Hierarhija slotov

Različni sloti imajo različne zahteve za vračanje:

| Slot | Tip | Zahteva vračanja |
|------|------|-------------------|
| `main` | Primarni | Brez — to je domača baza |
| `sidebar` | Sekundarni | Opcijsko — lahko obstaja z glavnim |
| `modal` | Overlay | **OBVEZNO** — Mora imeti izhodni prehod |
| `drawer` | Overlay | **OBVEZNO** — Mora imeti izhodni prehod |
| `toast` | Obvestilo | Avtomatsko zapiranje, prehod ni potreben |

## Zakaj ta arhitektura pomembna

### Za uporabnike
- ✅ Nikoli se ne zataknejo v modalih
- ✅ Konsistentno vedênje čez aplikacije
- ✅ Predvidljivi UI vzorci

### Za razvijalce
- ✅ Napake ujete ob compile time
- ✅ Brez ročnega povezovanja close handlerjev
- ✅ Spremembe stanja so sledljive

### Za ekipe
- ✅ Schema = dokumentacija
- ✅ Enostavno pregledovanje state flows
- ✅ Hitrejši onboarding

## Poskusite: Zgradite nepokvarljiv Modal

Ustvarite `modal-demo.orb`:

```json
{
  "name": "ModalDemo",
  "orbitals": [{
    "name": "Demo",
    "entity": { "name": "Item", "fields": [{ "name": "name", "type": "string" }] },
    "traits": [{
      "name": "DemoTrait",
      "linkedEntity": "Item",
      "stateMachine": {
        "states": [
          { "name": "main", "isInitial": true },
          { "name": "modalOpen" }
        ],
        "events": [
          { "key": "INIT", "name": "Inicializiraj" },
          { "key": "OPEN", "name": "Odpri" },
          { "key": "CLOSE", "name": "Zapri" }
        ],
        "transitions": [
          {
            "from": "main",
            "to": "main",
            "event": "INIT",
            "effects": [
              ["render-ui", "main", {
                "type": "page-header",
                "title": "Demo",
                "actions": [{ "label": "Odpri Modal", "event": "OPEN" }]
              }]
            ]
          },
          {
            "from": "main",
            "to": "modalOpen",
            "event": "OPEN",
            "effects": [
              ["render-ui", "modal", { "type": "page-header", "title": "Jaz sem Modal!" }]
            ]
          },
          {
            "from": "modalOpen",
            "to": "main",
            "event": "CLOSE",
            "effects": [
              ["render-ui", "modal", null],
              ["emit", "INIT"]
            ]
          }
        ]
      }
    }],
    "pages": [{ "name": "DemoPage", "path": "/", "traits": [{ "ref": "DemoTrait" }] }]
  }]
}
```

Prevedite in preizkusite:
```bash
orbital validate modal-demo.orb  # Ne bo uspelo brez CLOSE prehoda
orbital compile modal-demo.orb --shell typescript
```

Poskusite odstraniti `CLOSE` prehod in ponovno validirati. Compiler vam ne bo dovolil ustvariti prekinjenega kroga.

## Spoznanje

Vzorec zaprtega kroga ni samo dobra ideja — je vsiljen s strani compilerja.

V Almadarju:
- Vsaka UI akcija emitira dogodek
- Vsak dogodek ima prehod
- Vsak overlay ima izhod
- Uporabniki se nikoli ne zataknejo

Ker najboljši način za preprečevanje napak ni testiranje — je narediti, da so nemogoče za zapisati.

Več o [state machines v Almadarju](https://orb.almadar.io/docs/traits).
