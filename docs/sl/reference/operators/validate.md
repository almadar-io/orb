---
id: validate
title: "Preverjanje vnosov (validate/*)"
sidebar_label: "Validate"
---

# Preverjanje vnosov

> **Modul:** `validate/*` | **Operatorji:** 23

Preverjanje uporabniskih vnosov s pogostimi vzorci, kot so e-posta, obvezno, preverjanje dolzine.

---

## Referenca operatorjev

### `validate/required`

**Required** · 1 argument · returns `boolean`

Check if value is not null, undefined, or empty string

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `any` | Value to check |

```json
["validate/required", "@payload.name"]
```

### `validate/string`

**String** · 1 argument · returns `boolean`

Check if value is a string

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `any` | Value to check |

```json
["validate/string", "@payload.name"]
```

### `validate/number`

**Number** · 1 argument · returns `boolean`

Check if value is a number

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `any` | Value to check |

```json
["validate/number", "@payload.age"]
```

### `validate/boolean`

**Boolean** · 1 argument · returns `boolean`

Check if value is a boolean

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `any` | Value to check |

```json
["validate/boolean", "@payload.active"]
```

### `validate/array`

**Array** · 1 argument · returns `boolean`

Check if value is an array

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `any` | Value to check |

```json
["validate/array", "@payload.items"]
```

### `validate/object`

**Object** · 1 argument · returns `boolean`

Check if value is an object

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `any` | Value to check |

```json
["validate/object", "@payload.data"]
```

### `validate/email`

**Email** · 1 argument · returns `boolean`

Check if value is a valid email format

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `string` | Email to validate |

```json
["validate/email", "@payload.email"]
```

### `validate/url`

**Url** · 1 argument · returns `boolean`

Check if value is a valid URL format

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `string` | URL to validate |

```json
["validate/url", "@payload.website"]
```

### `validate/uuid`

**Uuid** · 1 argument · returns `boolean`

Check if value is a valid UUID

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `string` | UUID to validate |

```json
["validate/uuid", "@payload.id"]
```

### `validate/phone`

**Phone** · 1 argument · returns `boolean`

Check if value is a valid phone number

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `string` | Phone number to validate |

```json
["validate/phone", "@payload.phone"]
```

### `validate/creditCard`

**Credit Card** · 1 argument · returns `boolean`

Check if value is a valid credit card number (Luhn algorithm)

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `string` | Card number to validate |

```json
["validate/creditCard", "@payload.cardNumber"]
```

### `validate/date`

**Date** · 1 argument · returns `boolean`

Check if value is a valid date

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `any` | Value to check |

```json
["validate/date", "@payload.birthDate"]
```

### `validate/minLength`

**Minimum Length** · 2 arguments · returns `boolean`

Check if string/array has minimum length

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `string \| array` | Value to check |
| `min` | `number` | Minimum length |

```json
["validate/minLength", "@payload.password", 8]
```

### `validate/maxLength`

**Maximum Length** · 2 arguments · returns `boolean`

Check if string/array has maximum length

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `string \| array` | Value to check |
| `max` | `number` | Maximum length |

```json
["validate/maxLength", "@payload.name", 50]
```

### `validate/length`

**Length** · 2 arguments · returns `boolean`

Check if string/array has exact length

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `string \| array` | Value to check |
| `exact` | `number` | Required length |

```json
["validate/length", "@payload.code", 6]
```

### `validate/min`

**Min** · 2 arguments · returns `boolean`

Check if number is &gt;= minimum

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `number` | Number to check |
| `min` | `number` | Minimum value |

```json
["validate/min", "@payload.age", 18]
```

### `validate/max`

**Max** · 2 arguments · returns `boolean`

Check if number is &lt;= maximum

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `number` | Number to check |
| `max` | `number` | Maximum value |

```json
["validate/max", "@payload.quantity", 100]
```

### `validate/range`

**Range** · 3 arguments · returns `boolean`

Check if number is within range [min, max]

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `number` | Number to check |
| `min` | `number` | Minimum value |
| `max` | `number` | Maximum value |

```json
["validate/range", "@payload.rating", 1, 5]
```

### `validate/pattern`

**Pattern** · 2 arguments · returns `boolean`

Check if string matches regex pattern

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `string` | String to check |
| `regex` | `string` | Regex pattern |

```json
["validate/pattern", "@payload.code", "^[A-Z]{3}[0-9]{3}$"]
```

### `validate/oneOf`

**One Of** · 2 arguments · returns `boolean`

Check if value is in list of allowed values

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `any` | Value to check |
| `options` | `array` | Allowed values |

```json
["validate/oneOf", "@payload.role", ["admin", "user", "guest"]]
```

### `validate/noneOf`

**None Of** · 2 arguments · returns `boolean`

Check if value is not in list of disallowed values

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `any` | Value to check |
| `options` | `array` | Disallowed values |

```json
["validate/noneOf", "@payload.username", ["admin", "root", "system"]]
```

### `validate/equals`

**Equals** · 2 arguments · returns `boolean`

Deep equality check

| Parameter | Type | Description |
|-----------|------|-------------|
| `a` | `any` | First value |
| `b` | `any` | Second value |

```json
["validate/equals", "@payload.password", "@payload.confirmPassword"]
```

### `validate/check`

**Check** · 2 arguments · returns `any`

Run multiple validation rules, return &#123; valid, errors &#125;

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `any` | Value or object to validate |
| `rules` | `object` | Validation rules by field |

```json
["validate/check", "@payload.data", {
  "name": [["required"], ["minLength", 2], ["maxLength", 50]],
  "email": [["required"], ["email"]],
  "age": [["number"], ["min", 18]]
}]
```
