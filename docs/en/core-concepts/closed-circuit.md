import { AvlClosedCircuit } from '@almadar/ui/illustrations';

# Closed Circuit

This document defines the **Closed Circuit Pattern** - the foundational architecture that ensures users are never stuck in an invalid UI state.

---

## The Problem

When a user clicks "Open Modal", the state machine transitions to `modalOpen` and renders a Modal to the `modal` slot. But if the Modal's close button (X) doesn't properly emit an event back to the state machine, the user is **stuck** - they can see the modal but can't dismiss it.

This is a **broken circuit**.

---

## The Closed Circuit Principle

**Every UI interaction must complete a full circuit back to the state machine.**

<div style={{margin: '2rem 0'}}>
<AvlClosedCircuit animated />
</div>

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│   ┌─────────┐    ┌──────────┐    ┌─────────────┐    ┌──────────────────┐  │
│   │  Event  │───►│  Guard   │───►│  Transition │───►│  Effects         │  │
│   │         │    │ Evaluate │    │  Execute    │    │  (render_ui)     │  │
│   └─────────┘    └──────────┘    └─────────────┘    └──────────────────┘  │
│        ▲                                                      │           │
│        │                                                      ▼           │
│   ┌─────────┐                                          ┌──────────────┐   │
│   │ Event   │◄─────────────────────────────────────────│   UI Slot    │   │
│   │  Bus    │         UI:CLOSE, UI:SAVE, etc.          │   Rendered   │   │
│   └─────────┘                                          └──────────────┘   │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

**Rules:**

1. **All UI interactions emit events via the Event Bus** - Never use internal callbacks like `onClick={() => setOpen(false)}`
2. **All events must have corresponding transitions** - If a component emits `UI:CLOSE`, there must be a transition that handles `CLOSE`
3. **Non-main slots must return to main** - If you render to `modal`, `drawer`, or other overlay slots, there MUST be a transition that renders back to `main`

---

## Slot Hierarchy and Return Requirements

| Slot | Type | Return Requirement |
|------|------|-------------------|
| `main` | Primary | None - this is home base |
| `sidebar` | Secondary | Optional - can coexist with main |
| `center` | Secondary | Optional - can coexist with main |
| `modal` | Overlay | **REQUIRED** - Must have CLOSE/CANCEL transition back to main |
| `drawer` | Overlay | **REQUIRED** - Must have CLOSE/CANCEL transition back to main |
| `toast` | Notification | Auto-dismisses, no transition needed |

**Overlay slots (`modal`, `drawer`) are blocking** - they prevent interaction with main content. Users MUST be able to exit them.

---

## Component Event Contracts

Components that can trigger state transitions MUST emit events via the Event Bus:

### Components with `actions` prop (page-level)

| Component | Prop | Emits |
|-----------|------|-------|
| `page-header` | `actions` | `UI:\{event\}` for each action |
| `form` | `actions` | `UI:SAVE`, `UI:CANCEL` |
| `toolbar` | `actions` | `UI:\{event\}` for each action |

### Components with `itemActions` prop (row-level)

| Component | Prop | Emits |
|-----------|------|-------|
| `entity-table` | `itemActions` | `UI:\{event\}` with `{ row }` payload |
| `entity-list` | `itemActions` | `UI:\{event\}` with `{ row }` payload |
| `entity-cards` | `itemActions` | `UI:\{event\}` with `{ row }` payload |

### Overlay Components (MUST emit close events)

| Component | Close Trigger | Must Emit |
|-----------|---------------|-----------|
| `modal` | X button, Escape, Overlay click | `UI:CLOSE` |
| `drawer` | X button, Escape, Overlay click | `UI:CLOSE` |
| `confirm-dialog` | Cancel button | `UI:CANCEL` |
| `game-pause-overlay` | Resume button | `UI:RESUME` |
| `game-over-screen` | Restart button | `UI:RESTART` |

---

## Validation Requirements

The validator enforces the following:

### 1. Orphan Event Detection

If a component's `actions` or `itemActions` defines an event, there MUST be a transition that handles it.

```json
// BAD - OPEN_MODAL has no handler
{
  "type": "page-header",
  "actions": [{ "label": "Open", "event": "OPEN_MODAL" }]
}
// But no transition: { "event": "OPEN_MODAL", ... }
```

**Error**: `CIRCUIT_ORPHAN_EVENT: Action 'Open' emits event 'OPEN_MODAL' which has no transition handler`

### 2. Modal/Drawer Exit Transition

If a transition renders to `modal` or `drawer` slot, there MUST be a transition FROM that target state that:
- Handles `CLOSE`, `CANCEL`, or a pattern-required event (like `SAVE`)
- Renders back to `main` slot (or transitions to a state that does)

```json
// BAD - modalOpen state has no exit
{
  "from": "viewing",
  "event": "OPEN_MODAL",
  "to": "modalOpen",
  "effects": [["render-ui", "modal", { "type": "modal", ... }]]
}
// But no transition: { "from": "modalOpen", "event": "CLOSE", ... }
```

