---
slug: agentic-search
title: "Agentic Search: Učenje AI, da si zapomni kot človek"
authors: [osamah]
tags: [architecture, ai]
image: /img/blog/agentic-search.png
---

![Agentic Search: Učenje AI, da si zapomni kot človek](/img/blog/agentic-search.png)

Vector search najde podoben tekst. Agentic search najde relevantni kontekst. Razlika je v razmišljanju.

<!-- truncate -->

## Problem iskanja

Tradicionalno iskanje sprašuje: *"Kateri dokumenti vsebujejo te besede?"*

Ampak ljudje sprašujejo: *"Kaj sem mislil, ko sem to rekel?"*

**Primer poizvedbe:** *"Kako sem obravnaval avtentikacijo uporabnikov?"*

**Vector search pristop:**
- Najde dokumente z "user" in "authentication"
- Zamani: Seje o "auth", "login", "sign-in"
- Zamani: Kontekst o zakaj ste izbrali JWT namesto sej
- Zamani: Verigo napaka → popravek → uspeh

**Pristop človeškega spomina:**
- "Spomnim se, da sem delal na tem prejšnji mesec"
- "Bilo je za e-trgovinski projekt"
- "Najprej sem poskusil OAuth, nato prešel na JWT"
- "Težava je bila z osveževanjem žetonov"

Ljudje iščejo z **razmišljanjem**, ne **podobnostjo**.

## Agentic Search

Agentic search kombinira:
1. **Semantično razumevanje** — Kaj pomeni poizvedba?
2. **Časovno navigacijo** — Kdaj se je to zgodilo?
3. **Prepoznavanje vzorcev** — Kakšna vrsta rešitve?
4. **Kavzalno razmišljanje** — Kaj je vodilo do uspeha?

```typescript
const response = await searchEngine.search({
  userId: 'user_123',
  query: "How did I handle user authentication?",
  strategy: 'hybrid',  // temporal + semantic + pattern
  depth: 3,
  limit: 10,
});

// Vrne:
response.insights.summary
// "Found 3 authentication implementations across 2 projects"

response.insights.patterns
// ["jwt-auth", "oauth-integration", "session-management"]

response.insights.suggestions
// ["Consider reusing the JWT pattern from Project A"]

response.results[0].reasoning
// "Session from March 2025 implemented JWT authentication 
//    with refresh tokens for the e-commerce project"
```

## Štirje iskalni pristopi

### 1. Časovno iskanje

*"Kaj sem delal prejšnji teden?"*

```typescript
const response = await searchEngine.search({
  userId: 'user_123',
  query: "Pokaži mi nedavno delo na avtentikaciji",
  strategy: 'temporal',
});
```

Kako deluje:
1. Razčleni časovne označevalce ("nedavno", "prejšnji teden", "torek")
2. uteži po svežini (eksponentni padec)
3. Okrepi ujemanja iz zahtevanega časovnega obdobja

```typescript
// Relevance scoring
const daysAgo = (Date.now() - session.createdAt) / (1000 * 60 * 60 * 24);
const recencyBoost = Math.max(0.1, 1 - daysAgo / 30);
```

### 2. Semantično iskanje

*"Kako sem obravnaval uporabniške vloge?"*

```typescript
const response = await searchEngine.search({
  userId: 'user_123',
  query: "Najdi mojo implementacijo role-based access control",
  strategy: 'semantic',
});
```

Kako deluje:
1. Izvleci semantične koncepte ("vloge", "dostop", "dovoljenja")
2. Ujemi s preferencami in kontekstom projekta
3. Navzkrižno preveri s kontekstom seje

```typescript
const concepts = extractConcepts(query);
// { entities: ['Role', 'User'], patterns: ['guard'], actions: ['authorize'] }

// Match against sessions
const matches = sessions.filter(s => 
  s.entities.some(e => concepts.entities.includes(e)) ||
  s.patterns.some(p => concepts.patterns.includes(p))
);
```

### 3. Iskanje po vzorcih

*"Pokaži mi vse list views, ki sem jih zgradil"*

```typescript
const response = await searchEngine.search({
  userId: 'user_123',
  query: "Najdi vse moje list views",
  strategy: 'pattern',
});
```

Kako deluje:
1. Izvleci izraze vzorcev ("list", "table", "grid", "cards")
2. Išči pattern affinity zapise
3. Vrni seje, ki uporabljajo te vzorce

```typescript
const patternTerms = ['list', 'table', 'grid', 'cards'];
const userPatterns = await memoryManager.getUserPatterns(userId);

// Find high-success patterns
const goodPatterns = userPatterns.filter(p => 
  p.successCount / p.usageCount > 0.8
);
```

### 4. Hibridno iskanje

*"Kaj je dobro delovalo za forme?"* (kombinira vse strategije)

```typescript
const response = await searchEngine.search({
  userId: 'user_123',
  query: "Kaj je dobro delovalo za forme?",
  strategy: 'hybrid',
  depth: 3,
});
```

Kombinira časovne, semantične in vzorce rezultate z deduplikacijo.

## Pogon za razmišljanje

Agentic search ne samo vrne ujemanj — **razloži zakaj se ujemajo**:

```typescript
interface SearchResult {
  type: 'preference' | 'session' | 'project' | 'pattern';
  data: unknown;
  relevance: number;  // 0-1
  reasoning: string;  // Berljivo za človeka razlago
  source: string;     // Od kod prihaja
}

// Primer rezultata
{
  type: 'session',
  data: { /* session record */ },
  relevance: 0.87,
  reasoning: "Seja iz marca 2025 vsebuje 'User' entity s 
             'role' poljem in uporablja 'guard-clause' vzorec. 
             Uporabnik je prej označil ta vzorec kot uspešen.",
  source: 'generation_history'
}
```

