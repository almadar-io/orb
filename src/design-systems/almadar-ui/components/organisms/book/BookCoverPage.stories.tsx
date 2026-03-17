import type { Meta, StoryObj } from '@storybook/react';
import { BookCoverPage } from './BookCoverPage';

const meta: Meta<typeof BookCoverPage> = {
  title: 'Organisms/Book/BookCoverPage',
  component: BookCoverPage,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof BookCoverPage>;

export const Arabic: Story = {
  args: {
    title: 'الأمة الرقمية',
    subtitle: 'رحلة في عالم البرمجة والذكاء الاصطناعي',
    author: 'المداري',
    direction: 'rtl',
  },
};

export const English: Story = {
  args: {
    title: 'Introduction to Orbital',
    subtitle: 'Building apps with state machines',
    author: 'Almadar Team',
    direction: 'ltr',
  },
};
