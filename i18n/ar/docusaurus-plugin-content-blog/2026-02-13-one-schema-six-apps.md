---
slug: one-schema-six-apps
title: "schema واحد، خمسة تطبيقات: كيف بنينا أداة حكومية ومنصة AI ولعبتين بنفس اللغة"
authors: [almadar]
tags: [case-study, architecture]
---

نظام تفتيش حكومي. منصة تعلم بالذكاء الاصطناعي. متتبع لياقة شخصي. لعبة استراتيجية تكتيكية. لعبة زنزانات ثلاثية الأبعاد.

خمسة تطبيقات. خمسة مجالات مختلفة تمامًا. لغة واحدة.

إليك الكيفية — ولماذا يهم ذلك.

<!-- truncate -->

## الادعاء

تدّعي كل لغة برمجة أنها "general purpose." لكن متى كانت آخر مرة استخدمت فيها نفس الـ framework لبناء لعبة *و* أداة compliance حكومية؟

تعتبر الـ Orbital architecture لـ Almadar محايدة المجال بالتصميم. الـ Orbital هو: Entity + Traits + Pages. تعمل تلك الصيغة لأي مجال لأنها تُنمذج **السلوك**، وليس **التقنية**.

لنستعرض الخمسة جميعًا — وهذه المرة، سنريك كود الـ schema الفعلي.

## كيف يعمل الـ Orbital Schema

قبل الغوص في التطبيقات الخمسة، إليك تعريفًا سريعًا لما ستراه في الكود. كل orbital schema هو ملف JSON بهذا الشكل:

```json
{
  "name": "app-name",
  "version": "1.0.0",
  "orbitals": [
    {
      "name": "OrbitalName",
      "entity": { ... },
      "traits": [ ... ],
      "pages": [ ... ]
    }
  ]
}
```

- **Entity** يحدد شكل البيانات — الحقول، الأنواع، نمط الـ persistence
- **Traits** تحدد السلوك — state machines بحالات، events، transitions، guards، و effects
- **Pages** تربط الـ traits بالـ routes — مسار URL يُفعّل trait واحد أو أكثر

الـ Effects هي الأوليات الجانبية: `set` يُحدّث حقلاً، `render-ui` يعرض مكوّنًا، `persist` يحفظ في قاعدة البيانات، `emit` يرسل events عبر الـ orbitals، `navigate` يغيّر الـ route، `notify` يعرض رسالة.

الـ Guards هي شروط بصيغة S-expression يجب أن تتحقق ليحدث الـ transition. إذا فشل الـ guard، الـ transition غير موجود.

الآن لنرَ هذا مطبّقًا عبر خمسة مجالات.

## 1. نظام التفتيش الحكومي — سير عمل الـ Compliance

**المجال:** تفتيش ميداني منظم للمنظمين الحكوميين
**التحدي الرئيسي:** فرض workflow من 5 مراحل، guards المتطلبات القانونية، audit trails

يرشد هذا النظام، المبني للمفتشين الحكوميين، المفتش عبر مراحل المقدمة → المحتوى → التحضير → السجل → الإغلاق. تُفرض المتطلبات القانونية بالـ guards — لا يمكنك التقدم دون إكمال الحقول الإلزامية.

### الـ Entity

الـ Inspection entity يلتقط كل ما يحتاجه المفتش في الميدان:

```json
{
  "entity": {
    "name": "Inspection",
    "persistence": "persistent",
    "collection": "inspections",
    "fields": [
      { "name": "id", "type": "string", "required": true },
      { "name": "inspectorId", "type": "string", "required": true },
      { "name": "companyId", "type": "string", "required": true },
      { "name": "legalBasis", "type": "string" },
      { "name": "findings", "type": "array", "items": { "type": "object" } },
      { "name": "measures", "type": "array", "items": { "type": "object" } },
      { "name": "inspectorSignature", "type": "boolean", "default": false },
      { "name": "subjectSignature", "type": "boolean", "default": false },
      { "name": "createdAt", "type": "timestamp" },
      { "name": "status", "type": "enum", "values": ["draft", "in_progress", "completed", "archived"] }
    ]
  }
}
```

