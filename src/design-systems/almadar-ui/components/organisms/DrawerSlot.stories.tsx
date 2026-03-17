import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { DrawerSlot } from './DrawerSlot';
import { VStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';

const meta: Meta<typeof DrawerSlot> = {
  title: 'Organisms/DrawerSlot',
  component: DrawerSlot,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Edit Item',
    children: (
      <VStack gap="md" className="p-4">
        <Typography variant="body">Drawer content rendered from a render_ui effect.</Typography>
        <Input placeholder="Item name" />
        <Button variant="primary">Save</Button>
      </VStack>
    ),
  },
};

export const RightPosition: Story = {
  args: {
    title: 'Details Panel',
    position: 'right',
    size: 'lg',
    children: (
      <VStack gap="md" className="p-4">
        <Typography variant="h3" weight="semibold">Item Details</Typography>
        <Typography variant="body" color="secondary">
          This drawer slides in from the right side of the screen.
        </Typography>
      </VStack>
    ),
  },
};

export const LeftPosition: Story = {
  args: {
    title: 'Navigation',
    position: 'left',
    size: 'sm',
    children: (
      <VStack gap="sm" className="p-4">
        <Typography variant="body">Navigation Item 1</Typography>
        <Typography variant="body">Navigation Item 2</Typography>
        <Typography variant="body">Navigation Item 3</Typography>
      </VStack>
    ),
  },
};

export const Empty: Story = {
  args: {
    title: 'Empty Drawer',
    children: undefined,
  },
};
