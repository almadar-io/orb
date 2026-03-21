---
slug: s-expressions-json-functional
title: "S-Expressions: JSON funkcijskega programiranja (ki dejansko smisli)"
image: /img/blog/s-expressions-json-functional.png
authors: [osamah]
tags: [architecture]
---

![S-Expressions, JSON in funkcijska renesansa](/img/blog/s-expressions-json-functional.png)

Zakaj smo izbrali Lisp-style S-expressions namesto JSON za definicijo logike in zakaj bi tudi vi.

Vsi imamo radi JSON, ampak ko potrebujete logiko, končate z string templates ali JavaScriptom. Kaj če bi bil vaš format podatkov *tudi* vaš format logike?

<!-- truncate -->

## Omejitve JSONa

JSON je odličen za podatke:

```json
{
  "name": "John",
  "age": 30,
  "hobbies": ["coding", "reading"]
}
```

Ampak kaj pa logika? Imate nekaj možnosti:

### Možnost 1: String Templates
```json
{
  "condition": "user.age >= 18 && user.verified"
}
```
- ❌ Nagnjeno k napakam (napake v nizih)
- ❌ Brez validacije
- ❌ Tveganje vbrizgavanja

### Možnost 2: Custom DSL
```json
{
  "condition": {
    "and": [
      { "gte": ["user.age", 18] },
      { "eq": ["user.verified", true] }
    ]
  }
}
```
- ✅ Strukturirano
- ❌ Verbetno
- ❌ Težko za brati

### Možnost 3: JavaScript Functions
```javascript
const condition = (user) => user.age >= 18 && user.verified;
```
- ✅ Berljivo
- ❌ Ni serializabilno
- ❌ Varnostno tveganje (eval)

## Vstopijo S-Expressions

S-expressions (simbolične izraze) obstajajo od leta 1958 z Lispem. So preprosti:

```
(operator operand1 operand2 ...)
```

V JSON-friendly obliki:

```json
["operator", "operand1", "operand2", ...]
```

## S-Expressions v Almadarju

Almadar uporablja S-expressions za guards in effects:

### Guards: Pogojna logika

```json
{
  "from": "pending",
  "to": "approved",
  "event": "APPROVE",
  "guard": ["and",
    [">=", "@user.roleLevel", 5],
    ["not", "@entity.isFlagged"],
    [">", "@entity.amount", 0]
  ]
}
```

To je enakovredno:
```javascript
if (user.roleLevel >= 5 && !entity.isFlagged && entity.amount > 0) {
  // Dovoli prehod
}
```

Ampak je:
- ✅ Serializabilno
- ✅ Validabilno
- ✅ Varno (brez eval)
- ✅ Cross-platform

### Effects: Spremembe stanja

```json
{
  "effects": [
    ["set", "@entity.status", "approved"],
    ["set", "@entity.approvedAt", "@now"],
    ["set", "@entity.approvedBy", "@user.id"],
    ["persist", "update", "Order", "@entity.id", "@entity"]
  ]
}
```

Vsak effect je S-expression:
- `["set", target, value]` — Nastavi vrednost
- `["persist", operation, entity, id, data]` — Shrani v bazo
- `["emit", event, payload]` — Emitiraj dogodek

## Zakaj je to pomembno

### 1. Homoikoničnost (koda kot podatki)

S-expressions so podatki, ki izgledajo kot koda. To pomeni:

```json
["+", "@entity.count", 1]
```

Je oboje:
- Podatkovna struktura (array nizov)
- Izvajljiva koda (prištej 1 k count)

### 2. Kompozabilnost

S-expressions lahko poljubno gnezdite:

```json
["if",
  ["and",
    [">", "@entity.score", 100],
    ["=", "@entity.status", "active"]
  ],
  ["emit", "ACHIEVEMENT_UNLOCKED", { "level": "gold" }],
  ["emit", "ACHIEVEMENT_PROGRESS", { "needed": ["-", 100, "@entity.score"] }]
]
```

### 3. Serializacija

Ker so S-expressions samo arrayi, se serializirajo popolno:

```javascript
// JavaScript
const guard = [">=", "@user.age", 18];
JSON.stringify(guard); // '[">=","@user.age",18]'
```

