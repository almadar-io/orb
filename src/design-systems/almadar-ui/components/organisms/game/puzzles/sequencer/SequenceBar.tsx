/**
 * SequenceBar Component
 *
 * A row of TraitSlot components forming the action sequence for the
 * Sequencer tier (ages 5-8). Kids drag ActionTiles from the palette
 * into these slots to build their sequence.
 *
 * @packageDocumentation
 */

import React, { useCallback } from 'react';
import { HStack, Typography } from '../../../../atoms';
import { cn } from '../../../../../lib/cn';
import { TraitSlot } from '../../TraitSlot';
import type { SlotItemData } from '../../TraitSlot';

export interface SequenceBarProps {
    /** The current sequence (sparse — undefined means empty slot) */
    slots: Array<SlotItemData | undefined>;
    /** Max number of slots */
    maxSlots: number;
    /** Called when an item is dropped into slot at index */
    onSlotDrop: (index: number, item: SlotItemData) => void;
    /** Called when a slot is cleared */
    onSlotRemove: (index: number) => void;
    /** Whether the sequence is currently playing (disable interaction) */
    playing?: boolean;
    /** Current step index during playback (-1 = not playing) */
    currentStep?: number;
    /** Category → color mapping */
    categoryColors?: Record<string, { bg: string; border: string }>;
    /** Per-slot correctness feedback shown after a failed attempt */
    slotFeedback?: Array<'correct' | 'wrong' | null>;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Additional CSS classes */
    className?: string;
}

export function SequenceBar({
    slots,
    maxSlots,
    onSlotDrop,
    onSlotRemove,
    playing = false,
    currentStep = -1,
    categoryColors,
    slotFeedback,
    size = 'lg',
    className,
}: SequenceBarProps): React.JSX.Element {
    const handleDrop = useCallback((index: number) => (item: SlotItemData) => {
        if (playing) return;
        onSlotDrop(index, item);
    }, [onSlotDrop, playing]);

    const handleRemove = useCallback((index: number) => () => {
        if (playing) return;
        onSlotRemove(index);
    }, [onSlotRemove, playing]);

    // Pad slots to maxSlots
    const paddedSlots = Array.from({ length: maxSlots }, (_, i) => slots[i]);

    return (
        <HStack className={cn('items-center', className)} gap="sm">
            {paddedSlots.map((slot, i) => (
                <React.Fragment key={i}>
                    {i > 0 && (
                        <Typography
                            variant="body1"
                            className={cn(
                                'text-lg',
                                currentStep >= 0 && i <= currentStep ? 'text-primary' : 'text-muted-foreground',
                            )}
                        >
                            {'\u2192'}
                        </Typography>
                    )}
                    <TraitSlot
                        slotNumber={i + 1}
                        equippedItem={slot}
                        size={size}
                        categoryColors={categoryColors}
                        onItemDrop={handleDrop(i)}
                        onRemove={slot ? handleRemove(i) : undefined}
                        draggable={!playing && !!slot}
                        selected={currentStep === i}
                        locked={playing}
                        feedback={slotFeedback?.[i]}
                    />
                </React.Fragment>
            ))}
        </HStack>
    );
}

SequenceBar.displayName = 'SequenceBar';

export default SequenceBar;
