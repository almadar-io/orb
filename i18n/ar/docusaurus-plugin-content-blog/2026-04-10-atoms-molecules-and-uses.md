---
slug: atoms-molecules-and-uses
title: "الذرّات والجزيئات ونظام uses"
authors: [osamah]
tags: [architecture, composition]
---

يتبع Orb التصميم الذري للسلوك، وليس فقط للواجهة. السلوكيات المعيارية هي ذرّات — آلات حالة صغيرة تملك طوبولوجيتها. تطبيقك يؤلّفها في جزيئات عبر استيرادات `uses` وسطح تعديل. حالات الذرّة وتحوّلاتها ثابتة. أنت تُعيد ربط البيانات، وتُعيد تسمية الأحداث، وتستبدل التأثيرات.

<!-- truncate -->

## الذرّات تملك الطوبولوجيا

سلوك معياري مثل `std-modal` يُعرّف آلة حالة كاملة: خامل ← مفتوح ← حفظ ← خامل، مع مسارات إلغاء وخطأ. هذه الطوبولوجيا ثابتة. لا يمكن لأي جزيء إضافة أو حذف حالات منها.

ما يمكن للجزيئات تعديله:

| الحقل | التأثير |
|---|---|
| `linkedEntity` | يُعيد ربط السمة بكيانك |
| `events` | يُعيد تسمية الأحداث (`OPEN` ← `ADD_ITEM`) |
| `effects` | يستبدل مصفوفات التأثيرات لكل حدث |
| `emitsScope` | يُحدّد `internal` أو `external` |

## التأليف عملياً

```lolo
orbital InventoryOrbital {
  uses Modal from "std/behaviors/std-modal"
  uses Browse from "std/behaviors/std-browse"

  entity Item [persistent] {
    id   : string!
    name : string
    sku  : string
  }

  trait ItemBrowse = Browse.traits.BrowseItemBrowse -> Item {
    on INIT {
      (ref Item)
      (render-ui main { type: "data-grid", entity: "Item" })
    }
  }

  trait ItemAdd = Modal.traits.ModalRecordModal -> Item {
    events { OPEN: ADD_ITEM }
    on ADD_ITEM {
      (fetch Item)
      (render-ui modal { type: "form-section", entity: "Item", mode: "create" })
    }
    on SAVE {
      (persist create Item @payload.data)
      (render-ui modal null)
    }
  }

  page "/inventory" = Modal.pages.ModalRecordModalPage -> ItemBrowse, ItemAdd
}
```

`Modal` يملك آلة حالة الفتح/الحفظ/الإلغاء. `ItemAdd` يُعيد ربط الكيان بـ`Item`، ويُعيد تسمية `OPEN` إلى `ADD_ITEM`، ويستبدل التأثيرات لـ`ADD_ITEM` و`SAVE`. طوبولوجيا النافذة — حالاتها وتحوّلاتها — لم تُمس.

## عقد الإرسال/الاستماع

التواصل بين الوحدات المدارية يستخدم `emits` و`listens`. السمة تُعلن الأحداث التي تُرسلها. سمة أخرى تُعلن ما تستمع إليه. المترجم يتحقق أن كل حدث مُرسَل له مُستمع واحد على الأقل:

```
Error: ORB_X_ORPHAN_EMIT
  Trait 'ItemAdd' emits 'ITEM_CREATED' but no trait
  has a matching 'listens' declaration.
```

لا أحداث بلا مستهلك. لا رسائل تُنشر في طابور بلا قارئ. التوصيل يُتحقق منه وقت الترجمة.

## لماذا تبقى الطوبولوجيا ثابتة

إذا احتاج الجزيء تحوّلاً لا تملكه الذرّة، فالذرّة ناقصة. أصلح الذرّة، لا الجزيء. هذا القيد يجعل التأليف قابلاً للتنبؤ: تعرف دائماً ما هي الحالات الموجودة بقراءة الذرّة. الجزيء يتحكم فقط فيما يحدث *داخل* تلك الحالات — وليس أي الحالات موجودة.
