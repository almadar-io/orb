# الأنماط (Patterns)

> الجسر بين البرامج التصريحية ومكوّنات واجهة المستخدم

---

## نظرة عامة

**نظام الأنماط (Pattern System)** يربط البرامج التصريحية بمكوّنات واجهة المستخدم الفعلية. عندما يحدد تأثير `render-ui` لسمة نوع نمط، يستخدم النظام ثلاث آليات أساسية:

1. **التحقق** من خصائص النمط مقابل البرنامج
2. **الربط** بين النمط ومكوّن محدد
3. **إنفاذ** عقد الأحداث للامتثال للدائرة المغلقة (Closed Circuit)

```
Schema (render-ui)  →  Pattern Registry  →  Component Mapping  →  Shell Component
                              ↓
                       Event Contract
                              ↓
                    Closed Circuit Validation
```

---

## سجل الأنماط (Pattern Registry)

سجل الأنماط هو مصدر الحقيقة لجميع الأنماط المتاحة. كل نمط يحدد:

```json
{
  "entity-table": {
    "type": "entity-table",
    "category": "display",
    "description": "Data table with columns and sorting",
    "suggestedFor": ["data-dense views", "comparisons", "admin panels"],
    "typicalSize": "medium",
    "componentHints": ["row-action:*", "table-cell", "sort-header"],
    "implements": "EntityBoundPatternProps",
    "propsSchema": {
      "columns": {
        "required": true,
        "types": ["array"],
        "description": "Columns can be Column objects or simple string field names"
      },
      "entity": {
        "types": ["string", "array"],
        "description": "Entity name for auto-fetch OR data array"
      },
      "itemActions": {
        "types": ["array"],
        "description": "Item actions from generated code - maps to rowActions"
      }
    },
    "componentMapping": {
      "component": "DataTable",
      "eventContract": { }
    }
  }
}
```

### خصائص النمط

| الخاصية | الوصف |
|----------|-------|
| `type` | معرِّف النمط الفريد (يُستخدم في `render-ui`) |
| `category` | التجميع: `display`، `form`، `header`، `filter`، `navigation`، `layout`، `game`، `state` |
| `description` | وصف مقروء للبشر |
| `suggestedFor` | تلميحات حالات الاستخدام لتوليد LLM |
| `typicalSize` | البصمة على الواجهة: `tiny`، `small`، `medium`، `large` |
| `componentHints` | أنماط المكوّنات الفرعية التي قد يستخدمها هذا النمط |
| `implements` | الواجهة التي ينفذها المكوّن (مثال: `EntityBoundPatternProps`) |
| `propsSchema` | تعريفات الخصائص مع الأنواع والمتطلبات |
| `componentMapping` | يربط بمكوّن الغلاف وعقد الأحداث |

### فئات الأنماط

| الفئة | أمثلة | الغرض |
|-------|-------|-------|
| `display` | `entity-table`، `entity-list`، `entity-cards`، `stats` | عرض البيانات |
| `form` | `form`، `form-section`، `form-fields` | إدخال البيانات |
| `header` | `page-header`، `title-only` | عناوين الصفحات والإجراءات |
| `filter` | `search-bar`، `filter-group`، `search-input` | تصفية البيانات |
| `navigation` | `tabs`، `breadcrumb`، `wizard-progress`، `pagination` | عناصر التنقل |
| `layout` | `modal`، `drawer`، `master-detail`، `dashboard-grid` | بنية الصفحة |
| `game` | `game-canvas`، `game-hud`، `game-controls` | عناصر واجهة الألعاب |
| `state` | `empty-state`، `loading-state`، `error-state` | ردود فعل الحالة |

---

## ربط المكوّنات (Component Mapping)

ربط المكوّنات يصل أنواع الأنماط بمكوّنات الغلاف:

```json
{
  "mappings": {
    "entity-table": {
      "component": "DataTable",
      "category": "display"
    },
    "form": {
      "component": "Form",
      "category": "form"
    },
    "page-header": {
      "component": "PageHeader",
      "category": "header"
    }
  }
}
```

### خصائص الربط

| الخاصية | الوصف |
|----------|-------|
| `component` | اسم المكوّن في الغلاف |
| `category` | نفس فئة النمط |
| `client` | اختياري - مكوّن خاص بالعميل |
| `deprecated` | اختياري - يحدد النمط كمُهمل |
| `replacedBy` | اختياري - النمط البديل للأنماط المُهملة |

---

## عقود الأحداث (Event Contracts)

عقود الأحداث تحدد ما هي الأحداث التي يُرسلها المكوّن ويتطلبها. هذا حاسم لـ **التحقق من الدائرة المغلقة (Closed Circuit)** - ضمان أن كل تفاعل واجهة له انتقال (Transition) مقابل في آلة الحالة.

