---
slug: fsm-underused-pattern
title: "Končni avtomati stanja: Najbolj podcenjeni design pattern v frontend razvoju"
authors: [osamah]
tags: [architecture, state-machines]
---

Če uporabljate `useState` za kompleksen UI, verjetno delate narobe. Obstaja 50 let stara rešitev, ki jo ignorirate.

<!-- truncate -->

## Past zastavic boolean

Tukaj je znan vzorec:

```typescript
function UserProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleSave = async () => {
    setIsSaving(true);
    setIsError(false);
    try {
      await saveUser(user);
      setIsEditing(false);
    } catch (e) {
      setIsError(true);
      setErrorMessage(e.message);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Katere kombinacije so veljavne?
  // isLoading=true, isError=true? 
  // isEditing=true, isSaving=true?
  // Kdo ve!
}
```

To ustvarja **2^n možnih stanj** (32 kombinacij za 5 booleanov). Večina je neveljavnih ali nesmiselnih.

## State Machine alternativa

Kaj če eksplicitno definirate veljavna stanja?

```json
{
  "states": [
    { "name": "idle", "isInitial": true },
    { "name": "loading" },
    { "name": "editing" },
    { "name": "saving" },
    { "name": "error" }
  ],
  "events": ["FETCH", "EDIT", "SAVE", "SUCCESS", "ERROR", "CANCEL"],
  "transitions": [
    { "from": "idle", "to": "loading", "event": "FETCH" },
    { "from": "loading", "to": "idle", "event": "SUCCESS" },
    { "from": "loading", "to": "error", "event": "ERROR" },
    { "from": "idle", "to": "editing", "event": "EDIT" },
    { "from": "editing", "to": "saving", "event": "SAVE" },
    { "from": "saving", "to": "idle", "event": "SUCCESS" },
    { "from": "saving", "to": "error", "event": "ERROR" },
    { "from": "editing", "to": "idle", "event": "CANCEL" },
    { "from": "error", "to": "idle", "event": "CANCEL" }
  ]
}
```

Zdaj je natančno **5 stanj** in **9 veljavnih prehodov**. Ni nemogočih kombinacij.

## Vizualizacija razlike

### Zastavice boolean: Špageti stanja
```
         isLoading=true
        /             \
isError=true?      isEditing=true?
      /                 \
     ?                   ?
```

Vsaka kombinacija je možna. Napake nastanejo iz neveljavnih stanj, ki jih niste upoštevali.

### State Machine: Usmerjen graf
```
                    ┌─────────┐
         ┌─────────►│  idle   │◄────────┐
         │          └────┬────┘         │
         │               │              │
    ERROR│          FETCH│         SUCCESS
         │               ▼              │
    ┌────┴───┐      ┌─────────┐        │
    │ error  │      │ loading │        │
    └───┬────┘      └────┬────┘        │
        ▲                │             │
        │           SUCCESS            │
        │                │             │
        │                ▼             │
        │           ┌─────────┐        │
        └───────────┤ editing ├────────┘
                    └────┬────┘
                         │ SAVE
                         ▼
                    ┌─────────┐
         ┌─────────│ saving  │─────────┐
         │         └─────────┘         │
    ERROR│                              │SUCCESS
         │                              │
         └──────────────────────────────┘
```

Vsaka pot je eksplicitna. Neveljavni prehodi ne obstajajo.

## Primer iz resničnega sveta: Pošiljanje forme

### Boolean način
```typescript
function ContactForm() {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const submit = async () => {
    setIsSubmitting(true);
    setIsError(false);
    setIsSuccess(false);
    
    try {
      await api.submit(formData);
      setIsSuccess(true);
    } catch (e) {
      setIsError(true);
      setErrorMessage(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Napaka: Kaj če sta isSuccess in isError oba true?
  // Napaka: Lahko ponovno pošljem med isSubmitting?
  // Napaka: Kaj počisti isSuccess?
}
```

### State Machine način
```json
{
  "states": [
    { "name": "editing", "isInitial": true },
    { "name": "validating" },
    { "name": "submitting" },
    { "name": "success", "isTerminal": true },
    { "name": "error" }
  ],
  "events": ["SUBMIT", "VALIDATED", "SUCCESS", "FAILURE", "RETRY", "EDIT"],
  "transitions": [
    {
      "from": "editing",
      "to": "validating",
      "event": "SUBMIT",
      "effects": [["validate", "@entity"]]
    },
    {
      "from": "validating",
      "to": "submitting",
      "event": "VALIDATED",
      "guard": ["=", "@validation.valid", true],
      "effects": [["call-service", "submitForm", "@entity"]]
    },
    {
      "from": "validating",
      "to": "editing",
      "event": "VALIDATED",
      "guard": ["=", "@validation.valid", false],
      "effects": [["set", "@state.errors", "@validation.errors"]]
    },
    {
      "from": "submitting",
      "to": "success",
      "event": "SUCCESS",
      "effects": [["render-ui", "main", { "type": "success-state" }]]
    },
    {
      "from": "submitting",
      "to": "error",
      "event": "FAILURE",
      "effects": [["set", "@state.error", "@payload.message"]]
    },
    {
      "from": "error",
      "to": "editing",
      "event": "RETRY"
    }
  ]
}
```

