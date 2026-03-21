---
id: index
title: Operator Reference
sidebar_label: Overview
---

# Operator Reference

Orb's standard library provides 213+ built-in operators organized into 9 modules.
All operators are available as s-expressions in guards and effects.

## Modules

| Module | Prefix | Operators | Description |
|--------|--------|-----------|-------------|
| [Math](math) | `math/*` | 16 | Numeric operations for calculations, rounding, clamping, and randomization |
| [String](str) | `str/*` | 26 | Text manipulation including formatting, splitting, trimming, and templating |
| [Array](array) | `array/*` | 39 | Work with lists and arrays including filtering, mapping, and aggregation |
| [Object](object) | `object/*` | 18 | Access and manipulate object properties safely |
| [Time](time) | `time/*` | 25 | Work with dates, times, durations, and timestamps |
| [Validate](validate) | `validate/*` | 23 | Validate user input with common patterns like email, required, length checks |
| [Format](format) | `format/*` | 9 | Display formatting for currency, numbers, dates, and file sizes |
| [Async](async) | `async/*` | 8 | Control timing with delays, debouncing, retries, and timeouts |
| [Prob](prob) | `prob/*` | 16 | Distribution sampling, Bayesian inference, statistical summaries |

## Quick Reference: Core Operators

These operators work without a module prefix:

| Operator | Example | Returns |
|----------|---------|---------|
| Arithmetic | `["+", 1, 2]` | number |
| Comparison | `[">", "@entity.x", 5]` | boolean |
| Logic | `["and", true, false]` | boolean |
| `if` | `["if", cond, then, else]` | any |
| `do` | `["do", expr1, expr2]` | last value |
| `set` | `["set", "@entity.x", 42]` | void |
| `get` | `["get", "@entity.x"]` | any |
| `emit` | `["emit", "EVENT"]` | void |

See [Core Concepts: Standard Library](/docs/en/core-concepts/standard-library) for the complete core operator list.

:::tip AVL Operator Visualization
The [Almadar Visual Language (AVL)](/docs/en/core-concepts/avl-reference) reference page includes color-coded diagrams for operators, showing how s-expressions compose into expression trees. Use `AvlExprTree` components to visualize operator nesting in your own documentation.
:::
