# السمات (Traits)

> تعريفات السمات وأنواع آلات الحالة في Orb

---

> كيف تعمل السمات في بنية Orb - آلات الحالة (State Machines)، الحراس (Guards)، التأثيرات (Effects)، والتواصل عبر الوحدات المدارية.

**ذو صلة:** [الكيانات](./entities.md)

---

## نظرة عامة

في Orb، **السمة (Trait)** هي آلة حالة (State Machine) تحدد السلوك لكيان ما. التركيبة الأساسية هي:

```
Orbital Unit = Entity + Traits + Pages
```

بينما تحدد [الكيانات](./entities.md) شكل البيانات، تحدد السمات كيف تتغير تلك البيانات عبر الزمن من خلال **الحالات (States)**، **الانتقالات (Transitions)**، **الحراس (Guards)**، و**التأثيرات (Effects)**.

---

## تعريف السمة (Trait)

تُعرَّف السمة (Trait) في برنامج `.orb` بالبنية التالية:

```json
{
  "name": "TaskManagement",
  "category": "interaction",
  "linkedEntity": "Task",
  "description": "Manages task lifecycle and status changes",
  "emits": [
    { "event": "TASK_COMPLETED", "scope": "external" }
  ],
  "listens": [
    { "event": "USER_ASSIGNED", "triggers": "ASSIGN" }
  ],
  "stateMachine": {
    "states": [
      { "name": "idle", "isInitial": true },
      { "name": "active" },
      { "name": "completed", "isTerminal": true }
    ],
    "events": [
      { "key": "START", "name": "Start Task" },
      { "key": "COMPLETE", "name": "Complete Task" }
    ],
    "transitions": [
      {
        "from": "idle",
        "to": "active",
        "event": "START",
        "effects": [["set", "@entity.id", "status", "active"]]
      },
      {
        "from": "active",
        "to": "completed",
        "event": "COMPLETE",
        "guard": ["=", "@entity.assigneeId", "@user.id"],
        "effects": [
          ["set", "@entity.id", "status", "completed"],
          ["emit", "TASK_COMPLETED", { "taskId": "@entity.id" }]
        ]
      }
    ]
  }
}
```

### خصائص السمة (Trait)

| الخاصية | مطلوبة | الوصف |
|----------|--------|-------|
| `name` | نعم | معرِّف السمة (PascalCase) |
| `category` | لا | فئة السمة (انظر أدناه) |
| `linkedEntity` | لا | الكيان الذي تعمل عليه هذه السمة |
| `description` | لا | وصف مقروء للبشر |
| `emits` | لا | الأحداث التي يمكن لهذه السمة إرسالها |
| `listens` | لا | الأحداث التي تستمع إليها هذه السمة |
| `stateMachine` | نعم | تعريف آلة الحالة (State Machine) |
| `ticks` | لا | تأثيرات مجدولة/دورية |
| `config` | لا | مخطط الإعدادات |

---

## فئات السمات (Trait Categories)

تُصنف السمات حسب غرضها الأساسي:

| الفئة | الغرض | التأثيرات النموذجية |
|-------|-------|-------------------|
| `interaction` | معالجة أحداث واجهة المستخدم على جانب العميل | `render-ui`، `navigate`، `notify` |
| `integration` | عمليات جانب الخادم | `persist`، `fetch`، `call-service` |
| `lifecycle` | إدارة دورة حياة الكيان | `persist`، `emit` |
| `gameCore` | حلقة اللعبة والفيزياء | `set`، `emit`، ticks |
| `gameEntity` | سلوكيات كيانات اللعبة | `set`، `emit`، `render-ui` |
| `gameUi` | واجهة اللعبة، HUD، عناصر التحكم | `render-ui`، `notify` |

### أمثلة الفئات

**سمة التفاعل (Interaction Trait)** - تعالج أحداث الواجهة:
```json
{
  "name": "FormInteraction",
  "category": "interaction",
  "stateMachine": {
    "transitions": [{
      "event": "SUBMIT",
      "effects": [
        ["render-ui", "main", { "type": "form", "loading": true }],
        ["emit", "FORM_SUBMITTED", "@payload"]
      ]
    }]
  }
}
```

**سمة التكامل (Integration Trait)** - تعالج عمليات الخادم:
```json
{
  "name": "DataPersistence",
  "category": "integration",
  "stateMachine": {
    "transitions": [{
      "event": "SAVE",
      "effects": [
        ["persist", "update", "Task", "@entity.id", "@payload"],
        ["emit", "DATA_SAVED", { "id": "@entity.id" }]
      ]
    }]
  }
}
```

