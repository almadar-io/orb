// eslint-disable-next-line almadar/require-translate -- storybook-only, not a shipped component
import type { Meta, StoryObj } from '@storybook/react';
import { EventHandlerBoard, type EventHandlerPuzzleEntity } from './EventHandlerBoard';

const meta: Meta<typeof EventHandlerBoard> = {
    title: 'Organisms/Game/Puzzles/EventHandlerBoard',
    component: EventHandlerBoard,
};
export default meta;
type Story = StoryObj<typeof EventHandlerBoard>;

const firePuzzle: EventHandlerPuzzleEntity = {
    id: 'fire-puzzle',
    title: 'The Kitchen Fire',
    description: 'A fire breaks out in the kitchen. Set up event handlers so the alarm sounds and sprinklers activate.',
    objects: [
        {
            id: 'stove',
            name: 'Stove',
            icon: '\uD83D\uDD25',
            states: ['off', 'burning'],
            initialState: 'off',
            currentState: 'off',
            rules: [],
            availableEvents: [{ value: 'FIRE_STARTS', label: 'Fire Starts' }, { value: 'HEAT_DETECTED', label: 'Heat Detected' }],
            availableActions: [{ value: 'SOUND_ALARM', label: 'Sound Alarm' }, { value: 'CALL_FIRE_DEPT', label: 'Call Fire Dept' }],
        },
        {
            id: 'alarm',
            name: 'Alarm',
            icon: '\uD83D\uDEA8',
            states: ['silent', 'ringing'],
            initialState: 'silent',
            currentState: 'silent',
            rules: [],
            availableEvents: [{ value: 'SOUND_ALARM', label: 'Sound Alarm' }],
            availableActions: [{ value: 'ACTIVATE_SPRINKLERS', label: 'Activate Sprinklers' }, { value: 'ALERT_NEIGHBORS', label: 'Alert Neighbors' }],
        },
        {
            id: 'sprinkler',
            name: 'Sprinkler',
            icon: '\uD83D\uDCA7',
            states: ['idle', 'spraying'],
            initialState: 'idle',
            currentState: 'idle',
            rules: [],
            availableEvents: [{ value: 'ACTIVATE_SPRINKLERS', label: 'Activate Sprinklers' }],
            availableActions: [{ value: 'FIRE_OUT', label: 'Fire Out' }],
        },
    ],
    goalCondition: 'Make the sprinklers activate to put out the fire.',
    goalEvent: 'FIRE_OUT',
    triggerEvents: ['FIRE_STARTS'],
    successMessage: 'The fire is out! Great event chain!',
    failMessage: 'The fire kept burning. Try connecting the events differently.',
    hint: 'The stove needs to trigger the alarm, and the alarm needs to trigger the sprinklers.',
};

export const Default: Story = {
    args: {
        entity: firePuzzle,
    },
};

export const WithHeaderImage: Story = {
    args: {
        entity: {
            ...firePuzzle,
            headerImage: 'https://picsum.photos/seed/fire/800/200',
        },
    },
};

export const SlowPlayback: Story = {
    args: {
        entity: firePuzzle,
        stepDurationMs: 1500,
    },
};
