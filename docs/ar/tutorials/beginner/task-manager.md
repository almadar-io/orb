# بناء مدير مهام

> المصدر: [`tests/schemas/09-full-app.orb`](../../../../tests/schemas/09-full-app.orb)

هذا التعليمي يبني مدير مهام حقيقي خطوة بخطوة. بنهايته سيكون لديك برنامج يحتوي على:
- كيان (Entity) `Task` مع استمرارية
- **سمة دورة حياة** (آلة حالة لحالة المهمة)
- **سمة CRUD** (قائمة، إنشاء، تعديل، حذف)
- صفحتان مربوطتان بالسمات

<OrbitalDiagram />

---

## ما الذي نبنيه

```
/tasks        → TaskListPage  (تصفح، إنشاء، تعديل، حذف المهام)
/tasks/:id    → التنقل إليها من القائمة (عرض التفاصيل)
```

الوحدة المدارية `TaskManager` لها كيان واحد (`Task`) وسمتان: واحدة لدورة حياة حالة المهمة، وأخرى لإدارة القائمة.

---

## الخطوة 1 - كيان المهمة (Task Entity)

```json
{
  "name": "Task",
  "persistence": "persistent",
  "collection": "tasks",
  "fields": [
    { "name": "id", "type": "string", "required": true },
    { "name": "title", "type": "string", "required": true },
    { "name": "description", "type": "string" },
    { "name": "priority", "type": "enum", "values": ["low", "medium", "high"], "default": "medium" },
    { "name": "dueDate", "type": "date" },
    { "name": "assigneeId", "type": "string" },
    { "name": "projectId", "type": "string" }
  ]
}
```

`persistence: "persistent"` يعني أن هذا مخزن في قاعدة البيانات. مفتاح `collection` يحدد اسم مجموعة/جدول قاعدة البيانات.

---

## الخطوة 2 - سمة دورة الحياة (Lifecycle Trait)

سمة `TaskLifecycle` تتتبع موقع المهمة في سير العمل: `todo → inProgress → review → done`.

```json
{
  "name": "TaskLifecycle",
  "linkedEntity": "Task",
  "category": "interaction",
  "stateMachine": {
    "states": [
      { "name": "todo", "isInitial": true },
      { "name": "inProgress" },
      { "name": "review" },
      { "name": "done", "isTerminal": true, "description": "Task completed" }
    ],
    "events": [
      { "key": "INIT", "name": "Initialize" },
      { "key": "START", "name": "Start Task" },
      { "key": "SUBMIT_FOR_REVIEW", "name": "Submit for Review" },
      { "key": "APPROVE", "name": "Approve" },
      { "key": "REJECT", "name": "Request Changes" },
      { "key": "COMPLETE", "name": "Complete" }
    ],
    "transitions": [
      {
        "from": "todo", "event": "INIT", "to": "todo",
        "effects": [
          ["fetch", "Task"],
          ["render-ui", "main", {
            "type": "stats",
            "items": [
              { "label": "Todo", "value": "@entity.todo" },
              { "label": "In Progress", "value": "@entity.inProgress" },
              { "label": "Done", "value": "@entity.done" }
            ]
          }]
        ]
      },
      { "from": "todo", "event": "START", "to": "inProgress" },
      { "from": "inProgress", "event": "SUBMIT_FOR_REVIEW", "to": "review" },
      {
        "from": "review", "event": "APPROVE", "to": "done",
        "effects": [
          ["emit", "TASK_COMPLETED", { "taskId": "@entity.id", "projectId": "@entity.projectId" }]
        ]
      },
      { "from": "review", "event": "REJECT", "to": "inProgress" },
      {
        "from": "inProgress", "event": "COMPLETE", "to": "done",
        "effects": [
          ["emit", "TASK_COMPLETED", { "taskId": "@entity.id", "projectId": "@entity.projectId" }]
        ]
      }
    ]
  }
}
```

**أنماط ملحوظة:**
- الحلقة الذاتية `INIT` تعرض لوحة `stats` توضح العدد حسب الحالة
- `isTerminal: true` على `done` يعني أنه لا يُسمح بانتقالات إضافية من تلك الحالة
- `emit` تنشر حدثاً عبر الوحدات المدارية (انظر [التواصل عبر الوحدات المدارية](../intermediate/cross-orbital.md))

