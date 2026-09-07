# Orb

> **Fizika programske opreme**: Deklarirajte svojo aplikacijo, prevedite v produkcijo

Dobrodosli v dokumentaciji programskega jezika Orb. Orb je deklarativni pristop h gradnji celosteznih aplikacij prek avtomatov stanj, entitet in lastnosti.

## Hitra navigacija

### Zacetek

- [Uvod](getting-started/introduction.md) - Kaj je Orb in zakaj bi ga morali uporabiti?
- [Namestite CLI](downloads/cli.md) - Pridobite CLI Orb na svoj sistem
- [Zgradite upravljalnik nalog](tutorials/beginner/task-manager.md) - Zgradite upravljalnik nalog v 10 minutah
- [Kljucni koncepti: Entitete](core-concepts/entities.md) - Entitete, lastnosti in avtomati stanj

### Referenca jezika

- [Entitete](core-concepts/entities.md) - Podatkovne strukture in trajnost
- [Lastnosti](core-concepts/traits.md) - Obnasanje kot avtomati stanj
- [S-izrazi](core-concepts/standard-library.md) - Sintaksa pogojev in ucinkov
- [Ucinki in standardna knjiznica](core-concepts/standard-library.md) - Strezniski in odjemalski ucinki
- [Vzorci](core-concepts/patterns.md) - Knjiznica vzorcev UI

### Vodici

#### Tehnicni

- [Pogoji in poslovna pravila](tutorials/intermediate/guards.md) - S-izrazni pogoji na prehodih
- [Med-orbitalni dogodki](tutorials/intermediate/cross-orbital.md) - Oddajanja, poslusanja in pogodbe obremenitev

#### Poslovni

- [Zakaj Orb?](/enterprise) - Primeri uporabe v podjetjih in donosnost nalozbe
- [Studije primerov](/enterprise) - Studije primerov inspekcije in trenerja

### Vadnice

#### Za zacetnike

- [Anatomija celotne Orbital enote](tutorials/beginner/complete-orbital.md) - Entiteta, lastnosti, avtomat stanj in strani
- [Zgradite upravljalnik nalog](tutorials/beginner/task-manager.md) - Celoten CRUD z zivljenjskimi stanji

#### Za srednjo raven

- [Vzorci UI in render-ui](tutorials/intermediate/ui-patterns.md) - Vsi tipi vzorcev, rezine in povezovanje akcij
- [Pogoji in poslovna pravila](tutorials/intermediate/guards.md) - S-izrazni pogoji na prehodih
- [Med-orbitalna komunikacija](tutorials/intermediate/cross-orbital.md) - Oddajanja, poslusanja in pogodbe obremenitev

#### Za napredne

- [Gradnja celotne vec-orbitalne aplikacije](tutorials/advanced/full-app.md) - Tri povezane Orbital enote iz pravega programa
- [Generiranje programov z LLM](tutorials/advanced/ai-generation.md) - Pozivanje, preverjanje in popravljanje pogostih napak

### Referenca

- [Referenca CLI](downloads/cli.md)
- [Standardna knjiznica](../reference/standard-library)
- [Knjiznica obnasanj](../reference/behaviors)
- [Referenca operatorjev](/docs/reference/operators/)
- [Kljucni koncepti: Vzorci](core-concepts/patterns.md)

---

## Filozofija Orb

### Vzorec zaprtega kroga

Vsaka uporabniska interakcija v Orb sledi zagarantiranemu toku:

```
Dogodek (Uporabnisko dejanje)
    ↓
Ovrednotenje pogoja (Preverjanje dovoljenj)
    ↓
Prehod stanja (Logika obnasanja)
    ↓
Izvedba ucinkov
    ↓
Odziv na UI
```

Ta vzorec zagotavlja:
- **Varnost po zasnovi** - pogoji uveljavljajo dovoljenja na ravni prehodov
- **Predvidljivo obnasanje** - avtomati stanj lahko obstajajo samo v veljavnih stanjih
- **Preverljivost** - vsaka pot je nastevna in preverljiva

### Trije stebri

1. **Entitete** - kaj vasa aplikacija upravlja (podatki)
2. **Lastnosti** - kako se vasa aplikacija obnasa (avtomati stanj)
3. **Strani** - kje se vasa aplikacija pojavi (poti)

### Zakaj "Orb"?

Tako kot planeti v orbiti okoli zvezde, komponente aplikacij v Orb sledijo predvidljivim, z zakoni urejenim potem. Fizikalni zakoni zagotavljajo stabilnost; avtomati stanj Orb zagotavljajo doslednost aplikacije.

---

## Skupnost

- [Discord](https://discord.gg/YtWJCpnk) - Klepet in podpora v realnem casu
- [GitHub Discussions](https://github.com/almadar-io/orb/discussions) - Tehnicne razprave
- [LinkedIn](https://www.linkedin.com/company/almadar-io) - Novosti in obvestila

---

*Zgrajeno s strastjo od [Almadar](https://almadar.io)*
