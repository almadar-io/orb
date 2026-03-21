# الكيانات (Entities)

> كيف تعمل الكيانات في بنية Orb، من تعريف البرنامج إلى التنفيذ في وقت التشغيل.

---

## نظرة عامة

في Orb، **الكيان (Entity)** هو نموذج البيانات في قلب كل وحدة مدارية (Orbital Unit). التركيبة الأساسية هي:

```
Orbital Unit = Entity + Traits + Pages
```

تحدد الكيانات (Entities) شكل البيانات، بينما تحدد السمات (Traits) السلوك (آلات الحالة) التي تعمل على تلك البيانات. الربط بينهما صريح وآمن من حيث الأنواع.



## تعريف الكيان (Entity)

يُعرَّف الكيان (Entity) في برنامج `.orb` بالبنية التالية:

```json
{
  "name": "Task",
  "collection": "tasks",
  "fields": [
    { "name": "id", "type": "string", "required": true, "primaryKey": true },
    { "name": "title", "type": "string", "required": true },
    { "name": "status", "type": "enum", "values": ["pending", "active", "done"] },
    { "name": "assigneeId", "type": "relation", "relation": { "entity": "User", "cardinality": "one" } },
    { "name": "dueDate", "type": "date" },
    { "name": "tags", "type": "array", "items": { "type": "string" } }
  ]
}
```

### خصائص الكيان (Entity)

| الخاصية | مطلوبة | الوصف |
|----------|--------|-------|
| `name` | نعم | معرِّف بصيغة PascalCase (مثال: `Task`، `User`، `GameState`) |
| `collection` | للكيانات الدائمة | اسم مجموعة قاعدة البيانات (مثال: `tasks`، `users`) |
| `persistence` | لا | وضع التخزين: `persistent`، `runtime`، أو `singleton` |
| `fields` | نعم | مصفوفة تعريفات الحقول |

---

## أنواع الحقول

يدعم Orb أنواع الحقول التالية:

| النوع | الوصف | مثال | TypeScript | التخزين |
|-------|-------|------|------------|---------|
| `string` | بيانات نصية | `"hello"` | `string` | String |
| `number` | قيم رقمية (عشرية) | `42.5` | `number` | Number |
| `boolean` | صح/خطأ | `true` | `boolean` | Boolean |
| `date` | تاريخ بدون وقت | `"2026-03-01"` | `Date` | ISO string |
| `datetime` | تاريخ مع وقت | `"2026-03-01T10:30:00Z"` | `Date` | ISO string |
| `timestamp` | ميلي ثانية منذ البداية | `1709312400000` | `number` | Number |
| `array` | مجموعة من القيم | `["a", "b"]` | `T[]` | Array |
| `object` | بيانات مُهيكلة | `{ key: "value" }` | `Record<string, unknown>` | JSON |
| `enum` | ثوابت مسماة | `"pending"` | Union type | String |
| `relation` | مرجع كيان | `"user_123"` | `string` (FK) | String |

### خصائص الحقل

```json
{
  "name": "status",
  "type": "enum",
  "required": true,
  "values": ["pending", "active", "done"],
  "default": ["quote", "pending"]
}
```

| الخاصية | الوصف |
|----------|-------|
| `name` | معرِّف الحقل بصيغة camelCase |
| `type` | أحد أنواع الحقول المدعومة |
| `required` | ما إذا كان الحقل يجب أن يحتوي على قيمة |
| `primaryKey` | يحدد حقل المفتاح الأساسي |
| `unique` | يفرض قيد التفرد |
| `default` | القيمة الافتراضية (كتعبير S-expression) |
| `values` | لنوع `enum` - مصفوفة القيم المسموح بها |
| `items` | لنوع `array` - تعريف نوع العنصر |
| `properties` | لنوع `object` - تعريفات حقول متداخلة |
| `relation` | لنوع `relation` - الكيان المستهدف والعلاقة |

### حقول العلاقات (Relation Fields)

تربط العلاقات الكيانات ببعضها:

```json
{
  "name": "assigneeId",
  "type": "relation",
  "relation": {
    "entity": "User",
    "cardinality": "one"
  },
  "required": false
}
```

**خيارات العلاقة (Cardinality):**
- `one` - مرجع واحد (مفتاح أجنبي)
- `many` - مراجع متعددة (مصفوفة معرِّفات)

---

## أنواع استمرارية الكيان (Entity Persistence Types)

