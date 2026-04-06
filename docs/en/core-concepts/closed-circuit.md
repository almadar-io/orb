import { AvlClosedCircuit } from '@almadar/ui/illustrations';
import OrbPreviewBlock from '@shared/OrbPreviewBlock';

# Closed Circuit

> The execution model that makes every .orb application deterministic: Event, Guard, Transition, Effects, UI, Event.

**Related:**
- [Traits](./traits.md)
- [Pages](./pages.md)

---

## The Execution Model

Every interaction in an .orb application follows a single, repeating cycle:

```
Event -> Guard -> Transition -> Effects -> UI Response -> Event
```

A user clicks a button. That click emits an event onto the event bus. The state machine checks whether a transition exists for that event from the current state. If a guard is defined, it evaluates. If the guard passes (or none exists), the transition executes. Effects run in order: data is persisted, notifications fire, UI re-renders. The new UI presents buttons and actions that emit events. The cycle repeats.

<div style={{margin: '2rem 0'}}>
<AvlClosedCircuit
  states={[
    { name: "Event" },
    { name: "Guard" },
    { name: "Transition" },
    { name: "Effects" },
    { name: "UI Slot" },
  ]}
  transitions={[
    { from: "Event", to: "Guard", event: "trigger" },
    { from: "Guard", to: "Transition", event: "pass" },
    { from: "Transition", to: "Effects", event: "execute" },
    { from: "Effects", to: "UI Slot", event: "render" },
    { from: "UI Slot", to: "Event", event: "emit" },
  ]}
  animated
/>
</div>

This is not a guideline. It is the only path through the system. There is no `onClick` handler that mutates local React state. There is no `setState` call hiding in a component. Every user-visible change passes through the state machine. The compiler enforces this structurally: components receive an `event` prop, not a callback. The event bus carries the event to the state machine, which decides what happens next.

This architecture follows the actor model. Each trait is an actor with private state (its current state machine position). Actors communicate exclusively through messages (events). No actor inspects another actor's internals. The event bus is the message transport. The state machine is the message handler.

---

## Why the Circuit Must Be Closed

Consider a modal. A trait transitions from `viewing` to `modalOpen` and renders a form to the `modal` slot. The user fills in the form and clicks Save. The Save button emits `SAVE`. The state machine transitions from `modalOpen` back to `viewing`, persists the data, and re-renders the main content.

Now remove the `CLOSE` transition from `modalOpen`. The user opens the modal and decides not to save. They click the X button. The X button emits `CLOSE`. The state machine looks for a transition from `modalOpen` on event `CLOSE`. There is none. Nothing happens. The user is stuck in a modal they cannot dismiss. The application is in a state with no exit.

This is a broken circuit. The UI produced an event that the state machine cannot handle. The cycle broke at the "Event -> Guard" step because no matching transition exists.

Closed circuit means: every event that UI components can emit has a corresponding transition in the state machine. Every state that renders overlay UI (modals, drawers) has an exit transition. Every state is reachable from the initial state.

---

## What the Compiler Enforces

The compiler and validator run structural checks to catch broken circuits before the application is built.

### Modal Exit Rule

Any state that renders to the `modal` or `drawer` slot must have a transition on `CLOSE` or `CANCEL` leading to a state that renders to `main`. Overlay slots are blocking. They cover the main content and prevent interaction with anything behind them. If there is no exit transition, the user is trapped.

```
// Caught by validator:
// State 'modalOpen' renders to 'modal' slot but has no CLOSE/CANCEL transition.
// Error: CIRCUIT_NO_EXIT
```

The validator checks the target slot of every `render-ui` effect. If any effect targets `modal` or `drawer`, it verifies that the destination state has at least one outgoing transition on `CLOSE`, `CANCEL`, or a pattern-specific exit event (like `SAVE` on a form).

### Orphan State Detection

A state with no incoming transitions (other than `isInitial`) is unreachable. The user can never arrive there. This typically indicates a typo in a transition's `to` field or a state left behind after refactoring.

