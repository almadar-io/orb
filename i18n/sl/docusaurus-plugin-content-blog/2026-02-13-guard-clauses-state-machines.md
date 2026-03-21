---
slug: guard-clauses-state-machines
title: "Guard Clauses v State Machines: Sistem dovoljenj, ki dejansko deluje"
authors: [osamah]
tags: [architecture, state-machines]
---

Avtorizacijska logika raztresena po vaši aplikaciji? Kaj če bi bila preprosto... del definicije stanja?

<!-- truncate -->

## Avtorizacijska zmešnjava

Večina aplikacij obravnava dovoljenja tako:

```typescript
// V komponenti
function ApproveButton({ order }) {
  const { user } = useAuth();
  
  const canApprove = 
    user.roleLevel >= 5 && 
    !order.isFlagged && 
    order.amount > 0;
  
  return (
    <button disabled={!canApprove} onClick={handleApprove}>
      Odobri
    </button>
  );
}

// V API poti
app.post('/api/orders/:id/approve', async (req, res) => {
  const { user } = req;
  const order = await Order.findById(req.params.id);
  
  // Ista logika, podvojena!
  if (user.roleLevel < 5) {
    return res.status(403).json({ error: 'Nezadostna dovoljenja' });
  }
  if (order.isFlagged) {
    return res.status(400).json({ error: 'Naročilo je označeno' });
  }
  if (order.amount <= 0) {
    return res.status(400).json({ error: 'Neveljaven znesek' });
  }
  
  // ... dejanska logika odobritve
});
```

**Problemi:**
- ❌ Logika podvojena v frontendu in backendu
- ❌ Težko vzdrževati sinhronizirano
- ❌ Raztresena po datotekah
- ❌ Ni enega vira resnice

## Guards: Deklarativna avtorizacija

V Almadarju so guards del state machine:

```json
{
  "from": "pending",
  "to": "approved",
  "event": "APPROVE",
  "guard": ["and",
    [">=", "@user.roleLevel", 5],
    ["not", "@entity.isFlagged"],
    [">", "@entity.amount", 0]
  ],
  "effects": [
    ["set", "@entity.status", "approved"],
    ["set", "@entity.approvedAt", "@now"],
    ["persist", "update", "Order", "@entity.id", "@entity"]
  ]
}
```

Guard je **deklarativen**, **serializabilen** in **vsiljen povsod**.

## Kako Guards delujejo

### 1. Definiraj Guard

```json
{
  "guard": ["operator", "operand1", "operand2", ...]
}
```

### 2. Ovrednoten ob času prehoda

Ko se prejme dogodek `APPROVE`:
1. Guard izraz se ovrednoti
2. Če je `true`: prehod se izvede
3. Če je `false`: prehod je blokiran, opcijsko sporočilo o napaki

### 3. Uporabljen povsod

Isti guard se uporablja za:
- ✅ UI (gumb onemogočen, če guard ne uspe)
- ✅ State machine (prehod blokiran)
- ✅ Generiran API (zahtevek zavrnjen)
- ✅ Audit logi (odločitev o avtorizaciji zabeležena)

## Primeri Guardov

### Enostavna primerjava

```json
{
  "guard": ["=", "@entity.ownerId", "@user.id"]
}
// Samo lastnik lahko izvede to akcijo
```

### Na podlagi vlog

```json
{
  "guard": [">=", "@user.roleLevel", 5]
}
// Zahtevana stopnja admin (5+)
```

### Večfaktorski

```json
{
  "guard": ["and",
    ["or",
      [">=", "@user.roleLevel", 5],
      ["=", "@user.department", "finance"]
    ],
    ["not", "@entity.isLocked"],
    ["<", "@entity.amount", 10000]
  ]
}
// (Admin ALI Finance) IN Ni zaklenjeno IN Znesek < 10k
```

### Časovni

```json
{
  "guard": ["<", 
    ["-", "@now", "@entity.createdAt"], 
    86400000
  ]
}
// Akcija dovoljena samo v 24 urah po ustvarjanju
```

### Članstvo v arrayu

```json
{
  "guard": ["contains", "@user.permissions", "orders:approve"]
}
// Uporabnik mora imeti izrecno dovoljenje
```

## Kompleksen primer: Approval Workflow

```json
{
  "traits": [{
    "name": "OrderApproval",
    "linkedEntity": "Order",
    "stateMachine": {
      "states": [
        { "name": "draft", "isInitial": true },
        { "name": "pending_review" },
        { "name": "approved" },
        { "name": "rejected" },
        { "name": "escalated" }
      ],
      "events": ["SUBMIT", "APPROVE", "REJECT", "ESCALATE", "RETURN"],
      "transitions": [
        {
          "from": "draft",
          "to": "pending_review",
          "event": "SUBMIT",
          "guard": ["and",
            [">", "@entity.amount", 0],
            ["not", ["is-empty", "@entity.description"]]
          ]
        },
        {
          "from": "pending_review",
          "to": "approved",
          "event": "APPROVE",
          "guard": ["and",
            [">=", "@user.roleLevel", 5],
            ["not", "@entity.isFlagged"],
            ["or",
              ["<", "@entity.amount", 5000],
              ["and",
                [">=", "@user.roleLevel", 7],
                ["<", "@entity.amount", 50000]
              ]
            ]
          ]
        },
        {
          "from": "pending_review",
          "to": "escalated",
          "event": "ESCALATE",
          "guard": [">=", "@user.roleLevel", 5]
        },
        {
          "from": "pending_review",
          "to": "rejected",
          "event": "REJECT",
          "guard": [">=", "@user.roleLevel", 5]
        },
        {
          "from": "escalated",
          "to": "approved",
          "event": "APPROVE",
          "guard": [">=", "@user.roleLevel", 9]
        }
      ]
    }
  }]
}
```

