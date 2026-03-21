---
slug: context-compaction
title: "ضغط السياق: فن تلخيص جلسة برمجة من 3 ساعات لنموذجك اللغوي"
authors: [osamah]
tags: [architecture, ai]
image: /img/blog/context-compaction.png
---

![ضغط السياق: فن تلخيص جلسة برمجة من 3 ساعات لنموذجك اللغوي](/img/blog/context-compaction.png)

يملك مبرمجك الذكي الثنائي حداً قدره 200 ألف رمز. بعد 3 ساعات، أنت عند 150 ألف. ماذا تفعل؟

<!-- truncate -->

## مشكلة حد الرموز

أنت تبرمج مع ذكاء اصطناعي. بعد ثلاث ساعات:
- 47 رسالة من المستخدم
- 47 رد من المساعد
- 94 استدعاء أداة
- 94 نتيجة أداة

**المجموع: ~150 ألف رمز**

نافذة سياق النموذج اللغوي: **200 ألف رمز**

لديك 50 ألف رمز متبقية. بهذا المعدل، ستصل للحد خلال ساعة.

**الخيارات:**
1. **بدء جلسة جديدة** — فقدان كل السياق
2. **قص الرسائل القديمة** — فقدان تفاصيل قد تكون مهمة
3. **التلخيص بالنموذج اللغوي** — مكلف وبطيء
4. **ضغط السياق** — ضغط ذكي

## ما هو ضغط السياق؟

يقلل ضغط السياق استخدام الرموز بذكاء مع الحفاظ على المعنى الدلالي:

```
قبل: 847 رسالة، ~142 ألف رمز
بعد:  23 رسالة، ~3 آلاف رمز

[ملخص السياق — مضغوط من 847 رسالة]

## الطلب الأصلي
طلب المستخدم توليد schema (مخطط يصف بنية التطبيق) من نوع orbital لتطبيق إدارة مهام...

## الإجراءات المتخذة
1. إنشاء schema الـ `taskly.orb` مع 3 orbitals (وحدات بناء التطبيق)
2. التحقق — إصلاح 4 أخطاء
3. الـ compile (تحويل الـ schema لكود قابل للتشغيل) إلى قالب TypeScript
4. طلب المستخدم إضافة حقل "الأولوية"

## الحالة الحالية
- الـ schema صالح ويُصرَّف بنجاح
- مجلد العمل: /home/user/projects/taskly
```

## خط أنابيب الضغط

يتبع ضغط السياق في Almadar خط أنابيب من 8 خطوات:

### الخطوة 1: تقدير الرموز

```typescript
function estimateTokens(messages: Message[]): number {
  // استدلال مبني على الأحرف (دقة 80%)
  const totalChars = messages.reduce((sum, m) => {
    const content = typeof m.content === 'string'
      ? m.content
      : JSON.stringify(m.content);
    return sum + content.length;
  }, 0);

  return totalChars / 4; // ~4 أحرف لكل رمز
}
```

### الخطوة 2: تصنيف الرسائل

لا تتساوى جميع الرسائل:

| الفئة | أمثلة | أولوية الضغط |
|-------|--------|--------------|
| **النظام** | طلب النظام، تعليمات المهارة | لا تُلمس أبداً |
| **المرساة** | طلب المستخدم الأصلي | يُحفظ في الملخص |
| **كثيفة الأدوات** | قراءة ملفات، مخرجات التحقق | تُضغط أولاً |
| **الاستدلال** | تحليل المساعد | يُلخَّص |
| **الحديثة** | آخر N رسالة | لا تُلمس أبداً |

### الخطوة 3: التقسيم

التقسيم إلى قديم وحديث:

```typescript
const keepRecent = 20; // الاحتفاظ دائماً بآخر 20 رسالة
const recent = messages.slice(-keepRecent);
const old = messages.slice(0, -keepRecent);
```

### الخطوة 4: ضغط نتائج الأدوات

