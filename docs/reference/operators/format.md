---
id: format
title: "Data Formatting (format/*)"
sidebar_label: "Format"
---

# 🎨 Data Formatting

> **Module:** `format/*` | **Operators:** 9

Display formatting for currency, numbers, dates, and file sizes.

---

## Operator Reference

### `format/number`

**Number** · 1–2 arguments · returns `string`

Format number with locale-aware separators

| Parameter | Type | Description |
|-----------|------|-------------|
| `n` | `number` | Number to format |
| `opts` | `object` | Format options (decimals, locale) |

```lolo
(format/number 1234567.89) // => "1,234,567.89"
```

### `format/currency`

**Currency** · 2–3 arguments · returns `string`

Format as currency

| Parameter | Type | Description |
|-----------|------|-------------|
| `n` | `number` | Amount |
| `currency` | `string` | Currency code (USD, EUR, etc.) |
| `locale` | `string` | Locale |

```lolo
(format/currency 1234.56 "USD") // => "$1,234.56"
```

### `format/percent`

**Percent** · 1–2 arguments · returns `string`

Format as percentage

| Parameter | Type | Description |
|-----------|------|-------------|
| `n` | `number` | Number (0.5 = 50%) |
| `decimals` | `number` | Decimal places |

```lolo
(format/percent 0.856 1) // => "85.6%"
```

### `format/bytes`

**Bytes** · 1 argument · returns `string`

Format bytes as human-readable size

| Parameter | Type | Description |
|-----------|------|-------------|
| `n` | `number` | Bytes |

```lolo
(format/bytes 2500000) // => "2.4 MB"
```

### `format/ordinal`

**Ordinal** · 1 argument · returns `string`

Format number as ordinal (1st, 2nd, 3rd)

| Parameter | Type | Description |
|-----------|------|-------------|
| `n` | `number` | Number |

```lolo
(format/ordinal 42) // => "42nd"
```

### `format/plural`

**Plural** · 3 arguments · returns `string`

Format count with singular/plural word

| Parameter | Type | Description |
|-----------|------|-------------|
| `n` | `number` | Count |
| `singular` | `string` | Singular form |
| `plural` | `string` | Plural form |

```lolo
(format/plural 5 "item" "items") // => "5 items"
```

### `format/list`

**List** · 1–2 arguments · returns `string`

Format array as natural language list

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | Array of strings |
| `style` | `string` | "and" or "or" |

```lolo
(format/list (Alice "Bob" "Charlie") "and") // => "Alice, Bob, and Charlie"
```

### `format/phone`

**Phone** · 1–2 arguments · returns `string`

Format phone number

| Parameter | Type | Description |
|-----------|------|-------------|
| `str` | `string` | Phone number digits |
| `format` | `string` | Format pattern |

```lolo
(format/phone "5551234567") // => "(555) 123-4567"
```

### `format/creditCard`

**Credit Card** · 1 argument · returns `string`

Format credit card with masked digits

| Parameter | Type | Description |
|-----------|------|-------------|
| `str` | `string` | Card number |

```lolo
(format/creditCard "4111111111111234") // => "•••• •••• •••• 1234"
```
