import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageHeader } from './PageHeader';

const meta: Meta<typeof PageHeader> = {
  title: 'Organisms/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Dashboard',
    subtitle: 'Overview of your application',
  },
};

export const WithActions: Story = {
  args: {
    title: 'Tasks',
    subtitle: 'Manage your tasks',
    actions: [
      { label: 'New Task', event: 'CREATE', variant: 'primary' },
      { label: 'Export', event: 'EXPORT', variant: 'secondary' },
    ],
  },
};

export const WithBreadcrumbs: Story = {
  args: {
    title: 'Task Details',
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Tasks', href: '/tasks' },
      { label: 'Task #1' },
    ],
    showBack: true,
  },
};

export const WithTabs: Story = {
  args: {
    title: 'Project',
    tabs: [
      { label: 'Overview', value: 'overview' },
      { label: 'Tasks', value: 'tasks', count: 12 },
      { label: 'Settings', value: 'settings' },
    ],
    activeTab: 'overview',
  },
};
