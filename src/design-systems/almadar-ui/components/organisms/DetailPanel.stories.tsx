import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { DetailPanel } from './DetailPanel';
import { Edit, Trash2, ArrowLeft } from 'lucide-react';

const meta: Meta<typeof DetailPanel> = {
  title: 'Organisms/DetailPanel',
  component: DetailPanel,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Project Alpha',
    subtitle: 'Web application redesign project',
    sections: [
      {
        title: 'Overview',
        fields: [
          { label: 'Status', value: 'In Progress' },
          { label: 'Priority', value: 'High' },
          { label: 'Owner', value: 'Jane Smith' },
        ],
      },
    ],
  },
};

export const WithActions: Story = {
  args: {
    title: 'Task: Implement Auth Module',
    subtitle: 'Backend development task',
    status: { label: 'Active', variant: 'success' },
    actions: [
      { label: 'Edit', icon: Edit, event: 'EDIT', variant: 'primary' },
      { label: 'Delete', icon: Trash2, event: 'DELETE', variant: 'danger' },
      { label: 'Back', icon: ArrowLeft, navigatesTo: '/tasks', variant: 'ghost' },
    ],
    sections: [
      {
        title: 'Details',
        fields: [
          { label: 'Assignee', value: 'John Doe' },
          { label: 'Due Date', value: '2026-03-15' },
          { label: 'Description', value: 'Implement JWT-based authentication with refresh tokens.' },
        ],
      },
    ],
  },
};

export const SchemaBasedFields: Story = {
  args: {
    fields: ['name', 'status', 'priority', 'progress', 'budget', 'startDate', 'description'],
    entity: {
      id: '1',
      name: 'Project Alpha',
      status: 'Active',
      priority: 'High',
      progress: 72,
      budget: 50000,
      startDate: '2026-01-15',
      description: 'A comprehensive web application redesign project with focus on user experience.',
    },
  },
};

export const MultipleSections: Story = {
  args: {
    title: 'Customer Record',
    subtitle: 'Enterprise account',
    status: { label: 'Premium', variant: 'info' },
    sections: [
      {
        title: 'Contact Information',
        fields: [
          { label: 'Name', value: 'Acme Corporation' },
          { label: 'Email', value: 'contact@acme.com' },
          { label: 'Phone', value: '+1 (555) 123-4567' },
        ],
      },
      {
        title: 'Account Details',
        fields: [
          { label: 'Account ID', value: 'ACC-00142' },
          { label: 'Plan', value: 'Enterprise' },
          { label: 'Since', value: 'January 2024' },
        ],
      },
      {
        title: 'Billing',
        fields: [
          { label: 'Monthly Revenue', value: '$12,500' },
          { label: 'Payment Status', value: 'Current' },
        ],
      },
    ],
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const ErrorState: Story = {
  args: {
    error: new Error('Failed to load task details. Please try again.'),
  },
};
