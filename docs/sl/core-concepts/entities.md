# Entitete

> Kako entitete delujejo v arhitekturi Orb, od definicije v programu do izvajanja v izvajalnem okolju.

---

## Pregled

V jeziku Orb je **Entiteta** podatkovni model v jedru vsake Orbital enote. Temeljni sestav je:

```
Orbital enota = Entiteta + Lastnosti + Strani
```

Entitete definirajo obliko podatkov, medtem ko Lastnosti definirajo obnasanje (avtomati stanj), ki delujejo na teh podatkih. Vezava med njimi je eksplicitna in tipsko varna.



## Definicija entitete

Entiteta je definirana v `.orb` programu z naslednjo strukturo:

```json
{
  "name": "Task",
  "collection": "tasks",
  "fields": [
    { "name": "id", "type": "string", "required": true, "primaryKey": true },
    { "name": "title", "type": "string", "required": true },
    { "name": "status", "type": "enum", "values": ["pending", "active", "done"] },
    { "name": "assigneeId", "type": "relation", "relation": { "entity": "User", "cardinality": "one" } },
    { "name": "dueDate", "type": "date" },
    { "name": "tags", "type": "array", "items": { "type": "string" } }
  ]
}
```

### Lastnosti entitete

| Lastnost | Obvezno | Opis |
|----------|---------|------|
| `name` | Da | Identifikator v PascalCase (npr. `Task`, `User`, `GameState`) |
| `collection` | Za trajne | Ime zbirke v podatkovni bazi (npr. `tasks`, `users`) |
| `persistence` | Ne | Nacin shranjevanja: `persistent`, `runtime` ali `singleton` |
| `fields` | Da | Seznam definicij polj |

---

## Tipi polj

Orb podpira naslednje tipe polj:

| Tip | Opis | Primer | TypeScript | Shranjevanje |
|-----|------|--------|------------|--------------|
| `string` | Besedilni podatki | `"hello"` | `string` | String |
| `number` | Numericne vrednosti (float) | `42.5` | `number` | Number |
| `boolean` | Res/napacno | `true` | `boolean` | Boolean |
| `date` | Datum brez casa | `"2026-03-01"` | `Date` | ISO niz |
| `datetime` | Datum s casom | `"2026-03-01T10:30:00Z"` | `Date` | ISO niz |
| `timestamp` | Milisekunde od epoch | `1709312400000` | `number` | Number |
| `array` | Zbirka vrednosti | `["a", "b"]` | `T[]` | Array |
| `object` | Strukturirani podatki | `{ key: "value" }` | `Record<string, unknown>` | JSON |
| `enum` | Poimenovane konstante | `"pending"` | Union tip | String |
| `relation` | Referenca na entiteto | `"user_123"` | `string` (FK) | String |

### Lastnosti polj

```json
{
  "name": "status",
  "type": "enum",
  "required": true,
  "values": ["pending", "active", "done"],
  "default": ["quote", "pending"]
}
```

| Lastnost | Opis |
|----------|------|
| `name` | Identifikator polja v camelCase |
| `type` | Eden od podprtih tipov polj |
| `required` | Ali mora polje imeti vrednost |
| `primaryKey` | Oznaci polje kot primarni kljuc |
| `unique` | Uveljavi omejitev edinstvenosti |
| `default` | Privzeta vrednost (kot S-izraz) |
| `values` | Za tip `enum` - seznam dovoljenih vrednosti |
| `items` | Za tip `array` - definicija tipa elementa |
| `properties` | Za tip `object` - definicije gnezdenih polj |
| `relation` | Za tip `relation` - ciljna entiteta in kardinalnost |

### Relacijska polja

Relacije povezujejo entitete med seboj:

```json
{
  "name": "assigneeId",
  "type": "relation",
  "relation": {
    "entity": "User",
    "cardinality": "one"
  },
  "required": false
}
```

**Moznosti kardinalnosti:**
- `one` - Posamicna referenca (tuji kljuc)
- `many` - Vec referenc (seznam ID-jev)

---

## Tipi trajnosti entitet

Entitete imajo tri nacine trajnosti, ki bistveno spreminjajo njihovo shranjevanje in deljenje:

