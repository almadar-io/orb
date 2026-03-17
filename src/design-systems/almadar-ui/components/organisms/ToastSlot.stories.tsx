import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToastSlot } from './ToastSlot';

const meta: Meta<typeof ToastSlot> = {
  title: 'Organisms/ToastSlot',
  component: ToastSlot,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'This is a toast notification message.',
    variant: 'info',
    title: 'Info',
  },
};

export const Success: Story = {
  args: {
    children: 'Operation completed successfully.',
    variant: 'success',
    title: 'Success',
  },
};

export const ErrorToast: Story = {
  args: {
    children: 'Something went wrong.',
    variant: 'error',
    title: 'Error',
  },
};

export const Warning: Story = {
  args: {
    children: 'Please review before continuing.',
    variant: 'warning',
    title: 'Warning',
  },
};
