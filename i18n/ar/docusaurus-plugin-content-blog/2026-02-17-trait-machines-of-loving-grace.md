---
slug: trait-machines-of-loving-grace
title: "آلات السمات"
authors: [almadar]
tags: [robotics, ai-safety, state-machines, vision, orbital]
---

# آلات السمات

> *بعد قصيدة ريتشارد بروتيغان، ومع إيماءة لمقال داريو أمودي حول إمكانات الذكاء الاصطناعي.*

---

## ملخص

الأنظمة المستقلة (Autonomous Systems) أصبحت أكثر قدرة — ولكن أصعب في الفهم.

أنظمة التعلم الآلي (Machine Learning Systems) يمكنها اليوم أن ترى، وتصنّف، وتتنبأ، وتحسّن الأداء في مجالات كانت سابقًا تعتمد على البشر فقط. لكن كلما زادت القدرة، تقل غالبًا قابلية التفسير (Interpretability) — أي قدرتنا على فهم لماذا اتخذ النظام قرارًا معينًا.

في البيئات الحساسة للسلامة (Safety-Critical Environments)، هذا يخلق مشكلة خطيرة:  
الأنظمة قد تتصرف أسرع مما يستطيع الإنسان فهم سبب تصرفها.

تقدم هذه المقالة مفهوم **آلات السمات (Trait Machines)** — وهو نموذج لوصف سلوك الأنظمة بطريقة واضحة وقابلة للفحص، دون التخلي عن قوة التعلم الآلي.

آلات السمات تجمع بين:

1. منطق آلة الحالة (State Machine Semantics) — طريقة منظمة لوصف حالات النظام وانتقالاته  
2. حراس قيود حتمية (Deterministic Constraint Guards) — شروط أمان واضحة يجب أن تتحقق قبل التنفيذ  
3. سمات سلوكية تركيبية (Composable Behavioral Traits) — وحدات سلوك يمكن تركيبها معًا بسهولة  
4. تعلم آلي داخل حدود أمان (Machine Learning inside Safety Envelopes)

الفكرة الأساسية بسيطة لكنها قوية:

**المواصفة (Specification) هي النظام نفسه.**

أي أن التعريف المكتوب هو الذي يحدد السلوك، ويتأكد من صحته، ويولد كود التنفيذ أثناء التشغيل.

---

## I. المشكلة التي قبلناها بصمت

الأنظمة الذكية الحديثة مبنية على مقايضة لا نتحدث عنها كثيرًا:

> **كلما أصبح النظام أذكى، أصبح أصعب في الشرح.**

في الماضي، كان هذا مقبولًا لأن الأنظمة كانت صغيرة وتحت سيطرة البشر.

لكن اليوم، الأنظمة المستقلة تدخل العالم الحقيقي:

المستشفيات. الطرق. المنازل. المصانع. المدارس.

في هذه الأماكن، الأداء الجيد وحده لا يكفي.  
يجب أن يكون السلوك مفهومًا **أثناء حدوثه (Real-Time)** — وليس بعد وقوع المشكلة.

اليوم، عند فشل نظام ذكي، غالبًا نقوم بـ:

- إعادة تدريب النموذج (Model Retraining)  
- إضافة بيانات (More Data)  
- تعديل العتبات (Threshold Tuning)  
- ثم نأمل ألا يتكرر الخطأ  

هذا يسمى إصلاح إحصائي (Statistical Recovery)، وليس فهم السبب الحقيقي.

آلات السمات تحاول إعادة التركيز إلى الفهم المنطقي الحتمي (Deterministic Reasoning).

---

## II. أهداف التصميم

تم تصميم آلات السمات لتحقيق خمس نقاط أساسية:

### وضوح السلوك (Behavioral Legibility)
يجب أن نستطيع قراءة سلوك النظام مثل قراءة منطق واضح.