استبدال المخرجات الكبيرة بعناصر نائبة:

```typescript
// قبل: 850 سطر من الكود
{
  role: 'tool',
  content: '<850 lines of TypeScript...>'
}

// بعد: سطر واحد
{
  role: 'tool',
  content: '[read_file: src/schema.ts — 850 lines]'
}
```

### الخطوة 5: التلخيص (اختياري)

لاستراتيجية `summarize` أو `hybrid`:

```typescript
const summaryPrompt = `
Summarize this conversation for an AI assistant.
Focus on:
1. What the user originally requested
2. What actions have been taken
3. What the current state is
4. Any errors encountered and how they were fixed

Be concise but comprehensive.
`;

const summary = await llm.generate(summaryPrompt, oldMessages);
```

### الخطوة 6: إعادة التجميع

```typescript
const compacted = [
  systemMessage,      // طلب النظام الأصلي
  summaryMessage,     // الملخص المُولَّد
  ...recentMessages,  // آخر 20 رسالة بدون تغيير
];
```

### الخطوة 7: إرسال الحدث

```typescript
// إرسال إشعار الضغط لواجهة المستخدم
sse.send({
  type: 'compaction',
  data: {
    messagesBefore: 847,
    messagesAfter: 23,
    tokensBefore: 142000,
    tokensAfter: 3000,
    strategy: 'hybrid',
    summaryLength: summary.length,
  },
});
```

### الخطوة 8: الحفظ

تخزين بيانات الضغط الوصفية مع الجلسة:

```typescript
await sessionManager.recordCompaction(
  threadId,
  originalMessageCount,
  compactedMessageCount,
  'token_limit'
);
```

## خيارات التكوين

```typescript
interface CompactionConfig {
  maxTokens: number;           // عتبة التشغيل (افتراضي: 150000)
  triggerThreshold: number;    // 0-1، متى يُشغَّل (افتراضي: 0.75)
  keepRecentMessages: number;  // الاحتفاظ دائماً بآخر N (افتراضي: 20)
  strategy: 'truncate' | 'summarize' | 'hybrid';
  summaryModel?: string;       // استخدام نموذج أرخص للملخصات
}
```

### مقارنة الاستراتيجيات

| الاستراتيجية | كيف تعمل | الأفضل لـ |
|--------------|----------|-----------|
| **truncate** | حذف الرسائل الأقدم | سريعة، بدون استدعاء LLM إضافي |
| **summarize** | النموذج اللغوي يلخص الرسائل القديمة | الحفاظ على السياق |
| **hybrid** | ضغط الأدوات، تلخيص الباقي | توازن بين السرعة والجودة |

## مثال واقعي

**الجلسة: بناء منصة تجارة إلكترونية**

```
الساعة 1:
- إنشاء entities (نماذج البيانات) الـ Order, Product, User
- إعداد traits (سلوكيات) الـ CRUD
- الـ compile بنجاح
[الرسائل: 15، الرموز: ~8 آلاف]

الساعة 2:
- إضافة orbital عربة التسوق
- تنفيذ تدفق الدفع
- إصلاح أخطاء التحقق
[الرسائل: 35، الرموز: ~25 ألف]

الساعة 3:
- إضافة تكامل الدفع
- الاختبار من البداية للنهاية
- إعادة الهيكلة للأداء
[الرسائل: 67، الرموز: ~62 ألف]

الساعة 4:
- إضافة إدارة المخزون
- أدركنا: الرموز تنفد!
```

**تم تشغيل الضغط:**