```
// Caught by validator:
// State 'editingDetails' has no incoming transitions.
// Error: UNREACHABLE_STATE
```

### Emit/Listen Matching

When a trait declares an event in its `emits` array, another trait must declare that event in its `listens` array (or handle it with a transition). The `emits`/`listens` contract ensures that cross-trait events have both a sender and a receiver. An emitted event with no listener is dead. A listened event with no emitter will never fire.

```
// Caught by validator:
// Trait 'CartManager' emits 'ITEM_ADDED' but no trait listens for it.
// Warning: ORPHAN_EMIT
```

### Orphan Event Detection

If a `render-ui` effect defines an action with an `event` field, there must be a transition that handles that event from the current state. A button that emits `DELETE` with no `DELETE` transition is a dead button. The user clicks it and nothing happens.

```
// Caught by validator:
// Action 'Delete' emits event 'DELETE' which has no transition handler.
// Error: CIRCUIT_ORPHAN_EVENT
```

---

## Determinism and Testability

Because every interaction flows through the state machine, applications become deterministic. Given a known starting state and a sequence of events, the resulting state and effects are fully predictable. There are no race conditions from competing `setState` calls. There are no side effects hiding in `useEffect` hooks. The state machine is the single source of truth.

This makes testing straightforward. The `orb test --execute` command replays event sequences against the state machine and asserts the resulting state, effects, and UI:

```bash
orb test --execute my-app.orb
```

A test scenario sends `INIT`, then `OPEN_MODAL`, then `CLOSE`, and verifies:
- After `INIT`: state is `viewing`, slot `main` has content
- After `OPEN_MODAL`: state is `modalOpen`, slot `modal` has a form
- After `CLOSE`: state is `viewing`, slot `modal` is empty, slot `main` has content again

No browser is needed. No React rendering. The state machine is tested in isolation because it controls everything. If the circuit is correct in the test, it is correct in the running application.

---

## Live Example: Modal Open/Close Circuit

This trait demonstrates a complete closed circuit for a modal interaction. The `viewing` state renders a page header with an "Add Item" button. Clicking the button emits `ADD`, which transitions to `formOpen` and renders a form in the `modal` slot. The form has Save and Cancel buttons. Both `SAVE` and `CANCEL` transition back to `viewing` and re-render the main content. The modal slot empties. The circuit is closed on both exit paths.

