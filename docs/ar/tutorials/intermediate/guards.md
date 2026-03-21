# الحراس وقواعد العمل (Guards)

> المصدر: [`tests/schemas/03-guards.orb`](../../../../tests/schemas/03-guards.orb)

الحراس (Guards) هي شروط يجب أن تكون صحيحة ليُنفَّذ الانتقال (Transition). تعمل كحراس بوابة لقواعد عملك، تُكتب مرة واحدة وتُنفَّذ في كل مكان، سواء في الواجهة أو في واجهة البرمجة.

<OrbitalDiagram />

---

## ما هو الحارس (Guard)؟

الحارس هو تعبير S-expression على الانتقال. إذا قُيِّم إلى `false`، يُحظر الانتقال:

```json
{
  "from": "active",
  "event": "WITHDRAW",
  "to": "active",
  "guard": [">=", "@entity.balance", "@payload.amount"],
  "effects": [...]
}
```

المستخدم يمكنه السحب فقط إذا كان `balance >= amount`. إذا لم يتحقق الشرط، يُحظر الانتقال بصمت (الواجهة يمكن أن تعرض حالة معطلة أو رسالة خطأ).

---

## صيغة تعبيرات S-Expression

الحراس تُكتب كمصفوفات متداخلة حيث العنصر الأول هو العامل:

```
[operator, arg1, arg2, ...]
```

الوسائط يمكن أن تكون:
- **ثوابت:** `100`، `"active"`، `true`
- **ربط:** `"@entity.field"`، `"@payload.field"`، `"@state"`، `"@now"`
- **تعبيرات متداخلة:** `["+", "@entity.count", 1]`

---

## عوامل المقارنة

| العامل | المعنى | مثال |
|--------|--------|------|
| `=` | يساوي | `["=", "@entity.status", "active"]` |
| `!=` | لا يساوي | `["!=", "@entity.role", "guest"]` |
| `>` | أكبر من | `[">", "@entity.score", 0]` |
| `>=` | أكبر أو يساوي | `[">=", "@entity.balance", "@payload.amount"]` |
| `<` | أصغر من | `["<", "@entity.attempts", 3]` |
| `<=` | أصغر أو يساوي | `["<=", "@entity.age", 65]` |

---

## العوامل المنطقية

دمج الشروط مع `and` و`or` و`not`:

```json
["and",
  [">=", "@entity.balance", "@payload.amount"],
  ["=", "@entity.isVerified", true]
]
```

```json
["or",
  ["=", "@entity.role", "admin"],
  ["=", "@entity.role", "manager"]
]
```

```json
["not", ["=", "@entity.status", "frozen"]]
```

---

## الحراس مع القيم المحسوبة

الحراس يمكن أن تستخدم عوامل حسابية. نتيجة التعبير المتداخل تُستخدم كوسيط:

```json
// السماح فقط إذا بقي الرصيد بعد السحب فوق الحد الأدنى
[">=",
  ["-", "@entity.balance", "@payload.amount"],
  100
]
```

```json
// السماح فقط إذا كان عدد العناصر ضمن الحد
["<",
  ["+", "@entity.itemCount", 1],
  50
]
```

---

## أنماط الحراس الشائعة

### الوصول المبني على الأدوار

```json
// المديرون فقط يمكنهم الحذف
{
  "from": "listing",
  "event": "DELETE",
  "to": "listing",
  "guard": ["=", "@currentUser.role", "admin"],
  "effects": [["persist", "delete", "Task", "@entity.id"]]
}
```

### فحص الملكية

```json
// المُسنَد إليه فقط يمكنه بدء المهمة
{
  "from": "Pending",
  "event": "START",
  "to": "InProgress",
  "guard": ["=", "@entity.assigneeId", "@currentUser.id"],
  "effects": [["persist", "update", "Task", "@entity"]]
}
```

### التحقق من الحقول

```json
// الدرجة يجب أن تكون بين 0 و100
{
  "guard": ["and",
    [">=", "@payload.score", 0],
    ["<=", "@payload.score", 100]
  ]
}
```

---

## الحراس مقابل التأثيرات

الحراس تُنفَّذ **قبل** الانتقال. التأثيرات (Effects) تُنفَّذ **بعده**. لا تستخدم التأثيرات لإنفاذ قواعد العمل. هذا ما تفعله الحراس.

```json
// ❌ خطأ: استخدام التأثيرات لمحاكاة حارس
"effects": [
  ["if", ["<", "@entity.balance", 0], ["notify", "error", "Insufficient funds"]]
]

// ✅ صحيح: الحارس يحظر الانتقال بالكامل
"guard": [">=", "@entity.balance", "@payload.amount"]
```

---

## الخطوات التالية

- [التواصل عبر الوحدات المدارية](./cross-orbital.md) - الحراس يمكنها الإشارة إلى بيانات من وحدات مدارية أخرى
- [أنماط الواجهة وrender-ui](./ui-patterns.md) - عرض ردود فعل عندما تحظر الحراس الإجراءات
- [بناء تطبيق كامل](../advanced/full-app.md) - الحراس في تطبيق متعدد الوحدات المدارية