```
[ملخص السياق — مضغوط من 67 رسالة]

## الطلب الأصلي
بناء منصة تجارة إلكترونية مع كتالوج منتجات،
عربة تسوق، ودفع.

## الـ entities المُنشأة
- Product: name, price, inventory
- User: email, name, addresses
- Order: items, total, status
- Cart: items, user relation

## الميزات الرئيسية المُنفَّذة
1. تصفح المنتجات (pattern الـ entity-table)
2. عربة التسوق (مبنية على الجلسة)
3. معالج الدفع (تدفق من 3 خطوات)
4. تكامل الدفع (Stripe)
5. إدارة المخزون

## الحالة الحالية
- 5 orbitals مُعرَّفة
- جميع الاختبارات ناجحة
- جاهز للنشر

## التركيز الأخير
إضافة إدارة المخزون وتنبيهات المخزون المنخفض.
```

**النتيجة:** 67 رسالة ← 1 ملخص + 20 حديثة = 21 رسالة

## مثال كود: استخدام الضغط

```typescript
// داخلي: نظام إدارة الجلسات في المدار

const sessionManager = new SessionManager({
  mode: 'firestore',
  firestoreDb: db,
  memoryManager,
  compactionConfig: {
    maxTokens: 150000,
    triggerThreshold: 0.8,
    keepRecentMessages: 10,
    strategy: 'hybrid',
  },
});

// التحقق مما إذا كان الضغط مطلوباً
const shouldCompact = sessionManager.shouldCompactMessages(messages);

if (shouldCompact) {
  console.log('Compacting context...');

  // في حلقة الوكيل، شغّل الضغط
  // قبل الإرسال للنموذج اللغوي
  const compacted = await compactMessages(
    messages,
    config
  );

  // التسجيل للتحليلات
  await sessionManager.recordCompaction(
    threadId,
    messages.length,
    compacted.length,
    'token_limit'
  );
}

// الحصول على سجل الضغط
const history = sessionManager.getCompactionHistory(threadId);
console.log(`Session compacted ${history.length} times`);
// Session compacted 3 times
```

## تشبيه واقعي: الملخص التنفيذي

يشبه ضغط السياق الملخص التنفيذي:

**التقرير الكامل (500 صفحة):**
- كل بريد إلكتروني
- كل محضر اجتماع
- كل جدول بيانات
- كل مسودة

**الملخص التنفيذي (صفحتان):**
- ما طُلب منا فعله
- ما فعلناه
- الحالة الحالية
- الخطوات التالية

لا يقرأ المدير التنفيذي 500 صفحة. إنه يقرأ الملخص وآخر التحديثات.

تعمل النماذج اللغوية بنفس الطريقة.

## المقايضات

### ما نحتفظ به
- تعليمات النظام (حرجة)
- طلب المستخدم الأصلي (السياق)
- الرسائل الحديثة (الحالة الحالية)
- patterns الخطأ/النجاح (التعلم)

### ما نفقده
- مخرجات الأدوات الدقيقة (تُستبدل بعناصر نائبة)
- الاستدلال الوسيط (يُلخَّص)
- محتويات الملفات الدقيقة (يمكن إعادة قراءتها)

### التخفيفات

1. **إعادة القراءة عند الطلب:** إذا احتاج النموذج اللغوي محتويات ملف، يمكنه إعادة القراءة
2. **الاحتفاظ بالقرارات الرئيسية:** الخيارات المهمة تُحفظ في الملخص
3. **تتبع المراجع:** الرسائل الأصلية مرتبطة لأغراض التصحيح

## الخلاصة

نوافذ السياق محدودة. الجلسات قد تكون طويلة.

يسد ضغط السياق الفجوة:
- **ضغط ذكي:** الحفاظ على المعنى، تقليل الرموز
- **استراتيجيات قابلة للتكوين:** مقايضات بين السرعة والجودة
- **شفاف:** المستخدم يرى ما تم ضغطه
- **قابل للاسترداد:** يمكن إعادة جلب البيانات المضغوطة

لأن أفضل مساعد ذكاء اصطناعي ليس الذي لديه ذاكرة لا نهائية — بل الذي يعرف ما يجب تذكره.

تعلم المزيد عن [إدارة الجلسات](./three-execution-models).
