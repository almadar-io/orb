import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './Skeleton';
import { VStack } from '../atoms/Stack';
import { HStack } from '../atoms/Stack';
import { Box } from '../atoms/Box';
import { Typography } from '../atoms/Typography';

const meta: Meta<typeof Skeleton> = {
  title: 'Molecules/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['header', 'table', 'form', 'card', 'text'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Header: Story = {
  args: {
    variant: 'header',
  },
};

export const Table: Story = {
  args: {
    variant: 'table',
    rows: 5,
    columns: 4,
  },
};

export const TableLarge: Story = {
  name: 'Table (Large)',
  args: {
    variant: 'table',
    rows: 10,
    columns: 6,
  },
};

export const Form: Story = {
  args: {
    variant: 'form',
    fields: 4,
  },
};

export const FormLarge: Story = {
  name: 'Form (Many Fields)',
  args: {
    variant: 'form',
    fields: 8,
  },
};

export const Card: Story = {
  args: {
    variant: 'card',
  },
};

export const Text: Story = {
  args: {
    variant: 'text',
    rows: 3,
  },
};

export const TextParagraph: Story = {
  name: 'Text (Paragraph)',
  args: {
    variant: 'text',
    rows: 6,
  },
};

export const FullPage: Story = {
  name: 'Full Page Skeleton',
  render: () => (
    <VStack gap="md">
      <Skeleton variant="header" />
      <HStack gap="md" className="px-6">
        <Box className="flex-1">
          <Skeleton variant="table" rows={8} columns={5} />
        </Box>
        <Box className="w-80">
          <VStack gap="md">
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </VStack>
        </Box>
      </HStack>
    </VStack>
  ),
};

export const SuspenseUsage: Story = {
  name: 'Suspense Usage Example',
  render: () => (
    <VStack gap="lg" className="p-6">
      <Typography variant="h3">Suspense Fallback Examples</Typography>
      <Typography variant="small" className="text-[var(--color-muted-foreground)]">
        These skeletons are designed to be used as Suspense fallbacks.
      </Typography>
      <VStack gap="sm">
        <Typography variant="small" className="font-mono text-xs">
          {'<Suspense fallback={<Skeleton variant="header" />}>'}
        </Typography>
        <Skeleton variant="header" />
      </VStack>
      <VStack gap="sm">
        <Typography variant="small" className="font-mono text-xs">
          {'<Suspense fallback={<Skeleton variant="table" />}>'}
        </Typography>
        <Skeleton variant="table" />
      </VStack>
      <VStack gap="sm">
        <Typography variant="small" className="font-mono text-xs">
          {'<Suspense fallback={<Skeleton variant="form" />}>'}
        </Typography>
        <Skeleton variant="form" />
      </VStack>
    </VStack>
  ),
};
