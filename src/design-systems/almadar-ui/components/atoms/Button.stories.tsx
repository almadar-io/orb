import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { Mail, ArrowRight, Plus, Trash2, Check } from 'lucide-react';

const meta: Meta<typeof Button> = {
    title: 'Atoms/Button',
    component: Button,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'ghost', 'danger', 'success', 'warning'],
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        children: 'Primary Button',
        variant: 'primary',
    },
};

export const Secondary: Story = {
    args: {
        children: 'Secondary Button',
        variant: 'secondary',
    },
};

export const Ghost: Story = {
    args: {
        children: 'Ghost Button',
        variant: 'ghost',
    },
};

export const Danger: Story = {
    args: {
        children: 'Delete',
        variant: 'danger',
        icon: Trash2,
    },
};

export const WithIcon: Story = {
    args: {
        children: 'Send Email',
        variant: 'primary',
        icon: Mail,
    },
};

export const IconRight: Story = {
    args: {
        children: 'Continue',
        variant: 'primary',
        iconRight: ArrowRight,
    },
};

export const Sizes: Story = {
    render: () => (
        <div className="flex items-center gap-4">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
        </div>
    ),
};

export const AllVariants: Story = {
    render: () => (
        <div className="flex flex-col gap-4">
            <Button variant="primary" icon={Check}>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger" icon={Trash2}>Danger</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
        </div>
    ),
};

export const Disabled: Story = {
    args: {
        children: 'Disabled Button',
        variant: 'primary',
        disabled: true,
    },
};

export const Loading: Story = {
    args: {
        children: 'Loading...',
        variant: 'primary',
        isLoading: true,
    },
};