### قابلية التركيب (Composable Semantics)
يمكن بناء النظام من وحدات سلوك صغيرة يمكن اختبارها لوحدها.

### فرض السلامة الحتمية (Deterministic Safety Enforcement)
كل فعل يجب أن يمر عبر شروط أمان واضحة قبل التنفيذ.

### تطابق المواصفة مع التشغيل (Specification–Runtime Equivalence)
ما نكتبه كمواصفة يجب أن يتحول مباشرة إلى سلوك حقيقي أثناء التشغيل.

### التوافق مع التعلم (Learning Compatibility)
نستطيع استخدام التعلم الآلي — لكن داخل حدود واضحة.

---

## III. نموذج آلة السمات (Trait Machine Model)

آلة السمة هي نوع من آلة الحالة المقيدة (Constrained State Machine).

تتكون من خمسة عناصر:

| العنصر | المعنى |
| :--- | :--- |
| الحالات (States) | الوضع الذي يكون فيه النظام |
| الأحداث (Events) | الأشياء التي يمكن أن تحدث |
| الانتقالات (Transitions) | كيف ينتقل النظام بين الحالات |
| الحراس (Guards) | شروط يجب أن تتحقق قبل التنفيذ |
| التأثيرات (Effects) | ماذا يفعل النظام فعليًا |

هذه الفكرة ليست جديدة.  
آلات الحالة موجودة منذ عقود.

الجديد هنا هو طريقة التركيب، وإظهار السلوك بشكل واضح للإنسان.

---

### السمات كعقود قدرة (Capability Contracts)

السمات (Traits) هي وحدات سلوك يمكن ملاحظتها.

يمكنها:

- إضافة قدرة جديدة  
- إضافة قيود أمان  
- تنظيم السلوك  

السلامة هنا ليست طبقة منفصلة.  
بل مكتوبة بنفس لغة السلوك نفسه.

---

### مثال: سمة السلامة

```orbital
trait ObstacleStop -> Robot

@interaction

initial: patrolling

patrolling -- OBSTACLE_DETECTED --> stopped
when (< @payload.distance 0.5)
do (set motors "off")
   (emit STOPPED { reason: "obstacle too close" })

stopped -- CLEAR --> patrolling
do (set motors "on")
```
المثال صغير عمدًا.

الأنظمة الصغيرة أسهل في الفهم.
الأنظمة المفهومة أسهل في التصحيح.
والأنظمة القابلة للتصحيح أكثر أمانًا.

IV. التركيب على مستوى الكيان (Entity Level Composition)

```orbital
orbital InspectionUnit

entity InspectionRobot [runtime]

position : string
scanResult : string

trait Movement -> InspectionRobot
trait Rotation -> InspectionRobot
trait Scanning -> InspectionRobot
trait ZoneEnforcement -> InspectionRobot
```

التركيب هنا مسطح (Flat Composition).

يمكنك رؤية سلوك النظام بالكامل دون تتبع شجرة معقدة من التنفيذ.
وهذا مهم للتدقيق (Auditability).

V. التعلم داخل القيود (Learning Inside Constraints)

آلات السمات لا تلغي التعلم الآلي.
بل تضعه داخل حدود واضحة.

خطوات التنفيذ:

النموذج يقترح فعلًا

النظام يحسب إشارات التحقق

الحراس (Guards) يقررون السماح أو الرفض

يتم تنفيذ الأفعال المسموح بها فقط

مثال: ملاحة متعلمة لكنها مقيدة

```orbital
trait LearnedNavigation -> Robot

@interaction

initial: idle

idle -- NAVIGATE_TO --> navigating
when (and
      (= @payload.isCollisionFree true)
      (= @payload.speedWithinLimit true)
      (= @payload.avoidsRestricted true))
do (set currentPath @payload.proposedPath)

idle -- NAVIGATE_TO --> idle
when (not (and
           (= @payload.isCollisionFree true)
           (= @payload.speedWithinLimit true)
           (= @payload.avoidsRestricted true)))
do (emit PATH_REJECTED)
```

