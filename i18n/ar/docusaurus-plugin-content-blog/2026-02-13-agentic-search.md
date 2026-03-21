---
slug: agentic-search
title: "البحث الوكيلي: تعليم الذكاء الاصطناعي التذكر كالإنسان"
authors: [osamah]
tags: [architecture, ai]
image: /img/blog/agentic-search.png
---

![البحث الوكيلي: تعليم الذكاء الاصطناعي التذكر كالإنسان](/img/blog/agentic-search.png)

البحث المتجهي يعثر على نص مشابه. البحث الوكيلي يعثر على سياق ذي صلة. الفرق هو الاستدلال.

<!-- truncate -->

## مشكلة البحث

يسأل البحث التقليدي: *"أي المستندات تحتوي على هذه الكلمات؟"*

لكن البشر يسألون: *"ماذا قصدت عندما قلت ذلك؟"*

**مثال على استعلام:** *"كيف تعاملت مع مصادقة المستخدم؟"*

**نهج البحث المتجهي:**
- يعثر على مستندات تحتوي "مستخدم" و"مصادقة"
- يفوّت: جلسات عن "auth"، "login"، "sign-in"
- يفوّت: سياق لماذا اخترت JWT مقابل sessions
- يفوّت: سلسلة الخطأ ← الإصلاح ← النجاح

**نهج الذاكرة البشرية:**
- "أتذكر أنني عملت على ذلك الشهر الماضي"
- "كان ذلك لمشروع التجارة الإلكترونية"
- "جربت OAuth أولاً، ثم انتقلت إلى JWT"
- "المشكلة كانت في تجديد الرمز"

يبحث البشر بـ **الاستدلال**، وليس بـ **التشابه**.

## البحث الوكيلي

يجمع البحث الوكيلي:
1. **الفهم الدلالي** — ماذا يعني الاستعلام؟
2. **التنقل الزمني** — متى حدث هذا؟
3. **التعرف على الـ patterns (أنماط تكرارية في البيانات أو السلوك)** — أي نوع من الحلول؟
4. **الاستدلال السببي** — ما الذي أدى إلى النجاح؟

```typescript
const response = await searchEngine.search({
  userId: 'user_123',
  query: "How did I handle user authentication?",
  strategy: 'hybrid',  // temporal + semantic + pattern
  depth: 3,
  limit: 10,
});

// يُرجع:
response.insights.summary
// "Found 3 authentication implementations across 2 projects"

response.insights.patterns
// ["jwt-auth", "oauth-integration", "session-management"]

response.insights.suggestions
// ["Consider reusing the JWT pattern from Project A"]

response.results[0].reasoning
// "Session from March 2025 implemented JWT authentication
//    with refresh tokens for the e-commerce project"
```

## أربع استراتيجيات بحث

### 1. البحث الزمني

*"ماذا فعلت الأسبوع الماضي؟"*

```typescript
const response = await searchEngine.search({
  userId: 'user_123',
  query: "Show me recent authentication work",
  strategy: 'temporal',
});
```

كيف يعمل:
1. تحليل العلامات الزمنية ("حديث"، "الأسبوع الماضي"، "الثلاثاء")
2. الترجيح بالحداثة (انحلال أسي)
3. تعزيز المطابقات من الفترة الزمنية المطلوبة

```typescript
// تسجيل الصلة
const daysAgo = (Date.now() - session.createdAt) / (1000 * 60 * 60 * 24);
const recencyBoost = Math.max(0.1, 1 - daysAgo / 30);
```

### 2. البحث الدلالي

*"كيف تعاملت مع أدوار المستخدمين؟"*

```typescript
const response = await searchEngine.search({
  userId: 'user_123',
  query: "Find my role-based access control implementation",
  strategy: 'semantic',
});
```

كيف يعمل:
1. استخراج المفاهيم الدلالية ("أدوار"، "وصول"، "صلاحيات")
2. المطابقة مع التفضيلات وسياق المشروع
3. الربط المتقاطع مع محتوى الجلسة

