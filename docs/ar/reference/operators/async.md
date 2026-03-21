---
id: async
title: "العمليات غير المتزامنة (async/*)"
sidebar_label: "غير المتزامن"
---

# العمليات غير المتزامنة

> **الوحدة:** `async/*` | **العوامل:** 8

التحكم في التوقيت مع التأخير والتأجيل وإعادة المحاولة والمهلات.

---

## مرجع العوامل

### `async/delay`
**تأخير** · وسيط واحد · يُعيد `void`

الانتظار لعدد محدد من المللي ثانية
```json
["async/delay", 2000] // انتظار ثانيتين
```

### `async/timeout`
**مهلة** · وسيطان · يُعيد `any`

إضافة مهلة لتأثير
```json
["async/timeout", ["call", "api", "fetchData"], 5000]
```

### `async/debounce`
**تأجيل** · وسيطان · يُعيد `void`

تأجيل حدث (الانتظار لتوقف الأحداث)
```json
["async/debounce", "SEARCH", 300]
```

### `async/throttle`
**تقييد** · وسيطان · يُعيد `void`

تقييد حدث (إرسال مرة واحدة كحد أقصى لكل فترة)
```json
["async/throttle", "SCROLL", 100]
```

### `async/retry`
**إعادة المحاولة** · وسيطان · يُعيد `any`

إعادة محاولة تأثير مع تراجع قابل للتهيئة

| المعامل | النوع | الوصف |
|---------|-------|-------|
| `effect` | `expression` | التأثير لإعادة محاولته |
| `opts` | `object` | { attempts, backoff, baseDelay } |

```json
["async/retry",
  ["call", "api", "fetchData", { "id": "@entity.id" }],
  { "attempts": 3, "backoff": "exponential", "baseDelay": 1000 }]
```

### `async/race`
**سباق** · وسيطان أو أكثر · يُعيد `any`

تنفيذ تأثيرات بالتوازي، إعادة أول من يكتمل
```json
["async/race", ["call", "api1"], ["call", "api2"]]
```

### `async/all`
**الكل** · وسيطان أو أكثر · يُعيد `array`

تنفيذ تأثيرات بالتوازي، انتظار اكتمال الجميع
```json
["async/all", ["call", "api1"], ["call", "api2"]]
```

### `async/sequence`
**تسلسل** · وسيطان أو أكثر · يُعيد `array`

تنفيذ تأثيرات بالتسلسل (واحد تلو الآخر)
```json
["async/sequence", ["call", "validate"], ["call", "save"]]
```
