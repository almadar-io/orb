---
slug: closed-circuit-pattern
title: "الـ Closed Circuit Pattern: لماذا يعلق مستخدموك (وكيف تمنع ذلك)"
authors: [osamah]
tags: [architecture, state-machines]
image: /img/blog/closed-circuit-pattern.png
---

![الـ Closed Circuit Pattern: لماذا يعلق مستخدموك وكيف تمنع ذلك](/img/blog/closed-circuit-pattern.png)

هل سبق أن فتحت نافذة منبثقة ولم تستطع إغلاقها؟ هذه دائرة مكسورة. لقد جعلنا بناء مثل هذه الأشياء مستحيلاً.

<!-- truncate -->

## مشكلة المستخدم العالق

لنفترض أنك تستخدم تطبيقاً. تنقر على "فتح الإعدادات." تظهر نافذة منبثقة. تنقر على زر X. لا شيء يحدث. تضغط Escape. لا شيء. تنقر خارج النافذة. ولا يزال لا شيء يحدث.

**أنت عالق.**

يحدث هذا بسبب:
1. النافذة المنبثقة فُتحت عبر حالة داخلية (`setIsOpen(true)`)
2. زر الإغلاق يُفعّل `setIsOpen(false)`
3. لكن إذا كان هناك خطأ برمجي، فإن الحالة لا تتحدث
4. أو الأسوأ من ذلك — زر الإغلاق لم يُوصَّل أصلاً

في Almadar، هذا مستحيل معمارياً.

## مبدأ الـ Closed Circuit (الدائرة المغلقة)

**كل تفاعل مع الواجهة يجب أن يُكمل دائرة كاملة عائداً إلى الـ state machine (نظام يدير سلوك البرنامج عبر حالات محددة).**

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│   User Click ──► Event Bus ──► State Machine ──► UI Update     │
│       ▲                                              │         │
│       └──────────────────────────────────────────────┘         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

لا توجد اختصارات. لا تغييرات مباشرة للحالة. كل إجراء يتدفق عبر الدائرة.

## كيف يعمل في Almadar

### 1. المستخدم يطلق حدثاً

عندما تنقر على زر:

```typescript
// ❌ NOT this:
onClick={() => setIsModalOpen(false)}

// ✅ This:
onClick={() => eventBus.emit('UI:CLOSE')}
```

لا يعرف المكوّن ما سيحدث بعد ذلك. إنه يرسل الحدث فقط.

### 2. الـ Event Bus يوجّه إلى الـ State Machine

يستقبل الـ event bus (ناقل الأحداث) الحدث `UI:CLOSE` ويوجّهه إلى state machine الـ trait النشطة.

### 3. الـ State Machine تعالج

```json
{
  "from": "modalOpen",
  "to": "browsing",
  "event": "CLOSE",
  "effects": [
    ["render-ui", "modal", null],
    ["render-ui", "main", { "type": "page-header", ... }]
  ]
}
```

الـ state machine:
1. تنتقل من `modalOpen` إلى `browsing`
2. تُفرغ خانة النافذة المنبثقة
3. تُصيّر المحتوى الرئيسي

### 4. الواجهة تتحدث

يعاد تصيير المكوّن بناءً على الحالة الجديدة. تختفي النافذة المنبثقة لأن الـ state machine حددت ذلك.

## لماذا هذا يمنع حالات العلق

### 1. الأحداث يجب أن تملك transitions

إذا عرّفت زراً بحدث:

```json
{
  "type": "page-header",
  "actions": [{ "label": "Open", "event": "OPEN_MODAL" }]
}
```

المُتحقق **يتطلب** transition (انتقال بين حالتين) مطابقاً:

```json
{
  "from": "browsing",
  "to": "modalOpen",
  "event": "OPEN_MODAL"
  // ✅ Required transition exists
}
```

إذا نسيت:
```
✗ Error: CIRCUIT_ORPHAN_EVENT
  Action 'Open' emits event 'OPEN_MODAL' which has no transition handler
```