### الـ Traits

الـ workflow ذو المراحل الخمس هو الـ trait الأساسي. كل transition للمرحلة التالية له guards تفرض المتطلبات القانونية:

```json
{
  "name": "InspectionWorkflow",
  "linkedEntity": "Inspection",
  "stateMachine": {
    "states": [
      { "name": "Introduction", "isInitial": true },
      { "name": "Content" },
      { "name": "Preparation" },
      { "name": "Record" },
      { "name": "Closing", "isTerminal": true }
    ],
    "events": [
      { "key": "PROCEED", "name": "Proceed to Next Phase" },
      { "key": "SAVE_FINDINGS", "name": "Save Findings", "payload": [
        { "name": "findings", "type": "array", "required": true }
      ]},
      { "key": "SIGN", "name": "Sign Document" },
      { "key": "CLOSE", "name": "Close Inspection" }
    ],
    "transitions": [
      {
        "from": "Introduction",
        "event": "PROCEED",
        "to": "Content",
        "guard": ["not-empty", "@entity.legalBasis"],
        "effects": [
          ["persist", "update", "Inspection", "@entity"],
          ["render-ui", "main", {
            "type": "form",
            "entity": "Inspection",
            "fields": [
              { "name": "findings", "label": "Findings", "type": "textarea", "required": true }
            ]
          }]
        ]
      },
      { "from": "Content", "event": "PROCEED", "to": "Preparation" },
      {
        "from": "Preparation",
        "event": "SAVE_FINDINGS",
        "to": "Record",
        "effects": [
          ["set", "@entity.findings", "@payload.findings"],
          ["persist", "update", "Inspection", "@entity"]
        ]
      },
      {
        "from": "Record",
        "event": "CLOSE",
        "to": "Closing",
        "guard": ["and",
          ["not-empty", "@entity.legalBasis"],
          ["not-empty", "@entity.findings"],
          ["not-empty", "@entity.measures"],
          ["=", "@entity.inspectorSignature", true],
          ["=", "@entity.subjectSignature", true]
        ],
        "effects": [
          ["set", "@entity.status", "completed"],
          ["persist", "update", "Inspection", "@entity"],
          ["notify", "success", "Inspection closed successfully"]
        ]
      }
    ]
  }
}
```

guard الإغلاق هو الجزء الأكثر أهمية: **خمسة شروط** يجب أن تتحقق جميعها. الأساس القانوني يجب أن يكون مملوءًا. النتائج يجب أن تكون موجودة. الإجراءات يجب أن تكون محددة. كل من المفتش والخاضع للتفتيش يجب أن يكونا قد وقّعا. إذا غاب أي واحد، الـ CLOSE event ببساطة لا يُطلق. لا يوجد زر "تخطي"، لا يوجد override — الـ state machine لا تملك أي transition.

كل `persist` effect يُولّد audit trail تلقائيًا. التفتيش ينتقل عبر الحالات، وكل transition يُسجَّل بالـ timestamp والمستخدم والـ payload. الـ audit trail ليس ميزة — إنه نتيجة للـ architecture.

### الـ Pages

```json
"pages": [
  {
    "name": "InspectionFormPage",
    "path": "/inspection/:id",
    "traits": [
      { "ref": "InspectionWorkflow", "linkedEntity": "Inspection" }
    ]
  },
  {
    "name": "InspectionListPage",
    "path": "/inspections",
    "traits": [
      { "ref": "InspectionBrowser", "linkedEntity": "Inspection" }
    ]
  }
]
```

صفحة النموذج تستخدم trait واحد يعرض forms مختلفة لكل مرحلة عبر `render-ui`. الـ route `/inspection/:id` يحمّل التفتيش المحدد ويعرض أي مرحلة يمر بها حاليًا.

