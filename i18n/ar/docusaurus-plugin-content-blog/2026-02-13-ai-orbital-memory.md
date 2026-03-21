---
slug: ai-orbital-memory
title: "لماذا منحنا وكيل الذكاء الاصطناعي ذاكرة orbital بدلاً من قاعدة بيانات متجهة"
authors: [osamah]
tags: [architecture, ai]
image: /img/blog/ai-orbital-memory.png
---

![لماذا منحنا وكيل الذكاء الاصطناعي ذاكرة orbital بدلاً من قاعدة بيانات متجهة](/img/blog/ai-orbital-memory.png)

الجميع يبني أنظمة RAG مع قواعد بيانات متجهة. لقد منحنا ذكاءنا الاصطناعي نظام ذاكرة مهيكل يفهم السياق بالفعل.

<!-- truncate -->

## مشكلة RAG

التوليد المُعزَّز بالاسترجاع (RAG) هو النهج المعياري لإعطاء وكلاء الذكاء الاصطناعي ذاكرة:

1. تلقي استعلام المستخدم: *"كيف تعاملت مع المصادقة آخر مرة؟"*
2. توليد متجه التضمين
3. البحث في قاعدة البيانات المتجهة عن متجهات مشابهة
4. حقن أعلى K نتيجة في الطلب
5. توليد الاستجابة

**المشكلة؟** التشابه المتجهي لا يساوي الصلة السياقية.

### عندما يفشل RAG

**السيناريو 1: السياق الزمني**
- المستخدم: *"ماذا فعلت يوم الثلاثاء الماضي؟"*
- قاعدة البيانات المتجهة: تعثر على مستندات عن "العمل" و"اجتماعات الثلاثاء"
- الواقع: يريد المستخدم جلسته المحددة من قبل 5 أيام

**السيناريو 2: مطابقة الـ Patterns**
- المستخدم: *"أرني جميع عروض القوائم التي بنيتها"*
- قاعدة البيانات المتجهة: تعثر على مستندات تحتوي على "قائمة" و"عرض"
- الواقع: يريد المستخدم patterns الـ entity-table المستخدمة عبر الجلسات

**السيناريو 3: الاستدلال السببي**
- المستخدم: *"لماذا فشل تطبيق المصادقة الخاص بي؟"*
- قاعدة البيانات المتجهة: تعثر على مستندات عن المصادقة
- الواقع: يحتاج المستخدم سلسلة الخطأ ثم الإصلاح ثم النجاح

البحث المتجهي يجد *نصاً مشابهاً*. لكنه لا يفهم *ما تسأل عنه بالفعل*.

## بديل الذاكرة الـ Orbital

بدلاً من التضمينات المتجهة، يستخدم ذكاء Almadar الاصطناعي **ذاكرة orbital (وحدة مدارية مهيكلة)**:

```typescript
// الذاكرة مهيكلة كـ orbital schemas
interface MemoryOrbital {
  userPreferences: {
    namingConvention: 'PascalCase' | 'camelCase';
    preferredPatterns: string[];
    commonEntities: string[];
    validationStyle: 'strict' | 'minimal';
  };

  generationSessions: {
    threadId: string;
    prompt: string;
    skill: string;
    patterns: string[];
    entities: string[];
    success: boolean;
    createdAt: Date;
  }[];

  projectContext: {
    appId: string;
    existingEntities: string[];
    conventions: string[];
    domain: string;
  };
}
```

هذه ذاكرة كـ **بيانات مهيكلة مع علاقات**، وليست أجزاء نصية مع متجهات.

## لماذا تصنع الـ Orbitals ذاكرة أفضل

### 1. الـ State Transitions الزمنية

بدلاً من مجرد الطوابع الزمنية، نلتقط *الرحلة*:

```json
{
  "sessionId": "sess_123",
  "prompt": "Create Order entity",
  "timeline": [
    { "state": "generated", "timestamp": "2025-03-01T10:00:00Z" },
    { "state": "validation_failed", "timestamp": "2025-03-01T10:02:00Z", "errors": ["Missing INIT"] },
    { "state": "fixed", "timestamp": "2025-03-01T10:05:00Z" },
    { "state": "compiled", "timestamp": "2025-03-01T10:06:00Z" }
  ]
}
```

