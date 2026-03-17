import type { Meta, StoryObj } from '@storybook/react-vite';
import { OrbitalVisualization } from './OrbitalVisualization';

const meta: Meta<typeof OrbitalVisualization> = {
    title: 'Organisms/OrbitalVisualization',
    component: OrbitalVisualization,
    parameters: {
        layout: 'centered',
        backgrounds: {
            default: 'dark',
            values: [
                { name: 'dark', value: '#0a0a0a' },
                { name: 'darker', value: '#000000' },
            ],
        },
    },
    tags: ['autodocs'],
    argTypes: {
        complexity: {
            control: { type: 'range', min: 1, max: 100 },
            description: 'Complexity score (1-100+)',
        },
        size: {
            control: { type: 'select' },
            options: ['sm', 'md', 'lg', 'xl'],
        },
        animated: {
            control: { type: 'boolean' },
        },
        showLabel: {
            control: { type: 'boolean' },
        },
    },
};

export default meta;
type Story = StoryObj<typeof OrbitalVisualization>;

// ============ Stories by Orbital Type ============

export const Orbital1s: Story = {
    name: '1s Orbital (Simple)',
    args: {
        complexity: 2,
        size: 'lg',
        animated: true,
        showLabel: true,
    },
};

export const Orbital2s: Story = {
    name: '2s Orbital',
    args: {
        complexity: 6,
        size: 'lg',
        animated: true,
        showLabel: true,
    },
};

export const Orbital2p: Story = {
    name: '2p Orbital (Dumbbell)',
    args: {
        complexity: 12,
        size: 'lg',
        animated: true,
        showLabel: true,
    },
};

export const Orbital3s: Story = {
    name: '3s Orbital',
    args: {
        complexity: 20,
        size: 'lg',
        animated: true,
        showLabel: true,
    },
};

export const Orbital3p: Story = {
    name: '3p Orbital',
    args: {
        complexity: 35,
        size: 'lg',
        animated: true,
        showLabel: true,
    },
};

export const Orbital3d: Story = {
    name: '3d Orbital (Cloverleaf)',
    args: {
        complexity: 50,
        size: 'lg',
        animated: true,
        showLabel: true,
    },
};

export const Orbital4f: Story = {
    name: '4f Orbital (Complex)',
    args: {
        complexity: 75,
        size: 'lg',
        animated: true,
        showLabel: true,
    },
};

// ============ Size Variants ============

export const SmallSize: Story = {
    name: 'Size: Small',
    args: {
        complexity: 12,
        size: 'sm',
        animated: true,
        showLabel: false,
    },
};

export const ExtraLargeSize: Story = {
    name: 'Size: Extra Large',
    args: {
        complexity: 35,
        size: 'xl',
        animated: true,
        showLabel: true,
    },
};

// ============ Interactive ============

export const Interactive: Story = {
    name: 'Interactive (Clickable)',
    args: {
        complexity: 25,
        size: 'lg',
        animated: true,
        showLabel: true,
        onClick: () => alert('Orbital clicked!'),
    },
};

// ============ From Schema ============

export const FromSchema: Story = {
    name: 'From KFlow Schema',
    args: {
        schema: {
            dataEntities: [
                { name: 'User' },
                { name: 'Project' },
                { name: 'Task' },
            ],
            ui: {
                pages: [
                    { sections: [{}, {}, {}] },
                    { sections: [{}, {}] },
                    { sections: [{}, {}, {}, {}] },
                ],
            },
            traits: [
                { name: 'CRUD' },
                { name: 'Validation' },
            ],
        },
        size: 'lg',
        animated: true,
        showLabel: true,
    },
};

// ============ All Orbitals Gallery ============

export const AllOrbitals: Story = {
    name: 'All Orbital Types',
    render: () => (
        <div className="flex flex-wrap gap-8 items-end justify-center p-8">
            <OrbitalVisualization complexity={2} size="md" showLabel />
            <OrbitalVisualization complexity={6} size="md" showLabel />
            <OrbitalVisualization complexity={12} size="md" showLabel />
            <OrbitalVisualization complexity={20} size="md" showLabel />
            <OrbitalVisualization complexity={35} size="md" showLabel />
            <OrbitalVisualization complexity={50} size="md" showLabel />
            <OrbitalVisualization complexity={75} size="md" showLabel />
        </div>
    ),
};

// ============ Static (No Animation) ============

export const Static: Story = {
    name: 'Static (No Animation)',
    args: {
        complexity: 35,
        size: 'lg',
        animated: false,
        showLabel: true,
    },
};
