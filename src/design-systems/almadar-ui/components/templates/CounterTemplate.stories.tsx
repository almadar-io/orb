import type { Meta, StoryObj } from '@storybook/react-vite';
import { CounterTemplate } from './CounterTemplate';

const meta: Meta<typeof CounterTemplate> = {
    title: 'Templates/CounterTemplate',
    component: CounterTemplate,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        size: { control: 'select', options: ['sm', 'md', 'lg'] },
        variant: { control: 'select', options: ['minimal', 'standard', 'full'] },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        entity: {
            id: 'counter-1',
            count: 42,
        },
        title: 'Counter',
    },
};

export const Minimal: Story = {
    args: {
        entity: {
            id: 'counter-2',
            count: 10,
            decrementLabel: '-1',
            incrementLabel: '+1',
        },
        variant: 'minimal',
    },
};

export const Full: Story = {
    args: {
        entity: {
            id: 'counter-3',
            count: 50,
            decrementLabel: '5',
            incrementLabel: '5',
            rangeText: 'Range: 0 to 100',
        },
        variant: 'full',
        title: 'Adjustable Counter',
    },
};

export const AtMinimum: Story = {
    args: {
        entity: {
            id: 'counter-4',
            count: 0,
            decrementDisabled: true,
            rangeText: 'Range: 0 to 100',
        },
        variant: 'full',
        title: 'At Minimum',
    },
};

export const AtMaximum: Story = {
    args: {
        entity: {
            id: 'counter-5',
            count: 100,
            incrementDisabled: true,
            rangeText: 'Range: 0 to 100',
        },
        variant: 'full',
        title: 'At Maximum',
    },
};

export const LargeSize: Story = {
    args: {
        entity: {
            id: 'counter-6',
            count: 7,
        },
        size: 'lg',
        title: 'Big Counter',
    },
};
