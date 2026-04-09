---
slug: composing-behavior
title: "Kompozicija vedênja: Kaj nas igre učijo o programski arhitekturi"
authors: [osamah]
tags: [architecture, gaming, composition]
---

V igri Iram igralci zbirajo Orbital Shards — fragmente vedênja, ki se zaskočijo skupaj za ustvarjanje novih sposobnosti. Opremite Defend in Mend skupaj, in vaši ščiti ozdravijo 1.5x hitreje. Opremite Disrupt in Fabricate, in vaše pasti povzročijo area damage.

To ni samo mehanika igre. Je vzorec programske arhitekture, ki reši razpravo med mikroservisi in monoliti.

<!-- truncate -->

## Problem kompozicije

Programska arhitektura je ujeta med dvema slabima možnostima:

**Monolit:** Vse v eni kodebazi. Enostavno za gradnjo, nemogoče za skaliranje. Vsaka sprememba tvega pokvariti nekaj nepovezanega.

**Mikroservisi:** Vse v svojem servisu. Enostavno za skaliranje, nemogoče za koordinacijo. Vsaka funkcija zahteva orkestracijo 5 servisov, 3 message queue in molitev.

Oba pristopa obravnavata vedênje kot *lokacijski* problem: kje živi koda?

Pravo vprašanje je: kako se vedênje *komponira*?

## Lekcije iz oblikovanja iger

V Iram, dungeon-crawling action RPG zgrajen na Almadar, igralčev lik definira **katera Orbitals opremi**:

| Orbital | Vedênje |
|---------|----------|
| **Defend** | Absorbira škodo, generira ščite |
| **Mend** | Ozdravi čez čas, ozdravi status effects |
| **Disrupt** | Prekine sovražnike, uporabi debuffe |
| **Fabricate** | Ustvari pasti, zgradi turrete |
| **Pathfind** | Razkrije zemljevid, zazna skrite sovražnike |
| **Transmute** | Pretvori vire, nadgradi opremo |
| **Command** | Buffa zaveznike, koordinira skupinske akcije |
| **Archive** | Zabeleži vzorce sovražnikov, razkrije slabosti |

Vsak Orbital je samostojen state machine. Defend ne ve o Mend. Pathfind ne ve o Fabricate.

Ampak ko ju opremite skupaj, se pojavi **emergentno vedênje**.

## Resonance: Kompozicija ustvarja emergenco

Ko so združljivi Orbitals opremljeni hkrati, ustvarijo **Resonance** — sinergijske efekte, ki jih noben Orbital ne definira sam:

```json
{
  "resonance": [
    {
      "requires": ["Defend", "Mend"],
      "effect": "Shield regeneration rate increased by 1.5x",
      "multiplier": { "shieldRegen": 1.5 }
    },
    {
      "requires": ["Disrupt", "Fabricate"],
      "effect": "Traps apply disruption debuffs",
      "multiplier": { "trapDamage": 1.3 }
    },
    {
      "requires": ["Archive", "Command"],
      "effect": "Allies receive enemy weakness intel",
      "multiplier": { "allyDamage": 1.2 }
    }
  ]
}
```

Ključno spoznanje: **noben Orbital se ne spremeni**. Defend nima kode za "deluj bolje z Mend." Resonance je lastnost *kombinacije*, ne posameznikov.

To je točno tako, kot bi morala delovati kompozicija programske opreme.

## Vzorec: Orbital Composition

V Almadarju Orbitals komunicirajo preko **dogodkov**. Vsak Orbital deklarira kaj emitira in kaj posluša:

```json
{
  "name": "DefendOrbital",
  "traits": [{
    "name": "ShieldTrait",
    "emits": ["SHIELD_ACTIVATED", "SHIELD_DEPLETED"],
    "stateMachine": {
      "states": [
        { "name": "Ready", "isInitial": true },
        { "name": "Active" },
        { "name": "Cooldown" }
      ],
      "transitions": [
        {
          "from": "Ready",
          "to": "Active",
          "event": "ACTIVATE_SHIELD",
          "effects": [
            ["set", "@entity.shieldHp", "@entity.maxShieldHp"],
            ["emit", "SHIELD_ACTIVATED"]
          ]
        },
        {
          "from": "Active",
          "to": "Cooldown",
          "event": "SHIELD_BROKEN",
          "effects": [
            ["set", "@entity.shieldHp", 0],
            ["emit", "SHIELD_DEPLETED"]
          ]
        }
      ]
    }
  }]
}
```

```json
{
  "name": "MendOrbital",
  "traits": [{
    "name": "HealTrait",
    "listens": [
      { "event": "SHIELD_DEPLETED", "triggers": "EMERGENCY_HEAL" }
    ],
    "stateMachine": {
      "transitions": [
        {
          "from": "Idle",
          "to": "Healing",
          "event": "EMERGENCY_HEAL",
          "effects": [
            ["set", "@entity.hp", ["+", "@entity.hp", ["*", "@entity.maxHp", 0.2]]]
          ]
        }
      ]
    }
  }]
}
```

**Defend** emitira `SHIELD_DEPLETED`. **Mend** ga posluša. Ko se ščit razbije, se healing sproži samodejno. Noben Orbital ne referencira drugega po imenu. Komunicirata preko event busa.

