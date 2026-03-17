import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConfirmDialog } from './ConfirmDialog';
import { useState } from 'react';
import { Button } from '../atoms/Button';

const meta: Meta<typeof ConfirmDialog> = {
    title: 'Organisms/ConfirmDialog',
    component: ConfirmDialog,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const InteractiveExample = ({ variant = 'danger' }: { variant?: 'danger' | 'warning' | 'info' }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button variant="primary" onClick={() => setIsOpen(true)}>
                Open Dialog
            </Button>
            <ConfirmDialog
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onConfirm={() => {
                    console.log('Confirmed!');
                    setIsOpen(false);
                }}
                title="Delete Item"
                message="Are you sure you want to delete this item? This action cannot be undone."
                variant={variant}
            />
        </>
    );
};

export const Default: Story = {
    render: () => <InteractiveExample />,
};

export const DangerVariant: Story = {
    args: {
        isOpen: true,
        title: 'Delete Project',
        message: 'Are you sure you want to delete this project? All data will be permanently removed.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'danger',
        onClose: () => { },
        onConfirm: () => { },
    },
};

export const WarningVariant: Story = {
    args: {
        isOpen: true,
        title: 'Archive Item',
        message: 'This item will be archived and hidden from the main view. You can restore it later.',
        confirmText: 'Archive',
        cancelText: 'Cancel',
        variant: 'warning',
        onClose: () => { },
        onConfirm: () => { },
    },
};

export const InfoVariant: Story = {
    args: {
        isOpen: true,
        title: 'Confirm Action',
        message: 'Are you sure you want to proceed with this action?',
        confirmText: 'Proceed',
        cancelText: 'Cancel',
        variant: 'info',
        onClose: () => { },
        onConfirm: () => { },
    },
};

export const Loading: Story = {
    args: {
        isOpen: true,
        title: 'Deleting...',
        message: 'Please wait while we delete the item.',
        isLoading: true,
        onClose: () => { },
        onConfirm: () => { },
    },
};

export const LargeDialog: Story = {
    args: {
        isOpen: true,
        title: 'Important Notice',
        message: 'This is a larger dialog with more content. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        size: 'lg',
        onClose: () => { },
        onConfirm: () => { },
    },
};
