---
slug: compiler-that-says-no
title: "Compiler, ki reče Ne: Kako 50 validatorjev prepreči napake, preden obstajajo"
authors: [osamah]
tags: [compiler, rust, engineering]
---

Večina compilerjev preverja sintakso. Naš preverja logiko.

Almadar compiler izvaja 50+ validacijskih pravil čez 12 modulov, preden generira eno samo vrstico kode. Ujame zataknjene modale, osirotele dogodke, nedosegljiva stanja in prekinjene kroge — napake, ki bi normalno preživele vse do produkcije.

Tukaj je kaj ujame in kako.

<!-- truncate -->

## Zakaj Validacija > Testiranje

Testiranje vam pove: "Ta specifični scenarij deluje."

Validacija vam pove: "Noben scenarij ne more pokvariti."

Testi so vzorci. Validacija je dokaz. Almadar compiler ne preverja, ali vaša aplikacija deluje *v primerih, ki ste jih testirali*. Preverja, ali vaša aplikacija *lahko sploh pokvari*.

## 12 Validacijskih Modulov

Compiler izvaja validatorje v zaporedju, vsak se osredotoča na drugo skrb:

```
Schema → Entity → Trait → Effect → RenderUI → Slot →
S-Expression → Binding → Service → CrossOrbital → Icon → ClosedCircuit
```

Prehodimo najzanimivejše.

### 1. Entity Validator

Ujame težave modela podatkov, preden postanejo runtime napake.

**Podvojena imena polj:**
```
Error: ORB_E_DUPLICATE_FIELD
  Entity 'Task' ima podvojeno ime polja 'status'.
  Vsako ime polja mora biti unikatno znotraj entity.
```

**Neveljavni cilji relacij:**
```
Error: ORB_E_INVALID_RELATION
  Polje 'assigneeId' referencira entity 'User' ampak entity
  z imenom 'User' ne obstaja v tej shemi.
  Razpoložljivi entities: Task, Project, Comment
```

**Rezervirana imena polj:**
```
Error: ORB_E_RESERVED_FIELD
  Ime polja 'id' je rezervirano in samodejno generirano.
  Odstranite to polje iz definicije entity.
```

### 2. Trait Validator

Zagotavlja, da so state machines dobro oblikovane.

**Ni začetnega stanja:**
```
Error: ORB_T_NO_INITIAL_STATE
  Trait 'TaskInteraction' nima začetnega stanja.
  Dodajte 'isInitial: true' točno enemu stanju.
```

**Nedosegljiva stanja:**
```
Error: ORB_T_UNREACHABLE_STATE
  Stanje 'Archived' v traitu 'TaskInteraction' nima prihajajočih
  prehodov. Nikoli ga ni mogoče doseči.
  Bodisi dodajte prehod v to stanje ali ga odstranite.
```

To je subtilno. Definirate stanje, ampak pozabite ustvariti prehod *v* njega. Brez validatorja stanje obstaja v vaši shemi, ampak vanj ni mogoče vstopiti — mrtva koda v vašem state machineu.

**Podvojeni prehodi:**
```
Error: ORB_T_DUPLICATE_TRANSITION
  Trait 'TaskInteraction' ima dva prehoda iz 'Browsing'
  ob dogodku 'EDIT'. State machines morajo biti deterministični.
```

### 3. Closed Circuit Validator

Dragulj krona. Zagotavlja, da vsaka interakcija uporabnika zaključi poln krog.

**Zataknjeni overlayi:**
```
Error: CIRCUIT_NO_OVERLAY_EXIT
  Stanje 'EditModal' renderira v 'modal' slot ampak nima izhodnega
  prehoda. Uporabniki se bodo zataknili v ta overlay.

  Fix: Dodajte prehod iz 'EditModal' z dogodkom 'CANCEL' ali 'CLOSE'
  ki vključuje effect: ["render-ui", "modal", null]
```

