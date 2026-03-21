---
slug: context-compaction
title: "Context Compaction: Umetnost povzemanja 3-urnega kodiranja za vaš LLM"
authors: [osamah]
tags: [architecture, ai]
image: /img/blog/context-compaction.png
---

![Context Compaction: Umetnost povzemanja 3-urnega kodiranja za vaš LLM](/img/blog/context-compaction.png)

Vaš AI par programer ima omejitev 200K žetonov. Po 3 urah ste na 150K. Kaj storite?

<!-- truncate -->

## Problem omejitve žetonov

Programirate z AI-jem. Tri ure v:
- 47 sporočil uporabnika
- 47 odgovorov asistenta
- 94 tool klicev
- 94 rezultatov toolov

**Skupaj: ~150K žetonov**

Kontekstno okno LLM: **200K žetonov**

Imate še 50K žetonov. Po tej stopnji boste dosegli limit čez eno uro.

**Možnosti:**
1. **Začni novo sejo** — Izgubi ves kontekst
2. **Odreži stare sporočila** — Izgubi potencialno pomembne podrobnosti
3. **Povzemi z LLM** — Drago in počasno
4. **Context compaction** — Pametna kompresija

## Kaj je Context Compaction?

Context compaction pametno zmanjša uporabo žetonov, hkrati pa ohranja semantični pomen:

```
Pred: 847 sporočil, ~142K žetonov
Po:   23 sporočil, ~3K žetonov
       
[Povzetek konteksta — skrčeno iz 847 sporočil]

## Izvirna zahteva
Uporabnik je prosil za generiranje orbital sheme za aplikacijo za upravljanje nalog...

## Izvedene akcije
1. Ustvarjena shema `taskly.orb` s 3 orbitali
2. Validirano — popravljenih 4 napak
3. Prevedeno v TypeScript shell
4. Uporabnik je zahteval dodajanje polja "priority"

## Trenutno stanje
- Shema je veljavna in se čisto prevede
- Delovni direktorij: /home/user/projects/taskly
```

## Cevovod za kompakcijo

Almadarjev context compaction sledi 8-koraknemu cevovodu:

### Korak 1: Oceni žetone

```typescript
function estimateTokens(messages: Message[]): number {
  // Hevristika na osnovi znakov (80% točnost)
  const totalChars = messages.reduce((sum, m) => {
    const content = typeof m.content === 'string' 
      ? m.content 
      : JSON.stringify(m.content);
    return sum + content.length;
  }, 0);
  
  return totalChars / 4; // ~4 znakov na žeton
}
```

### Korak 2: Klasificiraj sporočila

Vsa sporočila niso enaka:

| Kategorija | Primeri | Prioriteta kompakcije |
|----------|----------|---------------------|
| **System** | System prompt, skill navodila | 🔴 Nikoli ne dotikaj |
| **Anchor** | Izvirna zahteva uporabnika | 🟡 Ohrani v povzetku |
| **Tool-heavy** | Branje datotek, output validacije | 🟢 Stisni prvo |
| **Reasoning** | Analiza asistenta | 🟡 Povzemi |
| **Recent** | Zadnjih N sporočil | 🔴 Nikoli ne dotikaj |

### Korak 3: Razdeli

Razdeli na stare in nedavne:

```typescript
const keepRecent = 20; // Vedno ohrani zadnjih 20 sporočil
const recent = messages.slice(-keepRecent);
const old = messages.slice(0, -keepRecent);
```

### Korak 4: Stisni rezultate toolov

Zamenjaj velike outpute s stubi:

```typescript
// Pred: 850 vrstic kode
{
  role: 'tool',
  content: '<850 vrstic TypeScript...>'
}

// Po: Ena vrstica
{
  role: 'tool', 
  content: '[read_file: src/schema.ts — 850 vrstic]'
}
```

### Korak 5: Povzemi (Opcijsko)

Za `summarize` ali `hybrid` strategijo:

```typescript
const summaryPrompt = `
Povzemi ta pogovor za AI asistenta.
Osredotoči se na:
1. Kaj je uporabnik izvirno zahteval
2. Kakšne akcije so bile izvedene
3. Kakšno je trenutno stanje
4. Katere napake so se pojavile in kako so bile popravljene

Bodi jedrnat, a celovit.
`;

const summary = await llm.generate(summaryPrompt, oldMessages);
```

### Korak 6: Ponovno sestavi

```typescript
const compacted = [
  systemMessage,      // Izvirni system prompt
  summaryMessage,     // Generiran povzetek
  ...recentMessages,  // Zadnjih 20 sporočil nespremenjenih
];
```

### Korak 7: Emitiraj dogodek

```typescript
// Pošlji obvestilo o kompakciji v UI
sse.send({
  type: 'compaction',
  data: {
    messagesBefore: 847,
    messagesAfter: 23,
    tokensBefore: 142000,
    tokensAfter: 3000,
    strategy: 'hybrid',
    summaryLength: summary.length,
  },
});
```

### Korak 8: Shranjujej

Shrani metapodatke kompakcije s sejo:

```typescript
await sessionManager.recordCompaction(
  threadId,
  originalMessageCount,
  compactedMessageCount,
  'token_limit'
);
```

## Možnosti konfiguracije

