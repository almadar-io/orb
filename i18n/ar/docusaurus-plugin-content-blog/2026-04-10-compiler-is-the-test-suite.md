---
slug: compiler-is-the-test-suite
title: "المترجم هو مجموعة الاختبارات"
authors: [osamah]
tags: [compiler, architecture]
---

`orb validate` لا يتحقق من الصياغة فقط. بل يمشي على رسم آلة الحالة ويُثبت خصائص تحتاج عادةً عشرات الاختبارات المكتوبة يدوياً. الدوائر المغلقة، عقود الإرسال، صحة الربط، ومتطلبات خصائص الأنماط — كلها تُفحص قبل توليد أي شيفرة.

<!-- truncate -->

## ماذا يفحص المترجم

**الدوائر المغلقة.** كل فتحة تراكب (`modal`، `drawer`) يجب أن يكون لها مسار خروج. إذا عرضت حالة نافذة بلا تحوّل يُزيلها، يعلق المستخدم. المترجم يلتقط هذا:

```
Error: CIRCUIT_NO_OVERLAY_EXIT
  State 'editing' renders to 'modal' slot but has no exit transition.
  Fix: Add a transition from 'editing' with event 'CANCEL' or 'CLOSE'
```

**اكتمال خروج النافذة.** عندما يُغلق تحوّل نافذة، يجب أيضاً أن يُعيد عرض الفتحة الرئيسية — وإلا سيرى المستخدم محتوى قديماً تحتها:

```
Warning: CIRCUIT_MODAL_EXIT_INCOMPLETE
  Transition editing --[SAVE]--> browsing closes modal but doesn't re-render main slot.
  Fix: Add render-ui("main", {...}) alongside render-ui("modal", null)
```

**متطلبات خصائص الأنماط.** كل استدعاء `render-ui` يُفحص مقابل سجل الأنماط. الخصائص المطلوبة يجب أن تكون موجودة:

```
Error: ORB_RUI_MISSING_REQUIRED_PROP
  Pattern 'data-list' requires prop 'fields' but it is not provided
  Fix: Add 'fields' to the render-ui config for 'data-list'
```

**صحة الربط.** كل مرجع `@entity.field` يُفحص مقابل مخطط الكيان:

```
Error: ORB_BINDING_ENTITY_FIELD_UNDECLARED
  '@entity.prce' does not exist on entity 'Product'.
```

## مثال عملي

```lolo
orbital ProductOrbital {
  entity Product [runtime] {
    id    : string
    name  : string
    price : number
  }

  trait ProductBrowser -> Product [interaction] {
    initial: browsing
    state browsing {
      INIT -> browsing
        (fetch Product)
        (render-ui main { type: "stack", direction: "vertical", gap: "lg", children: [{ type: "typography", content: "Products", variant: "h2" }, { type: "button", label: "Edit", event: "EDIT", variant: "primary" }, { type: "divider" }, { type: "data-list", entity: "Product", fields: ["name", "price"] }] })
      EDIT -> editing
        (render-ui modal { type: "stack", direction: "vertical", gap: "md", children: [{ type: "typography", content: "Edit Product", variant: "h3" }, { type: "input", label: "Name" }, { type: "input", label: "Price" }, { type: "stack", direction: "horizontal", gap: "md", children: [{ type: "button", label: "Save", event: "SAVE", variant: "primary" }, { type: "button", label: "Cancel", event: "CANCEL", variant: "secondary" }] }] })
    }
    state editing {
      SAVE -> browsing
        (render-ui modal null)
        (fetch Product)
        (render-ui main { type: "stack", direction: "vertical", gap: "lg", children: [{ type: "typography", content: "Products", variant: "h2" }, { type: "divider" }, { type: "data-list", entity: "Product", fields: ["name", "price"] }] })
      CANCEL -> browsing
        (render-ui modal null)
        (render-ui main { type: "stack", direction: "vertical", gap: "lg", children: [{ type: "typography", content: "Products", variant: "h2" }, { type: "divider" }, { type: "data-list", entity: "Product", fields: ["name", "price"] }] })
    }
  }

  page "/products" -> ProductBrowser
}
```

شغّل `orb validate` والمترجم يتحقق: النافذة في `editing` لها مخرجان (`SAVE`، `CANCEL`)، كلا المخرجين يُعيدان عرض الفتحة الرئيسية، كل `data-list` لديه الخاصية المطلوبة `fields`، كل ربط `@entity.*` يُحل، والدائرة من `browsing` عبر `editing` والعودة مكتملة.

## ماذا يستبدل هذا

الاختبار التقليدي يلتقط هذه الأخطاء بتشغيل سيناريوهات محددة وأمل أنك غطيت المسار المكسور. المترجم يُثبت الصحة لكل مسار، في كل مرة. لا ملف اختبار لكتابته. لا تغطية لقياسها. آلة الحالة *هي* المواصفة، والمترجم يتحقق أن المواصفة سليمة.