### 2. خانات التراكب يجب أن تملك مخارج

إذا صيّرت إلى `modal` أو `drawer`، يتطلب المُتحقق مخرجاً:

```json
{
  "from": "browsing",
  "to": "modalOpen",
  "event": "OPEN_MODAL",
  "effects": [
    ["render-ui", "modal", { "type": "form-section", ... }]
  ]
}
```

يجب أن يكون هناك:
```json
{
  "from": "modalOpen",
  "to": "browsing",
  "event": "CLOSE"
  // ✅ Required exit transition
}
```

إذا نسيت:
```
✗ Error: CIRCUIT_NO_OVERLAY_EXIT
  State 'modalOpen' renders to 'modal' slot but has no exit transition.
  Users will be stuck in this overlay.
```

### 3. أغلفة الخانات تتعامل مع مخارج الطوارئ

حتى لو نسيت زر إغلاق، فإن غلاف الخانة ينقذك:

```typescript
// ModalSlot.tsx (auto-generated wrapper)
const handleClose = () => {
  eventBus.emit('UI:CLOSE');
  eventBus.emit('UI:CANCEL');
};

return (
  <Modal
    isOpen={Boolean(children)}
    onClose={handleClose}  // Escape key, overlay click, X button
  >
    {children}
  </Modal>
);
```

يرسل الغلاف الحدث. تتعامل الـ state machine معه. تكتمل الدائرة.

## تشبيه واقعي: إشارات المرور

إشارات المرور تتبع closed circuit:

```
Red ──(timer)──► Green ──(timer)──► Yellow ──(timer)──► Red
```

لا يوجد "قفز من الأحمر إلى الأخضر فوراً" أو "علق على الأصفر." الدائرة مغلقة — كل حالة لها transitions محددة.

الآن تخيل إشارة مرور معطلة:
- عالقة على الأحمر -- ازدحام مروري
- عالقة على الأخضر -- حوادث
- transitions عشوائية -- فوضى

يشبه متحقق Almadar مهندس مرور يتحقق من:
- كل ضوء له transitions
- لا حالات مستحيلة
- أوضاع الطوارئ معرّفة

## مثال: نافذة منبثقة لا يمكن أن تتعطل

إليك تطبيق نافذة منبثقة **مستحيل أن تعلق فيها**:

```json
{
  "states": [
    { "name": "browsing", "isInitial": true },
    { "name": "modalOpen" }
  ],
  "events": [
    { "key": "OPEN_MODAL", "name": "Open Modal" },
    { "key": "CLOSE", "name": "Close" },
    { "key": "SAVE", "name": "Save" }
  ],
  "transitions": [
    {
      "from": "browsing",
      "to": "browsing",
      "event": "INIT",
      "effects": [
        ["render-ui", "main", {
          "type": "page-header",
          "title": "Tasks",
          "actions": [{ "label": "New Task", "event": "OPEN_MODAL" }]
        }]
      ]
    },
    {
      "from": "browsing",
      "to": "modalOpen",
      "event": "OPEN_MODAL",
      "effects": [
        ["render-ui", "modal", {
          "type": "form-section",
          "entity": "Task",
          "fields": ["title", "status"],
          "submitEvent": "SAVE",
          "cancelEvent": "CLOSE"
        }]
      ]
    },
    {
      "from": "modalOpen",
      "to": "browsing",
      "event": "CLOSE",
      "effects": [
        ["render-ui", "modal", null],
        ["emit", "INIT"]
      ]
    },
    {
      "from": "modalOpen",
      "to": "browsing",
      "event": "SAVE",
      "effects": [
        ["persist", "create", "Task", "@payload.data"],
        ["render-ui", "modal", null],
        ["emit", "INIT"]
      ]
    }
  ]
}
```

