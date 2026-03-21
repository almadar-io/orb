---
slug: three-execution-models
title: "ثلاثة نماذج تنفيذ، حقيقة واحدة: كيف حللنا مشكلة 'اكتب مرة، شغّل في أي مكان'"
authors: [osamah]
tags: [architecture]
image: /img/blog/three-execution-models.png
---

![ثلاثة نماذج تنفيذ، مصدر حقيقة واحد](/img/blog/three-execution-models.png)

نفس ملف `.orb` يعمل في المتصفح، وعلى الخادم، ويُصرَّف إلى كود أصلي. إليك كيف.

وعدت جافا بـ"اكتب مرة، شغّل في أي مكان." نحن نقدم "اكتب مرة، شغّل *في كل مكان بالشكل المناسب*."

<!-- truncate -->

## وعد وفشل "اكتب مرة، شغّل في أي مكان"

في عام 1995، وعدت جافا: *"اكتب مرة، شغّل في أي مكان."*

الواقع: *"اكتب مرة، صحّح الأخطاء في كل مكان."*

ما المشكلة؟ البيئات المختلفة تتطلب مقايضات مختلفة:
- **بيئة التطوير/IDE** — تحتاج تكرارًا سريعًا، تفسيرية
- **الإنتاج على الويب** — تحتاج أداءً، compiled (مُصرَّفة)
- **سطح المكتب/الموبايل** — تحتاج أداءً أصليًا، مُجمَّعة

حل واحد لا يناسب الجميع.

## حل Almadar: ثلاثة نماذج تنفيذ

من schema (مخطط يصف بنية التطبيق) واحد بصيغة `.orb`، يدعم Almadar ثلاثة نماذج تنفيذ:

```
.orb Schema
     │
     ├─────────────────┬─────────────────┐
     │                 │                 │
     ▼                 ▼                 ▼
TypeScript      Rust Runtime      Generated Code
Runtime         (Native)          (Compiled)
(Interpreted)                     (Production)
```

تم تحسين كل نموذج لبيئته.

## النموذج 1: بيئة تشغيل TypeScript

**الأفضل لـ:** التطوير، بيئة التطوير المتكاملة، التكرار السريع

```bash
# Start development server with live reload
almadar dev task-app.orb

# Opens browser at localhost:3000
# Schema changes auto-reload
```

**الخصائص:**
- بدء تشغيل سريع
- إعادة تحميل فورية
- قابلة للتصحيح
- متوافقة مع المتصفح/Node

**حالات الاستخدام:**
- معاينة بيئة التطوير المتكاملة
- بيئة التطوير
- الاختبار وتصحيح الأخطاء
- العروض التعليمية

## النموذج 2: بيئة تشغيل Rust

**الأفضل لـ:** التطبيقات الأصلية، أدوات سطر الأوامر، الأداء العالي

```bash
# Compile to native Rust binary
almadar compile task-app.orb --shell rust -o native/

# Build and run the native app
cd native && cargo build --release && ./target/release/task-app
```

ينتج الـ compiler (المحول البرمجي الذي يحوّل الـ schema لكود) في Almadar مشروع Rust كاملًا مع Axum للواجهة الخلفية و egui لواجهة المستخدم. الملف الثنائي الناتج هو تطبيق أصلي مستقل — بدون اعتماديات وقت التشغيل، بدون Node.js.

**الخصائص:**
- أداء أصلي
- ملفات ثنائية صغيرة
- آمن على الذاكرة
- متعدد المنصات

**حالات الاستخدام:**
- تطبيقات سطح المكتب
- أدوات سطر الأوامر
- الأنظمة المدمجة
- عملاء الألعاب

## النموذج 3: الكود المُولَّد

**الأفضل لـ:** نشر الإنتاج، التكامل المخصص

```bash
# Generate TypeScript
orbital compile app.orb --shell typescript -o output/

# Generate Python
orbital compile app.orb --shell python -o output/

# Generate Rust
orbital compile app.orb --shell rust -o output/
```

**الخصائص:**
- مُحسَّن للهدف
- قابل للتخصيص بالكامل
- مخرجات قابلة للقراءة
- جاهز للإنتاج

**حالات الاستخدام:**
- تطبيقات الويب الإنتاجية
- الـ microservices (خدمات مصغرة مستقلة)
- تطبيقات الموبايل (عبر React Native)
- التكاملات المخصصة

