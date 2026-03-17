// eslint-disable-next-line almadar/require-translate -- storybook-only, not a shipped component
import type { Meta, StoryObj } from '@storybook/react';
import { ClassifierBoard } from './ClassifierBoard';
import type { ClassifierPuzzleEntity } from './ClassifierBoard';

const sampleEntity: ClassifierPuzzleEntity = {
    id: 'cls-1',
    title: 'Animal Classification',
    description: 'Sort the animals into the correct categories.',
    items: [
        { id: 'eagle', label: 'Eagle', correctCategory: 'birds' },
        { id: 'salmon', label: 'Salmon', correctCategory: 'fish' },
        { id: 'tiger', label: 'Tiger', correctCategory: 'mammals' },
        { id: 'parrot', label: 'Parrot', correctCategory: 'birds' },
        { id: 'tuna', label: 'Tuna', correctCategory: 'fish' },
        { id: 'whale', label: 'Whale', correctCategory: 'mammals' },
    ],
    categories: [
        { id: 'mammals', label: 'Mammals', color: '#f59e0b' },
        { id: 'birds', label: 'Birds', color: '#3b82f6' },
        { id: 'fish', label: 'Fish', color: '#10b981' },
    ],
    successMessage: 'All animals sorted correctly!',
    failMessage: 'Some animals are in the wrong category.',
    hint: 'Remember: whales are mammals, not fish.',
};

const meta: Meta<typeof ClassifierBoard> = {
    title: 'Organisms/Game/Puzzles/ClassifierBoard',
    component: ClassifierBoard,
};

export default meta;

type Story = StoryObj<typeof ClassifierBoard>;

export const Default: Story = {
    args: {
        entity: sampleEntity,
    },
};

export const WithHeaderImage: Story = {
    args: {
        entity: {
            ...sampleEntity,
            headerImage: 'https://placehold.co/800x200/1a2e1a/e0ffe0?text=Animal+Kingdom',
        },
    },
};

export const WithTheme: Story = {
    args: {
        entity: {
            ...sampleEntity,
            theme: { accentColor: '#059669' },
        },
    },
};