**ثلاث طرق للخروج من النافذة المنبثقة:**
1. انقر "إلغاء" -- يُطلق حدث `CLOSE`
2. انقر "حفظ" -- يُطلق حدث `SAVE`
3. اضغط Escape أو انقر على التراكب -- ModalSlot يُرسل `UI:CLOSE`

تنتقل الثلاثة عائدة إلى `browsing` وتُفرغ النافذة المنبثقة.

## التسلسل الهرمي للخانات

الخانات المختلفة لها متطلبات عودة مختلفة:

| الخانة | النوع | متطلبات العودة |
|--------|-------|---------------|
| `main` | رئيسي | لا شيء — هذه هي القاعدة الأساسية |
| `sidebar` | ثانوي | اختياري — يمكن أن يتواجد مع main |
| `modal` | تراكب | **مطلوب** — يجب أن يملك transition خروج |
| `drawer` | تراكب | **مطلوب** — يجب أن يملك transition خروج |
| `toast` | إشعار | يختفي تلقائياً، لا حاجة لـ transition |

## لماذا هذه الهندسة مهمة

### للمستخدمين
- لن يعلقوا في النوافذ المنبثقة أبداً
- سلوك متسق عبر التطبيقات
- patterns واجهة متوقعة

### للمطورين
- الأخطاء تُلتقط وقت التصريف
- لا حاجة لتوصيل معالجات الإغلاق يدوياً
- تغييرات الحالة قابلة للتتبع

### للفرق
- الـ schema = التوثيق
- سهولة مراجعة تدفقات الحالة
- التأهيل أسرع

## جرّبه: ابنِ نافذة منبثقة لا تتعطل

أنشئ ملف `modal-demo.orb`:

```json
{
  "name": "ModalDemo",
  "orbitals": [{
    "name": "Demo",
    "entity": { "name": "Item", "fields": [{ "name": "name", "type": "string" }] },
    "traits": [{
      "name": "DemoTrait",
      "linkedEntity": "Item",
      "stateMachine": {
        "states": [
          { "name": "main", "isInitial": true },
          { "name": "modalOpen" }
        ],
        "events": [
          { "key": "INIT", "name": "Initialize" },
          { "key": "OPEN", "name": "Open" },
          { "key": "CLOSE", "name": "Close" }
        ],
        "transitions": [
          {
            "from": "main",
            "to": "main",
            "event": "INIT",
            "effects": [
              ["render-ui", "main", {
                "type": "page-header",
                "title": "Demo",
                "actions": [{ "label": "Open Modal", "event": "OPEN" }]
              }]
            ]
          },
          {
            "from": "main",
            "to": "modalOpen",
            "event": "OPEN",
            "effects": [
              ["render-ui", "modal", { "type": "page-header", "title": "I'm a Modal!" }]
            ]
          },
          {
            "from": "modalOpen",
            "to": "main",
            "event": "CLOSE",
            "effects": [
              ["render-ui", "modal", null],
              ["emit", "INIT"]
            ]
          }
        ]
      }
    }],
    "pages": [{ "name": "DemoPage", "path": "/", "traits": [{ "ref": "DemoTrait" }] }]
  }]
}
```

صرّف وجرّب:
```bash
orbital validate modal-demo.orb  # Will fail without CLOSE transition
orbital compile modal-demo.orb --shell typescript
```

جرّب إزالة transition الـ `CLOSE` والتحقق مرة أخرى. الـ compiler لن يسمح لك بإنشاء دائرة مكسورة.

## الخلاصة

الـ closed circuit pattern ليس مجرد فكرة جيدة — إنه مفروض من الـ compiler (المُصرِّف).

في Almadar:
- كل إجراء في الواجهة يُرسل حدثاً
- كل حدث له transition
- كل تراكب له مخرج
- لا يعلق المستخدمون أبداً

لأن أفضل طريقة لمنع الأخطاء ليست الاختبار — بل جعل كتابتها مستحيلة.

تعرّف على المزيد حول [الـ state machines في Almadar](https://orb.almadar.io/docs/traits).
