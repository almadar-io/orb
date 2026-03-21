---
title: بنية المشروع
sidebar_label: بنية المشروع
---

# بنية المشروع

عند تنفيذ `orb compile my-app.orb --shell typescript`، يولّد المُصرِّف تطبيقاً كاملاً متعدد الطبقات. هذه الصفحة تشرح ما يفعله كل جزء من المخرجات المولّدة وكيف تتماسك الأجزاء معاً.

## التخطيط العام

```
my-app.orb                  # برنامجك المصدر (تعدّل هذا)
my-app/                     # التطبيق المولّد (لا تعدّله مباشرة)
  packages/
    client/                 # واجهة React + Vite الأمامية
    server/                 # خادم Express الخلفي مع بيانات تجريبية
    shared/                 # أنواع TypeScript مشتركة بين العميل والخادم
  package.json              # package.json الجذري مع إعدادات workspace
  tsconfig.json             # إعدادات TypeScript الجذرية
```

ملف `.orb` هو مصدر الحقيقة. مجلد `my-app/` هو مخرجات المُصرِّف. هذا الفصل أساسي: أنت دائماً تعدّل ملف `.orb` وتعيد التصريف. لا تعدّل الملفات داخل `my-app/` مباشرة.

## `packages/client/` (الواجهة الأمامية)

الواجهة الأمامية هي تطبيق React مُحزم بـ Vite.

```
packages/client/
  src/
    App.tsx                 # المكوّن الجذري مع تعريفات المسارات
    main.tsx                # نقطة دخول Vite
    features/               # مكوّنات السمات المولّدة
      TaskCrud.tsx          # مكوّن آلة الحالة لسمة TaskCrud
    pages/                  # مكوّنات صفحات المسارات
      TaskListPage.tsx      # يربط سمة TaskCrud بمسار /tasks
    components/
      traits/               # أجزاء واجهة خاصة بالسمات
        TaskCrud/
          Listing.tsx       # واجهة حالة Listing
          Creating.tsx      # واجهة حالة Creating
          Editing.tsx       # واجهة حالة Editing
  index.html
  vite.config.ts
  tsconfig.json
```

**الملفات الرئيسية:**

- **`App.tsx`** يحدد جميع المسارات. كل صفحة من ملف `.orb` تصبح مُدخل `<Route>`. هنا تُربط مسارات الصفحات (`/tasks`، `/tasks/:id`، إلخ.) بمكوّنات الصفحات.

- **`features/`** يحتوي ملفاً واحداً لكل سمة. كل مكوّن ميزة ينفذ آلة الحالة: يتتبع الحالة الحالية، يوزع الأحداث، يقيّم الحراس (Guards)، يشغّل التأثيرات (Effects)، ويعرض الواجهة المناسبة. هذا هو محرك وقت التشغيل لسلوك سمتك.

- **`pages/`** يحتوي ملفاً واحداً لكل صفحة. مكوّنات الصفحات أغلفة خفيفة تُثبِّت السمات المعلنة في تعريف الصفحة. صفحة بسمتين ستستورد وتعرض كلا مكوّني الميزات.

- **`components/traits/`** يحتوي أجزاء الواجهة لكل حالة. عندما تكون آلة حالة السمة في حالة "Listing"، يُعرض مكوّن `Listing.tsx`. عندما تنتقل إلى "Creating"، يُعرض مكوّن `Creating.tsx`. هذه تُولَّد من تأثيرات `render-ui` في انتقالاتك.

## `packages/server/` (الخادم الخلفي)

الخادم الخلفي هو خادم Express يوفر مسارات API لاستمرارية الكيانات.

```
packages/server/
  src/
    index.ts                # نقطة دخول الخادم (إعداد تطبيق Express)
    routes/
      tasks.ts              # مسارات CRUD لكيان Task
    data/
      mock.ts               # مخزن بيانات تجريبي في الذاكرة
  tsconfig.json
  package.json
```

