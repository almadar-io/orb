---
slug: exhaustive-tests-that-walk-the-machine
title: "Exhaustive Tests That Walk the Machine"
authors: [osamah]
tags: [compiler, state-machines]
---

`orbital validate` proves structural properties. `orbital test` goes further — it walks every edge of every state machine, fires every event from every state, and verifies that guards block and allow correctly. You write zero test code. The graph is the test plan.

<!-- truncate -->

## Four Categories of Tests

The compiler already knows every state, every transition, and every guard. `orbital test` uses that graph to generate tests automatically:

1. **Transition matrix** — fire every valid `(state, event)` pair, assert the target state.
2. **Guard enforcement** — for each guarded transition, synthesize a payload that satisfies the guard (should pass) and an empty payload (should block).
3. **Invalid transitions** — fire every event that has *no* handler in a given state, assert the machine stays put.
4. **Journey** — BFS traversal that visits every reachable state in a single path, proving the graph is connected.

Each test includes a `setup_path`: the shortest route from the initial state to the test's starting state. No manual fixtures — the machine walks itself there.

## A Worked Example

```lolo
orbital OrderOrbital {
  entity Order [persistent: orders] {
    id     : string!
    status : string
    amount : int
  }

  trait OrderLifecycle -> Order [interaction] {
    state pending {
      APPROVE -> approved
        when (>= @entity.amount 0)
        (set @status "approved")
      CANCEL -> cancelled
        (set @status "cancelled")
    }
    state approved {
      SHIP -> shipped
        (set @status "shipped")
    }
    state shipped {
      DELIVER -> delivered
        (set @status "delivered")
    }
    state delivered {}
    state cancelled {}
  }
}
```

Five states. One guard. Run `orbital test`:

```
$ orbital test order.lolo --execute

Trait: OrderLifecycle
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  transition (4 tests):
    ✓ pending + APPROVE → approved
    ✓ pending + CANCEL → cancelled
    ✓ approved + SHIP → shipped
    ✓ shipped + DELIVER → delivered

  guard_block (1 test):
    ✓ guard blocks APPROVE (invalid payload)

  guard_allow (1 test):
    ✓ guard allows APPROVE (valid payload)

  invalid (6 tests):
    ✓ approved + CANCEL (invalid)
    ✓ shipped + APPROVE (invalid)
    ✓ delivered + SHIP (invalid)
    ✓ delivered + APPROVE (invalid)
    ✓ cancelled + APPROVE (invalid)
    ✓ cancelled + SHIP (invalid)

  journey (1 test):
    ✓ full journey: APPROVE → SHIP → DELIVER

Total: 1 trait, 13 test cases — 13 passed, 0 failed
```

## How Guard Tests Work

The `APPROVE` transition has a guard: `(>= @entity.amount 0)`. The test generator reads the S-expression, sees `@entity.amount` compared with `>=` to `0`, and synthesizes two cases:

- **Guard block:** empty entity data, no `amount` field — guard evaluates to false, machine stays in `pending`.
- **Guard allow:** entity data with `amount: 0` — guard passes, machine transitions to `approved`.

This works for any guard expression: equality checks, comparisons, `and`/`or` compositions, payload bindings. The generator walks the expression tree and produces minimal satisfying (and violating) inputs.

## The Design Point

Add a state to `OrderLifecycle` and the test count grows automatically. Remove a transition and the invalid-transition tests adjust. The test suite is a function of the state machine — not a separate artifact that drifts out of sync.

`--execute` runs all cases headlessly against the real state machine runtime. No browser, no mocks, no test runner to configure.
