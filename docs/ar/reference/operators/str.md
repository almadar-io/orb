---
id: str
title: "عمليات النصوص (str/*)"
sidebar_label: "النصوص"
---

# عمليات النصوص

> **الوحدة:** `str/*` | **العوامل:** 26

معالجة النصوص بما في ذلك التنسيق والتقسيم والقص والقوالب.

---

## مرجع العوامل

### `str/len`
**الطول** · وسيط واحد · يُعيد `number`
```json
["str/len", "hello"] // => 5
```

### `str/upper`
**أحرف كبيرة** · وسيط واحد · يُعيد `string`
```json
["str/upper", "hello"] // => "HELLO"
```

### `str/lower`
**أحرف صغيرة** · وسيط واحد · يُعيد `string`
```json
["str/lower", "HELLO"] // => "hello"
```

### `str/trim`
**قص الفراغات** · وسيط واحد · يُعيد `string`

إزالة الفراغات من البداية والنهاية
```json
["str/trim", "  hello  "] // => "hello"
```

### `str/trimStart`
**قص البداية** · وسيط واحد · يُعيد `string`
```json
["str/trimStart", "  hello"] // => "hello"
```

### `str/trimEnd`
**قص النهاية** · وسيط واحد · يُعيد `string`
```json
["str/trimEnd", "hello  "] // => "hello"
```

### `str/split`
**تقسيم** · وسيطان · يُعيد `array`

تقسيم نص إلى مصفوفة بفاصل

| المعامل | النوع | الوصف |
|---------|-------|-------|
| `s` | `string` | النص |
| `delim` | `string` | الفاصل |

```json
["str/split", "a,b,c", ","] // => ["a", "b", "c"]
```

### `str/join`
**ضم** · وسيطان · يُعيد `string`

ضم عناصر مصفوفة في نص

```json
["str/join", ["a", "b", "c"], ", "] // => "a, b, c"
```

### `str/slice`
**اقتطاع** · 2-3 وسائط · يُعيد `string`

| المعامل | النوع | الوصف |
|---------|-------|-------|
| `s` | `string` | النص |
| `start` | `number` | موقع البداية |
| `end` | `number` | موقع النهاية (حصري) |

```json
["str/slice", "hello", 1, 4] // => "ell"
```

### `str/replace`
**استبدال** · 3 وسائط · يُعيد `string`

استبدال أول تواجد
```json
["str/replace", "hello world", "world", "there"] // => "hello there"
```

### `str/replaceAll`
**استبدال الكل** · 3 وسائط · يُعيد `string`

استبدال جميع التواجدات
```json
["str/replaceAll", "a-b-c", "-", "_"] // => "a_b_c"
```

### `str/includes`
**يحتوي** · وسيطان · يُعيد `boolean`

التحقق إذا كان النص يحتوي على نص فرعي
```json
["str/includes", "hello world", "world"] // => true
```

### `str/startsWith`
**يبدأ بـ** · وسيطان · يُعيد `boolean`
```json
["str/startsWith", "hello", "hel"] // => true
```

### `str/endsWith`
**ينتهي بـ** · وسيطان · يُعيد `boolean`
```json
["str/endsWith", "hello", "lo"] // => true
```

### `str/padStart`
**حشو البداية** · 2-3 وسائط · يُعيد `string`
```json
["str/padStart", "5", 3, "0"] // => "005"
```

### `str/padEnd`
**حشو النهاية** · 2-3 وسائط · يُعيد `string`
```json
["str/padEnd", "5", 3, "0"] // => "500"
```

### `str/repeat`
**تكرار** · وسيطان · يُعيد `string`
```json
["str/repeat", "ab", 3] // => "ababab"
```

### `str/reverse`
**عكس** · وسيط واحد · يُعيد `string`
```json
["str/reverse", "hello"] // => "olleh"
```

### `str/capitalize`
**تكبير الحرف الأول** · وسيط واحد · يُعيد `string`
```json
["str/capitalize", "hello"] // => "Hello"
```

### `str/titleCase`
**حالة العنوان** · وسيط واحد · يُعيد `string`
```json
["str/titleCase", "hello world"] // => "Hello World"
```

### `str/camelCase`
**حالة الجمل** · وسيط واحد · يُعيد `string`
```json
["str/camelCase", "hello world"] // => "helloWorld"
```

### `str/kebabCase`
**حالة الشرطة** · وسيط واحد · يُعيد `string`
```json
["str/kebabCase", "Hello World"] // => "hello-world"
```

### `str/snakeCase`
**حالة الشرطة السفلية** · وسيط واحد · يُعيد `string`
```json
["str/snakeCase", "Hello World"] // => "hello_world"
```

### `str/default`
**القيمة الافتراضية** · وسيطان · يُعيد `string`

يُعيد الافتراضي إذا كانت القيمة null/undefined/فارغة
```json
["str/default", null, "N/A"] // => "N/A"
```

### `str/template`
**قالب** · وسيطان · يُعيد `string`

استبدال المتغيرات في نص القالب

```json
["str/template", "Hello, {name}!", {"name": "World"}] // => "Hello, World!"
```

### `str/truncate`
**اقتطاع مع لاحقة** · 2-3 وسائط · يُعيد `string`

| المعامل | النوع | الوصف |
|---------|-------|-------|
| `s` | `string` | النص |
| `len` | `number` | الطول الأقصى |
| `suffix` | `string` | لاحقة للنصوص المقتطعة |

```json
["str/truncate", "Hello World", 8, "..."] // => "Hello..."
```
