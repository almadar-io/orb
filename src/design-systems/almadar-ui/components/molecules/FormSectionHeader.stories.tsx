import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { FormSectionHeader } from './FormSectionHeader';
import { VStack } from '../atoms/Stack';
import { Box } from '../atoms/Box';
import { Typography } from '../atoms/Typography';

const meta: Meta<typeof FormSectionHeader> = {
  title: 'Molecules/FormSectionHeader',
  component: FormSectionHeader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Section Title',
  },
};

export const WithSubtitle: Story = {
  args: {
    title: 'Company Information',
    subtitle: 'Enter details about the inspected entity',
  },
};

export const Collapsible: Story = {
  render: function CollapsibleDemo() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
      <VStack gap="none">
        <FormSectionHeader
          title="A. Case Data"
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />
        {!isCollapsed && (
          <Box padding="md" className="bg-white border border-t-0 border-gray-200 rounded-b-lg">
            <Typography variant="body" color="muted">
              Section content goes here...
            </Typography>
          </Box>
        )}
      </VStack>
    );
  },
};

export const WithBadge: Story = {
  args: {
    title: 'Required Fields',
    badge: '5 fields',
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Price Marking',
    icon: 'tag',
    badge: 'Required',
  },
};

export const WithErrors: Story = {
  args: {
    title: 'Entity Data',
    hasErrors: true,
    badge: '2 errors',
  },
};

export const Complete: Story = {
  args: {
    title: 'Introduction',
    isComplete: true,
    badge: 'Complete',
  },
};

export const InspectionFormSections: Story = {
  render: function InspectionSectionsDemo() {
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
      'S-1': false,
      'S-2': true,
      'S-3': true,
    });

    const toggleSection = (id: string) => {
      setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const sections = [
      { id: 'S-1', title: 'A. Case Data', badge: '4 fields', isComplete: true },
      { id: 'S-2', title: 'B. Entity Data', badge: '6 fields', hasErrors: true },
      { id: 'S-3', title: 'C. Business Details', badge: '3 fields' },
    ];

    return (
      <VStack gap="sm">
        <Typography variant="h4">T-001: Introduction</Typography>
        {sections.map(section => (
          <VStack key={section.id} gap="none">
            <FormSectionHeader
              title={section.title}
              badge={section.badge}
              isCollapsed={collapsed[section.id]}
              onToggle={() => toggleSection(section.id)}
              isComplete={section.isComplete}
              hasErrors={section.hasErrors}
            />
            {!collapsed[section.id] && (
              <Box padding="md" className="bg-white border border-t-0 border-gray-200 rounded-b-lg">
                <Typography variant="body" color="muted">
                  Form fields for {section.title}...
                </Typography>
              </Box>
            )}
          </VStack>
        ))}
      </VStack>
    );
  },
};

export const AllStates: Story = {
  render: () => (
    <VStack gap="md">
      <VStack gap="xs">
        <Typography variant="label" color="muted">Default</Typography>
        <FormSectionHeader title="Section Title" />
      </VStack>

      <VStack gap="xs">
        <Typography variant="label" color="muted">With Badge</Typography>
        <FormSectionHeader title="Section Title" badge="Required" />
      </VStack>

      <VStack gap="xs">
        <Typography variant="label" color="muted">Collapsible (Expanded)</Typography>
        <FormSectionHeader title="Section Title" isCollapsed={false} onToggle={() => {}} />
      </VStack>

      <VStack gap="xs">
        <Typography variant="label" color="muted">Collapsible (Collapsed)</Typography>
        <FormSectionHeader title="Section Title" isCollapsed={true} onToggle={() => {}} />
      </VStack>

      <VStack gap="xs">
        <Typography variant="label" color="muted">Complete</Typography>
        <FormSectionHeader title="Section Title" isComplete badge="Complete" />
      </VStack>

      <VStack gap="xs">
        <Typography variant="label" color="muted">Has Errors</Typography>
        <FormSectionHeader title="Section Title" hasErrors badge="2 errors" />
      </VStack>

      <VStack gap="xs">
        <Typography variant="label" color="muted">With Icon</Typography>
        <FormSectionHeader title="Section Title" icon="file-text" />
      </VStack>
    </VStack>
  ),
};
