import type { Meta, StoryObj } from '@storybook/react-vite';
import { UISlotRenderer } from './UISlotRenderer';

const meta: Meta<typeof UISlotRenderer> = {
  title: 'Organisms/UISlotRenderer',
  component: UISlotRenderer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    includeHud: false,
    includeFloating: false,
  },
};

export const WithHud: Story = {
  args: {
    includeHud: true,
    includeFloating: false,
  },
};

export const WithFloating: Story = {
  args: {
    includeHud: false,
    includeFloating: true,
  },
};
