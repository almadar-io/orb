// eslint-disable-next-line almadar/require-translate -- storybook-only, not a shipped component
import type { Meta, StoryObj } from '@storybook/react';
import { NegotiatorBoard, type NegotiatorPuzzleEntity } from './NegotiatorBoard';

const meta: Meta<typeof NegotiatorBoard> = {
    title: 'Organisms/Game/Puzzles/NegotiatorBoard',
    component: NegotiatorBoard,
};
export default meta;
type Story = StoryObj<typeof NegotiatorBoard>;

const prisonersDilemma: NegotiatorPuzzleEntity = {
    id: 'prisoners-dilemma',
    title: 'The Prisoner\'s Dilemma',
    description: 'Two suspects are interrogated separately. Will you cooperate or betray?',
    actions: [
        { id: 'cooperate', label: 'Cooperate', description: 'Stay silent' },
        { id: 'defect', label: 'Defect', description: 'Betray the other' },
    ],
    payoffMatrix: [
        { playerAction: 'cooperate', opponentAction: 'cooperate', playerPayoff: 3, opponentPayoff: 3 },
        { playerAction: 'cooperate', opponentAction: 'defect', playerPayoff: 0, opponentPayoff: 5 },
        { playerAction: 'defect', opponentAction: 'cooperate', playerPayoff: 5, opponentPayoff: 0 },
        { playerAction: 'defect', opponentAction: 'defect', playerPayoff: 1, opponentPayoff: 1 },
    ],
    totalRounds: 5,
    opponentStrategy: 'tit-for-tat',
    targetScore: 12,
    successMessage: 'Well done! You found a cooperative strategy.',
    failMessage: 'Try again -- cooperation often leads to better outcomes.',
    hint: 'Notice how the opponent mirrors your previous choice.',
};

export const Default: Story = {
    args: {
        entity: prisonersDilemma,
    },
};

export const AlwaysCooperate: Story = {
    args: {
        entity: {
            ...prisonersDilemma,
            opponentStrategy: 'always-cooperate',
            title: 'Friendly Opponent',
            description: 'This opponent always cooperates. Can you exploit that?',
        },
    },
};

export const ThreeActions: Story = {
    args: {
        entity: {
            ...prisonersDilemma,
            title: 'Three-Way Trade',
            description: 'Choose between trading, hoarding, or sharing.',
            actions: [
                { id: 'trade', label: 'Trade', description: 'Exchange goods' },
                { id: 'hoard', label: 'Hoard', description: 'Keep everything' },
                { id: 'share', label: 'Share', description: 'Give freely' },
            ],
            payoffMatrix: [
                { playerAction: 'trade', opponentAction: 'trade', playerPayoff: 4, opponentPayoff: 4 },
                { playerAction: 'trade', opponentAction: 'hoard', playerPayoff: 1, opponentPayoff: 5 },
                { playerAction: 'trade', opponentAction: 'share', playerPayoff: 5, opponentPayoff: 3 },
                { playerAction: 'hoard', opponentAction: 'trade', playerPayoff: 5, opponentPayoff: 1 },
                { playerAction: 'hoard', opponentAction: 'hoard', playerPayoff: 2, opponentPayoff: 2 },
                { playerAction: 'hoard', opponentAction: 'share', playerPayoff: 6, opponentPayoff: 0 },
                { playerAction: 'share', opponentAction: 'trade', playerPayoff: 3, opponentPayoff: 5 },
                { playerAction: 'share', opponentAction: 'hoard', playerPayoff: 0, opponentPayoff: 6 },
                { playerAction: 'share', opponentAction: 'share', playerPayoff: 4, opponentPayoff: 4 },
            ],
            opponentStrategy: 'random',
            totalRounds: 4,
            targetScore: 14,
        },
    },
};
