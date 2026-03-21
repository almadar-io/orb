---
slug: compiler-that-says-no
title: "الـ compiler الذي يقول لا: كيف يمنع 50 validator الأخطاء قبل وجودها"
authors: [osamah]
tags: [compiler, rust, engineering]
---

تتحقق معظم الـ compilers من البنية النحوية. يتحقق الـ compiler (المُصرِّف الذي يحوّل الـ schema إلى كود) الخاص بنا من المنطق.

يُشغّل compiler Almadar أكثر من 50 قاعدة validation (تحقق من صحة البنية والمنطق) عبر 12 وحدة قبل توليد سطر واحد من الكود. يكتشف stuck overlays (طبقات عالقة لا يستطيع المستخدم إغلاقها)، وorphan events (أحداث يتيمة بلا معالج)، وunreachable states (حالات لا يمكن الوصول إليها)، والدوائر المكسورة — أخطاء عادةً ما تنجو حتى تصل إلى الإنتاج.

إليك ما يكتشفه وكيف.

<!-- truncate -->

## لماذا الـ validation أفضل من الاختبار

يخبرك الاختبار: "هذا السيناريو المحدد يعمل."

يخبرك الـ validation: "لا يوجد سيناريو يمكن أن يكسره."

تعتبر الاختبارات عيّنات. ويعتبر الـ validation برهانًا. لا يتحقق compiler Almadar مما إذا كان تطبيقك يعمل *في الحالات التي اختبرتها*. بل يتحقق مما إذا كان تطبيقك *يمكن أن يُكسر أصلًا*.

## وحدات الـ validation الـ 12

يُشغّل الـ compiler الـ validators (وحدات التحقق) بالتسلسل، حيث يركز كل منها على جانب مختلف:

```
Schema → Entity → Trait → Effect → RenderUI → Slot →
S-Expression → Binding → Service → CrossOrbital → Icon → ClosedCircuit
```

لنستعرض أكثرها إثارة للاهتمام.

### 1. validator الـ entity

يكتشف مشاكل نموذج البيانات قبل أن تصبح أخطاء وقت التشغيل.

**أسماء حقول مكررة:**
```
Error: ORB_E_DUPLICATE_FIELD
  Entity 'Task' has duplicate field name 'status'.
  Each field name must be unique within an entity.
```

**أهداف علاقة غير صالحة:**
```
Error: ORB_E_INVALID_RELATION
  Field 'assigneeId' references entity 'User' but no entity
  named 'User' exists in this schema.
  Available entities: Task, Project, Comment
```

**أسماء حقول محجوزة:**
```
Error: ORB_E_RESERVED_FIELD
  Field name 'id' is reserved and automatically generated.
  Remove this field from your entity definition.
```

### 2. validator الـ trait

يضمن أن الـ state machines (آلات الحالة التي تدير سلوك البرنامج عبر حالات محددة) مُشكَّلة بشكل صحيح.

**لا توجد حالة ابتدائية:**
```
Error: ORB_T_NO_INITIAL_STATE
  Trait 'TaskInteraction' has no initial state.
  Add 'isInitial: true' to exactly one state.
```

**unreachable states:**
```
Error: ORB_T_UNREACHABLE_STATE
  State 'Archived' in trait 'TaskInteraction' has no incoming
  transitions. It can never be reached.
  Either add a transition to this state or remove it.
```

هذا أمر دقيق. تُعرّف حالة لكن تنسى إنشاء transition (انتقال بين حالتين) *إليها*. تكون الحالة موجودة في الـ schema (المخطط الذي يصف بنية التطبيق) بدون الـ validator، لكنها لا يمكن أن تُدخل أبدًا — dead code في الـ state machine الخاصة بك.

**transitions مكررة:**
```
Error: ORB_T_DUPLICATE_TRANSITION
  Trait 'TaskInteraction' has two transitions from 'Browsing'
  on event 'EDIT'. State machines must be deterministic.
```

### 3. validator الـ closed circuit

الجوهرة المتوجة. يضمن أن كل تفاعل مستخدم يُكمل دائرة كاملة.

**stuck overlays:**
```
Error: CIRCUIT_NO_OVERLAY_EXIT
  State 'EditModal' renders to 'modal' slot but has no exit
  transition. Users will be stuck in this overlay.

  Fix: Add a transition from 'EditModal' with event 'CANCEL' or 'CLOSE'
  that includes the effect: ["render-ui", "modal", null]
```

