import type { Meta, StoryObj } from '@storybook/react';
import { TraitStateViewer } from './TraitStateViewer';
import { VStack } from '../../atoms/Stack';
import type { TraitStateMachineDefinition } from './TraitStateViewer';

const meta: Meta<typeof TraitStateViewer> = {
    title: 'Organisms/Game/TraitStateViewer',
    component: TraitStateViewer,
};
export default meta;
type Story = StoryObj<typeof TraitStateViewer>;

const bedancMachine: TraitStateMachineDefinition = {
    name: 'Bedanc Behavior',
    description: 'Giant blocking the mountain path',
    states: ['sleeping', 'sniffing', 'eating', 'moved_away'],
    currentState: 'sniffing',
    transitions: [
        { from: 'sleeping', to: 'sniffing', event: 'SMELL_FOOD' },
        { from: 'sniffing', to: 'eating', event: 'FIND_SOURCE', guardHint: 'item = blueberries' },
        { from: 'eating', to: 'moved_away', event: 'FINISHED_EATING' },
    ],
};

const sawmillMachine: TraitStateMachineDefinition = {
    name: 'Sawmill',
    description: 'Automated wood processing with overheating risk',
    states: ['idle', 'cutting', 'overheated', 'cooling_down'],
    currentState: 'cutting',
    transitions: [
        { from: 'idle', to: 'cutting', event: 'ADD_FUEL' },
        { from: 'cutting', to: 'overheated', event: 'OVERHEAT', guardHint: 'temperature > 100' },
        { from: 'cutting', to: 'idle', event: 'OUT_OF_WOOD' },
        { from: 'overheated', to: 'cooling_down', event: 'AUTO_COOL' },
        { from: 'cooling_down', to: 'idle', event: 'COOLED' },
    ],
};

const sequenceMachine: TraitStateMachineDefinition = {
    name: 'Kekec Path',
    description: 'Get past Bedanc!',
    states: ['Walk', 'Sneak', 'Drop Berries', 'Wait', 'Done'],
    currentState: 'Sneak',
    transitions: [
        { from: 'Walk', to: 'Sneak', event: 'NEXT' },
        { from: 'Sneak', to: 'Drop Berries', event: 'NEXT' },
        { from: 'Drop Berries', to: 'Wait', event: 'NEXT' },
        { from: 'Wait', to: 'Done', event: 'NEXT' },
    ],
};

/** Linear variant — step-by-step progression for ages 5-8 */
export const Linear: Story = {
    args: {
        trait: sequenceMachine,
        variant: 'linear',
    },
};

/** Compact variant — current state + available actions for ages 9-12 */
export const Compact: Story = {
    args: {
        trait: bedancMachine,
        variant: 'compact',
    },
};

/** Full variant — all states and transitions visible for ages 13+ */
export const Full: Story = {
    args: {
        trait: sawmillMachine,
        variant: 'full',
    },
};

/** All three variants side by side */
export const AllVariants: Story = {
    render: () => (
        <VStack gap="lg" className="max-w-xl">
            <TraitStateViewer trait={sequenceMachine} variant="linear" />
            <TraitStateViewer trait={bedancMachine} variant="compact" />
            <TraitStateViewer trait={sawmillMachine} variant="full" />
        </VStack>
    ),
};

/** Size variants */
export const Sizes: Story = {
    render: () => (
        <VStack gap="lg" className="max-w-xl">
            <TraitStateViewer trait={bedancMachine} variant="full" size="sm" />
            <TraitStateViewer trait={bedancMachine} variant="full" size="md" />
            <TraitStateViewer trait={bedancMachine} variant="full" size="lg" />
        </VStack>
    ),
};
