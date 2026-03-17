import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from './Alert';

const meta: Meta<typeof Alert> = {
    title: 'Molecules/Alert',
    component: Alert,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['success', 'error', 'warning', 'info'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
    args: {
        variant: 'info',
        title: 'Information',
        children: 'This is an informational message with details about something.',
    },
    decorators: [
        (Story) => (
            <div className="w-96">
                <Story />
            </div>
        ),
    ],
};

export const Success: Story = {
    args: {
        variant: 'success',
        title: 'Success!',
        children: 'Your changes have been saved successfully.',
    },
    decorators: [
        (Story) => (
            <div className="w-96">
                <Story />
            </div>
        ),
    ],
};

export const Warning: Story = {
    args: {
        variant: 'warning',
        title: 'Warning',
        children: 'Please review your information before proceeding.',
    },
    decorators: [
        (Story) => (
            <div className="w-96">
                <Story />
            </div>
        ),
    ],
};

export const Error: Story = {
    args: {
        variant: 'error',
        title: 'Error',
        children: 'Something went wrong. Please try again later.',
    },
    decorators: [
        (Story) => (
            <div className="w-96">
                <Story />
            </div>
        ),
    ],
};

export const Dismissible: Story = {
    args: {
        variant: 'info',
        title: 'Dismissible Alert',
        children: 'Click the X to dismiss this alert.',
        dismissible: true,
        onDismiss: () => console.log('Alert dismissed'),
    },
    decorators: [
        (Story) => (
            <div className="w-96">
                <Story />
            </div>
        ),
    ],
};

export const AllVariants: Story = {
    render: () => (
        <div className="w-96 space-y-4">
            <Alert variant="info" title="Information">
                This is an info alert with helpful details.
            </Alert>
            <Alert variant="success" title="Success!">
                Operation completed successfully.
            </Alert>
            <Alert variant="warning" title="Warning">
                Please be careful with this action.
            </Alert>
            <Alert variant="error" title="Error">
                An error occurred while processing.
            </Alert>
        </div>
    ),
};

export const WithoutTitle: Story = {
    render: () => (
        <div className="w-96 space-y-4">
            <Alert variant="info">
                A simple info alert without a title.
            </Alert>
            <Alert variant="success">
                A simple success alert without a title.
            </Alert>
        </div>
    ),
};
