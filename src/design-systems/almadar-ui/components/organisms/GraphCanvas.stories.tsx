import type { Meta, StoryObj } from '@storybook/react-vite';
import { GraphCanvas } from './GraphCanvas';

const meta: Meta<typeof GraphCanvas> = {
    title: 'Organisms/GraphCanvas',
    component: GraphCanvas,
    parameters: {
        layout: 'centered',
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: 'Knowledge Graph',
        nodes: [
            { id: 'a', label: 'Entity' },
            { id: 'b', label: 'Trait' },
            { id: 'c', label: 'Page' },
            { id: 'd', label: 'Effect' },
            { id: 'e', label: 'Guard' },
        ],
        edges: [
            { source: 'a', target: 'b', label: 'has' },
            { source: 'b', target: 'c', label: 'renders' },
            { source: 'b', target: 'd', label: 'triggers' },
            { source: 'b', target: 'e', label: 'checks' },
            { source: 'a', target: 'c', label: 'binds' },
        ],
        height: 400,
    },
};

export const GroupedNodes: Story = {
    args: {
        title: 'Department Structure',
        nodes: [
            { id: '1', label: 'Engineering', group: 'tech' },
            { id: '2', label: 'Design', group: 'tech' },
            { id: '3', label: 'Product', group: 'business' },
            { id: '4', label: 'Sales', group: 'business' },
            { id: '5', label: 'Marketing', group: 'business' },
            { id: '6', label: 'HR', group: 'support' },
            { id: '7', label: 'Finance', group: 'support' },
        ],
        edges: [
            { source: '1', target: '2', label: 'collaborates' },
            { source: '1', target: '3', label: 'reports to' },
            { source: '2', target: '3', label: 'reports to' },
            { source: '3', target: '4', label: 'informs' },
            { source: '3', target: '5', label: 'informs' },
            { source: '6', target: '1' },
            { source: '7', target: '4' },
        ],
        showLabels: true,
        height: 450,
    },
};

export const CircularLayout: Story = {
    args: {
        title: 'Microservices',
        nodes: [
            { id: 'api', label: 'API Gateway', group: 'gateway' },
            { id: 'auth', label: 'Auth Service', group: 'core' },
            { id: 'user', label: 'User Service', group: 'core' },
            { id: 'order', label: 'Order Service', group: 'domain' },
            { id: 'payment', label: 'Payment Service', group: 'domain' },
            { id: 'notify', label: 'Notification Service', group: 'support' },
            { id: 'db', label: 'Database', group: 'infra' },
            { id: 'cache', label: 'Redis Cache', group: 'infra' },
        ],
        edges: [
            { source: 'api', target: 'auth' },
            { source: 'api', target: 'user' },
            { source: 'api', target: 'order' },
            { source: 'order', target: 'payment' },
            { source: 'order', target: 'notify' },
            { source: 'auth', target: 'db' },
            { source: 'user', target: 'db' },
            { source: 'order', target: 'db' },
            { source: 'auth', target: 'cache' },
        ],
        layout: 'circular',
        showLabels: true,
        height: 500,
    },
};

export const GridLayout: Story = {
    args: {
        title: 'Component Dependencies',
        nodes: [
            { id: 'a', label: 'App' },
            { id: 'b', label: 'Header' },
            { id: 'c', label: 'Sidebar' },
            { id: 'd', label: 'Button' },
            { id: 'e', label: 'Input' },
            { id: 'f', label: 'Typography' },
        ],
        edges: [
            { source: 'a', target: 'b' },
            { source: 'a', target: 'c' },
            { source: 'b', target: 'd' },
            { source: 'b', target: 'f' },
            { source: 'c', target: 'd' },
            { source: 'c', target: 'e' },
        ],
        layout: 'grid',
        height: 350,
    },
};

export const Interactive: Story = {
    args: {
        title: 'Interactive Graph',
        nodes: [
            { id: '1', label: 'Node A', group: 'primary' },
            { id: '2', label: 'Node B', group: 'primary' },
            { id: '3', label: 'Node C', group: 'secondary' },
            { id: '4', label: 'Node D', group: 'secondary' },
        ],
        edges: [
            { source: '1', target: '2', weight: 3 },
            { source: '2', target: '3', weight: 1 },
            { source: '3', target: '4', weight: 2 },
            { source: '4', target: '1', weight: 1 },
        ],
        interactive: true,
        draggable: true,
        nodeClickEvent: 'SELECT_NODE',
        height: 400,
    },
};

export const Loading: Story = {
    args: {
        title: 'Loading Graph',
        isLoading: true,
        height: 400,
    },
};

export const Empty: Story = {
    args: {
        title: 'Empty Graph',
        nodes: [],
        edges: [],
        height: 300,
    },
};
