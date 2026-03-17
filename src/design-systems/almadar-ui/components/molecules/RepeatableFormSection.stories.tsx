import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { RepeatableFormSection, type RepeatableItem } from './RepeatableFormSection';
import { VStack } from '../atoms/Stack';
import { Input } from '../atoms/Input';
import { Typography } from '../atoms/Typography';

const meta: Meta<typeof RepeatableFormSection> = {
  title: 'Molecules/RepeatableFormSection',
  component: RepeatableFormSection,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Helper to generate unique IDs
let idCounter = 0;
const generateId = () => `item-${++idCounter}`;

export const Default: Story = {
  render: function DefaultDemo() {
    const [items, setItems] = useState<RepeatableItem[]>([
      { id: 'item-1', name: 'John Doe' },
      { id: 'item-2', name: 'Jane Smith' },
    ]);

    const handleAdd = () => {
      setItems(prev => [...prev, { id: generateId(), name: '' }]);
    };

    const handleRemove = (itemId: string) => {
      setItems(prev => prev.filter(item => item.id !== itemId));
    };

    return (
      <RepeatableFormSection
        sectionType="participants"
        title="Participants"
        items={items}
        renderItem={(item) => (
          <Input
            placeholder="Enter name"
            defaultValue={item.name as string}
          />
        )}
        onAdd={handleAdd}
        onRemove={handleRemove}
        addLabel="Add Participant"
        emptyMessage="No participants added yet"
      />
    );
  },
};

export const Empty: Story = {
  args: {
    sectionType: 'findings',
    title: 'Inspection Findings',
    items: [],
    renderItem: () => <Input placeholder="Enter finding" />,
    addLabel: 'Add Finding',
    emptyMessage: 'No findings recorded',
  },
};

export const WithMinMax: Story = {
  render: function MinMaxDemo() {
    const [items, setItems] = useState<RepeatableItem[]>([
      { id: 'item-1', value: 'First item' },
    ]);

    const handleAdd = () => {
      setItems(prev => [...prev, { id: generateId(), value: '' }]);
    };

    const handleRemove = (itemId: string) => {
      setItems(prev => prev.filter(item => item.id !== itemId));
    };

    return (
      <VStack gap="md">
        <Typography variant="body2" color="muted">
          Minimum 1 item, maximum 3 items
        </Typography>
        <RepeatableFormSection
          sectionType="items"
          title="Required Items"
          items={items}
          renderItem={(item) => (
            <Input
              placeholder="Enter value"
              defaultValue={item.value as string}
            />
          )}
          onAdd={handleAdd}
          onRemove={handleRemove}
          minItems={1}
          maxItems={3}
        />
      </VStack>
    );
  },
};

export const WithAddedInState: Story = {
  render: function AddedInStateDemo() {
    const [items, setItems] = useState<RepeatableItem[]>([
      {
        id: 'item-1',
        name: 'Initial Inspector',
        addedInState: 'introduction',
        addedAt: '2024-01-15T10:30:00Z',
      },
    ]);
    const [currentState] = useState('field_inspection');

    const handleAdd = () => {
      setItems(prev => [...prev, {
        id: generateId(),
        name: '',
        addedInState: currentState,
        addedAt: new Date().toISOString(),
      }]);
    };

    const handleRemove = (itemId: string) => {
      setItems(prev => prev.filter(item => item.id !== itemId));
    };

    return (
      <VStack gap="md">
        <Typography variant="body2" color="muted">
          Current inspection state: <strong>{currentState}</strong>
        </Typography>
        <RepeatableFormSection
          sectionType="inspectors"
          title="Participating Inspectors"
          items={items}
          renderItem={(item) => (
            <Input
              placeholder="Inspector name"
              defaultValue={item.name as string}
            />
          )}
          onAdd={handleAdd}
          onRemove={handleRemove}
          trackAddedInState
          currentState={currentState}
          showAuditInfo
          addLabel="Add Inspector"
        />
      </VStack>
    );
  },
};

export const AuditTrail: Story = {
  render: function AuditTrailDemo() {
    const items: RepeatableItem[] = [
      {
        id: 'item-1',
        finding: 'Price tags missing on 5 items',
        addedInState: 'price_marking_check',
        addedAt: '2024-01-15T09:45:00Z',
      },
      {
        id: 'item-2',
        finding: 'Expired product found in display',
        addedInState: 'product_inspection',
        addedAt: '2024-01-15T10:15:00Z',
      },
      {
        id: 'item-3',
        finding: 'Receipt printer malfunction documented',
        addedInState: 'equipment_check',
        addedAt: '2024-01-15T10:45:00Z',
      },
    ];

    return (
      <VStack gap="md">
        <Typography variant="h4">Inspection Findings Audit Trail</Typography>
        <Typography variant="body2" color="muted">
          Read-only view showing when each finding was added during the inspection
        </Typography>
        <RepeatableFormSection
          sectionType="findings"
          title="Recorded Findings"
          items={items}
          renderItem={(item) => (
            <Typography variant="body">{item.finding as string}</Typography>
          )}
          showAuditInfo
          readOnly
        />
      </VStack>
    );
  },
};

export const ReadOnly: Story = {
  args: {
    sectionType: 'violations',
    title: 'Recorded Violations',
    items: [
      { id: 'v1', description: 'ZVPOT-1 Art. 14/1 - Missing price tags' },
      { id: 'v2', description: 'ZVPOT-1 Art. 23/2 - Incorrect labeling' },
    ],
    renderItem: (item: RepeatableItem) => (
      <Typography variant="body">{item.description as string}</Typography>
    ),
    readOnly: true,
  },
};

export const WithReorder: Story = {
  render: function ReorderDemo() {
    const [items, setItems] = useState<RepeatableItem[]>([
      { id: 'item-1', step: 'Check entrance area' },
      { id: 'item-2', step: 'Inspect main floor' },
      { id: 'item-3', step: 'Review storage room' },
    ]);

    const handleAdd = () => {
      setItems(prev => [...prev, { id: generateId(), step: '' }]);
    };

    const handleRemove = (itemId: string) => {
      setItems(prev => prev.filter(item => item.id !== itemId));
    };

    return (
      <VStack gap="md">
        <Typography variant="body2" color="muted">
          Drag handles shown for reordering (reorder logic not implemented in this demo)
        </Typography>
        <RepeatableFormSection
          sectionType="steps"
          title="Inspection Steps"
          items={items}
          renderItem={(item, index) => (
            <Input
              placeholder={`Step ${index + 1}`}
              defaultValue={item.step as string}
            />
          )}
          onAdd={handleAdd}
          onRemove={handleRemove}
          allowReorder
          addLabel="Add Step"
        />
      </VStack>
    );
  },
};
