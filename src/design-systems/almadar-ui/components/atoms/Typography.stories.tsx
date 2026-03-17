import type { Meta, StoryObj } from '@storybook/react-vite';
import { Typography } from './Typography';

const meta: Meta<typeof Typography> = {
    title: 'Atoms/Typography',
    component: Typography,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body', 'body2', 'small', 'caption'],
        },
        color: {
            control: 'select',
            options: ['primary', 'secondary', 'muted', 'error', 'success', 'warning', 'inherit'],
        },
        weight: {
            control: 'select',
            options: ['normal', 'medium', 'semibold', 'bold'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        children: 'The quick brown fox jumps over the lazy dog',
    },
};

export const Headings: Story = {
    render: () => (
        <div className="space-y-2">
            <Typography variant="h1">Heading 1</Typography>
            <Typography variant="h2">Heading 2</Typography>
            <Typography variant="h3">Heading 3</Typography>
            <Typography variant="h4">Heading 4</Typography>
            <Typography variant="h5">Heading 5</Typography>
            <Typography variant="h6">Heading 6</Typography>
        </div>
    ),
};

export const Body: Story = {
    render: () => (
        <div className="space-y-4 max-w-lg">
            <Typography variant="body">
                Body: This is the default body text used for paragraphs and regular content.
                It provides optimal readability for longer text.
            </Typography>
            <Typography variant="body2">
                Body 2: A slightly smaller body variant for secondary content or less prominent text.
            </Typography>
            <Typography variant="small">
                Small: Used for captions, labels, and auxiliary information.
            </Typography>
            <Typography variant="caption">
                Caption: The smallest text variant for meta information.
            </Typography>
        </div>
    ),
};

export const Colors: Story = {
    render: () => (
        <div className="space-y-2">
            <Typography color="primary">Primary Color</Typography>
            <Typography color="secondary">Secondary Color</Typography>
            <Typography color="muted">Muted Color</Typography>
            <Typography color="error">Error Color</Typography>
            <Typography color="success">Success Color</Typography>
            <Typography color="warning">Warning Color</Typography>
        </div>
    ),
};

export const Weights: Story = {
    render: () => (
        <div className="space-y-2">
            <Typography weight="normal">Normal Weight</Typography>
            <Typography weight="medium">Medium Weight</Typography>
            <Typography weight="semibold">Semibold Weight</Typography>
            <Typography weight="bold">Bold Weight</Typography>
        </div>
    ),
};

export const AsLink: Story = {
    args: {
        as: 'a',
        children: 'This is a link',
        className: 'underline hover:no-underline cursor-pointer',
    },
};
