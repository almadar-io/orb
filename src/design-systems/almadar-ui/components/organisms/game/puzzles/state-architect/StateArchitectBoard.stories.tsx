/* eslint-disable almadar/require-translate -- storybook-only, not a shipped component */
import type { Meta, StoryObj } from '@storybook/react';
import { StateArchitectBoard, type StateArchitectPuzzleEntity } from './StateArchitectBoard';

const meta: Meta<typeof StateArchitectBoard> = {
    title: 'Organisms/Game/Puzzles/StateArchitectBoard',
    component: StateArchitectBoard,
};
export default meta;
type Story = StoryObj<typeof StateArchitectBoard>;

const simplePuzzle: StateArchitectPuzzleEntity = {
    id: 'puzzle-traffic-light',
    title: 'Traffic Light Controller',
    description: 'Design a state machine for a traffic light that cycles through red, green, and yellow.',
    hint: 'A traffic light goes Red -> Green -> Yellow -> Red.',
    entityName: 'TrafficLight',
    variables: [
        { name: 'cycleCount', value: 0 },
    ],
    states: ['red', 'green', 'yellow'],
    initialState: 'red',
    transitions: [],
    availableEvents: ['NEXT'],
    testCases: [
        {
            events: ['NEXT'],
            expectedState: 'green',
            label: 'Red + NEXT = Green',
        },
        {
            events: ['NEXT', 'NEXT'],
            expectedState: 'yellow',
            label: 'Red + NEXT + NEXT = Yellow',
        },
        {
            events: ['NEXT', 'NEXT', 'NEXT'],
            expectedState: 'red',
            label: 'Full cycle returns to Red',
        },
    ],
    showCodeView: true,
};

const prefilledPuzzle: StateArchitectPuzzleEntity = {
    ...simplePuzzle,
    id: 'puzzle-traffic-prefilled',
    title: 'Traffic Light (Prefilled)',
    transitions: [
        { id: 't-1', from: 'red', to: 'green', event: 'NEXT' },
        { id: 't-2', from: 'green', to: 'yellow', event: 'NEXT' },
        { id: 't-3', from: 'yellow', to: 'red', event: 'NEXT' },
    ],
};

/** Default empty puzzle — user builds from scratch */
export const Default: Story = {
    args: {
        entity: simplePuzzle,
    },
};

/** Puzzle with correct transitions pre-filled — ready to test */
export const Prefilled: Story = {
    args: {
        entity: prefilledPuzzle,
    },
};

/** With header image */
export const WithHeaderImage: Story = {
    args: {
        entity: {
            ...simplePuzzle,
            headerImage: 'https://placehold.co/800x200/1a1a2e/e0e0e0?text=Traffic+Light+Challenge',
        },
    },
};
