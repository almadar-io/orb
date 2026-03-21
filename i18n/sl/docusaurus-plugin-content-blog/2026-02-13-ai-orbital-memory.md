---
slug: ai-orbital-memory
title: "Zakaj smo našemu AI agentu dali orbitalni spomin namesto vektorske baze podatkov"
authors: [osamah]
tags: [architecture, ai]
image: /img/blog/ai-orbital-memory.png
---

![Zakaj smo našemu AI agentu dali orbitalni spomin namesto vektorske baze podatkov](/img/blog/ai-orbital-memory.png)

Vsi gradijo RAG sisteme z vektorskimi DB. Mi smo našemu AI dali strukturiran pomnilniški sistem, ki dejansko razume kontekst.

<!-- truncate -->

## Problem RAG

Retrieval-Augmented Generation (RAG) je standardni pristop za dajanje AI agentom spomina:

1. Sprejmi uporabniško poizvedbo: *"Kako sem nazadnje obdelal avtentikacijo?"*
2. Generiraj embedding vektor
3. Poišči v vektorski bazi podatkov za podobne vektorje
4. Vstavi top-K rezultate v prompt
5. Generiraj odgovor

**Problem?** Vektorska podobnost ≠ kontekstualna relevantnost.

### Kdaj RAG odpove

**Scenarij 1: Časovni kontekst**
- Uporabnik: *"Na kaj sem delal v torek?"*
- Vektorska DB: Najde dokumente o "delu" in "torkovih sestankih"
- Realnost: Uporabnik želi njihovo specifično sejo izpred 5 dni

**Scenarij 2: Ujemanje vzorcev**
- Uporabnik: *"Pokaži mi vse sezname pogledov, ki sem jih zgradil"*
- Vektorska DB: Najde dokumente, ki vsebujejo "seznam" in "pogled"
- Realnost: Uporabnik želi entity-table patterne, uporabljene v sejah

**Scenarij 3: Kavzalno sklepanje**
- Uporabnik: *"Zakaj je moja avtentikacija spodletela?"*
- Vektorska DB: Najde dokumente o avtentikaciji
- Realnost: Uporabnik potrebuje verigo napaka → popravek → uspeh

Vektorsko iskanje najde *podobno besedilo*. Ne razume *česa dejansko sprašujete*.

## Alternativa orbitalnega spomina

Namesto vektorskih embeddingov Almadarjev AI uporablja **strukturiran orbitalni spomin**:

- **Entitete**: Uporabniki, seje, projekti, patterni
- **Relationships**: Seja pripada uporabniku, uporablja patterne
- **Časovni sled**: Kdaj se je zgodilo, v kakšnem vrstnem redu
- **Semantični kontekst**: Kakšni so bili cilji, rezultati, nauki

To ni iskanje podobnosti. To je **razumevanje strukture**.

## Prednosti

1. **Časovni pomnilnik**: *"Kaj sem delal v torek?"* → natančen odgovor
2. **Pattern razpoznavanje**: *"Pokaži mi sezname"* → vsi entity-table patterni
3. **Kavzalne verige**: *"Zakaj je spodletelo?"* → sled napake do rešitve

Vector DB išče besedilo. Orbitalni spomin razume **pomen**.