---

## الخطوة 3 - سمة CRUD

سمة `TaskCRUD` تعالج واجهة إدارة القائمة: عرض القائمة، الإنشاء، التعديل، والحذف.

```json
{
  "name": "TaskCRUD",
  "linkedEntity": "Task",
  "category": "interaction",
  "stateMachine": {
    "states": [
      { "name": "listing", "isInitial": true },
      { "name": "creating" },
      { "name": "editing" }
    ],
    "events": [
      { "key": "INIT", "name": "Initialize" },
      { "key": "VIEW", "name": "View Task", "payload": [
        { "name": "id", "type": "string", "required": true }
      ]},
      { "key": "CREATE", "name": "Create Task" },
      { "key": "EDIT", "name": "Edit Task" },
      { "key": "SAVE", "name": "Save" },
      { "key": "CANCEL", "name": "Cancel" },
      { "key": "DELETE", "name": "Delete Task" }
    ],
    "transitions": [
      {
        "from": "listing", "event": "INIT", "to": "listing",
        "effects": [
          ["fetch", "Task"],
          ["render-ui", "main", {
            "type": "entity-table", "entity": "Task",
            "columns": ["title", "priority", "dueDate"],
            "itemActions": [
              { "event": "VIEW", "label": "View" },
              { "event": "EDIT", "label": "Edit" },
              { "event": "DELETE", "label": "Delete" }
            ]
          }]
        ]
      },
      {
        "from": "listing", "event": "CREATE", "to": "creating",
        "effects": [["render-ui", "main", { "type": "form", "entity": "Task" }]]
      },
      {
        "from": "creating", "event": "SAVE", "to": "listing",
        "effects": [["persist", "update", "Task", "@entity"], ["notify", "success", "Task created"]]
      },
      { "from": "creating", "event": "CANCEL", "to": "listing" },
      { "from": "listing", "event": "EDIT", "to": "editing" },
      {
        "from": "editing", "event": "SAVE", "to": "listing",
        "effects": [["persist", "update", "Task", "@entity"]]
      },
      { "from": "editing", "event": "CANCEL", "to": "listing" },
      {
        "from": "listing", "event": "DELETE", "to": "listing",
        "effects": [["persist", "delete", "Task", "@entity.id"], ["notify", "info", "Task deleted"]]
      },
      {
        "from": "listing", "event": "VIEW", "to": "listing",
        "effects": [["navigate", "/tasks/@payload.id"]]
      }
    ]
  }
}
```

**ما تفعله آلة الحالة:**
- `listing` - INIT يعرض الجدول. المستخدم يمكنه VIEW أو CREATE أو EDIT أو DELETE من هنا.
- `creating` - ينتقل إلى نموذج؛ SAVE يحفظ ويعود للقائمة، CANCEL يعود
- `editing` - نفس نمط creating لكن لسجل موجود
- `VIEW` يتنقل إلى صفحة التفاصيل باستخدام `id` من الحمولة

**الحمولة في الأحداث:** حدث `VIEW` يحمل `id` ليعرف وقت التشغيل أي مهمة تم النقر عليها. يمكن الوصول إليها في التأثيرات بـ `@payload.id`.

---

## الخطوة 4 - إضافة الصفحات (Pages)

```json
"pages": [
  {
    "name": "TaskListPage",
    "path": "/tasks",
    "traits": [{ "ref": "TaskCRUD", "linkedEntity": "Task" }]
  }
]
```

---

## التحقق والتشغيل

```bash
# التحقق من البرنامج
orb validate schema.orb

# بدء خادم التطوير
orb dev
```

انتقل إلى `http://localhost:3000/tasks` لرؤية مدير المهام.

---

## الخطوات التالية

- [أنماط الواجهة وrender-ui](../intermediate/ui-patterns.md) - تعمق أكثر في `entity-table` و`form` وغيرها
- [الحراس وقواعد العمل](../intermediate/guards.md) - تقييد من يمكنه إكمال أو حذف المهام
- [التواصل عبر الوحدات المدارية](../intermediate/cross-orbital.md) - ربط TaskManager بـ ProjectManager
- [بناء تطبيق كامل](../advanced/full-app.md) - التطبيق الكامل من 3 وحدات مدارية
