---
slug: state-machines-all-the-way-down
title: "آلات حالة من الأعلى إلى الأسفل"
authors: [osamah]
tags: [architecture, state-machines]
---

في Orb، كل ميزة هي آلة حالة. ليست شجرة مكوّنات ولا مجموعة hooks — بل آلة حالة بحالات صريحة، وتحوّلات محميّة، ودائرة مغلقة يفرضها المترجم قبل توليد أي شيفرة.

<!-- truncate -->

## الوحدة المدارية

الوحدة المدارية (orbital) هي الوحدة الأساسية: كيان (بيانات)، وسمة أو أكثر (سلوك)، وصفحات (مسارات). السمة *هي* آلة حالة. كل تفاعل من المستخدم يمر بدائرة مغلقة:

```
حدث ← حارس ← تحوّل ← تأثيرات ← استجابة واجهة ← حدث
```

هذا ليس توصية. المترجم يرفض البرامج التي تنكسر فيها الدائرة.

## مثال كامل

```lolo
orbital TaskOrbital {
  entity Task [persistent: tasks] {
    id     : string!
    title  : string!
    status : string
  }

  trait TaskBrowser -> Task [interaction] {
    state browsing {
      INIT -> browsing
        (fetch Task)
        (render-ui main { type: "entity-table", entity: "Task", columns: ["title", "status"] })
      CREATE -> creating
        (render-ui modal { type: "form-section", entity: "Task", fields: ["title", "status"], submitEvent: "SAVE", cancelEvent: "CANCEL" })
    }
    state creating {
      SAVE -> browsing
        (persist create Task @payload.data)
        (render-ui modal null)
        (emit INIT)
      CANCEL -> browsing
        (render-ui modal null)
    }
  }

  page "/tasks" -> TaskBrowser
}
```

حالتان. أربعة تحوّلات. كل نافذة تُفتح وتُغلق. كل حدث له معالج. نموذج البيانات، منطق العمل، بنية الواجهة، والتوجيه — كلها في ملف واحد.

## الدائرة المغلقة

احذف تحوّل `CANCEL` وشغّل `orbital validate`:

```
Error: CIRCUIT_NO_OVERLAY_EXIT
  State 'creating' renders to 'modal' slot but has no exit transition.
  Fix: Add a transition from 'creating' with event 'CANCEL' or 'CLOSE'
```

المترجم يُثبت أن الدائرة مكتملة في كل مسار. النافذة التي لا تُغلق ليست خطأ يُكتشف في الاختبار — بل برنامج لا يُترجم.

هذا هو الرهان التصميمي الأساسي: إذا كان سلوكك آلة حالة، يمكن للمترجم أن يستدل عليه. وإذا استطاع المترجم الاستدلال عليه، تصبح فئات كاملة من الأخطاء مستحيلة.
