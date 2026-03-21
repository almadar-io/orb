---
slug: schema-first-development
title: "التطوير بالـ schema أولاً: لماذا نكتب JSON قبل TypeScript"
authors: [osamah]
tags: [architecture, tutorial]
image: /img/blog/schema-first-development.png
---

![التطوير بالـ schema أولاً: الـ schema الذي يصبح المبنى](/img/blog/schema-first-development.png)

ماذا لو عرّفت تطبيقك بالكامل في ملف JSON واحد قبل أن تكتب أي كود مكوّنات؟

<!-- truncate -->

## التدفق التقليدي

تطوير الواجهات الأمامية غالباً ما يبدو هكذا:

1. تصميم نماذج الواجهة
2. إنشاء التسلسل الهرمي للمكوّنات
3. تعريف واجهات TypeScript
4. بناء المكوّنات
5. إضافة إدارة الحالة
6. الربط بالخادم الخلفي
7. اكتشاف أن الواجهة البرمجية لا تتوافق مع الأنواع
8. إعادة هيكلة كل شيء

هذا تكراري، استكشافي، وغالباً ما يؤدي لعدم تطابق بين الواجهة الأمامية والخلفية.

## البديل: الـ schema (المخطط التصريحي) أولاً

Almadar يعكس هذا التدفق:

1. **عرّف الـ schema** — الـ entities (نماذج البيانات)، الـ traits (الخصائص السلوكية)، الصفحات، الـ state machines (أنظمة الحالة)
2. **تحقق منه** — التقط الأخطاء قبل كتابة الكود
3. **compile (صرّف)** — وَلِّد TypeScript أو Python أو Rust
4. **شغّله** — شاهده يعمل فوراً
5. **خصّصه** — أضف منطق الأعمال حيث يلزم

يصبح الـ schema **مصدر الحقيقة الوحيد** لتطبيقك بالكامل.

## ماذا يحتوي الـ schema؟

يحتوي schema الـ Almadar (ملف `.orb`) على:

```json
{
  "name": "TaskApp",
  "version": "1.0.0",
  "orbitals": [
    {
      "name": "TaskManagement",
      "entity": {
        "name": "Task",
        "collection": "tasks",
        "fields": [
          { "name": "id", "type": "string", "required": true, "primaryKey": true },
          { "name": "title", "type": "string", "required": true },
          { "name": "status", "type": "enum", "values": ["todo", "in-progress", "done"] },
          { "name": "assigneeId", "type": "relation", "relation": { "entity": "User" } }
        ]
      },
      "traits": [
        {
          "name": "TaskBrowser",
          "linkedEntity": "Task",
          "stateMachine": {
            "states": [
              { "name": "Browsing", "isInitial": true },
              { "name": "Creating" },
              { "name": "Editing" }
            ],
            "events": [
                      { "key": "INIT", "name": "Initialize" },
                      { "key": "CREATE", "name": "Create" },
                      { "key": "EDIT", "name": "Edit" },
                      { "key": "SAVE", "name": "Save" },
                      { "key": "CANCEL", "name": "Cancel" }
                    ],
            "transitions": [
              {
                "from": "Browsing",
                "to": "Browsing",
                "event": "INIT",
                "effects": [
                  ["render-ui", "main", {
                    "type": "page-header",
                    "title": "Tasks",
                    "actions": [{ "label": "New Task", "event": "CREATE" }]
                  }],
                  ["render-ui", "main", {
                    "type": "entity-table",
                    "entity": "Task",
                    "columns": ["title", "status"],
                    "itemActions": [
                      { "label": "Edit", "event": "EDIT" }
                    ]
                  }]
                ]
              },
              {
                "from": "Browsing",
                "to": "Creating",
                "event": "CREATE",
                "effects": [
                  ["render-ui", "modal", {
                    "type": "form-section",
                    "entity": "Task",
                    "fields": ["title", "status"],
                    "submitEvent": "SAVE",
                    "cancelEvent": "CANCEL"
                  }]
                ]
              },
              {
                "from": "Creating",
                "to": "Browsing",
                "event": "SAVE",
                "effects": [
                  ["persist", "create", "Task", "@payload.data"],
                  ["render-ui", "modal", null],
                  ["emit", "INIT"]
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
          "traits": [{ "ref": "TaskBrowser" }]
        }
      ]
    }
  ]
}
```

هذا الملف الواحد يعرّف:
- **نموذج البيانات** (entity مع حقول)
- **منطق الأعمال** (state machine مع transitions)
- **هيكل الواجهة** (effects من نوع render-ui مع patterns)
- **المسارات** (صفحات مع مسارات URL)

## شبكة أمان التحقق

قبل توليد الكود، Almadar يتحقق من الـ schema الخاص بك:

