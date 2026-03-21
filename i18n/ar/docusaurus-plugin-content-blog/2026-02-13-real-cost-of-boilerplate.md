---
slug: real-cost-of-boilerplate
title: "من 10,000 سطر إلى 200: التكلفة الحقيقية للـ boilerplate"
authors: [osamah]
tags: [startups, productivity, tutorial]
---

هل تريد بناء مدير مهام؟ عمليات CRUD بسيطة: إنشاء، قراءة، تحديث، حذف.

الطريقة التقليدية: 10,000 سطر موزعة على أكثر من 50 ملفًا. طريقة Almadar: 200 سطر في ملف واحد.

هذه ليست مقارنة نظرية. لنعدّ معًا.

<!-- truncate -->

## المكدس التقليدي: تدقيق عدد الأسطر

بناء مدير مهام باستخدام React + Express + PostgreSQL. لنعدّ كل ملف تحتاجه:

### الواجهة الأمامية (~4,500 سطر)

```
src/
  types/Task.ts                    ~30 lines   (interface, enums)
  api/tasks.ts                     ~80 lines   (fetch, create, update, delete)
  hooks/useTasks.ts                ~60 lines   (React Query wrapper)
  hooks/useCreateTask.ts           ~40 lines   (mutation hook)
  hooks/useUpdateTask.ts           ~40 lines   (mutation hook)
  hooks/useDeleteTask.ts           ~35 lines   (mutation hook)
  components/TaskList.tsx           ~120 lines  (table, loading, error, empty)
  components/TaskRow.tsx            ~60 lines   (row with actions)
  components/TaskForm.tsx           ~150 lines  (form with validation)
  components/TaskDetail.tsx         ~100 lines  (detail view)
  components/DeleteConfirm.tsx      ~50 lines   (confirmation modal)
  pages/TasksPage.tsx              ~80 lines   (page layout, routing)
  store/taskSlice.ts               ~120 lines  (Redux slice or Zustand store)
  App.tsx (routing)                ~40 lines   (React Router setup)
  main.tsx                         ~20 lines   (entry point)
```

بالإضافة إلى التنسيق والاختبارات والإعداد:

```
  components/*.css                 ~400 lines  (or Tailwind classes)
  __tests__/TaskList.test.tsx      ~150 lines
  __tests__/TaskForm.test.tsx      ~200 lines
  __tests__/TaskDetail.test.tsx    ~100 lines
  vite.config.ts                   ~30 lines
  tsconfig.json                    ~25 lines
  package.json                     ~40 lines
```

**إجمالي الواجهة الأمامية: ~2,000 سطر من الشيفرة + ~500 سطر من الاختبارات + ~100 سطر من الإعداد = ~2,600**

### الواجهة الخلفية (~3,200 سطر)

```
src/
  models/Task.ts                   ~60 lines   (Prisma/TypeORM model)
  routes/tasks.ts                  ~150 lines  (CRUD endpoints)
  controllers/taskController.ts    ~200 lines  (business logic)
  middleware/auth.ts               ~80 lines   (authentication)
  middleware/validation.ts         ~100 lines  (request validation)
  services/taskService.ts          ~150 lines  (database queries)
  types/task.ts                    ~40 lines   (request/response types)
  index.ts                         ~60 lines   (Express setup)
  database/migrations/             ~80 lines   (table creation)
  database/seed.ts                 ~40 lines   (test data)
```

بالإضافة إلى الاختبارات والإعداد:

```
  __tests__/tasks.test.ts          ~300 lines  (API tests)
  __tests__/taskService.test.ts    ~200 lines  (unit tests)
  prisma/schema.prisma             ~30 lines
  tsconfig.json                    ~25 lines
  package.json                     ~35 lines
  .env                             ~10 lines
  Dockerfile                       ~20 lines
```

**إجمالي الواجهة الخلفية: ~960 سطر من الشيفرة + ~500 سطر من الاختبارات + ~120 سطر من الإعداد = ~1,580**

### المشترك/البنية التحتية (~800 سطر)

```
  docker-compose.yml               ~40 lines
  .github/workflows/ci.yml         ~80 lines
  README.md                        ~100 lines
  package.json (root)              ~30 lines
  Shared types between FE/BE       ~50 lines
  Error handling utilities          ~80 lines
  Logger setup                     ~40 lines
```

### المجموع الكلي: مدير مهام تقليدي

| الفئة | الأسطر |
|-------|--------|
| شيفرة الواجهة الأمامية | 2,000 |
| اختبارات الواجهة الأمامية | 500 |
| شيفرة الواجهة الخلفية | 960 |
| اختبارات الواجهة الخلفية | 500 |
| الإعداد/البنية التحتية | 920 |
| **المجموع** | **~4,880** |

