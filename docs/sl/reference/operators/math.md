---
title: "Matematicne operacije (math/*)"
sidebar_label: "Math"
---

# Matematicne operacije

> **Modul:** `math/*` | **Operatorji:** 16

Numericne operacije za izracune, zaokrozevanje, omejevanje in nakljucnost.

---

## Operator Reference

### `math/abs`

**Absolute Value** · 1 argument · returns `number`

Absolute value

| Parameter | Type | Description |
|-----------|------|-------------|
| `n` | `number` | The number |

```json
["math/abs", -5] // => 5
```

### `math/min`

**Min** · 2 or more · returns `number`

Minimum of values

| Parameter | Type | Description |
|-----------|------|-------------|
| `...nums` | `number[]` | Numbers to compare |

```json
["math/min", 3, 1, 4] // => 1
```

### `math/max`

**Max** · 2 or more · returns `number`

Maximum of values

| Parameter | Type | Description |
|-----------|------|-------------|
| `...nums` | `number[]` | Numbers to compare |

```json
["math/max", 3, 1, 4] // => 4
```

### `math/clamp`

**Clamp** · 3 arguments · returns `number`

Constrain value to range [min, max]

| Parameter | Type | Description |
|-----------|------|-------------|
| `n` | `number` | The value to clamp |
| `min` | `number` | Minimum bound |
| `max` | `number` | Maximum bound |

```json
["math/clamp", 150, 0, 100] // => 100
```

### `math/floor`

**Floor** · 1 argument · returns `number`

Round down to integer

| Parameter | Type | Description |
|-----------|------|-------------|
| `n` | `number` | The number |

```json
["math/floor", 3.7] // => 3
```

### `math/ceil`

**Ceil** · 1 argument · returns `number`

Round up to integer

| Parameter | Type | Description |
|-----------|------|-------------|
| `n` | `number` | The number |

```json
["math/ceil", 3.2] // => 4
```

### `math/round`

**Round** · 1–2 arguments · returns `number`

Round to nearest integer or specified decimals

| Parameter | Type | Description |
|-----------|------|-------------|
| `n` | `number` | The number |
| `decimals` | `number` | Decimal places |

```json
["math/round", 3.456, 2] // => 3.46
```

### `math/pow`

**Pow** · 2 arguments · returns `number`

Exponentiation (base^exp)

| Parameter | Type | Description |
|-----------|------|-------------|
| `base` | `number` | The base |
| `exp` | `number` | The exponent |

```json
["math/pow", 2, 8] // => 256
```

### `math/sqrt`

**Sqrt** · 1 argument · returns `number`

Square root

| Parameter | Type | Description |
|-----------|------|-------------|
| `n` | `number` | The number |

```json
["math/sqrt", 16] // => 4
```

### `math/mod`

**Mod** · 2 arguments · returns `number`

Modulo (remainder)

| Parameter | Type | Description |
|-----------|------|-------------|
| `a` | `number` | Dividend |
| `b` | `number` | Divisor |

```json
["math/mod", 7, 3] // => 1
```

### `math/sign`

**Sign** · 1 argument · returns `number`

Returns -1, 0, or 1 indicating sign

| Parameter | Type | Description |
|-----------|------|-------------|
| `n` | `number` | The number |

```json
["math/sign", -42] // => -1
```

### `math/lerp`

**Linear Interpolation** · 3 arguments · returns `number`

Linear interpolation between a and b by factor t

| Parameter | Type | Description |
|-----------|------|-------------|
| `a` | `number` | Start value |
| `b` | `number` | End value |
| `t` | `number` | Interpolation factor (0-1) |

```json
["math/lerp", 0, 100, 0.5] // => 50
```

### `math/map`

**Map** · 5 arguments · returns `number`

Map value from one range to another

| Parameter | Type | Description |
|-----------|------|-------------|
| `n` | `number` | The value |
| `inMin` | `number` | Input range minimum |
| `inMax` | `number` | Input range maximum |
| `outMin` | `number` | Output range minimum |
| `outMax` | `number` | Output range maximum |

```json
["math/map", 5, 0, 10, 0, 100] // => 50
```

### `math/random`

**Random** · 0 arguments · returns `number`

Random number between 0 (inclusive) and 1 (exclusive)

```json
["math/random"] // => 0.7234...
```

### `math/randomInt`

**Random Integer** · 2 arguments · returns `number`

Random integer in range [min, max] (inclusive)

| Parameter | Type | Description |
|-----------|------|-------------|
| `min` | `number` | Minimum (inclusive) |
| `max` | `number` | Maximum (inclusive) |

```json
["math/randomInt", 1, 6] // => 4
```

### `math/default`

**Default** · 2 arguments · returns `number`

Return default if value is null, undefined, or NaN

| Parameter | Type | Description |
|-----------|------|-------------|
| `n` | `number \| null` | The value |
| `default` | `number` | Default value |

```json
["math/default", null, 0] // => 0
```
