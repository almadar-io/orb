---
slug: closed-circuit-pattern
title: "The Closed Circuit Pattern: Why Your Users Get Stuck (And How to Prevent It)"
authors: [osamah]
tags: [architecture, state-machines]
image: /img/blog/closed-circuit-pattern.png
---

![The Closed Circuit Pattern: Why Your Users Get Stuck (And How to Prevent It)](/img/blog/closed-circuit-pattern.png)

Ever opened a modal and couldn't close it? That's a broken circuit. We made it impossible to build those.

<!-- truncate -->

<OrbitalDiagram />

## The Stuck User Problem

You're using an app. You click "Open Settings." A modal appears. You click the X button. Nothing happens. You press Escape. Nothing. You click outside the modal. Still nothing.

**You're stuck.**

This happens because:
1. The modal opened via internal state (`setIsOpen(true)`)
2. The close button triggers `setIsOpen(false)`
3. But if there's a bug, the state doesn't update
4. Or worse — the close button was never wired up

In Almadar, this is architecturally impossible.

## The Closed Circuit Principle

**Every UI interaction must complete a full circuit back to the state machine.**

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│   User Click ──► Event Bus ──► State Machine ──► UI Update     │
│       ▲                                              │         │
│       └──────────────────────────────────────────────┘         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

No shortcuts. No direct state mutations. Every action flows through the circuit.

## How It Works in Almadar

### 1. User Triggers Event

When you click a button:

```typescript
// ❌ NOT this:
onClick={() => setIsModalOpen(false)}

// ✅ This:
onClick={() => eventBus.emit('UI:CLOSE')}
```

The component doesn't know what happens next. It just emits.

### 2. Event Bus Routes to State Machine

The event bus receives `UI:CLOSE` and routes it to the active trait's state machine.

### 3. State Machine Processes

```json
{
  "from": "modalOpen",
  "to": "browsing",
  "event": "CLOSE",
  "effects": [
    ["render-ui", "modal", null],
    ["render-ui", "main", { "type": "page-header", ... }]
  ]
}
```

The state machine:
1. Transitions from `modalOpen` to `browsing`
2. Clears the modal slot
3. Renders the main content

### 4. UI Updates

The component re-renders based on the new state. The modal disappears because the state machine said so.

## Why This Prevents Stuck States

### 1. Events Must Have Transitions

If you define a button with an event:

```json
{
  "type": "page-header",
  "actions": [{ "label": "Open", "event": "OPEN_MODAL" }]
}
```

The validator **requires** a matching transition:

```json
{
  "from": "browsing",
  "to": "modalOpen",
  "event": "OPEN_MODAL"
  // ✅ Required transition exists
}
```

If you forget:
```
✗ Error: CIRCUIT_ORPHAN_EVENT
  Action 'Open' emits event 'OPEN_MODAL' which has no transition handler
```

### 2. Overlay Slots Must Have Exits

If you render to `modal` or `drawer`, the validator requires an exit:

```json
{
  "from": "browsing",
  "to": "modalOpen",
  "event": "OPEN_MODAL",
  "effects": [
    ["render-ui", "modal", { "type": "form-section", ... }]
  ]
}
```

Must have:
```json
{
  "from": "modalOpen",
  "to": "browsing",
  "event": "CLOSE"
  // ✅ Required exit transition
}
```

If you forget:
```
✗ Error: CIRCUIT_NO_OVERLAY_EXIT
  State 'modalOpen' renders to 'modal' slot but has no exit transition.
  Users will be stuck in this overlay.
```

### 3. Slot Wrappers Handle Escape Hatches

Even if you forget a close button, the slot wrapper saves you:

```typescript
// ModalSlot.tsx (auto-generated wrapper)
const handleClose = () => {
  eventBus.emit('UI:CLOSE');
  eventBus.emit('UI:CANCEL');
};

return (
  <Modal 
    isOpen={Boolean(children)} 
    onClose={handleClose}  // Escape key, overlay click, X button
  >
    {children}
  </Modal>
);
```

The wrapper emits the event. The state machine handles it. The circuit completes.

## Real-World Analogy: Traffic Lights

Traffic lights follow a closed circuit:

```
Red ──(timer)──► Green ──(timer)──► Yellow ──(timer)──► Red
```

There's no "jump from Red to Green instantly" or "get stuck on Yellow." The circuit is closed — every state has defined transitions.

Now imagine a broken traffic light:
- Stuck on Red → traffic jam
- Stuck on Green → accidents
- Random transitions → chaos

Almadar's validator is like a traffic engineer who checks:
- ✅ Every light has transitions
- ✅ No impossible states
- ✅ Emergency modes defined

## Example: Modal That Can't Break

Here's a modal implementation that's **impossible to get stuck in**:

