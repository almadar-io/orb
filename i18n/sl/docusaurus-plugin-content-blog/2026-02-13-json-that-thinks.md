---
slug: json-that-thinks
title: "JSON, ki razmišlja: Kako smo zgradili Turing-complete jezik znotraj JSON"
authors: [osamah]
tags: [language-design, architecture]
---

Kaj če bi JSON lahko izražal logiko, ne samo podatke? Kaj če bi lahko vaše konfiguracijske datoteke sprejemale odločitve?

Zgradili smo Turing-complete programski jezik, ki je strog subset JSON. Ni nove sintakse. Ni custom parserja. Vsak Almadar program je veljaven JSON.

Tukaj je zakaj — in kako.

<!-- truncate -->

## Problem s konfiguracijskimi jeziki

Industrija kroži okoli tega problema že desetletja:

- **YAML** — Odličen za podatke, grozen za logiko. Vodi v nočne more templating (pozdravljeni, Helm charts).
- **HCL (Terraform)** — Izumil novo sintakso. Zdaj potrebujete parser, LSP, editor plugin in usposabljanje.
- **Dhall** — Načelen, a nišni. Malo razvijalcev ve, da obstaja.
- **Jsonnet/CUE** — JSON-like, ampak ne JSON. Blizu, ampak razbijejo kompatibilnost z orodji.

Vzorec: vsakič, ko nekdo potrebuje logiko v konfiguraciji, izumi nov jezik. Nov parser. Nova orodja. Nova krivulja učenja.

Vprašali smo: **kaj če ne bi?**

## Spoznanje: S-Expressions so že JSON

Leta 1958 je John McCarthy izumil S-expressions za Lisp:

```lisp
(+ 1 2)
(if (> x 10) "big" "small")
```

S-expressions so samo gnezdene liste s funkcijo na prvem mestu.

JSON arrayi so... gnezdene liste.

```json
["+", 1, 2]
["if", [">", "x", 10], "big", "small"]
```

**S-expressions *so* JSON arrayi.** Ni bilo treba izumiti sintakse. Morali smo samo interpretirati tisto, kar je že bilo tam.

## Kako deluje Almadar

Almadar program je JSON objekt, ki vsebuje entities, state machines in logiko izraženo kot S-expressions:

```json
{
  "name": "ApprovalWorkflow",
  "orbitals": [{
    "entity": {
      "name": "Request",
      "fields": [
        { "name": "amount", "type": "number" },
        { "name": "status", "type": "enum", "values": ["pending", "approved", "rejected"] }
      ]
    },
    "traits": [{
      "name": "ApprovalTrait",
      "linkedEntity": "Request",
      "stateMachine": {
        "states": [
          { "name": "Pending", "isInitial": true },
          { "name": "Approved" },
          { "name": "Rejected" }
        ],
        "transitions": [{
          "from": "Pending",
          "to": "Approved",
          "event": "APPROVE",
          "guard": ["and",
            [">=", "@user.roleLevel", 3],
            ["<", "@entity.amount", 10000]
          ],
          "effects": [
            ["set", "@entity.status", "approved"],
            ["set", "@entity.approvedAt", "@now"],
            ["emit", "REQUEST_APPROVED"]
          ]
        }]
      }
    }]
  }]
}
```

Logika (guard, effects) so čisti S-expressions. Struktura (entities, states, transitions) je čisti JSON. Skupaj tvorijo popoln program.

## Zakaj je to pomembno: Homoikoničnost

Homoikoničnost pomeni "koda in podatki si delita isto reprezentacijo." To je supermoč Lispa, zdaj pa tudi JSONa.

Ker so Almadar programi JSON:

**1. Vsako JSON orodje deluje na Almadar programih.**

```bash
# Validiraj s katerim koli JSON validatorjem
cat app.orb | python -m json.tool

# Poizveduj z jq
jq '.orbitals[].traits[].stateMachine.states' app.orb

# Diff dveh shem
diff <(jq -S . v1.orb) <(jq -S . v2.orb)
```

**2. AI lahko generira in spreminja programe.**

LLMji so odlični pri generiranju strukturiranega JSON. So grozni pri generiranju pravilne sintakse v novih jezikih. Z ostankom v JSON, so Almadar programi trivialno generirani s strani katerega koli modela, ki lahko proizvede veljaven JSON — kar so vsi.

**3. Programi so podatki, ki jih lahko transformirate.**

Želite dodati audit logging vsakemu prehodu? Napišite JSON transformacijo:

```javascript
schema.orbitals.forEach(orbital =>
  orbital.traits.forEach(trait =>
    trait.stateMachine.transitions.forEach(t => {
      t.effects.push(["log", "info", `Transition: ${t.from} → ${t.to}`]);
    })
  )
);
```

Ni AST parsinga. Ni compiler pluginov. Samo manipulacija podatkov.

## Argument Turing Completeness

Jezik je Turing-complete, če lahko simulira katero koli računanje. Almadar to doseže z:

1. **State machines** — Poljubno stanje, prehodi in pomnilnik (entity fields)
2. **S-expression guards** — Boolean logika s poljubnim gnezdenjem (`and`, `or`, `not`, primerjalni operatorji)
3. **S-expression effects** — Side effects vključno z `set` (pisi v pomnilnik), `emit` (komunikacija) in `if` (branching)
4. **Cross-orbital events** — Med-procesna komunikacija (emit/listen)
5. **Rekurzija preko self-transitions** — Stanje lahko preide samo vase s spremenjenimi entity fields

Zanka s pogojem in polji entity je ekvivalentna while zanki z mutable stanjem:

```json
{
  "from": "Computing",
  "to": "Computing",
  "event": "TICK",
  "guard": [">", "@entity.counter", 0],
  "effects": [
    ["set", "@entity.counter", ["-", "@entity.counter", 1]],
    ["set", "@entity.result", ["+", "@entity.result", "@entity.counter"]],
    ["emit", "TICK"]
  ]
}
```

To izračuna vsoto števil od N do 0. State machine je zanka. Entity je pomnilnik. Guard je pogoj za terminacijo.

## Primerjava: Pokrajina konfiguracijskih jezikov

| Jezik | JSON Compatible | Podpora logike | Turing Complete | Orodja |
|----------|----------------|---------------|-----------------|--------|
| JSON | Da | Ne | Ne | Univerzalna |
| YAML | Ne | Ne | Ne | Široka |
| Jsonnet | Delno | Da | Da | Omejena |
| Dhall | Ne | Da | Ne (namerno) | Minimalna |
| CUE | Delno | Da | Ne (namerno) | Rastoča |
| HCL | Ne | Omejena | Ne | Terraform |
| **Almadar** | **Da** | **Da** | **Da** | **Univerzalna (JSON)** |

Almadar je edini Turing-complete jezik, ki je strog subset JSON. To pomeni, da vsako JSON orodje, vsak JSON API, vsaka JSON baza in vsak JSON-aware LLM deluje z Almadar programi takoj.

## Kako se S-expressions izvajajo

Almadar compiler rekurzivno ovrednoti S-expressions:

```
["and",
  [">=", "@user.roleLevel", 3],
  ["<", "@entity.amount", 10000]
]
```

**Koraki vrednotenja:**

1. Razreši vezave: `@user.roleLevel` → `5`, `@entity.amount` → `7500`
2. Ovrednoti notranje izraze: `[">=", 5, 3]` → `true`, `["<", 7500, 10000]` → `true`
3. Ovrednoti zunanji izraz: `["and", true, true]` → `true`

Compiler optimizira ponavljajoča se vrednotenja guardov interno — pogosto v UI, kjer se isti pogoji preverjajo ob vsakem renderiranju — tako da je vrednotenje hitro tudi za kompleksne izraze.

## Razširjanje brez verzioniranja

Dodajanje novih operatorjev v Almadar ne zahteva bumpa verzije sheme:

```json
["geo-distance", "@entity.location", "@payload.target"]
```

Če evaluator pozna `geo-distance`, ga ovrednoti. Če ne, vrne napako s jasnimi navodili. Novi operatorji so **aditivni** — nikoli ne pokvarijo obstoječih programov.

To je isti model razširljivosti, ki je omogočil Lispu preživeti 65 let.

## Kompromis: Verbotnost

Bodimo iskreni. S-expressions v JSON so bolj verbetne kot bi bila custom sintaksa:

```
-- Hipotetična custom sintaksa
guard: user.roleLevel >= 3 and entity.amount < 10000

-- Almadar (dejansko)
"guard": ["and", [">=", "@user.roleLevel", 3], ["<", "@entity.amount", 10000]]
```

Custom sintaksa ima 50 znakov. Almadar različica ima 75. To je ~50% več znakov.

Verjamemo, da je ta kompromis vreden, ker:
- Nikoli ne potrebujete custom parserja
- Nikoli ne potrebujete custom LSP
- Nikoli ne morate naučiti svojo ekipo nove sintakse
- AI jo generira pravilno na prvi poskus
- Vsako JSON orodje na svetu deluje na vaših programih

Verbotnost je enkraten strošek. Kompatibilnost z orodji je za vedno.

## Spoznanje

Vsako desetletje nekdo izumi nov konfiguracijski jezik za rešiti problem "logika v configu". Vsak doda parser, krivuljo učenja in ecosistem za vzdrževanje.

Almadar ubere drugo pot: **ni nove sintakse**. Samo JSON arrayi, interpretirani kot S-expressions, kombinirani s state machines za nadzor pretoka in entities za pomnilnik.

Rezultat je Turing-complete jezik, ki:
- Vsako JSON orodje razume
- Vsak LLM lahko generira
- Vsak razvijalec lahko prebere (to so samo arrayi)
- Prevede v TypeScript, Rust in Python

Ker je najboljša sintaksa morda tista, ki jo že poznate.

Raziščite [S-expression standardno knjižnico](https://orb.almadar.io/playground) za vse razpoložljive operatorje.