To kodira celotno matriko odobritev:
- Vsakdo lahko pošlje (če je veljavno)
- Stopnja 5+ lahko odobri do 5K
- Stopnja 7+ lahko odobri do 50K
- Stopnja 9+ lahko odobri karkoli
- Eskalirana naročila potrebujejo stopnjo 9+

## Primerjava iz resničnega sveta: Letališka varnost

Letališka varnost je state machine z guards:

```
Check-in ──(ima karto?)──► Bag Drop ──(teža < 23kg?)──► Varnost
                                                    
Varnost ──(brez tekočin?)──► Sken ──(brez orožja?)──► Gate
                                              
Gate ──(boarding pass veljaven?)──► Boarding ──(prosto mesto?)──► Sedež
```

Vsak prehod ima guard. Če ne uspe:
- Ni karte? → Ni možen check-in
- Pretežka prtljaga? → Plačaj dodatno ali prepakiraj
- Tekočine v torbi? → Vrzi stran

Guardi so **eksplicitni**, **nedvoumni** in **konsistentno uporabljeni**.

## Guards v primerjavi s tradicionalno avtorizacijo

| Aspekt | Tradicionalno | Almadar Guards |
|--------|-------------|----------------|
| Lokacija | Raztreseno po datotekah | Centralizirano v schemi |
| Frontend | Podvojena logika | Avto-generirane preverbe |
| Backend | Middleware + route handlerji | Avto-generirana validacija |
| Audit | Ročno logiranje | Samodejno beleženje odločitev |
| Testiranje | Integracijski testi | Unit test guard izraza |
| Dokumentacija | Ločena dokumentacija | Samo-dokumentirajoča shema |

## Poskusite: Zgradite sistem dovoljenj

Ustvarite `approval-workflow.orb`:

```json
{
  "name": "ApprovalWorkflow",
  "orbitals": [{
    "name": "DocumentApproval",
    "entity": {
      "name": "Document",
      "fields": [
        { "name": "title", "type": "string", "required": true },
        { "name": "content", "type": "string", "required": true },
        { "name": "status", "type": "enum", "values": ["draft", "pending", "approved", "rejected"] },
        { "name": "authorId", "type": "string", "required": true },
        { "name": "isConfidential", "type": "boolean", "default": false }
      ]
    },
    "traits": [{
      "name": "DocumentWorkflow",
      "linkedEntity": "Document",
      "stateMachine": {
        "states": [
          { "name": "draft", "isInitial": true },
          { "name": "pending" },
          { "name": "approved" },
          { "name": "rejected" }
        ],
        "events": ["SUBMIT", "APPROVE", "REJECT", "EDIT"],
        "transitions": [
          {
            "from": "draft",
            "to": "pending",
            "event": "SUBMIT",
            "guard": ["=", "@entity.authorId", "@user.id"]
          },
          {
            "from": "pending",
            "to": "approved",
            "event": "APPROVE",
            "guard": ["and",
              [">=", "@user.roleLevel", 5],
              ["or",
                ["not", "@entity.isConfidential"],
                [">=", "@user.roleLevel", 7]
              ]
            ]
          },
          {
            "from": "pending",
            "to": "rejected",
            "event": "REJECT",
            "guard": [">=", "@user.roleLevel", 5]
          },
          {
            "from": "rejected",
            "to": "draft",
            "event": "EDIT",
            "guard": ["=", "@entity.authorId", "@user.id"]
          }
        ]
      }
    }],
    "pages": [{ "name": "DocumentsPage", "path": "/documents" }]
  }]
}
```

To ustvari:
- Samo avtorji lahko pošljejo svoje dokumente
- Stopnja 5+ lahko odobri/zavrne
- Zaupni dokumenti potrebujejo stopnjo 7+
- Avtorji lahko urejajo zavrnjene dokumente

## Napredno: Dinamični Guards

Guardi lahko referencirajo zunanje podatke:

```json
{
  "guard": ["and",
    [">=", "@user.creditScore", 700],
    ["<", "@entity.loanAmount", ["*", "@user.annualIncome", 0.3]],
    ["not", ["contains", "@user.blacklist", "@entity.merchantId"]]
  ]
}
```

Guard referencira:
- Kreditni rezultat uporabnika
- Letni dohodek uporabnika (za omejitev posojila)
- Črni seznam uporabnika

Vse se razreši ob času vrednotenja.

## Spoznanje

Guardi prinašajo **deklarativno avtorizacijo** v state machines:

- ✅ Logika centralizirana v schemi
- ✅ Samodejno uporabljeno frontend in backend
- ✅ Samo-dokumentirajoča pravila dovoljenj
- ✅ Kompozabilne boolean izraze
- ✅ Type-safe reference vezave

Nehajte raztresati avtorizacijsko logiko po aplikaciji. Definirajte jo enkrat, vsilite jo povsod.

Več o [guardih in effectih](https://orb.almadar.io/docs/traits).
