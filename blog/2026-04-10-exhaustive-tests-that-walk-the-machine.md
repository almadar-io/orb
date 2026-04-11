---
slug: exhaustive-tests-that-walk-the-machine
title: "Exhaustive Tests That Walk the Machine"
authors: [osamah]
tags: [compiler, state-machines]
---

`orb validate` proves structural properties. `orb test` goes further — it walks every edge of every state machine, fires every event from every state, and verifies that guards block and allow correctly. You write zero test code. The graph is the test plan.

<!-- truncate -->

## Four Categories of Tests

The compiler already knows every state, every transition, and every guard. `orb test` uses that graph to generate tests automatically:

1. **Transition matrix** — fire every valid `(state, event)` pair, assert the target state.
2. **Guard enforcement** — for each guarded transition, synthesize a payload that satisfies the guard (should pass) and an empty payload (should block).
3. **Invalid transitions** — fire every event that has *no* handler in a given state, assert the machine stays put.
4. **Journey** — BFS traversal that visits every reachable state in a single path, proving the graph is connected.

Each test includes a `setup_path`: the shortest route from the initial state to the test's starting state. No manual fixtures — the machine walks itself there.

## A Worked Example

```lolo
orbital OrderOrbital {
  entity Order [runtime] {
    id     : string
    status : string
    amount : number
  }

  trait OrderLifecycle -> Order [interaction] {
    initial: pending
    state pending {
      INIT -> pending
        (fetch Order)
        (render-ui main { type: "stack", direction: "vertical", gap: "md", children: [{ type: "typography", content: "Order", variant: "h2" }, { type: "typography", content: "@entity.status", variant: "body" }, { type: "button", label: "Approve", event: "APPROVE", variant: "primary" }, { type: "button", label: "Cancel", event: "CANCEL", variant: "secondary" }] })
      APPROVE -> approved when (>= @entity.amount 0)
        (set @status "approved")
        (render-ui main { type: "stack", direction: "vertical", gap: "md", children: [{ type: "typography", content: "Approved", variant: "h2" }, { type: "button", label: "Ship", event: "SHIP", variant: "primary" }] })
      CANCEL -> cancelled
        (set @status "cancelled")
        (render-ui main { type: "stack", direction: "vertical", gap: "md", children: [{ type: "typography", content: "Cancelled", variant: "h2" }] })
    }
    state approved {
      SHIP -> shipped
        (set @status "shipped")
        (render-ui main { type: "stack", direction: "vertical", gap: "md", children: [{ type: "typography", content: "Shipped", variant: "h2" }, { type: "button", label: "Deliver", event: "DELIVER", variant: "primary" }] })
    }
    state shipped {
      DELIVER -> delivered
        (set @status "delivered")
        (render-ui main { type: "stack", direction: "vertical", gap: "md", children: [{ type: "typography", content: "Delivered", variant: "h2" }] })
    }
    state delivered {
    }
    state cancelled {
    }
  }

  page "/order" -> OrderLifecycle
}
```

Five states. One guard on `APPROVE`. Run `orb test`:

```
$ orb test order.lolo --execute

Trait: OrderLifecycle
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  transition (5 tests):
    ✓ pending + INIT → pending
    ✓ pending + APPROVE → approved
    ✓ pending + CANCEL → cancelled
    ✓ approved + SHIP → shipped
    ✓ shipped + DELIVER → delivered

  guard_block (1 test):
    ✓ guard blocks APPROVE (invalid payload)

  guard_allow (1 test):
    ✓ guard allows APPROVE (valid payload)

  invalid (invalid pairs):
    ✓ approved + CANCEL (stays in approved)
    ✓ shipped + APPROVE (stays in shipped)
    ...

  journey (1 test):
    ✓ full journey: APPROVE → SHIP → DELIVER

Total: 1 trait — all tests passed
```

## How Guard Tests Work

The `APPROVE` transition has a guard: `(>= @entity.amount 0)`. The test generator reads the S-expression, sees `@entity.amount` compared with `>=` to `0`, and synthesizes two cases:

- **Guard block:** empty entity data, no `amount` field — guard evaluates to false, machine stays in `pending`.
- **Guard allow:** entity data with `amount: 0` — guard passes, machine transitions to `approved`.

This works for any guard expression: equality checks, comparisons, `and`/`or` compositions, payload bindings. The generator walks the expression tree and produces minimal satisfying (and violating) inputs.

## The Design Point

Add a state to `OrderLifecycle` and the test count grows automatically. Remove a transition and the invalid-transition tests adjust. The test suite is a function of the state machine — not a separate artifact that drifts out of sync.

`--execute` runs all cases headlessly against the real state machine runtime. No browser, no mocks, no test runner to configure.