To je napaka "modal, ki se ne more zapreti". V tradicionalnih aplikacijah jo najdete, ko jo uporabnik prijavi. V Almadarju jo najdete, preden koda obstaja.

**Osiroteli dogodki:**
```
Error: CIRCUIT_ORPHAN_EVENT
  Akcija 'Delete' v stanju 'Viewing' emitira dogodek 'DELETE'
  ki nima handlerja za prehod v trenutnem stanju.

  Gumb se bo renderiral ampak klik nanj ne bo storil ničesar.
```

Definirali ste gumb z dogodkom, ampak noben prehod ne obravnava tega dogodka v trenutnem stanju. Gumb bi se renderiral, uporabnik bi kliknil nanj, in nič se ne bi zgodilo. Validator to ujame ob compile time.

**Manjkajoč main slot:**
```
Error: CIRCUIT_NO_MAIN_RENDER
  Stanje 'Browsing' nima render-ui effecta, ki cilja na 'main' slot.
  Stran bo prazna ob vstopu v to stanje.
```

Definirali ste stanje, ampak pozabili renderirati karkoli v glavni UI slot. Uporabniki bi videli prazno stran.

### 4. S-Expression Validator

Preverja, da so vaši logični izrazi dobro oblikovani.

**Neznani operatorji:**
```
Error: ORB_S_UNKNOWN_OPERATOR
  Neznan operator 'equals' v guard izrazu.
  Ali ste mislili '='?
  Razpoložljivi primerjalni operatorji: =, !=, >, >=, <, <=
```

**Napačna arnost:**
```
Error: ORB_S_WRONG_ARITY
  Operator 'and' pričakuje 2+ argumentov, dobil 1.
  Izraz: ["and", ["=", "@entity.status", "active"]]

  'and' z enim argumentom je vedno enak temu argumentu.
  Ali ste mislili dodati še en pogoj?
```

**Neskladnost tipov:**
```
Error: ORB_S_TYPE_MISMATCH
  Operator '>' pričakuje numerične argumente.
  Dobljeno: "@entity.name" (string) > 10 (number)

  Primerjate string s številom. To bo vedno
  ovrednoteno kot false.
```

### 5. Binding Validator

Zagotavlja, da vse reference na podatke kažejo na prava polja.

**Neznana korenska vezava:**
```
Error: ORB_B_UNKNOWN_ROOT
  Neznana korenska vezava '@result' v izrazu.
  Veljavni koreni: @entity, @payload, @state, @now, @config, @user
```

**Neznano polje entity:**
```
Error: ORB_B_UNKNOWN_FIELD
  Vezava '@entity.staus' referencira polje 'staus', ki ne
  obstaja na entity 'Task'.
  Ali ste mislili 'status'?
  Razpoložljiva polja: title, description, status, priority
```

Detekcija tipkarske napake s predlogi. `@entity.staus` → "Ali ste mislili `status`?"

### 6. Cross-Orbital Validator

Zagotavlja, da je komunikacija dogodkov med orbitali popolna.

**Emit brez listenerja:**
```
Error: ORB_X_ORPHAN_EMIT
  Trait 'OrderTrait' emitira 'ORDER_COMPLETED' ampak noben trait
  nima ujemajoče 'listens' deklaracije.

  Vsak emitiran dogodek mora imeti vsaj enega poslušalca.
  Bodisi dodajte poslušalca ali odstranite emisijo.
```

To preprečuje "fire and forget" dogodke — emisije, ki gredo nikamor. V mikroservisni arhitekturi bi to bilo sporočilo objavljeno na queue brez consumerja. V Almadarju compiler to ujame.

## Dvo-prepustna arhitektura

Nekatere validacije zahtevajo naprej reference. Entity A referencira Entity B, ampak B je definiran po A. Enoprepustni validator bi to zavrnil.

Almadar compiler uporablja **dvo-prepustni pristop**:

