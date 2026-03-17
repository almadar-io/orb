import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardBody, CardHeader, CardFooter, CardTitle } from './Card';
import { Button } from './Button';

const meta: Meta<typeof Card> = {
    title: 'Atoms/Card',
    component: Card,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'outline', 'elevated'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        children: (
            <CardBody>
                <CardTitle>Card Title</CardTitle>
                <p className="text-sm text-neutral-600">This is a simple card with the wireframe theme applied.</p>
            </CardBody>
        ),
    },
};

export const WithHeader: Story = {
    render: () => (
        <Card className="w-80">
            <CardHeader>
                <CardTitle>Card Header</CardTitle>
                <p className="text-sm text-neutral-600">With header and body sections</p>
            </CardHeader>
            <CardBody>
                <p className="text-black">
                    This card demonstrates the header and body layout.
                </p>
            </CardBody>
        </Card>
    ),
};

export const WithFooter: Story = {
    render: () => (
        <Card className="w-80">
            <CardBody>
                <CardTitle>Complete Card</CardTitle>
                <p className="text-sm text-neutral-600">Header, body, and footer sections</p>
                <p className="mt-4 text-black">
                    Main content goes here in the body section.
                </p>
            </CardBody>
            <CardFooter>
                <Button variant="secondary" size="sm">Cancel</Button>
                <Button variant="primary" size="sm">Save</Button>
            </CardFooter>
        </Card>
    ),
};

export const Variants: Story = {
    render: () => (
        <div className="flex gap-4">
            <Card variant="default" className="w-48 p-4">
                <CardTitle>Default</CardTitle>
                <p className="text-sm text-neutral-600">Default variant</p>
            </Card>
            <Card variant="bordered" className="w-48 p-4">
                <CardTitle>Bordered</CardTitle>
                <p className="text-sm text-neutral-600">Bordered variant</p>
            </Card>
            <Card variant="elevated" className="w-48 p-4">
                <CardTitle>Elevated</CardTitle>
                <p className="text-sm text-neutral-600">Elevated variant</p>
            </Card>
        </div>
    ),
};

export const Interactive: Story = {
    render: () => (
        <Card className="w-80 cursor-pointer hover:shadow-wireframe transition-shadow">
            <CardBody>
                <CardTitle>Interactive Card</CardTitle>
                <p className="text-sm text-neutral-600">Hover to see the shadow effect</p>
            </CardBody>
        </Card>
    ),
};