### 1. Trajne entitete (Persistent)

**Shranjevanje:** Podatkovna baza (Firestore, PostgreSQL itd.)
**Zivljenjska doba:** Prezivi ponovne zagone, deljena med sejami
**Zbirka:** Obvezna - eksplicitno poimenovanje
**Privzeto:** Ce `persistence` ni dolocen, je privzeto `persistent`

```json
{
  "name": "Task",
  "persistence": "persistent",
  "collection": "tasks",
  "fields": [...]
}
```

**Znacilnosti:**
- Vse Orbital enote, ki se sklicujejo na isto ime entitete, si delijo isto zbirko
- Operacije CRUD gredo skozi adapter za trajnost
- Primerno za domenski objekte (Task, User, Order, Product)

### 2. Izvajalnega okolja (Runtime)

**Shranjevanje:** Samo pomnilnik (JavaScript/Python objekti)
**Zivljenjska doba:** Izgubljeno ob ponovnem zagonu/koncu seje
**Zbirka:** Ni

```json
{
  "name": "Enemy",
  "persistence": "runtime",
  "fields": [...]
}
```

**Znacilnosti:**
- **Izolirano po Orbital enotah** - vsaka Orbital enota dobi svoje primerke
- Brez operacij s podatkovno bazo
- Primerno za zacasna stanja (Enemy, Projectile, Particle)
- Pogosto v igrah, kjer se entitete pogosto ustvarjajo/unicujejo

### 3. Edinstvene entitete (Singleton)

**Shranjevanje:** Pomnilnik (en primerek)
**Zivljenjska doba:** En primerek na sejo
**Zbirka:** Ni (en zapis)

```json
{
  "name": "Player",
  "persistence": "singleton",
  "fields": [...]
}
```

**Znacilnosti:**
- En primerek, deljen med vsemi Orbital enotami
- Dostopen prek vezave `@EntityName` (npr. `@Player.health`)
- Primerno za globalna stanja (Player, GameConfig, Settings)

### Primerjava trajnosti

| Vidik | Persistent | Runtime | Singleton |
|-------|------------|---------|-----------|
| Shranjevanje | Podatkovna baza | Pomnilnik | Pomnilnik |
| Zivljenjska doba | Trajno | Seja | Seja |
| Deljenje | Deljeno po imenu | Izolirano po Orbital enoti | En primerek |
| Zbirka | Obvezna | Ni | Ni |
| Uporaba | Domenski objekti | Igralne entitete | Globalna konfiguracija |

---

## Vezave entitet v S-izrazih


### Osnovne vezave

| Vezava | Opis | Primer |
|--------|------|--------|
| `@entity` | Trenutni primerek entitete | `@entity.status`, `@entity.id` |
| `@payload` | Podatki obremenitve dogodka | `@payload.newStatus`, `@payload.amount` |
| `@state` | Ime trenutnega stanja lastnosti | `@state` vrne `"active"` |
| `@now` | Trenutni casovni zig (ms) | `@now` vrne `1709312400000` |
| `@user` | Podatki overjene osebe | `@user.id`, `@user.email` |
| `@EntityName` | Edinstvena entiteta | `@Player.health`, `@GameConfig.level` |

### Uporaba v pogojih

Pogoji uporabljajo vezave za preverjanje pogojev pred prehodi:

```json
{
  "from": "active",
  "to": "completed",
  "event": "COMPLETE",
  "guards": [
    [">=", "@entity.progress", 100],
    ["=", "@entity.assigneeId", "@user.id"]
  ]
}
```

### Uporaba v ucinkih

Ucinki uporabljajo vezave za branje in spreminjanje podatkov:

```json
{
  "effects": [
    ["set", "@entity.id", "status", "@payload.newStatus"],
    ["set", "@entity.id", "updatedAt", "@now"],
    ["increment", "@entity.id", "completionCount", 1]
  ]
}
```

### Navigacija po poteh

Vezave podpirajo pikovno notacijo za gnezdeni dostop:

```
@entity.user.name          → entity.user.name
@payload.metadata.tags[0]  → payload.metadata.tags[0]
@Player.inventory.slots    → Player.inventory.slots
```

### Postopek razresevanja vezav

