import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';
import { User, Bot, Settings } from 'lucide-react';

const meta: Meta<typeof Avatar> = {
    title: 'Atoms/Avatar',
    component: Avatar,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
    argTypes: {
        size: {
            control: 'select',
            options: ['xs', 'sm', 'md', 'lg', 'xl'],
        },
        status: {
            control: 'select',
            options: ['online', 'offline', 'away', 'busy', undefined],
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {},
};

export const WithInitials: Story = {
    args: {
        initials: 'JD',
        size: 'lg',
    },
};

export const WithImage: Story = {
    args: {
        src: 'https://i.pravatar.cc/150?img=1',
        alt: 'User avatar',
        size: 'lg',
    },
};

export const WithIcon: Story = {
    args: {
        icon: Bot,
        size: 'lg',
    },
};

export const WithStatus: Story = {
    args: {
        initials: 'AB',
        status: 'online',
        size: 'lg',
    },
};

export const WithBadge: Story = {
    args: {
        initials: 'CD',
        badge: 5,
        size: 'lg',
    },
};

export const Sizes: Story = {
    render: () => (
        <div className="flex items-end gap-4">
            <Avatar initials="XS" size="xs" />
            <Avatar initials="SM" size="sm" />
            <Avatar initials="MD" size="md" />
            <Avatar initials="LG" size="lg" />
            <Avatar initials="XL" size="xl" />
        </div>
    ),
};

export const AllStatuses: Story = {
    render: () => (
        <div className="flex gap-4">
            <Avatar initials="ON" status="online" size="lg" />
            <Avatar initials="OF" status="offline" size="lg" />
            <Avatar initials="AW" status="away" size="lg" />
            <Avatar initials="BS" status="busy" size="lg" />
        </div>
    ),
};

export const AvatarGroup: Story = {
    render: () => (
        <div className="flex -space-x-3">
            <Avatar initials="A" size="md" className="ring-2 ring-white" />
            <Avatar initials="B" size="md" className="ring-2 ring-white" />
            <Avatar initials="C" size="md" className="ring-2 ring-white" />
            <Avatar initials="+3" size="md" className="ring-2 ring-white" />
        </div>
    ),
};
