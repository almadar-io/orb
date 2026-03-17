import type { Meta, StoryObj } from '@storybook/react';
import { BookChapterView } from './BookChapterView';

const meta: Meta<typeof BookChapterView> = {
  title: 'Organisms/Book/BookChapterView',
  component: BookChapterView,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof BookChapterView>;

export const Arabic: Story = {
  args: {
    chapter: {
      id: 'ch-01',
      title: 'الفصل الأول: مقدمة في آلات الحالة',
      content: `
آلة الحالة هي نموذج رياضي يصف سلوك النظام.

## المفاهيم الأساسية

- **حالات** — الأوضاع الممكنة
- **انتقالات** — كيف ينتقل النظام

\`\`\`typescript
type State = 'idle' | 'active' | 'done';
\`\`\`

<question>ما هي آلة الحالة؟</question>
<answer>نموذج رياضي يصف مجموعة من الحالات والانتقالات.</answer>
`,
    },
    direction: 'rtl',
  },
};

export const WithOrbitalSchema: Story = {
  args: {
    chapter: {
      id: 'ch-02',
      title: 'Chapter with Orbital Diagram',
      content: 'This chapter has an attached orbital schema rendered above.',
      orbitalSchema: {
        orbitals: [
          {
            entity: { name: 'Task', fields: [{ name: 'title' }] },
            traits: [
              {
                name: 'Management',
                stateMachine: {
                  states: [
                    { name: 'draft', isInitial: true },
                    { name: 'active' },
                    { name: 'done', isTerminal: true },
                  ],
                  transitions: [
                    { from: 'draft', to: 'active', event: 'START' },
                    { from: 'active', to: 'done', event: 'FINISH' },
                  ],
                },
              },
            ],
          },
        ],
      },
    },
    direction: 'ltr',
  },
};