1. **Razcleni** - Izvleci predpono `@` in korensko ime
2. **Poisce** - Preveri lokalne spremenljivke (iz `let`), nato osnovne vezave
3. **Navigira** - Sledi pikovni poti skozi strukturo objekta
4. **Vrne** - Vrednost ali `undefined`, ce pot ne uspe

---

## Vezava Lastnost-Entiteta (linkedEntity)

Lastnosti so avtomati stanj, ki delujejo na entitetah. Vezava med lastnostjo in njeno entiteto je eksplicitna.

### Primarna entiteta

Vsaka Orbital enota ima **primarno entiteto** - entiteto, definirano v njeni lastnosti `entity`:

```json
{
  "name": "TaskManagement",
  "entity": {
    "name": "Task",
    "collection": "tasks",
    "fields": [...]
  },
  "traits": [...]
}
```

Lastnosti v tej Orbital enoti samodejno dostopajo do `Task` prek `@entity`.

### Lastnost linkedEntity

Ko se sklicujete na lastnost, lahko dolocite, na kateri entiteti naj deluje:

```json
{
  "traits": [
    {
      "ref": "StatusManagement",
      "linkedEntity": "Task"
    },
    {
      "ref": "HealthManagement",
      "linkedEntity": "Player"
    }
  ]
}
```

**Zakaj linkedEntity?**

1. **Ponovno uporabne lastnosti** - Splosna lastnost `StatusManagement` lahko deluje s katero koli entiteto, ki ima polje `status`
2. **Med-entitetne operacije** - Lastnost lahko deluje na drugi entiteti kot je primarna entiteta Orbital enote
3. **Eksplicitna vezava** - Naredi odvisnost od entitete jasno in preverljivo po tipih

### Kako deluje

Ko se lastnost instancira:

```typescript
const linkedEntity = traitDef.linkedEntity || orbitalEntityName;
this.traitEntityMap.set(trait.name, linkedEntity);
```

1. Ce je `linkedEntity` dolocen, ga uporabi
2. Sicer uporabi primarno entiteto Orbital enote
3. Shrani preslikavo za razresevanje v izvajalnem okolju

### Primer: Orbital enota z vec entitetami

```json
{
  "name": "GameLevel",
  "entity": {
    "name": "Level",
    "persistence": "runtime",
    "fields": [...]
  },
  "traits": [
    { "ref": "LevelProgression", "linkedEntity": "Level" },
    { "ref": "PlayerHealth", "linkedEntity": "Player" },
    { "ref": "ScoreTracking", "linkedEntity": "GameState" }
  ]
}
```

Vsaka lastnost deluje na svoji doloceni entiteti, a so vse del iste Orbital enote.

---

## Upravljanje v izvajalnem okolju

Izvajalno okolje upravlja entitete prek naslednjih mehanizmov:

### Tok obdelave dogodkov

1. **Prejme dogodek** - `{ event: "UPDATE", payload: {...}, entityId: "task_123" }`
2. **Razresi entiteto** - Nalozi podatke entitete iz trajnega ali zacasnega pomnilnika
3. **Sestavi kontekst** - Ustvari kontekst za ovrednotenje z vezavami
4. **Preveri pogoje** - Ovrednoti pogojne izraze
5. **Izvede ucinke** - Zazene ucinke spremembe stanja
6. **Shrani spremembe** - Shrani spremenjene podatke entitete
7. **Vrne odgovor** - Vkljuci posodobljene podatke in odjemalske ucinke

### Vmesnik adapterja za trajnost

```typescript
interface PersistenceAdapter {
  create(entityType: string, data: Record<string, unknown>): Promise<{ id: string }>;
  update(entityType: string, id: string, data: Record<string, unknown>): Promise<void>;
  delete(entityType: string, id: string): Promise<void>;
  getById(entityType: string, id: string): Promise<Record<string, unknown> | null>;
  list(entityType: string): Promise<Record<string, unknown>[]>;
}
```

---

## Testni nacin in pravi nacin

Izvajalno okolje podpira dva nacina za trajnost entitet:

### Testni nacin (razvoj)

