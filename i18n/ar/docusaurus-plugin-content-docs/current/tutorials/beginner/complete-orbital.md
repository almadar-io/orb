# تشريح وحدة مدارية كاملة

> كل ميزة في Orb هي وحدة مدارية (Orbital). الوحدة المدارية ليست كاملة بدون أجزائها الأربعة.

<OrbitalDiagram />

## الأجزاء الأربعة للوحدة المدارية

الوحدة المدارية هي الوحدة الأساسية لتطبيق Orb. يجب أن تحتوي على:

```
Orbital = Entity + Trait(s) + State Machine + Pages
```

| الجزء | الغرض | غيابه يعني... |
|-------|-------|-------------|
| `entity` | ما هي البيانات التي تديرها | لا توجد بيانات للعمل بها |
| `traits` | كيف يتصرف التطبيق | لا سلوك ولا واجهة |
| `stateMachine` | الحالات والأحداث والانتقالات | لا توجد دورة حياة محددة |
| `pages` | أين تظهر الواجهة (المسارات) | الصفحة تُحمّل فارغة، لا شيء يُعرض |

**الصفحات (Pages) هي الجزء الأكثر نسياناً.** بدون `pages`، السمة (Trait) موجودة لكنها لا تُثبَّت على أي مسار، والمستخدم لا يرى شيئاً.

---

## الخطوة 1 - تعريف الكيان (Entity)

الكيان هو بنية بياناتك. يصف ما تديره وكيف يُحفظ.

```orb
{
  "name": "Task",
  "persistence": "persistent",
  "collection": "tasks",
  "fields": [
    { "name": "id", "type": "string", "required": true },
    { "name": "title", "type": "string", "required": true },
    { "name": "status", "type": "enum", "values": ["pending", "done"], "default": "pending" }
  ]
}
```

**أنواع الحقول:** `string`، `number`، `boolean`، `date`، `timestamp`، `enum`، `array`، `object`، `relation`

**أوضاع الاستمرارية (Persistence):**
- `persistent` - مخزن في قاعدة البيانات (Firestore، PostgreSQL)
- `runtime` - في الذاكرة، خاص بالجلسة (عربة التسوق، حالة المعالج)
- `singleton` - نسخة عامة واحدة (إعدادات التطبيق، المستخدم الحالي)

---

## الخطوة 2 - تعريف آلة الحالة (State Machine)

آلة الحالة تعيش داخل سمة (Trait). تصف الحالات الممكنة للميزة والأحداث التي تسبب الانتقالات (Transitions).

### الحالات (States)

كل آلة حالة تحتاج حالة واحدة على الأقل محددة بـ `"isInitial": true`. الحالات هي **كائنات**، وليست نصوصاً:

```orb
"states": [
  { "name": "Pending", "isInitial": true },
  { "name": "Done", "isTerminal": true }
]
```

### الأحداث (Events)

الأحداث هي محفّزات - إجراءات المستخدم، أحداث النظام، أو خطافات دورة الحياة:

```orb
"events": [
  { "key": "INIT", "name": "Initialize" },
  { "key": "COMPLETE", "name": "Complete Task" }
]
```

> **`INIT` إلزامي.** بدون انتقال INIT، الصفحة تُحمّل لكن لا تعرض شيئاً.

### الانتقالات (Transitions)

الانتقالات تربط الحالات والأحداث ببعضها. يمكن أن تحمل حراساً (Guards) (شروط) وتأثيرات (Effects) (إجراءات):

```orb
"transitions": [
  {
    "from": "Pending",
    "event": "INIT",
    "to": "Pending",
    "effects": [
      ["fetch", "Task"],
      ["render-ui", "main", {
        "type": "entity-table",
        "entity": "Task",
        "columns": ["title", "status"],
        "itemActions": [
          { "event": "COMPLETE", "label": "Complete" }
        ]
      }]
    ]
  },
  {
    "from": "Pending",
    "event": "COMPLETE",
    "to": "Done",
    "effects": [
      ["persist", "update", "Task", "@entity"],
      ["notify", "success", "Task completed!"]
    ]
  }
]
```

---

## الخطوة 3 - بناء السمة (Trait)

غلّف آلة الحالة في سمة مع `name` و`linkedEntity` و`category`:

