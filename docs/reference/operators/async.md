---
id: async
title: "Async Operations (async/*)"
sidebar_label: "Async"
---

# ⏳ Async Operations

> **Module:** `async/*` | **Operators:** 8

Control timing with delays, debouncing, retries, and timeouts.

---

## Operator Reference

### `async/delay`

**Delay** · 1 argument · returns `void`
 · ⚠️ has side effects

Wait for specified milliseconds

| Parameter | Type | Description |
|-----------|------|-------------|
| `ms` | `number` | Milliseconds to wait |

```lolo
(async/delay 2000) // Wait 2 seconds
```

### `async/timeout`

**Timeout** · 2 arguments · returns `any`
 · ⚠️ has side effects

Add timeout to an effect

| Parameter | Type | Description |
|-----------|------|-------------|
| `effect` | `expression` | Effect to execute |
| `ms` | `number` | Timeout in milliseconds |

```lolo
(async/timeout (call "api" "fetchData") 5000)
```

### `async/debounce`

**Debounce** · 2 arguments · returns `void`
 · ⚠️ has side effects

Debounce an event (wait for pause in events)

| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | `string` | Event name to emit |
| `ms` | `number` | Debounce delay in milliseconds |

```lolo
(async/debounce "SEARCH" 300)
```

### `async/throttle`

**Throttle** · 2 arguments · returns `void`
 · ⚠️ has side effects

Throttle an event (emit at most once per interval)

| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | `string` | Event name to emit |
| `ms` | `number` | Throttle interval in milliseconds |

```lolo
(async/throttle "SCROLL" 100)
```

### `async/retry`

**Retry** · 2 arguments · returns `any`
 · ⚠️ has side effects

Retry an effect with configurable backoff

| Parameter | Type | Description |
|-----------|------|-------------|
| `effect` | `expression` | Effect to retry |
| `opts` | `object` | &#123; attempts, backoff, baseDelay &#125; |

```lolo
(async/retry)
  (call "api" "fetchData" { "id": "@entity.id" })
  { "attempts": 3, "backoff": "exponential", "baseDelay": 1000 }]
```

### `async/race`

**Race** · 2 or more · returns `any`
 · ⚠️ has side effects

Execute effects in parallel, return first to complete

| Parameter | Type | Description |
|-----------|------|-------------|
| `...effects` | `expression[]` | Effects to race |

```lolo
(async/race (call "api1") (call "api2"))
```

### `async/all`

**All** · 2 or more · returns `array`
 · ⚠️ has side effects

Execute effects in parallel, wait for all to complete

| Parameter | Type | Description |
|-----------|------|-------------|
| `...effects` | `expression[]` | Effects to execute |

```lolo
(async/all (call "api1") (call "api2"))
```

### `async/sequence`

**Sequence** · 2 or more · returns `array`
 · ⚠️ has side effects

Execute effects in sequence (one after another)

| Parameter | Type | Description |
|-----------|------|-------------|
| `...effects` | `expression[]` | Effects to execute in order |

```lolo
(async/sequence (call "validate") (call "save"))
```