```python
# Python
guard = [">=", "@user.age", 18]
json.dumps(guard)  # '[">=","@user.age",18]'
```

```rust
// Rust
let guard = json!( [">=", "@user.age", 18] );
serde_json::to_string(&guard).unwrap();
```

## Kontekst vezave

S-expressions v Almadarju uporabljajo posebne predpone za kontekst:

| Predpona | Pomen | Primer |
|--------|---------|---------|
| `@entity.field` | Polje trenutnega entity | `"@entity.status"` |
| `@payload.field` | Event payload | `"@payload.userId"` |
| `@state` | Ime trenutnega stanja state machine | `"@state"` (npr. `"Browsing"`) |
| `@user.field` | Trenutni uporabnik | `"@user.id"` |
| `@now` | Trenutni timestamp | `"@now"` |

To ustvarja **deklarativni vezalni sistem**:

```json
{
  "guard": ["=", "@entity.ownerId", "@user.id"],
  "effects": [
    ["set", "@entity.updatedAt", "@now"],
    ["set", "@entity.updatedBy", "@user.id"]
  ]
}
```

## Primerjava iz resničnega sveta: Excel formule

Če ste uporabljali Excel, ste uporabljali S-expressions:

```excel
=IF(AND(A1>100, B1="active"), "Gold", "Silver")
```

V Almadarju:
```json
["if",
  ["and", [">", "@entity.score", 100], ["=", "@entity.status", "active"]],
  "Gold",
  "Silver"
]
```

Excel formule so S-expressions. So:
- Deklarativne (poveste kaj, ne kako)
- Kompozabilne (funkcije kličejo funkcije)
- Varno (brez poljubnega izvajanja kode)

## Standardni operatorji

Almadarjeva standardna knjižnica vsebuje:

### Primerjava
```json
["=", "a", "b"]        // enakost
["!=", "a", "b"]       // ni enako
[">", "a", "b"]        // večje od
[">=", "a", "b"]       // večje ali enako
```

### Logika
```json
["and", "a", "b", "c"] // vsi morajo biti true
["or", "a", "b", "c"]  // vsaj en true
["not", "a"]           // negacija
```

### Matematika
```json
["+", "a", "b", "c"]   // vsota
["-", "a", "b"]        // razlika
["*", "a", "b"]        // produkt
["/", "a", "b"]        // količnik
```

### Array
```json
["count", "@array"]    // dolžina arraya
["contains", "@array", "item"]  // članstvo
["filter", "@array", ["predicate"]]
```

### String
```json
["concat", "a", "b"]   // združi
["length", "str"]      // dolžina niza
["matches", "str", "regex"]
```

## Poskusite: Zgradite Guard

Ustvarimo guard za approval workflow:

```json
{
  "from": "pending",
  "to": "approved",
  "event": "APPROVE",
  "guard": ["and",
    ["or",
      [">=", "@user.roleLevel", 5],
      ["=", "@user.id", "@entity.ownerId"]
    ],
    ["not", "@entity.isLocked"],
    [">", "@entity.amount", 0],
    ["<", "@entity.amount", 10000]
  ]
}
```

To se prevede v:
```javascript
if (
  (user.roleLevel >= 5 || user.id === entity.ownerId) &&
  !entity.isLocked &&
  entity.amount > 0 &&
  entity.amount < 10000
) {
  // Dovoli odobritev
}
```

Ampak z:
- ✅ Deklarativno sintakso
- ✅ Avtomatično validacijo
- ✅ Brez tveganja vbrizgavanja kode
- ✅ Serializabilno za audit loge

## Spoznanje

S-expressions niso samo Lisp-radovednost — so praktična rešitev za "kako damo logiko v JSON?"

Dajejo vam:
- **Moč kode** (kompozabilnost, izraznost)
- **Varnost podatkov** (serializacija, validacija, brez eval)
- **Jasnost Excela** (deklarativno, berljivo)

Naslednjič, ko vas bo zamikalo uporabiti `eval()` ali string templates za dinamično logiko, pomnite: obstaja 60 let stara rešitev, ki dejansko deluje.

Želite raziskati več? Preverite [standardne knjižnične operatorje](https://orb.almadar.io/docs/stdlib).
