---
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

```lolo
orbital TaskManager {
  entity Task [persistent: tasks] {
    id : string!
    title : string!
    description : string
    status : string
  }
  trait TaskCrud -> Task [interaction] {
    initial: Listing
    state Listing {
      INIT -> Listing
        (fetch Task)
        (render-ui main { type: "entity-table", entity: "Task", fields: ["title", "status"], columns: ["title", "status"], itemActions: [{ event: "EDIT", label: "Edit" }, { event: "DELETE", label: "Delete", variant: "danger" }] })
      CREATE -> Creating
        (render-ui modal { type: "form", entity: "Task", fields: ["title", "description", "status"], submitEvent: "SAVE", cancelEvent: "CANCEL" })
      EDIT -> Editing
        (render-ui modal { type: "form", entity: "Task", fields: ["title", "description", "status"], submitEvent: "SAVE", cancelEvent: "CANCEL" })
      DELETE -> Listing
        (persist delete Task @entity.id)
        (notify success "Task deleted")
    }
    state Creating {
      SAVE -> Listing
        (render-ui modal null)
        (persist create Task @payload)
        (fetch Task)
        (render-ui main { type: "entity-table", entity: "Task", fields: ["title", "status"], columns: ["title", "status"], itemActions: [{ event: "EDIT", label: "Edit" }, { event: "DELETE", label: "Delete", variant: "danger" }] })
        (notify success "Task created")
      CANCEL -> Listing
        (render-ui modal null)
        (fetch Task)
        (render-ui main { type: "entity-table", entity: "Task", fields: ["title", "status"], columns: ["title", "status"], itemActions: [{ event: "EDIT", label: "Edit" }, { event: "DELETE", label: "Delete", variant: "danger" }] })
    }
    state Editing {
      SAVE -> Listing
        (render-ui modal null)
        (persist update Task @entity)
        (fetch Task)
        (render-ui main { type: "entity-table", entity: "Task", fields: ["title", "status"], columns: ["title", "status"], itemActions: [{ event: "EDIT", label: "Edit" }, { event: "DELETE", label: "Delete", variant: "danger" }] })
        (notify success "Task updated")
      CANCEL -> Listing
        (render-ui modal null)
        (fetch Task)
        (render-ui main { type: "entity-table", entity: "Task", fields: ["title", "status"], columns: ["title", "status"], itemActions: [{ event: "EDIT", label: "Edit" }, { event: "DELETE", label: "Delete", variant: "danger" }] })
    }
  }
  page "/tasks" -> TaskCrud
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
