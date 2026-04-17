# Standardna knjiznica

> 93 ponovno uporabnih obnasanj, organiziranih kot atomi, molekule in organizmi.

---

## Pregled

Standardna knjiznica zagotavlja **93 ponovno uporabnih obnasanj** za aplikacije Orb, organiziranih v treh nivojih:

| Nivo | Stevilo | Vloga | Primeri |
|------|---------|-------|---------|
| **Atomi** | 50 | Samostojni, nereducibilni avtomati stanj | std-browse, std-modal, std-search, std-filter, std-timer |
| **Molekule** | 18 | Sestavijo atome prek skupnega vodila dogodkov | std-list, std-cart, std-detail, std-messaging |
| **Organizmi** | 25 | Sestavijo molekule v celotne aplikacije | std-ecommerce, std-crm, std-lms, std-helpdesk |

Vsako obnasanje je cista funkcija, ki vrne celotno `OrbitalDefinition` (entiteta + lastnosti + strani). Poklicete jo s parametri (ime entitete, polja, pot strani) in dobite strukturo `.orb`, pripravljeno za prevajanje.

```typescript
import { stdList } from '@almadar/std/behaviors/functions';

const orbital = stdList({
  entityName: 'Product',
  fields: [
    { name: 'title', type: 'string', required: true },
    { name: 'price', type: 'number', required: true },
  ],
  pagePath: '/products',
  pageTitle: 'Products',
});
// Vrne: entiteta + 4 lastnosti (browse, create, edit, view) + 1 stran
```

---

## Model sestavljanja

### Atomi: gradniki

Atomi so nereducibilni. Vsak je ena lastnost z enim avtomatom stanj. Med seboj se ne poznajo.

```
std-browse: Browsing ──INIT──► Browsing (fetch + render list)
std-modal:  Closed ──OPEN──► Open ──CLOSE──► Closed
std-search: Idle ──SEARCH──► Searching ──RESULTS──► Idle
std-filter: Idle ──FILTER──► Filtered ──CLEAR──► Idle
```

### Molekule: sestavljeni atomi

Molekule kombinirajo atome z uporabo `extractTrait` (izvlecenje lastnosti) in `wire` (povezovanje emit/listen dogodkov med lastnostmi). Molekula NI novo obnasanje. So atomi, povezani skupaj.

```
std-list = std-browse + std-modal(create) + std-modal(edit) + std-modal(view)
  └─ browse oddaja SELECT ──► view poslusa
  └─ create oddaja SAVED ──► browse poslusa (osvezitev)
  └─ edit oddaja SAVED ──► browse poslusa (osvezitev)
```

```typescript
import { stdBrowse, stdModal } from '@almadar/std/behaviors/functions';
import { connect, compose } from '@almadar/core/builders';

// std-list je priblizno ta sestava:
const browseTrait = extractTrait(stdBrowse({ entityName: 'Product', ... }));
const createTrait = extractTrait(stdModal({ mode: 'create', ... }));
const editTrait = extractTrait(stdModal({ mode: 'edit', ... }));
const viewTrait = extractTrait(stdModal({ mode: 'view', ... }));

// Povezi dogodke med lastnostmi
wire(createTrait, 'PRODUCT_CREATED', browseTrait, 'INIT');
wire(editTrait, 'PRODUCT_UPDATED', browseTrait, 'INIT');

// Sestavi v eno Orbital enoto
const orbital = compose({
  entityName: 'Product',
  traits: [browseTrait, createTrait, editTrait, viewTrait],
  pages: [{ path: '/products', traits: ['ProductBrowse', 'ProductCreate', 'ProductEdit', 'ProductView'] }],
});
```

### Organizmi: celotne aplikacije

Organizmi sestavijo molekule v vecstranske aplikacije z med-entitetnim povezovanjem.

```
std-ecommerce = std-list(Product) + std-cart(CartItem) + std-wizard(Checkout)
  └─ Product browse oddaja ADD_TO_CART ──► Cart poslusa
  └─ Cart oddaja CHECKOUT ──► Checkout poslusa
  └─ Checkout oddaja ORDER_PLACED ──► Cart poslusa (pocisti)
```

