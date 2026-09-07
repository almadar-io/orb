---
title: "عمليات المجموعات (array/*)"
sidebar_label: "المصفوفات"
---

# عمليات المجموعات

> **الوحدة:** `array/*` | **العوامل:** 39

العمل مع القوائم والمصفوفات بما في ذلك التصفية والتحويل والتجميع.

---

## مرجع العوامل

### `array/len`
**الطول** · وسيط واحد · يُعيد `number`
```json
["array/len", [1, 2, 3]] // => 3
```

### `array/empty?`
**فارغة؟** · وسيط واحد · يُعيد `boolean`
```json
["array/empty?", []] // => true
```

### `array/first`
**الأول** · وسيط واحد · يُعيد `any`
```json
["array/first", [1, 2, 3]] // => 1
```

### `array/last`
**الأخير** · وسيط واحد · يُعيد `any`
```json
["array/last", [1, 2, 3]] // => 3
```

### `array/nth`
**العنصر رقم N** · وسيطان · يُعيد `any`
```json
["array/nth", [1, 2, 3], 1] // => 2
```

### `array/slice`
**اقتطاع** · 2-3 وسائط · يُعيد `array`
```json
["array/slice", [1, 2, 3, 4], 1, 3] // => [2, 3]
```

### `array/concat`
**دمج** · وسيطان أو أكثر · يُعيد `array`
```json
["array/concat", [1, 2], [3, 4]] // => [1, 2, 3, 4]
```

### `array/append`
**إلحاق** · وسيطان · يُعيد `array`

إضافة عنصر في النهاية (يُعيد مصفوفة جديدة)
```json
["array/append", [1, 2], 3] // => [1, 2, 3]
```

### `array/prepend`
**إضافة في البداية** · وسيطان · يُعيد `array`
```json
["array/prepend", [2, 3], 1] // => [1, 2, 3]
```

### `array/insert`
**إدراج** · 3 وسائط · يُعيد `array`
```json
["array/insert", [1, 3], 1, 2] // => [1, 2, 3]
```

### `array/remove`
**إزالة بالموقع** · وسيطان · يُعيد `array`
```json
["array/remove", [1, 2, 3], 1] // => [1, 3]
```

### `array/removeItem`
**إزالة عنصر** · وسيطان · يُعيد `array`

إزالة أول تواجد مطابق
```json
["array/removeItem", [1, 2, 3, 2], 2] // => [1, 3, 2]
```

### `array/reverse`
**عكس** · وسيط واحد · يُعيد `array`
```json
["array/reverse", [1, 2, 3]] // => [3, 2, 1]
```

### `array/sort`
**ترتيب** · 1-3 وسائط · يُعيد `array`

| المعامل | النوع | الوصف |
|---------|-------|-------|
| `arr` | `array` | المصفوفة |
| `key` | `string` | الحقل للترتيب به (للكائنات) |
| `dir` | `string` | "asc" أو "desc" |

```json
["array/sort", "@items", "price", "desc"]
```

### `array/shuffle`
**خلط** · وسيط واحد · يُعيد `array`
```json
["array/shuffle", [1, 2, 3, 4, 5]]
```

### `array/unique`
**إزالة المكررات** · وسيط واحد · يُعيد `array`
```json
["array/unique", [1, 2, 2, 3, 1]] // => [1, 2, 3]
```

### `array/flatten`
**تسطيح** · وسيط واحد · يُعيد `array`

تسطيح المصفوفات المتداخلة بمستوى واحد
```json
["array/flatten", [[1, 2], [3, 4]]] // => [1, 2, 3, 4]
```

### `array/zip`
**ربط** · وسيطان · يُعيد `array`

ربط عناصر من مصفوفتين
```json
["array/zip", [1, 2], ["a", "b"]] // => [[1, "a"], [2, "b"]]
```

### `array/includes`
**يحتوي** · وسيطان · يُعيد `boolean`
```json
["array/includes", [1, 2, 3], 2] // => true
```

