---
slug: visible-ai-game-design
title: "Visible AI: Nova paradigma oblikovanja iger"
authors: [almadar]
tags: [gaming, state-machines, game-design]
---

V večini iger je AI črna skrinja. Sovražniki počnejo stvari, vi pa reagirate. Ni načina za branje njihovih namenov, napovedovanje njihovih potez ali premagovanje z misljenjem — samo hitrejši refleksi.

Kaj če bi bilo AI-jevo vedênje vidno? Kaj če bi lahko *prebrali* sovražnikov state machine in ga uporabili proti njim?

To smo zgradili v Trait Wars.

<!-- truncate -->

## Problem črne skrinje

V tradicionalnem game AI sovražnikovo vedênje izgleda tako iz perspektive igralca:

```
Sovražnik počne... nekaj.
Vi utrpite škodo.
Zakaj? Kdo ve.
```

Pod pokrovom je zmešnja uteženih naključnih odločitev:

```python
# Tradicionalni game AI
def decide_action(enemy, player):
    if enemy.hp < 30:
        if random() < 0.6:
            return "flee"
        else:
            return "desperate_attack"
    elif distance(enemy, player) < 3:
 if random() < 0.7:
      return "melee_attack"
        else:
 return "block"
    else:
        return "approach"
```

Naključne uteži, gnezdene conditionals, nevidno stanje. Igralec ne more smiselno interagirati s tem sistemom. Lahko samo hitreje reagira.

**Zato večina game AI deluje "nepošteno" ali "neumno" — nikoli inteligentno.**

## Načelo Visible AI

Trait Wars to obrne. Vsaka enota v igri ima **Traits** — in traits so state machines. Igralec lahko vidi:

1. **V katerem stanju je sovražnik** (Idle, Aggressive, Defending, Enraged)
2. **Kateri dogodki sprožijo prehode** (ATTACK, TAKE_DAMAGE, LOW_HP)
3. **Kaj bo sovražnik storil** ko se prehod sproži (effects)

To transformira boj iz refleksne igre v **strateško igro o branju in manipulaciji state machines**.

## Kako deluje

### Trait: Jedro vsake enote

Vsaka enota v Trait Wars opremlja traitse. Trait je viden state machine:

```json
{
  "name": "BerserkerTrait",
  "linkedEntity": "Unit",
  "stateMachine": {
    "states": [
      { "name": "Calm", "isInitial": true },
      { "name": "Aggressive" },
      { "name": "Enraged" }
    ],
    "events": [
      { "key": "TAKE_DAMAGE", "name": "Take Damage" },
      { "key": "KILL_ENEMY", "name": "Kill Enemy" },
      { "key": "REST", "name": "Rest" }
    ],
    "transitions": [
      {
        "from": "Calm",
        "to": "Aggressive",
        "event": "TAKE_DAMAGE",
        "guard": ["<", "@entity.hp", ["*", "@entity.maxHp", 0.5]],
        "effects": [
          ["set", "@entity.attackMultiplier", 1.5],
          ["set", "@entity.defenseMultiplier", 0.8]
        ]
      },
      {
        "from": "Aggressive",
        "to": "Enraged",
        "event": "TAKE_DAMAGE",
        "guard": ["<", "@entity.hp", ["*", "@entity.maxHp", 0.25]],
        "effects": [
          ["set", "@entity.attackMultiplier", 2.5],
          ["set", "@entity.defenseMultiplier", 0.4]
        ]
      },
      {
        "from": "Enraged",
        "to": "Calm",
        "event": "KILL_ENEMY",
        "effects": [
          ["set", "@entity.attackMultiplier", 1.0],
          ["set", "@entity.defenseMultiplier", 1.0],
          ["set", "@entity.hp", ["*", "@entity.maxHp", 0.3]]
        ]
      }
    ]
  }
}
```

Igralec lahko vidi ta trait na sovražnikovi enoti. Vé:

- **Calm** → Normalni stats. Varno zaenkrat prezreti.
- **Aggressive** → 1.5x napad, 0.8x obramba. Nevaren ampak krhak.
- **Enraged** → 2.5x napad, 0.4x obramba. Stekleni top. Udari zdaj ali umri.
- **Kill trigger** → Če Berserker ubije nekoga medtem ko je Enraged, se resetira v Calm in ozdravi. Ne pusti mu dobiti uboja.

## Igralčeva strategija se pojavi

Ker je AI viden, boj postane o **manipulaciji sovražnikovega stanja**:

### Strategija 1: Bait the Berserker

1. Pošlji tanky enoto za absorbiranje udarcev
2. Počakaj, da Berserker vstopi v **Enraged** (2.5x napad, 0.4x obramba)
3. Udari s svojimi ranged enotami — 0.4x obramba pomeni, da se stopijo
4. Ubij jih, preden ubijejo tvoj tank (kar bi jih resetiralo v Calm + ozdravilo)

### Strategija 2: Deny the Reset