## الـ OIR — Orbital Intermediate Representation

كيف يتحول schema واحد إلى ثلاثة ملفات تنفيذية؟

السر هو **OIR** — الـ intermediate representation (التمثيل الوسيط بين الـ schema والكود النهائي):

```
.orb Schema
    │
    ▼
Parse → Validate → Enrich → Inline → Resolve
    │
    ▼
┌─────────────────────────────────────┐
│         OIR (Orbital IR)            │
│  - Resolved entities                │
│  - Normalized traits                │
│  - Flattened pages                  │
│  - Validated state machines         │
└─────────────────────────────────────┘
    │
    ├──────────────┬──────────────┐
    ▼              ▼              ▼
 TS Runtime    Rust Runtime    Code Generator
```

يعتبر الـ OIR **حجر رشيد** — تنسيق مشترك تفهمه جميع الأهداف.

## مثال: تطبيق المهام عبر جميع النماذج

### الـ schema

```json
{
  "name": "TaskApp",
  "orbitals": [{
    "name": "TaskManagement",
    "entity": {
      "name": "Task",
      "fields": [
        { "name": "title", "type": "string" },
        { "name": "status", "type": "enum", "values": ["todo", "done"] }
      ]
    },
    "traits": [{
      "name": "TaskBrowser",
      "linkedEntity": "Task",
      "stateMachine": {
        "states": [{ "name": "browsing", "isInitial": true }],
        "transitions": [{
          "from": "browsing",
          "to": "browsing",
          "event": "INIT",
          "effects": [
            ["render-ui", "main", { "type": "entity-table", "entity": "Task" }]
          ]
        }]
      }
    }],
    "pages": [{ "name": "TasksPage", "path": "/tasks" }]
  }]
}
```

### النموذج 1: بيئة تشغيل TypeScript

```bash
# Start development server — schema interpreted directly
almadar dev task-app.orb

# State machine runs in memory
# UI renders via React components
# Events handled by EventBus
```

### النموذج 2: بيئة تشغيل Rust

```bash
# Compile to standalone native binary
almadar compile task-app.orb --shell rust -o native/
cd native && cargo build --release

# State machine runs as native code
# UI via egui (immediate mode)
# Events via Rust channels
```

### النموذج 3: TypeScript مُولَّد

```typescript
// Generated code structure:
src/
├── components/
│   └── TaskTable.tsx      // entity-table pattern
├── pages/
│   └── TasksPage.tsx      // Route + trait binding
├── state/
│   └── TaskBrowser.ts     // State machine
├── types/
│   └── Task.ts            // Entity types
└── App.tsx                // Main app
```

شغّله:
```bash
cd output && npm install && npm run dev
```

## متى تستخدم أيًا منها

| السيناريو | بيئة التشغيل | لماذا |
|----------|---------|-----|
| بيئة التطوير/المعاينة | TypeScript | تكرار سريع |
| التطوير | TypeScript | إعادة تحميل فورية |
| الاختبار | TypeScript | تغذية راجعة سريعة |
| تطبيق سطح المكتب | Rust | أداء أصلي |
| أداة سطر أوامر | Rust | ملف ثنائي صغير وسريع |
| لعبة | Rust | أداء فوري |
| إنتاج ويب | TypeScript مُولَّد | حزمة مُحسَّنة |
| واجهة خلفية API | Python مُولَّد | تكامل FastAPI |
| microservice | Rust مُولَّد | أداء Axum |

## خط أنابيب البناء

```bash
# Development
orbital dev task-app.orb          # TypeScript Runtime

# Compile to Rust (Native)
orbital compile task-app.orb --shell rust -o native/  # Rust Runtime

# Production build
orbital compile task-app.orb --shell typescript -o prod/
orbital compile task-app.orb --shell python -o api/
orbital compile task-app.orb --shell rust -o native/
```

## تشبيه واقعي: LLVM

يفعل LLVM (الآلة الافتراضية منخفضة المستوى) للغات الأنظمة ما يفعله Almadar للتطبيقات:

**LLVM:**
- C/C++/Rust → LLVM IR → x86/ARM/WASM

**Almadar:**
- .orb Schema → OIR → TypeScript/Rust/Generated

يفصل الـ intermediate representation المصدر عن الهدف.

## فوائد هذه البنية