Prednosti:
- ✅ Ni pošiljanja medtem ko že pošiljaš
- ✅ Validacija se zgodi v svojem stanju
- ✅ Napaka in uspeh sta medsebojno izključujoča
- ✅ Jasne poti za ponovni poskus

## Zakaj razvijalci izogibajo State Machines

### Mit 1: "Preveč kompleksni so"

Realnost: Zastavice boolean *izgledajo* enostavne, dokler jih ni 5+. Potem postane interakcijska matrika nepredstavljiva.

### Mit 2: "Samo za igre so"

Realnost: Igralni razvijalci uporabljajo FSM, ker **delujejo**. UI je kot igra: uporabniške akcije sprožijo spremembe stanja.

### Mit 3: "Težko jih je spreminjati"

Realnost: Spreminjanje state machine pomeni dodajanje stanja ali prehoda. Spreminjanje zastavic boolean pomeni lovljenje skozi `useEffect` verige.

## Kdaj uporabiti State Machines

| Scenarij | Zastavice boolean | State Machine |
|----------|--------------|---------------|
| 2-3 enostavna stanja | ✅ V redu | ✅ Boljše |
| Asinhrone operacije | ❌ Napako povzročajo | ✅ Jasno |
| Večkoraki poteki | ❌ Nerodno | ✅ Popolno |
| Kompleksni UI načini | ❌ Nemogoče | ✅ Idealno |

## Almadar to olajša

V Almadarju ne implementirate state machine — ga **deklarirate**:

```json
{
  "traits": [{
    "name": "TaskManager",
    "linkedEntity": "Task",
    "stateMachine": {
      "states": [
        { "name": "browsing", "isInitial": true },
        { "name": "creating" },
        { "name": "editing" },
        { "name": "deleting" }
      ],
      "events": ["INIT", "CREATE", "EDIT", "DELETE", "SAVE", "CANCEL"],
      "transitions": [
        {
          "from": "browsing",
          "to": "browsing",
          "event": "INIT",
          "effects": [
            ["render-ui", "main", { "type": "entity-table", "entity": "Task" }]
          ]
        },
        {
          "from": "browsing",
          "to": "creating",
          "event": "CREATE",
          "effects": [
            ["render-ui", "modal", { "type": "form-section", ... }]
          ]
        },
        {
          "from": "creating",
          "to": "browsing",
          "event": "SAVE",
          "effects": [
            ["persist", "create", "Task", "@payload.data"],
            ["render-ui", "modal", null],
            ["emit", "INIT"]
          ]
        },
        {
          "from": "creating",
          "to": "browsing",
          "event": "CANCEL",
          "effects": [["render-ui", "modal", null]]
        }
      ]
    }
  }]
}
```

Compiler generira:
- State machine runtime
- TypeScript tipe
- Event handlerje
- UI vezave

Vi samo definirate logiko.

## Primerjava iz resničnega sveta: Semaforji (spet)

Semaforji so kanonični state machine:

```
Rdeča → Zelena → Rumena → Rdeča
```

Predstavljajte si, če bi semaforji uporabljali zastavice boolean:

```javascript
const [isRed, setIsRed] = useState(true);
const [isGreen, setIsGreen] = useState(false);
const [isYellow, setIsYellow] = useState(false);

// Napaka: Vsi bi lahko bili true!
// Napaka: Vsi bi lahko bili false!
// Napaka: Zelena bi lahko šla neposredno v Rdečo!
```

Prometni inženirji uporabljajo state machine, ker **od življenja je odvisno predvidljivo stanje**.

Vaši uporabniki si zaslužijo enako.

## Poskusite: Pretvorite boolean zmešnjavo

Vzemite to komponento polno booleanov:

```typescript
function Checkout() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasError, setHasError] = useState(false);
  // ... nočna mora useEffect
}
```

In pretvorite v Almadar schema:

```json
{
  "states": [
    { "name": "browsing", "isInitial": true },
    { "name": "cartOpen" },
    { "name": "checkoutForm" },
    { "name": "processing" },
    { "name": "complete", "isTerminal": true },
    { "name": "error" }
  ],
  "events": ["VIEW_CART", "CHECKOUT", "SUBMIT", "SUCCESS", "FAILURE", "CLOSE", "RETRY"]
  // ... transitions
}
```

State machine različica ima **6 eksplicitnih stanj** namesto **32 možnih boolean kombinacij**.

## Spoznanje

Končni avtomati stanja niso akademske vaje — so **praktična orodja** za upravljanje kompleksnosti.

- 2-3 booleani: Verjetno v redu
- 4+ booleani: Razmislite o state machine
- Asinhrone poteki: Definitivno uporabite state machine
- Večkoraki UI: State machine ali nič

Almadar naredi state machine privzete, ne izjeme. Ker si vaši uporabniki zaslužijo predvidljivo programsko opremo.

Pripravljeni poskusiti? [Zgradite svoj prvi state machine](https://orb.almadar.io/docs/getting-started/introduction).
