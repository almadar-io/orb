import type { Meta, StoryObj } from '@storybook/react-vite';
import { Split } from './Split';
import { Box } from '../atoms/Box';

const meta: Meta<typeof Split> = {
  title: 'Organisms/Split',
  component: Split,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ratio: '1:1',
    gap: 'md',
    children: [
      <Box key="left" className="p-4 bg-[var(--color-muted)] rounded">Left Panel</Box>,
      <Box key="right" className="p-4 bg-[var(--color-muted)] rounded">Right Panel</Box>,
    ],
  },
};

export const SidebarContent: Story = {
  args: {
    ratio: '1:3',
    gap: 'lg',
    children: [
      <Box key="left" className="p-4 bg-[var(--color-muted)] rounded">Sidebar</Box>,
      <Box key="right" className="p-4 bg-[var(--color-muted)] rounded">Main Content</Box>,
    ],
  },
};

export const Reversed: Story = {
  args: {
    ratio: '1:2',
    gap: 'md',
    reverse: true,
    children: [
      <Box key="left" className="p-4 bg-[var(--color-muted)] rounded">First (shown right)</Box>,
      <Box key="right" className="p-4 bg-[var(--color-muted)] rounded">Second (shown left)</Box>,
    ],
  },
};