```typescript
interface CompactionConfig {
  maxTokens: number;           // Prag sprožitve (privzeto: 150000)
  triggerThreshold: number;    // 0-1, kdaj sprožiti (privzeto: 0.75)
  keepRecentMessages: number;  // Vedno ohrani N nedavnih (privzeto: 20)
  strategy: 'truncate' | 'summarize' | 'hybrid';
  summaryModel?: string;       // Uporabi cenejši model za povzetke
}
```

### Primerjava strategij

| Strategija | Kako deluje | Najboljše za |
|----------|--------------|----------|
| **truncate** | Odvrzi najstarejša sporočila | Hitro, brez dodatnega LLM klica |
| **summarize** | LLM povzame stara sporočila | Ohranjanje konteksta |
| **hybrid** | Stisni toole, povzemi ostalo | Ravnovesje hitrosti/kakovosti |

## Primer iz resničnega sveta

**Seja: Gradnja e-trgovinske platforme**

```
Ura 1:
- Ustvarjeni Order, Product, User entities
- Postavljeni CRUD traits
- Uspešno prevedeno
[Sporočila: 15, Žetoni: ~8K]

Ura 2:
- Dodan shopping cart orbital
- Implementiran checkout flow
- Popravljene napake validacije
[Sporočila: 35, Žetoni: ~25K]

Ura 3:
- Dodana plačilna integracija
- Testirano end-to-end
- Refaktoring za performanco
[Sporočila: 67, Žetoni: ~62K]

Ura 4:
- Dodano upravljanje inventarja
- Ugotovljeno: Pojdi žetonov zmanjkuje!
```

**Sprožena kompakcija:**

```
[Povzetek konteksta — skrčeno iz 67 sporočil]

## Izvirna zahteva
Zgradi e-trgovinsko platformo s katalogom izdelkov, 
košarico in blagajno.

## Ustvarjeni Entities
- Product: ime, cena, inventar
- User: email, ime, naslovi
- Order: artikli, skupaj, status
- Cart: artikli, relacija uporabnika

## Ključne implementirane funkcije
1. Brskanje izdelkov (entity-table vzorec)
2. Košarica (na osnovi seje)
3. Checkout wizard (3-koraki potek)
4. Plačilna integracija (Stripe)
5. Upravljanje inventarja

## Trenutno stanje
- 5 definiranih orbitalov
- Vsi testi uspešni
- Pripravljeno za deployment

## Nedavni fokus
Dodajanje upravljanja inventarja in opozoril za nizko zalogo.
```

**Rezultat:** 67 sporočil → 1 povzetek + 20 nedavnih = 21 sporočil

## Primer kode: Uporaba Compaction

```typescript
// Internal: Almadar's session management system

const sessionManager = new SessionManager({
  mode: 'firestore',
  firestoreDb: db,
  memoryManager,
  compactionConfig: {
    maxTokens: 150000,
    triggerThreshold: 0.8,
    keepRecentMessages: 10,
    strategy: 'hybrid',
  },
});

// Preveri, če je potrebna kompakcija
const shouldCompact = sessionManager.shouldCompactMessages(messages);

if (shouldCompact) {
  console.log('Stiskanje konteksta...');
  
  // V vaši agent zanki, sproži kompakcijo
  // pred pošiljanjem v LLM
  const compacted = await compactMessages(
    messages,
    config
  );
  
  // Zabeleži za analitiko
  await sessionManager.recordCompaction(
    threadId,
    messages.length,
    compacted.length,
    'token_limit'
  );
}

// Pridobi zgodovino kompakcij
const history = sessionManager.getCompactionHistory(threadId);
console.log(`Seja skrčena ${history.length} krat`);
// Seja skrčena 3 krat
```

## Primerjava iz resničnega sveta: Izvršni povzetek

Context compaction je kot izvršni povzetek:

**Polno poročilo (500 strani):**
- Vsak email
- Vsak zapisnik sestanka  
- Vsaka preglednica
- Vsak osnutek

**Izvršni povzetek (2 strani):**
- Kaj so nas prosili narediti
- Kaj smo naredili
- Trenutni status
- Naslednji koraki

CEO ne prebere 500 strani. Prebere povzetek in zadnje posodobitve.

Z LLM-ji je enako.

## Kompromisi

### Kaj ohranimo
- ✅ System navodila (kritično)
- ✅ Izvirna zahteva uporabnika (kontekst)
- ✅ Nedavna sporočila (trenutno stanje)
- ✅ Vzorci napak/uspehov (učenje)

### Kaj izgubimo
- ❌ Točen tool output (zamenjan s stubom)
- ❌ Vmesno razmišljanje (povzeto)
- ❌ Točna vsebina datotek (lahko ponovno preberemo)

### Povračila

1. **Ponovno beri na zahtevo:** Če LLM potrebuje vsebino datoteke, lahko ponovno prebere
2. **Ohrani ključne odločitve:** Pomembne izbire ohranjene v povzetku
3. **Sledi referencam:** Izvirna sporočila povezana za debugging

## Spoznanje

Kontekstna okna so končna. Seje so lahko dolge.

Context compaction premošča razkorak:
- **Pametna kompresija:** Ohrani pomen, zmanjšaj žetone
- **Konfigurabilne strategije:** Kompromisi hitrosti vs. kakovosti
- **Transparentno:** Uporabnik vidi, kaj je skrčeno
- **Obnovljivo:** Lahko ponovno pridobi skrčene podatke

Ker najboljši AI asistent ni tisti z neskončnim spominom — je tisti, ki ve, si je zapomniti.

Več o [Session Management](./three-execution-models).
