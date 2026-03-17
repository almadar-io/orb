import type { Meta, StoryObj } from '@storybook/react-vite';
import { MasterDetail } from './MasterDetail';

interface Task {
  id: string;
  title: string;
  status: string;
  assignee: string;
  priority: string;
}

const sampleTasks: Task[] = [
  { id: '1', title: 'Implement authentication', status: 'Active', assignee: 'John Doe', priority: 'High' },
  { id: '2', title: 'Design landing page', status: 'Done', assignee: 'Jane Smith', priority: 'Medium' },
  { id: '3', title: 'Write API documentation', status: 'Pending', assignee: 'Bob Wilson', priority: 'Low' },
  { id: '4', title: 'Set up CI/CD pipeline', status: 'Active', assignee: 'Alice Chen', priority: 'High' },
  { id: '5', title: 'Database migration', status: 'Pending', assignee: 'John Doe', priority: 'Medium' },
];

const meta: Meta<typeof MasterDetail<Task>> = {
  title: 'Organisms/MasterDetail',
  component: MasterDetail,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof MasterDetail<Task>>;

export const Default: Story = {
  args: {
    entity: sampleTasks,
    masterFields: ['title', 'status', 'assignee', 'priority'],
  },
};

export const WithRowClick: Story = {
  args: {
    entity: sampleTasks,
    masterFields: ['title', 'status', 'priority'],
  },
};

export const Loading: Story = {
  args: {
    masterFields: ['title', 'status', 'assignee'],
    isLoading: true,
  },
};

export const ErrorState: Story = {
  args: {
    masterFields: ['title', 'status'],
    error: new Error('Failed to load tasks. Check your network connection.'),
  },
};

export const EmptyData: Story = {
  args: {
    entity: [],
    masterFields: ['title', 'status', 'assignee'],
  },
};
