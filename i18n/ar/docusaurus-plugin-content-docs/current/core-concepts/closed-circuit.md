# الدائرة المغلقة (Closed Circuit)

يحدد هذا المستند **نمط الدائرة المغلقة (Closed Circuit Pattern)** - البنية الأساسية التي تضمن عدم وقوع المستخدمين في حالة واجهة غير صالحة.

---

## المشكلة

عندما ينقر المستخدم على "فتح النافذة المنبثقة"، تنتقل آلة الحالة (State Machine) إلى `modalOpen` وتعرض نافذة منبثقة في فتحة `modal`. لكن إذا لم يُرسل زر الإغلاق (X) حدثاً إلى آلة الحالة بشكل صحيح، يكون المستخدم **عالقاً** - يرى النافذة المنبثقة لكن لا يستطيع إغلاقها.

هذه **دائرة مكسورة**.

---

## مبدأ الدائرة المغلقة

**كل تفاعل مع واجهة المستخدم يجب أن يكمل دائرة كاملة تعود إلى آلة الحالة.**

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│   ┌─────────┐    ┌──────────┐    ┌─────────────┐    ┌──────────────────┐  │
│   │  Event  │───►│  Guard   │───►│  Transition │───►│  Effects         │  │
│   │         │    │ Evaluate │    │  Execute    │    │  (render_ui)     │  │
│   └─────────┘    └──────────┘    └─────────────┘    └──────────────────┘  │
│        ▲                                                      │           │
│        │                                                      ▼           │
│   ┌─────────┐                                          ┌──────────────┐   │
│   │ Event   │◄─────────────────────────────────────────│   UI Slot    │   │
│   │  Bus    │         UI:CLOSE, UI:SAVE, etc.          │   Rendered   │   │
│   └─────────┘                                          └──────────────┘   │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

**القواعد:**

1. **جميع تفاعلات الواجهة تُرسل أحداثاً عبر ناقل الأحداث (Event Bus)** - لا تستخدم أبداً استدعاءات داخلية مثل `onClick={() => setOpen(false)}`
2. **جميع الأحداث يجب أن تكون لها انتقالات مقابلة** - إذا أرسل مكوّن `UI:CLOSE`، يجب أن يكون هناك انتقال (Transition) يعالج `CLOSE`
3. **الفتحات غير الرئيسية يجب أن تعود إلى الرئيسية** - إذا عرضت في `modal` أو `drawer` أو فتحات طبقة أخرى، يجب أن يكون هناك انتقال يعرض مرة أخرى في `main`

---

## تسلسل الفتحات ومتطلبات العودة

| الفتحة | النوع | متطلبات العودة |
|--------|-------|---------------|
| `main` | أساسية | لا توجد - هذه هي القاعدة الأساسية |
| `sidebar` | ثانوية | اختيارية - يمكن التعايش مع main |
| `center` | ثانوية | اختيارية - يمكن التعايش مع main |
| `modal` | طبقة | **مطلوبة** - يجب أن يكون هناك انتقال CLOSE/CANCEL يعود إلى main |
| `drawer` | طبقة | **مطلوبة** - يجب أن يكون هناك انتقال CLOSE/CANCEL يعود إلى main |
| `toast` | إشعار | يُغلق تلقائياً، لا يحتاج انتقال |

**فتحات الطبقة (`modal`، `drawer`) حاجبة** - تمنع التفاعل مع المحتوى الرئيسي. يجب أن يتمكن المستخدمون من الخروج منها.

---

## عقود أحداث المكوّنات (Component Event Contracts)

المكوّنات التي يمكنها تحفيز انتقالات الحالة يجب أن تُرسل أحداثاً عبر ناقل الأحداث:

### مكوّنات مع خاصية `actions` (مستوى الصفحة)

| المكوّن | الخاصية | يُرسل |
|---------|---------|-------|
| `page-header` | `actions` | `UI:{event}` لكل إجراء |
| `form` | `actions` | `UI:SAVE`، `UI:CANCEL` |
| `toolbar` | `actions` | `UI:{event}` لكل إجراء |

### مكوّنات مع خاصية `itemActions` (مستوى الصف)