هذا هو خطأ "النافذة المنبثقة التي لا تُغلق". تكتشفه عندما يبلغ عنه مستخدم في التطبيقات التقليدية. تكتشفه قبل أن يوجد الكود في Almadar.

**orphan events:**
```
Error: CIRCUIT_ORPHAN_EVENT
  Action 'Delete' in state 'Viewing' emits event 'DELETE'
  which has no transition handler in the current state.

  The button will render but clicking it will do nothing.
```

عرّفت زرًا بحدث، لكن لا transition يعالج ذلك الحدث في الحالة الحالية. سيُعرض الزر، وسينقر المستخدم عليه، ولن يحدث شيء. يكتشف الـ validator هذا في وقت الـ compilation.

**فقدان الفتحة الرئيسية:**
```
Error: CIRCUIT_NO_MAIN_RENDER
  State 'Browsing' has no render-ui effect targeting the 'main' slot.
  The page will be blank when entering this state.
```

عرّفت حالة لكن نسيت عرض أي شيء في فتحة واجهة المستخدم الرئيسية. سيرى المستخدمون صفحة فارغة.

### 4. validator الـ S-expressions

يتحقق من أن الـ S-expressions (التعبيرات الرمزية المستخدمة في الـ guards والـ effects) مُشكَّلة بشكل صحيح.

**عوامل غير معروفة:**
```
Error: ORB_S_UNKNOWN_OPERATOR
  Unknown operator 'equals' in guard expression.
  Did you mean '='?
  Available comparison operators: =, !=, >, >=, <, <=
```

**عدد وسائط خاطئ:**
```
Error: ORB_S_WRONG_ARITY
  Operator 'and' expects 2+ arguments, got 1.
  Expression: ["and", ["=", "@entity.status", "active"]]

  'and' with a single argument is always equal to that argument.
  Did you mean to add another condition?
```

**عدم تطابق الأنواع:**
```
Error: ORB_S_TYPE_MISMATCH
  Operator '>' expects numeric arguments.
  Got: "@entity.name" (string) > 10 (number)

  You're comparing a string to a number. This will always
  evaluate to false.
```

### 5. validator الـ binding

يضمن أن جميع مراجع البيانات تشير إلى حقول حقيقية.

**جذر binding (ربط بيانات الـ schema بواجهة المستخدم) غير معروف:**
```
Error: ORB_B_UNKNOWN_ROOT
  Unknown binding root '@result' in expression.
  Valid roots: @entity, @payload, @state, @now, @config, @user
```

**حقل entity (الكيان الذي يمثّل نموذج البيانات) غير معروف:**
```
Error: ORB_B_UNKNOWN_FIELD
  Binding '@entity.staus' references field 'staus' which doesn't
  exist on entity 'Task'.
  Did you mean 'status'?
  Available fields: title, description, status, priority
```

كشف الأخطاء الإملائية مع اقتراحات. `@entity.staus` → "هل تقصد `status`؟"

### 6. validator عبر الـ orbitals

يضمن اكتمال اتصال الأحداث بين الـ orbitals (الوحدات المدارية التي يتألف منها التطبيق).

**إطلاق بدون مستمع:**
```
Error: ORB_X_ORPHAN_EMIT
  Trait 'OrderTrait' emits 'ORDER_COMPLETED' but no trait
  has a matching 'listens' declaration.

  Every emitted event must have at least one listener.
  Either add a listener or remove the emission.
```

يمنع هذا أحداث "أطلق وانسَ" — إطلاقات لا تذهب إلى أي مكان. سيكون هذا رسالة تُنشر في طابور بدون مستهلك في بنية الـ microservices (خدمات مصغرة مستقلة). يكتشفه الـ compiler في Almadar.

## البنية two-pass

تتطلب بعض عمليات الـ validation مراجع أمامية (forward references) لعناصر مُعرَّفة لاحقًا. يشير الـ entity أ إلى الـ entity ب، لكن ب مُعرَّف بعد أ. سيرفض validator بمسار واحد هذا.

يستخدم compiler Almadar **نهج الـ two-pass**:

**المسار 1: الجمع**
- جمع جميع أسماء الـ entities وأسماء الـ traits وأسماء الحالات وأسماء الأحداث
- بناء جدول رموز لكل ما هو موجود