To je:
- **Ohlapno povezano** — Defend deluje brez Mend
- **Kompozabilno** — Dodaj Mend in novo vedênje se pojavi
- **Preverljivo** — Compiler preveri, da ima vsak `emit` svoj `listen`
- **Odkrivljivo** — Preberi event deklaracije za razumevanje interakcij

## Implikacije programske arhitekture

Ta vzorec se neposredno prenese v poslovno programsko opremo:

### E-Commerce: Obdelava naročil

```
OrderOrbital         PaymentOrbital         InventoryOrbital
    │                     │                      │
    ├─ emits:             ├─ listens:            ├─ listens:
    │  ORDER_PLACED       │  ORDER_PLACED        │  PAYMENT_CONFIRMED
    │                     │  → PROCESS_PAYMENT   │  → RESERVE_STOCK
    │                     │                      │
    │                     ├─ emits:              ├─ emits:
    │                     │  PAYMENT_CONFIRMED   │  STOCK_RESERVED
    │                     │  PAYMENT_FAILED      │  OUT_OF_STOCK
```

Trije Orbitali. Vsak samostojen. Kompozicija preko dogodkov. Compiler preveri, da je graf dogodkov popoln — nobeno sporočilo ne ostane neobdelano.

Primerjajte s mikroservisno različico:
- Trije servisi, tri deploymenti, tri baze
- Message queue (Kafka/RabbitMQ) za povezavo
- Dead letter queues za neuspešna sporočila
- Saga patterns za distribuirane transakcije
- Monitoring in alerting za vsak servis

Almadar različica se prevede v en deployment z isto event-driven arhitekturo, ampak brez infrastrukturnega overheada.

### Timsko sodelovanje: Vzporeden razvoj

Ker Orbitals komunicirajo samo preko dogodkov, lahko ekipe delajo vzporedno:

- **Ekipa A** gradi Order Orbital
- **Ekipa B** gradi Payment Orbital
- **Ekipa C** gradi Inventory Orbital

Soglasje o event kontraktih:
```json
{
  "event": "ORDER_PLACED",
  "payload": {
    "orderId": "string",
    "items": "array",
    "total": "number"
  }
}
```

Nato gradijo neodvisno. Compiler preveri, da se kontrakti ujemajo, ko so Orbitali komponirani.

## Standardna knjižnica: Vnaprej zgrajena vedênja

Almadar vključuje 11 standardnih knjižničnih vedênj, ki se zaskočijo v vsak projekt:

| Vedênje | Kaj počne |
|----------|-------------|
| `std/Loading` | Loading stanja z obdelavo uspeha/napake |
| `std/Fetch` | Asinhrono pridobivanje podatkov s retry |
| `std/Submit` | Pošiljanje forme z validacijo |
| `std/Retry` | Exponential backoff retry logika |
| `std/Poll` | Long-polling vzorci |
| `std/Pagination` | Cursor/offset paginacija |
| `std/Search` | Full-text iskanje s filtriranjem |
| `std/Sort` | Multi-key sortiranje |
| `std/GameCore` | Core game loop (tick, update, render) |
| `std/UnitBehavior` | AI unit vedênja (patrol, guard, flee) |
| `std/Inventory` | Upravljanje inventarja v igrah |

Uvozite jih v kateri koli Orbital:

```json
{
  "uses": [{ "from": "std/Pagination", "as": "Paginate" }],
  "traits": [
    { "ref": "Paginate.traits.PaginationTrait" },
    { "ref": "TaskInteraction" }
  ]
}
```

Vaš seznam Taskov zdaj ima paginacijo. Ni kode napisane. Samo komponirano.

## Zakaj igre to dobro obvladajo

Igre so vedno razumele kompozicijo. RPG lik je kompozicija:
- Class (Warrior, Mage, Rogue)
- Equipment (Sword, Shield, Staff)
- Skills (Fireball, Heal, Sneak)
- Buffs/Debuffs (Poisoned, Blessed, Hasted)

Vsaka je samostojno vedênje. Skupaj ustvarijo unikatnega lika z emergentnimi sposobnostmi.

Poslovna programska oprema bi morala delovati enako:
- **Račun** je kompozicija CRUD + Approval + PDF Generation + Email Notification
- **Uporabnik** je kompozicija Authentication + Profile + Preferences + Activity Log
- **Dashboard** je kompozicija Charts + Filters + Real-time Updates + Export

Vsako vedênje je Orbital. Kompozicija preko dogodkov. Compiler zagotavlja, da je ožičenje pravilno.

## Spoznanje

Razprava mikroservisi vs monolit postavlja napačno vprašanje. Vprašanje ni, kje vedênje živi. Je, kako se vedênje komponira.

Orbitali vam dajejo:
- **Samostojne enote** (kot mikroservisi) — vsak Orbital ima svoj state machine
- **Enostavno kompozicijo** (kot monolit) — uvozi, komponiraj, prevedi
- **Preverjeno ožičenje** (kot nobeden) — compiler preveri vsako event povezavo
- **Emergentno vedênje** (kot igre) — resonance efekti iz združljivih kombinacij

Naslednjič, ko oblikujete sistem, ne začnite z "koliko servisov?" Začnite z "katera vedênja potrebujem in kako se komponirajo?"

Več o [cross-orbital dogodkih](https://orb.almadar.io/docs/traits) in [standardni knjižnici](https://orb.almadar.io/playground).
