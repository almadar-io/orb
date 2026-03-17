import type { Meta, StoryObj } from '@storybook/react-vite';
import { ModalSlot } from './ModalSlot';

const meta: Meta<typeof ModalSlot> = {
  title: 'Organisms/ModalSlot',
  component: ModalSlot,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Example Modal',
    size: 'md',
  },
};

export const WithContent: Story = {
  args: {
    title: 'Modal With Content',
    size: 'md',
    children: 'This is modal content rendered inside the slot.',
  },
};

export const Loading: Story = {
  args: {
    title: 'Loading Modal',
    isLoading: true,
  },
};