## Generiranje vpogledov

Poleg posameznih rezultatov agentic search generira **vpoglede**:

```typescript
interface Insights {
  summary: string;           // Kaj je bilo najdeno
  patterns: string[];        // Pogosti vzorci
  trends: string[];          // Časovni trendi
  suggestions: string[];     // Akcijski naslednji koraki
}

// Primer
{
  summary: "Found 12 sessions involving forms across 3 projects",
  patterns: ["form-section", "validation-rules", "wizard-flow"],
  trends: [
    "High success rate (92%) with form-section pattern",
    "Validation errors decreased after adopting std/validate"
  ],
  suggestions: [
    "Consider reusing the wizard-flow pattern for complex forms",
    "Add entity-form to your preferred patterns"
  ]
}
```

## Primer iz resničnega sveta

**Uporabniška poizvedba:** *"Kako sem zgradil checkout flow?"*

**Agentic search proces:**

1. **Ekstrakcija konceptov**
   ```typescript
   concepts = {
     entities: ['Order', 'Payment', 'Cart'],
     patterns: ['wizard', 'form', 'validation'],
     actions: ['checkout', 'purchase', 'pay']
   }
   ```

2. **Časovno iskanje**
   - Najdenih 5 sej iz zadnjih 3 mesecev
   - Uteženo po svežini

3. **Semantično iskanje**
   - Ujemanje "checkout" v promptih
   - Najdeni povezani entities (Order, Cart)

4. **Iskanje po vzorcih**
   - Najdena uporaba `wizard-flow` vzorca
   - 90% stopnja uspeha

5. **Generiranje vpogledov**
   ```typescript
   {
     summary: "Found checkout implementation using 3-step wizard",
     patterns: ["wizard-flow", "form-section", "validation-rules"],
     trends: [
       "Most successful: 3-step wizard (92% completion)",
       "Less successful: single-page checkout (67%)"
     ],
     suggestions: [
       "Reuse wizard-flow for future checkout flows",
       "Consider adding progress indicator pattern"
     ]
   }
   ```

## Primer kode: Uporaba Agentic Search

```typescript
// Internal: Almadar's agentic search engine
// (This is how it works under the hood — not a public API)
const searchEngine = createSearchEngine(memoryManager);

// Search for authentication patterns
const response = await searchEngine.search({
  userId: 'user_123',
  query: "How did I handle authentication in the e-commerce project?",
  strategy: 'hybrid',
  depth: 3,
  limit: 10,
});

// Display summary
console.log(response.insights.summary);
// "Found 4 authentication implementations across 2 projects"

// Display patterns used
response.insights.patterns.forEach(pattern => {
  console.log(`- ${pattern}`);
});
// - jwt-auth
// - oauth-integration
// - session-management

// Display top results with reasoning
response.results.slice(0, 3).forEach(result => {
  console.log(`${result.type}: ${result.reasoning} (${result.relevance})`);
});

// session: Session from March 2025 implemented JWT authentication 
//   with refresh tokens for the e-commerce project (0.92)
//
// pattern: Pattern 'jwt-auth' has 95% success rate across 12 uses (0.88)
//
// preference: User prefers JWT over session-based auth (0.85)

// Take action on suggestions
if (response.insights.suggestions.length > 0) {
  console.log("\nSuggested actions:");
  response.insights.suggestions.forEach(s => console.log(`- ${s}`));
}
// - Consider reusing the JWT pattern from E-Commerce project
// - Add 'jwt-auth' to your preferred patterns
```

## Primerjava: Vector vs Agentic

| Aspekt | Vector Search | Agentic Search |
|--------|--------------|----------------|
| Poizvedba | "authentication" | "How did I handle auth?" |
| Metoda | Embedding similarity | Reasoning + traversal |
| Rezultati | Podoben tekst | Relevantni kontekst |
| Časovno | Samo timestamp | Prehodi stanj |
| Kausalno | Noben | Verige napaka → popravek |
| Razlaga | Similarity score | Berljivo razmišljanje |
| Vpogledi | Nobeni | Vzorce, trendi, predlogi |

## Primerjava iz resničnega sveta: Knjižničar vs raziskovalni asistent

**Vector search** = Knjižničar:
- Vi: "Knjige o vesolju"
- Knjižničar: "Tukaj je vse z 'vesolje' v naslovu"
- Rezultat: 500 knjig, večina irelevantnih

**Agentic search** = Raziskovalni asistent:
- Vi: "Do kaj smo prišli glede misij na Mars?"
- Asistent: "Prebrali ste 'Red Mars' leta 2023, sklenili, da potrebujemo boljše zaščito pred sevanjem. 
             Povezano: Vaše zapiske iz leta 2024 o sistemih za podporo življenju SpaceX Starship.
             Predlog: Preverite novo poročilo NASA o zmanjševanju sevanja."
- Rezultat: Natančno relevantno, s kontekstom in predlogi

## Spoznanje

Vector search odgovori: *"Kaj je podobno temu tekstu?"*

Agentic search odgovori: *"Kaj moram vedeti prav zdaj?"*

Razlika je **razmišljanje**:
- Razumevanje namena poizvedbe
- Navigacija časovnega konteksta
- Prepoznavanje vzorcev
- Vzpostavljanje povezav
- Predlaganje naslednjih korakov

Tako si ljudje zapomnijo. Tako si naš AI tudi zapomni.

Več o [Orbital Memory](./ai-orbital-memory).