```json
{
  "states": [
    { "name": "browsing", "isInitial": true },
    { "name": "modalOpen" }
  ],
  "events": [
    { "key": "OPEN_MODAL", "name": "Open Modal" },
    { "key": "CLOSE", "name": "Close" },
    { "key": "SAVE", "name": "Save" }
  ],
  "transitions": [
    {
      "from": "browsing",
      "to": "browsing",
      "event": "INIT",
      "effects": [
        ["render-ui", "main", {
          "type": "page-header",
          "title": "Tasks",
          "actions": [{ "label": "New Task", "event": "OPEN_MODAL" }]
        }]
      ]
    },
    {
      "from": "browsing",
      "to": "modalOpen",
      "event": "OPEN_MODAL",
      "effects": [
        ["render-ui", "modal", {
          "type": "form-section",
          "entity": "Task",
          "fields": ["title", "status"],
          "submitEvent": "SAVE",
          "cancelEvent": "CLOSE"
        }]
      ]
    },
    {
      "from": "modalOpen",
      "to": "browsing",
      "event": "CLOSE",
      "effects": [
        ["render-ui", "modal", null],
        ["emit", "INIT"]
      ]
    },
    {
      "from": "modalOpen",
      "to": "browsing",
      "event": "SAVE",
      "effects": [
        ["persist", "create", "Task", "@payload.data"],
        ["render-ui", "modal", null],
        ["emit", "INIT"]
      ]
    }
  ]
}
```

**Three ways to exit the modal:**
1. Click "Cancel" → triggers `CLOSE` event
2. Click "Save" → triggers `SAVE` event  
3. Press Escape or click overlay → ModalSlot emits `UI:CLOSE`

All three transition back to `browsing` and clear the modal.

## The Slot Hierarchy

Different slots have different return requirements:

| Slot | Type | Return Requirement |
|------|------|-------------------|
| `main` | Primary | None — this is home base |
| `sidebar` | Secondary | Optional — can coexist with main |
| `modal` | Overlay | **REQUIRED** — Must have exit transition |
| `drawer` | Overlay | **REQUIRED** — Must have exit transition |
| `toast` | Notification | Auto-dismisses, no transition needed |

## Why This Architecture Matters

### For Users
- ✅ Never get stuck in modals
- ✅ Consistent behavior across apps
- ✅ Predictable UI patterns

### For Developers
- ✅ Bugs caught at compile time
- ✅ No manual close handler wiring
- ✅ State changes are traceable

### For Teams
- ✅ Schema = documentation
- ✅ Easy to review state flows
- ✅ Onboarding is faster

## Try It: Build a Break-Proof Modal

Create `modal-demo.orb`:

```json
{
  "name": "ModalDemo",
  "orbitals": [{
    "name": "Demo",
    "entity": { "name": "Item", "fields": [{ "name": "name", "type": "string" }] },
    "traits": [{
      "name": "DemoTrait",
      "linkedEntity": "Item",
      "stateMachine": {
        "states": [
          { "name": "main", "isInitial": true },
          { "name": "modalOpen" }
        ],
        "events": [
          { "key": "INIT", "name": "Initialize" },
          { "key": "OPEN", "name": "Open" },
          { "key": "CLOSE", "name": "Close" }
        ],
        "transitions": [
          {
            "from": "main",
            "to": "main",
            "event": "INIT",
            "effects": [
              ["render-ui", "main", {
                "type": "page-header",
                "title": "Demo",
                "actions": [{ "label": "Open Modal", "event": "OPEN" }]
              }]
            ]
          },
          {
            "from": "main",
            "to": "modalOpen",
            "event": "OPEN",
            "effects": [
              ["render-ui", "modal", { "type": "page-header", "title": "I'm a Modal!" }]
            ]
          },
          {
            "from": "modalOpen",
            "to": "main",
            "event": "CLOSE",
            "effects": [
              ["render-ui", "modal", null],
              ["emit", "INIT"]
            ]
          }
        ]
      }
    }],
    "pages": [{ "name": "DemoPage", "path": "/", "traits": [{ "ref": "DemoTrait" }] }]
  }]
}
```

Compile and try it:
```bash
orbital validate modal-demo.orb  # Will fail without CLOSE transition
orbital compile modal-demo.orb --shell typescript
```

Try removing the `CLOSE` transition and validating again. The compiler won't let you create a broken circuit.

## The Takeaway

The Closed Circuit Pattern isn't just a good idea — it's enforced by the compiler.

In Almadar:
- Every UI action emits an event
- Every event has a transition
- Every overlay has an exit
- Users never get stuck

Because the best way to prevent bugs isn't testing — it's making them impossible to write.

Learn more about [state machines in Almadar](https://orb.almadar.io/docs/traits).
