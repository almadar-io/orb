import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
    title: 'Atoms/Badge',
    component: Badge,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'primary', 'success', 'warning', 'danger', 'info'],
        },
        size: {
            control: 'select',
            options: ['sm', 'md'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        children: 'Badge',
    },
};

export const Primary: Story = {
    args: {
        children: 'Primary',
        variant: 'primary',
    },
};

export const Success: Story = {
    args: {
        children: 'Success',
        variant: 'success',
    },
};

export const Warning: Story = {
    args: {
        children: 'Warning',
        variant: 'warning',
    },
};

export const Danger: Story = {
    args: {
        children: 'Danger',
        variant: 'danger',
    },
};

export const Info: Story = {
    args: {
        children: 'Info',
        variant: 'info',
    },
};

export const AllVariants: Story = {
    render: () => (
        <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="info">Info</Badge>
        </div>
    ),
};

export const Sizes: Story = {
    render: () => (
        <div className="flex items-center gap-2">
            <Badge size="sm">Small</Badge>
            <Badge size="md">Medium</Badge>
        </div>
    ),
};

export const WithNumbers: Story = {
    render: () => (
        <div className="flex gap-2">
            <Badge variant="primary">3</Badge>
            <Badge variant="danger">99+</Badge>
            <Badge variant="success">New</Badge>
        </div>
    ),
};

export const InContext: Story = {
    render: () => (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="font-bold text-black">Notifications</span>
                <Badge variant="danger">12</Badge>
            </div>
            <div className="flex items-center gap-2">
                <span className="font-bold text-black">Messages</span>
                <Badge variant="primary">New</Badge>
            </div>
            <div className="flex items-center gap-2">
                <span className="font-bold text-black">Status</span>
                <Badge variant="success">Active</Badge>
            </div>
        </div>
    ),
};
