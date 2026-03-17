import type { Meta, StoryObj } from '@storybook/react-vite';
import { Modal } from './Modal';
import { Button } from '../atoms/Button';
import { useState } from 'react';

const meta: Meta<typeof Modal> = {
    title: 'Molecules/Modal',
    component: Modal,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
    argTypes: {
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg', 'xl', 'full'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: function DefaultModal() {
        const [isOpen, setIsOpen] = useState(false);

        return (
            <>
                <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
                <Modal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    title="Modal Title"
                >
                    <p className="text-black">
                        This is the modal content. It can contain any React components.
                    </p>
                </Modal>
            </>
        );
    },
};

export const WithConfirmation: Story = {
    render: function ConfirmModal() {
        const [isOpen, setIsOpen] = useState(false);

        return (
            <>
                <Button variant="danger" onClick={() => setIsOpen(true)}>Delete Item</Button>
                <Modal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    title="Confirm Delete"
                    footer={
                        <>
                            <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
                            <Button variant="danger" onClick={() => setIsOpen(false)}>Delete</Button>
                        </>
                    }
                >
                    <p className="text-black">
                        Are you sure you want to delete this item? This action cannot be undone.
                    </p>
                </Modal>
            </>
        );
    },
};

export const LargeModal: Story = {
    render: function LargeModalStory() {
        const [isOpen, setIsOpen] = useState(false);

        return (
            <>
                <Button onClick={() => setIsOpen(true)}>Open Large Modal</Button>
                <Modal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    title="Large Modal"
                    size="lg"
                >
                    <div className="space-y-4">
                        <p className="text-black">
                            This is a larger modal that can contain more content.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 border-2 border-black">
                                <h4 className="font-bold text-black">Section 1</h4>
                                <p className="text-sm text-neutral-600">Content for section 1</p>
                            </div>
                            <div className="p-4 border-2 border-black">
                                <h4 className="font-bold text-black">Section 2</h4>
                                <p className="text-sm text-neutral-600">Content for section 2</p>
                            </div>
                        </div>
                    </div>
                </Modal>
            </>
        );
    },
};

export const FormModal: Story = {
    render: function FormModalStory() {
        const [isOpen, setIsOpen] = useState(false);

        return (
            <>
                <Button onClick={() => setIsOpen(true)}>Add New Item</Button>
                <Modal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    title="Add New Item"
                    footer={
                        <>
                            <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
                            <Button variant="primary" onClick={() => setIsOpen(false)}>Save</Button>
                        </>
                    }
                >
                    <form className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-black">Name</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border-2 border-black"
                                placeholder="Enter name..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-black">Description</label>
                            <textarea
                                className="w-full px-3 py-2 border-2 border-black min-h-[100px]"
                                placeholder="Enter description..."
                            />
                        </div>
                    </form>
                </Modal>
            </>
        );
    },
};
