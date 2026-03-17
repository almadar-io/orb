import type { Meta, StoryObj } from '@storybook/react';
import { BookTableOfContents } from './BookTableOfContents';

const meta: Meta<typeof BookTableOfContents> = {
  title: 'Organisms/Book/BookTableOfContents',
  component: BookTableOfContents,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof BookTableOfContents>;

const sampleParts = [
  {
    title: 'الجزء الأول: الأساسيات',
    chapters: [
      { id: 'ch-01', title: 'الفصل الأول: مقدمة', content: '' },
      { id: 'ch-02', title: 'الفصل الثاني: نمط الدائرة المغلقة', content: '' },
    ],
  },
  {
    title: 'الجزء الثاني: التطبيقات',
    chapters: [
      { id: 'ch-03', title: 'الفصل الثالث: بناء أول تطبيق', content: '' },
    ],
  },
];

export const Arabic: Story = {
  args: {
    parts: sampleParts,
    currentChapterId: 'ch-01',
    direction: 'rtl',
  },
};

export const English: Story = {
  args: {
    parts: [
      {
        title: 'Part 1: Basics',
        chapters: [
          { id: 'en-01', title: 'Chapter 1: Introduction', content: '' },
          { id: 'en-02', title: 'Chapter 2: State Machines', content: '' },
        ],
      },
    ],
    currentChapterId: 'en-01',
    direction: 'ltr',
  },
};
