import type { Meta, StoryObj } from '@storybook/react';
import { BookViewer } from './BookViewer';
import type { BookData } from './types';

const meta: Meta<typeof BookViewer> = {
  title: 'Organisms/BookViewer',
  component: BookViewer,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof BookViewer>;

// ---------------------------------------------------------------------------
// Sample Arabic book data (canonical English fields)
// ---------------------------------------------------------------------------

const sampleBook: BookData = {
  title: 'الأمة الرقمية',
  subtitle: 'رحلة في عالم البرمجة والذكاء الاصطناعي',
  author: 'المداري',
  direction: 'rtl',
  parts: [
    {
      title: 'الجزء الأول: الأساسيات',
      chapters: [
        {
          id: 'ch-01',
          title: 'الفصل الأول: مقدمة في آلات الحالة',
          content: `
آلة الحالة هي نموذج رياضي يصف سلوك النظام كمجموعة من **الحالات** والانتقالات بينها.

## المفاهيم الأساسية

كل آلة حالة تتكون من:
- **حالات** (States) — الأوضاع الممكنة للنظام
- **انتقالات** (Transitions) — كيف ينتقل النظام من حالة لأخرى
- **أحداث** (Events) — ما يُفعّل الانتقالات

\`\`\`json
{
  "states": [
    { "name": "مسودة", "isInitial": true },
    { "name": "نشط" },
    { "name": "مكتمل", "isTerminal": true }
  ],
  "transitions": [
    { "from": "مسودة", "to": "نشط", "event": "تفعيل" },
    { "from": "نشط", "to": "مكتمل", "event": "إكمال" }
  ]
}
\`\`\`

## تطبيق عملي

لنأخذ مثالاً على نظام إدارة المهام:

\`\`\`typescript
type TaskState = 'draft' | 'active' | 'completed';

function transition(state: TaskState, event: string): TaskState {
  switch (state) {
    case 'draft':
      return event === 'ACTIVATE' ? 'active' : state;
    case 'active':
      return event === 'COMPLETE' ? 'completed' : state;
    default:
      return state;
  }
}
\`\`\`

<question>ما هي العناصر الثلاثة الأساسية لآلة الحالة؟</question>
<answer>الحالات والانتقالات والأحداث.</answer>

## الخلاصة

آلات الحالة توفر طريقة منهجية لوصف سلوك الأنظمة المعقدة بشكل واضح وقابل للتنبؤ.
`,
        },
        {
          id: 'ch-02',
          title: 'الفصل الثاني: نمط الدائرة المغلقة',
          content: `
نمط الدائرة المغلقة (Closed Circuit Pattern) هو المبدأ الأساسي في بناء تطبيقات Orbital.

## كيف يعمل

\`\`\`
حدث → حارس → انتقال → تأثيرات → استجابة واجهة → حدث جديد
\`\`\`

كل تفاعل مع المستخدم يمر عبر هذه الدورة الكاملة. لا يوجد تفاعل مباشر — كل شيء يمر عبر آلة الحالة.

## مثال

عندما ينقر المستخدم على زر "حفظ":
1. يُنشأ حدث \`SAVE\`
2. يفحص الحارس: هل البيانات صالحة؟
3. إذا نعم → ينتقل إلى حالة \`saving\`
4. تُنفذ التأثيرات: حفظ البيانات في القاعدة
5. تتحدث الواجهة: رسالة نجاح
6. الدورة تنتهي أو تبدأ من جديد

<question>لماذا نسمي هذا النمط "الدائرة المغلقة"؟</question>
<answer>لأن كل تفاعل يمر عبر دورة كاملة تبدأ وتنتهي عند نفس النقطة: واجهة المستخدم.</answer>
`,
        },
      ],
    },
    {
      title: 'الجزء الثاني: التطبيقات',
      chapters: [
        {
          id: 'ch-03',
          title: 'الفصل الثالث: بناء أول تطبيق',
          content: `
في هذا الفصل سنبني تطبيقًا بسيطًا لإدارة المهام.

## الهيكل

\`\`\`json
{
  "orbitals": [
    {
      "entity": {
        "name": "Task",
        "fields": [
          { "name": "title", "type": "string" },
          { "name": "status", "type": "string", "default": "draft" }
        ]
      },
      "traits": [
        {
          "name": "TaskManagement",
          "stateMachine": {
            "states": [
              { "name": "draft", "isInitial": true },
              { "name": "active" },
              { "name": "done", "isTerminal": true }
            ],
            "transitions": [
              { "from": "draft", "to": "active", "event": "START" },
              { "from": "active", "to": "done", "event": "FINISH" }
            ]
          }
        }
      ]
    }
  ]
}
\`\`\`

هذا المخطط يُعرّف كيانًا اسمه \`Task\` مع سمة \`TaskManagement\` تدير دورة حياته.
`,
        },
      ],
    },
  ],
};

export const ArabicBook: Story = {
  args: { entity: [sampleBook] },
};

export const StartAtTOC: Story = {
  args: { entity: [sampleBook], initialPage: 1 },
};

export const StartAtChapter: Story = {
  args: { entity: [sampleBook], initialPage: 2 },
};

// ---------------------------------------------------------------------------
// English sample
// ---------------------------------------------------------------------------

const englishBook: BookData = {
  title: 'Introduction to Orbital',
  subtitle: 'Building apps with state machines',
  author: 'Almadar Team',
  direction: 'ltr',
  parts: [
    {
      title: 'Getting Started',
      chapters: [
        {
          id: 'en-01',
          title: 'Chapter 1: What is Orbital?',
          content: `
Orbital is a schema-driven framework for building full-stack applications.

## Core Concepts

- **Entity** — your data shape
- **Trait** — a state machine that governs behavior
- **Page** — a route binding traits to URLs

\`\`\`typescript
const orbital = {
  entity: { name: 'Task', fields: [{ name: 'title', type: 'string' }] },
  traits: [{ name: 'Management', stateMachine: { /* ... */ } }],
};
\`\`\`

<question>What are the three building blocks?</question>
<answer>Entity, Trait, and Page.</answer>
`,
        },
      ],
    },
  ],
};

export const EnglishBook: Story = {
  args: { entity: [englishBook] },
};

// ---------------------------------------------------------------------------
// Arabic entity data with Arabic field names (simulates runtime .orb entity)
// ---------------------------------------------------------------------------

const arabicEntityData: Record<string, unknown> = {
  العنوان: 'الأمة الرقمية',
  العنوان_الفرعي: 'رحلة في بناء الأمم',
  المؤلف: 'المداري',
  الاتجاه: 'rtl',
  الأجزاء: [
    {
      العنوان: 'الجزء الأول: الهجرة والتأسيس',
      الفصول: [
        {
          المعرف: 'ch-01',
          العنوان: 'الفصل الأول: الهجرة',
          المحتوى: `
## الهجرة النبوية

الهجرة من مكة إلى المدينة كانت نقطة التحول الكبرى في تاريخ الأمة الإسلامية.

\`\`\`json
{
  "states": [
    { "name": "تخطيط", "isInitial": true },
    { "name": "تنفيذ" },
    { "name": "تأسيس", "isTerminal": true }
  ],
  "transitions": [
    { "from": "تخطيط", "to": "تنفيذ", "event": "بدء" },
    { "from": "تنفيذ", "to": "تأسيس", "event": "وصول" }
  ]
}
\`\`\`

<question>ما أهمية الهجرة في بناء الأمة؟</question>
<answer>الهجرة أسست مجتمعًا جديدًا قائمًا على الإيمان بدلًا من القبيلة.</answer>
`,
        },
      ],
    },
  ],
};

export const ArabicFieldMap: Story = {
  name: 'Arabic Entity (Field Map)',
  args: {
    entity: [arabicEntityData],
    fieldMap: 'ar',
  },
};

// ---------------------------------------------------------------------------
// Chapter with orbital diagram (chapter-level orbitalSchema)
// ---------------------------------------------------------------------------

const bookWithChapterOrbital: BookData = {
  title: 'Orbital Diagrams Test',
  subtitle: 'Testing JazariStateMachine rendering',
  author: 'Almadar Team',
  direction: 'ltr',
  parts: [
    {
      title: 'Diagrams',
      chapters: [
        {
          id: 'diag-01',
          title: 'Chapter with chapter-level orbital',
          content: `
This chapter has an \`orbitalSchema\` prop set at the chapter level.
The JazariStateMachine diagram should appear **above** this content.

Below is a regular code block (no orbital detection):

\`\`\`typescript
const x = 42;
\`\`\`
`,
          orbitalSchema: {
            orbitals: [
              {
                entity: {
                  name: 'Order',
                  fields: [{ name: 'total' }, { name: 'status' }],
                },
                traits: [
                  {
                    name: 'OrderLifecycle',
                    stateMachine: {
                      states: [
                        { name: 'pending', isInitial: true },
                        { name: 'confirmed' },
                        { name: 'shipped' },
                        { name: 'delivered', isTerminal: true },
                        { name: 'cancelled', isTerminal: true },
                      ],
                      transitions: [
                        { from: 'pending', to: 'confirmed', event: 'CONFIRM' },
                        { from: 'confirmed', to: 'shipped', event: 'SHIP' },
                        { from: 'shipped', to: 'delivered', event: 'DELIVER' },
                        { from: 'pending', to: 'cancelled', event: 'CANCEL' },
                        { from: 'confirmed', to: 'cancelled', event: 'CANCEL' },
                      ],
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          id: 'diag-02',
          title: 'Chapter with inline orbital JSON',
          content: `
This chapter has NO chapter-level orbital, but the content contains
an inline JSON code block with \`states\` + \`transitions\` — it should
be auto-detected and render a JazariStateMachine below the code block.

\`\`\`json
{
  "states": [
    { "name": "idle", "isInitial": true },
    { "name": "loading" },
    { "name": "success", "isTerminal": true },
    { "name": "error" }
  ],
  "transitions": [
    { "from": "idle", "to": "loading", "event": "FETCH" },
    { "from": "loading", "to": "success", "event": "RESOLVE" },
    { "from": "loading", "to": "error", "event": "REJECT" },
    { "from": "error", "to": "loading", "event": "RETRY" }
  ]
}
\`\`\`

And here is a full schema with \`orbitals\` array — also auto-detected:

\`\`\`json
{
  "orbitals": [
    {
      "entity": { "name": "User", "fields": [{ "name": "email" }] },
      "traits": [
        {
          "name": "Auth",
          "stateMachine": {
            "states": [
              { "name": "anonymous", "isInitial": true },
              { "name": "authenticated" },
              { "name": "locked", "isTerminal": true }
            ],
            "transitions": [
              { "from": "anonymous", "to": "authenticated", "event": "LOGIN" },
              { "from": "authenticated", "to": "anonymous", "event": "LOGOUT" },
              { "from": "authenticated", "to": "locked", "event": "LOCK" }
            ]
          }
        }
      ]
    }
  ]
}
\`\`\`
`,
        },
      ],
    },
  ],
};

export const WithOrbitalDiagrams: Story = {
  name: 'With Orbital Diagrams',
  args: { entity: [bookWithChapterOrbital], initialPage: 2 },
};