```typescript
const concepts = extractConcepts(query);
// { entities: ['Role', 'User'], patterns: ['guard'], actions: ['authorize'] }

// المطابقة مع الجلسات
const matches = sessions.filter(s =>
  s.entities.some(e => concepts.entities.includes(e)) ||
  s.patterns.some(p => concepts.patterns.includes(p))
);
```

### 3. البحث بالـ patterns

*"أرني جميع عروض القوائم التي بنيتها"*

```typescript
const response = await searchEngine.search({
  userId: 'user_123',
  query: "Find all my list views",
  strategy: 'pattern',
});
```

كيف يعمل:
1. استخراج مصطلحات الـ patterns ("قائمة"، "جدول"، "شبكة"، "بطاقات")
2. البحث في سجلات تقارب الـ patterns
3. إرجاع الجلسات التي تستخدم تلك الـ patterns

```typescript
const patternTerms = ['list', 'table', 'grid', 'cards'];
const userPatterns = await memoryManager.getUserPatterns(userId);

// إيجاد الـ patterns عالية النجاح
const goodPatterns = userPatterns.filter(p =>
  p.successCount / p.usageCount > 0.8
);
```

### 4. البحث الهجين

*"ما الذي نجح مع النماذج؟"* (يجمع جميع الاستراتيجيات)

```typescript
const response = await searchEngine.search({
  userId: 'user_123',
  query: "What worked well for forms?",
  strategy: 'hybrid',
  depth: 3,
  limit: 10,
});
```

يجمع نتائج البحث الزمني والدلالي والـ patterns مع إزالة التكرار.

## محرك الاستدلال

البحث الوكيلي لا يُرجع مطابقات فحسب — بل **يشرح لماذا تطابقت**:

```typescript
interface SearchResult {
  type: 'preference' | 'session' | 'project' | 'pattern';
  data: unknown;
  relevance: number;  // 0-1
  reasoning: string;  // تفسير مقروء للبشر
  source: string;     // من أين أتت
}

// مثال على نتيجة
{
  type: 'session',
  data: { /* سجل الجلسة */ },
  relevance: 0.87,
  reasoning: "Session from March 2025 contains 'User' entity with
             'role' field and uses 'guard-clause' pattern.
             User previously marked this pattern as successful.",
  source: 'generation_history'
}
```

## توليد الرؤى

بعيداً عن النتائج الفردية، يولّد البحث الوكيلي **رؤى**:

```typescript
interface Insights {
  summary: string;           // ما تم إيجاده
  patterns: string[];        // الـ patterns الشائعة
  trends: string[];          // الاتجاهات الزمنية
  suggestions: string[];     // الخطوات التالية القابلة للتنفيذ
}

// مثال
{
  summary: "Found 12 sessions involving forms across 3 projects",
  patterns: ["form-section", "validation-rules", "wizard-flow"],
  trends: [
    "High success rate (92%) with form-section pattern",
    "Validation errors decreased after adopting std/validate"
  ],
  suggestions: [
    "Consider reusing the wizard-flow pattern for complex forms",
    "Add entity-form to your preferred patterns"
  ]
}
```

## مثال واقعي

**استعلام المستخدم:** *"كيف بنيت تدفق الدفع؟"*

**عملية البحث الوكيلي:**

1. **استخراج المفاهيم**
   ```typescript
   concepts = {
     entities: ['Order', 'Payment', 'Cart'],
     patterns: ['wizard', 'form', 'validation'],
     actions: ['checkout', 'purchase', 'pay']
   }
   ```

2. **البحث الزمني**
   - وجد 5 جلسات من آخر 3 أشهر
   - مُرجَّحة بالحداثة

3. **البحث الدلالي**
   - طابق "checkout" في الطلبات
   - وجد entities ذات صلة (Order, Cart)

4. **البحث بالـ patterns**
   - وجد استخدام pattern الـ `wizard-flow`
   - معدل نجاح 90%