### للمطورين
- schema واحد، أهداف متعددة
- لا تكرار في الكود
- سلوك متسق عبر المنصات
- سهولة تبديل الأهداف

### للفرق
- الواجهة الأمامية والخلفية من نفس المصدر
- الموبايل والويب من نفس المصدر
- لا انحراف بين التطبيقات
- فهم مشترك

### للأعمال
- وقت أسرع للوصول إلى السوق
- تكاليف صيانة أقل
- مرونة المنصة
- مُقاوم للمستقبل

## المقارنة: التقليدي مقابل Almadar

### النهج التقليدي

```
Web App (React)     Mobile (React Native)    API (Node.js)
     │                      │                      │
     ▼                      ▼                      ▼
  Redux store         Different Redux        Different logic
  Component A         Component A'           Endpoint A
  Component B         Component B'           Endpoint B
  API client          API client             Controllers
     │                      │                      │
     └──────────────────────┼──────────────────────┘
                            │
                     Three implementations
                     of the same logic
```

**المشاكل:**
- تكرار الكود
- انحراف المنطق
- صيانة ثلاثية
- سلوك غير متسق

### نهج Almadar

```
                    .orb Schema
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    TypeScript        Rust            Generated
    Runtime (IDE)     Runtime         Code (Prod)
    (Preview)         (Desktop)       (Web/Mobile/API)
         │               │               │
         └───────────────┴───────────────┘
                            │
                     One source of truth
                     Three execution models
```

**الفوائد:**
- schema واحد
- لا انحراف
- نقطة صيانة واحدة
- اتساق مضمون

## جرّبه: تطبيق متعدد الأهداف

أنشئ `multi-target.orb`:

```json
{
  "name": "MultiTargetApp",
  "orbitals": [{
    "name": "Counter",
    "entity": {
      "name": "Counter",
      "fields": [
        { "name": "count", "type": "number", "default": 0 }
      ]
    },
    "traits": [{
      "name": "CounterTrait",
      "linkedEntity": "Counter",
      "stateMachine": {
        "states": [{ "name": "counting", "isInitial": true }],
        "events": [
          { "key": "INIT", "name": "Initialize" },
          { "key": "INCREMENT", "name": "Increment" },
          { "key": "DECREMENT", "name": "Decrement" }
        ],
        "transitions": [
          {
            "from": "counting",
            "to": "counting",
            "event": "INIT",
            "effects": [
              ["render-ui", "main", {
                "type": "page-header",
                "title": "Counter: {{@entity.count}}",
                "actions": [
                  { "label": "+", "event": "INCREMENT" },
                  { "label": "-", "event": "DECREMENT" }
                ]
              }]
            ]
          },
          {
            "from": "counting",
            "to": "counting",
            "event": "INCREMENT",
            "effects": [
              ["set", "@entity.count", ["+", "@entity.count", 1]],
              ["emit", "INIT"]
            ]
          },
          {
            "from": "counting",
            "to": "counting",
            "event": "DECREMENT",
            "effects": [
              ["set", "@entity.count", ["-", "@entity.count", 1]],
              ["emit", "INIT"]
            ]
          }
        ]
      }
    }],
    "pages": [{ "name": "CounterPage", "path": "/" }]
  }]
}
```

شغّله بثلاث طرق:

```bash
# 1. TypeScript Runtime (Development)
orbital dev multi-target.orb

# 2. Rust Runtime (Native)
orbital compile multi-target.orb --shell rust -o counter-native/

# 3. Generated TypeScript (Production)
orbital compile multi-target.orb --shell typescript -o counter-web/
cd counter-web && npm install && npm run dev
```

نفس الـ schema. ثلاث عمليات تنفيذ مختلفة.

## الخلاصة

"اكتب مرة، شغّل في أي مكان" من جافا حاولت فرض نموذج تنفيذ واحد على كل بيئة.

"اكتب مرة، شغّل في كل مكان بالشكل المناسب" من Almadar تدرك أن:
- التطوير يحتاج السرعة
- الإنتاج يحتاج التحسين
- الأداء الأصلي يحتاج القوة

schema واحد. ثلاثة نماذج. الأداة المناسبة للمهمة المناسبة.

لأن الهدف ليس العمل في كل مكان — بل العمل **بشكل جيد** في كل مكان.

تعرف على المزيد حول [البدء](https://orb.almadar.io/docs/getting-started/introduction).
