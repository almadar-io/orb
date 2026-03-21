# الصفحات (Pages)

> كيف تعمل الصفحات في بنية Orb - التوجيه، ربط السمات، الفتحات، والتنقل.

**ذو صلة:**
- [الكيانات](./entities.md)
- [السمات](./traits.md)

---

## نظرة عامة

في Orb، **الصفحة (Page)** هي مسار يجمع السمات لعرض واجهة المستخدم. التركيبة الأساسية هي:

```
Orbital = Entity + Traits + Pages
```

بينما تحدد [الكيانات](./entities.md) البيانات و[السمات](./traits.md) السلوك، تحدد الصفحات **أين** يتفاعل المستخدمون مع النظام. الصفحات **مدفوعة بالسمات** - لا تحتوي على واجهة مستخدم مباشرة، بل تشير إلى سمات تملأ تأثيرات `render-ui` الخاصة بها الصفحة.

---

## تعريف الصفحة (Page)

تُعرَّف الصفحة (Page) في برنامج `.orb` بالبنية التالية:

```json
{
  "name": "TaskListPage",
  "path": "/tasks",
  "viewType": "list",
  "primaryEntity": "Task",
  "traits": [
    { "ref": "TaskBrowser", "linkedEntity": "Task" },
    { "ref": "FilterPanel", "linkedEntity": "Task" }
  ]
}
```

### خصائص الصفحة

| الخاصية | مطلوبة | الوصف |
|----------|--------|-------|
| `name` | نعم | معرِّف بصيغة PascalCase (مثال: `TaskListPage`) |
| `path` | نعم | مسار URL يبدأ بـ `/` |
| `viewType` | لا | تلميح دلالي: `list`، `detail`، `create`، `edit`، `dashboard`، `custom` |
| `primaryEntity` | لا | الكيان الأساسي الذي تعمل عليه هذه الصفحة |
| `traits` | نعم | مصفوفة مراجع السمات التي تقود الواجهة |
| `isInitial` | لا | ما إذا كانت هذه صفحة نقطة الدخول |

---

## المسارات وأنماط المسارات

مسارات الصفحات تحدد مسارات URL لتطبيقك.

### قواعد المسارات

- يجب أن تبدأ بـ `/`
- الأحرف الصالحة: حروف، أرقام، شرطات، شرطات سفلية، نقطتان، شرطات مائلة
- يجب أن تكون فريدة عبر جميع الصفحات في البرنامج

### المسارات الثابتة

مسارات بسيطة بدون أجزاء ديناميكية:

```json
{ "path": "/tasks" }
{ "path": "/dashboard" }
{ "path": "/settings/profile" }
```

### الأجزاء الديناميكية

استخدم صيغة النقطتين للمعاملات الديناميكية:

```json
{ "path": "/tasks/:id" }
{ "path": "/users/:userId/tasks/:taskId" }
{ "path": "/projects/:projectId/members/:memberId" }
```

تُستخرج الأجزاء الديناميكية وتكون متاحة في:
- حمولات الأحداث (`@payload.id`)
- تأثيرات التنقل
- عمليات البحث عن الكيانات

### أمثلة المسارات

| المسار | الوصف |
|--------|-------|
| `/tasks` | صفحة قائمة المهام |
| `/tasks/:id` | تفاصيل مهمة واحدة |
| `/tasks/create` | إنشاء مهمة جديدة |
| `/tasks/:id/edit` | تعديل مهمة موجودة |
| `/users/:id/profile` | ملف المستخدم |
| `/dashboard` | عرض لوحة المعلومات |

---

## أنواع العرض (View Types)

أنواع العرض هي تلميحات دلالية حول غرض الصفحة:

| النوع | الغرض | الأنماط النموذجية |
|-------|-------|------------------|
| `list` | عرض مجموعة كيانات | `entity-table`، `entity-cards`، `entity-list` |
| `detail` | عرض كيان واحد | `entity-detail`، `stats` |
| `create` | إنشاء كيان جديد | `form` |
| `edit` | تعديل كيان موجود | `form` |
| `dashboard` | نظرة عامة بأقسام متعددة | `dashboard-grid`، `stats` |
| `custom` | تخطيط مخصص | أي أنماط |

