---
slug: fsm-underused-pattern
title: "Finite State Machines: الـ pattern الأقل استخداماً في تطوير الواجهات الأمامية"
authors: [osamah]
tags: [architecture, state-machines]
---

إذا كنت تستخدم `useState` لواجهات معقدة، فأنت على الأرجح تقوم بذلك بشكل خاطئ. هناك حل عمره 50 عاماً تتجاهله.

<!-- truncate -->

## فخ الأعلام المنطقية

إليك pattern (نمط تصميم متكرر) مألوفاً:

```typescript
function UserProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setIsError(false);
    try {
      await saveUser(user);
      setIsEditing(false);
    } catch (e) {
      setIsError(true);
      setErrorMessage(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // What combinations are valid?
  // isLoading=true, isError=true?
  // isEditing=true, isSaving=true?
  // Who knows!
}
```

هذا يخلق **2^n حالة ممكنة** (32 تركيبة لـ 5 أعلام منطقية). معظمها غير صالح أو بلا معنى.

## بديل الـ State Machine

ماذا لو عرّفت الحالات الصالحة بشكل صريح؟

```json
{
  "states": [
    { "name": "idle", "isInitial": true },
    { "name": "loading" },
    { "name": "editing" },
    { "name": "saving" },
    { "name": "error" }
  ],
  "events": ["FETCH", "EDIT", "SAVE", "SUCCESS", "ERROR", "CANCEL"],
  "transitions": [
    { "from": "idle", "to": "loading", "event": "FETCH" },
    { "from": "loading", "to": "idle", "event": "SUCCESS" },
    { "from": "loading", "to": "error", "event": "ERROR" },
    { "from": "idle", "to": "editing", "event": "EDIT" },
    { "from": "editing", "to": "saving", "event": "SAVE" },
    { "from": "saving", "to": "idle", "event": "SUCCESS" },
    { "from": "saving", "to": "error", "event": "ERROR" },
    { "from": "editing", "to": "idle", "event": "CANCEL" },
    { "from": "error", "to": "idle", "event": "CANCEL" }
  ]
}
```

الآن، هناك تحديداً **5 حالات** و **9 transitions صالحة**. لا تركيبات مستحيلة.

## تصوّر الفرق

### الأعلام المنطقية: حالة متشابكة
```
         isLoading=true
        /             \
isError=true?      isEditing=true?
      /                 \
     ?                   ?
```

أي تركيبة ممكنة الحدوث. الأخطاء تنشأ من حالات غير صالحة لم تفكر فيها.

### الـ State Machine: رسم بياني موجّه
```
                    ┌─────────┐
         ┌─────────►│  idle   │◄────────┐
         │          └────┬────┘         │
         │               │              │
    ERROR│          FETCH│         SUCCESS
         │               ▼              │
    ┌────┴───┐      ┌─────────┐        │
    │ error  │      │ loading │        │
    └───┬────┘      └────┬────┘        │
        ▲                │             │
        │           SUCCESS            │
        │                │             │
        │                ▼             │
        │           ┌─────────┐        │
        └───────────┤ editing ├────────┘
                    └────┬────┘
                         │ SAVE
                         ▼
                    ┌─────────┐
         ┌─────────│ saving  │─────────┐
         │         └─────────┘         │
    ERROR│                              │SUCCESS
         │                              │
         └──────────────────────────────┘
```

كل مسار صريح. الـ transitions غير الصالحة غير موجودة.

## مثال واقعي: إرسال نموذج

### طريقة الأعلام المنطقية
```typescript
function ContactForm() {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const submit = async () => {
    setIsSubmitting(true);
    setIsError(false);
    setIsSuccess(false);

    try {
      await api.submit(formData);
      setIsSuccess(true);
    } catch (e) {
      setIsError(true);
      setErrorMessage(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bug: What if isSuccess and isError are both true?
  // Bug: Can I submit again while isSubmitting?
  // Bug: What clears isSuccess?
}
```

### طريقة الـ State Machine
```json
{
  "states": [
    { "name": "editing", "isInitial": true },
    { "name": "validating" },
    { "name": "submitting" },
    { "name": "success", "isTerminal": true },
    { "name": "error" }
  ],
  "events": ["SUBMIT", "VALIDATED", "SUCCESS", "FAILURE", "RETRY", "EDIT"],
  "transitions": [
    {
      "from": "editing",
      "to": "validating",
      "event": "SUBMIT",
      "effects": [["validate", "@entity"]]
    },
    {
      "from": "validating",
      "to": "submitting",
      "event": "VALIDATED",
      "guard": ["=", "@validation.valid", true],
      "effects": [["call-service", "submitForm", "@entity"]]
    },
    {
      "from": "validating",
      "to": "editing",
      "event": "VALIDATED",
      "guard": ["=", "@validation.valid", false],
      "effects": [["set", "@state.errors", "@validation.errors"]]
    },
    {
      "from": "submitting",
      "to": "success",
      "event": "SUCCESS",
      "effects": [["render-ui", "main", { "type": "success-state" }]]
    },
    {
      "from": "submitting",
      "to": "error",
      "event": "FAILURE",
      "effects": [["set", "@state.error", "@payload.message"]]
    },
    {
      "from": "error",
      "to": "editing",
      "event": "RETRY"
    }
  ]
}
```