<OrbPreviewBlock title="Modal Closed Circuit" height="450px" schema={`{
  "name": "ClosedCircuitDemo",
  "orbitals": [
    {
      "name": "ItemManager",
      "entity": {
        "name": "Item",
        "persistence": "runtime",
        "fields": [
          { "name": "id", "type": "string" },
          { "name": "name", "type": "string" },
          { "name": "category", "type": "string", "default": "general", "values": ["general", "urgent", "archive"] },
          { "name": "createdAt", "type": "string" }
        ]
      },
      "traits": [
        {
          "name": "ItemCrud",
          "linkedEntity": "Item",
          "category": "interaction",
          "stateMachine": {
            "states": [
              { "name": "viewing", "isInitial": true },
              { "name": "formOpen" }
            ],
            "events": [
              { "key": "INIT", "name": "Initialize" },
              { "key": "ADD", "name": "Add Item" },
              { "key": "SAVE", "name": "Save" },
              { "key": "CANCEL", "name": "Cancel" },
              { "key": "CLOSE", "name": "Close" }
            ],
            "transitions": [
              {
                "from": "viewing",
                "to": "viewing",
                "event": "INIT",
                "effects": [
                  ["fetch", "Item"],
                  ["render-ui", "main", {
                    "type": "stack",
                    "direction": "vertical",
                    "gap": "lg",
                    "children": [
                      {
                        "type": "stack",
                        "direction": "horizontal",
                        "gap": "md",
                        "justify": "space-between",
                        "children": [
                          { "type": "typography", "content": "Items", "variant": "h2" },
                          { "type": "button", "label": "Add Item", "event": "ADD", "variant": "primary", "icon": "plus" }
                        ]
                      },
                      { "type": "divider" },
                      { "type": "typography", "content": "No items yet. Click Add Item to create one.", "variant": "body", "color": "muted" }
                    ]
                  }]
                ]
              },
              {
                "from": "viewing",
                "to": "formOpen",
                "event": "ADD",
                "effects": [
                  ["render-ui", "modal", {
                    "type": "stack",
                    "direction": "vertical",
                    "gap": "md",
                    "children": [
                      { "type": "typography", "content": "New Item", "variant": "h3" },
                      { "type": "input", "label": "Name", "placeholder": "Enter item name" },
                      { "type": "select", "label": "Category", "options": [
                        { "value": "general", "label": "General" },
                        { "value": "urgent", "label": "Urgent" },
                        { "value": "archive", "label": "Archive" }
                      ]},
                      {
                        "type": "stack",
                        "direction": "horizontal",
                        "gap": "md",
                        "children": [
                          { "type": "button", "label": "Save", "event": "SAVE", "variant": "primary" },
                          { "type": "button", "label": "Cancel", "event": "CANCEL", "variant": "secondary" }
                        ]
                      }
                    ]
                  }]
                ]
              },
              {
                "from": "formOpen",
                "to": "viewing",
                "event": "SAVE",
                "effects": [
                  ["persist", "create", "Item", "@payload"],
                  ["notify", "success", "Item created"],
                  ["render-ui", "modal", null],
                  ["render-ui", "main", {
                    "type": "stack",
                    "direction": "vertical",
                    "gap": "lg",
                    "children": [
                      {
                        "type": "stack",
                        "direction": "horizontal",
                        "gap": "md",
                        "justify": "space-between",
                        "children": [
                          { "type": "typography", "content": "Items", "variant": "h2" },
                          { "type": "button", "label": "Add Item", "event": "ADD", "variant": "primary", "icon": "plus" }
                        ]
                      },
                      { "type": "divider" },
                      { "type": "typography", "content": "No items yet. Click Add Item to create one.", "variant": "body", "color": "muted" }
                    ]
                  }]
                ]
              },
              {
                "from": "formOpen",
                "to": "viewing",
                "event": "CANCEL",
                "effects": [
                  ["render-ui", "modal", null],
                  ["render-ui", "main", {
                    "type": "stack",
                    "direction": "vertical",
                    "gap": "lg",
                    "children": [
                      {
                        "type": "stack",
                        "direction": "horizontal",
                        "gap": "md",
                        "justify": "space-between",
                        "children": [
                          { "type": "typography", "content": "Items", "variant": "h2" },
                          { "type": "button", "label": "Add Item", "event": "ADD", "variant": "primary", "icon": "plus" }
                        ]
                      },
                      { "type": "divider" },
                      { "type": "typography", "content": "No items yet. Click Add Item to create one.", "variant": "body", "color": "muted" }
                    ]
                  }]
                ]
              },
              {
                "from": "formOpen",
                "to": "viewing",
                "event": "CLOSE",
                "effects": [
                  ["render-ui", "modal", null],
                  ["render-ui", "main", {
                    "type": "stack",
                    "direction": "vertical",
                    "gap": "lg",
                    "children": [
                      {
                        "type": "stack",
                        "direction": "horizontal",
                        "gap": "md",
                        "justify": "space-between",
                        "children": [
                          { "type": "typography", "content": "Items", "variant": "h2" },
                          { "type": "button", "label": "Add Item", "event": "ADD", "variant": "primary", "icon": "plus" }
                        ]
                      },
                      { "type": "divider" },
                      { "type": "typography", "content": "No items yet. Click Add Item to create one.", "variant": "body", "color": "muted" }
                    ]
                  }]
                ]
              }
            ]
          }
        }
      ],
      "pages": [
        {
          "name": "ItemListPage",
          "path": "/items",
          "isInitial": true,
          "traits": [
            { "ref": "ItemCrud", "linkedEntity": "Item" }
          ]
        }
      ]
    }
  ]
}`} />

