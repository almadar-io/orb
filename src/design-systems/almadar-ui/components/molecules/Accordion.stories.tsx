import type { Meta, StoryObj } from '@storybook/react-vite';
import { Accordion } from './Accordion';

const meta: Meta<typeof Accordion> = {
    title: 'Molecules/Accordion',
    component: Accordion,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const faqItems = [
    {
        id: 'faq-1',
        header: 'What is this component library?',
        content: 'This is a wireframe-themed component library built with React and Tailwind CSS, following Atomic Design principles.',
    },
    {
        id: 'faq-2',
        header: 'How do I use it?',
        content: 'Simply import the components you need and use them in your React application. All components are styled with the wireframe theme by default.',
    },
    {
        id: 'faq-3',
        header: 'Is it customizable?',
        content: 'Yes! You can customize the components using className props and Tailwind CSS utilities. The base theme provides high contrast black and white styling.',
    },
];

export const Default: Story = {
    args: {
        items: faqItems,
    },
    decorators: [
        (Story) => (
            <div className="w-96">
                <Story />
            </div>
        ),
    ],
};

export const SingleOpen: Story = {
    args: {
        items: faqItems,
        multiple: false,
        defaultOpenItems: ['faq-1'],
    },
    decorators: [
        (Story) => (
            <div className="w-96">
                <Story />
            </div>
        ),
    ],
};

export const MultipleOpen: Story = {
    args: {
        items: faqItems,
        multiple: true,
        defaultOpenItems: ['faq-1', 'faq-2'],
    },
    decorators: [
        (Story) => (
            <div className="w-96">
                <Story />
            </div>
        ),
    ],
};

export const WithDisabledItem: Story = {
    args: {
        items: [
            ...faqItems,
            {
                id: 'faq-4',
                header: 'Disabled Item',
                content: 'This item is disabled and cannot be opened.',
                disabled: true,
            },
        ],
    },
    decorators: [
        (Story) => (
            <div className="w-96">
                <Story />
            </div>
        ),
    ],
};

export const SettingsExample: Story = {
    render: () => (
        <div className="w-96">
            <h3 className="font-bold text-black mb-4">Settings</h3>
            <Accordion
                items={[
                    {
                        id: 'general',
                        header: 'General Settings',
                        content: (
                            <div className="space-y-2">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" className="border-2 border-black" />
                                    <span className="text-black">Enable notifications</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" className="border-2 border-black" />
                                    <span className="text-black">Dark mode</span>
                                </label>
                            </div>
                        ),
                        defaultOpen: true,
                    },
                    {
                        id: 'privacy',
                        header: 'Privacy Settings',
                        content: (
                            <div className="space-y-2">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" className="border-2 border-black" defaultChecked />
                                    <span className="text-black">Share usage data</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" className="border-2 border-black" />
                                    <span className="text-black">Allow cookies</span>
                                </label>
                            </div>
                        ),
                    },
                    {
                        id: 'advanced',
                        header: 'Advanced Settings',
                        content: (
                            <p className="text-neutral-600">
                                Advanced configuration options for power users.
                            </p>
                        ),
                    },
                ]}
                multiple
            />
        </div>
    ),
};
