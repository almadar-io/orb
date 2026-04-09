---
slug: s-expressions-json-functional
title: "S-Expressions: صيغة JSON للبرمجة الوظيفية (التي تكون منطقية فعلاً)"
image: /img/blog/s-expressions-json-functional.png
authors: [osamah]
tags: [architecture]
---

![S-Expressions وJSON والنهضة الوظيفية](/img/blog/s-expressions-json-functional.png)

لماذا اخترنا S-expressions (تعبيرات رمزية بأسلوب Lisp) بدلاً من JSON لتعريف المنطق، ولماذا قد تفعل ذلك أيضاً.

الجميع يحب JSON، لكن عندما تحتاج منطقاً، ينتهي بك المطاف بقوالب نصية أو JavaScript. ماذا لو كانت صيغة البيانات *هي* صيغة المنطق؟

<!-- truncate -->

## قيود JSON

JSON ممتاز للبيانات:

```json
{
  "name": "John",
  "age": 30,
  "hobbies": ["coding", "reading"]
}
```

لكن ماذا عن المنطق؟ لديك عدة خيارات:

### الخيار 1: قوالب نصية
```json
{
  "condition": "user.age >= 18 && user.verified"
}
```
- عُرضة للأخطاء (أخطاء مطبعية في النصوص)
- بدون تحقق
- خطر الحقن

### الخيار 2: لغة مخصصة
```json
{
  "condition": {
    "and": [
      { "gte": ["user.age", 18] },
      { "eq": ["user.verified", true] }
    ]
  }
}
```
- مُهيكل
- مُطوَّل
- صعب القراءة

### الخيار 3: دوال JavaScript
```javascript
const condition = (user) => user.age >= 18 && user.verified;
```
- سهل القراءة
- غير قابل للتسلسل
- خطر أمني (eval)

## ادخل عالم الـ S-Expressions

الـ S-expressions (تعبيرات رمزية موجودة منذ 1958 مع Lisp) بسيطة للغاية:

```
(operator operand1 operand2 ...)
```

بصيغة متوافقة مع JSON:

```json
["operator", "operand1", "operand2", ...]
```

## الـ S-Expressions في Almadar

يستخدم Almadar الـ S-expressions للـ guards (شروط تتحقق قبل السماح بالانتقال) والـ effects (تغييرات تحدث بعد الـ transition):

### الـ Guards: المنطق الشرطي

```json
{
  "from": "pending",
  "to": "approved",
  "event": "APPROVE",
  "guard": ["and",
    [">=", "@user.roleLevel", 5],
    ["not", "@entity.isFlagged"],
    [">", "@entity.amount", 0]
  ]
}
```

هذا يعادل:
```javascript
if (user.roleLevel >= 5 && !entity.isFlagged && entity.amount > 0) {
  // Allow transition
}
```

لكنه:
- قابل للتسلسل
- قابل للتحقق
- آمن (بدون eval)
- متعدد المنصات

### الـ Effects: تغييرات الحالة

```json
{
  "effects": [
    ["set", "@entity.status", "approved"],
    ["set", "@entity.approvedAt", "@now"],
    ["set", "@entity.approvedBy", "@user.id"],
    ["persist", "update", "Order", "@entity.id", "@entity"]
  ]
}
```

كل effect عبارة عن S-expression:
- `["set", target, value]` — تعيين قيمة
- `["persist", operation, entity, id, data]` — حفظ في قاعدة البيانات
- `["emit", event, payload]` — إرسال حدث

## لماذا هذا مهم

### 1. الـ Homoiconicity (التماثل بين الكود والبيانات)

الـ S-expressions عبارة عن بيانات تبدو كالكود. هذا يعني:

```json
["+", "@entity.count", 1]
```

هي في الوقت ذاته:
- هيكل بيانات (مصفوفة من نصوص)
- كود قابل للتنفيذ (أضف 1 إلى العداد)

### 2. قابلية التركيب

يمكنك تضمين الـ S-expressions بلا حدود:

```json
["if",
  ["and",
    [">", "@entity.score", 100],
    ["=", "@entity.status", "active"]
  ],
  ["emit", "ACHIEVEMENT_UNLOCKED", { "level": "gold" }],
  ["emit", "ACHIEVEMENT_PROGRESS", { "needed": ["-", 100, "@entity.score"] }]
]
```

### 3. التسلسل

لأن الـ S-expressions مجرد مصفوفات، فإنها تُسلسَل بشكل مثالي:

