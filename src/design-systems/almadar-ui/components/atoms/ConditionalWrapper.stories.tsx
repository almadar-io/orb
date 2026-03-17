import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { ConditionalWrapper } from './ConditionalWrapper';
import { Input } from './Input';
import { Select } from './Select';
import { VStack } from './Stack';
import { Typography } from './Typography';
import { Box } from './Box';

const meta: Meta<typeof ConditionalWrapper> = {
  title: 'Atoms/ConditionalWrapper',
  component: ConditionalWrapper,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AlwaysVisible: Story = {
  args: {
    context: { formValues: {}, globalVariables: {} },
    children: (
      <Box padding="md" border rounded="md">
        <Typography variant="body">This content is always visible (no condition)</Typography>
      </Box>
    ),
  },
};

export const ConditionallyHidden: Story = {
  args: {
    condition: ['=', '@entity.formValues.showContent', true],
    context: { formValues: { showContent: false }, globalVariables: {} },
    children: (
      <Box padding="md" border rounded="md">
        <Typography variant="body">This content is hidden</Typography>
      </Box>
    ),
  },
};

export const ConditionallyVisible: Story = {
  args: {
    condition: ['=', '@entity.formValues.showContent', true],
    context: { formValues: { showContent: true }, globalVariables: {} },
    children: (
      <Box padding="md" border rounded="md">
        <Typography variant="body">This content is visible because showContent is true</Typography>
      </Box>
    ),
  },
};

export const WithFallback: Story = {
  args: {
    condition: ['>=', '@entity.formValues.age', 18],
    context: { formValues: { age: 16 }, globalVariables: {} },
    fallback: (
      <Box padding="md" bg="muted" rounded="md">
        <Typography variant="body" color="muted">You must be 18 or older to see this content</Typography>
      </Box>
    ),
    children: (
      <Box padding="md" border rounded="md">
        <Typography variant="body">Adult content visible</Typography>
      </Box>
    ),
  },
};

export const WithAnimation: Story = {
  args: {
    condition: ['=', '@entity.formValues.expanded', true],
    context: { formValues: { expanded: true }, globalVariables: {} },
    animate: true,
    children: (
      <Box padding="md" border rounded="md">
        <Typography variant="body">This content animates in and out</Typography>
      </Box>
    ),
  },
};

/**
 * Interactive example showing conditional form fields
 */
export const InteractiveFormFields: Story = {
  render: function InteractiveDemo() {
    const [vehicleType, setVehicleType] = useState('personal');

    const context = {
      formValues: { vehicleType },
      globalVariables: {},
    };

    return (
      <VStack gap="md" className="w-80">
        <VStack gap="xs">
          <Typography variant="label" weight="bold">Vehicle Type</Typography>
          <Select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            options={[
              { value: 'personal', label: 'Personal' },
              { value: 'commercial', label: 'Commercial' },
            ]}
          />
        </VStack>

        <ConditionalWrapper
          condition={['=', '@entity.formValues.vehicleType', 'commercial']}
          context={context}
        >
          <VStack gap="xs">
            <Typography variant="label" weight="bold">Commercial License Number</Typography>
            <Input placeholder="Enter license number" />
          </VStack>
        </ConditionalWrapper>

        <ConditionalWrapper
          condition={['=', '@entity.formValues.vehicleType', 'commercial']}
          context={context}
        >
          <VStack gap="xs">
            <Typography variant="label" weight="bold">Fleet Size</Typography>
            <Input type="number" placeholder="Number of vehicles" />
          </VStack>
        </ConditionalWrapper>
      </VStack>
    );
  },
};

/**
 * Complex condition example with AND/OR logic
 */
export const ComplexConditions: Story = {
  render: function ComplexDemo() {
    const [weight, setWeight] = useState(2000);
    const [hasPermit, setHasPermit] = useState(false);

    const context = {
      formValues: { weight, hasPermit },
      globalVariables: {},
    };

    return (
      <VStack gap="md" className="w-96">
        <VStack gap="xs">
          <Typography variant="label" weight="bold">Vehicle Weight (kg)</Typography>
          <Input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
          />
        </VStack>

        <VStack gap="xs">
          <Typography variant="label" weight="bold">
            <input
              type="checkbox"
              checked={hasPermit}
              onChange={(e) => setHasPermit(e.target.checked)}
              className="mr-2"
            />
            Has Heavy Vehicle Permit
          </Typography>
        </VStack>

        <ConditionalWrapper
          condition={['and', ['>=', '@entity.formValues.weight', 3500], ['not', '@entity.formValues.hasPermit']]}
          context={context}
        >
          <Box padding="md" bg="muted" rounded="md" className="border-l-4 border-amber-500">
            <Typography variant="body" color="warning">
              Warning: Vehicles over 3500kg require a heavy vehicle permit
            </Typography>
          </Box>
        </ConditionalWrapper>

        <ConditionalWrapper
          condition={['and', ['>=', '@entity.formValues.weight', 3500], '@entity.formValues.hasPermit']}
          context={context}
        >
          <Box padding="md" bg="muted" rounded="md" className="border-l-4 border-emerald-500">
            <Typography variant="body" color="success">
              Heavy vehicle permit verified
            </Typography>
          </Box>
        </ConditionalWrapper>
      </VStack>
    );
  },
};
