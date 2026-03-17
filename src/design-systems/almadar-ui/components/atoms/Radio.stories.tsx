import type { Meta, StoryObj } from '@storybook/react-vite';
import { Radio } from './Radio';
import { useState } from 'react';

const meta: Meta<typeof Radio> = {
    title: 'Atoms/Radio',
    component: Radio,
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
    args: {
        label: 'Option 1',
    },
};

export const Checked: Story = {
    args: {
        label: 'Selected option',
        checked: true,
    },
};

export const WithHelperText: Story = {
    args: {
        label: 'Premium Plan',
        helperText: 'Best for growing teams with advanced needs.',
    },
};

export const WithError: Story = {
    args: {
        label: 'Option with error',
        error: 'This option is not available',
        checked: true,
    },
};

export const Disabled: Story = {
    args: {
        label: 'Disabled option',
        disabled: true,
    },
};

export const Sizes: Story = {
    render: () => (
        <div className="space-y-4">
            <Radio label="Small" size="sm" name="sizes" />
            <Radio label="Medium (default)" size="md" name="sizes" />
            <Radio label="Large" size="lg" name="sizes" />
        </div>
    ),
};

export const RadioGroup: Story = {
    render: function RadioGroupStory() {
        const [selected, setSelected] = useState('starter');

        return (
            <div className="space-y-4 w-80">
                <p className="font-bold text-black mb-2">Select a plan:</p>
                <Radio
                    label="Starter"
                    helperText="$9/month - For individuals"
                    name="plan"
                    checked={selected === 'starter'}
                    onChange={() => setSelected('starter')}
                />
                <Radio
                    label="Professional"
                    helperText="$29/month - For small teams"
                    name="plan"
                    checked={selected === 'professional'}
                    onChange={() => setSelected('professional')}
                />
                <Radio
                    label="Enterprise"
                    helperText="$99/month - For large organizations"
                    name="plan"
                    checked={selected === 'enterprise'}
                    onChange={() => setSelected('enterprise')}
                />
                <p className="pt-4 text-sm text-neutral-600">
                    Selected: <span className="font-bold text-black">{selected}</span>
                </p>
            </div>
        );
    },
};

export const FormExample: Story = {
    render: () => (
        <div className="w-80 p-4 border-2 border-black space-y-4">
            <h3 className="font-bold text-black">Payment Method</h3>
            <Radio label="Credit Card" name="payment" defaultChecked />
            <Radio label="PayPal" name="payment" />
            <Radio label="Bank Transfer" name="payment" />
            <Radio label="Cryptocurrency" name="payment" disabled />
        </div>
    ),
};