وتعتبر هذه النسخة *البسيطة*. بدون ترقيم صفحات، بدون بحث، بدون فلاتر، بدون تحديثات متفائلة، بدون حدود خطأ. تصل التطبيقات الحقيقية بسهولة إلى أكثر من 10,000 سطر لما يراه المستخدمون على أنه "مدير مهام بسيط."

## نسخة Almadar: 120 سطرًا

```json
{
  "name": "Taskly",
  "version": "1.0.0",
  "orbitals": [{
    "name": "TaskManagement",
    "entity": {
      "name": "Task",
      "collection": "tasks",
      "fields": [
        { "name": "title", "type": "string", "required": true },
        { "name": "description", "type": "string" },
        { "name": "status", "type": "enum", "values": ["todo", "in-progress", "done"] },
        { "name": "priority", "type": "enum", "values": ["low", "medium", "high"] },
        { "name": "assignee", "type": "string" },
        { "name": "dueDate", "type": "date" }
      ]
    },
    "traits": [{
      "name": "TaskInteraction",
      "category": "interaction",
      "linkedEntity": "Task",
      "stateMachine": {
        "states": [
          { "name": "Browsing", "isInitial": true },
          { "name": "Creating" },
          { "name": "Viewing" },
          { "name": "Editing" },
          { "name": "Deleting" }
        ],
        "events": [
          { "key": "INIT", "name": "Initialize" },
          { "key": "CREATE", "name": "Create Task" },
          { "key": "VIEW", "name": "View Task" },
          { "key": "EDIT", "name": "Edit Task" },
          { "key": "DELETE", "name": "Delete Task" },
          { "key": "SAVE", "name": "Save" },
          { "key": "CANCEL", "name": "Cancel" },
          { "key": "CONFIRM_DELETE", "name": "Confirm Delete" }
        ],
        "transitions": [
          {
            "from": "Browsing", "to": "Browsing", "event": "INIT",
            "effects": [
              ["render-ui", "main", {
                "type": "page-header",
                "title": "Tasks",
                "actions": [{ "label": "New Task", "event": "CREATE", "variant": "primary" }]
              }],
              ["render-ui", "main", {
                "type": "entity-table",
                "entity": "Task",
                "columns": ["title", "status", "priority", "assignee", "dueDate"],
                "itemActions": [
                  { "label": "View", "event": "VIEW" },
                  { "label": "Edit", "event": "EDIT" },
                  { "label": "Delete", "event": "DELETE" }
                ]
              }]
            ]
          },
          {
            "from": "Browsing", "to": "Creating", "event": "CREATE",
            "effects": [
              ["render-ui", "modal", {
                "type": "form-section",
                "entity": "Task",
                "fields": ["title", "description", "status", "priority", "assignee", "dueDate"],
                "submitEvent": "SAVE",
                "cancelEvent": "CANCEL"
              }]
            ]
          },
          {
            "from": "Creating", "to": "Browsing", "event": "SAVE",
            "effects": [
              ["persist", "create", "Task", "@payload.data"],
              ["render-ui", "modal", null],
              ["emit", "INIT"]
            ]
          },
          {
            "from": "Creating", "to": "Browsing", "event": "CANCEL",
            "effects": [["render-ui", "modal", null]]
          },
          {
            "from": "Browsing", "to": "Viewing", "event": "VIEW",
            "effects": [
              ["render-ui", "modal", {
                "type": "entity-detail",
                "entity": "Task",
                "fields": ["title", "description", "status", "priority", "assignee", "dueDate"],
                "actions": [
                  { "label": "Edit", "event": "EDIT" },
                  { "label": "Close", "event": "CANCEL" }
                ]
              }]
            ]
          },
          {
            "from": "Viewing", "to": "Browsing", "event": "CANCEL",
            "effects": [["render-ui", "modal", null]]
          },
          {
            "from": "Viewing", "to": "Editing", "event": "EDIT",
            "effects": [
              ["render-ui", "modal", {
                "type": "form-section",
                "entity": "Task",
                "fields": ["title", "description", "status", "priority", "assignee", "dueDate"],
                "submitEvent": "SAVE",
                "cancelEvent": "CANCEL"
              }]
            ]
          },
          {
            "from": "Browsing", "to": "Editing", "event": "EDIT",
            "effects": [
              ["render-ui", "modal", {
                "type": "form-section",
                "entity": "Task",
                "fields": ["title", "description", "status", "priority", "assignee", "dueDate"],
                "submitEvent": "SAVE",
                "cancelEvent": "CANCEL"
              }]
            ]
          },
          {
            "from": "Editing", "to": "Browsing", "event": "SAVE",
            "effects": [
              ["persist", "update", "Task", "@entity"],
              ["render-ui", "modal", null],
              ["emit", "INIT"]
            ]
          },
          {
            "from": "Editing", "to": "Browsing", "event": "CANCEL",
            "effects": [["render-ui", "modal", null]]
          },
          {
            "from": "Browsing", "to": "Deleting", "event": "DELETE",
            "effects": [
              ["render-ui", "modal", {
                "type": "page-header",
                "title": "Are you sure you want to delete this task?",
                "actions": [
                  { "label": "Delete", "event": "CONFIRM_DELETE", "variant": "danger" },
                  { "label": "Cancel", "event": "CANCEL" }
                ]
              }]
            ]
          },
          {
            "from": "Deleting", "to": "Browsing", "event": "CONFIRM_DELETE",
            "effects": [
              ["persist", "delete", "Task", "@entity.id"],
              ["render-ui", "modal", null],
              ["emit", "INIT"]
            ]
          },
          {
            "from": "Deleting", "to": "Browsing", "event": "CANCEL",
            "effects": [["render-ui", "modal", null]]
          }
        ]
      }
    }],
    "pages": [{
      "name": "TasksPage",
      "path": "/tasks",
      "traits": [{ "ref": "TaskInteraction" }]
    }]
  }]
}
```

