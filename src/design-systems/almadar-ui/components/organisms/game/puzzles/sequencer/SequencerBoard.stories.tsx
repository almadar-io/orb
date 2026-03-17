import type { Meta, StoryObj } from '@storybook/react';
import { SequencerBoard } from './SequencerBoard';
import type { SequencerPuzzleEntity } from './SequencerBoard';
import type { SlotItemData } from '../../TraitSlot';

// =============================================================================
// Mock data
// =============================================================================

const ACTIONS: SlotItemData[] = [
    { id: 'walk', name: 'Walk', category: 'movement', iconEmoji: '\uD83D\uDEB6', description: 'Move one tile forward' },
    { id: 'jump', name: 'Jump', category: 'movement', iconEmoji: '\uD83E\uDD18', description: 'Jump over an obstacle' },
    { id: 'sneak', name: 'Sneak', category: 'stealth', iconEmoji: '\uD83E\uDD2B', description: 'Move silently past enemies' },
    { id: 'drop', name: 'Drop Berries', category: 'item', iconEmoji: '\uD83E\uDED0', description: 'Place blueberries on the ground' },
];

const CATEGORY_COLORS: Record<string, { bg: string; border: string }> = {
    movement: { bg: 'rgba(59,130,246,0.2)', border: '#3b82f6' },
    stealth: { bg: 'rgba(168,85,247,0.2)', border: '#a855f7' },
    item: { bg: 'rgba(34,197,94,0.2)', border: '#22c55e' },
};

const BASE_ENTITY: SequencerPuzzleEntity = {
    id: 'puzzle-1',
    title: 'Forest Path',
    description: 'Help Kekec find his way through the forest!',
    availableActions: ACTIONS,
    maxSlots: 4,
    solutions: [['walk', 'jump', 'sneak', 'walk']],
    successMessage: 'Great job! You found the way!',
    failMessage: 'Not quite, try again!',
    hint: 'Try starting with Walk, then Jump over the log.',
};

// =============================================================================
// Stories
// =============================================================================

const meta: Meta<typeof SequencerBoard> = {
    title: 'Organisms/Game/Puzzles/SequencerBoard',
    component: SequencerBoard,
};
export default meta;
type Story = StoryObj<typeof SequencerBoard>;

/** Default sequencer board with 4 slots */
export const Default: Story = {
    args: {
        entity: BASE_ENTITY,
        categoryColors: CATEGORY_COLORS,
    },
};

/** Board with duplicates allowed */
export const AllowDuplicates: Story = {
    args: {
        entity: {
            ...BASE_ENTITY,
            id: 'puzzle-dup',
            title: 'Repeat Actions',
            description: 'Some actions can be used more than once.',
            allowDuplicates: true,
        },
        categoryColors: CATEGORY_COLORS,
    },
};

/** Board with multiple valid solutions */
export const MultipleSolutions: Story = {
    args: {
        entity: {
            ...BASE_ENTITY,
            id: 'puzzle-multi',
            title: 'Multiple Paths',
            description: 'There is more than one way through!',
            solutions: [
                ['walk', 'jump', 'sneak', 'walk'],
                ['walk', 'sneak', 'jump', 'walk'],
            ],
        },
        categoryColors: CATEGORY_COLORS,
    },
};

/** Minimal board with 2 slots */
export const TwoSlots: Story = {
    args: {
        entity: {
            ...BASE_ENTITY,
            id: 'puzzle-short',
            title: 'Quick Puzzle',
            description: 'Just two steps!',
            maxSlots: 2,
            solutions: [['walk', 'jump']],
        },
        categoryColors: CATEGORY_COLORS,
    },
};