| المكوّن | الخاصية | يُرسل |
|---------|---------|-------|
| `entity-table` | `itemActions` | `UI:{event}` مع حمولة `{ row }` |
| `entity-list` | `itemActions` | `UI:{event}` مع حمولة `{ row }` |
| `entity-cards` | `itemActions` | `UI:{event}` مع حمولة `{ row }` |

### مكوّنات الطبقة (يجب أن تُرسل أحداث الإغلاق)

| المكوّن | محفّز الإغلاق | يجب أن يُرسل |
|---------|-------------|-------------|
| `modal` | زر X، Escape، نقر الطبقة | `UI:CLOSE` |
| `drawer` | زر X، Escape، نقر الطبقة | `UI:CLOSE` |
| `confirm-dialog` | زر الإلغاء | `UI:CANCEL` |
| `game-pause-overlay` | زر الاستئناف | `UI:RESUME` |
| `game-over-screen` | زر إعادة المحاولة | `UI:RESTART` |

---

## متطلبات التحقق

يفرض المُحقق القواعد التالية:

### 1. كشف الأحداث اليتيمة

إذا حدد `actions` أو `itemActions` لمكوّن حدثاً، يجب أن يكون هناك انتقال (Transition) يعالجه.

```json
// خطأ - OPEN_MODAL ليس له معالج
{
  "type": "page-header",
  "actions": [{ "label": "Open", "event": "OPEN_MODAL" }]
}
// لكن لا يوجد انتقال: { "event": "OPEN_MODAL", ... }
```

**الخطأ**: `CIRCUIT_ORPHAN_EVENT: Action 'Open' emits event 'OPEN_MODAL' which has no transition handler`

### 2. انتقال خروج النافذة المنبثقة/الدرج

إذا عرض انتقال في فتحة `modal` أو `drawer`، يجب أن يكون هناك انتقال من تلك الحالة المستهدفة يعالج `CLOSE` أو `CANCEL` أو حدثاً مطلوباً بالنمط (مثل `SAVE`)، ويعرض مرة أخرى في فتحة `main` (أو ينتقل إلى حالة تفعل ذلك).

```json
// خطأ - حالة modalOpen ليس لها مخرج
{
  "from": "viewing",
  "event": "OPEN_MODAL",
  "to": "modalOpen",
  "effects": [["render-ui", "modal", { "type": "modal", ... }]]
}
// لكن لا يوجد انتقال: { "from": "modalOpen", "event": "CLOSE", ... }
```

**الخطأ**: `CIRCUIT_NO_EXIT: State 'modalOpen' renders to 'modal' slot but has no CLOSE/CANCEL transition. Users will be stuck.`

### 3. متطلبات العودة إلى Main

الحالات التي تعرض فقط في فتحات غير main يجب أن تعود في النهاية إلى حالة تعرض في `main`.

```json
// خطأ - modalOpen تعرض فقط في modal، ولا تعود أبداً إلى main
{
  "from": "modalOpen",
  "event": "CLOSE",
  "to": "modalOpen",  // تعود إلى نفسها!
  "effects": []       // ولا تعرض شيئاً
}
```

**الخطأ**: `CIRCUIT_NO_MAIN_RETURN: State 'modalOpen' has no path back to a state that renders to 'main' slot`

---

## متطلبات المُصرِّف

يضمن المُصرِّف الدوائر المغلقة من خلال:

### 1. أغلفة الفتحات للطبقات

فتحات الطبقة تُغلَّف في مكوّنات غلاف تعالج التواصل مع ناقل الأحداث:

| الفتحة | الغلاف | الأحداث المُرسلة |
|--------|--------|----------------|
| `modal` | `ModalSlot` | `UI:CLOSE`، `UI:CANCEL` |
| `drawer` | `DrawerSlot` | `UI:CLOSE`، `UI:CANCEL` |
| `toast` | `ToastSlot` | `UI:DISMISS`، `UI:CLOSE` |

مكوّنات الغلاف:
- تظهر تلقائياً عند وجود محتوى فرعي
- تعالج محفّزات الإغلاق/الإلغاء (زر X، Escape، نقر الطبقة)
- تُرسل أحداثاً عبر ناقل الأحداث لتمكين آلة الحالة من الانتقال

**مثال**: `ModalSlot` تغلف أي محتوى يُعرض في فتحة modal وتُرسل `UI:CLOSE` عند الإلغاء:

```typescript
// ModalSlot.tsx
const handleClose = () => {
  eventBus.emit('UI:CLOSE');
  eventBus.emit('UI:CANCEL');
};

return (
  <Modal isOpen={Boolean(children)} onClose={handleClose}>
    {children}
  </Modal>
);
```

### 2. توليد خاصية `event`، وليس `onClick`

للإجراءات في `page-header` و`form` وغيرها، يولّد المُصرِّف خاصية `event` ليُرسل المكوّن عبر ناقل الأحداث:

```typescript
// الكود المولّد:
<PageHeader actions={[{ label: "Open", event: "OPEN_MODAL" }]} />

// وليس:
<PageHeader actions={[{ label: "Open", onClick: () => dispatch('OPEN_MODAL') }]} />
```

المكوّن يعالج إرسال `UI:OPEN_MODAL` عبر ناقل الأحداث، والذي يلتقطه `useUIEvents` ويوزعه.

### 3. الصفحة يجب أن تعرض جميع الفتحات مع أغلفة

الصفحات المولّدة تعرض جميع الفتحات، مع فتحات الطبقة مغلّفة بأغلفة الفتحات:

```typescript
// الصفحة المولّدة:
return (
  <>
    <VStack>
      {/* فتحات المحتوى - تُعرض مضمّنة */}
      {ui?.main}
      {ui?.sidebar}
      {ui?.center}
    </VStack>
    {/* فتحات الطبقة - مغلّفة للدائرة المغلقة */}
    <ModalSlot>{ui?.modal}</ModalSlot>
    <DrawerSlot>{ui?.drawer}</DrawerSlot>
    <ToastSlot>{ui?.toast}</ToastSlot>
  </>
);
```

**المفتاح**: أغلفة الفتحات تُرسل أحداثاً عبر ناقل الأحداث عند إغلاق/إلغاء الطبقة. هذا يكمل الدائرة عائداً إلى آلة الحالة.

---

## نمط البرنامج للنافذة المنبثقة (Modal)

نمط البرنامج الصحيح لنافذة منبثقة:

```json
{
  "states": [
    { "name": "viewing", "isInitial": true },
    { "name": "modalOpen" }
  ],
  "events": [
    { "key": "OPEN_MODAL", "name": "Open Modal" },
    { "key": "CLOSE", "name": "Close" }
  ],
  "transitions": [
    {
      "from": "viewing",
      "event": "INIT",
      "to": "viewing",
      "effects": [
        ["render-ui", "main", {
          "type": "page-header",
          "title": "Example",
          "actions": [{ "label": "Open Modal", "event": "OPEN_MODAL" }]
        }]
      ]
    },
    {
      "from": "viewing",
      "event": "OPEN_MODAL",
      "to": "modalOpen",
      "effects": [
        ["render-ui", "modal", { "type": "modal", "title": "Modal" }]
      ]
    },
    {
      "from": "modalOpen",
      "event": "CLOSE",
      "to": "viewing",
      "effects": [
        ["render-ui", "main", {
          "type": "page-header",
          "title": "Example",
          "actions": [{ "label": "Open Modal", "event": "OPEN_MODAL" }]
        }]
      ]
    }
  ]
}
```

**النقاط الأساسية:**
1. انتقال `OPEN_MODAL` يعرض في فتحة `modal`
2. انتقال `CLOSE` من `modalOpen` يعرض مرة أخرى في فتحة `main`
3. كلا الحدثين لهما انتقالات مقابلة

---

## ملخص

نمط الدائرة المغلقة (Closed Circuit) يضمن:

1. **المستخدمون لا يعلقون أبداً** - كل حالة واجهة لها مسار خروج
2. **الأحداث تتدفق عبر آلة الحالة** - لا توجد إدارة حالة داخلية تتجاوز الدائرة
3. **فتحات الطبقة تعود إلى main** - النوافذ المنبثقة والأدراج دائماً لها انتقالات إغلاق
4. **التحقق يكشف الكسور** - المُصرِّف يتحقق من اكتمال الدائرة قبل توليد الكود

عندما تنكسر الدائرة، يختبر المستخدمون أزراراً "ميتة"، ونوافذ منبثقة عالقة، وواجهة لا تستجيب. المُحقق والمُصرِّف يعملان معاً لمنع ذلك.