```javascript
// JavaScript
const guard = [">=", "@user.age", 18];
JSON.stringify(guard); // '[">=","@user.age",18]'
```

```python
# Python
guard = [">=", "@user.age", 18]
json.dumps(guard)  # '[">=","@user.age",18]'
```

```rust
// Rust
let guard = json!( [">=", "@user.age", 18] );
serde_json::to_string(&guard).unwrap();
```

## سياق الـ Binding

تستخدم الـ S-expressions في Almadar بادئات خاصة للسياق:

| البادئة | المعنى | مثال |
|---------|--------|------|
| `@entity.field` | حقل الـ entity الحالي | `"@entity.status"` |
| `@payload.field` | حمولة الحدث | `"@payload.userId"` |
| `@state` | اسم حالة الـ state machine الحالية | `"@state"` (مثلاً `"Browsing"`) |
| `@user.field` | المستخدم الحالي | `"@user.id"` |
| `@now` | الطابع الزمني الحالي | `"@now"` |

هذا يُنشئ **نظام binding (ربط تصريحي)**:

```json
{
  "guard": ["=", "@entity.ownerId", "@user.id"],
  "effects": [
    ["set", "@entity.updatedAt", "@now"],
    ["set", "@entity.updatedBy", "@user.id"]
  ]
}
```

## تشبيه واقعي: صيغ Excel

إذا استخدمت Excel، فقد استخدمت S-expressions:

```excel
=IF(AND(A1>100, B1="active"), "Gold", "Silver")
```

في Almadar:
```json
["if",
  ["and", [">", "@entity.score", 100], ["=", "@entity.status", "active"]],
  "Gold",
  "Silver"
]
```

صيغ Excel هي S-expressions. وهي:
- تصريحية (تقول ماذا، لا كيف)
- قابلة للتركيب (دوال تستدعي دوالاً)
- آمنة (لا تنفيذ كود عشوائي)

## المعاملات القياسية

تتضمن الـ standard library (المكتبة القياسية) في Almadar:

### المقارنة
```json
["=", "a", "b"]        // المساواة
["!=", "a", "b"]       // عدم المساواة
[">", "a", "b"]        // أكبر من
[">=", "a", "b"]       // أكبر من أو يساوي
```

### المنطق
```json
["and", "a", "b", "c"] // الكل يجب أن يكون صحيحاً
["or", "a", "b", "c"]  // واحد على الأقل صحيح
["not", "a"]           // النفي
```

### الرياضيات
```json
["+", "a", "b", "c"]   // المجموع
["-", "a", "b"]        // الفرق
["*", "a", "b"]        // الضرب
["/", "a", "b"]        // القسمة
```

### المصفوفات
```json
["count", "@array"]    // طول المصفوفة
["contains", "@array", "item"]  // التحقق من العضوية
["filter", "@array", ["predicate"]]
```

### النصوص
```json
["concat", "a", "b"]   // الدمج
["length", "str"]      // طول النص
["matches", "str", "regex"]
```

## جربه: ابنِ guard

لننشئ guard لسير عمل الموافقة:

```json
{
  "from": "pending",
  "to": "approved",
  "event": "APPROVE",
  "guard": ["and",
    ["or",
      [">=", "@user.roleLevel", 5],
      ["=", "@user.id", "@entity.ownerId"]
    ],
    ["not", "@entity.isLocked"],
    [">", "@entity.amount", 0],
    ["<", "@entity.amount", 10000]
  ]
}
```

هذا يُترجم إلى:
```javascript
if (
  (user.roleLevel >= 5 || user.id === entity.ownerId) &&
  !entity.isLocked &&
  entity.amount > 0 &&
  entity.amount < 10000
) {
  // Allow approval
}
```

لكن مع:
- صياغة تصريحية
- تحقق تلقائي
- لا خطر لحقن الكود
- قابل للتسلسل لسجلات التدقيق

## الخلاصة

الـ S-expressions ليست مجرد فضول من Lisp — إنها حل عملي لسؤال "كيف نضع المنطق في JSON؟"

تمنحك:
- **قوة الكود** (قابلية التركيب، التعبيرية)
- **أمان البيانات** (التسلسل، التحقق، بدون eval)
- **وضوح Excel** (تصريحية، سهلة القراءة)

في المرة القادمة التي يغزوك فيها إغراء استخدام `eval()` أو القوالب النصية للمنطق الديناميكي، تذكّر: هناك حل عمره 60 عاماً يعمل بالفعل.

تريد استكشاف المزيد؟ اطّلع على [معاملات الـ standard library](https://orb.almadar.io/playground).
