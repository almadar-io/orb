# التواصل عبر الوحدات المدارية (Cross-Orbital)

> المصدر: [`tests/schemas/05-cross-orbital.orb`](../../../../tests/schemas/05-cross-orbital.orb)

الوحدات المدارية مستقلة بذاتها، لكن التطبيقات الحقيقية تحتاج أن تتحدث الميزات مع بعضها. Orb يربط الوحدات المدارية من خلال ناقل أحداث مُنمَّط: وحدة مدارية تُرسل، وأخرى تستمع.

<OrbitalDiagram />

---

## النمط

```
CartManager orbital          NotificationManager orbital
      |                               |
  CartActions trait              NotificationHandler trait
      |                               |
  emits: ITEM_ADDED  ──────────►  listens: ITEM_ADDED
  emits: CART_CLEARED ─────────►  listens: CART_CLEARED
```

الخصائص الأساسية:
- **`emits`** - تُعلَن على السمة وعلى الوحدة المدارية (ما هي الأحداث التي تنشرها)
- **`listens`** - تُعلَن على السمة (أي أحداث تتفاعل معها) وعلى الوحدة المدارية (أي وحدات مدارية تشترك فيها)
- **`scope: "external"`** - تحدد الحدث كعابر لحدود الوحدات المدارية

---

## الخطوة 1 - إعلان Emits على السمة المُرسلة

السمة تُعلن الأحداث التي يمكنها نشرها، بما في ذلك عقد الحمولة:

```orb
{
  "name": "CartActions",
  "linkedEntity": "Cart",
  "category": "interaction",
  "emits": [
    {
      "event": "ITEM_ADDED",
      "scope": "external",
      "description": "Emitted when an item is added to cart",
      "payload": [
        { "name": "itemCount", "type": "number", "required": true },
        { "name": "total", "type": "number", "required": true }
      ]
    }
  ],
  "stateMachine": { "..." : "..." }
}
```

`scope: "external"` مطلوب للأحداث العابرة للوحدات المدارية. بدونه، يبقى الحدث داخلياً للسمة.

---

## الخطوة 2 - إطلاق الحدث في الانتقال

داخل `effects` للانتقال، استخدم `["emit", "EVENT_NAME", payload]`:

```orb
{
  "from": "empty",
  "event": "ADD_ITEM",
  "to": "hasItems",
  "effects": [
    ["increment", "@entity.itemCount", 1],
    ["set", "@entity.total", ["+", "@entity.total", "@payload.price"]],
    ["emit", "ITEM_ADDED", {
      "itemCount": "@entity.itemCount",
      "total": "@entity.total"
    }]
  ]
}
```

---

## الخطوة 3 - إعلان Emits على مستوى الوحدة المدارية

على مستوى الوحدة المدارية، اذكر كل حدث تنشره:

```orb
{
  "name": "CartManager",
  "entity": { "...": "..." },
  "traits": [ { "...": "..." } ],
  "pages": [ { "...": "..." } ],
  "emits": ["ITEM_ADDED", "CART_CLEARED"]
}
```

---

## الخطوة 4 - إعلان Listens على السمة المستقبلة

السمة المستقبلة تُعلن الأحداث الخارجية التي تعالجها:

```orb
{
  "name": "NotificationHandler",
  "linkedEntity": "Notification",
  "category": "interaction",
  "listens": [
    { "event": "ITEM_ADDED", "scope": "external" },
    { "event": "CART_CLEARED", "scope": "external" }
  ],
  "stateMachine": { "..." : "..." }
}
```

هذه الأحداث تصبح مفاتيح أحداث صالحة في آلة الحالة. أضفها إلى `events` واكتب انتقالات لها.

---

## الخطوة 5 - إعلان Listens على مستوى الوحدة المدارية

على مستوى الوحدة المدارية المستقبلة، أعلن من أين تأتي الأحداث:

```orb
{
  "name": "NotificationManager",
  "entity": { "...": "..." },
  "traits": [ { "...": "..." } ],
  "pages": [ { "...": "..." } ],
  "listens": [
    { "event": "ITEM_ADDED", "from": "CartManager" },
    { "event": "CART_CLEARED", "from": "CartManager" }
  ]
}
```

---

## قائمة التحقق: الأحداث عبر الوحدات المدارية

استخدم هذه القائمة عند ربط وحدتين مداريتين:

- [ ] **السمة المُرسلة** لديها `"emits": [...]` مع `scope: "external"` وعقد `payload`
- [ ] **انتقال الإرسال** يستدعي `["emit", "EVENT_NAME", {...payload}]` في `effects`
- [ ] **الوحدة المدارية المُرسلة** لديها `"emits": ["EVENT_NAME"]` على المستوى الأعلى
- [ ] **السمة المستمعة** لديها `"listens": [{ "event": "EVENT_NAME", "scope": "external" }]`
- [ ] **آلة حالة السمة المستمعة** لديها الحدث في `events` و`transition` له
- [ ] **الوحدة المدارية المستمعة** لديها `"listens": [{ "event": "EVENT_NAME", "from": "EmittingOrbital" }]` على المستوى الأعلى

---

## الخطوات التالية

- [بناء تطبيق كامل](../advanced/full-app.md) - الأحداث عبر الوحدات المدارية في تطبيق من 3 وحدات
- [الحراس وقواعد العمل](./guards.md) - حماية انتقال بناءً على بيانات من وحدة مدارية أخرى
