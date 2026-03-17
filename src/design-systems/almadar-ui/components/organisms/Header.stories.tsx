import type { Meta, StoryObj } from '@storybook/react-vite';
import { Header } from './Header';

const meta: Meta<typeof Header> = {
    title: 'Organisms/Header',
    component: Header,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        brandName: 'MyApp',
        userName: 'John Doe',
        userAvatar: {
            src: 'https://i.pravatar.cc/150?img=1',
            alt: 'John Doe',
        },
        variant: 'desktop',
        navigationItems: [
            { label: 'Dashboard', href: '#' },
            { label: 'Projects', href: '#' },
            { label: 'Team', href: '#' },
        ],
    },
};

export const WithSearch: Story = {
    args: {
        brandName: 'MyApp',
        showSearch: true,
        userName: 'Jane Smith',
        variant: 'desktop',
        navigationItems: [
            { label: 'Dashboard', href: '#' },
            { label: 'Projects', href: '#' },
        ],
    },
};

export const WithNavigation: Story = {
    args: {
        brandName: 'MyApp',
        userName: 'John Doe',
        variant: 'desktop',
        navigationItems: [
            { label: 'Dashboard', href: '#', active: true },
            { label: 'Projects', href: '#' },
            { label: 'Settings', href: '#' },
        ],
    },
};

export const MinimalHeader: Story = {
    args: {
        brandName: 'SimpleApp',
    },
};

export const FullFeatured: Story = {
    args: {
        brandName: 'Enterprise App',
        showSearch: true,
        userName: 'Admin User',
        userAvatar: {
            src: 'https://i.pravatar.cc/150?img=3',
            alt: 'Admin User',
        },
        variant: 'desktop',
        navigationItems: [
            { label: 'Dashboard', href: '#', active: true },
            { label: 'Analytics', href: '#' },
            { label: 'Reports', href: '#' },
            { label: 'Settings', href: '#' },
        ],
    },
};