للكيانات ثلاثة أوضاع استمرارية تغيّر سلوك التخزين والمشاركة بشكل جوهري:

### 1. الكيانات الدائمة (Persistent Entities)

**التخزين:** قاعدة البيانات (Firestore، PostgreSQL، إلخ.)
**مدة البقاء:** تبقى بعد إعادة التشغيل، مشتركة عبر الجلسات
**المجموعة:** مطلوبة - تسمية صريحة
**الافتراضي:** إذا لم يُحدد `persistence`، يكون الافتراضي `persistent`

```json
{
  "name": "Task",
  "persistence": "persistent",
  "collection": "tasks",
  "fields": [...]
}
```

**الخصائص:**
- جميع الوحدات المدارية التي تشير إلى نفس اسم الكيان تتشارك نفس المجموعة
- عمليات CRUD تمر عبر محوّل الاستمرارية
- مناسبة لكائنات النطاق (Task، User، Order، Product)

### 2. كيانات وقت التشغيل (Runtime Entities)

**التخزين:** الذاكرة فقط (كائنات JavaScript/Python)
**مدة البقاء:** تُفقد عند إعادة التشغيل/انتهاء الجلسة
**المجموعة:** لا توجد

```json
{
  "name": "Enemy",
  "persistence": "runtime",
  "fields": [...]
}
```

**الخصائص:**
- **معزولة لكل وحدة مدارية** - كل وحدة تحصل على نسخها الخاصة
- لا توجد عمليات قاعدة بيانات
- مناسبة للحالة المؤقتة (Enemy، Projectile، Particle)
- شائعة في الألعاب حيث تظهر الكيانات وتختفي بتكرار

### 3. كيانات المفردة (Singleton Entities)

**التخزين:** الذاكرة (نسخة واحدة)
**مدة البقاء:** نسخة واحدة لكل جلسة
**المجموعة:** لا توجد (سجل واحد)

```json
{
  "name": "Player",
  "persistence": "singleton",
  "fields": [...]
}
```

**الخصائص:**
- نسخة واحدة مشتركة عبر جميع الوحدات المدارية
- يمكن الوصول إليها عبر ربط `@EntityName` (مثال: `@Player.health`)
- مناسبة للحالة العامة (Player، GameConfig، Settings)

### مقارنة أوضاع الاستمرارية

| الجانب | Persistent | Runtime | Singleton |
|--------|------------|---------|-----------|
| التخزين | قاعدة البيانات | الذاكرة | الذاكرة |
| مدة البقاء | دائمة | الجلسة | الجلسة |
| المشاركة | مشتركة بالاسم | معزولة لكل وحدة مدارية | نسخة واحدة |
| المجموعة | مطلوبة | لا توجد | لا توجد |
| حالة الاستخدام | كائنات النطاق | كيانات الألعاب | الإعدادات العامة |

---

## ربط الكيانات في تعبيرات S-Expression

### الربط الأساسي

| الربط | الوصف | مثال |
|-------|-------|------|
| `@entity` | نسخة الكيان الحالية | `@entity.status`، `@entity.id` |
| `@payload` | بيانات حمولة الحدث | `@payload.newStatus`، `@payload.amount` |
| `@state` | اسم حالة السمة الحالية | `@state` يعيد `"active"` |
| `@now` | الطابع الزمني الحالي (مللي ثانية) | `@now` يعيد `1709312400000` |
| `@user` | معلومات المستخدم المصادق | `@user.id`، `@user.email` |
| `@EntityName` | كيان مفرد | `@Player.health`، `@GameConfig.level` |

### الاستخدام في الحراس (Guards)

تستخدم الحراس (Guards) الربط للتحقق من الشروط قبل الانتقالات (Transitions):

```json
{
  "from": "active",
  "to": "completed",
  "event": "COMPLETE",
  "guards": [
    [">=", "@entity.progress", 100],
    ["=", "@entity.assigneeId", "@user.id"]
  ]
}
```

### الاستخدام في التأثيرات (Effects)

تستخدم التأثيرات (Effects) الربط لقراءة البيانات وتعديلها:

```json
{
  "effects": [
    ["set", "@entity.id", "status", "@payload.newStatus"],
    ["set", "@entity.id", "updatedAt", "@now"],
    ["increment", "@entity.id", "completionCount", 1]
  ]
}
```

### التنقل في المسارات

يدعم الربط صيغة النقطة للوصول المتداخل:

```
@entity.user.name          → entity.user.name
@payload.metadata.tags[0]  → payload.metadata.tags[0]
@Player.inventory.slots    → Player.inventory.slots
```

### عملية حل الربط

1. **التحليل** - استخراج البادئة `@` واسم الجذر
2. **البحث** - التحقق من المتغيرات المحلية (من `let`)، ثم الربط الأساسي
3. **التنقل** - اتباع مسار النقطة عبر بنية الكائن
4. **الإرجاع** - القيمة أو `undefined` إذا فشل المسار

---

## ربط السمة بالكيان (linkedEntity)

السمات (Traits) هي آلات حالة (State Machines) تعمل على الكيانات. الربط بين السمة وكيانها صريح.

### الكيان الأساسي

كل وحدة مدارية لها **كيان أساسي** - الكيان المحدد في خاصية `entity`:

```json
{
  "name": "TaskManagement",
  "entity": {
    "name": "Task",
    "collection": "tasks",
    "fields": [...]
  },
  "traits": [...]
}
```

السمات في هذه الوحدة المدارية تحصل تلقائياً على الوصول إلى `Task` عبر `@entity`.

### خاصية linkedEntity

عند الإشارة إلى سمة، يمكنك تحديد الكيان الذي يجب أن تعمل عليه:

```json
{
  "traits": [
    {
      "ref": "StatusManagement",
      "linkedEntity": "Task"
    },
    {
      "ref": "HealthManagement",
      "linkedEntity": "Player"
    }
  ]
}
```

**لماذا linkedEntity؟**

1. **سمات قابلة لإعادة الاستخدام** - سمة `StatusManagement` عامة يمكنها العمل مع أي كيان يحتوي على حقل `status`
2. **عمليات عبر الكيانات** - يمكن للسمة العمل على كيان مختلف عن الكيان الأساسي للوحدة المدارية
3. **ربط صريح** - يجعل تبعية الكيان واضحة وقابلة للتحقق من الأنواع

### كيف يعمل

عند إنشاء نسخة من السمة:

```typescript
const linkedEntity = traitDef.linkedEntity || orbitalEntityName;
this.traitEntityMap.set(trait.name, linkedEntity);
```

1. إذا تم تحديد `linkedEntity`، استخدمه
2. وإلا، استخدم الكيان الأساسي للوحدة المدارية
3. خزّن الربط لحل وقت التشغيل

### مثال: وحدة مدارية متعددة الكيانات

```json
{
  "name": "GameLevel",
  "entity": {
    "name": "Level",
    "persistence": "runtime",
    "fields": [...]
  },
  "traits": [
    { "ref": "LevelProgression", "linkedEntity": "Level" },
    { "ref": "PlayerHealth", "linkedEntity": "Player" },
    { "ref": "ScoreTracking", "linkedEntity": "GameState" }
  ]
}
```

كل سمة تعمل على كيانها المحدد، لكنها جميعاً جزء من نفس الوحدة المدارية.

---

## التعامل في وقت التشغيل

يدير وقت التشغيل الكيانات من خلال الآليات التالية:

### مسار معالجة الأحداث

1. **استلام الحدث** - `{ event: "UPDATE", payload: {...}, entityId: "task_123" }`
2. **حل الكيان** - تحميل بيانات الكيان من التخزين أو الذاكرة
3. **بناء السياق** - إنشاء سياق التقييم مع الربط
4. **التحقق من الحراس** - تقييم تعبيرات الحراس (Guards)
5. **تنفيذ التأثيرات** - تشغيل تأثيرات تغيير الحالة
6. **حفظ التغييرات** - حفظ بيانات الكيان المعدّلة
7. **إرجاع الاستجابة** - تضمين البيانات المحدثة وتأثيرات العميل

### واجهة محوّل الاستمرارية

```typescript
interface PersistenceAdapter {
  create(entityType: string, data: Record<string, unknown>): Promise<{ id: string }>;
  update(entityType: string, id: string, data: Record<string, unknown>): Promise<void>;
  delete(entityType: string, id: string): Promise<void>;
  getById(entityType: string, id: string): Promise<Record<string, unknown> | null>;
  list(entityType: string): Promise<Record<string, unknown>[]>;
}
```

---

## الوضع التجريبي مقابل الوضع الحقيقي

يدعم وقت التشغيل وضعين لاستمرارية الكيان:

### الوضع التجريبي (Mock Mode) - التطوير

**الإعداد:**
```typescript
const runtime = new OrbitalServerRuntime({
  mode: 'mock',
  mockSeed: 12345  // اختياري: بيانات حتمية
});
```