**الملفات الرئيسية:**

- **`routes/`** يحتوي ملفاً واحداً لكل كيان دائم. المُصرِّف يولّد نقاط نهاية REST قياسية: `GET /api/tasks`، `POST /api/tasks`، `PUT /api/tasks/:id`، `DELETE /api/tasks/:id`. هذه تقابل تأثيرات `["persist", ...]` في سماتك.

- **`data/mock.ts`** يوفر مخزن بيانات في الذاكرة ليعمل التطبيق فوراً بدون أي إعداد لقاعدة البيانات. للإنتاج، تستبدل هذا بمحوّل قاعدة بيانات حقيقي (Firestore، PostgreSQL، إلخ.).

## `packages/shared/` (الأنواع المشتركة)

```
packages/shared/
  src/
    index.ts                # يعيد تصدير جميع الأنواع
    entities/
      Task.ts               # واجهة TypeScript لكيان Task
    events/
      TaskCrud.ts           # تعريفات أنواع الأحداث لسمة TaskCrud
```

كل من العميل والخادم يستورد الأنواع من هذه الحزمة. عندما تضيف حقلاً إلى كيان في ملف `.orb`، يتحدث النوع المشترك عند إعادة التصريف، مبقياً العميل والخادم متزامنين تلقائياً.

## سير عمل إعادة التصريف

عندما تغيّر ملف `.orb`، أعد التصريف لإعادة توليد التطبيق:

```bash
# عدّل ملف .orb الخاص بك
# ثم:
orb compile my-app.orb --shell typescript

# إذا كان خادم التطوير يعمل، يلتقط التغييرات عبر إعادة التحميل السريع لـ Vite
# وإلا، أعد التشغيل:
cd my-app && npm run dev
```

المُصرِّف يستبدل الملفات المولّدة في كل مرة. أي تعديلات يدوية على الملفات داخل `my-app/` ستُفقد. هذا بالتصميم: ملف `.orb` هو مصدر الحقيقة الوحيد لبنية تطبيقك وسلوكه.

**إذا بدا شيء خاطئاً في الكود المولّد**، الحل دائماً تقريباً في ملف `.orb`. غيّر حقول الكيان، عدّل انتقالات آلة الحالة، حدّث خصائص نمط `render-ui`، ثم أعد التصريف.

## كيف تتصل الأجزاء

```
.orb file
  |
  |-- entity "Task"
  |     |-- packages/shared/src/entities/Task.ts    (واجهة TypeScript)
  |     |-- packages/server/src/routes/tasks.ts     (REST API)
  |
  |-- trait "TaskCrud"
  |     |-- packages/client/src/features/TaskCrud.tsx         (آلة الحالة)
  |     |-- packages/client/src/components/traits/TaskCrud/   (واجهة الحالة)
  |     |-- packages/shared/src/events/TaskCrud.ts            (أنواع الأحداث)
  |
  |-- page "TaskListPage" at /tasks
        |-- packages/client/src/pages/TaskListPage.tsx  (مكوّن المسار)
        |-- packages/client/src/App.tsx                 (مُدخل المسار)
```

كل مفهوم في برنامج `.orb` يُربط بملفات محددة عبر الحزم الثلاث. المُصرِّف يعالج التوصيل: الاستيرادات، مراجع الأنواع، استدعاءات API، وتوزيع الأحداث كلها تُولَّد من العلاقات التي أعلنتها.

## الخطوات التالية

- [المفاهيم الأساسية: الكيانات](/docs/ar/core-concepts/entities) لأنواع الحقول، أوضاع الاستمرارية، والعلاقات
- [المفاهيم الأساسية: السمات](/docs/ar/core-concepts/traits) لآلات الحالة، الحراس، والتأثيرات
- [المفاهيم الأساسية: الصفحات](/docs/ar/core-concepts/pages) للتوجيه وتركيب السمات