1. Berserker se ozdravi, ko ubije medtem ko je Enraged
2. Drži svoje low-HP enote izven njegovega dosega
3. Stradaj ga ciljev za ubijanje, medtem ko je njegova obramba prepolovljena

### Strategija 3: Trait Counters

Enota z **Shield Trait** lahko absorbira Enraged izbruh:

```
ShieldTrait: Calm → Shielded (on INCOMING_ATTACK)
  - Absorbira škodo enako @entity.shieldStrength
  - Preide nazaj v Calm po 2 potezah
```

Igralec prebere oba trait machinea in sestavi counter-strategijo. To ni kamen-papir-škare. Je **branje sovražnikovega state machinea in izkoriščanje njegovih prehodov**.

## Zakaj to ustvarja boljše igre

### 1. Spretnost je znanje, ne refleksi

V refleksni igri 15-letnik s hitrimi prsti vedno premaga 35-letnega stratega. V Trait Wars razumevanje state machines — branje v katerem stanju je sovražnik, napovedovanje kaj bo sprožilo naslednji dogodek, pozicioniranje enot za izkoriščanje oken prehodov — je spretnost.

### 2. Ni frustracije zaradi naključnosti

Ko izgubite proti Berserkerju, točno veste zakaj: pustili ste mu, da doseže Enraged in niste kaznovali 0.4x obrambnega okna. State machine je determinističen. Isti vhodi, isti izhodi. Vsak poraz je priložnost za učenje, ne metanje kocke.

### 3. Emergentna kompleksnost iz preprostih pravil

Vsak trait ima 3-5 stanj. Preprosto. Ampak ko ima enota 2-3 trate, in sovražnik ima 2-3 trate, in je 6 enot na stran... je interakcijski prostor ogromen. Ne zaradi kompleksnih pravil, ampak ker **kompozicija ustvarja emergenco**.

### 4. Igralci postanejo sistemski misleci

Igranje Trait Wars uči razmišljanje v smislu:
- Stanj (kaj se lahko zgodi)
- Prehodov (kaj sproži spremembo)
- Guardov (kaj prepreči spremembo)
- Effectov (kaj sprememba povzroči)

To so isti koncepti, ki se uporabljajo v software inženirstvu, oblikovanju poslovnih procesov in sistemskem razmišljanju. Igra uči mentalni model, ki se prenese v resnični svet.

## Oblikovalska skrivnost: Traits so mehanike iger

V tradicionalnih igrah so sposobnosti definirane s strani oblikovalcev v kodi. Dodajanje nove sposobnosti pomeni programiranje novega vedênja.

V Trait Wars **traits SO mehanike iger**. Dodajanje novih sposobnosti je dodajanje novih state machines:

```json
{
  "name": "VampireTrait",
  "stateMachine": {
    "states": [
      { "name": "Hungry", "isInitial": true },
      { "name": "Fed" }
    ],
    "transitions": [
      {
        "from": "Hungry",
        "to": "Fed",
        "event": "DEAL_DAMAGE",
        "effects": [
          ["set", "@entity.hp", ["+", "@entity.hp", ["*", "@payload.damage", 0.3]]],
          ["set", "@entity.attackMultiplier", 0.8]
        ]
      },
      {
        "from": "Fed",
        "to": "Hungry",
        "event": "TURN_END",
        "guard": [">=", "@entity.turnsSinceFed", 3],
        "effects": [
          ["set", "@entity.attackMultiplier", 1.2]
        ]
      }
    ]
  }
}
```

Vampire ozdravi 30% škode, ki jo povzroči. Po hranjenju je nekaj časa šibkejši (0.8x napad). Po 3 potezah brez hranjenja ponovno postane lačen in udari močneje (1.2x). Igralec to prebere in načrtuje ustrezno.

Nobena nova koda ni bila napisana. Samo JSON state machine.

## Resonance: Kompozicija traitov kot mehanika igre

Ko enote opremijo kompatibilne trate, ustvarijo **Resonance** — sinergijske množilce:

| Kombinacija | Resonance Effect |
|-------------|-----------------|
| Defend + Mend | 1.5x shield healing |
| Berserker + Vampire | Lifesteal scales with rage |
| Shield + Taunt | 2x aggro generation |

To ustvarja sloj deckbuildinga nad taktičnim bojem. Igralci ne izbirajo samo enot — izbirajo **kombinacije traitov**, ki ustvarijo emergentne strategije.

## Spoznanje

Za oblikovalce iger: **naredite AI viden**. Ko igralci lahko preberejo sistem, se z njim intelektualno ukvarjajo. Porazi postanejo priložnosti za učenje. Zmage se počutijo zaslužene. Globina izhaja iz preprostih, kompozabilnih pravil.

Za razvijalce: **state machines niso samo za forme in workflowe**. So orodje za oblikovanje iger, ki ustvarja deterministično, berljivo, kompozabilno vedênje — točno tisto, kar igralci in oblikovalci potrebujejo.

Za igralce: **Trait Wars prihaja**. In v tej igri zmaguje najpametnejši igralec.

Spremljajte razvoj na [almadar.io](/blog).
