import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';
import { Mail, Lock, Search, User } from 'lucide-react';

const meta: Meta<typeof Input> = {
    title: 'Atoms/Input',
    component: Input,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        placeholder: 'Enter text...',
    },
};

export const WithLabel: Story = {
    args: {
        placeholder: 'Enter your email',
        inputType: 'email',
    },
    render: (args) => (
        <div className="w-80 space-y-2">
            <label className="block text-sm font-bold text-black">Email Address</label>
            <Input {...args} />
        </div>
    ),
};

export const WithLeftIcon: Story = {
    args: {
        placeholder: 'Search...',
        icon: Search,
    },
};

export const WithRightIcon: Story = {
    args: {
        placeholder: 'Enter email',
        inputType: 'email',
        rightIcon: <Mail className="h-4 w-4" />,
    },
};

export const Password: Story = {
    args: {
        placeholder: 'Enter password',
        inputType: 'password',
        icon: Lock,
    },
};

export const WithError: Story = {
    args: {
        placeholder: 'Enter email',
        error: 'Invalid email address',
        defaultValue: 'invalid-email',
    },
};

export const Disabled: Story = {
    args: {
        placeholder: 'Disabled input',
        disabled: true,
        defaultValue: 'Cannot edit',
    },
};

export const Types: Story = {
    render: () => (
        <div className="w-80 space-y-4">
            <Input placeholder="Text input" inputType="text" />
            <Input placeholder="Email input" inputType="email" />
            <Input placeholder="Search input" inputType="search" />
        </div>
    ),
};

export const FormExample: Story = {
    render: () => (
        <div className="w-80 space-y-4">
            <div className="space-y-2">
                <label className="block text-sm font-bold text-black">Full Name</label>
                <Input placeholder="John Doe" icon={User} />
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-bold text-black">Email</label>
                <Input placeholder="john@example.com" inputType="email" icon={Mail} />
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-bold text-black">Password</label>
                <Input placeholder="••••••••" inputType="password" icon={Lock} />
            </div>
        </div>
    ),
};