**مهم:** أنواع العرض لا تقيّد الواجهة. العرض الفعلي يُتحكم به عبر تأثيرات `render-ui` في [السمات](./traits.md#effects). أنواع العرض هي بيانات وصفية لأجل:
- التوثيق
- تلميحات توليد الكود
- بناء هيكل الواجهة

---

## ربط الصفحة بالسمة

الصفحات تشير إلى السمات التي توفر سلوكها وواجهتها.

### مراجع السمات

```json
{
  "pages": [
    {
      "name": "TaskListPage",
      "path": "/tasks",
      "traits": [
        { "ref": "TaskBrowser", "linkedEntity": "Task" },
        { "ref": "QuickActions", "linkedEntity": "Task", "config": { "showCreate": true } }
      ]
    }
  ]
}
```

### بنية PageTraitRef

| الخاصية | مطلوبة | الوصف |
|----------|--------|-------|
| `ref` | نعم | اسم السمة أو مسارها (مثال: `"TaskBrowser"`، `"Std.traits.CRUD"`) |
| `linkedEntity` | لا | الكيان الذي تعمل عليه هذه السمة |
| `config` | لا | إعدادات خاصة بالسمة |

### سمات متعددة لكل صفحة

يمكن للصفحة أن تحتوي على سمات متعددة، كل منها تساهم بواجهة في فتحات مختلفة:

```json
{
  "name": "DashboardPage",
  "path": "/dashboard",
  "traits": [
    { "ref": "StatsSummary", "linkedEntity": "Analytics" },
    { "ref": "RecentActivity", "linkedEntity": "Activity" },
    { "ref": "QuickActions", "linkedEntity": "Task" }
  ]
}
```

كل تأثير `render-ui` في السمة يستهدف [فتحات](#الفتحات-وعرض-واجهة-المستخدم) محددة.

### linkedEntity على السمات

خاصية `linkedEntity` تربط السمة بكيان محدد:

```json
{ "ref": "StatusManager", "linkedEntity": "Task" }
```

هذا يعني:
- ربط `@entity` في السمة يُحل إلى بيانات `Task`
- تأثيرات مثل `persist` تعمل على مجموعة `Task`
- آلة حالة السمة تدير نسخ `Task`

انظر [ربط السمة بالكيان](./traits.md#linkedentity-trait-entity-binding) للتفاصيل.

---

## الكيان الأساسي (Primary Entity)

خاصية `primaryEntity` تشير إلى الكيان الرئيسي الذي تعمل عليه الصفحة:

```json
{
  "name": "TaskDetailPage",
  "path": "/tasks/:id",
  "primaryEntity": "Task",
  "traits": [
    { "ref": "TaskViewer" },
    { "ref": "CommentList", "linkedEntity": "Comment" }
  ]
}
```

**الاستخدام:**
- الكيان الافتراضي للسمات بدون `linkedEntity` صريح
- التحقق من وجود الكيان
- تلميحات توليد الكود
- ليس مطلوباً إذا حددت جميع السمات كيانها صراحة

---

## الفتحات وعرض واجهة المستخدم

السمات تعرض واجهة المستخدم عبر تأثيرات `render-ui` التي تستهدف **الفتحات (Slots)** - مناطق مسماة في الصفحة.

### الفتحات المتاحة

| الفتحة | الغرض |
|--------|-------|
| `main` | منطقة المحتوى الأساسي |
| `sidebar` | لوحة جانبية |
| `modal` | طبقة نافذة منبثقة |
| `drawer` | لوحة درج |
| `overlay` | طبقة ملء الشاشة |
| `center` | محتوى مركزي |
| `toast` | إشعارات مؤقتة |
| `hud-top` | HUD علوي (واجهة الألعاب) |
| `hud-bottom` | HUD سفلي (واجهة الألعاب) |
| `floating` | عنصر عائم |
| `system` | مكونات نظام غير مرئية |

### تأثير render-ui

السمات تملأ الفتحات باستخدام تأثير `render-ui`:

```json
["render-ui", "main", {
  "type": "entity-table",
  "entity": "Task",
  "columns": ["title", "status", "dueDate"],
  "itemActions": [
    { "event": "VIEW", "label": "View" },
    { "event": "EDIT", "label": "Edit" }
  ]
}]
```

### مسار الفتحات

```
┌─────────────────────────────────────────────────────────────┐
│  Page: TaskListPage                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Slot: main                                          │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │  Pattern: entity-table (from TaskBrowser)   │    │   │
│  │  │  - Columns: title, status, dueDate          │    │   │
│  │  │  - Actions: VIEW, EDIT                      │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Slot: sidebar                                       │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │  Pattern: filter-panel (from FilterPanel)   │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### عمليات عرض متعددة لنفس الفتحة

إذا عرضت سمات متعددة في نفس الفتحة، تتراكم (الأحدث تستبدل أو تُضاف حسب نوع النمط):

```json
// السمة A
["render-ui", "main", { "type": "stats", ... }]

// السمة B (لاحقاً في الصفحة)
["render-ui", "main", { "type": "entity-table", ... }]
```

---

## التنقل (Navigation)

التنقل بين الصفحات يُعالج عبر تأثير `navigate` في السمات.

### تأثير navigate

```json
["navigate", "/tasks/:id", { "id": "@payload.taskId" }]
```

**الصيغة:** `["navigate", path, params?]`

| الوسيط | الوصف |
|--------|-------|
| `path` | مسار الصفحة المستهدفة (يمكن أن يتضمن أجزاء ديناميكية) |
| `params` | كائن اختياري لملء الأجزاء الديناميكية |

### أمثلة التنقل

**تنقل بسيط:**
```json
["navigate", "/dashboard"]
```

**مع معرِّف الكيان:**
```json
["navigate", "/tasks/@entity.id"]
```

**مع الحمولة:**
```json
["navigate", "/tasks/:id", { "id": "@payload.taskId" }]
```

**مسار متداخل:**
```json
["navigate", "/users/:userId/tasks/:taskId", {
  "userId": "@entity.assigneeId",
  "taskId": "@entity.id"
}]
```

### التنقل في الانتقالات

التنقل عادة يحدث بعد تغييرات الحالة:

```json
{
  "from": "editing",
  "to": "saved",
  "event": "SAVE",
  "effects": [
    ["persist", "update", "Task", "@entity.id", "@payload"],
    ["notify", "Task saved!", "success"],
    ["navigate", "/tasks/@entity.id"]
  ]
}
```

انظر [التأثيرات](./traits.md#effects) لمزيد من التفاصيل.

---

## الصفحة الأولية (Initial Page)

حدد صفحة كنقطة دخول باستخدام `isInitial`:

```json
{
  "name": "HomePage",
  "path": "/",
  "isInitial": true,
  "traits": [
    { "ref": "WelcomeBanner" }
  ]
}
```

**السلوك:**
- التطبيق يحمّل هذه الصفحة أولاً
- إعادة التوجيه من الجذر (`/`) تذهب إلى هنا
- صفحة واحدة فقط يجب تحديدها كأولية لكل وحدة مدارية

---

## التحقق من الصفحة (Page Validation)

تُتحقق الصفحات في وقت التصريف بهذه القواعد:

### الحقول المطلوبة
- `name` - يجب أن يكون بصيغة PascalCase
- `path` - يجب أن يبدأ بـ `/`، أحرف صالحة فقط
- `traits` - يجب أن تحتوي على مرجع سمة واحد على الأقل

### أخطاء التحقق

| الخطأ | الوصف |
|-------|-------|
| `PageMissingName` | اسم الصفحة مطلوب |
| `PageMissingPath` | مسار الصفحة مطلوب |
| `PageInvalidPath` | المسار لا يطابق النمط |
| `PageEmptyTraits` | مصفوفة السمات لا يمكن أن تكون فارغة |
| `PageInvalidTraitRef` | السمة المشار إليها غير موجودة |
| `PageInvalidViewType` | viewType ليس في القائمة الصالحة |
| `PageDuplicatePath` | صفحة أخرى تستخدم نفس المسار |

---

## مثال كامل

مثال صفحة كاملة مع سمات متعددة:

```json
{
  "orbitals": [
    {
      "name": "TaskManagement",
      "entity": {
        "name": "Task",
        "collection": "tasks",
        "fields": [
          { "name": "id", "type": "string", "required": true },
          { "name": "title", "type": "string", "required": true },
          { "name": "status", "type": "enum", "values": ["pending", "active", "done"] },
          { "name": "assigneeId", "type": "relation", "relation": { "entity": "User" } }
        ]
      },
      "traits": [
        {
          "name": "TaskBrowser",
          "linkedEntity": "Task",
          "stateMachine": {
            "states": [
              { "name": "idle", "isInitial": true },
              { "name": "viewing" }
            ],
            "transitions": [
              {
                "from": "idle",
                "to": "viewing",
                "event": "INIT",
                "effects": [
                  ["fetch", "Task", {}],
                  ["render-ui", "main", {
                    "type": "entity-table",
                    "entity": "Task",
                    "columns": ["title", "status", "assigneeId"],
                    "itemActions": [
                      { "event": "VIEW", "label": "View" },
                      { "event": "EDIT", "label": "Edit" }
                    ]
                  }]
                ]
              },
              {
                "from": "viewing",
                "to": "viewing",
                "event": "VIEW",
                "effects": [
                  ["navigate", "/tasks/@payload.id"]
                ]
              }
            ]
          }
        },
        {
          "name": "TaskViewer",
          "linkedEntity": "Task",
          "stateMachine": {
            "states": [
              { "name": "loading", "isInitial": true },
              { "name": "viewing" }
            ],
            "transitions": [
              {
                "from": "loading",
                "to": "viewing",
                "event": "INIT",
                "effects": [
                  ["fetch", "Task", { "id": "@payload.id" }],
                  ["render-ui", "main", {
                    "type": "entity-detail",
                    "entity": "Task",
                    "fields": ["title", "status", "assigneeId", "createdAt"]
                  }]
                ]
              },
              {
                "from": "viewing",
                "to": "viewing",
                "event": "EDIT",
                "effects": [
                  ["navigate", "/tasks/@entity.id/edit"]
                ]
              },
              {
                "from": "viewing",
                "to": "viewing",
                "event": "BACK",
                "effects": [
                  ["navigate", "/tasks"]
                ]
              }
            ]
          }
        }
      ],
      "pages": [
        {
          "name": "TaskListPage",
          "path": "/tasks",
          "viewType": "list",
          "primaryEntity": "Task",
          "isInitial": true,
          "traits": [
            { "ref": "TaskBrowser", "linkedEntity": "Task" }
          ]
        },
        {
          "name": "TaskDetailPage",
          "path": "/tasks/:id",
          "viewType": "detail",
          "primaryEntity": "Task",
          "traits": [
            { "ref": "TaskViewer", "linkedEntity": "Task" }
          ]
        }
      ]
    }
  ]
}
```

---

## المبادئ الأساسية

1. **الصفحات مدفوعة بالسمات** - الصفحات حاويات لمراجع السمات. الواجهة تنبثق من تأثيرات `render-ui` في السمات، وليس من تعريفات الصفحات.

2. **بنية الفتحات** - الواجهة تتدفق عبر فتحات موحدة (`main`، `sidebar`، `modal`)، مما يمكّن تركيب التخطيطات بدون تعليمات ثابتة.

3. **المسار كعقد** - مسار الصفحة هو الواجهة الأساسية، يحدد عنوان URL الذي يتنقل إليه المستخدمون.

4. **ربط الكيان الصريح** - `linkedEntity` على مراجع السمات يجعل علاقات الكيانات صريحة.

5. **لا حالة للصفحة** - الصفحات تركيبية بحتة. كل الحالة تعيش في آلات حالة السمات.

6. **التنقل مدفوع بالتأثيرات** - التنقل هو تأثير يُحفَّز بانتقالات السمات، وليس خاصية صفحة.

---

## ملخص

يوفر نظام الصفحات في Orb:

1. **التوجيه** - تنقل مبني على المسارات مع أجزاء ديناميكية
2. **تركيب السمات** - سمات متعددة لكل صفحة، كل منها تساهم بواجهة
3. **الفتحات** - مناطق مسماة لوضع الواجهة (main، sidebar، modal، إلخ.)
4. **أنواع العرض** - تلميحات دلالية لغرض الصفحة (list، detail، dashboard)
5. **التنقل** - توجيه مدفوع بالتأثيرات بين الصفحات
6. **ربط الكيان** - علاقات كيان صريحة عبر `linkedEntity`
7. **التحقق** - المُصرِّف يفرض تفرد المسارات ووجود السمات

الصفحات هي طبقة التوجيه والتركيب - تحدد **أين** يذهب المستخدمون، بينما [السمات](./traits.md) تحدد **ماذا** يحدث و[الكيانات](./entities.md) تحدد **ما هي البيانات** المتضمنة.
