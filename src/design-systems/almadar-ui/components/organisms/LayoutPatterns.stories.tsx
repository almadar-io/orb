import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import {
  VStackPattern,
  HStackPattern,
  BoxPattern,
  GridPattern,
  CenterPattern,
  SpacerPattern,
  DividerPattern,
} from './LayoutPatterns';
import { Typography } from '../atoms/Typography';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';

const meta: Meta<typeof VStackPattern> = {
  title: 'Organisms/LayoutPatterns',
  component: VStackPattern,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof VStackPattern>;

export const Default: Story = {
  args: {
    gap: 'md',
    children: (
      <>
        <Card className="p-4"><Typography variant="body">Item 1</Typography></Card>
        <Card className="p-4"><Typography variant="body">Item 2</Typography></Card>
        <Card className="p-4"><Typography variant="body">Item 3</Typography></Card>
      </>
    ),
  },
};

export const HorizontalStack: Story = {
  render: () => (
    <HStackPattern gap="md" align="center">
      <Badge variant="info">Tag A</Badge>
      <Badge variant="success">Tag B</Badge>
      <Badge variant="warning">Tag C</Badge>
      <Badge variant="danger">Tag D</Badge>
    </HStackPattern>
  ),
};

export const BoxWithStyling: Story = {
  render: () => (
    <BoxPattern p="lg" bg="surface" border radius="lg" shadow="md">
      <VStackPattern gap="sm">
        <Typography variant="h3" weight="semibold">Styled Box</Typography>
        <Typography variant="body" color="secondary">
          A box pattern with padding, background, border, radius, and shadow.
        </Typography>
      </VStackPattern>
    </BoxPattern>
  ),
};

export const GridLayout: Story = {
  render: () => (
    <GridPattern cols={3} gap="md">
      <Card className="p-4"><Typography variant="body">Cell 1</Typography></Card>
      <Card className="p-4"><Typography variant="body">Cell 2</Typography></Card>
      <Card className="p-4"><Typography variant="body">Cell 3</Typography></Card>
      <Card className="p-4"><Typography variant="body">Cell 4</Typography></Card>
      <Card className="p-4"><Typography variant="body">Cell 5</Typography></Card>
      <Card className="p-4"><Typography variant="body">Cell 6</Typography></Card>
    </GridPattern>
  ),
};

export const CenterContent: Story = {
  render: () => (
    <CenterPattern minHeight="200px" className="border border-dashed border-[var(--color-border)] rounded-lg">
      <VStackPattern gap="sm" align="center">
        <Typography variant="h3" weight="semibold">Centered Content</Typography>
        <Typography variant="body" color="secondary">Horizontally and vertically centered.</Typography>
      </VStackPattern>
    </CenterPattern>
  ),
};

export const SpacerUsage: Story = {
  render: () => (
    <HStackPattern gap="none" className="w-full border border-[var(--color-border)] rounded-lg p-4">
      <Typography variant="body" weight="semibold">Logo</Typography>
      <SpacerPattern size="flex" />
      <Badge variant="info">Navigation</Badge>
    </HStackPattern>
  ),
};

export const DividerUsage: Story = {
  render: () => (
    <VStackPattern gap="none">
      <Typography variant="body">Section A</Typography>
      <DividerPattern spacing="md" />
      <Typography variant="body">Section B</Typography>
      <DividerPattern spacing="lg" variant="dashed" />
      <Typography variant="body">Section C</Typography>
    </VStackPattern>
  ),
};

export const ComposedLayout: Story = {
  render: () => (
    <VStackPattern gap="lg">
      <HStackPattern gap="md" justify="between" align="center">
        <Typography variant="h2" weight="bold">Dashboard</Typography>
        <Badge variant="success">Live</Badge>
      </HStackPattern>
      <DividerPattern spacing="xs" />
      <GridPattern cols={2} gap="md">
        <BoxPattern p="md" bg="surface" border radius="md">
          <VStackPattern gap="xs">
            <Typography variant="small" color="secondary">Revenue</Typography>
            <Typography variant="h3" weight="bold">$45,231</Typography>
          </VStackPattern>
        </BoxPattern>
        <BoxPattern p="md" bg="surface" border radius="md">
          <VStackPattern gap="xs">
            <Typography variant="small" color="secondary">Users</Typography>
            <Typography variant="h3" weight="bold">2,543</Typography>
          </VStackPattern>
        </BoxPattern>
      </GridPattern>
    </VStackPattern>
  ),
};
