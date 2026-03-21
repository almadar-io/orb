---
id: object
title: "أدوات الكائنات (object/*)"
sidebar_label: "الكائنات"
---

# أدوات الكائنات

> **الوحدة:** `object/*` | **العوامل:** 18

الوصول إلى خصائص الكائنات ومعالجتها بأمان.

---

## مرجع العوامل

### `object/keys`
**المفاتيح** · وسيط واحد · يُعيد `array`
```json
["object/keys", {"a": 1, "b": 2}] // => ["a", "b"]
```

### `object/values`
**القيم** · وسيط واحد · يُعيد `array`
```json
["object/values", {"a": 1, "b": 2}] // => [1, 2]
```

### `object/entries`
**المُدخلات** · وسيط واحد · يُعيد `array`

أزواج [مفتاح، قيمة] كمصفوفة
```json
["object/entries", {"a": 1}] // => [["a", 1]]
```

### `object/fromEntries`
**من المُدخلات** · وسيط واحد · يُعيد `any`

إنشاء كائن من أزواج [مفتاح، قيمة]
```json
["object/fromEntries", [["a", 1], ["b", 2]]] // => {"a": 1, "b": 2}
```

### `object/get`
**الحصول** · 2-3 وسائط · يُعيد `any`

الحصول على قيمة متداخلة بمسار
```json
["object/get", "@user", "profile.name", "Anonymous"]
```

### `object/set`
**تعيين** · 3 وسائط · يُعيد `any`

تعيين قيمة متداخلة بمسار (يُعيد كائناً جديداً)
```json
["object/set", "@user", "profile.name", "John"]
```

### `object/has`
**يحتوي** · وسيطان · يُعيد `boolean`

التحقق إذا كان المسار موجوداً
```json
["object/has", "@user", "profile.name"]
```

### `object/merge`
**دمج** · وسيطان أو أكثر · يُعيد `any`

دمج سطحي للكائنات (الأحدث يفوز)
```json
["object/merge", {"a": 1}, {"b": 2}] // => {"a": 1, "b": 2}
```

### `object/deepMerge`
**دمج عميق** · وسيطان أو أكثر · يُعيد `any`
```json
["object/deepMerge", {"a": {"b": 1}}, {"a": {"c": 2}}]
```

### `object/pick`
**اختيار** · وسيطان · يُعيد `any`

اختيار المفاتيح المحددة فقط
```json
["object/pick", "@entity", ["name", "email"]]
```

### `object/omit`
**استبعاد** · وسيطان · يُعيد `any`

استبعاد المفاتيح المحددة
```json
["object/omit", "@entity", ["password", "secret"]]
```

### `object/mapValues`
**تحويل القيم** · وسيطان · يُعيد `any`
```json
["object/mapValues", "@stats", ["fn", "v", ["*", "@v", 100]]]
```

### `object/mapKeys`
**تحويل المفاتيح** · وسيطان · يُعيد `any`
```json
["object/mapKeys", "@data", ["fn", "k", ["str/upper", "@k"]]]
```

### `object/filter`
**تصفية** · وسيطان · يُعيد `any`

تصفية المُدخلات بشرط
```json
["object/filter", "@data", ["fn", ["k", "v"], ["!=", "@v", null]]]
```

### `object/empty?`
**فارغ؟** · وسيط واحد · يُعيد `boolean`
```json
["object/empty?", {}] // => true
```

### `object/equals`
**مساواة** · وسيطان · يُعيد `boolean`

فحص مساواة عميقة
```json
["object/equals", {"a": 1}, {"a": 1}] // => true
```

### `object/clone`
**نسخ سطحي** · وسيط واحد · يُعيد `any`
```json
["object/clone", "@entity"]
```

### `object/deepClone`
**نسخ عميق** · وسيط واحد · يُعيد `any`
```json
["object/deepClone", "@entity"]
```