الآن يمكن للذكاء الاصطناعي الإجابة على:
- *"ما الأخطاء التي أصلحتها الأسبوع الماضي؟"* -- البحث عن transitions من validation_failed إلى fixed
- *"ما معدل نجاحي؟"* -- عد مسارات generated إلى compiled
- *"أي الـ patterns تسبب أخطاء؟"* -- ربط الـ patterns بحالات الفشل

### 2. الاستعلام المهيكل

البحث في الجلسات بحقول فعلية:

```typescript
// البحث عن جميع الجلسات الناجحة التي تستخدم pattern الـ entity-table
const sessions = await memoryManager.getUserGenerationHistory(userId, {
  filter: {
    success: true,
    patterns: { $contains: 'entity-table' }
  }
});

// البحث عن سياق المشروع
const context = await memoryManager.getProjectContext(appId);
// يُرجع: { existingEntities: ['Order', 'User'], conventions: [...] }
```

لا تضمينات. لا عتبات تشابه. مجرد استعلامات دقيقة.

### 3. ذاكرة قابلة للتركيب

الـ orbitals تتركب مثل الـ orbitals العادية:

```json
{
  "name": "UserMemory",
  "orbitals": [
    { "name": "PreferenceMemory", "entity": "UserPreference" },
    { "name": "GenerationMemory", "entity": "GenerationSession" },
    { "name": "ProjectMemory", "entity": "ProjectContext" }
  ],
  "listens": [
    { "event": "SESSION_COMPLETED", "triggers": "UPDATE_MEMORY" }
  ]
}
```

تحديثات الذاكرة هي أحداث تُطلق state transitions — تماماً مثل تطبيقات Almadar العادية.

## كيف يعمل

### تسجيل جلسة

```typescript
// داخلي: نظام ذاكرة Almadar يسجل جلسات التوليد
const memoryManager = createMemoryManager(db);

// بعد إكمال جلسة توليد
await memoryManager.recordGeneration(userId, {
  threadId: 'thread_123',
  prompt: 'Create Order entity with validation',
  skill: 'kflow-orbitals',
  patterns: ['entity-form', 'validation-rules'],
  entities: ['Order', 'OrderItem'],
  success: true,
});

// تحديث تفضيلات المستخدم بناءً على الـ patterns المستخدمة
await memoryManager.updateUserPreferences(userId, {
  preferredPatterns: ['entity-form', 'validation-rules'],
  commonEntities: ['Order', 'OrderItem'],
});

// تحديث سياق المشروع
await memoryManager.updateProjectContext(appId, {
  existingEntities: ['Order', 'OrderItem'],
  conventions: ['use-entity-table-for-lists'],
});
```

### استخدام الذاكرة في التوليد

```typescript
// داخلي: عندما يبدأ الوكيل، يتم تحميل الذاكرة تلقائياً
const agent = createAgent({
  skill: 'kflow-orbitals',
  userId: 'user_123',
  appId: 'app_456',
});

// سياق الذاكرة يُحقن تلقائياً في طلب النظام
```

يتلقى الذكاء الاصطناعي:

```
## سياق المستخدم

### تفضيلات المستخدم
- التسمية المفضلة: PascalCase
- الـ patterns المفضلة: entity-form, validation-rules
- الـ entities شائعة الاستخدام: Order, OrderItem

### سياق المشروع
- المشروع: منصة تجارة إلكترونية
- الـ entities الموجودة: Order, OrderItem
- اصطلاحات المشروع: use-entity-table-for-lists
```

لا حاجة للاسترجاع — السياق المناسب موجود بالفعل.

## تشبيه واقعي: السجلات الطبية مقابل محرك البحث

**نهج قاعدة البيانات المتجهة** = بحث جوجل:
- البحث: "مشاكل القلب"
- النتيجة: ملايين النتائج عن القلوب
- المشكلة: عامة جداً، ليست عن قلبك أنت

**نهج الذاكرة الـ orbital** = سجلك الطبي:
- الاستعلام: رقم المريض 12345
- النتيجة: تاريخ كامل، أدوية، حساسيات، تشخيصات سابقة
- الميزة: مهيكل، دقيق، شخصي

عندما يعالجك طبيبك، لا يبحث في جوجل عن "أعراض القلب". إنه ينظر في **سجلك المهيكل**.