**المسار 2: الـ validation**
- فحص جميع المراجع مقابل جدول الرموز
- تشغيل جميع وحدات الـ validation الـ 12
- الإبلاغ عن الأخطاء مع السياق والاقتراحات

يعني هذا أنه يمكنك تعريف الـ orbitals بأي ترتيب. يكتشف الـ compiler رسم التبعيات.

## جودة الأخطاء: الفرق بين "خطأ" و"مساعدة"

قارن خطأ compiler نموذجي:

```
Error: unexpected token at line 47, column 12
```

مع خطأ validation في Almadar:

```
Error: CIRCUIT_NO_OVERLAY_EXIT

  State 'EditModal' renders to 'modal' slot but has no exit transition.
  Users will be stuck in this overlay.

  Location: orbitals[0].traits[0].stateMachine.states[2]
  Schema: task-app.orb

  Fix: Add a transition from 'EditModal' with event 'CANCEL' or 'CLOSE'
  that includes the effect: ["render-ui", "modal", null]

  Example:
    {
      "from": "EditModal",
      "to": "Browsing",
      "event": "CANCEL",
      "effects": [["render-ui", "modal", null]]
    }
```

يتضمن كل خطأ:
- **رمز الخطأ** — قابل للبحث والتوثيق
- **وصف مقروء** — ما هو الخطأ
- **الأثر** — لماذا يهم (المستخدمون سيعلقون)
- **الموقع** — بالضبط أين في الـ schema
- **الإصلاح** — كيفية حله
- **مثال** — حل جاهز للنسخ واللصق

## مبني بـ Rust: لماذا يهم ذلك

الـ compiler مكتوب بـ Rust. يمنحنا هذا:

**مطابقة patterns شاملة:** يجبرنا compiler الـ Rust على معالجته في كل validator عندما نضيف نوع effect (تأثير يُنفَّذ عند الـ transition) جديد. لا يمكننا نسيان حالة — لن يُصرَّف.

**أمان الذاكرة بدون جامع القمامة:** يستعير الـ validator الـ schema بدون نسخه. يوفر هذا ذاكرة ووقتًا كبيرين لـ schema من 5,000 سطر.

**سرعة الـ compilation:** يستغرق الـ validation الكامل لـ schema كبير أقل من 50 مللي ثانية. تحصل على التغذية الراجعة أسرع مما يمكن لمحررك أن يتحدث.

**التزامن الآمن:** يمكن لوحدات الـ validation أن تعمل بالتوازي بدون تنافس على البيانات. يضمن نظام أنواع Rust هذا في وقت الـ compilation.

## ما لا نتحقق منه (بعد)

لا يعتبر الـ validator كلّي المعرفة. لا يتحقق حاليًا من:

- **الصحة الدلالية للـ guards (شروط تمنع أو تسمح بالـ transition)** — يعرف أن `[">=", "@entity.amount", 0]` صالح بنيويًا، لكنه لا يعرف ما إذا كان منطق الأعمال صحيحًا
- **الآثار المترتبة على الأداء** — state machine بـ 1,000 حالة صالحة لكنها قد تكون بطيئة
- **جماليات الواجهة** — جدولان يُعرضان في نفس الفتحة أمر صالح لكنه ربما قبيح

تعد هذه مجالات للتحسين المستقبلي. لكن تكتشف القواعد الخمسين+ التي لدينا اليوم الغالبية العظمى من الأخطاء التي تنجو حتى الإنتاج في التطبيقات التقليدية.

## الخلاصة

أفضل خطأ هو الذي لا يوجد أبدًا.

لا يتحقق compiler Almadar من البنية النحوية فقط. بل يتحقق من السببية (closed circuit — دائرة مغلقة تضمن اكتمال كل تفاعل)، والاكتمال (لا orphan events)، وقابلية الوصول (لا حالات ميتة)، والصحة (S-expressions آمنة الأنواع)، والاتساق (مطابقة الأحداث عبر الـ orbitals).

أكثر من 50 قاعدة. 12 وحدة. أقل من 50 مللي ثانية.

هذا ليس compiler. إنه مراجع كود لا ينام أبدًا، ولا يفوّت حالة أبدًا، ولا يوافق على كود معطوب أبدًا.

استكشف [وثائق الـ compiler](https://orb.almadar.io/docs/compiler) لمعرفة المزيد.
