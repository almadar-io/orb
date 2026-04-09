---
id: str
title: "String Operations (str/*)"
sidebar_label: "String"
---

# 📝 String Operations

> **Module:** `str/*` | **Operators:** 26

Text manipulation including formatting, splitting, trimming, and templating.

---

## Operator Reference

### `str/len`

**Length** · 1 argument · returns `number`

String length

| Parameter | Type | Description |
|-----------|------|-------------|
| `s` | `string` | The string |

```lolo
(str/len "hello") // => 5
```

### `str/upper`

**Upper** · 1 argument · returns `string`

Convert to uppercase

| Parameter | Type | Description |
|-----------|------|-------------|
| `s` | `string` | The string |

```lolo
(str/upper "hello") // => "HELLO"
```

### `str/lower`

**Lower** · 1 argument · returns `string`

Convert to lowercase

| Parameter | Type | Description |
|-----------|------|-------------|
| `s` | `string` | The string |

```lolo
(str/lower "HELLO") // => "hello"
```

### `str/trim`

**Trim** · 1 argument · returns `string`

Remove leading and trailing whitespace

| Parameter | Type | Description |
|-----------|------|-------------|
| `s` | `string` | The string |

```lolo
(str/trim " hello ") // => "hello"
```

### `str/trimStart`

**Trim Start** · 1 argument · returns `string`

Remove leading whitespace

| Parameter | Type | Description |
|-----------|------|-------------|
| `s` | `string` | The string |

```lolo
(str/trimStart " hello") // => "hello"
```

### `str/trimEnd`

**Trim End** · 1 argument · returns `string`

Remove trailing whitespace

| Parameter | Type | Description |
|-----------|------|-------------|
| `s` | `string` | The string |

```lolo
(str/trimEnd "hello ") // => "hello"
```

### `str/split`

**Split** · 2 arguments · returns `array`

Split string into array by delimiter

| Parameter | Type | Description |
|-----------|------|-------------|
| `s` | `string` | The string |
| `delim` | `string` | Delimiter |

```lolo
(str/split "a,b,c" ",") // => ["a", "b", "c"]
```

### `str/join`

**Join** · 2 arguments · returns `string`

Join array elements into string

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | Array to join |
| `delim` | `string` | Delimiter |

```lolo
(str/join (a "b" "c") ", ") // => "a, b, c"
```

### `str/slice`

**Slice** · 2–3 arguments · returns `string`

Extract substring

| Parameter | Type | Description |
|-----------|------|-------------|
| `s` | `string` | The string |
| `start` | `number` | Start index |
| `end` | `number` | End index (exclusive) |

```lolo
(str/slice "hello" 1 4) // => "ell"
```

### `str/replace`

**Replace** · 3 arguments · returns `string`

Replace first occurrence

| Parameter | Type | Description |
|-----------|------|-------------|
| `s` | `string` | The string |
| `find` | `string` | String to find |
| `replace` | `string` | Replacement |

```lolo
(str/replace "hello world" "world" "there") // => "hello there"
```

### `str/replaceAll`

**Replace All** · 3 arguments · returns `string`

Replace all occurrences

| Parameter | Type | Description |
|-----------|------|-------------|
| `s` | `string` | The string |
| `find` | `string` | String to find |
| `replace` | `string` | Replacement |

```lolo
(str/replaceAll "a-b-c" "-" "_") // => "a_b_c"
```

### `str/includes`

**Includes** · 2 arguments · returns `boolean`

Check if string contains substring

| Parameter | Type | Description |
|-----------|------|-------------|
| `s` | `string` | The string |
| `search` | `string` | Substring to find |

```lolo
(str/includes "hello world" "world") // => true
```

### `str/startsWith`

**Starts With** · 2 arguments · returns `boolean`

Check if string starts with prefix

| Parameter | Type | Description |
|-----------|------|-------------|
| `s` | `string` | The string |
| `prefix` | `string` | Prefix to check |

```lolo
(str/startsWith "hello" "hel") // => true
```

