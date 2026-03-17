import type { Meta, StoryObj } from '@storybook/react';
import { QuizBlock } from './QuizBlock';

const meta: Meta<typeof QuizBlock> = {
  title: 'Molecules/QuizBlock',
  component: QuizBlock,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof QuizBlock>;

export const Default: Story = {
  args: {
    question: 'What is a state machine?',
    answer:
      'A state machine is a mathematical model of computation that describes a system as a set of states, transitions between those states, and events that trigger transitions.',
  },
};

export const Arabic: Story = {
  args: {
    question: 'ما هي آلة الحالة؟',
    answer: 'آلة الحالة هي نموذج رياضي للحوسبة يصف نظامًا كمجموعة من الحالات والانتقالات بينها والأحداث التي تُفعّل الانتقالات.',
  },
};