## 2. KFlow — منصة تعلم بالذكاء الاصطناعي

**المجال:** توليد knowledge graph مدعوم بـ LLMs
**التحدي الرئيسي:** توسيع المفاهيم التكراري، توليد دروس بالـ AI، نشر الـ courses

تحوّل KFlow موضوعًا أوليًا (مثل "JavaScript") إلى knowledge graph منظم مع مفاهيم مترابطة، ودروس مولَّدة بالـ AI، و courses قابلة للنشر.

### الـ Entity

الـ Concept entity هو عقدة الـ knowledge graph:

```json
{
  "entity": {
    "name": "Concept",
    "persistence": "persistent",
    "collection": "concepts",
    "fields": [
      { "name": "id", "type": "string", "required": true },
      { "name": "title", "type": "string", "required": true },
      { "name": "difficulty", "type": "enum", "values": ["beginner", "intermediate", "advanced"] },
      { "name": "prerequisites", "type": "array", "items": { "type": "string" } },
      { "name": "followUps", "type": "array", "items": { "type": "string" } },
      { "name": "aiContent", "type": "string" },
      { "name": "graphId", "type": "string", "required": true }
    ]
  }
}
```

### الـ Traits

الـ Concept expansion trait هو حيث يلتقي الـ AI بالـ state machines:

```json
{
  "name": "ConceptExpansion",
  "linkedEntity": "Concept",
  "emits": [
    {
      "event": "CONCEPT_EXPANDED",
      "scope": "external",
      "payload": [
        { "name": "conceptId", "type": "string", "required": true },
        { "name": "childConcepts", "type": "array", "required": true }
      ]
    }
  ],
  "stateMachine": {
    "states": [
      { "name": "seed", "isInitial": true },
      { "name": "expanding" },
      { "name": "expanded" },
      { "name": "published", "isTerminal": true }
    ],
    "events": [
      { "key": "EXPAND", "name": "Expand Concept" },
      { "key": "AI_COMPLETE", "name": "AI Generation Complete", "payload": [
        { "name": "content", "type": "string", "required": true },
        { "name": "children", "type": "array", "required": true }
      ]},
      { "key": "PUBLISH", "name": "Publish" }
    ],
    "transitions": [
      {
        "from": "seed",
        "event": "EXPAND",
        "to": "expanding",
        "effects": [
          ["render-ui", "main", {
            "type": "stats",
            "title": "Expanding...",
            "value": "@entity.title",
            "subtitle": "AI is generating content"
          }]
        ]
      },
      {
        "from": "expanding",
        "event": "AI_COMPLETE",
        "to": "expanded",
        "effects": [
          ["set", "@entity.aiContent", "@payload.content"],
          ["set", "@entity.followUps", "@payload.children"],
          ["persist", "update", "Concept", "@entity"],
          ["emit", "CONCEPT_EXPANDED", {
            "conceptId": "@entity.id",
            "childConcepts": "@payload.children"
          }]
        ]
      },
      {
        "from": "expanded",
        "event": "PUBLISH",
        "to": "published",
        "guard": ["not-empty", "@entity.aiContent"],
        "effects": [
          ["persist", "update", "Concept", "@entity"],
          ["notify", "success", "Concept published"]
        ]
      }
    ]
  }
}
```

سلسلة الـ cross-orbital events تقود الـ pipeline بالكامل:

```
المستخدم يُدخل موضوعًا → Graph يُصدر TOPIC_CREATED →
  Concept يستمع → يوسّع الـ prerequisites → يُصدر CONCEPT_EXPANDED →
    Lesson يستمع → يولّد محتوى AI → يُصدر LESSON_CREATED →
      Course يستمع → يضيف إلى المنهج
```

كل سهم هو تصريح `listens`/`emits`:

```json
{
  "name": "LessonGenerator",
  "listens": [
    { "event": "CONCEPT_EXPANDED", "scope": "external" }
  ],
  "emits": [
    { "event": "LESSON_CREATED", "scope": "external" }
  ]
}
```

