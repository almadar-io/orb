import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './Section';
import { Button } from '../atoms/Button';

const meta: Meta<typeof Section> = {
  title: 'Organisms/Section',
  component: Section,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Section Title',
    description: 'A brief description of this section.',
    children: 'Section content goes here.',
  },
};

export const CardVariant: Story = {
  args: {
    title: 'Card Section',
    description: 'This section has a card appearance.',
    variant: 'card',
    padding: 'lg',
    children: 'Content inside a card section.',
  },
};

export const WithAction: Story = {
  args: {
    title: 'Settings',
    description: 'Manage your preferences.',
    action: <Button variant="primary" size="sm">Save</Button>,
    divider: true,
    children: 'Settings form content here.',
  },
};

export const BorderedVariant: Story = {
  args: {
    title: 'Bordered Section',
    variant: 'bordered',
    padding: 'md',
    children: 'Content with a border.',
  },
};