Trace the circuit:

1. **INIT** fires on page load. State machine moves `viewing -> viewing`. Effects: fetch items, render main content with an "Add Item" button.
2. User clicks "Add Item". Button emits **ADD**. State machine moves `viewing -> formOpen`. Effects: render form to `modal` slot.
3. User clicks "Save". Button emits **SAVE**. State machine moves `formOpen -> viewing`. Effects: persist new item, show notification, re-render main. Modal clears.
4. Alternatively, user clicks "Cancel". Button emits **CANCEL**. State machine moves `formOpen -> viewing`. Effects: re-render main. Modal clears. No data persisted.
5. If the user clicks the modal's X button or presses Escape, the slot wrapper emits **CLOSE**. State machine moves `formOpen -> viewing`. Same result as Cancel.

Three exit paths from `formOpen` (SAVE, CANCEL, CLOSE), all returning to `viewing`. The circuit is closed on every path. No dead ends.

---

## Slot Return Requirements

Not all slots require exit transitions. The rule depends on whether the slot blocks interaction with the rest of the page:

| Slot | Type | Exit Required? |
|------|------|----------------|
| `main` | Primary | No. This is home base. |
| `sidebar` | Secondary | No. Coexists with main. |
| `center` | Secondary | No. Coexists with main. |
| `modal` | Overlay (blocking) | **Yes.** Must have CLOSE or CANCEL transition. |
| `drawer` | Overlay (blocking) | **Yes.** Must have CLOSE or CANCEL transition. |
| `toast` | Notification | No. Auto-dismisses. |

Overlay slots cover the main content. They intercept pointer events. If the state machine has no transition to dismiss them, the user cannot interact with the application at all.

---

## Testing the Circuit

The `orb test --execute` command validates circuits at the behavioral level. It replays event sequences and checks that the state machine reaches the expected states with the expected effects:

```bash
orb test --execute my-app.orb
```

Output for a passing test:

```
[PASS] ItemCrud: INIT -> viewing (main: rendered)
[PASS] ItemCrud: ADD -> formOpen (modal: rendered)
[PASS] ItemCrud: SAVE -> viewing (persist: Item created, modal: cleared)
[PASS] ItemCrud: CANCEL -> viewing (modal: cleared)
[PASS] ItemCrud: CLOSE -> viewing (modal: cleared)

5/5 scenarios passed. Circuit complete.
```

A failing test identifies the exact break point:

```
[FAIL] ItemCrud: CLOSE from formOpen
  Expected: transition to viewing
  Actual: no transition found for event CLOSE from state formOpen
  
  CIRCUIT_NO_EXIT: State 'formOpen' renders to 'modal' but has no CLOSE transition.
```

The test runs the state machine in isolation, without a browser. Because the circuit is the single path through the system, if the state machine passes, the UI will work correctly.

---

## Key Principles

1. **One path through the system.** Every user interaction follows Event, Guard, Transition, Effects, UI, Event. There are no shortcuts and no escape hatches.

2. **Events, not callbacks.** Components emit events. They never call functions, mutate state, or trigger side effects directly. The state machine is the only decision-maker.

3. **Every overlay has an exit.** The compiler refuses to build applications where a modal or drawer state has no outgoing CLOSE or CANCEL transition.

4. **Unreachable states are errors.** If a state cannot be reached from the initial state through any event sequence, it is dead code and the validator flags it.

5. **Emits require listeners.** Cross-trait events declared in `emits` must be consumed by another trait's `listens`. Orphan emissions are caught at validation time.

6. **Testable without a browser.** Because the state machine controls everything, `orb test --execute` can verify the entire circuit as pure data transformations. The UI is a projection of state, not a source of truth.