### `str/endsWith`

**Ends With** · 2 arguments · returns `boolean`

Check if string ends with suffix

| Parameter | Type | Description |
|-----------|------|-------------|
| `s` | `string` | The string |
| `suffix` | `string` | Suffix to check |

```lolo
(str/endsWith "hello" "lo") // => true
```

### `str/padStart`

**Pad Start** · 2–3 arguments · returns `string`

Pad string from start to target length

| Parameter | Type | Description |
|-----------|------|-------------|
| `s` | `string` | The string |
| `len` | `number` | Target length |
| `char` | `string` | Padding character |

```lolo
(str/padStart "5" 3 "0") // => "005"
```

### `str/padEnd`

**Pad End** · 2–3 arguments · returns `string`

Pad string from end to target length

| Parameter | Type | Description |
|-----------|------|-------------|
| `s` | `string` | The string |
| `len` | `number` | Target length |
| `char` | `string` | Padding character |

```lolo
(str/padEnd "5" 3 "0") // => "500"
```

### `str/repeat`

**Repeat** · 2 arguments · returns `string`

Repeat string n times

| Parameter | Type | Description |
|-----------|------|-------------|
| `s` | `string` | The string |
| `count` | `number` | Repeat count |

```lolo
(str/repeat "ab" 3) // => "ababab"
```

### `str/reverse`

**Reverse** · 1 argument · returns `string`

Reverse string

| Parameter | Type | Description |
|-----------|------|-------------|
| `s` | `string` | The string |

```lolo
(str/reverse "hello") // => "olleh"
```

### `str/capitalize`

**Capitalize** · 1 argument · returns `string`

Capitalize first character

| Parameter | Type | Description |
|-----------|------|-------------|
| `s` | `string` | The string |

```lolo
(str/capitalize "hello") // => "Hello"
```

### `str/titleCase`

**Title Case** · 1 argument · returns `string`

Convert to Title Case

| Parameter | Type | Description |
|-----------|------|-------------|
| `s` | `string` | The string |

```lolo
(str/titleCase "hello world") // => "Hello World"
```

### `str/camelCase`

**Camel Case** · 1 argument · returns `string`

Convert to camelCase

| Parameter | Type | Description |
|-----------|------|-------------|
| `s` | `string` | The string |

```lolo
(str/camelCase "hello world") // => "helloWorld"
```

### `str/kebabCase`

**Kebab Case** · 1 argument · returns `string`

Convert to kebab-case

| Parameter | Type | Description |
|-----------|------|-------------|
| `s` | `string` | The string |

```lolo
(str/kebabCase "Hello World") // => "hello-world"
```

### `str/snakeCase`

**Snake Case** · 1 argument · returns `string`

Convert to snake_case

| Parameter | Type | Description |
|-----------|------|-------------|
| `s` | `string` | The string |

```lolo
(str/snakeCase "Hello World") // => "hello_world"
```

### `str/default`

**Default** · 2 arguments · returns `string`

Return default if value is null/undefined/empty

| Parameter | Type | Description |
|-----------|------|-------------|
| `s` | `string \| null` | The value |
| `default` | `string` | Default value |

```lolo
(str/default null "N/A") // => "N/A"
```

### `str/template`

**Template** · 2 arguments · returns `string`

Variable substitution in template string

| Parameter | Type | Description |
|-----------|------|-------------|
| `template` | `string` | Template with &#123;placeholders&#125; |
| `vars` | `object` | Variables to substitute |

```lolo
(str/template "Hello, {name}!" {"name": "World"}) // => "Hello, World!"
```

### `str/truncate`

**Truncate** · 2–3 arguments · returns `string`

Truncate string with optional suffix

| Parameter | Type | Description |
|-----------|------|-------------|
| `s` | `string` | The string |
| `len` | `number` | Maximum length |
| `suffix` | `string` | Suffix for truncated strings |

```lolo
(str/truncate "Hello World" 8 "...") // => "Hello..."
```