```orb
{
  "name": "TaskLifecycle",
  "linkedEntity": "Task",
  "category": "interaction",
  "stateMachine": {
    "states": [
      { "name": "Pending", "isInitial": true },
      { "name": "Done", "isTerminal": true }
    ],
    "events": [
      { "key": "INIT", "name": "Initialize" },
      { "key": "COMPLETE", "name": "Complete Task" }
    ],
    "transitions": [
      {
        "from": "Pending",
        "event": "INIT",
        "to": "Pending",
        "effects": [
          ["fetch", "Task"],
          ["render-ui", "main", {
            "type": "entity-table",
            "entity": "Task",
            "columns": ["title", "status"],
            "itemActions": [
              { "event": "COMPLETE", "label": "Complete" }
            ]
          }]
        ]
      },
      {
        "from": "Pending",
        "event": "COMPLETE",
        "to": "Done",
        "effects": [
          ["persist", "update", "Task", "@entity"],
          ["notify", "success", "Task completed!"]
        ]
      }
    ]
  }
}
```

**`category`** يمكن أن يكون:
- `interaction` - لها واجهة، تُطلق تأثيرات `render-ui`
- `integration` - استدعاءات خدمات خلفية، بدون واجهة

---

## الخطوة 4 - إضافة الصفحات (Pages)

الصفحات تربط السمات بمسارات URL. هذا هو الجزء الأكثر نسياناً.

```orb
"pages": [
  {
    "name": "TaskListPage",
    "path": "/tasks",
    "traits": [
      { "ref": "TaskLifecycle", "linkedEntity": "Task" }
    ]
  }
]
```

- `path` هو مسار URL (يدعم معاملات `:id`، مثال: `/tasks/:id`)
- `traits[].ref` يشير إلى سمة بالاسم المحدد في نفس الوحدة المدارية
- `traits[].linkedEntity` يخبر وقت التشغيل أي كيان يُربط

---

## الوحدة المدارية الكاملة

تجميع كل شيء معاً - وحدة مدارية `TaskManager` تعمل بالكامل:

```lolo
;; app TaskManager

orbital Tasks {
  entity Task [persistent: tasks] {
    id : string!
    title : string!
    status : string
  }
  trait TaskLifecycle -> Task [interaction] {
    initial: Pending
    state Pending {
      INIT -> Pending
        (fetch Task)
        (render-ui main { type: "entity-table", entity: "Task", fields: ["title", "status"], columns: ["title", "status"], itemActions: [{ event: "COMPLETE", label: "Complete" }] })
      COMPLETE -> Done
        (persist update Task @entity)
        (notify success "Task completed!")
    }
    state Done {}
  }
  page "/tasks" -> TaskLifecycle
}
```

---

## الأخطاء الشائعة

### صفحات مفقودة (`pages`)

```orb
// ❌ غير مكتمل - لا شيء يُعرض على أي مسار
{
  "name": "Tasks",
  "entity": { ... },
  "traits": [ { "name": "TaskLifecycle", ... } ]
}

// ✅ مكتمل - السمة مُثبتة على /tasks
{
  "name": "Tasks",
  "entity": { ... },
  "traits": [ { "name": "TaskLifecycle", ... } ],
  "pages": [
    { "name": "TaskListPage", "path": "/tasks", "traits": [{ "ref": "TaskLifecycle", "linkedEntity": "Task" }] }
  ]
}
```

### الحالات كنصوص (غير صالح)

```orb
// ❌ صيغة خاطئة
"states": ["Pending", "Done"]

// ✅ الحالات يجب أن تكون كائنات
"states": [
  { "name": "Pending", "isInitial": true },
  { "name": "Done", "isTerminal": true }
]
```

### انتقال INIT مفقود

```orb
// ❌ الصفحة تفتح لكنها فارغة - لا يوجد render-ui أولي
"transitions": [
  { "from": "Pending", "event": "COMPLETE", "to": "Done", "effects": [...] }
]

// ✅ أضف حلقة ذاتية على INIT لعرض الواجهة الأولية
"transitions": [
  {
    "from": "Pending", "event": "INIT", "to": "Pending",
    "effects": [["fetch", "Task"], ["render-ui", "main", { "type": "entity-table", "entity": "Task" }]]
  },
  { "from": "Pending", "event": "COMPLETE", "to": "Done", "effects": [...] }
]
```

---

## الخطوات التالية

- [بناء مدير مهام](./task-manager.md) - إضافة CRUD كامل لهذا النمط
- [أنماط الواجهة وrender-ui](../intermediate/ui-patterns.md) - استكشاف جميع أنواع الأنماط
- [الحراس وقواعد العمل](../intermediate/guards.md) - إضافة شروط للانتقالات