هنا:

النموذج يتعلم.
لكن الحدود ثابتة وواضحة.

VI. وضوح التشغيل (Runtime Transparency)

النظام ينتج سجلات تنفيذ واضحة (Structured Execution Logs):

```text
14:03:22 State: patrolling
14:03:22 Event: OBSTACLE_DETECTED { distance: 0.3m, type: "person" }
14:03:22 Guard: (< @entity.distance 0.5) → TRUE
14:03:22 Transition: patrolling --> stopping
14:03:22 Effect: (stop motors)
```

كل قرار يمكن تفسيره منطقيًا.

مثال: حارس سلامة في الرعاية الصحية

```orbital
when (and
      (<= @payload.appliedForce @entity.forceTolerance)
      (= @payload.verbalConfirmation true)
      (= @entity.emergencyStopAccessible true))
```

هذا مثال على هندسة سلامة تشغيلية (Operational Safety Engineering)، وليس فلسفة نظرية.

VII. التحقق قبل التشغيل (Static Validation)

يمكن للنظام اكتشاف مشاكل قبل التشغيل (Compile-Time):

حالات لا يمكن الوصول لها

أحداث غير معالجة

أخطاء ربط

حالات توقف (Deadlocks)

هذا ينقل الأخطاء من وقت التشغيل إلى وقت البناء.

VIII. قيود الزمن الحقيقي (Real-Time Constraints)

الحراس يجب أن يكونوا:

حتميين (Deterministic)

سريعَي الحساب

غير معتمدين على حجم النظام الكامل

هذا يسمح بتحليل أسوأ زمن تنفيذ ممكن (Worst-Case Timing Analysis).

التعلم من رفض الحراس

مثال:

PATH_REJECTED → reason: restricted zone violation

هذه البيانات تساعد في تدريب النموذج.

IX. القراءة البشرية (Human Legibility)

الهدف ليس أن يفهمه أي شخص فورًا.

لكن يجب أن يكون:

قابل للفحص من خبراء السلامة

مفهوم لخبراء المجال

قابل للتدقيق من الجهات التنظيمية

قابل للتدريس

X. ما الذي لا تحله آلات السمات

لا تحل:

مشكلة المحاذاة (AI Alignment)

لا تستبدل التعلم الآلي

لا تلغي أخطاء البشر في كتابة المواصفات

لا تستبدل أنظمة الروبوتات الكاملة

هي طبقة مواصفة وسلامة فقط.

XI. المساهمات الأساسية
المواصفة = التنفيذ

نفس المصدر يولد السلوك والتنفيذ.

السلامة والقدرة بنفس اللغة

لا يوجد فصل بين الاثنين.

توسيع دائرة الفهم

يمكن فهم المواصفة خارج مجتمع الطرق الرسمية (Formal Methods).

تمثيل قياسي (Canonical Representation)

```json
{
  "from": "idle",
  "event": "NAVIGATE_TO",
  "to": "navigating",
  "guard": ["and",
    ["=", "@payload.isCollisionFree", true],
    ["=", "@payload.speedWithinLimit", true],
    ["=", "@payload.avoidsRestricted", true]
  ]
}
```

XII. التأثير الاستراتيجي

عندما تدخل الأنظمة الذكية العالم المادي،
فإن وضوح السلوك يصبح بنية تحتية — وليس مجرد توثيق.

XIII. الخاتمة

آلات السمات تقترح فكرة بسيطة:

التعلم يعطي التكيف

السمات تعطي الحدود

المواصفة تعطي التنفيذ

السلوك يبقى مفهومًا

الهدف ليس جعل الأنظمة مثالية.

بل هدف عملي:

الأنظمة التي تعمل مع البشر يجب أن تكون مفهومة أثناء عملها.

ليس بعد الحادث.
بل أثناء التشغيل.