**120 سطرًا.** يولّد هذا:

- واجهة أمامية React بجدول ونماذج وعرض تفصيلي وتأكيد حذف
- واجهة خلفية Express بنقاط وصول CRUD
- نماذج قاعدة بيانات واستمرارية
- أنواع TypeScript مشتركة بين الواجهة الأمامية والخلفية
- إدارة الحالة عبر event bus (ناقل الأحداث — نظام يوزّع الأحداث بين المكونات)
- معالجة المسارات

```bash
orbital compile taskly.orb --shell typescript -o taskly-app/
cd taskly-app && npm install && npm run dev
```

## مُضاعِف الصيانة
لا تعتبر أسطر الشيفرة مجرد تكلفة تطوير. بل هي **ضريبة صيانة**.

يعتبر كل سطر:
- سطر يمكن أن يحتوي على خطأ
- سطر يحتاج شخص لفهمه عند التأهيل
- سطر يحتاج تحديثًا عند تغير المتطلبات
- سطر يحتاج اختبارًا

| المقياس | التقليدي (4,880 سطر) | Almadar (120 سطر) |
|---------|----------------------|------------------|
| مساحة سطح الأخطاء | ~4,880 موقع خطأ محتمل | ~120 موقع خطأ محتمل |
| وقت التأهيل | أيام إلى أسابيع | ساعات |
| انتشار التغييرات | تعديل الواجهة الأمامية + الخلفية + الأنواع | تعديل الـ schema، إعادة التصريف |
| تغطية الاختبار المطلوبة | ~1,000 سطر اختبار | التحقق من الـ schema + اختبارات الدخان |

عندما تغير اسم حقل في النسخة التقليدية، فإنك تحدث نموذج قاعدة البيانات ومخطط Prisma وواجهة TypeScript ونقطة وصول واجهة البرمجة ومكوِّن النموذج ومكوِّن الجدول ومكوِّن التفاصيل والاختبارات. **سبعة أماكن** لإعادة تسمية واحدة.

في Almadar، تغيره في تعريف الـ entity (الكيان — نموذج البيانات). مكان واحد. إعادة تصريف.

## ما الذي تتنازل عنه

لا يعد Almadar سحراً. إليك ما تتخلى عنه:

1. **واجهة مستخدم مخصصة** — تتبع المكوِّنات المُولَّدة patterns (أنماط تصميم). للتصميمات البكسلية الدقيقة، فأنت تبني نظام تصميم مخصص (الذي يدعمه Almadar أيضًا).
2. **أنماط وصول بيانات غير معتادة** — إذا لم يمكن التعبير عن استعلامك كعمليات CRUD قياسية، فأنت بحاجة إلى effects مخصصة.
3. **التحكم** — لا ترى أو تعدل مكوِّنات React المُولَّدة. إذا وجد في الشيفرة المُولَّدة خطأ، صلح الـ schema أو الـ compiler أو قالب الهيكل — وليس المخرجات.

تستحق هذه المقايضات لمعظم تطبيقات الأعمال — من النوع الذي يحتوي على نماذج وجداول ونوافذ منبثقة وعمليات CRUD — بأغلبية ساحقة.

## الخلاصة

لا تكمن تكلفة البرمجيات في كتابتها. بل في صيانتها.

يعني توليد schema من 120 سطرًا تطبيقًا من 5,000 سطر:
- 40 ضعف أقل من الشيفرة للصيانة
- 40 ضعف أصغر في مساحة سطح الأخطاء
- 40 ضعف أسرع في التأهيل
- مكان واحد للتعديل، وليس سبعة

لا يكمن السؤال الحقيقي في "هل يمكنني كتابة 5,000 سطر؟" بل "هل أريد صيانتها خلال السنوات الخمس القادمة؟"

ابدأ بـ[دليل البدء](https://orb.almadar.io/docs/getting-started/introduction) وشاهد الفرق بنفسك.