الـ pipeline بالكامل declarative. بدون orchestration code. بدون job queues. مجرد events تتدفق عبر الـ Orbitals.

### الـ Pages

```json
"pages": [
  {
    "name": "GraphExplorerPage",
    "path": "/graph/:graphId",
    "traits": [
      { "ref": "ConceptExpansion", "linkedEntity": "Concept" },
      { "ref": "GraphVisualization", "linkedEntity": "Graph" }
    ]
  },
  {
    "name": "CourseEditorPage",
    "path": "/course/:courseId/edit",
    "traits": [
      { "ref": "CourseCuration", "linkedEntity": "Course" }
    ]
  }
]
```

صفحة مستكشف الرسم البياني تركّب توسيع المفاهيم مع التصوّر — توسيع المفاهيم وعرض الـ knowledge graph على route واحد.

## 3. متتبع اللياقة — منصة تدريب شخصية

**المجال:** إدارة المدرب-العميل مع جدولة قائمة على الرصيد
**التحدي الرئيسي:** نظام رصيد، تتبع التمارين، تحليل الوجبات بالـ AI

مبني لمدرب شخصي يدير عملاء متعددين. يتميز بنظام حجز جلسات قائم على الرصيد، وتتبع رفع الأثقال، وإدارة خطط الوجبات، وتحليل غذائي مدعوم بالـ AI.

### الـ Entity

الـ Session entity يدير الحجوزات مع تتبع الرصيد:

```json
{
  "entity": {
    "name": "Session",
    "persistence": "persistent",
    "collection": "sessions",
    "fields": [
      { "name": "id", "type": "string", "required": true },
      { "name": "traineeId", "type": "string", "required": true },
      { "name": "scheduledAt", "type": "timestamp" },
      { "name": "remainingCredits", "type": "number", "default": 0 },
      { "name": "creditsExpireAt", "type": "timestamp" },
      { "name": "notes", "type": "string" },
      { "name": "type", "type": "enum", "values": ["individual", "group", "online"] }
    ]
  }
}
```

### الـ Traits

الـ Session booking trait يفرض قواعد الرصيد بالـ guards:

```json
{
  "name": "SessionBooking",
  "linkedEntity": "Session",
  "emits": [
    {
      "event": "SESSION_BOOKED",
      "scope": "external",
      "payload": [
        { "name": "traineeId", "type": "string", "required": true },
        { "name": "scheduledAt", "type": "timestamp", "required": true }
      ]
    }
  ],
  "stateMachine": {
    "states": [
      { "name": "available", "isInitial": true },
      { "name": "booked" },
      { "name": "completed", "isTerminal": true },
      { "name": "cancelled" }
    ],
    "events": [
      { "key": "BOOK", "name": "Book Session" },
      { "key": "CANCEL", "name": "Cancel Session" },
      { "key": "COMPLETE", "name": "Complete Session" }
    ],
    "transitions": [
      {
        "from": "available",
        "event": "BOOK",
        "to": "booked",
        "guard": ["and",
          [">", "@entity.remainingCredits", 0],
          ["<", "@now", "@entity.creditsExpireAt"]
        ],
        "effects": [
          ["set", "@entity.remainingCredits", ["-", "@entity.remainingCredits", 1]],
          ["persist", "update", "Session", "@entity"],
          ["emit", "SESSION_BOOKED", {
            "traineeId": "@entity.traineeId",
            "scheduledAt": "@entity.scheduledAt"
          }],
          ["notify", "success", "Session booked"]
        ]
      },
      {
        "from": "booked",
        "event": "CANCEL",
        "to": "cancelled",
        "effects": [
          ["set", "@entity.remainingCredits", ["+", "@entity.remainingCredits", 1]],
          ["persist", "update", "Session", "@entity"],
          ["notify", "info", "Session cancelled, credit refunded"]
        ]
      },
      {
        "from": "booked",
        "event": "COMPLETE",
        "to": "completed",
        "effects": [
          ["persist", "update", "Session", "@entity"]
        ]
      }
    ]
  }
}
```