**Error**: `CIRCUIT_NO_EXIT: State 'modalOpen' renders to 'modal' slot but has no CLOSE/CANCEL transition. Users will be stuck.`

### 3. Return to Main Requirement

States that render ONLY to non-main slots must eventually return to a state that renders to `main`.

```json
// BAD - modalOpen only renders to modal, never returns to main
{
  "from": "modalOpen",
  "event": "CLOSE",
  "to": "modalOpen",  // Goes back to itself!
  "effects": []       // And renders nothing
}
```

**Error**: `CIRCUIT_NO_MAIN_RETURN: State 'modalOpen' has no path back to a state that renders to 'main' slot`

---

## Compiler Requirements

The compiler ensures closed circuits through:

### 1. Slot Wrappers for Overlays

Overlay slots are wrapped in slot wrapper components that handle event bus communication:

| Slot | Wrapper | Events Emitted |
|------|---------|----------------|
| `modal` | `ModalSlot` | `UI:CLOSE`, `UI:CANCEL` |
| `drawer` | `DrawerSlot` | `UI:CLOSE`, `UI:CANCEL` |
| `toast` | `ToastSlot` | `UI:DISMISS`, `UI:CLOSE` |

The wrapper components:
- Automatically show when children are present
- Handle close/dismiss triggers (X button, Escape, overlay click)
- Emit events via the event bus so the state machine can transition

**Example**: `ModalSlot` wraps any content rendered to the modal slot and emits `UI:CLOSE` when dismissed:

```typescript
// ModalSlot.tsx
const handleClose = () => {
  eventBus.emit('UI:CLOSE');
  eventBus.emit('UI:CANCEL');
};

return (
  <Modal isOpen={Boolean(children)} onClose={handleClose}>
    {children}
  </Modal>
);
```

### 2. Generate `event` prop, not `onClick`

For actions in `page-header`, `form`, etc., the compiler generates the `event` prop so the component emits via event bus:

```typescript
// Generated code:
<PageHeader actions={[{ label: "Open", event: "OPEN_MODAL" }]} />

// NOT:
<PageHeader actions={[{ label: "Open", onClick: () => dispatch('OPEN_MODAL') }]} />
```

The component handles emitting `UI:OPEN_MODAL` via event bus, which `useUIEvents` catches and dispatches.

### 3. Page Must Render All Slots with Wrappers

Generated pages render ALL slots, with overlay slots wrapped in their slot wrappers:

```typescript
// Generated page:
return (
  <>
    <VStack>
      {/* Content slots - rendered inline */}
      {ui?.main}
      {ui?.sidebar}
      {ui?.center}
    </VStack>
    {/* Overlay slots - wrapped for closed circuit */}
    <ModalSlot>{ui?.modal}</ModalSlot>
    <DrawerSlot>{ui?.drawer}</DrawerSlot>
    <ToastSlot>{ui?.toast}</ToastSlot>
  </>
);
```

**Key**: The slot wrappers emit events via event bus when the overlay is closed/dismissed. This completes the circuit back to the state machine.

---

## Schema Pattern for Modal

Correct schema pattern for a modal:

```json
{
  "states": [
    { "name": "viewing", "isInitial": true },
    { "name": "modalOpen" }
  ],
  "events": [
    { "key": "OPEN_MODAL", "name": "Open Modal" },
    { "key": "CLOSE", "name": "Close" }
  ],
  "transitions": [
    {
      "from": "viewing",
      "event": "INIT",
      "to": "viewing",
      "effects": [
        ["render-ui", "main", {
          "type": "page-header",
          "title": "Example",
          "actions": [{ "label": "Open Modal", "event": "OPEN_MODAL" }]
        }]
      ]
    },
    {
      "from": "viewing",
      "event": "OPEN_MODAL",
      "to": "modalOpen",
      "effects": [
        ["render-ui", "modal", { "type": "modal", "title": "Modal" }]
      ]
    },
    {
      "from": "modalOpen",
      "event": "CLOSE",
      "to": "viewing",
      "effects": [
        ["render-ui", "main", {
          "type": "page-header",
          "title": "Example",
          "actions": [{ "label": "Open Modal", "event": "OPEN_MODAL" }]
        }]
      ]
    }
  ]
}
```

**Key Points:**
1. `OPEN_MODAL` transition renders to `modal` slot
2. `CLOSE` transition FROM `modalOpen` renders back to `main` slot
3. Both events have corresponding transitions

---

## Summary

The Closed Circuit Pattern ensures:

1. **Users are never stuck** - Every UI state has an exit path
2. **Events flow through the state machine** - No internal state management bypassing the circuit
3. **Overlay slots return to main** - Modals and drawers always have close transitions
4. **Validation catches breaks** - The compiler validates circuit completeness before generating code

When the circuit is broken, users experience "dead" buttons, stuck modals, and unresponsive UI. The validator and compiler work together to prevent this.