الفوائد:
- لا يمكن الإرسال أثناء الإرسال
- التحقق يحدث في حالته الخاصة
- الخطأ والنجاح متبادلا الاستبعاد
- مسارات واضحة لإعادة المحاولة

## لماذا يتجنب المطورون الـ State Machines

### الخرافة 1: "معقدة جداً"

الواقع: الأعلام المنطقية *تبدو* أبسط حتى يصبح لديك 5 منها أو أكثر. عندها تصبح مصفوفة التفاعلات غير مفهومة.

### الخرافة 2: "للألعاب فقط"

الواقع: مطورو الألعاب يستخدمون finite state machines (آلات حالة محدودة) لأنها **تعمل**. الواجهات تشبه الألعاب تماماً: إجراءات المستخدم تُفعّل تغييرات في الحالة.

### الخرافة 3: "صعبة التغيير"

الواقع: تغيير state machine يعني إضافة حالة أو transition. تغيير الأعلام المنطقية يعني البحث عبر سلاسل `useEffect`.

## متى تستخدم State Machines

| السيناريو | الأعلام المنطقية | الـ State Machine |
|-----------|-----------------|------------|
| 2-3 حالات بسيطة | مقبولة | أفضل |
| عمليات غير متزامنة | مليء بالأخطاء | واضح |
| تدفقات متعددة الخطوات | فوضوي | مثالي |
| أوضاع واجهة معقدة | مستحيل | ملائم تماماً |

## Almadar يجعلها سهلة

في Almadar، لا تُنفّذ الـ state machine — بل **تصرح** عنها:

```json
{
  "traits": [{
    "name": "TaskManager",
    "linkedEntity": "Task",
    "stateMachine": {
      "states": [
        { "name": "browsing", "isInitial": true },
        { "name": "creating" },
        { "name": "editing" },
        { "name": "deleting" }
      ],
      "events": ["INIT", "CREATE", "EDIT", "DELETE", "SAVE", "CANCEL"],
      "transitions": [
        {
          "from": "browsing",
          "to": "browsing",
          "event": "INIT",
          "effects": [
            ["render-ui", "main", { "type": "entity-table", "entity": "Task" }]
          ]
        },
        {
          "from": "browsing",
          "to": "creating",
          "event": "CREATE",
          "effects": [
            ["render-ui", "modal", { "type": "form-section", ... }]
          ]
        },
        {
          "from": "creating",
          "to": "browsing",
          "event": "SAVE",
          "effects": [
            ["persist", "create", "Task", "@payload.data"],
            ["render-ui", "modal", null],
            ["emit", "INIT"]
          ]
        },
        {
          "from": "creating",
          "to": "browsing",
          "event": "CANCEL",
          "effects": [["render-ui", "modal", null]]
        }
      ]
    }
  }]
}
```

الـ compiler يولد:
- محرك الـ state machine
- أنواع TypeScript
- معالجات الأحداث
- binding الواجهة

أنت تعرّف فقط المنطق.

## تشبيه واقعي: إشارات المرور (مرة أخرى)

إشارات المرور هي الـ state machine النموذجية:

```
Red → Green → Yellow → Red
```

تخيل لو استخدمت إشارات المرور أعلاماً منطقية:

```javascript
const [isRed, setIsRed] = useState(true);
const [isGreen, setIsGreen] = useState(false);
const [isYellow, setIsYellow] = useState(false);

// Bug: All could be true!
// Bug: All could be false!
// Bug: Green could turn directly to Red!
```

يستخدم مهندسو المرور state machines لأن **الأرواح تعتمد على حالات متوقعة**.

سلامة عقل مستخدميك تعتمد عليها أيضاً.

## جرّبه: حوّل فوضى الأعلام المنطقية

خذ هذا المكوّن المثقل بالأعلام المنطقية:

```typescript
function Checkout() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasError, setHasError] = useState(false);
  // ... nightmare of useEffect
}
```

وجرب تحويله إلى schema في Almadar:

```json
{
  "states": [
    { "name": "browsing", "isInitial": true },
    { "name": "cartOpen" },
    { "name": "checkoutForm" },
    { "name": "processing" },
    { "name": "complete", "isTerminal": true },
    { "name": "error" }
  ],
  "events": ["VIEW_CART", "CHECKOUT", "SUBMIT", "SUCCESS", "FAILURE", "CLOSE", "RETRY"]
  // ... transitions
}
```

نسخة الـ state machine تحتوي على **6 حالات صريحة** بدلاً من **32 تركيبة ممكنة من الأعلام المنطقية**.

## الخلاصة

الـ finite state machines ليست تمارين أكاديمية — إنها **أدوات عملية** لإدارة التعقيد.

- 2-3 أعلام منطقية: ربما لا بأس بها
- 4 أعلام منطقية أو أكثر: فكّر في state machine
- تدفقات غير متزامنة: بالتأكيد استخدم state machine
- واجهات متعددة الخطوات: state machine أو لا شيء

Almadar يجعل الـ state machines الخيار الافتراضي، لا الاستثناء. لأن مستخدميك يستحقون برمجيات متوقعة.

هل أنت مستعد للتجربة؟ [ابنِ state machine الأولى لك](https://orb.almadar.io/docs/getting-started/introduction).