لا تستطيع الحجز برصيد صفري. لا تستطيع الحجز برصيد منتهي الصلاحية. الـ guard `["and", [">", "@entity.remainingCredits", 0], ["<", "@now", "@entity.creditsExpireAt"]]` يجعل كلا الشرطين إلزاميين. وعند الإلغاء، يُسترد الرصيد تلقائيًا عبر `["+", "@entity.remainingCredits", 1]` — قاعدة الـ business في الـ schema، ليست مخفية في service layer.

الـ workout tracking trait يستخدم نفس effect primitives لغرض مختلف تمامًا:

```json
{
  "from": "logging",
  "event": "LOG_SET",
  "to": "logging",
  "effects": [
    ["set", "@entity.lastWeight", "@payload.weight"],
    ["set", "@entity.lastReps", "@payload.reps"],
    ["increment", "@entity.totalSets", 1],
    ["persist", "update", "Workout", "@entity"]
  ]
}
```

نفس `set`، نفس `increment`، نفس `persist` — مطبقة على التكرارات والأوزان بدلاً من إحصائيات اللعبة أو نتائج التفتيش.

### الـ Pages

```json
"pages": [
  {
    "name": "TraineeDashboard",
    "path": "/trainee/:id",
    "traits": [
      { "ref": "SessionBooking", "linkedEntity": "Session" },
      { "ref": "WorkoutLog", "linkedEntity": "Workout" },
      { "ref": "MealTracker", "linkedEntity": "Meal" }
    ]
  },
  {
    "name": "SchedulePage",
    "path": "/schedule",
    "traits": [
      { "ref": "SessionBrowser", "linkedEntity": "Session" }
    ]
  }
]
```

لوحة تحكم المتدرب تركّب ثلاث traits على صفحة واحدة — الحجوزات والتمارين والوجبات كلها مرئية في وقت واحد. كل trait تدير state machine الخاصة بها بشكل مستقل.

## 4. حروب الـ Traits — لعبة استراتيجية تكتيكية

**المجال:** قتال تكتيكي قائم على الأدوار
**التحدي الرئيسي:** قتال معقد مع AI مرئي، مراحل أدوار، تركيب وحدات

تعد حروب الـ Traits لعبة استراتيجية مستوحاة من Heroes of Might and Magic حيث تُجهّز الوحدات **Traits** — state machines مرئية تُحدد سلوكها. الابتكار الأساسي: يستطيع اللاعبون قراءة state machines الأعداء واستغلال نوافذ الـ transition.

### الـ Entity

كل وحدة في ساحة المعركة هي entity بإحصائيات قتالية وموقع وtraits مجهزة:

```json
{
  "entity": {
    "name": "Unit",
    "persistence": "runtime",
    "fields": [
      { "name": "id", "type": "string", "required": true },
      { "name": "name", "type": "string", "required": true },
      { "name": "hp", "type": "number", "default": 100 },
      { "name": "attack", "type": "number", "default": 10 },
      { "name": "defense", "type": "number", "default": 5 },
      { "name": "position", "type": "object" },
      { "name": "equippedTraits", "type": "array", "items": { "type": "string" } },
      { "name": "status", "type": "enum", "values": ["alive", "stunned", "dead"] }
    ]
  }
}
```

لاحظ `"persistence": "runtime"` — حالة اللعبة تعيش في الذاكرة، ليس في قاعدة بيانات. الـ entity هو النواة الجاذبة: كل شيء آخر يدور حوله.

### الـ Traits

متحكم الأدوار نفسه هو state machine. كل مرحلة لها قواعد دخول وخروج واضحة:

