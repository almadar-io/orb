---
slug: json-that-thinks
title: "JSON يُفكّر: كيف بنينا لغة Turing-complete داخل JSON"
authors: [osamah]
tags: [language-design, architecture]
---

ماذا لو استطاع JSON التعبير عن المنطق، لا البيانات فقط؟ ماذا لو كانت ملفات الإعداد الخاصة بك تستطيع اتخاذ القرارات؟

بنينا لغة برمجة Turing-complete (قادرة على محاكاة أي حساب) هي مجموعة فرعية صارمة من JSON. لا صياغة جديدة. لا محلل مخصص. كل برنامج من Almadar هو JSON صالح.

إليك لماذا — وكيف.

<!-- truncate -->

## مشكلة لغات الإعداد

تدور الصناعة حول هذه المشكلة منذ عقود:

- **YAML** — رائعة للبيانات، كارثية للمنطق. تؤدي إلى كوابيس القوالب (ننظر إليك، Helm charts).
- **HCL (Terraform)** — اخترعت صياغة جديدة. الآن تحتاج محللًا، و LSP، وإضافات محرر، وتدريبًا.
- **Dhall** — مبدئية لكن متخصصة. قلة من المطورين يعرفون بوجودها.
- **Jsonnet/CUE** — تشبه JSON لكنها ليست JSON. قريبة، لكنها تكسر توافق الأدوات.

الـ pattern (النمط المتكرر): كل مرة يحتاج شخص منطقًا في الإعداد، يخترع لغة جديدة. محلل جديد. أدوات جديدة. منحنى تعلم جديد.

سألنا: **ماذا لو لم نفعل ذلك؟**

## البصيرة: الـ S-expressions (تعبيرات رمزية — قوائم بدالة في أولها) هي بالفعل JSON

في عام 1958، اخترع جون مكارثي الـ S-expressions لـ Lisp:

```lisp
(+ 1 2)
(if (> x 10) "big" "small")
```

الـ S-expressions هي مجرد قوائم متداخلة مع دالة في الموضع الأول.

مصفوفات JSON هي... قوائم متداخلة.

```json
["+", 1, 2]
["if", [">", "x", 10], "big", "small"]
```

**الـ S-expressions *هي* مصفوفات JSON.** لم نكن بحاجة لاختراع صياغة. كنا بحاجة لتفسير ما كان موجودًا بالفعل.

## كيف يعمل Almadar

يعتبر برنامج Almadar كائن JSON يحتوي على entities (كيانات — نماذج البيانات)، و state machines (أنظمة تدير السلوك عبر حالات وانتقالات)، ومنطق مُعبَّر عنه بـ S-expressions:

```json
{
  "name": "ApprovalWorkflow",
  "orbitals": [{
    "entity": {
      "name": "Request",
      "fields": [
        { "name": "amount", "type": "number" },
        { "name": "status", "type": "enum", "values": ["pending", "approved", "rejected"] }
      ]
    },
    "traits": [{
      "name": "ApprovalTrait",
      "linkedEntity": "Request",
      "stateMachine": {
        "states": [
          { "name": "Pending", "isInitial": true },
          { "name": "Approved" },
          { "name": "Rejected" }
        ],
        "transitions": [{
          "from": "Pending",
          "to": "Approved",
          "event": "APPROVE",
          "guard": ["and",
            [">=", "@user.roleLevel", 3],
            ["<", "@entity.amount", 10000]
          ],
          "effects": [
            ["set", "@entity.status", "approved"],
            ["set", "@entity.approvedAt", "@now"],
            ["emit", "REQUEST_APPROVED"]
          ]
        }]
      }
    }]
  }]
}
```

يعتبر المنطق (الـ guard، الـ effects) S-expressions صرفة. وتعتبر البنية (الـ entities، الحالات، الـ transitions) JSON صرف. معًا، يُشكّلان برنامجًا كاملًا.

