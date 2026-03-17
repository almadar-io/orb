import type { Meta, StoryObj } from '@storybook/react';
import { BookNavBar } from './BookNavBar';

const meta: Meta<typeof BookNavBar> = {
  title: 'Organisms/Book/BookNavBar',
  component: BookNavBar,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof BookNavBar>;

export const Default: Story = {
  args: {
    currentPage: 3,
    totalPages: 10,
    chapterTitle: 'Chapter 2: State Machines',
    direction: 'ltr',
  },
};

export const Arabic: Story = {
  args: {
    currentPage: 3,
    totalPages: 10,
    chapterTitle: 'الفصل الثاني: آلات الحالة',
    direction: 'rtl',
  },
};

export const FirstPage: Story = {
  args: {
    currentPage: 0,
    totalPages: 10,
    chapterTitle: 'Cover',
    direction: 'ltr',
  },
};

export const LastPage: Story = {
  args: {
    currentPage: 9,
    totalPages: 10,
    chapterTitle: 'Final Chapter',
    direction: 'ltr',
  },
};
