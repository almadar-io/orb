---
id: object
title: "Object Utilities (object/*)"
sidebar_label: "Object"
---

# 🔑 Object Utilities

> **Module:** `object/*` | **Operators:** 18

Access and manipulate object properties safely.

---

## Operator Reference

### `object/keys`

**Keys** · 1 argument · returns `array`

Get object keys as array

| Parameter | Type | Description |
|-----------|------|-------------|
| `obj` | `object` | The object |

```json
["object/keys", {"a": 1, "b": 2}] // => ["a", "b"]
```

### `object/values`

**Values** · 1 argument · returns `array`

Get object values as array

| Parameter | Type | Description |
|-----------|------|-------------|
| `obj` | `object` | The object |

```json
["object/values", {"a": 1, "b": 2}] // => [1, 2]
```

### `object/entries`

**Entries** · 1 argument · returns `array`

Get [key, value] pairs as array

| Parameter | Type | Description |
|-----------|------|-------------|
| `obj` | `object` | The object |

```json
["object/entries", {"a": 1}] // => [["a", 1]]
```

### `object/fromEntries`

**From Entries** · 1 argument · returns `any`

Create object from [key, value] pairs

| Parameter | Type | Description |
|-----------|------|-------------|
| `entries` | `array` | Array of [key, value] pairs |

```json
["object/fromEntries", [["a", 1], ["b", 2]]] // => {"a": 1, "b": 2}
```

### `object/get`

**Get** · 2–3 arguments · returns `any`

Get nested value by path

| Parameter | Type | Description |
|-----------|------|-------------|
| `obj` | `object` | The object |
| `path` | `string` | Dot-separated path (e.g., "user.name") |
| `default` | `any` | Default if path not found |

```json
["object/get", "@user", "profile.name", "Anonymous"]
```

### `object/set`

**Set** · 3 arguments · returns `any`

Set nested value by path (returns new object)

| Parameter | Type | Description |
|-----------|------|-------------|
| `obj` | `object` | The object |
| `path` | `string` | Dot-separated path |
| `value` | `any` | Value to set |

```json
["object/set", "@user", "profile.name", "John"]
```

### `object/has`

**Has** · 2 arguments · returns `boolean`

Check if path exists

| Parameter | Type | Description |
|-----------|------|-------------|
| `obj` | `object` | The object |
| `path` | `string` | Dot-separated path |

```json
["object/has", "@user", "profile.name"]
```

### `object/merge`

**Merge** · 2 or more · returns `any`

Shallow merge objects (later wins)

| Parameter | Type | Description |
|-----------|------|-------------|
| `...objs` | `object[]` | Objects to merge |

```json
["object/merge", {"a": 1}, {"b": 2}] // => {"a": 1, "b": 2}
```

### `object/deepMerge`

**Deep Merge** · 2 or more · returns `any`

Deep merge objects (later wins)

| Parameter | Type | Description |
|-----------|------|-------------|
| `...objs` | `object[]` | Objects to merge |

```json
["object/deepMerge", {"a": {"b": 1}}, {"a": {"c": 2}}]
```

### `object/pick`

**Pick** · 2 arguments · returns `any`

Select only specified keys

| Parameter | Type | Description |
|-----------|------|-------------|
| `obj` | `object` | The object |
| `keys` | `array` | Keys to keep |

```json
["object/pick", "@entity", ["name", "email"]]
```

### `object/omit`

**Omit** · 2 arguments · returns `any`

Exclude specified keys

| Parameter | Type | Description |
|-----------|------|-------------|
| `obj` | `object` | The object |
| `keys` | `array` | Keys to exclude |

```json
["object/omit", "@entity", ["password", "secret"]]
```

### `object/mapValues`

**Map Values** · 2 arguments · returns `any`

Transform all values

| Parameter | Type | Description |
|-----------|------|-------------|
| `obj` | `object` | The object |
| `fn` | `lambda` | Transform function |

```json
["object/mapValues", "@stats", ["fn", "v", ["*", "@v", 100]]]
```

### `object/mapKeys`

**Map Keys** · 2 arguments · returns `any`

Transform all keys

| Parameter | Type | Description |
|-----------|------|-------------|
| `obj` | `object` | The object |
| `fn` | `lambda` | Transform function |

```json
["object/mapKeys", "@data", ["fn", "k", ["str/upper", "@k"]]]
```

### `object/filter`

**Filter** · 2 arguments · returns `any`

Filter entries by predicate

| Parameter | Type | Description |
|-----------|------|-------------|
| `obj` | `object` | The object |
| `pred` | `lambda` | Predicate (key, value) =&gt; boolean |

```json
["object/filter", "@data", ["fn", ["k", "v"], ["!=", "@v", null]]]
```

### `object/empty?`

**Empty?** · 1 argument · returns `boolean`

Check if object has no keys

| Parameter | Type | Description |
|-----------|------|-------------|
| `obj` | `object` | The object |

```json
["object/empty?", {}] // => true
```

### `object/equals`

**Equals** · 2 arguments · returns `boolean`

Deep equality check

| Parameter | Type | Description |
|-----------|------|-------------|
| `a` | `object` | First object |
| `b` | `object` | Second object |

```json
["object/equals", {"a": 1}, {"a": 1}] // => true
```

### `object/clone`

**Clone** · 1 argument · returns `any`

Shallow clone object

| Parameter | Type | Description |
|-----------|------|-------------|
| `obj` | `object` | The object |

```json
["object/clone", "@entity"]
```

### `object/deepClone`

**Deep Clone** · 1 argument · returns `any`

Deep clone object

| Parameter | Type | Description |
|-----------|------|-------------|
| `obj` | `object` | The object |

```json
["object/deepClone", "@entity"]
```
