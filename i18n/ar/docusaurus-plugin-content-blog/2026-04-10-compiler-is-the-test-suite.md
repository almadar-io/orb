---
slug: compiler-is-the-test-suite
title: "المترجم هو مجموعة الاختبارات"
authors: [osamah]
tags: [compiler, architecture]
---

`orbital validate` لا يتحقق من الصياغة فقط. بل يمشي على رسم آلة الحالة ويُثبت خصائص تحتاج عادةً عشرات الاختبارات المكتوبة يدوياً. الدوائر المغلقة، عقود الإرسال، صحة الربط، وعدد معاملات العوامل — كلها تُفحص قبل توليد أي شيفرة.

<!-- truncate -->

## ماذا يفحص المترجم

**الدوائر المغلقة.** كل فتحة تراكب (`modal`، `drawer`) يجب أن يكون لها مسار خروج. إذا عرضت حالة نافذة بلا تحوّل يُزيلها، يعلق المستخدم. المترجم يلتقط هذا:

```
Error: CIRCUIT_NO_OVERLAY_EXIT
  State 'EditModal' renders to 'modal' slot but has no exit transition.
  Fix: Add a transition from 'EditModal' with event 'CANCEL' or 'CLOSE'
```

**عقود الإرسال.** كل إعلان `emits` يجب أن يكون له `listens` مطابق في مكان ما. لا أحداث يتيمة:

```
Error: ORB_X_ORPHAN_EMIT
  Trait 'OrderTrait' emits 'ORDER_COMPLETED' but no trait
  has a matching 'listens' declaration.
```

**صحة الربط.** كل مرجع `@entity.field` يُفحص مقابل مخطط الكيان:

```
Error: BINDING_INVALID
  '@entity.prce' does not exist on entity 'Product'.
  Did you mean '@entity.price'?
```

**صحة العوامل.** التعبيرات-S تُفحص لوجود العامل وعدد المعاملات. `(set @status)` بمعامل قيمة مفقود هو خطأ ترجمة، وليس مفاجأة وقت التشغيل.

## مثال عملي

```lolo
orbital ProductOrbital {
  entity Product [persistent: products] {
    id    : string!
    name  : string!
    price : number
  }

  trait ProductBrowser -> Product [interaction] {
    state browsing {
      INIT -> browsing
        (fetch Product)
        (render-ui main { type: "entity-table", entity: "Product", columns: ["name", "price"] })
      EDIT -> editing
        (render-ui modal { type: "form-section", entity: "Product", fields: ["name", "price"], submitEvent: "SAVE", cancelEvent: "CANCEL" })
    }
    state editing {
      SAVE -> browsing
        (persist update Product @payload.data)
        (render-ui modal null)
        (emit INIT)
      CANCEL -> browsing
        (render-ui modal null)
    }
  }

  page "/products" -> ProductBrowser
}
```

شغّل `orbital validate` والمترجم يتحقق: النافذة في `editing` لها مخرجان (`SAVE`، `CANCEL`)، كل ربط `@payload.data` يُحل، كل `render-ui` يشير إلى نمط معروف، والدائرة من `browsing` عبر `editing` والعودة مكتملة.

## ماذا يستبدل هذا

الاختبار التقليدي يلتقط هذه الأخطاء بتشغيل سيناريوهات محددة وأمل أنك غطيت المسار المكسور. المترجم يُثبت الصحة لكل مسار، في كل مرة. لا ملف اختبار لكتابته. لا تغطية لقياسها. آلة الحالة *هي* المواصفة، والمترجم يتحقق أن المواصفة سليمة.
