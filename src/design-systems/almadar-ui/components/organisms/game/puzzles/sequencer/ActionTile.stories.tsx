import type { Meta, StoryObj } from '@storybook/react';
import { ActionTile } from './ActionTile';
import type { SlotItemData } from '../../TraitSlot';
import { HStack } from '../../../../atoms/Stack';

// =============================================================================
// Mock data
// =============================================================================

const walkAction: SlotItemData = {
    id: 'walk',
    name: 'Walk',
    category: 'movement',
    iconEmoji: '\uD83D\uDEB6',
    description: 'Move one tile forward',
};

const sneakAction: SlotItemData = {
    id: 'sneak',
    name: 'Sneak',
    category: 'stealth',
    iconEmoji: '\uD83E\uDD2B',
    description: 'Move silently past enemies',
};

const dropAction: SlotItemData = {
    id: 'drop',
    name: 'Drop Berries',
    category: 'item',
    iconEmoji: '\uD83E\uDED0',
    description: 'Place blueberries on the ground',
};

const CATEGORY_COLORS: Record<string, { bg: string; border: string }> = {
    movement: { bg: 'rgba(59,130,246,0.2)', border: '#3b82f6' },
    stealth: { bg: 'rgba(168,85,247,0.2)', border: '#a855f7' },
    item: { bg: 'rgba(34,197,94,0.2)', border: '#22c55e' },
};

// =============================================================================
// Stories
// =============================================================================

const meta: Meta<typeof ActionTile> = {
    title: 'Organisms/Game/Puzzles/ActionTile',
    component: ActionTile,
};
export default meta;
type Story = StoryObj<typeof ActionTile>;

/** Default action tile */
export const Default: Story = {
    args: {
        action: walkAction,
    },
};

/** With category colors */
export const WithCategoryColors: Story = {
    args: {
        action: walkAction,
        categoryColors: CATEGORY_COLORS,
    },
};

/** Disabled tile (already used) */
export const Disabled: Story = {
    args: {
        action: sneakAction,
        disabled: true,
        categoryColors: CATEGORY_COLORS,
    },
};

/** Size variants */
export const Sizes: Story = {
    render: () => (
        <HStack gap="md" className="items-end">
            <ActionTile action={walkAction} size="sm" categoryColors={CATEGORY_COLORS} />
            <ActionTile action={sneakAction} size="md" categoryColors={CATEGORY_COLORS} />
            <ActionTile action={dropAction} size="lg" categoryColors={CATEGORY_COLORS} />
        </HStack>
    ),
};

/** All categories */
export const AllCategories: Story = {
    render: () => (
        <HStack gap="md">
            <ActionTile action={walkAction} categoryColors={CATEGORY_COLORS} />
            <ActionTile action={sneakAction} categoryColors={CATEGORY_COLORS} />
            <ActionTile action={dropAction} categoryColors={CATEGORY_COLORS} />
        </HStack>
    ),
};