---

## آلة الحالة (State Machine)

كل سمة لها آلة حالة تحدد سلوكها.

### الحالات (States)

تمثل الحالات الأوضاع الممكنة للسمة:

```json
{
  "states": [
    { "name": "idle", "isInitial": true, "description": "Waiting for input" },
    { "name": "loading", "description": "Fetching data" },
    { "name": "active", "description": "Ready for interaction" },
    { "name": "error", "isTerminal": true, "description": "Error state" }
  ]
}
```

| الخاصية | الوصف |
|----------|-------|
| `name` | معرِّف الحالة (أحرف صغيرة) |
| `isInitial` | حالة البداية (واحدة مطلوبة بالضبط) |
| `isTerminal` | لا توجد انتقالات خارجية متوقعة |
| `description` | وصف مقروء للبشر |

### الأحداث (Events)

الأحداث تُحفِّز انتقالات الحالة:

```json
{
  "events": [
    { "key": "INIT", "name": "Initialize" },
    { "key": "SUBMIT", "name": "Submit Form", "payload": [
      { "name": "email", "type": "string", "required": true },
      { "name": "name", "type": "string", "required": true }
    ]},
    { "key": "ERROR", "name": "Error Occurred" }
  ]
}
```

| الخاصية | الوصف |
|----------|-------|
| `key` | معرِّف الحدث (UPPER_SNAKE_CASE) |
| `name` | اسم العرض |
| `payload` | مخطط الحمولة المتوقعة |

### الانتقالات (Transitions)

الانتقالات تحدد كيف تتغير الحالات استجابةً للأحداث:

```json
{
  "transitions": [
    {
      "from": "idle",
      "to": "loading",
      "event": "SUBMIT",
      "guard": ["and", ["!=", "@payload.email", ""], ["!=", "@payload.name", ""]],
      "effects": [
        ["set", "@entity.id", "email", "@payload.email"],
        ["persist", "create", "User", "@payload"]
      ]
    },
    {
      "from": ["loading", "active"],
      "to": "error",
      "event": "ERROR"
    }
  ]
}
```

| الخاصية | الوصف |
|----------|-------|
| `from` | حالة المصدر - سلسلة نصية أو مصفوفة |
| `to` | حالة الهدف (دائماً واحدة) |
| `event` | مفتاح الحدث المُحفِّز |
| `guard` | شرط يجب تحققه (اختياري) |
| `effects` | تأثيرات تُنفَّذ عند الانتقال (اختياري) |

**انتقالات متعددة المصادر:** استخدم مصفوفة لـ `from` للتعامل مع نفس الحدث من حالات متعددة:
```json
{ "from": ["idle", "error"], "to": "loading", "event": "RETRY" }
```

---

## الحراس (Guards)

الحراس (Guards) هي شروط يجب أن تُقيَّم إلى `true` ليحدث الانتقال (Transition). تستخدم صيغة تعبيرات S-expression.

### عوامل الحراس

| الفئة | العوامل |
|-------|---------|
| المقارنة | `=`، `!=`، `<`، `>`، `<=`، `>=` |
| المنطق | `and`، `or`، `not` |
| الرياضيات | `+`، `-`، `*`، `/`، `%` |
| المصفوفات | `count`، `includes`، `every`، `some` |

### أمثلة الحراس

```json
// مساواة بسيطة
["=", "@entity.status", "active"]

// شرط مركب
["and",
  ["!=", "@payload.email", ""],
  ["!=", "@payload.name", ""]
]

// مقارنة رقمية
[">=", "@entity.balance", "@payload.amount"]

// فحص مصفوفة
[">", ["count", "@entity.items"], 0]

// صلاحية المستخدم
["=", "@entity.ownerId", "@user.id"]

// حارس معقد
["and",
  ["=", "@entity.status", "pending"],
  ["or",
    ["=", "@user.role", "admin"],
    ["=", "@entity.assigneeId", "@user.id"]
  ]
]
```

### ربط الحراس

