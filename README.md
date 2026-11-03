<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="static/img/orb-icon-dark.svg">
  <img src="static/img/orb-icon-transparent.svg" width="96" alt="Orb">
</picture>

# Orb

### The rule is the program.

Declare the rules. Orb builds the app, or tells you why it can't.

[Website](https://orb.almadar.io) · [Docs](https://orb.almadar.io/docs) · [Playground](https://orb.almadar.io/playground) · [Standard library](https://orb.almadar.io/stdlib) · [Blog](https://orb.almadar.io/blog)

[![npm](https://img.shields.io/npm/v/@almadar/orb?label=%40almadar%2Forb)](https://www.npmjs.com/package/@almadar/orb)
[![CI](https://github.com/almadar-io/orb/actions/workflows/ci.yml/badge.svg)](https://github.com/almadar-io/orb/actions/workflows/ci.yml)

</div>

```sh
curl -fsSL https://orb.almadar.io/install.sh | sh          # macOS, Linux
irm https://orb.almadar.io/install.ps1 | iex               # Windows PowerShell
npm install -g @almadar/orb                                # or through npm
```

## Write the rule

Most software is rules: an order cannot ship before it is paid, a refund needs a manager, a ticket must be answered within a day. In most codebases those rules are spread across the frontend, the API, the database and the tests, and they drift apart. In Orb the rule *is* the shape of the program.

`checkout.lolo`:

```lisp
app checkout [
  version: "1.0.0",
  description: "An order that cannot ship before it is paid."
]
orbital Orders {
  entity Order [runtime] {
    id : string!
    total : number
  }

  trait Checkout -> Order [client] {
    initial: pending

    state pending {
      INIT -> pending
        (render-ui main { type: button, label: "Pay 40", action: PAY, actionPayload: { amount: 40 } })
      PAY -> paid when (> ?amount 0)
        (set @entity.total ?amount)
        (render-ui main { type: button, label: "Ship", action: SHIP })
    }

    state paid {
      INIT -> pending
        (render-ui main { type: button, label: "Pay 40", action: PAY, actionPayload: { amount: 40 } })
      SHIP -> shipped
        (render-ui main { type: button, label: "New order", action: NEW_ORDER })
    }

    state shipped {
      INIT -> pending
        (render-ui main { type: button, label: "Pay 40", action: PAY, actionPayload: { amount: 40 } })
      NEW_ORDER -> pending
        (render-ui main { type: button, label: "Pay 40", action: PAY, actionPayload: { amount: 40 } })
    }

    emits {
      PAY { amount : number! }
    }
  }

  page "/checkout" -> Checkout
}
```

There is no `SHIP` out of `pending`, so an unpaid order cannot ship. That is not a test you hope someone wrote: it is the program. The data (`entity`), the states, the events that move between them, the guard (`when`) and the screen at each step live in one file, and the same file is the specification, the implementation and the input to verification.

## Run it everywhere

```sh
orb validate checkout.lolo                       # 0 errors and 0 warnings is the bar
orb verify checkout.lolo                         # play every transition and check it does what it declares
orb serve checkout.lolo --open                   # run it in the browser
orb compile checkout.lolo --output ./checkout    # a full application you can deploy
```

One `.lolo` program, many hosts: a web app (TypeScript and React), a Python service, a native Rust desktop or terminal app, iOS (Swift) and Android (Kotlin). One kernel carries the meaning of the program on every one of them, so a rule behaves the same everywhere.

## Every mistake gets a name and a line

Delete the `SHIP` transition and validate again:

```console
$ orb validate checkout.lolo
❌ [ORB_T_STATE_UNREACHABLE] State 'shipped' is unreachable from the initial state 'pending' via any transition path @ 11:3
   💡 Add a transition that reaches this state, or remove the dead state
❌ [ORB_X_RENDER_UI_EVENT_LITERAL_STALE] Prop 'action' on 'button' references event 'SHIP' but the trait's event set has no such key @ 19:10
   💡 Either add 'SHIP' to the trait's emits / listens / transition events, or rewrite the literal to match an existing event key
Error: Schema validation failed with 3 error(s)
```

A button that sends an event nothing handles, a state you can never reach or leave, an event emitted to nobody, a page that renders nothing: all are errors before anything runs. Every interaction is a closed circuit, **Event → Guard → Transition → Effects → UI → Event**, and the compiler checks that each one closes.

## What you get

- **A standard library of behaviors.** Lists, forms, wizards, dashboards, data tables, games and learning instruments, each one a `.lolo` file you import with `uses` and bind to your own data. [Browse it](https://orb.almadar.io/stdlib).
- **Keywords in your language.** Programs read in English, Arabic or Slovenian; the language packs ([lolo-ar](https://github.com/almadar-io/lolo-ar), [lolo-sl](https://github.com/almadar-io/lolo-sl)) are installed packages, not forks.
- **A playground.** Write and run Orb in the browser at [orb.almadar.io/playground](https://orb.almadar.io/playground), with each trait drawn as its state machine as it runs.
- **Updates that keep up.** `orb update` keeps the CLI and its packages current; security and critical fixes apply automatically, everything else waits for you.

```sh
orb update --global      # the CLI and its packages, in ~/.orb
orb update               # this project's packages
```

## How it fits together

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="static/img/readme/architecture/orb-dark.svg">
  <img src="static/img/readme/architecture/orb-light.svg" width="100%" alt="The Almadar architecture: apps on behaviors, behaviors on the orb tooling, tooling on the hosts, hosts on one kernel">
</picture>

You write `.lolo`. `orb` lowers it to the `.orb` program, validates the whole graph and runs or compiles it on a host; one kernel ([orbital-core](https://github.com/almadar-io/orbital-core)) gives it the same meaning on every host. The [standard library](https://github.com/almadar-io/almadar-std) is itself written in `.lolo`.

## This repository

This repo is how `orb` reaches you, and the source of [orb.almadar.io](https://orb.almadar.io). It holds the installers (`cli/install.sh`, `cli/install.ps1`), the `@almadar/orb` npm launcher and its five platform packages (`@almadar/orb-<platform>`), the published binaries and GitHub releases, and the reusable [`orb-advisory-redeploy`](.github/workflows/orb-advisory-redeploy.yml) workflow that redeploys an app when an urgent release goes out:

```yaml
# .github/workflows/orb-advisory.yml in your app
on:
  repository_dispatch:
    types: [orb-advisory]
jobs:
  redeploy:
    uses: almadar-io/orb/.github/workflows/orb-advisory-redeploy.yml@main
    with:
      programs: "app.lolo"
      deploy-command: "npm run deploy"
    secrets: inherit
```

The compiler and the CLI itself live in [orbital-cli](https://github.com/almadar-io/orbital-cli), [orbital-lolo](https://github.com/almadar-io/orbital-lolo) and [orbital-compiler](https://github.com/almadar-io/orbital-compiler).

## License

Documentation and site content: [CC BY 4.0](./LICENSE). The `orb` CLI and its npm packages: BSL 1.1, converting to Apache 2.0 on 2030-02-01; non-production use is free.
