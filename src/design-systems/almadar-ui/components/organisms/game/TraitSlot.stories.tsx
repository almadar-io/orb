import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { TraitSlot, type SlotItemData } from './TraitSlot';
import { HStack, VStack } from '../../atoms/Stack';
import { Typography } from '../../atoms/Typography';
import { Box } from '../../atoms/Box';

const meta: Meta<typeof TraitSlot> = {
    title: 'Organisms/Game/TraitSlot',
    component: TraitSlot,
};
export default meta;
type Story = StoryObj<typeof TraitSlot>;

const walkAction: SlotItemData = {
    id: 'walk',
    name: 'Walk',
    category: 'movement',
    iconEmoji: '\uD83D\uDEB6',
    description: 'Move one tile forward',
    stateMachine: {
        name: 'Walk',
        states: ['ready', 'walking', 'done'],
        currentState: 'ready',
        transitions: [
            { from: 'ready', to: 'walking', event: 'START' },
            { from: 'walking', to: 'done', event: 'ARRIVED' },
        ],
        description: 'Kekec walks one tile forward',
    },
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

const KEKEC_COLORS: Record<string, { bg: string; border: string }> = {
    movement: { bg: 'rgba(59,130,246,0.2)', border: '#3b82f6' },
    stealth: { bg: 'rgba(168,85,247,0.2)', border: '#a855f7' },
    item: { bg: 'rgba(34,197,94,0.2)', border: '#22c55e' },
};

/** Empty slot */
export const Empty: Story = {
    args: { slotNumber: 1 },
};

/** Equipped slot with tooltip */
export const Equipped: Story = {
    args: {
        slotNumber: 1,
        equippedItem: walkAction,
        categoryColors: KEKEC_COLORS,
    },
};

/** Locked slot */
export const Locked: Story = {
    args: {
        slotNumber: 3,
        locked: true,
        lockLabel: 'Lv.5',
    },
};

/** Selected slot */
export const Selected: Story = {
    args: {
        slotNumber: 1,
        equippedItem: sneakAction,
        selected: true,
        categoryColors: KEKEC_COLORS,
    },
};

/** Size variants */
export const Sizes: Story = {
    render: () => (
        <HStack gap="md" className="items-end">
            <TraitSlot slotNumber={1} equippedItem={walkAction} size="sm" categoryColors={KEKEC_COLORS} />
            <TraitSlot slotNumber={2} equippedItem={sneakAction} size="md" categoryColors={KEKEC_COLORS} />
            <TraitSlot slotNumber={3} equippedItem={dropAction} size="lg" categoryColors={KEKEC_COLORS} />
        </HStack>
    ),
};

/** Interactive drag-and-drop demo */
export const DragAndDrop: Story = {
    render: function DragDropDemo() {
        const [slots, setSlots] = useState<Array<SlotItemData | undefined>>([
            undefined, undefined, undefined, undefined,
        ]);

        const palette: SlotItemData[] = [walkAction, sneakAction, dropAction];

        const handleDrop = (index: number) => (item: SlotItemData) => {
            setSlots(prev => {
                const next = [...prev];
                next[index] = item;
                return next;
            });
        };

        const handleRemove = (index: number) => () => {
            setSlots(prev => {
                const next = [...prev];
                next[index] = undefined;
                return next;
            });
        };

        const handlePaletteDragStart = (item: SlotItemData) => (e: React.DragEvent) => {
            e.dataTransfer.setData('application/x-almadar-slot-item', JSON.stringify(item));
            e.dataTransfer.effectAllowed = 'move';
        };

        return (
            <VStack gap="lg" className="p-4">
                <Typography variant="h5" className="text-foreground">
                    Drag actions into the slots:
                </Typography>

                {/* Palette */}
                <HStack gap="sm">
                    {palette.map(item => (
                        <Box
                            key={item.id}
                            display="flex"
                            className="items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card cursor-grab active:cursor-grabbing hover:bg-muted transition-colors"
                            draggable
                            onDragStart={handlePaletteDragStart(item)}
                        >
                            <Typography variant="body1">{item.iconEmoji}</Typography>
                            <Typography variant="body2" className="text-foreground">{item.name}</Typography>
                        </Box>
                    ))}
                </HStack>

                {/* Slots */}
                <HStack gap="sm">
                    {slots.map((slot, i) => (
                        <TraitSlot
                            key={i}
                            slotNumber={i + 1}
                            equippedItem={slot}
                            size="lg"
                            categoryColors={KEKEC_COLORS}
                            onItemDrop={handleDrop(i)}
                            onRemove={slot ? handleRemove(i) : undefined}
                            draggable
                        />
                    ))}
                </HStack>
            </VStack>
        );
    },
};
