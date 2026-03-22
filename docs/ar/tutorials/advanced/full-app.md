# بناء تطبيق كامل متعدد الوحدات المدارية

> المصدر: [`tests/schemas/09-full-app.orb`](../../../../tests/schemas/09-full-app.orb)

هذا التعليمي يمشي عبر برنامج `full-app-test` الكامل - تطبيق حقيقي بثلاث وحدات مدارية مترابطة. يجمع كل شيء من التعليمات السابقة: الكيانات (Entities)، آلات الحالة (State Machines)، render-ui، الحراس (Guards)، والأحداث عبر الوحدات المدارية.

<OrbitalDiagram />

---

## نظرة عامة على التطبيق

```
TaskManager orbital          ProjectManager orbital       UserManager orbital
  entity: Task                 entity: Project              entity: User
  traits:                      traits:                      traits:
    TaskLifecycle                ProjectStats                 UserBrowser
    TaskCRUD                   listens:                     pages:
  pages:                         TASK_COMPLETED               /users
    /tasks                       TASK_CREATED
  emits:
    TASK_COMPLETED
    TASK_CREATED
```

**تدفق البيانات:**
1. المستخدم ينشئ أو يكمل مهمة في `TaskManager`
2. `TaskManager` يُرسل `TASK_CREATED` أو `TASK_COMPLETED`
3. `ProjectManager` يستمع ويحدّث عدادات المشروع

---

## الوحدة المدارية 1: TaskManager

### الكيان (Entity)

```orb
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

### السمة 1: TaskLifecycle

تدير حالة سير عمل المهمة. تُرسل `TASK_COMPLETED` عند الموافقة على المهمة أو إكمالها مباشرة.

**الحالات:** `todo → inProgress → review → done`

### السمة 2: TaskCRUD

تدير واجهة القائمة. تُرسل `TASK_CREATED` عند حفظ مهمة جديدة.

**الحالات:** `listing → creating | editing`

### Emits على مستوى الوحدة المدارية

```orb
"emits": ["TASK_COMPLETED", "TASK_CREATED"]
```

---

## الوحدة المدارية 2: ProjectManager

### الكيان (Entity)

يتتبع إحصائيات مجمّعة لكل مشروع، تُحدَّث تفاعلياً عند تغيير المهام:

```orb
{
  "name": "Project",
  "persistence": "persistent",
  "collection": "projects",
  "fields": [
    { "name": "id", "type": "string", "required": true },
    { "name": "name", "type": "string", "required": true },
    { "name": "description", "type": "string" },
    { "name": "taskCount", "type": "number", "default": 0 },
    { "name": "completedCount", "type": "number", "default": 0 }
  ]
}
```

### السمة: ProjectStats

تستمع لكل من `TASK_COMPLETED` و`TASK_CREATED` وتزيد العدادات:

```orb
{
  "name": "ProjectStats",
  "linkedEntity": "Project",
  "category": "interaction",
  "listens": [
    { "event": "TASK_COMPLETED", "scope": "external" },
    { "event": "TASK_CREATED", "scope": "external" }
  ],
  "stateMachine": {
    "states": [{ "name": "idle", "isInitial": true }],
    "events": [
      { "key": "INIT", "name": "Initialize" },
      { "key": "TASK_COMPLETED", "name": "Task Completed" },
      { "key": "TASK_CREATED", "name": "Task Created" }
    ],
    "transitions": [
      {
        "from": "idle", "event": "INIT", "to": "idle",
        "effects": [
          ["fetch", "Project"],
          ["render-ui", "main", {
            "type": "stats",
            "items": [
              { "label": "Total Tasks", "value": "@entity.taskCount" },
              { "label": "Completed", "value": "@entity.completedCount" }
            ]
          }]
        ]
      },
      {
        "from": "idle", "event": "TASK_CREATED", "to": "idle",
        "effects": [["increment", "@entity.taskCount", 1]]
      },
      {
        "from": "idle", "event": "TASK_COMPLETED", "to": "idle",
        "effects": [["increment", "@entity.completedCount", 1]]
      }
    ]
  }
}
```

أحداث `TASK_CREATED` و`TASK_COMPLETED` تُستقبل من `TaskManager`. تحفّز انتقالات حلقة ذاتية تُطلق تأثيرات `increment` لتحديث إحصائيات المشروع في الوقت الحقيقي.

---

## الوحدة المدارية 3: UserManager

أبسط وحدة مدارية - متصفح قراءة فقط للمستخدمين مع إجراء تنقل إلى التفاصيل.

```orb
{
  "name": "UserBrowser",
  "linkedEntity": "User",
  "category": "interaction",
  "stateMachine": {
    "states": [{ "name": "browsing", "isInitial": true }],
    "events": [
      { "key": "INIT", "name": "Initialize" },
      { "key": "VIEW", "name": "View User", "payload": [
        { "name": "id", "type": "string", "required": true }
      ]}
    ],
    "transitions": [
      {
        "from": "browsing", "event": "INIT", "to": "browsing",
        "effects": [
          ["fetch", "User"],
          ["render-ui", "main", {
            "type": "entity-table", "entity": "User",
            "columns": ["name", "email", "role"],
            "itemActions": [{ "event": "VIEW", "label": "View" }]
          }]
        ]
      },
      {
        "from": "browsing", "event": "VIEW", "to": "browsing",
        "effects": [["navigate", "/users/@payload.id"]]
      }
    ]
  }
}
```

---

## ملخص مسارات التطبيق

| المسار | الوحدة المدارية | السمة | الوصف |
|--------|----------------|-------|-------|
| `/tasks` | TaskManager | TaskCRUD | تصفح، إنشاء، تعديل، حذف المهام |
| `/tasks/:id` | TaskManager | TaskCRUD | التنقل إلى تفاصيل المهمة (عبر تأثير `navigate`) |
| `/projects` | ProjectManager | ProjectStats | عرض إحصائيات المشروع المُحدَّثة بأحداث المهام |
| `/users` | UserManager | UserBrowser | تصفح المستخدمين، نقر لعرض التفاصيل |

---

## الأنماط في هذا التطبيق

| المفهوم | أين يظهر |
|---------|----------|
| سمات متعددة لكل وحدة مدارية | TaskManager لديها TaskLifecycle + TaskCRUD |
| حالات نهائية | `done` في TaskLifecycle (`isTerminal: true`) |
| إرسال عبر الوحدات المدارية | TaskLifecycle تُرسل `TASK_COMPLETED`، TaskCRUD تُرسل `TASK_CREATED` |
| استماع عبر الوحدات المدارية | ProjectStats تستمع لكلا الحدثين وتزيد العدادات |
| انتقالات حلقة ذاتية | جميع انتقالات INIT؛ معالجات أحداث ProjectStats |
| الحمولة في الأحداث | `VIEW` تحمل `id`؛ `TASK_COMPLETED` تحمل `taskId` + `projectId` |
| تأثير navigate | انتقال VIEW في TaskCRUD ينتقل إلى `/tasks/@payload.id` |
| تأثير increment | ProjectStats تستخدم `["increment", "@entity.taskCount", 1]` |

---

## الخطوات التالية

- [توليد البرامج بالذكاء الاصطناعي](./ai-generation.md) - جعل الذكاء الاصطناعي يولّد برامج مثل هذا
- [الحراس وقواعد العمل](../intermediate/guards.md) - إضافة حراس صلاحيات لسير عمل المهام
- [أنماط الواجهة وrender-ui](../intermediate/ui-patterns.md) - تحسين الواجهة بمزيد من أنواع الأنماط
