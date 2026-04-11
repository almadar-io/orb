---
slug: exhaustive-tests-that-walk-the-machine
title: "اختبارات شاملة تمشي على الآلة"
authors: [osamah]
tags: [compiler, state-machines]
---

`orbital validate` يُثبت الخصائص البنيوية. `orbital test` يذهب أبعد — يمشي على كل حافة في كل آلة حالة، ويُطلق كل حدث من كل حالة، ويتحقق أن الحرّاس يمنعون ويسمحون بشكل صحيح. لا تكتب أي شيفرة اختبار. الرسم البياني هو خطة الاختبار.

<!-- truncate -->

## أربع فئات من الاختبارات

المترجم يعرف مسبقاً كل حالة، وكل تحوّل، وكل حارس. `orbital test` يستخدم هذا الرسم لتوليد الاختبارات تلقائياً:

1. **مصفوفة التحوّلات** — إطلاق كل زوج `(حالة, حدث)` صالح، والتأكد من الحالة الهدف.
2. **فرض الحرّاس** — لكل تحوّل محمي، توليد حمولة تُرضي الحارس (يجب أن تمر) وحمولة فارغة (يجب أن تُمنع).
3. **التحوّلات غير الصالحة** — إطلاق كل حدث *ليس* له معالج في حالة معيّنة، والتأكد أن الآلة تبقى مكانها.
4. **الرحلة** — اجتياز BFS يزور كل حالة قابلة للوصول في مسار واحد، مثبتاً أن الرسم متصل.

كل اختبار يتضمن `setup_path`: أقصر طريق من الحالة الأولية إلى حالة بداية الاختبار. لا تجهيزات يدوية — الآلة تمشي بنفسها إلى هناك.

## مثال تطبيقي

```lolo
orbital OrderOrbital {
  entity Order [persistent: orders] {
    id     : string!
    status : string
    amount : int
  }

  trait OrderLifecycle -> Order [interaction] {
    state pending {
      APPROVE -> approved
        when (>= @entity.amount 0)
        (set @status "approved")
      CANCEL -> cancelled
        (set @status "cancelled")
    }
    state approved {
      SHIP -> shipped
        (set @status "shipped")
    }
    state shipped {
      DELIVER -> delivered
        (set @status "delivered")
    }
    state delivered {}
    state cancelled {}
  }
}
```

خمس حالات. حارس واحد. شغّل `orbital test`:

```
$ orbital test order.lolo --execute

Trait: OrderLifecycle
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  transition (4 tests):
    ✓ pending + APPROVE → approved
    ✓ pending + CANCEL → cancelled
    ✓ approved + SHIP → shipped
    ✓ shipped + DELIVER → delivered

  guard_block (1 test):
    ✓ guard blocks APPROVE (invalid payload)

  guard_allow (1 test):
    ✓ guard allows APPROVE (valid payload)

  invalid (6 tests):
    ✓ approved + CANCEL (invalid)
    ✓ shipped + APPROVE (invalid)
    ✓ delivered + SHIP (invalid)
    ✓ delivered + APPROVE (invalid)
    ✓ cancelled + APPROVE (invalid)
    ✓ cancelled + SHIP (invalid)

  journey (1 test):
    ✓ full journey: APPROVE → SHIP → DELIVER

Total: 1 trait, 13 test cases — 13 passed, 0 failed
```

## كيف تعمل اختبارات الحرّاس

تحوّل `APPROVE` لديه حارس: `(>= @entity.amount 0)`. مولّد الاختبارات يقرأ التعبير-S، يرى `@entity.amount` مُقارناً بـ`>=` مع `0`، ويولّد حالتين:

- **الحارس يمنع:** بيانات كيان فارغة، بلا حقل `amount` — الحارس يُقيّم إلى خطأ، الآلة تبقى في `pending`.
- **الحارس يسمح:** بيانات كيان مع `amount: 0` — الحارس يمر، الآلة تنتقل إلى `approved`.

هذا يعمل مع أي تعبير حارس: فحوصات مساواة، مقارنات، تركيبات `and`/`or`، ربط حمولات. المولّد يمشي على شجرة التعبير ويُنتج أقل المدخلات المُرضية (والمُخالفة).

## النقطة التصميمية

أضف حالة إلى `OrderLifecycle` وعدد الاختبارات يزداد تلقائياً. احذف تحوّلاً وتتعدل اختبارات التحوّلات غير الصالحة. مجموعة الاختبارات هي دالّة لآلة الحالة — وليست عنصراً منفصلاً ينحرف عن التزامن.

`--execute` يشغّل كل الحالات بلا واجهة مقابل بيئة آلة الحالة الحقيقية. لا متصفح، لا محاكيات، لا مشغّل اختبارات لتهيئته.
