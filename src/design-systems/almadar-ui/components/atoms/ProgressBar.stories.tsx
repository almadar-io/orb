import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar } from './ProgressBar';

const meta: Meta<typeof ProgressBar> = {
    title: 'Atoms/ProgressBar',
    component: ProgressBar,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
    argTypes: {
        progressType: {
            control: 'select',
            options: ['linear', 'circular', 'stepped'],
        },
        variant: {
            control: 'select',
            options: ['default', 'primary', 'success', 'warning', 'danger'],
        },
        color: {
            control: 'select',
            options: ['primary', 'success', 'warning', 'danger'],
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        value: 65,
    },
    decorators: [
        (Story) => (
            <div className="w-80">
                <Story />
            </div>
        ),
    ],
};

export const WithLabel: Story = {
    args: {
        value: 75,
        label: 'Upload Progress',
        showPercentage: true,
    },
    decorators: [
        (Story) => (
            <div className="w-80">
                <Story />
            </div>
        ),
    ],
};

export const Colors: Story = {
    render: () => (
        <div className="w-80 space-y-4">
            <ProgressBar value={65} color="primary" label="Primary" showPercentage />
            <ProgressBar value={85} color="success" label="Success" showPercentage />
            <ProgressBar value={45} color="warning" label="Warning" showPercentage />
            <ProgressBar value={25} color="danger" label="Danger" showPercentage />
        </div>
    ),
};

export const Circular: Story = {
    args: {
        value: 72,
        progressType: 'circular',
        showPercentage: true,
        size: 'lg',
    },
};

export const CircularSizes: Story = {
    render: () => (
        <div className="flex items-end gap-6">
            <div className="text-center">
                <ProgressBar value={65} progressType="circular" size="sm" showPercentage />
                <p className="mt-2 text-sm text-black">Small</p>
            </div>
            <div className="text-center">
                <ProgressBar value={75} progressType="circular" size="md" showPercentage />
                <p className="mt-2 text-sm text-black">Medium</p>
            </div>
            <div className="text-center">
                <ProgressBar value={85} progressType="circular" size="lg" showPercentage />
                <p className="mt-2 text-sm text-black">Large</p>
            </div>
        </div>
    ),
};

export const Stepped: Story = {
    args: {
        value: 60,
        progressType: 'stepped',
        steps: 5,
        label: 'Onboarding Progress',
        showPercentage: true,
    },
    decorators: [
        (Story) => (
            <div className="w-80">
                <Story />
            </div>
        ),
    ],
};

export const StepsExample: Story = {
    render: () => (
        <div className="w-80 space-y-4">
            <ProgressBar value={20} progressType="stepped" steps={5} label="Step 1 of 5" />
            <ProgressBar value={40} progressType="stepped" steps={5} label="Step 2 of 5" />
            <ProgressBar value={60} progressType="stepped" steps={5} label="Step 3 of 5" />
            <ProgressBar value={80} progressType="stepped" steps={5} label="Step 4 of 5" />
            <ProgressBar value={100} progressType="stepped" steps={5} label="Complete!" color="success" />
        </div>
    ),
};

export const UploadExample: Story = {
    render: () => (
        <div className="w-80 p-4 border-2 border-black space-y-4">
            <h3 className="font-bold text-black">Uploading files...</h3>
            <ProgressBar value={35} label="document.pdf" showPercentage />
            <ProgressBar value={100} label="image.png" showPercentage color="success" />
            <ProgressBar value={12} label="video.mp4" showPercentage />
        </div>
    ),
};
