import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
    title: 'Atoms/Spinner',
    component: Spinner,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
    argTypes: {
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {},
};

export const Small: Story = {
    args: {
        size: 'sm',
    },
};

export const Medium: Story = {
    args: {
        size: 'md',
    },
};

export const Large: Story = {
    args: {
        size: 'lg',
    },
};

export const AllSizes: Story = {
    render: () => (
        <div className="flex items-center gap-6">
            <div className="text-center">
                <Spinner size="sm" />
                <p className="mt-2 text-sm text-black">Small</p>
            </div>
            <div className="text-center">
                <Spinner size="md" />
                <p className="mt-2 text-sm text-black">Medium</p>
            </div>
            <div className="text-center">
                <Spinner size="lg" />
                <p className="mt-2 text-sm text-black">Large</p>
            </div>
        </div>
    ),
};

export const InButton: Story = {
    render: () => (
        <button className="flex items-center gap-2 px-4 py-2 bg-black text-white font-bold">
            <Spinner size="sm" className="text-white" />
            Loading...
        </button>
    ),
};

export const InCard: Story = {
    render: () => (
        <div className="w-64 p-8 border-2 border-black flex flex-col items-center justify-center">
            <Spinner size="lg" />
            <p className="mt-4 text-black font-bold">Loading data...</p>
        </div>
    ),
};
