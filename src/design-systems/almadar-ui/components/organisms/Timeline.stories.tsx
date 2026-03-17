import type { Meta, StoryObj } from '@storybook/react-vite';
import { Timeline } from './Timeline';

const meta: Meta<typeof Timeline> = {
    title: 'Organisms/Timeline',
    component: Timeline,
    parameters: {
        layout: 'centered',
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: 'Project History',
        items: [
            {
                id: '1',
                title: 'Project kickoff',
                description: 'Initial planning and requirement gathering completed',
                date: '2025-01-15',
                status: 'complete' as const,
                tags: ['planning'],
            },
            {
                id: '2',
                title: 'Design phase',
                description: 'UI/UX design and prototyping',
                date: '2025-02-01',
                status: 'complete' as const,
                tags: ['design', 'ux'],
            },
            {
                id: '3',
                title: 'Development sprint 1',
                description: 'Core features implementation in progress',
                date: '2025-03-01',
                status: 'active' as const,
                tags: ['dev', 'sprint-1'],
            },
            {
                id: '4',
                title: 'Testing & QA',
                description: 'Integration and user acceptance testing',
                date: '2025-04-01',
                status: 'pending' as const,
            },
            {
                id: '5',
                title: 'Launch',
                description: 'Production deployment and go-live',
                date: '2025-05-01',
                status: 'pending' as const,
            },
        ],
    },
};

export const WithErrors: Story = {
    args: {
        title: 'Deployment Log',
        items: [
            {
                id: '1',
                title: 'Build started',
                description: 'CI pipeline triggered on main branch',
                date: '10:32 AM',
                status: 'complete' as const,
            },
            {
                id: '2',
                title: 'Unit tests passed',
                description: '124/124 tests passed',
                date: '10:35 AM',
                status: 'complete' as const,
            },
            {
                id: '3',
                title: 'Integration tests failed',
                description: 'Database connection timeout in auth service',
                date: '10:42 AM',
                status: 'error' as const,
                tags: ['critical'],
            },
            {
                id: '4',
                title: 'Deploy to staging',
                description: 'Blocked by failing tests',
                date: 'Pending',
                status: 'pending' as const,
            },
        ],
    },
};

export const WithActions: Story = {
    args: {
        title: 'Support Tickets',
        items: [
            {
                id: '1',
                title: 'Ticket #1042 - Login issue',
                description: 'User unable to login after password reset',
                date: '2 hours ago',
                status: 'active' as const,
            },
            {
                id: '2',
                title: 'Ticket #1041 - Page load slow',
                description: 'Dashboard takes 10s to load',
                date: '5 hours ago',
                status: 'complete' as const,
            },
        ],
        itemActions: [
            { label: 'View', event: 'VIEW_TICKET' },
            { label: 'Assign', event: 'ASSIGN_TICKET' },
        ],
    },
};

export const Loading: Story = {
    args: {
        title: 'Activity Timeline',
        isLoading: true,
    },
};

export const Empty: Story = {
    args: {
        title: 'No Activity',
        items: [],
    },
};