5. **توليد الرؤى**
   ```typescript
   {
     summary: "Found checkout implementation using 3-step wizard",
     patterns: ["wizard-flow", "form-section", "validation-rules"],
     trends: [
       "Most successful: 3-step wizard (92% completion)",
       "Less successful: single-page checkout (67%)"
     ],
     suggestions: [
       "Reuse wizard-flow for future checkout flows",
       "Consider adding progress indicator pattern"
     ]
   }
   ```

## مثال كود: استخدام البحث الوكيلي

```typescript
// داخلي: محرك البحث الوكيلي في المدار
// (هكذا يعمل من الداخل — ليس واجهة برمجية عامة)
const searchEngine = createSearchEngine(memoryManager);

// البحث عن أنماط المصادقة
const response = await searchEngine.search({
  userId: 'user_123',
  query: "How did I handle authentication in the e-commerce project?",
  strategy: 'hybrid',
  depth: 3,
  limit: 10,
});

// عرض الملخص
console.log(response.insights.summary);
// "Found 4 authentication implementations across 2 projects"

// عرض الـ patterns المستخدمة
response.insights.patterns.forEach(pattern => {
  console.log(`- ${pattern}`);
});
// - jwt-auth
// - oauth-integration
// - session-management

// عرض أعلى النتائج مع الاستدلال
response.results.slice(0, 3).forEach(result => {
  console.log(`${result.type}: ${result.reasoning} (${result.relevance})`);
});

// session: Session from March 2025 implemented JWT authentication
//   with refresh tokens for the e-commerce project (0.92)
//
// pattern: Pattern 'jwt-auth' has 95% success rate across 12 uses (0.88)
//
// preference: User prefers JWT over session-based auth (0.85)

// تنفيذ إجراء بناءً على الاقتراحات
if (response.insights.suggestions.length > 0) {
  console.log("\nSuggested actions:");
  response.insights.suggestions.forEach(s => console.log(`- ${s}`));
}
// - Consider reusing the JWT pattern from E-Commerce project
// - Add 'jwt-auth' to your preferred patterns
```

## المقارنة: المتجهي مقابل الوكيلي

| الجانب | البحث المتجهي | البحث الوكيلي |
|--------|---------------|---------------|
| الاستعلام | "authentication" | "كيف تعاملت مع المصادقة؟" |
| الطريقة | تشابه التضمينات | استدلال + تنقل |
| النتائج | نص مشابه | سياق ذو صلة |
| الزمني | طابع زمني فقط | state transitions |
| السببي | لا يوجد | سلاسل خطأ ← إصلاح |
| التفسير | درجة تشابه | استدلال مقروء للبشر |
| الرؤى | لا يوجد | patterns، اتجاهات، اقتراحات |

## تشبيه واقعي: أمين المكتبة مقابل مساعد البحث

**البحث المتجهي** = أمين المكتبة:
- أنت: "كتب عن الفضاء"
- أمين المكتبة: "إليك كل شيء يحتوي 'فضاء' في العنوان"
- النتيجة: 500 كتاب، معظمها غير ذي صلة

**البحث الوكيلي** = مساعد البحث:
- أنت: "ما الذي استنتجناه عن مهمات المريخ؟"
- المساعد: "قرأت 'Red Mars' في 2023، واستنتجت أننا نحتاج حماية أفضل من الإشعاع.
             ذو صلة: ملاحظاتك في 2024 عن أنظمة دعم الحياة في SpaceX Starship.
             اقتراح: تحقق من تقرير ناسا الجديد عن تخفيف الإشعاع."
- النتيجة: ذات صلة بدقة، مع سياق واقتراحات

## الخلاصة

يجيب البحث المتجهي: *"ما الذي يشبه هذا النص؟"*

يجيب البحث الوكيلي: *"ما الذي أحتاج معرفته الآن؟"*

الفرق هو **الاستدلال**:
- فهم نية الاستعلام
- التنقل في السياق الزمني
- التعرف على الـ patterns
- رسم الـ bindings (الروابط بين البيانات)
- اقتراح الخطوات التالية

هكذا يتذكر البشر. وهكذا يتذكر ذكاؤنا الاصطناعي أيضاً.

تعلم المزيد عن [الذاكرة المدارية](./ai-orbital-memory).
