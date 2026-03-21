# أنماط الواجهة وrender-ui

> المصدر: [`tests/schemas/08-patterns.orb`](../../../../tests/schemas/08-patterns.orb)

واجهة Orb تُقاد بالكامل بتأثيرات `render-ui` داخل انتقالات آلة الحالة (State Machine). لا يوجد JSX، لا ملفات قوالب، لا شجرة مكوّنات منفصلة. آلة الحالة *هي* منطق الواجهة.

<OrbitalDiagram />

---

## كيف يعمل render-ui

```json
["render-ui", "slot", { "type": "pattern", ...props }]
```

| الوسيط | الوصف |
|--------|-------|
| `"slot"` | أين يُعرض المكوّن على الصفحة |
| `{ "type": "..." }` | أي مكوّن نمط يُستخدم |
| `...props` | إعدادات خاصة بالنمط |

**لمسح فتحة:**
```json
["render-ui", "slot", null]
```

---

## الفتحات (Slots)

الفتحات تقسم الصفحة إلى مناطق مسماة. كل فتحة مملوكة لسمة واحدة في كل مرة.

| الفتحة | الاستخدام النموذجي |
|--------|-------------------|
| `main` | منطقة المحتوى الأساسي |
| `modal` | حوارات النوافذ المنبثقة (نماذج، تأكيدات) |
| `drawer` | لوحة جانبية (عرض التفاصيل) |
| `sidebar` | تنقل جانبي دائم |
| `overlay` | طبقات ملء الشاشة |
| `hud-top` / `hud-bottom` | ترويسات/تذييلات دائمة |
| `toast` | إشعارات مؤقتة |

---

## فئات الأنماط

### أنماط العرض

**`entity-table`** - جدول بيانات مع أعمدة وترتيب وإجراءات على الصفوف.

```json
["render-ui", "main", {
  "type": "entity-table",
  "entity": "Product",
  "columns": ["name", "price", "stock", "category"],
  "itemActions": [
    { "event": "VIEW", "label": "View" },
    { "event": "EDIT", "label": "Edit" },
    { "event": "DELETE", "label": "Delete" }
  ]
}]
```

**`entity-detail`** - عرض تفاصيل للقراءة فقط لسجل واحد.

```json
["render-ui", "main", {
  "type": "entity-detail",
  "entity": "Product",
  "fields": ["name", "description", "price", "stock", "category"]
}]
```

**`stats`** - بطاقات إحصائيات لوحة المعلومات (أعداد، إجماليات، ملخصات).

```json
["render-ui", "main", {
  "type": "stats",
  "items": [
    { "label": "Total Products", "value": "@entity.count" },
    { "label": "Out of Stock", "value": "@entity.outOfStock" }
  ]
}]
```

---

### أنماط النماذج

**`form`** - نموذج مُولَّد تلقائياً لكيان. يعرض جميع الحقول أو مجموعة فرعية محددة.

```json
["render-ui", "main", {
  "type": "form",
  "entity": "Product",
  "fields": [
    { "name": "name", "label": "Product Name", "required": true },
    { "name": "description", "label": "Description", "type": "textarea" },
    { "name": "price", "label": "Price", "type": "number", "required": true },
    { "name": "stock", "label": "Stock", "type": "number" },
    { "name": "category", "label": "Category" }
  ]
}]
```

**`form-section`** - نموذج داخل نافذة منبثقة أو درج، مع إرسال/إلغاء مربوط بأحداث.

```json
["render-ui", "modal", {
  "type": "form-section",
  "entity": "Task",
  "fields": ["title", "priority", "dueDate"],
  "submitEvent": "SAVE",
  "cancelEvent": "CANCEL"
}]
```

> **مهم:** استخدم `submitEvent` و`cancelEvent` (وليس `onSubmit`/`onCancel` - هذه مُهملة).

---

### أنماط التنقل والترويسة

**`page-header`** - عنوان الصفحة مع أزرار إجراءات اختيارية.

```json
["render-ui", "main", {
  "type": "page-header",
  "title": "Products",
  "subtitle": "Manage your product catalog",
  "actions": [
    { "event": "CREATE", "label": "New Product", "variant": "primary" }
  ]
}]
```

**`breadcrumb`** - مسار التنقل.

```json
["render-ui", "main", {
  "type": "breadcrumb",
  "items": [
    { "label": "Products", "path": "/products" },
    { "label": "@entity.name" }
  ]
}]
```

---

### أنماط الحالة

**`empty-state`** - يُعرض عندما لا تحتوي القائمة على عناصر.

```json
["render-ui", "main", {
  "type": "empty-state",
  "title": "No products yet",
  "description": "Add your first product to get started",
  "actions": [{ "event": "CREATE", "label": "Add Product" }]
}]
```

**`loading-state`** - مؤشر تحميل أثناء جلب البيانات.

```json
["render-ui", "main", {
  "type": "loading-state",
  "title": "Loading products..."
}]
```

---

## الواجهة المدفوعة بالحالة: مثال كامل

قوة `render-ui` أنها تتغير بناءً على الحالة. حالات مختلفة تعرض مكوّنات مختلفة في نفس الفتحة.

**ما تعرضه آلة الحالة لكل حالة:**

| الحالة | فتحة `main` تعرض |
|--------|-------------------|
| `listing` | `entity-table` مع إجراءات على الصفوف |
| `viewing` | `entity-detail` مع الحقول |
| `editing` | `form` في وضع التعديل |
| `creating` | `form` مع جميع الحقول |

---

## مرجع خصائص الإجراءات

الإجراءات تُحدد **داخل** خصائص النمط، وليس كأنماط منفصلة.

| النمط | كيفية ربط الإجراءات |
|-------|---------------------|
| `entity-table` | `itemActions: [{ "event": "EDIT", "label": "Edit" }]` |
| `entity-detail` | `actions: [{ "event": "EDIT", "label": "Edit" }]` |
| `form-section` | `submitEvent: "SAVE"`, `cancelEvent: "CANCEL"` |
| `page-header` | `actions: [{ "event": "CREATE", "label": "New" }]` |
| `empty-state` | `actions: [{ "event": "CREATE", "label": "Add" }]` |

---

## الربط في خصائص الأنماط

خصائص الأنماط تقبل الربط لقراءة البيانات المباشرة:

| الربط | يُحل إلى |
|-------|----------|
| `@entity.field` | قيمة حقل الكيان الحالي |
| `@payload.field` | حقل حمولة الحدث |
| `@state` | اسم الحالة الحالية |
| `@now` | الطابع الزمني الحالي |

مثال:
```json
{ "type": "stats", "title": "Cart Total: $@entity.total" }
```

---

## الخطوات التالية

- [الحراس وقواعد العمل](./guards.md) - إضافة شروط للتحكم في تشغيل الانتقالات
- [التواصل عبر الوحدات المدارية](./cross-orbital.md) - ربط الوحدات المدارية ببعضها
- [بناء تطبيق كامل](../advanced/full-app.md) - تجميع وحدات مدارية متعددة
