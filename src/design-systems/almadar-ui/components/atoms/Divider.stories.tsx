import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
    title: 'Atoms/Divider',
    component: Divider,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
    argTypes: {
        orientation: {
            control: 'select',
            options: ['horizontal', 'vertical'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
    args: {
        orientation: 'horizontal',
    },
    decorators: [
        (Story) => (
            <div className="w-80">
                <Story />
            </div>
        ),
    ],
};

export const Vertical: Story = {
    args: {
        orientation: 'vertical',
    },
    decorators: [
        (Story) => (
            <div className="h-24 flex items-center">
                <Story />
            </div>
        ),
    ],
};

export const WithLabel: Story = {
    args: {
        label: 'OR',
    },
    decorators: [
        (Story) => (
            <div className="w-80">
                <Story />
            </div>
        ),
    ],
};

export const InContent: Story = {
    render: () => (
        <div className="w-80 space-y-4">
            <p className="text-black">This is the first section of content.</p>
            <Divider />
            <p className="text-black">This is the second section of content.</p>
            <Divider label="NEW SECTION" />
            <p className="text-black">This is the third section with a label.</p>
        </div>
    ),
};

export const VerticalInline: Story = {
    render: () => (
        <div className="flex items-center gap-4">
            <span className="text-black font-bold">Option A</span>
            <Divider orientation="vertical" className="h-4" />
            <span className="text-black font-bold">Option B</span>
            <Divider orientation="vertical" className="h-4" />
            <span className="text-black font-bold">Option C</span>
        </div>
    ),
};
