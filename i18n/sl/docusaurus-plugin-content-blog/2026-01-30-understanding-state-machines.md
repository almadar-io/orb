---
slug: understanding-state-machines
title: Razumevanje State Machines v Almadar
authors: [osamah]
tags: [architecture, tutorial]
---

State machines so v jedru Almadarja. V tem prispevku raziskujemo, zakaj smo izbrali state machines kot temelj za vedênje aplikacije.

<!-- truncate -->

## Zakaj State Machines?

Tradicionalne web aplikacije pogosto trpijo zaradi nepredvidljivega vedênja. Gumb lahko počne različne stvari, odvisno od skritega stanja, race condition ali implicitnih predpostavk, zakopanih v kodi.

State machines to rešijo z izpostavljanjem **vsakega možnega stanja** in **vsakega prehoda namenskega**.

## Anatomija Almadar State Machine

Vsak trait v Almadar vsebuje state machine:

```json
{
  "name": "Toggleable",
  "stateMachine": {
    "states": [
      { "name": "off", "isInitial": true },
      { "name": "on" }
    ],
    "transitions": [
      {
        "from": "off",
        "event": "TOGGLE",
        "to": "on",
        "effects": [
          ["render-ui", "main", { "type": "toggle", "active": true }]
        ]
      },
      {
        "from": "on",
        "event": "TOGGLE",
        "to": "off",
        "effects": [
          ["render-ui", "main", { "type": "toggle", "active": false }]
        ]
      }
    ]
  }
}
```

## Ključni koncepti

### Stanja
Stanja predstavljajo možna stanja vašega entity. Vsako stanje je eksplicitno in poimenovano.

### Dogodki
Dogodki sprožijo prehode. Lahko prihajajo iz uporabniških akcij, sistemskih dogodkov ali drugih orbitalov.

### Prehodi
Prehodi definirajo, kako se vaš entity premika iz enega stanja v drugo. Vsak prehod lahko ima:
- **Guard**: Pogoji, ki morajo biti izpolnjeni
- **Effects**: Akcije za izvedbo (posodobi polja, renderiraj UI, emitiraj dogodke)

### Effects
Effects so stranski učinki prehoda. Almadar podpira:
- `set` - Posodobi polje entity
- `increment` / `decrement` - Spremeni številke
- `render-ui` - Renderiraj UI vzorec
- `emit` - Objavi dogodke drugim orbitalom
- `persist` - Shrani v bazo
- `navigate` - Spremeni route

## Koristi

1. **Predvidljivost**: Vedno veste, v katerem stanju je vaša aplikacija
2. **Testabilnost**: Testirajte vsak prehod neodvisno
3. **Varnost**: Guardi preprečujejo nepooblaščene spremembe stanja
4. **Debugging**: Zgodovina stanj naredi napake reproducibilne

## Naslednji koraki

Pripravljeni graditi s state machines? Preverite naš [Getting Started vodnik](https://orb.almadar.io/docs/getting-started/introduction).