```json
{
  "name": "TurnPhaseController",
  "linkedEntity": "Match",
  "stateMachine": {
    "states": [
      { "name": "ObservationPhase", "isInitial": true },
      { "name": "SelectionPhase" },
      { "name": "MovementPhase" },
      { "name": "ActionPhase" },
      { "name": "ResolutionPhase" }
    ],
    "events": [
      { "key": "BEGIN_SELECTION", "name": "Begin Selection" },
      { "key": "CONFIRM_SELECTION", "name": "Confirm Selection" },
      { "key": "MOVE_COMPLETE", "name": "Move Complete" },
      { "key": "RESOLVE", "name": "Resolve Actions" },
      { "key": "NEXT_TURN", "name": "Next Turn" }
    ],
    "transitions": [
      {
        "from": "ObservationPhase",
        "event": "BEGIN_SELECTION",
        "to": "SelectionPhase",
        "effects": [
          ["render-ui", "main", {
            "type": "entity-table",
            "entity": "Unit",
            "columns": ["name", "hp", "status", "equippedTraits"]
          }]
        ]
      },
      { "from": "SelectionPhase", "event": "CONFIRM_SELECTION", "to": "MovementPhase" },
      { "from": "MovementPhase", "event": "MOVE_COMPLETE", "to": "ActionPhase" },
      {
        "from": "ActionPhase",
        "event": "RESOLVE",
        "to": "ResolutionPhase",
        "effects": [
          ["emit", "TURN_RESOLVED", { "turnNumber": "@entity.turnCount" }]
        ]
      },
      { "from": "ResolutionPhase", "event": "NEXT_TURN", "to": "ObservationPhase" }
    ]
  }
}
```

خمس حالات. transitions نظيفة. الـ `render-ui` effect في SelectionPhase يعرض جدول الوحدات بـ traits مرئية — هذا ما يتيح للاعبين قراءة state machines الأعداء والتخطيط حولها. الـ `emit` effect يبث حل الدور لجميع الـ orbitals الأخرى (القتال، التضاريس، قدرات البطل).

قتال الوحدات هو trait منفصل بـ guards تفرض قواعد اللعبة:

```json
{
  "from": "idle",
  "event": "ATTACK",
  "to": "attacking",
  "guard": ["and",
    [">", "@entity.hp", 0],
    ["!=", "@entity.status", "stunned"]
  ],
  "effects": [
    ["set", "@entity.lastAction", "attack"],
    ["emit", "DAMAGE_DEALT", {
      "attackerId": "@entity.id",
      "damage": "@entity.attack"
    }]
  ]
}
```

الوحدة الميتة أو المصعوقة حرفيًا لا تستطيع الهجوم. الـ guard يجعل ذلك مستحيلاً — لا يوجد `if` statement لتنسى كتابته.

### الـ Pages

```json
"pages": [
  {
    "name": "BattlefieldPage",
    "path": "/battle/:matchId",
    "traits": [
      { "ref": "TurnPhaseController", "linkedEntity": "Match" },
      { "ref": "UnitCombat", "linkedEntity": "Unit" }
    ]
  },
  {
    "name": "ArmyBuilderPage",
    "path": "/army",
    "traits": [
      { "ref": "UnitComposition", "linkedEntity": "Unit" }
    ]
  }
]
```

الـ page هو مجرد route يربط traits. `/battle/:matchId` يُفعّل كلاً من متحكم الأدوار و trait القتال على نفس الشاشة. الـ compiler يولّد الـ UI من effects الـ `render-ui`.

## 5. إرم — لعبة أكشن RPG ثلاثية الأبعاد

**المجال:** لعبة ARPG لاستكشاف الزنزانات
**التحدي الرئيسي:** قتال فوري، زنزانات إجرائية، تركيب القدرات

تدور إرم داخل كرة دايسون تُسمى سيادة إرم. ينزل اللاعبون عبر 5 مناطق زنزانات، ويهزمون الزعماء، ويجمعون **Orbital Shards** — أجزاء من السلوك تتركب لتصبح قدرات جديدة.

### الـ Entity

الـ entity الخاص باللاعب يتتبع الصحة والمخزون وفتحات الـ 8 orbitals:

