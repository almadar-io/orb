import type { Meta, StoryObj } from '@storybook/react';
import { BuilderBoard, type BuilderPuzzleEntity } from './BuilderBoard';

const meta: Meta<typeof BuilderBoard> = {
    title: 'Organisms/Game/Puzzles/BuilderBoard',
    component: BuilderBoard,
};
export default meta;
type Story = StoryObj<typeof BuilderBoard>;

const sampleEntity: BuilderPuzzleEntity = {
    id: 'circuit-1',
    title: 'Build the Circuit',
    description: 'Place each component in the correct slot to complete the circuit.',
    components: [
        { id: 'resistor', label: 'Resistor', iconEmoji: '\u26A1', category: 'passive' },
        { id: 'capacitor', label: 'Capacitor', iconEmoji: '\uD83D\uDD0B', category: 'passive' },
        { id: 'led', label: 'LED', iconEmoji: '\uD83D\uDCA1', category: 'output' },
    ],
    slots: [
        { id: 'slot-1', label: 'Current Limiter', description: 'Protects the LED', acceptsComponentId: 'resistor' },
        { id: 'slot-2', label: 'Energy Store', description: 'Smooths voltage', acceptsComponentId: 'capacitor' },
        { id: 'slot-3', label: 'Light Output', description: 'Emits light', acceptsComponentId: 'led' },
    ],
    successMessage: 'Circuit complete! The LED lights up.',
    failMessage: 'Some components are in the wrong place.',
    hint: 'The resistor always goes before the LED.',
};

/** Default builder puzzle */
export const Default: Story = {
    args: {
        entity: sampleEntity,
    },
};

/** With header image */
export const WithHeaderImage: Story = {
    args: {
        entity: {
            ...sampleEntity,
            headerImage: 'https://placehold.co/600x200/1a1a2e/e0e0e0?text=Circuit+Board',
        },
    },
};

/** With theme */
export const Themed: Story = {
    args: {
        entity: {
            ...sampleEntity,
            theme: { accentColor: '#3b82f6' },
        },
    },
};
