---
slug: fsm-underused-pattern
title: "Finite State Machines: The Most Underused Design Pattern in Frontend Development"
authors: [osamah]
tags: [architecture, state-machines]
image: /img/blog/fsm-underused-pattern.png
---

![Finite State Machines: The Most Underused Design Pattern](/img/blog/fsm-underused-pattern.png)

If you're using `useState` for complex UI, you're probably doing it wrong. There's a 50-year-old solution you're ignoring.

<!-- truncate -->

<OrbitalDiagram />

## The Boolean Flag Trap

Here's a familiar pattern:

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
  
  // What combinations are valid?
  // isLoading=true, isError=true? 
  // isEditing=true, isSaving=true?
  // Who knows!
}
```

This creates **2^n possible states** (32 combinations for 5 booleans). Most are invalid or nonsensical.

## The State Machine Alternative

What if you explicitly defined valid states?

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

Now there are exactly **5 states** and **9 valid transitions**. No impossible combinations.

## Visualizing the Difference

### Boolean Flags: Spaghetti State
```
         isLoading=true
        /             \
isError=true?      isEditing=true?
      /                 \
     ?                   ?
```

Any combination is possible. Bugs arise from invalid states you didn't consider.

### State Machine: Directed Graph
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

Every path is explicit. Invalid transitions don't exist.

## Real-World Example: Form Submission

### The Boolean Way
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
  
  // Bug: What if isSuccess and isError are both true?
  // Bug: Can I submit again while isSubmitting?
  // Bug: What clears isSuccess?
}
```

### The State Machine Way
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

Benefits:
- ✅ Can't submit while already submitting
- ✅ Validation happens in its own state
- ✅ Error and success are mutually exclusive
- ✅ Clear paths for retry

## Why Developers Avoid State Machines

### Myth 1: "They're Too Complex"

Reality: Boolean flags *seem* simpler until you have 5+ of them. Then the interaction matrix becomes incomprehensible.

### Myth 2: "They're Only for Games"

Reality: Game developers use FSMs because they **work**. UI is just like a game: user actions trigger state changes.

### Myth 3: "They're Hard to Change"

Reality: Changing a state machine means adding a state or transition. Changing boolean flags means hunting through `useEffect` chains.

## When to Use State Machines

| Scenario | Boolean Flags | State Machine |
|----------|--------------|---------------|
| 2-3 simple states | ✅ Okay | ✅ Better |
| Async operations | ❌ Buggy | ✅ Clear |
| Multi-step flows | ❌ Messy | ✅ Perfect |
| Complex UI modes | ❌ Impossible | ✅ Ideal |

## Almadar Makes It Easy

In Almadar, you don't implement the state machine — you **declare** it:

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

The compiler generates:
- State machine runtime
- TypeScript types
- Event handlers
- UI bindings

You just define the logic.

## Real-World Analogy: Traffic Lights (Again)

Traffic lights are the canonical state machine:

```
Red → Green → Yellow → Red
```

Imagine if traffic lights used boolean flags:

```javascript
const [isRed, setIsRed] = useState(true);
const [isGreen, setIsGreen] = useState(false);
const [isYellow, setIsYellow] = useState(false);

// Bug: All could be true!
// Bug: All could be false!
// Bug: Green could turn directly to Red!
```

Traffic engineers use state machines because **lives depend on predictable states**.

Your users' sanity depends on it too.

## Try It: Convert a Boolean Mess

Take this boolean-heavy component:

```typescript
function Checkout() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasError, setHasError] = useState(false);
  // ... nightmare of useEffect
}
```

And convert to Almadar schema:

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

The state machine version has **6 explicit states** instead of **32 possible boolean combinations**.

## The Takeaway

Finite state machines aren't academic exercises — they're **practical tools** for managing complexity.

- 2-3 booleans: Probably fine
- 4+ booleans: Consider a state machine
- Async flows: Definitely use a state machine
- Multi-step UI: State machine or bust

Almadar makes state machines the default, not the exception. Because your users deserve predictable software.

Ready to try? [Build your first state machine](https://orb.almadar.io/docs/getting-started/introduction).