```json
{
  "entity": {
    "name": "Player",
    "persistence": "persistent",
    "collection": "players",
    "fields": [
      { "name": "id", "type": "string", "required": true },
      { "name": "health", "type": "number", "default": 100 },
      { "name": "maxHealth", "type": "number", "default": 100 },
      { "name": "equippedOrbitals", "type": "array", "items": { "type": "string" } },
      { "name": "inventory", "type": "array", "items": { "type": "object" } },
      { "name": "currentZone", "type": "number", "default": 1 },
      { "name": "orbitalShards", "type": "number", "default": 0 }
    ]
  }
}
```

بيانات اللاعب `"persistent"` — التقدم يُحفظ في قاعدة البيانات بين الجلسات.

### الـ Traits

مواجهات الزعماء تستخدم state machines قائمة على المراحل — نفس الـ pattern كمتحكم الأدوار، لكن لعدو واحد:

```json
{
  "name": "BossEncounter",
  "linkedEntity": "Boss",
  "stateMachine": {
    "states": [
      { "name": "dormant", "isInitial": true },
      { "name": "phase1" },
      { "name": "phase2" },
      { "name": "enraged" },
      { "name": "defeated", "isTerminal": true }
    ],
    "events": [
      { "key": "ENGAGE", "name": "Start Fight" },
      { "key": "DAMAGE", "name": "Take Damage", "payload": [
        { "name": "amount", "type": "number", "required": true }
      ]},
      { "key": "PHASE_SHIFT", "name": "Phase Shift" }
    ],
    "transitions": [
      { "from": "dormant", "event": "ENGAGE", "to": "phase1" },
      {
        "from": "phase1",
        "event": "DAMAGE",
        "to": "phase2",
        "guard": ["<", "@entity.hp", 50],
        "effects": [
          ["set", "@entity.attackPattern", "aggressive"],
          ["emit", "BOSS_PHASE_CHANGED", { "phase": 2 }]
        ]
      },
      {
        "from": "phase2",
        "event": "DAMAGE",
        "to": "enraged",
        "guard": ["<", "@entity.hp", 20],
        "effects": [
          ["set", "@entity.attackSpeed", ["+", "@entity.attackSpeed", 2]],
          ["set", "@entity.attackPattern", "berserk"]
        ]
      },
      {
        "from": ["phase1", "phase2", "enraged"],
        "event": "DAMAGE",
        "to": "defeated",
        "guard": ["<=", "@entity.hp", 0],
        "effects": [
          ["emit", "BOSS_DEFEATED", { "bossId": "@entity.id", "zone": "@entity.zone" }],
          ["emit", "LOOT_DROP", { "table": "@entity.lootTable" }]
        ]
      }
    ]
  }
}
```

لاحظ `"from": ["phase1", "phase2", "enraged"]` — transition الموت يعمل من أي مرحلة قتالية. الـ guards تتحقق من عتبات HP لتفعيل تحولات المراحل. الـ event `BOSS_DEFEATED` يتدفق إلى Dungeon orbital لفتح المنطقة التالية، بينما `LOOT_DROP` يتدفق إلى نظام المخزون.

### نظام الـ Resonance

الـ Orbitals المتوافقة تخلق effects تآزرية:
- Defend + Mend → شفاء دروع 1.5 ضعف
- Disrupt + Fabricate → الفخاخ تُطبق debuffs
- Archive + Command → الحلفاء يتلقون معلومات عن نقاط ضعف الأعداء

يُنمذج هذا عبر `listens` عبر الـ orbitals — عندما يكون orbital-ان محددان مجهزين معًا، events-هما المشتركة تفعّل effects الرنين.

### الـ Pages

