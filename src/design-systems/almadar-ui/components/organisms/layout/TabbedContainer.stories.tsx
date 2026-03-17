import type { Meta, StoryObj } from '@storybook/react-vite';
import { TabbedContainer } from './TabbedContainer';
import { Box } from '../../atoms/Box';
import { Typography } from '../../atoms/Typography';

const meta: Meta<typeof TabbedContainer> = {
    title: 'Organisms/Layout/TabbedContainer',
    component: TabbedContainer,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const ProfileTab = () => (
    <Box className="p-6">
        <Typography variant="h4">Profile Settings</Typography>
        <Typography variant="body2" className="mt-4 text-neutral-600">
            Manage your profile information, avatar, and personal details.
        </Typography>
    </Box>
);

const SecurityTab = () => (
    <Box className="p-6">
        <Typography variant="h4">Security Settings</Typography>
        <Typography variant="body2" className="mt-4 text-neutral-600">
            Update your password, enable two-factor authentication, and manage sessions.
        </Typography>
    </Box>
);

const NotificationsTab = () => (
    <Box className="p-6">
        <Typography variant="h4">Notification Preferences</Typography>
        <Typography variant="body2" className="mt-4 text-neutral-600">
            Configure email, push, and in-app notification settings.
        </Typography>
    </Box>
);

const sampleTabs = [
    { id: 'profile', label: 'Profile', content: <ProfileTab /> },
    { id: 'security', label: 'Security', content: <SecurityTab />, badge: 2 },
    { id: 'notifications', label: 'Notifications', content: <NotificationsTab /> },
];

export const Default: Story = {
    args: {
        tabs: sampleTabs,
        defaultTab: 'profile',
    },
    decorators: [
        (Story) => (
            <div style={{ height: '400px', width: '100%' }}>
                <Story />
            </div>
        ),
    ],
};

export const VerticalTabs: Story = {
    args: {
        tabs: sampleTabs,
        defaultTab: 'profile',
        position: 'left',
    },
    decorators: [
        (Story) => (
            <div style={{ height: '400px', width: '100%' }}>
                <Story />
            </div>
        ),
    ],
};

export const WithDisabledTab: Story = {
    args: {
        tabs: [
            ...sampleTabs,
            { id: 'billing', label: 'Billing', content: <div />, disabled: true },
        ],
        defaultTab: 'profile',
    },
    decorators: [
        (Story) => (
            <div style={{ height: '400px', width: '100%' }}>
                <Story />
            </div>
        ),
    ],
};

export const WithBadges: Story = {
    args: {
        tabs: [
            { id: 'inbox', label: 'Inbox', content: <ProfileTab />, badge: 12 },
            { id: 'sent', label: 'Sent', content: <SecurityTab /> },
            { id: 'drafts', label: 'Drafts', content: <NotificationsTab />, badge: 3 },
        ],
        defaultTab: 'inbox',
    },
    decorators: [
        (Story) => (
            <div style={{ height: '400px', width: '100%' }}>
                <Story />
            </div>
        ),
    ],
};