**Prehod 1: Zbiranje**
- Zberi vsa imena entity, imena trait, imena stanj, imena dogodkov
- Zgradi tabelo simbolov vsega, kar obstaja

**Prehod 2: Validacija**
- Preveri vse reference proti tabeli simbolov
- Zaženi vseh 12 validacijskih modulov
- Poročaj o napakah s kontekstom in predlogi

To pomeni, da lahko definirate orbitable v katerem koli vrstnem redu. Compiler ugotovi graf odvisnosti.

## Kakovost napak: Razlika med "Napaka" in "Pomočjo"

Primerjajte tipično napako compilerja:

```
Error: unexpected token at line 47, column 12
```

Z Almadar validacijsko napako:

```
Error: CIRCUIT_NO_OVERLAY_EXIT

  Stanje 'EditModal' renderira v 'modal' slot ampak nima izhodnega prehoda.
  Uporabniki se bodo zataknili v ta overlay.

  Lokacija: orbitals[0].traits[0].stateMachine.states[2]
  Shema: task-app.orb

  Fix: Dodajte prehod iz 'EditModal' z dogodkom 'CANCEL' ali 'CLOSE'
  ki vključuje effect: ["render-ui", "modal", null]

  Primer:
    {
      "from": "EditModal",
      "to": "Browsing",
      "event": "CANCEL",
      "effects": [["render-ui", "modal", null]]
    }
```

Vsaka napaka vključuje:
- **Kodo napake** — iskalno, dokumentabilno
- **Berljiv opis** — kaj je narobe
- **Vpliv** — zakaj je pomembno (uporabniki se bodo zataknili)
- **Lokacijo** — točno kje v shemi
- **Fix** — kako to rešiti
- **Primer** — copy-paste rešitev

## Zgrajeno v Rustu: Zakaj je to pomembno

Compiler je napisan v Rustu. To nam daje:

**Izčrpno pattern matching:** Ko dodamo nov tip effecta, Rust compiler prisili, da ga obravnavamo v vsakem validatorju. Ne moremo pozabiti primera — ne bo se prevedlo.

**Memory safety brez GC:** Validator si izposodi shemo brez kopiranja. Za 5.000-vrstično shemo to prihrani pomemben pomnilnik in čas.

**Hitrost kompilacije:** Polna validacija velike sheme traja `&lt;50ms`. Feedback dobite hitreje, kot se lahko vaš editor osveži.

**Brezstrahna sočasnost:** Validacijski moduli lahko tečejo vzporedno brez tekmovanj za podatke. Rustov tipni sistem to zagotavlja ob compile time.

## Česa ne validiramo (še)

Validator ni vseveden. Trenutno ne preverja:

- **Semantične pravilnosti guardov** — Vé, da je `[">=", "@entity.amount", 0]` sintaktično veljaven, ampak ne, ali je poslovna logika pravilna
- **Performančnih implikacij** — State machine s 1.000 stanji je veljaven, ampak potencialno počasen
- **UI estetike** — Dve tabeli, ki renderirata v isti slot, sta veljavni, ampak verjetno grdi

To so področja za prihodnje izboljšave. Ampak 50+ pravil, ki jih imamo danes, ujame veliko večino napak, ki preživijo v produkcijo v tradicionalnih aplikacijah.

## Spoznanje

Najboljša napaka je tista, ki nikoli ne obstaja.

Almadarjev compiler ne preverja samo sintakse. Preverja vzročnost (zaprte kroge), popolnost (ni osirotelih dogodkov), dosegljivost (ni mrtvih stanj), pravilnost (type-safe izrazi) in konsistenco (ujemanje cross-orbital dogodkov).

50+ pravil. 12 modulov. `&lt;50ms`.

To ni compiler. To je code reviewer, ki nikoli ne spi, nikoli ne zamudi primera in nikoli ne odobri pokvarjene kode.

Raziščite [compiler dokumentacijo](https://orb.almadar.io/docs/compiler) za več.