## المقارنة: RAG مقابل الذاكرة الـ Orbital

| الجانب | RAG (قاعدة بيانات متجهة) | الذاكرة الـ Orbital |
|--------|--------------------------|------------------|
| التخزين | أجزاء نصية + تضمينات | orbital schemas مهيكلة |
| الاستعلام | بحث بالتشابه | استعلامات مبنية على الحقول |
| الزمني | طوابع زمنية فقط | state transitions |
| العلاقات | غير صريحة | علاقات entities، مفاتيح خارجية |
| الاستدلال | تشابه سطحي | دلالي عميق + سببي |
| التحديثات | إعادة تضمين المستندات | state machine transitions |
| قابلية التفسير | "درجة التشابه: 0.87" | "الحقل المُطابَق: patterns" |

## الـ Schema الخاص بذاكرة الـ Orbital

هذا هو هيكل الذاكرة الفعلي:

```json
{
  "name": "AgentMemory",
  "version": "1.0.0",
  "orbitals": [
    {
      "name": "UserPreferenceMemory",
      "entity": {
        "name": "UserPreference",
        "fields": [
          { "name": "userId", "type": "string", "required": true },
          { "name": "namingConvention", "type": "enum", "values": ["PascalCase", "camelCase", "snake_case"] },
          { "name": "preferredPatterns", "type": "array", "items": { "type": "string" } },
          { "name": "commonEntities", "type": "array", "items": { "type": "string" } },
          { "name": "confidence", "type": "number", "default": 0.5 }
        ]
      }
    },
    {
      "name": "GenerationHistoryMemory",
      "entity": {
        "name": "GenerationSession",
        "fields": [
          { "name": "threadId", "type": "string", "required": true },
          { "name": "prompt", "type": "string", "required": true },
          { "name": "skill", "type": "string", "required": true },
          { "name": "patterns", "type": "array", "items": { "type": "string" } },
          { "name": "entities", "type": "array", "items": { "type": "string" } },
          { "name": "success", "type": "boolean" },
          { "name": "createdAt", "type": "timestamp" }
        ]
      }
    }
  ]
}
```

الذاكرة هي orbital schema. تستخدم نفس الـ patterns كأي تطبيق آخر.

## جرّبها: ابنِ وكيلاً واعياً بالذاكرة

```typescript
// داخلي: وكيل الذكاء الاصطناعي في Almadar يستخدم ذاكرة مهيكلة
// (هكذا يعمل من الداخل — ليس واجهة برمجية عامة)

const memoryManager = createMemoryManager(db);

// الوكيل يُنشأ مع إمكانية الوصول للذاكرة
const agent = createAgent({
  skill: 'kflow-orbitals',
  workDir: '/workspace',
  userId: 'user_123',
  appId: 'app_456',
});

// الوكيل الآن لديه وصول إلى:
// - الـ patterns المفضلة للمستخدم
// - الـ entities المُولَّدة سابقاً
// - اصطلاحات المشروع
// - النهج الناجحة/الفاشلة السابقة

const result = await agent.run({
  input: 'Create a Product entity',
});

// بعد الإكمال، تُزامَن بيانات الجلسة مع الذاكرة تلقائياً
// التسجيل: ما تم توليده، أي الـ patterns استُخدمت، النجاح/الفشل
```

## الخلاصة

تعتبر قواعد البيانات المتجهة رائعة لإيجاد *نص مشابه*. لكن وكلاء الذكاء الاصطناعي يحتاجون *فهماً مهيكلاً*:

- ما الـ patterns التي يفضلها هذا المستخدم؟
- ما الـ entities الموجودة في هذا المشروع؟
- ما الذي نجح من قبل وما الذي فشل؟
- كيف أصلحنا الأخطاء السابقة؟

الذاكرة الـ orbital توفر هذا الهيكل. ليست قاعدة بيانات — إنها **تمثيل معرفي** يتطابق مع طريقة تفكير Almadar حول التطبيقات.

لأن أفضل نظام ذاكرة ليس الذي يعثر على كلمات مشابهة. إنه الذي يفهم السياق.

التالي: [البحث الوكيلي: تعليم الذكاء الاصطناعي التذكر كالإنسان](./agentic-search).