```bash
$ orbital validate task-app.orb

✓ Schema structure valid
✓ Entity fields valid
✓ State machine complete
✓ All transitions have handlers
✓ Pattern props match registry
✓ Closed circuit verified

Validation passed! Ready to compile.
```

إذا كان هناك خطأ:

```bash
✗ Error: CIRCUIT_NO_OVERLAY_EXIT
  State 'Creating' renders to 'modal' slot but has no exit transition.
  Users will be stuck in this overlay.

  Fix: Add a transition from 'Creating' with event 'CANCEL' or 'CLOSE'
```

هذا يلتقط الأخطاء **قبل أن تكتب أي كود**.

## توليد التطبيقات

بعد التحقق، compile لهدفك المطلوب:

```bash
# TypeScript/React
orbital compile task-app.orb --shell typescript -o output/

# Python/FastAPI
orbital compile task-app.orb --shell python -o output/

# Rust/Axum
orbital compile task-app.orb --shell rust -o output/
```

كل هدف يُولّد:
- **واجهة أمامية**: مكوّنات React مع الـ state machine الخاصة بك
- **خادم خلفي**: مسارات API مع نماذج قاعدة البيانات
- **أنواع**: أنواع TypeScript/Python/Rust مشتركة
- **إدارة الحالة**: event bus (ناقل الأحداث) و transitions الحالة

## قاعدة "لا تحرّر الكود المُولَّد أبداً"

هنا الجزء غير البديهي: **لا تحرّر الملفات المُولَّدة**.

إذا احتجت تغييرات:
1. حرّر ملف `.orb` (الـ schema)
2. أعد الـ compile
3. التغييرات تتدفق تلقائياً

هذا يضمن:
- **الاتساق**: الـ schema والكود متطابقان دائماً
- **قابلية التكرار**: نفس الـ schema = نفس المخرجات
- **قابلية النقل**: compile لأهداف مختلفة من مصدر واحد

## تشبيه واقعي: ترحيل schema قاعدة البيانات

إذا استخدمت Rails أو Django أو Prisma، فأنت تعرف نمذجة البيانات بالـ schema أولاً:

```ruby
# Rails migration
class CreateTasks < ActiveRecord::Migration
  def change
    create_table :tasks do |t|
      t.string :title
      t.string :status
      t.timestamps
    end
  end
end
```

Almadar يوسّع هذه الفكرة لتشمل **التطبيق بأكمله**:
- ليس فقط schema قاعدة البيانات فقط
- بل state machines والواجهة والمسارات والـ effects أيضاً

## متى تستخدم التطوير بالـ schema أولاً

التطوير بالـ schema أولاً يتفوق في:

| السيناريو | الفائدة |
|-----------|---------|
| **منتج جديد** | ابدأ بالهيكل، كرّر بسرعة |
| **توسيع الفريق** | الـ schema مقروء للجميع (مدراء المنتج، المصممون، المطورون) |
| **منصات متعددة** | schema واحد ← ويب، موبايل، سطح مكتب |
| **صناعات مُنظَّمة** | الـ schema = مواصفات قابلة للتدقيق |
| **مساعدة الذكاء الاصطناعي** | نماذج اللغة الكبيرة تتفوق في توليد schemas منظّمة |

## جرّبه: ابنِ مدونة في 5 دقائق

أنشئ ملف `blog.orb`:

```json
{
  "name": "Blog",
  "version": "1.0.0",
  "orbitals": [
    {
      "name": "PostManagement",
      "uses": [{ "from": "std/List", "as": "List" }],
      "entity": {
        "name": "Post",
        "fields": [
          { "name": "title", "type": "string", "required": true },
          { "name": "content", "type": "string", "required": true },
          { "name": "published", "type": "boolean", "default": false }
        ]
      },
      "traits": [{ "ref": "List.traits.ListManagement" }],
      "pages": [{ "name": "PostsPage", "path": "/posts" }]
    }
  ]
}
```

compile وشغّل:
```bash
orbital compile blog.orb --shell typescript -o blog-app/
cd blog-app && npm install && npm run dev
```

الآن لديك لوحة إدارة مدونة تعمل مع قائمة وإنشاء وتعديل وحذف.

## الخلاصة

التطوير بالـ schema أولاً ليس حول إزالة المرونة — بل عن **الوضوح أولاً، المرونة ثانياً**.

بتعريف هيكل تطبيقك تصريحياً:
- تلتقط الأخطاء مبكراً
- فريقك لديه مواصفات مشتركة وقابلة للقراءة
- مساعدو الذكاء الاصطناعي يمكنهم فهم وتعديل تطبيقك
- يمكنك استهداف منصات متعددة

يصبح الـ schema **التوثيق الذي يُنفَّذ**.

هل أنت مستعد لكتابة أول schema الخاص بك؟ اطّلع على [دليل البدء](https://orb.almadar.io/docs/getting-started/introduction).
