---
slug: exhaustive-tests-that-walk-the-machine
title: "اختبارات شاملة تمشي على الآلة"
authors: [osamah]
tags: [compiler, state-machines]
---

`orb validate` يُثبت الخصائص البنيوية. `orb test` يذهب أبعد — يمشي على كل حافة في كل آلة حالة، ويُطلق كل حدث من كل حالة، ويتحقق أن الحرّاس يمنعون ويسمحون بشكل صحيح. لا تكتب أي شيفرة اختبار. الرسم البياني هو خطة الاختبار.

<!-- truncate -->

## أربع فئات من الاختبارات

المترجم يعرف مسبقاً كل حالة، وكل تحوّل، وكل حارس. `orb test` يستخدم هذا الرسم لتوليد الاختبارات تلقائياً:

1. **مصفوفة التحوّلات** — إطلاق كل زوج `(حالة, حدث)` صالح، والتأكد من الحالة الهدف.
2. **فرض الحرّاس** — لكل تحوّل محمي، توليد حمولة تُرضي الحارس (يجب أن تمر) وحمولة فارغة (يجب أن تُمنع).
3. **التحوّلات غير الصالحة** — إطلاق كل حدث *ليس* له معالج في حالة معيّنة، والتأكد أن الآلة تبقى مكانها.
4. **الرحلة** — اجتياز BFS يزور كل حالة قابلة للوصول في مسار واحد، مثبتاً أن الرسم متصل.

كل اختبار يتضمن `setup_path`: أقصر طريق من الحالة الأولية إلى حالة بداية الاختبار. لا تجهيزات يدوية — الآلة تمشي بنفسها إلى هناك.

## مثال تطبيقي

```lolo
orbital OrderOrbital {
  entity Order [runtime] {
    id     : string
    status : string
    amount : number
  }

  trait OrderLifecycle -> Order [interaction] {
    initial: pending
    state pending {
      INIT -> pending
        (fetch Order)
        (render-ui main { type: "stack", direction: "vertical", gap: "md", children: [{ type: "typography", content: "Order", variant: "h2" }, { type: "typography", content: "@entity.status", variant: "body" }, { type: "button", label: "Approve", event: "APPROVE", variant: "primary" }, { type: "button", label: "Cancel", event: "CANCEL", variant: "secondary" }] })
      APPROVE -> approved when (>= @entity.amount 0)
        (set @status "approved")
        (render-ui main { type: "stack", direction: "vertical", gap: "md", children: [{ type: "typography", content: "Approved", variant: "h2" }, { type: "button", label: "Ship", event: "SHIP", variant: "primary" }] })
      CANCEL -> cancelled
        (set @status "cancelled")
        (render-ui main { type: "stack", direction: "vertical", gap: "md", children: [{ type: "typography", content: "Cancelled", variant: "h2" }] })
    }
    state approved {
      SHIP -> shipped
        (set @status "shipped")
        (render-ui main { type: "stack", direction: "vertical", gap: "md", children: [{ type: "typography", content: "Shipped", variant: "h2" }, { type: "button", label: "Deliver", event: "DELIVER", variant: "primary" }] })
    }
    state shipped {
      DELIVER -> delivered
        (set @status "delivered")
        (render-ui main { type: "stack", direction: "vertical", gap: "md", children: [{ type: "typography", content: "Delivered", variant: "h2" }] })
    }
    state delivered {
    }
    state cancelled {
    }
  }

  page "/order" -> OrderLifecycle
}
```

خمس حالات. حارس واحد على `APPROVE`. شغّل `orb test`:

```
$ orb test order.lolo --execute

Trait: OrderLifecycle
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  transition (5 tests):
    ✓ pending + INIT → pending
    ✓ pending + APPROVE → approved
    ✓ pending + CANCEL → cancelled
    ✓ approved + SHIP → shipped
    ✓ shipped + DELIVER → delivered

  guard_block (1 test):
    ✓ guard blocks APPROVE (invalid payload)

  guard_allow (1 test):
    ✓ guard allows APPROVE (valid payload)

  invalid (invalid pairs):
    ✓ approved + CANCEL (stays in approved)
    ✓ shipped + APPROVE (stays in shipped)
    ...

  journey (1 test):
    ✓ full journey: APPROVE → SHIP → DELIVER

Total: 1 trait — all tests passed
```

## كيف تعمل اختبارات الحرّاس

تحوّل `APPROVE` لديه حارس: `(>= @entity.amount 0)`. مولّد الاختبارات يقرأ التعبير-S، يرى `@entity.amount` مُقارناً بـ`>=` مع `0`، ويولّد حالتين:

- **الحارس يمنع:** بيانات كيان فارغة، بلا حقل `amount` — الحارس يُقيّم إلى خطأ، الآلة تبقى في `pending`.
- **الحارس يسمح:** بيانات كيان مع `amount: 0` — الحارس يمر، الآلة تنتقل إلى `approved`.

هذا يعمل مع أي تعبير حارس: فحوصات مساواة، مقارنات، تركيبات `and`/`or`، ربط حمولات. المولّد يمشي على شجرة التعبير ويُنتج أقل المدخلات المُرضية (والمُخالفة).

## النقطة التصميمية

أضف حالة إلى `OrderLifecycle` وعدد الاختبارات يزداد تلقائياً. احذف تحوّلاً وتتعدل اختبارات التحوّلات غير الصالحة. مجموعة الاختبارات هي دالّة لآلة الحالة — وليست عنصراً منفصلاً ينحرف عن التزامن.

`--execute` يشغّل كل الحالات بلا واجهة مقابل بيئة آلة الحالة الحقيقية. لا متصفح، لا محاكيات، لا مشغّل اختبارات لتهيئته.
