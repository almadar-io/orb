import type { Meta, StoryObj } from '@storybook/react';
import { ContentRenderer } from './ContentRenderer';

const meta: Meta<typeof ContentRenderer> = {
  title: 'Organisms/ContentRenderer',
  component: ContentRenderer,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof ContentRenderer>;

const mixedContent = `
# Introduction

This chapter covers the basics of **state machines**.

\`\`\`typescript
interface State {
  name: string;
  isInitial?: boolean;
}
\`\`\`

A state machine consists of states, transitions, and events.

<question>What are the three components of a state machine?</question>
<answer>States, transitions, and events.</answer>

## Orbital Example

Here is a trait definition:

\`\`\`json
{
  "states": [
    { "name": "idle", "isInitial": true },
    { "name": "active" },
    { "name": "done", "isTerminal": true }
  ],
  "transitions": [
    { "from": "idle", "to": "active", "event": "START" },
    { "from": "active", "to": "done", "event": "FINISH" }
  ]
}
\`\`\`
`;

export const Default: Story = {
  args: { content: mixedContent },
};

export const ArabicContent: Story = {
  args: {
    content: `
# مقدمة

هذا الفصل يشرح أساسيات **آلات الحالة**.

\`\`\`typescript
const state = "idle";
\`\`\`

<question>ما هي آلة الحالة؟</question>
<answer>نموذج رياضي يصف مجموعة من الحالات والانتقالات.</answer>
`,
    direction: 'rtl',
  },
};

export const PreParsedSegments: Story = {
  args: {
    segments: [
      { type: 'markdown' as const, content: '## Pre-parsed\n\nThese segments were passed directly.' },
      { type: 'code' as const, language: 'javascript', content: 'console.log("hello")' },
      { type: 'quiz' as const, question: 'Is this pre-parsed?', answer: 'Yes!' },
    ],
  },
};
