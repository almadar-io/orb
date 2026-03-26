---
slug: fsm-underused-pattern
title: "State Machines vs Boolean Flags in .orb"
authors: [osamah]
tags: [architecture, state-machines]
image: /img/blog/fsm-underused-pattern.svg
---
![](/img/blog/fsm-underused-pattern.svg)

import { AvlStateMachine } from '@almadar/ui/illustrations';

Five boolean flags create 32 possible state combinations. Most are invalid. A state machine with five named states has exactly five valid states. That is the core argument for modeling UI behavior in .orb.

<!-- truncate -->

## The Boolean Flag Trap

This pattern is everywhere in React codebases:

```typescript
function UserProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Can isLoading and isError both be true?
  // Can isEditing and isSaving both be true?
  // Can isSuccess and isError both be true?
  // The code does not answer these questions.
}
```

Five booleans, 32 combinations, and the valid subset is never explicitly defined. Bugs come from states you did not consider: loading and error simultaneously, editing and saving at the same time, success lingering after a retry triggers an error.

## The State Machine Alternative

The same behavior, modeled as a .orb state machine:

<div style={{margin: '2rem 0'}}>
<AvlStateMachine
  states={[
    {name: "idle", isInitial: true},
    {name: "loading"},
    {name: "editing"},
    {name: "saving"},
    {name: "error"}
  ]}
  transitions={[
    {from: "idle", to: "loading", event: "FETCH"},
    {from: "loading", to: "idle", event: "SUCCESS"},
    {from: "loading", to: "error", event: "ERROR"},
    {from: "idle", to: "editing", event: "EDIT"},
    {from: "editing", to: "saving", event: "SAVE"},
    {from: "saving", to: "idle", event: "SUCCESS"},
    {from: "saving", to: "error", event: "ERROR"},
    {from: "editing", to: "idle", event: "CANCEL"},
    {from: "error", to: "idle", event: "RETRY"}
  ]}
  animated
/>
</div>

Five states, nine transitions. The entity is in exactly one state at a time. `loading` and `error` cannot coexist. `editing` and `saving` cannot coexist. Every valid transition is explicitly defined.

## .orb Code: Form Submission

Here is a form submission flow in .orb that replaces a tangle of boolean flags:

```json
{
  "name": "SubmitTrait",
  "linkedEntity": "ContactForm",
  "stateMachine": {
    "states": [
      { "name": "editing", "isInitial": true },
      { "name": "validating" },
      { "name": "submitting" },
      { "name": "success" },
      { "name": "error" }
    ],
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
        "guard": ["=", "@payload.valid", true],
        "effects": [["call-service", "submitForm", "@entity"]]
      },
      {
        "from": "validating",
        "to": "editing",
        "event": "VALIDATED",
        "guard": ["=", "@payload.valid", false]
      },
      {
        "from": "submitting",
        "to": "success",
        "event": "SUCCESS",
        "effects": [
          ["render-ui", "main", { "type": "page-header", "title": "Submitted!" }]
        ]
      },
      {
        "from": "submitting",
        "to": "error",
        "event": "FAILURE"
      },
      {
        "from": "error",
        "to": "editing",
        "event": "RETRY"
      }
    ]
  }
}
```

This makes several classes of bugs impossible:

- Cannot submit while already submitting (no transition from `submitting` on `SUBMIT`)
- Cannot be in both success and error (mutually exclusive states)
- Validation is its own state, not a side effect crammed into the submit handler
- Clear retry path from error back to editing

## The Checkout Example

A checkout flow with booleans:

```typescript
function Checkout() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasError, setHasError] = useState(false);
  // 32 possible combinations, most nonsensical
}
```

The same flow in .orb:

```json
{
  "states": [
    { "name": "browsing", "isInitial": true },
    { "name": "cartOpen" },
    { "name": "checkoutForm" },
    { "name": "processing" },
    { "name": "complete" },
    { "name": "error" }
  ],
  "transitions": [
    { "from": "browsing", "to": "cartOpen", "event": "VIEW_CART" },
    { "from": "cartOpen", "to": "checkoutForm", "event": "CHECKOUT" },
    { "from": "checkoutForm", "to": "processing", "event": "SUBMIT" },
    { "from": "processing", "to": "complete", "event": "SUCCESS" },
    { "from": "processing", "to": "error", "event": "FAILURE" },
    { "from": "error", "to": "checkoutForm", "event": "RETRY" },
    { "from": "cartOpen", "to": "browsing", "event": "CLOSE" }
  ]
}
```

Six explicit states instead of 32 boolean combinations. Every transition is intentional. The compiler validates that no state is unreachable, no overlay lacks an exit, and no event goes unhandled.

## When to Reach for a State Machine

Two or three booleans that never interact are manageable. Once you have four or more, or any async operations, or a multi-step flow, the interaction matrix becomes unmanageable. In .orb, state machines are not an optimization you reach for later. They are the default.

The result: your application can only be in states you explicitly defined, and it can only move between them through transitions you explicitly allowed.