يمكن للحراس الإشارة إلى البيانات عبر الربط (انظر [ربط الكيانات](./entities.md#entity-bindings-in-s-expressions)):

| الربط | الوصف |
|-------|-------|
| `@entity.field` | قيمة حقل الكيان الحالي |
| `@payload.field` | حقل حمولة الحدث |
| `@state` | اسم حالة السمة الحالية |
| `@user.id` | معرِّف المستخدم المصادق |
| `@now` | الطابع الزمني الحالي |

### فشل الحارس (Guard)

إذا قُيِّم الحارس (Guard) إلى `false`:
1. يُحظر الانتقال (Transition)
2. لا تُنفَّذ أي تأثيرات
3. تبقى الحالة دون تغيير
4. الاستجابة تشير إلى `transitioned: false`

---

## التأثيرات (Effects)

التأثيرات (Effects) هي إجراءات تُنفَّذ عند حدوث انتقال (Transition). تستخدم صيغة تعبيرات S-expression.

### أنواع التأثيرات

| التأثير | الخادم | العميل | الغرض |
|---------|--------|--------|-------|
| `render-ui` | يُتجاهل | يُنفَّذ | عرض نمط في فتحة واجهة المستخدم |
| `navigate` | يُتجاهل | يُنفَّذ | التنقل بين المسارات |
| `notify` | يُتجاهل | يُنفَّذ | عرض إشعار/رسالة |
| `fetch` | يُنفَّذ | يُتجاهل | استعلام قاعدة البيانات |
| `persist` | يُنفَّذ | يُتجاهل | إنشاء/تحديث/حذف البيانات |
| `call-service` | يُنفَّذ | يُتجاهل | استدعاء واجهة برمجية خارجية |
| `emit` | يُنفَّذ | يُنفَّذ | نشر حدث |
| `set` | يُنفَّذ | يُنفَّذ | تعديل حقل الكيان (يدعم الزيادة/النقصان عبر تعبيرات S-expression) |

### نموذج التنفيذ المزدوج

تُنفَّذ السمات على **كل من العميل والخادم** في وقت واحد:

```
┌─────────────────────────────────────────────────────────────┐
│  Client                          Server                     │
│  ───────                         ──────                     │
│  render-ui  ✓                    render-ui  → clientEffects │
│  navigate   ✓                    navigate   → clientEffects │
│  notify     ✓                    notify     → clientEffects │
│  fetch      ✗                    fetch      ✓ (queries DB)  │
│  persist    ✗                    persist    ✓ (writes DB)   │
│  call-service ✗                  call-service ✓ (API call)  │
│  emit       ✓ (EventBus)         emit       ✓ (cross-orbital)│
│  set        ✓                    set        ✓               │
└─────────────────────────────────────────────────────────────┘
```

### أمثلة التأثيرات

**render-ui** - عرض نمط واجهة المستخدم:
```json
["render-ui", "main", {
  "type": "entity-table",
  "entity": "Task",
  "columns": ["title", "status", "dueDate"]
}]
```

**persist** - عمليات قاعدة البيانات:
```json
// إنشاء
["persist", "create", "Task", "@payload"]

// تحديث
["persist", "update", "Task", "@entity.id", { "status": "completed" }]

// حذف
["persist", "delete", "Task", "@entity.id"]
```

**fetch** - استعلام البيانات:
```json
["fetch", "Task", { "status": "active", "assigneeId": "@user.id" }]
```

**emit** - نشر حدث:
```json
["emit", "TASK_COMPLETED", { "taskId": "@entity.id", "completedBy": "@user.id" }]
```

**set** - تعديل حقل:
```json
["set", "@entity.id", "status", "active"]
["set", "@entity.id", "updatedAt", "@now"]
// الزيادة/النقصان باستخدام عوامل الرياضيات:
["set", "@entity.id", "score", ["+", "@entity.score", 10]]  // زيادة بـ 10
["set", "@entity.id", "health", ["-", "@entity.health", 5]]  // نقصان بـ 5
```

**ملاحظة:** `increment` و `decrement` ليسا أنواع تأثيرات منفصلة. استخدم تأثير `set` مع عوامل الرياضيات في تعبيرات S-expression (`+`، `-`) لتعديل الحقول الرقمية.

**navigate** - تغيير المسار:
```json
["navigate", "/tasks/@entity.id"]
```

**notify** - عرض إشعار:
```json
["notify", "Task completed successfully", "success"]
```

**call-service** - واجهة برمجية خارجية:
```json
["call-service", "email", "send", {
  "to": "@entity.email",
  "subject": "Task Assigned",
  "body": "You have been assigned a new task."
}]
```

---

## linkedEntity - ربط السمة بالكيان

خاصية `linkedEntity` تحدد الكيان الذي تعمل عليه السمة.

### الكيان الأساسي

كل وحدة مدارية لها كيان أساسي. السمات بدون `linkedEntity` تستخدم هذا الكيان:

```json
{
  "name": "TaskManagement",
  "entity": { "name": "Task", "fields": [...] },
  "traits": [
    { "name": "StatusTrait" }  // تستخدم كيان Task
  ]
}
```

### linkedEntity الصريح

حدد `linkedEntity` للعمل على كيان مختلف:

```json
{
  "name": "TaskManagement",
  "entity": { "name": "Task" },
  "traits": [
    { "name": "StatusTrait", "linkedEntity": "Task" },
    { "name": "CommentTrait", "linkedEntity": "Comment" },
    { "name": "PlayerStatsTrait", "linkedEntity": "Player" }
  ]
}
```

### لماذا linkedEntity؟

1. **سمات قابلة لإعادة الاستخدام** - سمة عامة يمكنها العمل مع أي كيان
2. **عمليات عبر الكيانات** - العمل على كيانات مرتبطة
3. **أمان الأنواع** - المُصرِّف يتحقق من مراجع حقول الكيان
4. **تبعيات واضحة** - الربط الصريح يحسن المقروئية

انظر [ربط الكيانات](./entities.md#linkedentity-concept) لمزيد من التفاصيل.

---

## التواصل عبر الأحداث (emit/listen)

تتواصل السمات من خلال الأحداث، مما يمكّن الربط الفضفاض بين الوحدات المدارية.

### إرسال الأحداث (Emitting Events)

أعلن الأحداث التي يمكن للسمة إرسالها:

```json
{
  "name": "OrderFlow",
  "emits": [
    {
      "event": "ORDER_CONFIRMED",
      "scope": "external",
      "description": "Fired when order is confirmed",
      "payload": [
        { "name": "orderId", "type": "string" },
        { "name": "items", "type": "array" }
      ]
    }
  ]
}
```

الإرسال في التأثيرات:
```json
["emit", "ORDER_CONFIRMED", { "orderId": "@entity.id", "items": "@entity.items" }]
```

### الاستماع للأحداث (Listening for Events)

أعلن الأحداث التي تستمع إليها السمة:

```json
{
  "name": "InventorySync",
  "listens": [
    {
      "event": "ORDER_CONFIRMED",
      "triggers": "RESERVE_STOCK",
      "scope": "external",
      "payloadMapping": {
        "items": "@payload.items"
      },
      "guard": [">", ["count", "@payload.items"], 0]
    }
  ]
}
```

| الخاصية | الوصف |
|----------|-------|
| `event` | اسم الحدث للاستماع إليه |
| `triggers` | الحدث الداخلي المُحفَّز (الافتراضي هو اسم الحدث) |
| `scope` | `internal` (نفس الوحدة المدارية) أو `external` (عبر الوحدات المدارية) |
| `payloadMapping` | تحويل الحمولة الواردة |
| `guard` | شرط اختياري لتصفية الأحداث |

### نطاق الحدث (Event Scope)

| النطاق | الوصف |
|--------|-------|
| `internal` | أحداث داخل نفس الوحدة المدارية فقط |
| `external` | الأحداث يمكنها عبور حدود الوحدات المدارية |

### مسار التواصل عبر الوحدات المدارية

```
┌──────────────────┐         ┌──────────────────┐
│  OrderManagement │         │ InventoryManagement│
│                  │         │                  │
│  ┌────────────┐  │  emit   │  ┌────────────┐  │
│  │ OrderFlow  │──┼────────►│  │InventorySync│  │
│  └────────────┘  │ ORDER_  │  └────────────┘  │
│                  │CONFIRMED│                  │
└──────────────────┘         └──────────────────┘
```

1. سمة `OrderFlow` تُرسل `ORDER_CONFIRMED` (نطاق خارجي)
2. ناقل الأحداث يبث لجميع السمات المستمعة
3. `InventorySync` تستقبل الحدث وتحوّل الحمولة
4. حدث `RESERVE_STOCK` يُحفَّز على `InventorySync`
5. آلة الحالة تعالج الانتقال بشكل طبيعي

---

## النبضات (Ticks) - التأثيرات المجدولة

النبضات تُشغّل تأثيرات بشكل دوري، حتى بدون تفاعل المستخدم.

### تعريف النبضة

```json
{
  "ticks": [
    {
      "name": "cleanup_expired",
      "interval": "60000",
      "guard": [">", ["count", "@entity.expiredSessions"], 0],
      "effects": [
        ["persist", "delete", "Session", { "expiresAt": ["<", "@now"] }]
      ],
      "description": "Clean up expired sessions every minute"
    },
    {
      "name": "sync_status",
      "interval": "5000",
      "effects": [
        ["fetch", "ExternalStatus", {}],
        ["set", "@entity.id", "lastSync", "@now"]
      ]
    }
  ]
}
```

### خصائص النبضة

| الخاصية | الوصف |
|----------|-------|
| `name` | معرِّف النبضة |
| `interval` | بالمللي ثانية، أو سلسلة نصية مثل `"5s"`، `"1m"` |
| `guard` | شرط (النبضة تُتخطى إذا كان خطأ) |
| `effects` | التأثيرات المُنفَّذة |
| `appliesTo` | معرِّفات كيان محددة (اختياري) |
| `description` | وصف بشري |

### أنماط النبضات الشائعة

**التنظيف:**
```json
{
  "name": "cleanup",
  "interval": "300000",
  "effects": [["persist", "delete", "TempData", { "createdAt": ["<", ["-", "@now", 86400000]] }]]
}
```

**المزامنة الدورية:**
```json
{
  "name": "sync",
  "interval": "10000",
  "effects": [
    ["call-service", "external-api", "fetch-updates", {}],
    ["emit", "DATA_SYNCED", { "timestamp": "@now" }]
  ]
}
```

**حلقة اللعبة:**
```json
{
  "name": "game_tick",
  "interval": "16",
  "effects": [
    ["set", "@entity.id", "position", ["+", "@entity.position", "@entity.velocity"]],
    ["render-ui", "canvas", { "type": "game-canvas" }]
  ]
}
```

---

## مراجع السمات مقابل السمات المضمّنة

يمكن تعريف السمات مضمّنة أو الإشارة إليها من مصادر خارجية.

### التعريف المضمّن

تعريف السمة مباشرة في الوحدة المدارية:

```json
{
  "orbital": "TaskManagement",
  "traits": [
    {
      "name": "StatusTrait",
      "stateMachine": {
        "states": [...],
        "transitions": [...]
      }
    }
  ]
}
```

### التعريف بالمرجع

الإشارة إلى سمة من المكتبة القياسية أو الاستيرادات:

```json
{
  "orbital": "TaskManagement",
  "uses": [
    { "from": "std/behaviors/crud", "as": "CRUD" }
  ],
  "traits": [
    {
      "ref": "CRUD.traits.CRUDManagement",
      "linkedEntity": "Task",
      "config": {
        "allowDelete": true,
        "softDelete": false
      }
    }
  ]
}
```

### خصائص المرجع

| الخاصية | الوصف |
|----------|-------|
| `ref` | مسار السمة (مثال: `"Alias.traits.TraitName"`) |
| `linkedEntity` | تجاوز ربط الكيان |
| `config` | تجاوز الإعدادات |

### متى تستخدم المراجع

- **أنماط قابلة لإعادة الاستخدام** - CRUD، المصادقة، التصفح
- **سلوكيات قياسية** - من `std/behaviors/`
- **المشاركة عبر المشاريع** - الاستيراد من برامج أخرى
- **مدفوعة بالإعدادات** - نفس السمة، إعدادات مختلفة

---

## مثال كامل

سمة كاملة توضح جميع الميزات:

```json
{
  "name": "CheckoutFlow",
  "category": "integration",
  "linkedEntity": "Order",
  "description": "Handles the checkout process from cart to confirmation",

  "emits": [
    { "event": "ORDER_PLACED", "scope": "external", "payload": [
      { "name": "orderId", "type": "string" },
      { "name": "total", "type": "number" }
    ]},
    { "event": "PAYMENT_FAILED", "scope": "internal" }
  ],

  "listens": [
    { "event": "CART_UPDATED", "triggers": "RECALCULATE", "scope": "internal" },
    { "event": "INVENTORY_RESERVED", "triggers": "CONFIRM_STOCK", "scope": "external" }
  ],

  "stateMachine": {
    "states": [
      { "name": "cart", "isInitial": true, "description": "Shopping cart" },
      { "name": "checkout", "description": "Entering shipping/payment" },
      { "name": "processing", "description": "Processing payment" },
      { "name": "confirmed", "description": "Order confirmed" },
      { "name": "failed", "isTerminal": true, "description": "Order failed" }
    ],

    "events": [
      { "key": "PROCEED", "name": "Proceed to Checkout" },
      { "key": "SUBMIT", "name": "Submit Order", "payload": [
        { "name": "paymentMethod", "type": "string", "required": true }
      ]},
      { "key": "PAYMENT_SUCCESS", "name": "Payment Succeeded" },
      { "key": "PAYMENT_FAILED", "name": "Payment Failed" },
      { "key": "RECALCULATE", "name": "Recalculate Totals" },
      { "key": "CONFIRM_STOCK", "name": "Stock Confirmed" }
    ],

    "transitions": [
      {
        "from": "cart",
        "to": "checkout",
        "event": "PROCEED",
        "guard": [">", ["count", "@entity.items"], 0],
        "effects": [
          ["render-ui", "main", { "type": "form", "schema": "checkout" }]
        ]
      },
      {
        "from": "checkout",
        "to": "processing",
        "event": "SUBMIT",
        "guard": ["and",
          ["!=", "@payload.paymentMethod", ""],
          [">=", "@entity.total", 0]
        ],
        "effects": [
          ["set", "@entity.id", "paymentMethod", "@payload.paymentMethod"],
          ["set", "@entity.id", "status", "processing"],
          ["call-service", "payment", "charge", {
            "amount": "@entity.total",
            "method": "@payload.paymentMethod"
          }],
          ["render-ui", "main", { "type": "stats", "loading": true }]
        ]
      },
      {
        "from": "processing",
        "to": "confirmed",
        "event": "PAYMENT_SUCCESS",
        "effects": [
          ["set", "@entity.id", "status", "confirmed"],
          ["set", "@entity.id", "confirmedAt", "@now"],
          ["persist", "update", "Order", "@entity.id", "@entity"],
          ["emit", "ORDER_PLACED", { "orderId": "@entity.id", "total": "@entity.total" }],
          ["notify", "Order confirmed!", "success"],
          ["navigate", "/orders/@entity.id"]
        ]
      },
      {
        "from": "processing",
        "to": "failed",
        "event": "PAYMENT_FAILED",
        "effects": [
          ["set", "@entity.id", "status", "failed"],
          ["emit", "PAYMENT_FAILED", { "orderId": "@entity.id" }],
          ["notify", "Payment failed. Please try again.", "error"]
        ]
      },
      {
        "from": ["cart", "checkout"],
        "to": "cart",
        "event": "RECALCULATE",
        "effects": [
          ["set", "@entity.id", "total", ["array/reduce", "@entity.items",
            ["lambda", ["sum", "item"], ["+", "@sum", "@item.price"]], 0]]
        ]
      }
    ]
  },

  "ticks": [
    {
      "name": "expire_abandoned",
      "interval": "300000",
      "guard": ["and",
        ["=", "@state", "checkout"],
        ["<", "@entity.updatedAt", ["-", "@now", 1800000]]
      ],
      "effects": [
        ["set", "@entity.id", "status", "abandoned"],
        ["persist", "update", "Order", "@entity.id", { "status": "abandoned" }]
      ]
    }
  ]
}
```

---

## ملخص

يوفر نظام السمات في Orb:

1. **آلات الحالة (State Machines)** - تحديد الحالات الممكنة والانتقالات
2. **الحراس (Guards)** - حماية الانتقالات بشروط منطقية
3. **التأثيرات (Effects)** - تنفيذ إجراءات عند الانتقال (واجهة المستخدم، قاعدة البيانات، الأحداث)
4. **التنفيذ المزدوج** - تأثيرات الخادم (persist، fetch) + تأثيرات العميل (render، navigate)
5. **التواصل عبر الأحداث** - إرسال/استماع للرسائل عبر السمات والوحدات المدارية
6. **النبضات (Ticks)** - تأثيرات دورية مجدولة
7. **linkedEntity** - ربط صريح ببيانات [الكيان](./entities.md)
8. **الفئات** - تصنيف السمات حسب الغرض (interaction، integration، game)
9. **إعادة الاستخدام** - الإشارة إلى سمات من مكتبات أو تعريفها مضمّنة

السمات هي النواة السلوكية للوحدات المدارية - تحدد *كيف* تتغير الكيانات عبر الزمن من خلال نموذج آلة حالة تصريحي وقابل للتركيب.

---

*تاريخ إنشاء المستند: 2026-02-02*
*بناءً على تحليل قاعدة كود orbital-rust وحزم البناء*