## لماذا هذا مهم: الـ homoiconicity

تعتبر الـ homoiconicity (التماثل الأيقوني — الكود والبيانات يتشاركان نفس التمثيل) القوة الخارقة لـ Lisp، والآن هي قوة JSON.

لأن برامج Almadar هي JSON:

**1. كل أداة JSON تعمل على برامج Almadar.**

```bash
# Validate with any JSON validator
cat app.orb | python -m json.tool

# Query with jq
jq '.orbitals[].traits[].stateMachine.states' app.orb

# Diff two schemas
diff <(jq -S . v1.orb) <(jq -S . v2.orb)
```

**2. الذكاء الاصطناعي يستطيع توليد البرامج وتعديلها.**

تعتبر نماذج اللغة الكبيرة (LLMs) ممتازة في توليد JSON مُهيكل، وسيئة في توليد صياغة صحيحة في لغات جديدة. بالبقاء في JSON، يمكن لأي نموذج يستطيع إنتاج JSON صالح — وهو كلها — توليد برامج Almadar بسهولة.

**3. البرامج هي بيانات يمكنك تحويلها.**

هل تريد إضافة تسجيل مراجعة لكل transition؟ اكتب تحويل JSON:

```javascript
schema.orbitals.forEach(orbital =>
  orbital.traits.forEach(trait =>
    trait.stateMachine.transitions.forEach(t => {
      t.effects.push(["log", "info", `Transition: ${t.from} → ${t.to}`]);
    })
  )
);
```

لا تحليل AST (شجرة صياغة مجردة). لا إضافات compiler. مجرد معالجة بيانات.

## حجة الـ Turing-completeness

تكون اللغة Turing-complete إذا استطاعت محاكاة أي حساب. Almadar يحقق ذلك من خلال:

1. **الـ state machines** — حالة عشوائية، transitions، وذاكرة (حقول الـ entity)
2. **guards بـ S-expressions** — منطق بولياني مع تداخل عشوائي (`and`، `or`، `not`، عوامل المقارنة)
3. **effects بـ S-expressions** — side effects تشمل `set` (كتابة الذاكرة)، `emit` (الاتصال)، و `if` (التفرع)
4. **أحداث عبر الـ orbitals (وحدات بنائية تجمع entity + traits + pages)** — اتصال بين العمليات (emit/listen)
5. **التكرار عبر الـ self-loops (حلقات ذاتية — transition من حالة إلى نفسها)** — يمكن للحالة أن تنتقل إلى نفسها مع تعديل حقول الـ entity

self-loop مع effects شرطية وتحديثات حقول الـ entity تعادل حلقة while مع حالة قابلة للتغيير:

```json
{
  "from": "Computing",
  "to": "Computing",
  "event": "TICK",
  "guard": [">", "@entity.counter", 0],
  "effects": [
    ["set", "@entity.counter", ["-", "@entity.counter", 1]],
    ["set", "@entity.result", ["+", "@entity.result", "@entity.counter"]],
    ["emit", "TICK"]
  ]
}
```

يحسب هذا مجموع الأرقام من N إلى 0. تمثل الـ state machine الحلقة. والـ entity الذاكرة. والـ guard شرط الإنهاء.

## المقارنة: مشهد لغات الإعداد

| اللغة | متوافقة مع JSON | دعم المنطق | Turing-complete | الأدوات |
|----------|----------------|---------------|-----------------|---------|
| JSON | نعم | لا | لا | عالمية |
| YAML | لا | لا | لا | واسعة |
| Jsonnet | جزئيًا | نعم | نعم | محدودة |
| Dhall | لا | نعم | لا (عمدًا) | ضئيلة |
| CUE | جزئيًا | نعم | لا (عمدًا) | متنامية |
| HCL | لا | محدود | لا | Terraform |
| **Almadar** | **نعم** | **نعم** | **نعم** | **عالمية (JSON)** |