---

## Katalog obnasanj

### Atomi (50)

#### Interakcija z UI
| Obnasanje | Opis |
|-----------|------|
| `std-browse` | Seznam entitet s fetch, upodabljanje kot data-grid ali entity-cards |
| `std-modal` | Odpri/zapri prekrivanje za ustvarjanje, urejanje ali ogled |
| `std-drawer` | Drsni panel z roba zaslona |
| `std-tabs` | Preklapljanje zavihkov s paneli vsebine |
| `std-wizard` | Veckoracni obrazec z navigacijo naprej/nazaj |
| `std-confirmation` | Da/ne dialog pred destruktivnimi dejanji |
| `std-display` | Podrobnostni pogled entitete samo za branje |
| `std-input` | Vnos obrazca s preverjanjem |
| `std-upload` | Nalaganje datotek z napredkom |
| `std-gallery` | Galerija slik s svetlobnim oknom |
| `std-flip-card` | Kartica z animacijo obracanja spredaj/zadaj |
| `std-rating` | Vnos ocene z zvezdami ali stevilkami |
| `std-text-effects` | Animirano besedilo (pisalni stroj, bledenje itd.) |
| `std-theme` | Preklapljanje tem (svetla/temna/prilagojena) |

#### Upravljanje podatkov
| Obnasanje | Opis |
|-----------|------|
| `std-search` | Vnos iskanja z zakasnjeno poizvedbo + filtrirani rezultati |
| `std-filter` | Kontrolniki filtrov, ki zozijo nabor podatkov |
| `std-sort` | Kontrolniki razvrscanja za stolpce |
| `std-pagination` | Navigacija po straneh za velike nabore podatkov |
| `std-selection` | Veckratna izbira s potrditvenimi polji |
| `std-undo` | Sklad razveljavi/ponovi za reverzibilna dejanja |
| `std-calendar` | Izbirnik datumov / pogled koledarja |

#### Asinhrono + stanje
| Obnasanje | Opis |
|-----------|------|
| `std-async` | Avtomat stanj nalaganje/uspeh/napaka za asinhrone operacije |
| `std-loading` | Vrtalka nalaganja s casom izteka |
| `std-timer` | Odstevalnik ali stoperica |
| `std-notification` | Obvestila toast s samodejnim zapiranjem |
| `std-cache-aside` | Vzorec cache-aside (preveri predpomnilnik, pridobi ce ni zadetka) |
| `std-circuit-breaker` | Odklopnik tokokroga za neuspesne zunanje klice |
| `std-rate-limiter` | Omejevalnik hitrosti za API klice |

#### Jedro igre
| Obnasanje | Opis |
|-----------|------|
| `std-combat` | Sistem boja na poteze ali v realnem casu |
| `std-movement` | Premikanje na mrezi ali prosto premikanje na zemljevidu |
| `std-collision` | Zaznavanje trkov med igralnimi objekti |
| `std-physics2d` | 2D fizikalna simulacija (gravitacija, hitrost) |
| `std-quest` | Sledenje nalog/misij s cilji |
| `std-overworld` | Svetovni zemljevid z izbiro lokacije |
| `std-gameflow` | Avtomat stanj igre (meni, igranje, pavza, konec igre) |
| `std-sprite` | Animacija duhcev s sekvencami okvirjev |
| `std-score` | Sledenje rezultatu z mnozevalniki |

#### UI igre
| Obnasanje | Opis |
|-----------|------|
| `std-game-hud` | Prikazovalnik na zaslonu (zdravje, mana, mini zemljevid) |
| `std-score-board` | Lestvica / najboljsi rezultati |
| `std-game-menu` | Glavni meni, nastavitve, zasluge |
| `std-game-over-screen` | Konec igre s ponovnim poskusom/izhodom |
| `std-dialogue-box` | Dialog z NPC-ji z izbirami |
| `std-inventory-panel` | Mreza inventarja s potegni in spusti |
| `std-combat-log` | Drseci dnevnik bojnih dogodkov |
| `std-game-audio` | Upravljanje glasbe in zvocnih ucinkov |

