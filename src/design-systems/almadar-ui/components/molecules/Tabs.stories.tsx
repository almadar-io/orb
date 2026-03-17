import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs } from './Tabs';
import { Settings, User, Bell, Shield } from 'lucide-react';

const meta: Meta<typeof Tabs> = {
    title: 'Molecules/Tabs',
    component: Tabs,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'pills', 'underline'],
        },
        orientation: {
            control: 'select',
            options: ['horizontal', 'vertical'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

const basicItems = [
    { id: 'tab1', label: 'Tab 1', content: <p className="text-black">Content for Tab 1</p> },
    { id: 'tab2', label: 'Tab 2', content: <p className="text-black">Content for Tab 2</p> },
    { id: 'tab3', label: 'Tab 3', content: <p className="text-black">Content for Tab 3</p> },
];

export const Default: Story = {
    args: {
        items: basicItems,
    },
    decorators: [
        (Story) => (
            <div className="w-96">
                <Story />
            </div>
        ),
    ],
};

export const WithIcons: Story = {
    args: {
        items: [
            { id: 'profile', label: 'Profile', icon: User, content: <p className="text-black">Profile settings</p> },
            { id: 'notifications', label: 'Notifications', icon: Bell, content: <p className="text-black">Notification preferences</p> },
            { id: 'security', label: 'Security', icon: Shield, content: <p className="text-black">Security options</p> },
            { id: 'settings', label: 'Settings', icon: Settings, content: <p className="text-black">General settings</p> },
        ],
    },
    decorators: [
        (Story) => (
            <div className="w-[500px]">
                <Story />
            </div>
        ),
    ],
};

export const WithBadges: Story = {
    args: {
        items: [
            { id: 'all', label: 'All', badge: 24, content: <p className="text-black">All items</p> },
            { id: 'unread', label: 'Unread', badge: 5, content: <p className="text-black">Unread items</p> },
            { id: 'archived', label: 'Archived', content: <p className="text-black">Archived items</p> },
        ],
    },
    decorators: [
        (Story) => (
            <div className="w-96">
                <Story />
            </div>
        ),
    ],
};

export const Pills: Story = {
    args: {
        items: basicItems,
        variant: 'pills',
    },
    decorators: [
        (Story) => (
            <div className="w-96">
                <Story />
            </div>
        ),
    ],
};

export const Underline: Story = {
    args: {
        items: basicItems,
        variant: 'underline',
    },
    decorators: [
        (Story) => (
            <div className="w-96">
                <Story />
            </div>
        ),
    ],
};

export const Vertical: Story = {
    args: {
        items: [
            { id: 'profile', label: 'Profile', icon: User, content: <div className="p-4"><h3 className="font-bold text-black">Profile Settings</h3><p className="text-neutral-600 mt-2">Manage your profile information and preferences.</p></div> },
            { id: 'notifications', label: 'Notifications', icon: Bell, content: <div className="p-4"><h3 className="font-bold text-black">Notification Settings</h3><p className="text-neutral-600 mt-2">Configure how you receive notifications.</p></div> },
            { id: 'security', label: 'Security', icon: Shield, content: <div className="p-4"><h3 className="font-bold text-black">Security Settings</h3><p className="text-neutral-600 mt-2">Manage your security and privacy settings.</p></div> },
        ],
        orientation: 'vertical',
    },
    decorators: [
        (Story) => (
            <div className="w-[500px] flex">
                <Story />
            </div>
        ),
    ],
};

export const DisabledTab: Story = {
    args: {
        items: [
            { id: 'tab1', label: 'Active', content: <p className="text-black">Active tab content</p> },
            { id: 'tab2', label: 'Disabled', content: <p className="text-black">Disabled content</p>, disabled: true },
            { id: 'tab3', label: 'Another', content: <p className="text-black">Another tab content</p> },
        ],
    },
    decorators: [
        (Story) => (
            <div className="w-96">
                <Story />
            </div>
        ),
    ],
};