**الخصائص:**
- يستخدم MockPersistenceAdapter
- يولّد بيانات وهمية واقعية
- تخزين في الذاكرة (بدون قاعدة بيانات)
- توليد واعٍ بنوع الحقل (البريد الإلكتروني يبدو كبريد، والتواريخ صالحة)
- حتمي مع البذرة لاختبارات قابلة للتكرار
- يملأ تلقائياً عدداً محدداً من السجلات لكل كيان

**توليد أنواع الحقول:**

| نوع الحقل | البيانات المولّدة |
|-----------|-----------------|
| `string` | كلمات Lorem |
| `string` (name: "email") | عنوان بريد إلكتروني |
| `string` (name: "name") | اسم كامل |
| `number` | عدد صحيح عشوائي |
| `boolean` | قيمة منطقية عشوائية |
| `date` | تاريخ حديث |
| `enum` | قيمة عشوائية من مصفوفة `values` |

### الوضع الحقيقي (Real Mode) - الإنتاج

**الإعداد:**
```typescript
const runtime = new OrbitalServerRuntime({
  mode: 'real',
  persistence: new FirestorePersistenceAdapter(db)
});
```

**الخصائص:**
- يستخدم تطبيق PersistenceAdapter مخصص
- عمليات قاعدة بيانات حقيقية (Firestore، PostgreSQL، إلخ.)
- عمليات CRUD غير متزامنة
- استمرارية جاهزة للإنتاج

### مقارنة الأوضاع

| الجانب | الوضع التجريبي | الوضع الحقيقي |
|--------|---------------|-------------|
| الاستمرارية | في الذاكرة | قاعدة البيانات |
| مصدر البيانات | مولّدة | بيانات مستخدم حقيقية |
| الحتمية | قابلة للبذر | غير متاحة |
| حالة الاستخدام | التطوير، الاختبار | الإنتاج |
| الإعداد | بدون إعدادات | يتطلب محوّلاً |

---

## مشاركة الكيانات وعزلها

كيفية مشاركة الكيانات بين الوحدات المدارية تعتمد على نوع الاستمرارية:

### الكيانات الدائمة (مشتركة)

جميع الوحدات المدارية التي تستخدم نفس اسم الكيان تتشارك نفس المجموعة:

```
Orbital A (entity: Task) ──┐
                           ├──► Collection: "tasks"
Orbital B (entity: Task) ──┘
```

التغييرات في Orbital A تكون مرئية لـ Orbital B.

### كيانات وقت التشغيل (معزولة)

كل وحدة مدارية تحصل على نسخها الخاصة:

```
Orbital A (entity: Enemy) ──► Memory: "OrbitalA_enemies"
Orbital B (entity: Enemy) ──► Memory: "OrbitalB_enemies"
```

أعداء Orbital A منفصلة تماماً عن أعداء Orbital B.

### كيانات المفردة (نسخة واحدة)

نسخة واحدة مشتركة عبر الجميع:

```
Orbital A ──┐
Orbital B ──┼──► Single Player instance
Orbital C ──┘
```

جميع الوحدات المدارية ترى وتعدّل نفس بيانات `Player`.

---

## ملخص

يوفر نظام الكيانات في Orb:

1. **حقول مُنمَّطة** - أنواع قوية مع string، number، boolean، date، enum، relation، array، object
2. **أوضاع الاستمرارية** - دائم (قاعدة بيانات)، وقت التشغيل (ذاكرة)، مفرد (عام)
3. **نظام الربط** - `@entity`، `@payload`، `@state`، `@now`، `@user`، `@Singleton` للوصول في تعبيرات S-expression
4. **ربط السمة** - `linkedEntity` الصريح يربط السمات بمصدر بياناتها
5. **تحقق المُصرِّف** - التحقق من صحة البرنامج يضمن الصحة
6. **وقت تشغيل مرن** - وضع تجريبي للتطوير، وضع حقيقي للإنتاج
7. **التحكم في المشاركة** - الدائم يشارك، وقت التشغيل يعزل، المفرد عام

الكيان (Entity) هو أساس الوحدة المدارية (Orbital Unit) - السمات (Traits) تعمل عليه، الصفحات (Pages) تعرضه، ووقت التشغيل يدير دورة حياته.

---

*تاريخ إنشاء المستند: 2026-02-02*
*بناءً على تحليل قاعدة كود Orb*
