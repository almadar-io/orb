import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
    title: 'Atoms/Checkbox',
    component: Checkbox,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        label: 'Accept terms and conditions',
    },
};

export const Checked: Story = {
    args: {
        label: 'I agree',
        defaultChecked: true,
    },
};

export const WithoutLabel: Story = {
    args: {},
};

export const Disabled: Story = {
    args: {
        label: 'Disabled checkbox',
        disabled: true,
    },
};

export const DisabledChecked: Story = {
    args: {
        label: 'Disabled and checked',
        disabled: true,
        defaultChecked: true,
    },
};

export const CheckboxGroup: Story = {
    render: () => (
        <div className="space-y-3">
            <p className="font-bold text-black mb-2">Select your interests:</p>
            <Checkbox label="Design" />
            <Checkbox label="Development" defaultChecked />
            <Checkbox label="Marketing" />
            <Checkbox label="Analytics" />
        </div>
    ),
};

export const FormExample: Story = {
    render: () => (
        <div className="w-80 space-y-4 p-4 border-2 border-black">
            <h3 className="font-bold text-black">Newsletter Preferences</h3>
            <div className="space-y-2">
                <Checkbox label="Weekly digest" defaultChecked />
                <Checkbox label="Product updates" defaultChecked />
                <Checkbox label="Marketing emails" />
                <Checkbox label="Partner offers" />
            </div>
        </div>
    ),
};