```json
{
  "contracts": {
    "form": {
      "emits": [
        {
          "event": "SAVE",
          "trigger": "submit",
          "payload": { "type": "FormData" }
        },
        {
          "event": "CANCEL",
          "trigger": "click",
          "payload": { "type": "void" }
        }
      ],
      "requires": ["SAVE", "CANCEL"],
      "entityAware": true
    },
    "entity-table": {
      "emits": [
        {
          "event": "VIEW",
          "trigger": "action",
          "payload": { "type": "EntityRow" },
          "optional": true
        },
        {
          "event": "SELECT",
          "trigger": "select",
          "payload": { "type": "EntityRow" },
          "optional": true
        },
        {
          "event": "EDIT",
          "trigger": "action",
          "payload": { "type": "EntityRow" },
          "optional": true
        },
        {
          "event": "DELETE",
          "trigger": "action",
          "payload": { "type": "EntityRow" },
          "optional": true
        }
      ],
      "requires": [],
      "entityAware": true,
      "configDriven": true
    }
  }
}
```

### خصائص العقد

| الخاصية | الوصف |
|----------|-------|
| `emits` | الأحداث التي يمكن للمكوّن إرسالها |
| `requires` | الأحداث التي يجب أن يكون لها انتقالات (دائرة مغلقة) |
| `entityAware` | المكوّن يستقبل بيانات الكيان |
| `configDriven` | الأحداث تُحدد بالإعدادات (مثال: `itemActions`) |

### تعريف الحدث

| الخاصية | الوصف |
|----------|-------|
| `event` | اسم الحدث (مثال: `SAVE`، `CANCEL`، `SELECT`) |
| `trigger` | ما يحفّز الحدث: `click`، `submit`، `change`، `action`، `close` |
| `payload` | نوع الحمولة: `void`، `FormData`، `EntityRow`، أو شكل مخصص |
| `optional` | إذا كانت `true`، الانتقال ليس مطلوباً |

### تكامل الدائرة المغلقة

عقود الأحداث تُشغّل التحقق من [الدائرة المغلقة](/docs/ar/core-concepts/closed-circuit):

1. **الأحداث المطلوبة**: إذا كان `requires: ["SAVE", "CANCEL"]`، يضمن المُحقق وجود انتقالات لكلا الحدثين
2. **أنماط الطبقة**: `modal` و`drawer` تتطلب انتقالات `CLOSE` لمنع حالات واجهة عالقة
3. **الأحداث المدفوعة بالإعدادات**: لـ `entity-table` مع `itemActions: [{ event: "DELETE" }]`، يتحقق المُحقق من وجود انتقال `DELETE`

---

## متطلبات واجهة المكوّن

المكوّنات المربوطة بالأنماط يجب أن تنفذ واجهات محددة للمشاركة في الدائرة المغلقة.

### EntityBoundPatternProps

للمكوّنات المرتبطة بالبيانات (`entity-table`، `entity-list`، `form`، إلخ.):

```typescript
interface EntityBoundPatternProps {
  entity?: string;           // اسم نوع الكيان
  data?: unknown[];          // مصفوفة البيانات
  isLoading?: boolean;       // حالة التحميل
  error?: Error | null;      // حالة الخطأ
}
```

### تكامل ناقل الأحداث (Event Bus)

جميع المكوّنات التفاعلية يجب أن تُرسل أحداثاً عبر ناقل الأحداث، وليس استدعاءات داخلية:

```typescript
// صحيح - يستخدم ناقل الأحداث
const handleRowClick = (row: EntityRow) => {
  eventBus.emit('UI:SELECT', { row });
};

// خطأ - إدارة حالة داخلية
const handleRowClick = (row: EntityRow) => {
  setSelectedRow(row);  // يكسر الدائرة!
};
```

### نمط خصائص الإجراءات

المكوّنات ذات الإجراءات القابلة للتهيئة تستقبلها كخصائص:

```typescript
interface ActionablePatternProps {
  actions?: Array<{
    label: string;
    event: string;        // الحدث المُرسل
    variant?: 'primary' | 'secondary' | 'danger';
    icon?: string;
  }>;
  itemActions?: Array<{   // للإجراءات على مستوى الصف
    label: string;
    event: string;
    icon?: string;
  }>;
}
```

المكوّن يُرسل `UI:{event}` عند تحفيز الإجراء، مكملاً الدائرة عائداً إلى آلة الحالة.

---

## نظام التصميم (Design System)

نظام التصميم يحتوي على التطبيقات الفعلية للمكوّنات التي ترتبط بها الأنماط.

### تسلسل المكوّنات

| المستوى | الغرض | أمثلة |
|---------|-------|-------|
| **الذرات (Atoms)** | عناصر واجهة غير قابلة للتقسيم | `Button`، `Input`، `Badge`، `Icon`، `Spinner` |
| **الجزيئات (Molecules)** | تركيبات بسيطة | `SearchInput`، `Tabs`، `Breadcrumb`، `FilterGroup` |
| **الكائنات العضوية (Organisms)** | مكوّنات معقدة مستقلة | `DataTable`، `Form`، `PageHeader`، `ModalSlot` |
| **القوالب (Templates)** | تخطيطات مستوى الصفحة | مكوّنات صفحة كاملة خاصة بالعميل |

---

## استخدام الأنماط في البرامج

### تأثير render-ui

تُستخدم الأنماط عبر تأثير `render-ui` في انتقالات السمات:

```json
{
  "from": "viewing",
  "to": "viewing",
  "event": "INIT",
  "effects": [
    ["render-ui", "main", {
      "type": "page-header",
      "title": "Tasks",
      "actions": [
        { "label": "Create Task", "event": "CREATE", "variant": "primary" }
      ]
    }],
    ["render-ui", "main", {
      "type": "entity-table",
      "entity": "Task",
      "columns": ["title", "status", "assignee"],
      "itemActions": [
        { "label": "Edit", "event": "EDIT" },
        { "label": "Delete", "event": "DELETE", "variant": "danger" }
      ]
    }]
  ]
}
```

### التحقق من الخصائص

المُصرِّف يتحقق من الخصائص مقابل `propsSchema`:

1. **الخصائص المطلوبة** يجب أن تكون موجودة
2. **أنواع الخصائص** يجب أن تطابق الأنواع المسموحة
3. **الخصائص غير المعروفة** تولّد تحذيرات

### ربط الأحداث

لكل حدث action/itemAction:

1. المكوّن يُرسل `UI:{EVENT}` عبر ناقل الأحداث
2. خطاف `useUIEvents` يلتقط ويوزع إلى السمة
3. آلة الحالة تعالج الحدث
4. التأثيرات تُنفَّذ، وقد تُعيد العرض

---

## الأنماط المتاحة

الأنماط التالية متاحة مباشرة:

### أنماط العرض

| النمط | الوصف | الخصائص الشائعة |
|-------|-------|----------------|
| `entity-table` | جدول بيانات مع أعمدة وترتيب | `entity`، `columns`، `itemActions` |
| `entity-list` | عرض قائمة لعناصر الكيان | `entity`، `itemActions` |
| `entity-cards` | تخطيط شبكة بطاقات للكيانات | `entity`، `columns`، `itemActions` |
| `stats` | عرض إحصائيات بالبطاقات | `items` |
| `detail-view` | عرض تفاصيل كيان واحد | `entity`، `fields` |

### أنماط النماذج

| النمط | الوصف | الخصائص الشائعة |
|-------|-------|----------------|
| `form` | نموذج كامل مع التحقق | `entity`، `fields`، `layout` |
| `form-section` | حقول نموذج مجمّعة | `title`، `fields` |
| `form-fields` | حقول نموذج مضمّنة | `fields` |

### أنماط الترويسات

| النمط | الوصف | الخصائص الشائعة |
|-------|-------|----------------|
| `page-header` | عنوان الصفحة مع إجراءات | `title`، `subtitle`، `actions` |
| `title-only` | عرض عنوان بسيط | `title` |

### أنماط التصفية

| النمط | الوصف | الخصائص الشائعة |
|-------|-------|----------------|
| `search-bar` | حقل بحث شامل | `placeholder`، `entity` |
| `filter-group` | شرائح/أزرار تصفية | `filters` |
| `search-input` | حقل بحث مستقل | `placeholder` |

### أنماط التنقل

| النمط | الوصف | الخصائص الشائعة |
|-------|-------|----------------|
| `tabs` | تنقل بالتبويبات | `items`، `activeTab` |
| `breadcrumb` | مسار التنقل | `items` |
| `wizard-progress` | مؤشر خطوات المعالج | `steps`، `currentStep` |
| `pagination` | تنقل بين الصفحات | `page`، `totalPages` |

### أنماط التخطيط

| النمط | الوصف | الخصائص الشائعة |
|-------|-------|----------------|
| `modal` | نافذة منبثقة | `title`، `children` |
| `drawer` | لوحة جانبية | `title`، `position` |
| `master-detail` | تخطيط عرض مقسم | `master`، `detail` |
| `dashboard-grid` | تخطيط شبكي للوحات المعلومات | `items` |

### أنماط الحالة

| النمط | الوصف | الخصائص الشائعة |
|-------|-------|----------------|
| `empty-state` | عنصر نائب للبيانات الفارغة | `title`، `description`، `action` |
| `loading-state` | مؤشر التحميل | `message` |
| `error-state` | عرض الخطأ | `error`، `onRetry` |

---

## ملخص

يوفر نظام الأنماط:

1. **سجل الأنماط** - يحدد الأنماط المتاحة مع الخصائص والفئات والبيانات الوصفية
2. **ربط المكوّنات** - يصل أنواع الأنماط بمكوّنات الغلاف
3. **عقود الأحداث** - تحدد الأحداث التي ترسلها المكوّنات وتتطلبها
4. **التحقق من الدائرة المغلقة** - يضمن أن جميع تفاعلات الواجهة لها معالجات في آلة الحالة
5. **نظام التصميم** - يحتوي على التطبيقات الفعلية للمكوّنات

هذه البنية تضمن أن البرامج تبقى تصريحية بينما يعالج المُصرِّف تعقيد ربط المكوّنات بنظام آلة الحالة المدفوع بالأحداث.

---

*لمزيد من التفاصيل حول المفاهيم ذات الصلة، انظر [السمات](/docs/ar/core-concepts/traits) و[الدائرة المغلقة](/docs/ar/core-concepts/closed-circuit).*
