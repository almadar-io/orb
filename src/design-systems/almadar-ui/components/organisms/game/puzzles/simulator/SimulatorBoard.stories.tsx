// eslint-disable-next-line almadar/require-translate -- storybook-only, not a shipped component
import type { Meta, StoryObj } from '@storybook/react';
import { SimulatorBoard } from './SimulatorBoard';
import type { SimulatorPuzzleEntity } from './SimulatorBoard';

const sampleEntity: SimulatorPuzzleEntity = {
    id: 'sim-1',
    title: 'Gravity Simulator',
    description: 'Adjust the parameters to make the ball land in the target zone.',
    parameters: [
        {
            id: 'velocity',
            label: 'Launch Velocity',
            unit: 'm/s',
            min: 0,
            max: 50,
            step: 1,
            initial: 10,
            correct: 25,
            tolerance: 3,
        },
        {
            id: 'angle',
            label: 'Launch Angle',
            unit: '\u00B0',
            min: 0,
            max: 90,
            step: 1,
            initial: 45,
            correct: 60,
            tolerance: 5,
        },
    ],
    outputLabel: 'Distance',
    outputUnit: 'm',
    computeExpression: '(params.velocity * params.velocity * Math.sin(2 * params.angle * Math.PI / 180)) / 9.81',
    targetValue: 55.2,
    targetTolerance: 5,
    successMessage: 'The ball landed in the target zone!',
    failMessage: 'Not quite right. Adjust the parameters and try again.',
    hint: 'Try increasing the angle while keeping velocity moderate.',
};

const meta: Meta<typeof SimulatorBoard> = {
    title: 'Organisms/Game/Puzzles/SimulatorBoard',
    component: SimulatorBoard,
};

export default meta;

type Story = StoryObj<typeof SimulatorBoard>;

export const Default: Story = {
    args: {
        entity: sampleEntity,
    },
};

export const WithHeaderImage: Story = {
    args: {
        entity: {
            ...sampleEntity,
            headerImage: 'https://placehold.co/800x200/1a1a2e/e0e0ff?text=Gravity+Sim',
        },
    },
};

export const WithTheme: Story = {
    args: {
        entity: {
            ...sampleEntity,
            theme: { accentColor: '#4f46e5' },
        },
    },
};