#### Platno igre
| Obnasanje | Opis |
|-----------|------|
| `std-game-canvas2d` | Zanka za upodabljanje na 2D platnu |
| `std-game-canvas3d` | 3D platno z integracijo Three.js |
| `std-isometric-canvas` | Izometricno platno igre na plosicah |
| `std-platformer-canvas` | Platno za stransko drseco plosincarsko igro |
| `std-simulation-canvas` | Platno za fizikalno/delcno simulacijo |

### Molekule (18)

| Obnasanje | Sestavljeno iz | Opis |
|-----------|----------------|------|
| `std-list` | browse + modal(create/edit/view) | Celoten CRUD seznam z modalnimi okni za ustvarjanje, urejanje, ogled |
| `std-detail` | display + modal(edit) | Podrobnostni pogled z vgrajenim urejanjem |
| `std-cart` | browse + selection + confirmation | Nakupovalni voz z dodajanjem/odstranjevanjem/zakluckom nakupa |
| `std-inventory` | browse + selection + modal | Upravljanje zalog s sledenjem |
| `std-messaging` | browse + input + async | Seznam sporocil v realnem casu s posiljanjem |
| `std-geospatial` | browse + modal + map | Lokacijski podatki z oznakami na zemljevidu |
| `std-form-advanced` | wizard + input + validation | Vecrazdelcni obrazec s pogojnimi polji |
| `std-quiz` | wizard + score + timer | Caskovno omejen kviz s tockovanjem |
| `std-turn-based-battle` | combat + score + game-hud | Sistem boja na poteze |
| `std-platformer-game` | movement + collision + physics2d | Mehanika stranske drsece plosincarke |
| `std-puzzle-game` | selection + score + timer | Igra ugank s stetjem potez |
| `std-builder-game` | selection + inventory + canvas | Mehanika igre gradnje/obrtnistva |
| `std-classifier-game` | selection + score + timer | Igra razvrscanja/klasifikacije |
| `std-sequencer-game` | timer + score + input | Igra pomnjenja zaporedij |
| `std-debugger-game` | browse + selection + score | Igra iskanja napak |
| `std-negotiator-game` | dialogue + score + timer | Igra pogajanj/dialogov |
| `std-simulator-game` | simulation-canvas + timer + score | Igra fizikalne simulacije |
| `std-event-handler-game` | timer + score + input | Reakcijska igra vodena z dogodki |

### Organizmi (25)

| Obnasanje | Domena | Opis |
|-----------|--------|------|
| `std-ecommerce` | Trgovina | Katalog izdelkov + voz + zaklucek nakupa |
| `std-crm` | Prodaja | Upravljanje kontaktov/poslov/cevovodov |
| `std-lms` | Izobrazevanje | Sledenje tecajev/lekcij/napredka |
| `std-cms` | Vsebina | Upravljanje clankov/strani/medijev |
| `std-helpdesk` | Podpora | Triaza zahtevkov, preiskava, resitev |
| `std-hr-portal` | Kadrovska | Upravljanje zaposlenih/dopustov/ocen |
| `std-social-feed` | Druzabna | Vir objav/komentarjev/vseckov |
| `std-project-manager` | Vodenje projektov | Upravljanje nalog/sprintov/tabel |
| `std-booking-system` | Gostinstvo | Upravljanje sob/terminov/rezervacij |
| `std-finance-tracker` | Finance | Sledenje transakcij/proracunov/porocil |
| `std-healthcare` | Zdravstvo | Upravljanje pacientov/terminov/kartotekov |
| `std-realtime-chat` | Komunikacija | Klepetalnice z sporocili v realnem casu |
| `std-trading-dashboard` | Finance | Trzni podatki + izvajanje narocil |
| `std-iot-dashboard` | IoT | Nadzor naprav + opozorila |
| `std-devops-dashboard` | DevOps | Zdravje storitev + sledenje namestitev |
| `std-cicd-pipeline` | DevOps | Cevovod gradnje/testiranja/namescanja |
| `std-api-gateway` | Infrastruktura | Upravljanje poti/omejitev/avtentikacije |
| `std-coding-academy` | Izobrazevanje | Interaktivne lekcije programiranja |
| `std-stem-lab` | Izobrazevanje | Simulacije naravoslovnih eksperimentov |
| `std-logic-training` | Izobrazevanje | Vadba logicnih ugank |
| `std-rpg-game` | Igre | Igra vlog s poslanstvi + bojem |
| `std-platformer-app` | Igre | Celotna plosincarjeva igra |
| `std-puzzle-app` | Igre | Zbirka ugankacijskih iger |
| `std-strategy-game` | Igre | Strateska igra na poteze |
| `std-arcade-game` | Igre | Klasicna arkadna mehanika iger |