تعد Almadar اللغة الوحيدة الـ Turing-complete التي هي مجموعة فرعية صارمة من JSON. هذا يعني أن كل أداة JSON، وكل واجهة JSON برمجية، وكل قاعدة بيانات JSON، وكل نموذج لغوي كبير يفهم JSON يعمل مع برامج Almadar فورًا.

## كيف تُنفَّذ الـ S-expressions

يقيم الـ compiler في Almadar الـ S-expressions بشكل تكراري:

```
["and",
  [">=", "@user.roleLevel", 3],
  ["<", "@entity.amount", 10000]
]
```

**خطوات التقييم:**

1. حل الـ bindings (روابط — مراجع مثل `@entity.field` تُستبدل بقيمها): `@user.roleLevel` → `5`، `@entity.amount` → `7500`
2. تقييم التعبيرات الداخلية: `[">=", 5, 3]` → `true`، `["<", 7500, 10000]` → `true`
3. تقييم التعبير الخارجي: `["and", true, true]` → `true`

يحسن الـ compiler تقييمات الـ guards المتكررة داخليًا — وهو شائع في واجهات المستخدم حيث يُتحقق من نفس الشروط في كل عرض — لذا التقييم سريع حتى للتعبيرات المعقدة.

## التوسع بدون تعيين إصدارات

لا تتطلب إضافة عوامل جديدة إلى Almadar تحديث إصدار الـ schema:

```json
["geo-distance", "@entity.location", "@payload.target"]
```

إذا عرف المُقيّم `geo-distance`، قيّمه. إن لم يعرفه، يُرجع خطأ برسالة واضحة. لا تكسر العوامل الجديدة البرامج الموجودة أبدًا لأنها **إضافية**.

هذا هو نفس نموذج التوسع الذي جعل Lisp تبقى لمدة 65 عامًا.

## المقايضة: الإسهاب

لنكن صريحين. الـ S-expressions في JSON أكثر إسهابًا مما ستكون عليه صياغة مخصصة:

```
-- Hypothetical custom syntax
guard: user.roleLevel >= 3 and entity.amount < 10000

-- Almadar (actual)
"guard": ["and", [">=", "@user.roleLevel", 3], ["<", "@entity.amount", 10000]]
```

الصياغة المخصصة 50 حرفًا. نسخة Almadar عبارة عن 75. هذا ~50% أكثر حروفًا.

نعتقد أن هذه المقايضة تستحق لأن:
- لن تحتاج أبدًا لمحلل مخصص
- لن تحتاج أبدًا لـ LSP مخصص
- لن تحتاج أبدًا لتعليم فريقك صياغة جديدة
- يولّدها الذكاء الاصطناعي بشكل صحيح من المحاولة الأولى
- كل أداة JSON في الوجود تعمل على برامجك

الإسهاب تكلفة لمرة واحدة. توافق الأدوات إلى الأبد.

## الخلاصة

كل عقد، يخترع شخص لغة إعداد جديدة لحل مشكلة "المنطق في الإعداد". كل واحدة تضيف محللًا ومنحنى تعلم ومنظومة لصيانتها.

يسلك Almadar طريقًا مختلفًا: **لا صياغة جديدة**. مجرد مصفوفات JSON تُفسَّر كـ S-expressions، مُدمجة مع state machines لتدفق التحكم و entities للذاكرة.

النتيجة هي لغة Turing-complete:
- تفهمها كل أداة JSON
- يستطيع كل نموذج لغوي كبير توليدها
- يستطيع كل مطور قراءتها (إنها مجرد مصفوفات)
- تُصرَّف إلى TypeScript و Rust و Python

لأن أفضل صياغة قد تكون تلك التي تعرفها بالفعل.

استكشف [الـ standard library للـ S-expressions](https://orb.almadar.io/docs/stdlib) لرؤية جميع العوامل المتاحة.
