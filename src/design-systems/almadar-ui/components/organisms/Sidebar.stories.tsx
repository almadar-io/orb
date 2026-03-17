import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sidebar } from './Sidebar';
import { Home, Users, Settings, FileText, BarChart, Mail, Calendar } from 'lucide-react';
import { Box } from '../atoms/Box';

const meta: Meta<typeof Sidebar> = {
    title: 'Organisms/Sidebar',
    component: Sidebar,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '#' },
    { id: 'users', label: 'Users', icon: Users, href: '#' },
    { id: 'reports', label: 'Reports', icon: BarChart, href: '#' },
    { id: 'documents', label: 'Documents', icon: FileText, href: '#' },
    { id: 'messages', label: 'Messages', icon: Mail, href: '#', badge: 5 },
    { id: 'calendar', label: 'Calendar', icon: Calendar, href: '#' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '#' },
];

export const Default: Story = {
    args: {
        items: sidebarItems.map(item => ({ ...item, active: item.id === 'dashboard' })),
        brandName: 'MyApp',
        collapseChangeEvent: 'UI:SIDEBAR_COLLAPSE',
        logoClickEvent: 'UI:SIDEBAR_LOGO',
    },
    decorators: [
        (Story) => (
            <Box className="h-screen">
                <Story />
            </Box>
        ),
    ],
};

export const Collapsed: Story = {
    args: {
        items: sidebarItems.map(item => ({ ...item, active: item.id === 'dashboard' })),
        brandName: 'MA',
        defaultCollapsed: true,
        collapseChangeEvent: 'UI:SIDEBAR_COLLAPSE',
        logoClickEvent: 'UI:SIDEBAR_LOGO',
    },
    decorators: [
        (Story) => (
            <Box className="h-screen">
                <Story />
            </Box>
        ),
    ],
};

export const WithManyItems: Story = {
    args: {
        items: [
            { id: 'dashboard', label: 'Dashboard', icon: Home, href: '#' },
            { id: 'users', label: 'Users', icon: Users, href: '#', active: true },
            { id: 'reports', label: 'Reports', icon: BarChart, href: '#' },
            { id: 'documents', label: 'Documents', icon: FileText, href: '#' },
            { id: 'messages', label: 'Messages', icon: Mail, href: '#', badge: 3 },
        ],
        brandName: 'MyApp',
        collapseChangeEvent: 'UI:SIDEBAR_COLLAPSE',
        logoClickEvent: 'UI:SIDEBAR_LOGO',
    },
    decorators: [
        (Story) => (
            <Box className="h-screen">
                <Story />
            </Box>
        ),
    ],
};

export const WithFooter: Story = {
    args: {
        items: sidebarItems.map(item => ({ ...item, active: item.id === 'dashboard' })),
        brandName: 'MyApp',
        collapseChangeEvent: 'UI:SIDEBAR_COLLAPSE',
        logoClickEvent: 'UI:SIDEBAR_LOGO',
        footerContent: (
            <Box className="p-4 border-t-2 border-[var(--color-border)]">
                <Box className="text-sm text-[var(--color-muted-foreground)]">v1.0.0</Box>
            </Box>
        ),
    },
    decorators: [
        (Story) => (
            <Box className="h-screen">
                <Story />
            </Box>
        ),
    ],
};
