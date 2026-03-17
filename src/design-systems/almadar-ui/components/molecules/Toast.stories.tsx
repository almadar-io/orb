import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toast } from './Toast';

const meta: Meta<typeof Toast> = {
    title: 'Molecules/Toast',
    component: Toast,
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
        message: 'This is an informational toast message.',
        title: 'Information',
    },
};

export const Success: Story = {
    args: {
        variant: 'success',
        message: 'Your changes have been saved successfully.',
        title: 'Success',
    },
};

export const Warning: Story = {
    args: {
        variant: 'warning',
        message: 'Please review your input before continuing.',
        title: 'Warning',
    },
};

export const Error: Story = {
    args: {
        variant: 'error',
        message: 'An error occurred while processing your request.',
        title: 'Error',
    },
};

export const WithAction: Story = {
    args: {
        variant: 'info',
        message: 'You have a new message from John.',
        title: 'New Message',
        actionLabel: 'View',
        onAction: () => console.log('Action clicked'),
    },
};

export const Dismissible: Story = {
    args: {
        variant: 'success',
        message: 'Click the X to dismiss this toast.',
        title: 'Dismissible',
        dismissible: true,
        onDismiss: () => console.log('Dismissed'),
    },
};

export const WithBadge: Story = {
    args: {
        variant: 'info',
        message: 'You have new notifications waiting.',
        title: 'Notifications',
        badge: 5,
    },
};

export const AllVariants: Story = {
    render: () => (
        <div className="space-y-4">
            <Toast variant="info" message="This is an info toast." title="Info" />
            <Toast variant="success" message="Operation completed." title="Success" />
            <Toast variant="warning" message="Please be careful." title="Warning" />
            <Toast variant="error" message="Something went wrong." title="Error" />
        </div>
    ),
};

export const WithoutTitle: Story = {
    render: () => (
        <div className="space-y-4">
            <Toast variant="success" message="Changes saved successfully!" />
            <Toast variant="error" message="Failed to save changes." dismissible />
        </div>
    ),
};
