import type { Meta, StoryObj } from '@storybook/react-vite';
import { Navigation } from './Navigation';
import { Home, Users, Settings } from 'lucide-react';

const meta: Meta<typeof Navigation> = {
  title: 'Organisms/Navigation',
  component: Navigation,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const navItems = [
  { id: 'home', label: 'Home', icon: Home, isActive: true },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Horizontal: Story = {
  args: {
    items: navItems,
    orientation: 'horizontal',
  },
};

export const Vertical: Story = {
  args: {
    items: navItems,
    orientation: 'vertical',
  },
};

export const WithBadges: Story = {
  args: {
    items: [
      ...navItems,
      { id: 'alerts', label: 'Alerts', badge: 5 },
    ],
    orientation: 'horizontal',
  },
};