**Konfiguracija:**
```typescript
const runtime = new OrbitalServerRuntime({
  mode: 'mock',
  mockSeed: 12345  // Neobvezno: deterministicni podatki
});
```

**Znacilnosti:**
- Uporablja MockPersistenceAdapter
- Generira realisticne lazne podatke
- Shranjevanje v pomnilniku (brez podatkovne baze)
- Generiranje glede na tip polja (e-posta izgledajo kot e-posta, datumi so veljavni datumi)
- Deterministicno s semenom za ponovljivo testiranje
- Samodejno poseje konfigurirano stevilo zapisov na entiteto

**Generiranje glede na tip polja:**

| Tip polja | Generirani podatki |
|-----------|--------------------|
| `string` | Besede Lorem |
| `string` (name: "email") | E-postni naslov |
| `string` (name: "name") | Polno ime |
| `number` | Nakljucno celo stevilo |
| `boolean` | Nakljucna logicna vrednost |
| `date` | Nedavni datum |
| `enum` | Nakljucna vrednost iz seznama `values` |

### Pravi nacin (produkcija)

**Konfiguracija:**
```typescript
const runtime = new OrbitalServerRuntime({
  mode: 'real',
  persistence: new FirestorePersistenceAdapter(db)
});
```

**Znacilnosti:**
- Uporablja prilagojeno implementacijo PersistenceAdapter
- Prave operacije s podatkovno bazo (Firestore, PostgreSQL itd.)
- Asinhrone operacije CRUD
- Pripravljeno za produkcijo

### Primerjava nacinov

| Vidik | Testni nacin | Pravi nacin |
|-------|-------------|-------------|
| Trajnost | V pomnilniku | Podatkovna baza |
| Vir podatkov | Generirano | Pravi uporabniski podatki |
| Determinizem | Z semenom | Ni |
| Uporaba | Razvoj, testiranje | Produkcija |
| Nastavitev | Brez konfiguracije | Potreben adapter |

---

## Deljenje in izolacija entitet

Kako se entitete delijo med Orbital enotami, je odvisno od tipa trajnosti:

### Trajne entitete (deljene)

Vse Orbital enote, ki uporabljajo isto ime entitete, si delijo isto zbirko:

```
Orbital A (entity: Task) ──┐
                           ├──► Zbirka: "tasks"
Orbital B (entity: Task) ──┘
```

Spremembe v Orbital A so vidne Orbital B.

### Entitete izvajalnega okolja (izolirane)

Vsaka Orbital enota dobi svoje primerke:

```
Orbital A (entity: Enemy) ──► Pomnilnik: "OrbitalA_enemies"
Orbital B (entity: Enemy) ──► Pomnilnik: "OrbitalB_enemies"
```

Sovrazniki Orbital A so popolnoma loceni od sovraznikov Orbital B.

### Edinstvene entitete (en primerek)

En primerek, deljen med vsemi:

```
Orbital A ──┐
Orbital B ──┼──► En primerek Player
Orbital C ──┘
```

Vse Orbital enote vidijo in spreminjajo iste podatke `Player`.

---

## Povzetek

Sistem entitet v Orb zagotavlja:

1. **Tipizirana polja** - Mocna tipizacija z string, number, boolean, date, enum, relation, array, object
2. **Nacini trajnosti** - Trajno (podatkovna baza), izvajalno okolje (pomnilnik), edinstveno (globalno)
3. **Sistem vezav** - `@entity`, `@payload`, `@state`, `@now`, `@user`, `@Singleton` za dostop v S-izrazih
4. **Vezava lastnosti** - Eksplicitni `linkedEntity` povezuje lastnosti z virom podatkov
5. **Preverjanje prevajalnika** - Preverjanje programa zagotavlja pravilnost
6. **Prilagodljivo izvajalno okolje** - Testni nacin za razvoj, pravi nacin za produkcijo
7. **Nadzor deljenja** - Trajno deli, izvajalno okolje izolira, edinstveno je globalno

Entiteta je temelj Orbital enote - lastnosti delujejo na njej, strani jo prikazujejo, izvajalno okolje pa upravlja njen zivljenjski cikel.

---

*Dokument ustvarjen: 2026-02-02*
*Na podlagi analize kodne baze Orb*
