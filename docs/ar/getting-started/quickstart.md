---
id: quickstart
title: البداية السريعة
sidebar_label: البداية السريعة
---

# البداية السريعة

ابنِ وشغّل تطبيقاً كاملاً في أقل من 5 دقائق. بنهاية هذا الدليل، سيكون لديك مدير مهام يعمل بجدول بيانات، نماذج إنشاء/تعديل، وإدارة الحالة.

## المتطلبات الأولية

- واجهة سطر أوامر `orb` مثبتة ([التثبيت](./installation.md))
- Node.js 18+ وnpm

## 1. اكتب أول ملف .orb

أنشئ ملفاً باسم `my-app.orb` بالمحتوى التالي:

```json
{
  "app": {
    "name": "my-app",
    "title": "My Task Manager"
  },
  "orbitals": [
    {
      "name": "TaskManager",
      "entity": {
        "name": "Task",
        "persistence": "persistent",
        "collection": "tasks",
        "fields": [
          { "name": "id", "type": "string", "required": true },
          { "name": "title", "type": "string", "required": true },
          { "name": "description", "type": "string" },
          { "name": "status", "type": "enum", "values": ["pending", "in_progress", "done"], "default": "pending" }
        ]
      },
      "traits": [
        {
          "name": "TaskCrud",
          "linkedEntity": "Task",
          "category": "interaction",
          "stateMachine": {
            "states": [
              { "name": "Listing", "isInitial": true },
              { "name": "Creating" },
              { "name": "Editing" }
            ],
            "events": [
              { "key": "INIT", "name": "Initialize" },
              { "key": "CREATE", "name": "Create Task" },
              { "key": "EDIT", "name": "Edit Task" },
              { "key": "SAVE", "name": "Save" },
              { "key": "CANCEL", "name": "Cancel" },
              { "key": "DELETE", "name": "Delete Task" }
            ],
            "transitions": [
              {
                "from": "Listing",
                "event": "INIT",
                "to": "Listing",
                "effects": [
                  ["fetch", "Task"],
                  ["render-ui", "main", {
                    "type": "entity-table",
                    "entity": "Task",
                    "columns": ["title", "status"],
                    "actions": [
                      { "event": "CREATE", "label": "New Task", "icon": "plus" }
                    ],
                    "itemActions": [
                      { "event": "EDIT", "label": "Edit" },
                      { "event": "DELETE", "label": "Delete", "variant": "danger" }
                    ]
                  }]
                ]
              },
              {
                "from": "Listing",
                "event": "CREATE",
                "to": "Creating",
                "effects": [
                  ["render-ui", "modal", {
                    "type": "entity-form",
                    "entity": "Task",
                    "fields": ["title", "description", "status"],
                    "submitEvent": "SAVE",
                    "cancelEvent": "CANCEL"
                  }]
                ]
              },
              {
                "from": "Creating",
                "event": "SAVE",
                "to": "Listing",
                "effects": [
                  ["persist", "create", "Task", "@payload"],
                  ["notify", "success", "Task created"]
                ]
              },
              {
                "from": "Creating",
                "event": "CANCEL",
                "to": "Listing"
              },
              {
                "from": "Listing",
                "event": "EDIT",
                "to": "Editing",
                "effects": [
                  ["render-ui", "modal", {
                    "type": "entity-form",
                    "entity": "Task",
                    "fields": ["title", "description", "status"],
                    "submitEvent": "SAVE",
                    "cancelEvent": "CANCEL"
                  }]
                ]
              },
              {
                "from": "Editing",
                "event": "SAVE",
                "to": "Listing",
                "effects": [
                  ["persist", "update", "Task", "@entity"],
                  ["notify", "success", "Task updated"]
                ]
              },
              {
                "from": "Editing",
                "event": "CANCEL",
                "to": "Listing"
              },
              {
                "from": "Listing",
                "event": "DELETE",
                "to": "Listing",
                "effects": [
                  ["persist", "delete", "Task", "@entity.id"],
                  ["notify", "success", "Task deleted"]
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
          "traits": [
            { "ref": "TaskCrud", "linkedEntity": "Task" }
          ]
        }
      ]
    }
  ]
}
```

هذا الملف الواحد يحدد التطبيق الكامل: كيان (Entity) `Task` بأربعة حقول، سمة (Trait) `TaskCrud` مع تدفقات قائمة/إنشاء/تعديل/حذف، وصفحة (Page) تربطها بمسار `/tasks`.

## 2. التحقق

تحقق من صحة البرنامج قبل التصريف:

```bash
orb validate my-app.orb
```

يجب أن ترى مخرجات تؤكد صفر أخطاء وصفر تحذيرات. إذا كانت هناك مشاكل، يطبع المُحقق الموقع الدقيق ووصف كل مشكلة.

## 3. التصريف

ولّد تطبيق TypeScript الكامل:

```bash
orb compile my-app.orb --shell typescript
```

هذا ينشئ مجلد `my-app/` يحتوي على واجهة React المولّدة، خادم Express، والأنواع المشتركة.

## 4. تثبيت التبعيات

```bash
cd my-app
npm install
```

## 5. تشغيل خادم التطوير

```bash
npm run dev
```

هذا يبدأ كلاً من الواجهة الأمامية (Vite) والخلفية (Express) في وضع التطوير.

## 6. فتح في المتصفح

انتقل إلى [http://localhost:5173](http://localhost:5173). سترى:

- جدول بيانات للمهام (فارغ في البداية)
- زر "New Task" يفتح نموذجاً في نافذة منبثقة
- إجراءات تعديل وحذف على كل صف
- إشعارات مؤقتة عند الإنشاء والتحديث والحذف

جرّب إنشاء بعض المهام، تعديل واحدة، وحذف أخرى. دورة حياة CRUD الكاملة تعمل مباشرة من آلة الحالة (State Machine) التي حددتها.

## ما الذي بنيته للتو

من ملف `.orb` واحد، ولّد المُصرِّف:

- **مكوّنات React** لجدول الكيانات، نموذج النافذة المنبثقة، وتخطيط الصفحة
- **مسارات Express API** لعمليات CRUD على كيان Task
- **أنواع TypeScript مشتركة** لكيان Task، تُستخدم من كل من العميل والخادم
- **منطق آلة الحالة** الذي يقود انتقالات الواجهة (حالات Listing، Creating، Editing)
- **طبقة بيانات تجريبية** ليعمل التطبيق فوراً بدون قاعدة بيانات

كل نقرة زر، إرسال نموذج، وإجراء جدول يتبع نمط الدائرة المغلقة (Closed Circuit): حدث (Event)، حارس (Guard)، انتقال (Transition)، تأثيرات (Effects)، استجابة واجهة. آلة الحالة في ملف `.orb` تتحكم في المسار الكامل.

## الخطوات التالية

- [بنية المشروع](./project-structure.md) لفهم ما تم توليده
- [المفاهيم الأساسية: الكيانات](/docs/ar/core-concepts/entities) للتعرف على أنواع الكيانات والحقول
- [المفاهيم الأساسية: السمات](/docs/ar/core-concepts/traits) للتعمق في آلات الحالة
- [بناء مدير مهام (تعليمي)](/docs/ar/tutorials/beginner/task-manager) لشرح تفصيلي أكثر مع سمات متعددة