```json
"pages": [
  {
    "name": "DungeonPage",
    "path": "/dungeon/:zoneId",
    "traits": [
      { "ref": "DungeonExploration", "linkedEntity": "Dungeon" },
      { "ref": "PlayerCombat", "linkedEntity": "Player" },
      { "ref": "BossEncounter", "linkedEntity": "Boss" }
    ]
  },
  {
    "name": "OrbitalLoadoutPage",
    "path": "/loadout",
    "traits": [
      { "ref": "OrbitalEquip", "linkedEntity": "Player" }
    ]
  }
]
```

صفحة الزنزانة تركّب ثلاث traits على route واحد — الاستكشاف والقتال ومواجهات الزعماء كلها نشطة في وقت واحد.

## الـ Pattern

خمسة تطبيقات. خمسة مجالات مختلفة. نفس الـ pattern:

| المفهوم | الحكومة | التعليم | اللياقة | اللعبة | الـ RPG |
|---------|---------|---------|---------|--------|--------|
| **الـ Entity** | التفتيش | المفهوم | الجلسة | الوحدة | اللاعب |
| **الحالات** | مقدمة→محتوى→إغلاق | بذرة→موسَّع→منشور | متاح→محجوز→منتهٍ | خامل→هجوم→ميت | استكشاف→قتال→زعيم |
| **الـ Guards** | الحقول مملوءة، موقَّع | الـ Prerequisites متحققة | الرصيد > 0 | HP > 0، في المدى | يملك الـ orbital المطلوب |
| **الـ Effects** | حفظ النتائج، تسجيل | توليد درس | خصم رصيد | إلحاق ضرر، تحرك | إسقاط غنيمة |
| **الأحداث** | PROCEED, CLOSE | EXPAND, PUBLISH | BOOK, CANCEL | ATTACK, MOVE, DIE | ENTER_ROOM, ATTACK |
| **الـ Pages** | /inspection/:id | /graph/:graphId | /trainee/:id | /battle/:matchId | /dungeon/:zoneId |

تتغير المفردات. ولا تتغير البنية.

## لماذا يهم هذا

### للمطورين

تتعلم Almadar مرة واحدة. ثم يمكنك بناء:
- أدوات أعمال
- ألعاب
- أنظمة حكومية
- منتجات مدعومة بالـ AI
- تطبيقات صحة ولياقة

بدون framework جديد لكل مجال. بدون state management library جديدة. بدون backend architecture جديدة. لغة واحدة، compiler واحد، نموذج ذهني واحد.

### للشركات

يمكن لفريق واحد بناء منتجات متعددة. يستطيع المهندس المعماري الذي صمم نظام التفتيش تصميم نظام قتال اللعبة — الـ patterns هي نفسها. حالات، transitions، guards، effects.

### للصناعة

تشير حقيقة أن نفس الـ architecture تتعامل مع القتال القائم على الأدوار والـ compliance الحكومي إلى أننا وجدنا شيئًا جوهريًا. ليس framework محسَّنًا لمجال واحد، بل **نموذجًا للسلوك** يعمل عبر المجالات.

لأن السلوك هو سلوك. سواء كانت وحدة لعبة تقرر الهجوم، أو مفتش يُكمل مرحلة، أو مدرب لياقة يحجز جلسة — كلها:

1. ابدأ في حالة
2. استقبل event
3. تحقق من الـ guards
4. نفّذ الـ effects
5. انتقل إلى الحالة التالية

لا يعتبر هذا ميزة framework. بل هكذا تعمل الأنظمة.

## الخلاصة

يعد سؤال "ما اللغة التي يجب أن أستخدمها؟" أقل أهمية من "ما نموذج السلوك الذي أستخدمه؟"

React + Express. Django + PostgreSQL. Rails + Redis. هذه خيارات تقنية. لا تغيّر كيفية نمذجة السلوك — فقط تغيّر أين تكتب نفس الـ patterns.

تعتبر Almadar نموذج سلوك يُصرَّف إلى تقنية. schema واحد. خمسة تطبيقات. لأن النموذج صحيح.

استكشف جميع المشاريع وجرب بناء مشروعك الخاص في [almadar.io](https://orb.almadar.io/docs/getting-started/introduction).
