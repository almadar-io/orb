import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
    title: 'Atoms/Select',
    component: Select,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const countryOptions = [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
    { value: 'jp', label: 'Japan' },
];

const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived', disabled: true },
];

export const Default: Story = {
    args: {
        options: countryOptions,
        placeholder: 'Select a country...',
    },
};

export const WithLabel: Story = {
    render: () => (
        <div className="w-64 space-y-2">
            <label className="block text-sm font-bold text-black">Country</label>
            <Select options={countryOptions} placeholder="Select a country..." />
        </div>
    ),
};

export const WithError: Story = {
    args: {
        options: countryOptions,
        placeholder: 'Select a country...',
        error: 'This field is required',
    },
};

export const WithDisabledOption: Story = {
    args: {
        options: statusOptions,
        placeholder: 'Select status...',
    },
};

export const Disabled: Story = {
    args: {
        options: countryOptions,
        placeholder: 'Select a country...',
        disabled: true,
    },
};

export const FormExample: Story = {
    render: () => (
        <div className="w-64 space-y-4">
            <div className="space-y-2">
                <label className="block text-sm font-bold text-black">Country</label>
                <Select options={countryOptions} placeholder="Select a country..." />
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-bold text-black">Status</label>
                <Select options={statusOptions} placeholder="Select status..." />
            </div>
        </div>
    ),
};
