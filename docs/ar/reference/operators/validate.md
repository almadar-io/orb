---
title: "التحقق من المدخلات (validate/*)"
sidebar_label: "التحقق"
---

# التحقق من المدخلات

> **الوحدة:** `validate/*` | **العوامل:** 23

التحقق من مدخلات المستخدم بأنماط شائعة مثل البريد الإلكتروني والمطلوب وفحص الطول.

---

## مرجع العوامل

### `validate/required`
**مطلوب** · وسيط واحد · يُعيد `boolean`

التحقق أن القيمة ليست null أو undefined أو نصاً فارغاً
```json
["validate/required", "@payload.name"]
```

### `validate/string`
**نص** · وسيط واحد · يُعيد `boolean`
```json
["validate/string", "@payload.name"]
```

### `validate/number`
**رقم** · وسيط واحد · يُعيد `boolean`
```json
["validate/number", "@payload.age"]
```

### `validate/boolean`
**منطقي** · وسيط واحد · يُعيد `boolean`
```json
["validate/boolean", "@payload.active"]
```

### `validate/array`
**مصفوفة** · وسيط واحد · يُعيد `boolean`
```json
["validate/array", "@payload.items"]
```

### `validate/object`
**كائن** · وسيط واحد · يُعيد `boolean`
```json
["validate/object", "@payload.data"]
```

### `validate/email`
**بريد إلكتروني** · وسيط واحد · يُعيد `boolean`
```json
["validate/email", "@payload.email"]
```

### `validate/url`
**عنوان URL** · وسيط واحد · يُعيد `boolean`
```json
["validate/url", "@payload.website"]
```

### `validate/uuid`
**معرّف UUID** · وسيط واحد · يُعيد `boolean`
```json
["validate/uuid", "@payload.id"]
```

### `validate/phone`
**رقم هاتف** · وسيط واحد · يُعيد `boolean`
```json
["validate/phone", "@payload.phone"]
```

### `validate/creditCard`
**بطاقة ائتمان** · وسيط واحد · يُعيد `boolean`

التحقق بخوارزمية Luhn
```json
["validate/creditCard", "@payload.cardNumber"]
```

### `validate/date`
**تاريخ** · وسيط واحد · يُعيد `boolean`
```json
["validate/date", "@payload.birthDate"]
```

### `validate/minLength`
**الحد الأدنى للطول** · وسيطان · يُعيد `boolean`
```json
["validate/minLength", "@payload.password", 8]
```

### `validate/maxLength`
**الحد الأقصى للطول** · وسيطان · يُعيد `boolean`
```json
["validate/maxLength", "@payload.name", 50]
```

### `validate/length`
**الطول بالضبط** · وسيطان · يُعيد `boolean`
```json
["validate/length", "@payload.code", 6]
```

### `validate/min`
**الحد الأدنى** · وسيطان · يُعيد `boolean`
```json
["validate/min", "@payload.age", 18]
```

### `validate/max`
**الحد الأقصى** · وسيطان · يُعيد `boolean`
```json
["validate/max", "@payload.quantity", 100]
```

### `validate/range`
**النطاق** · 3 وسائط · يُعيد `boolean`
```json
["validate/range", "@payload.rating", 1, 5]
```

### `validate/pattern`
**نمط** · وسيطان · يُعيد `boolean`

التحقق من مطابقة نمط regex
```json
["validate/pattern", "@payload.code", "^[A-Z]{3}[0-9]{3}$"]
```

### `validate/oneOf`
**واحد من** · وسيطان · يُعيد `boolean`

التحقق أن القيمة في قائمة القيم المسموح بها
```json
["validate/oneOf", "@payload.role", ["admin", "user", "guest"]]
```

### `validate/noneOf`
**ليس أياً من** · وسيطان · يُعيد `boolean`

التحقق أن القيمة ليست في قائمة القيم الممنوعة
```json
["validate/noneOf", "@payload.username", ["admin", "root", "system"]]
```

### `validate/equals`
**مساواة** · وسيطان · يُعيد `boolean`
```json
["validate/equals", "@payload.password", "@payload.confirmPassword"]
```

### `validate/check`
**فحص متعدد** · وسيطان · يُعيد `any`

تشغيل قواعد تحقق متعددة، يُعيد { valid, errors }
```json
["validate/check", "@payload.data", {
  "name": [["required"], ["minLength", 2], ["maxLength", 50]],
  "email": [["required"], ["email"]],
  "age": [["number"], ["min", 18]]
}]
```
