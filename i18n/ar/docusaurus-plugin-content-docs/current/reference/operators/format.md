---
title: "تنسيق البيانات (format/*)"
sidebar_label: "التنسيق"
---

# تنسيق البيانات

> **الوحدة:** `format/*` | **العوامل:** 9

تنسيق العرض للعملات والأرقام والتواريخ وأحجام الملفات.

---

## مرجع العوامل

### `format/number`
**رقم** · 1-2 وسائط · يُعيد `string`

تنسيق رقم بفواصل حسب اللغة
```json
["format/number", 1234567.89] // => "1,234,567.89"
```

### `format/currency`
**عملة** · 2-3 وسائط · يُعيد `string`

| المعامل | النوع | الوصف |
|---------|-------|-------|
| `n` | `number` | المبلغ |
| `currency` | `string` | رمز العملة (USD، EUR، إلخ.) |
| `locale` | `string` | اللغة |

```json
["format/currency", 1234.56, "USD"] // => "$1,234.56"
```

### `format/percent`
**نسبة مئوية** · 1-2 وسائط · يُعيد `string`
```json
["format/percent", 0.856, 1] // => "85.6%"
```

### `format/bytes`
**بايتات** · وسيط واحد · يُعيد `string`

تنسيق البايتات كحجم مقروء
```json
["format/bytes", 2500000] // => "2.4 MB"
```

### `format/ordinal`
**ترتيبي** · وسيط واحد · يُعيد `string`

تنسيق الرقم كترتيبي (1st، 2nd، 3rd)
```json
["format/ordinal", 42] // => "42nd"
```

### `format/plural`
**جمع** · 3 وسائط · يُعيد `string`

تنسيق العدد مع صيغة المفرد/الجمع

| المعامل | النوع | الوصف |
|---------|-------|-------|
| `n` | `number` | العدد |
| `singular` | `string` | صيغة المفرد |
| `plural` | `string` | صيغة الجمع |

```json
["format/plural", 5, "item", "items"] // => "5 items"
```

### `format/list`
**قائمة** · 1-2 وسائط · يُعيد `string`

تنسيق مصفوفة كقائمة بلغة طبيعية
```json
["format/list", ["Alice", "Bob", "Charlie"], "and"] // => "Alice, Bob, and Charlie"
```

### `format/phone`
**هاتف** · 1-2 وسائط · يُعيد `string`
```json
["format/phone", "5551234567"] // => "(555) 123-4567"
```

### `format/creditCard`
**بطاقة ائتمان** · وسيط واحد · يُعيد `string`

تنسيق بطاقة ائتمان مع أرقام مخفية
```json
["format/creditCard", "4111111111111234"] // => "•••• •••• •••• 1234"
```