### `array/indexOf`
**موقع العنصر** · وسيطان · يُعيد `number`

(-1 إذا لم يُوجد)
```json
["array/indexOf", [1, 2, 3], 2] // => 1
```

### `array/find`
**بحث** · وسيطان · يُعيد `any`

البحث عن أول عنصر مطابق لشرط
```json
["array/find", "@items", ["fn", "x", ["=", "@x.status", "active"]]]
```

### `array/findIndex`
**موقع البحث** · وسيطان · يُعيد `number`
```json
["array/findIndex", "@items", ["fn", "x", ["=", "@x.status", "active"]]]
```

### `array/filter`
**تصفية** · وسيطان · يُعيد `array`

الاحتفاظ بالعناصر المطابقة لشرط
```json
["array/filter", "@items", ["fn", "x", [">", "@x.price", 100]]]
```

### `array/reject`
**رفض** · وسيطان · يُعيد `array`

إزالة العناصر المطابقة لشرط
```json
["array/reject", "@items", ["fn", "x", ["=", "@x.status", "deleted"]]]
```

### `array/map`
**تحويل** · وسيطان · يُعيد `array`

تحويل كل عنصر
```json
["array/map", "@items", ["fn", "x", ["*", "@x.price", 1.1]]]
```

### `array/reduce`
**تقليص** · 3 وسائط · يُعيد `any`

تقليص المصفوفة إلى قيمة واحدة
```json
["array/reduce", "@items", ["fn", ["acc", "x"], ["+", "@acc", "@x.price"]], 0]
```

### `array/every`
**كل** · وسيطان · يُعيد `boolean`

التحقق إذا كانت جميع العناصر تطابق الشرط
```json
["array/every", "@items", ["fn", "x", [">", "@x.price", 0]]]
```

### `array/some`
**بعض** · وسيطان · يُعيد `boolean`

التحقق إذا كان أي عنصر يطابق الشرط
```json
["array/some", "@items", ["fn", "x", ["=", "@x.status", "active"]]]
```

### `array/count`
**عدّ** · 1-2 وسائط · يُعيد `number`

عدّ العناصر (اختيارياً المطابقة لشرط)
```json
["array/count", "@tasks", ["fn", "t", ["=", "@t.status", "done"]]]
```

### `array/sum`
**مجموع** · 1-2 وسائط · يُعيد `number`
```json
["array/sum", "@cart.items", "price"]
```

### `array/avg`
**متوسط** · 1-2 وسائط · يُعيد `number`
```json
["array/avg", "@ratings", "score"]
```

### `array/min`
**الحد الأدنى** · 1-2 وسائط · يُعيد `number`
```json
["array/min", "@products", "price"]
```

### `array/max`
**الحد الأقصى** · 1-2 وسائط · يُعيد `number`
```json
["array/max", "@products", "price"]
```

### `array/groupBy`
**تجميع** · وسيطان · يُعيد `any`

تجميع العناصر حسب قيمة حقل
```json
["array/groupBy", "@orders", "status"]
```

### `array/partition`
**تقسيم** · وسيطان · يُعيد `array`

تقسيم المصفوفة بشرط إلى [المطابقة، غير المطابقة]
```json
["array/partition", "@items", ["fn", "x", [">", "@x.price", 50]]]
```

### `array/take`
**أخذ** · وسيطان · يُعيد `array`

أخذ أول n عنصر
```json
["array/take", "@items", 5]
```

### `array/drop`
**تخطي** · وسيطان · يُعيد `array`

تخطي أول n عنصر
```json
["array/drop", "@items", 5]
```

### `array/takeLast`
**أخذ الأخيرة** · وسيطان · يُعيد `array`
```json
["array/takeLast", "@items", 3]
```

### `array/dropLast`
**تخطي الأخيرة** · وسيطان · يُعيد `array`
```json
["array/dropLast", "@items", 2]
```
