import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { FormSection, FormLayout, FormActions } from './FormSection';
import { Input } from '../atoms/Input';
import { Textarea } from '../atoms/Textarea';
import { Select } from '../atoms/Select';
import { Button } from '../atoms/Button';

const meta: Meta<typeof FormSection> = {
  title: 'Organisms/FormSection',
  component: FormSection,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Personal Information',
    description: 'Enter your personal details below.',
    children: (
      <>
        <Input placeholder="First name" />
        <Input placeholder="Last name" />
        <Input placeholder="Email" inputType="email" />
      </>
    ),
  },
};

export const WithCard: Story = {
  args: {
    title: 'Contact Details',
    description: 'How can we reach you?',
    card: true,
    children: (
      <>
        <Input placeholder="Phone number" inputType="tel" />
        <Input placeholder="Address" />
      </>
    ),
  },
};

export const MultiColumn: Story = {
  args: {
    title: 'Address',
    columns: 2,
    children: (
      <>
        <Input placeholder="Street" />
        <Input placeholder="City" />
        <Input placeholder="State" />
        <Input placeholder="ZIP Code" />
      </>
    ),
  },
};

export const ThreeColumns: Story = {
  args: {
    title: 'Dimensions',
    columns: 3,
    children: (
      <>
        <Input placeholder="Width" inputType="number" />
        <Input placeholder="Height" inputType="number" />
        <Input placeholder="Depth" inputType="number" />
      </>
    ),
  },
};

export const Collapsible: Story = {
  args: {
    title: 'Advanced Settings',
    description: 'Click the header to toggle visibility.',
    collapsible: true,
    defaultCollapsed: false,
    children: (
      <>
        <Input placeholder="API Key" />
        <Input placeholder="Webhook URL" inputType="url" />
      </>
    ),
  },
};

export const CollapsedByDefault: Story = {
  args: {
    title: 'Optional Fields',
    collapsible: true,
    defaultCollapsed: true,
    children: (
      <>
        <Textarea placeholder="Notes" rows={3} />
      </>
    ),
  },
};

export const FullFormLayout: Story = {
  render: () => (
    <FormLayout>
      <FormSection title="Basic Info" description="Required fields.">
        <Input placeholder="Name" />
        <Input placeholder="Email" inputType="email" />
      </FormSection>
      <FormSection title="Role" columns={2}>
        <Select
          options={[
            { value: 'admin', label: 'Admin' },
            { value: 'editor', label: 'Editor' },
            { value: 'viewer', label: 'Viewer' },
          ]}
          placeholder="Select role"
        />
        <Select
          options={[
            { value: 'engineering', label: 'Engineering' },
            { value: 'design', label: 'Design' },
            { value: 'marketing', label: 'Marketing' },
          ]}
          placeholder="Select department"
        />
      </FormSection>
      <FormSection title="Notes" collapsible defaultCollapsed>
        <Textarea placeholder="Additional notes..." rows={4} />
      </FormSection>
      <FormActions align="right">
        <Button variant="ghost">Cancel</Button>
        <Button variant="primary">Save</Button>
      </FormActions>
    </FormLayout>
  ),
};

export const StickyActions: Story = {
  render: () => (
    <FormLayout>
      <FormSection title="Long Form">
        <Input placeholder="Field 1" />
        <Input placeholder="Field 2" />
        <Input placeholder="Field 3" />
        <Input placeholder="Field 4" />
        <Textarea placeholder="Description" rows={6} />
      </FormSection>
      <FormActions align="between" sticky>
        <Button variant="ghost">Discard</Button>
        <Button variant="primary">Submit</Button>
      </FormActions>
    </FormLayout>
  ),
};