---

## Uporaba obnasanj

### Kot ciste funkcije

```typescript
import { stdList, stdEcommerce } from '@almadar/std/behaviors/functions';

// Preprosto: ena entiteta s CRUD
const tasks = stdList({
  entityName: 'Task',
  fields: [
    { name: 'title', type: 'string', required: true },
    { name: 'status', type: 'enum', values: ['todo', 'doing', 'done'] },
  ],
  pagePath: '/tasks',
});

// Kompleksno: vec-entitetna e-trgovina
const shop = stdEcommerce({
  productEntity: 'Product',
  productFields: [...],
  cartEntity: 'CartItem',
  orderEntity: 'Order',
});
```

### Kot zlati .orb programi

Vsako obnasanje je tudi izvozeno kot `.orb` datoteka v `@almadar/std/behaviors/registry/`:

```bash
# Seznam vseh razpolozljivih obnasanj
ls node_modules/@almadar/std/behaviors/registry/atoms/
ls node_modules/@almadar/std/behaviors/registry/molecules/
ls node_modules/@almadar/std/behaviors/registry/organisms/
```

Ti zlati programi jih uporabljajo:
- Prevajalnik Orb za ujemanje obnasanj
- Agent AI za generiranje programov
- Nacrtovalec Masar za strukturno primerjavo

### Sestavljanje prilagojenih obnasanj

```typescript
import { stdBrowse, stdModal, stdSearch } from '@almadar/std/behaviors/functions';
import { compose, wire, extractTrait } from '@almadar/core/builders';

// Ustvarite prilagojeno molekulo: iskalni seznam z modalnim oknom za ustvarjanje
const searchableCatalog = compose({
  appName: 'Catalog',
  orbitals: [
    stdBrowse({ entityName: 'Item', fields: [...] }),
    stdSearch({ entityName: 'Item' }),
    stdModal({ entityName: 'Item', mode: 'create' }),
  ],
});
```

---

## Integracija vzorcev

Obnasanja uporabljajo vzorce iz **registra vzorcev** (233 vzorcev) za svoje ucinke `render-ui`. Vsak vzorec se preslika na React komponento:

| Kategorija vzorca | Primeri | Uporabljeno v |
|-------------------|---------|---------------|
| Prikaz podatkov | `data-grid`, `entity-table`, `entity-cards`, `data-list` | std-browse |
| Obrazci | `form-section`, `form-field`, `form-wizard` | std-modal, std-wizard |
| Navigacija | `page-header`, `breadcrumb`, `tabs` | std-tabs, strani |
| Povratne informacije | `alert`, `toast`, `modal-dialog` | std-notification, std-confirmation |
| Postavitev | `stack`, `grid`, `sidebar-layout` | Vsi organizmi |
| Igra | `game-canvas`, `game-hud`, `score-display` | Igralna obnasanja |

---

## Naslednji koraki

- [Entitete](./entities.md): Kako delujejo podatkovni modeli entitet
- [Lastnosti](./traits.md): Kako avtomati stanj definirajo obnasanje
- [Vzorci](./patterns.md): Kako se ucinki render-ui preslikajo na komponente
- [Zaprt krog](./closed-circuit.md): Vzorec toka dogodkov
