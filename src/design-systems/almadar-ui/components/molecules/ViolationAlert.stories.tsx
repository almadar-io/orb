import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { ViolationAlert, type ViolationRecord } from './ViolationAlert';
import { VStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';

const meta: Meta<typeof ViolationAlert> = {
  title: 'Molecules/ViolationAlert',
  component: ViolationAlert,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const measureViolation: ViolationRecord = {
  id: 'v-001',
  law: 'ZVPOT-1',
  article: '14/1',
  message: 'Some goods are missing price tags. Corrective action required.',
  actionType: 'measure',
  fieldId: 'field_2_8',
  tabId: 'T2-1',
};

const adminViolation: ViolationRecord = {
  id: 'v-002',
  law: 'ZVPOT-1',
  article: '14/1',
  message: 'Goods must be marked with visible price tags. Administrative action will be initiated.',
  actionType: 'admin',
  adminAction: 'ZVPOT-1 234/1-4',
  fieldId: 'field_2_8',
  tabId: 'T2-1',
};

const penaltyViolation: ViolationRecord = {
  id: 'v-003',
  law: 'ZVPOT-1',
  article: '23/2',
  message: 'Serious labeling violation detected. Penalty proceedings will be initiated.',
  actionType: 'penalty',
  adminAction: 'ZVPOT-1 234/1-4',
  penaltyAction: 'ZVPOT-1 240/1-9',
  fieldId: 'field_3_5',
  tabId: 'T3-1',
};

export const MeasureViolation: Story = {
  args: {
    violation: measureViolation,
  },
};

export const AdminViolation: Story = {
  args: {
    violation: adminViolation,
  },
};

export const PenaltyViolation: Story = {
  args: {
    violation: penaltyViolation,
  },
};

export const CombinedViolation: Story = {
  args: {
    violation: {
      id: 'v-004',
      law: 'ZVPOT-1',
      article: '14/1',
      message: 'No price marking found on any displayed goods. Both administrative and penalty actions required.',
      actionType: 'admin',
      adminAction: 'ZVPOT-1 234/1-4',
      penaltyAction: 'ZVPOT-1 240/1-9',
      fieldId: 'field_2_8',
    },
  },
};

export const WithNavigation: Story = {
  render: function NavigationDemo() {
    const [navigatedTo, setNavigatedTo] = useState<string | null>(null);

    return (
      <VStack gap="md">
        <ViolationAlert
          violation={adminViolation}
          onNavigateToField={(fieldId) => setNavigatedTo(fieldId)}
        />
        {navigatedTo && (
          <Typography variant="body2" color="muted">
            Would navigate to field: <strong>{navigatedTo}</strong>
          </Typography>
        )}
      </VStack>
    );
  },
};

export const Dismissible: Story = {
  render: function DismissibleDemo() {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) {
      return (
        <VStack gap="md" align="center">
          <Typography variant="body" color="muted">Alert dismissed</Typography>
          <button
            onClick={() => setDismissed(false)}
            className="text-blue-600 hover:underline"
          >
            Show again
          </button>
        </VStack>
      );
    }

    return (
      <ViolationAlert
        violation={measureViolation}
        dismissible
        onDismiss={() => setDismissed(true)}
      />
    );
  },
};

export const Compact: Story = {
  args: {
    violation: measureViolation,
    compact: true,
  },
};

export const CompactList: Story = {
  render: () => (
    <VStack gap="sm">
      <Typography variant="h4">Detected Violations</Typography>
      <ViolationAlert violation={measureViolation} compact />
      <ViolationAlert violation={adminViolation} compact />
      <ViolationAlert violation={penaltyViolation} compact />
    </VStack>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <VStack gap="lg">
      <VStack gap="sm">
        <Typography variant="h4">Corrective Measure (Warning)</Typography>
        <ViolationAlert violation={measureViolation} />
      </VStack>

      <VStack gap="sm">
        <Typography variant="h4">Administrative Action (Error)</Typography>
        <ViolationAlert violation={adminViolation} />
      </VStack>

      <VStack gap="sm">
        <Typography variant="h4">Penalty Proceedings (Error)</Typography>
        <ViolationAlert violation={penaltyViolation} />
      </VStack>
    </VStack>
  ),
};
