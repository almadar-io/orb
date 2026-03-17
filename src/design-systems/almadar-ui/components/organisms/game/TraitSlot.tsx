'use client';
/**
 * TraitSlot Component
 *
 * A generic equippable slot with drag-and-drop support.
 * Shows a TraitStateViewer tooltip on hover for equipped items.
 * Used across game tiers:
 * - Sequencer (5-8): action slots in the sequence bar
 * - Event Handler (9-12): rule slots on world objects
 * - State Architect (13+): transition slots on state nodes
 *
 * **State categories (closed-circuit compliant):**
 * - Data (equippedItem, slotNumber, locked, selected, feedback) → received via props
 * - UI-transient (isHovered, isDragOver) → local only
 * - Events → emitted via `useEventBus()` (click, remove)
 *
 * Local state is hover/drag-over detection only — rendering-only concerns.
 *
 * @packageDocumentation
 */

import React, { useState, useRef, useCallback } from 'react';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';
import { Box } from '../../atoms/Box';
import { Typography } from '../../atoms/Typography';
import { TraitStateViewer, type TraitStateMachineDefinition } from './TraitStateViewer';

// =============================================================================
// Types
// =============================================================================

/** Data shape for a slot's equipped item */
export interface SlotItemData {
    id: string;
    name: string;
    category: string;
    description?: string;
    /** Emoji or text icon */
    iconEmoji?: string;
    /** Image URL icon (takes precedence over iconEmoji) */
    iconUrl?: string;
    /** Optional state machine for tooltip display */
    stateMachine?: TraitStateMachineDefinition;
}

export interface TraitSlotProps {
    /** Slot index (1-based) */
    slotNumber: number;
    /** Currently equipped item, if any */
    equippedItem?: SlotItemData;
    /** Whether slot is locked */
    locked?: boolean;
    /** Label shown when locked */
    lockLabel?: string;
    /** Whether slot is selected */
    selected?: boolean;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Show tooltip on hover */
    showTooltip?: boolean;
    /** Category → color mapping */
    categoryColors?: Record<string, { bg: string; border: string }>;
    /** Optional tooltip frame image URL */
    tooltipFrameUrl?: string;
    /** Additional CSS classes */
    className?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;

    // -- Drag and drop --
    /** Called when an item is dropped on this slot */
    onItemDrop?: (item: SlotItemData) => void;
    /** Whether this slot's equipped item is draggable */
    draggable?: boolean;
    /** Called when drag starts from this slot */
    onDragStart?: (item: SlotItemData) => void;

    /** Per-slot correctness feedback after a failed attempt */
    feedback?: 'correct' | 'wrong' | null;

    // -- Callbacks --
    /** Click handler */
    onClick?: () => void;
    /** Remove handler */
    onRemove?: () => void;

    // -- Declarative events --
    /** Emits UI:{clickEvent} with { slotNumber } */
    clickEvent?: string;
    /** Emits UI:{removeEvent} with { slotNumber } */
    removeEvent?: string;
}

// =============================================================================
// Constants
// =============================================================================

const SIZE_CONFIG = {
    sm: { box: 40, icon: 20, font: 'text-xs' as const },
    md: { box: 56, icon: 28, font: 'text-sm' as const },
    lg: { box: 72, icon: 40, font: 'text-base' as const },
};

/** MIME type for drag-and-drop data transfer */
const DRAG_MIME = 'application/x-almadar-slot-item';

// =============================================================================
// Component
// =============================================================================

// eslint-disable-next-line almadar/require-translate -- no translatable text, all content is data-driven
export function TraitSlot({
    slotNumber,
    equippedItem,
    locked = false,
    lockLabel,
    selected = false,
    size = 'md',
    showTooltip = true,
    categoryColors,
    tooltipFrameUrl,
    className,
    feedback,
    onItemDrop,
    draggable = false,
    onDragStart,
    onClick,
    onRemove,
    clickEvent,
    removeEvent,
}: TraitSlotProps): React.JSX.Element {
    const { emit } = useEventBus();
    const [isHovered, setIsHovered] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const slotRef = useRef<HTMLDivElement>(null);
    const config = SIZE_CONFIG[size];
    const isEmpty = !equippedItem;

    const catColor = equippedItem && categoryColors
        ? categoryColors[equippedItem.category]
        : null;

    // -- Click handlers -------------------------------------------------------

    const handleClick = useCallback(() => {
        if (locked) return;
        if (clickEvent) {
            emit(`UI:${clickEvent}`, { slotNumber });
        } else {
            onClick?.();
        }
    }, [locked, clickEvent, slotNumber, emit, onClick]);

    const handleRemove = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (removeEvent) {
            emit(`UI:${removeEvent}`, { slotNumber });
        } else {
            onRemove?.();
        }
    }, [removeEvent, slotNumber, emit, onRemove]);

    // -- Drag handlers (source — dragging OUT of this slot) -------------------

    const handleDragStart = useCallback((e: React.DragEvent) => {
        if (!equippedItem || !draggable) return;
        e.dataTransfer.setData(DRAG_MIME, JSON.stringify(equippedItem));
        e.dataTransfer.effectAllowed = 'move';
        onDragStart?.(equippedItem);
    }, [equippedItem, draggable, onDragStart]);

    // -- Drop handlers (target — dropping INTO this slot) ---------------------

    const handleDragOver = useCallback((e: React.DragEvent) => {
        if (locked || !onItemDrop) return;
        if (e.dataTransfer.types.includes(DRAG_MIME)) {
            e.preventDefault();
            // Let the browser pick a compatible dropEffect based on the source's effectAllowed
            // (ActionTile uses 'copy', TraitSlot-to-TraitSlot uses 'move')
            const allowed = e.dataTransfer.effectAllowed;
            e.dataTransfer.dropEffect = allowed === 'copy' ? 'copy' : 'move';
            setIsDragOver(true);
        }
    }, [locked, onItemDrop]);

    const handleDragLeave = useCallback(() => {
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (locked || !onItemDrop) return;
        const raw = e.dataTransfer.getData(DRAG_MIME);
        if (!raw) return;
        try {
            const item = JSON.parse(raw) as SlotItemData;
            onItemDrop(item);
        } catch {
            // ignore malformed data
        }
    }, [locked, onItemDrop]);

    // -- Tooltip position -----------------------------------------------------

    const getTooltipStyle = (): React.CSSProperties => {
        if (!slotRef.current) return {};
        const rect = slotRef.current.getBoundingClientRect();
        return {
            position: 'fixed' as const,
            left: rect.left + rect.width / 2,
            top: rect.top - 8,
            transform: 'translate(-50%, -100%)',
            zIndex: 9999,
        };
    };

    // -- Default state machine for tooltip ------------------------------------

    const itemMachine: TraitStateMachineDefinition | null = equippedItem?.stateMachine || (equippedItem ? {
        name: equippedItem.name,
        states: ['idle', 'active', 'done'],
        currentState: 'idle',
        transitions: [
            { from: 'idle', to: 'active', event: 'ACTIVATE' },
            { from: 'active', to: 'done', event: 'COMPLETE' },
        ],
        description: equippedItem.description,
    } : null);

    return (
        <Box
            ref={slotRef}
            display="flex"
            position="relative"
            className={cn(
                'items-center justify-center rounded-lg transition-all duration-200',
                !locked && 'cursor-pointer',
                locked && 'cursor-not-allowed opacity-50',
                isEmpty && !locked && 'border-2 border-dashed border-border hover:border-muted-foreground',
                isEmpty && locked && 'border-2 border-dashed border-border',
                !isEmpty && 'border-2',
                selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                isDragOver && 'ring-2 ring-accent ring-offset-1 scale-110 border-accent',
                !isDragOver && feedback === 'correct' && 'ring-2 ring-success ring-offset-1 ring-offset-background',
                !isDragOver && feedback === 'wrong' && 'ring-2 ring-error ring-offset-1 ring-offset-background',
                !locked && !isDragOver && 'hover:scale-105',
                className,
            )}
            style={{
                width: config.box,
                height: config.box,
                backgroundColor: catColor?.bg || 'rgba(30,41,59,0.5)',
                borderColor: isDragOver
                    ? undefined
                    : feedback === 'correct'
                        ? 'var(--color-success)'
                        : feedback === 'wrong'
                            ? 'var(--color-error)'
                            : (catColor?.border || undefined),
            }}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            draggable={draggable && !isEmpty}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {locked ? (
                <Box className="text-center">
                    <Typography variant="caption" className="text-muted-foreground">
                        {'\uD83D\uDD12'}
                    </Typography>
                    {lockLabel && (
                        <Typography variant="caption" className="text-muted-foreground block text-xs">
                            {lockLabel}
                        </Typography>
                    )}
                </Box>
            ) : isEmpty ? (
                <Typography variant="caption" className="text-muted-foreground text-lg">
                    +
                </Typography>
            ) : (
                <>
                    {/* Icon */}
                    {equippedItem.iconUrl ? (
                        <Box
                            as="img"
                            className="object-contain"
                            style={{ width: config.icon, height: config.icon }}
                            {...{ src: equippedItem.iconUrl, alt: equippedItem.name }}
                        />
                    ) : (
                        <Typography variant="body1" className="text-center leading-none" style={{ fontSize: config.icon }}>
                            {equippedItem.iconEmoji || '\u2726'}
                        </Typography>
                    )}

                    {/* Remove button */}
                    {(onRemove || removeEvent) && (
                        <Box
                            position="absolute"
                            className="-top-1.5 -right-1.5 w-4 h-4 bg-error rounded-full flex items-center justify-center cursor-pointer hover:bg-error/80 transition-colors"
                            onClick={handleRemove}
                        >
                            <Typography variant="caption" className="text-foreground text-xs leading-none">
                                {'\u00D7'}
                            </Typography>
                        </Box>
                    )}
                </>
            )}

            {/* Slot number */}
            <Box
                position="absolute"
                className="-bottom-1 -left-1 w-4 h-4 bg-card rounded-full flex items-center justify-center border border-border"
            >
                <Typography variant="caption" className="text-muted-foreground text-xs">
                    {slotNumber}
                </Typography>
            </Box>

            {/* Tooltip */}
            {showTooltip && isHovered && itemMachine && !isEmpty && equippedItem && (
                <Box
                    className="p-3 bg-background border border-border rounded-lg shadow-xl"
                    style={{
                        ...getTooltipStyle(),
                        minWidth: 200,
                        ...(tooltipFrameUrl ? {
                            borderImage: `url(${tooltipFrameUrl}) 60 fill / 15px / 0 stretch`,
                            border: 'none',
                        } : {}),
                    }}
                >
                    <Typography variant="h6" className="text-foreground mb-2 text-center">
                        {equippedItem.name}
                    </Typography>
                    {equippedItem.description && (
                        <Typography variant="caption" className="text-muted-foreground block mb-2 text-center">
                            {equippedItem.description}
                        </Typography>
                    )}
                    <TraitStateViewer trait={itemMachine} variant="compact" size="sm" />
                    {/* Arrow */}
                    <Box
                        position="absolute"
                        className="-bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-border"
                    />
                </Box>
            )}
        </Box>
    );
}

TraitSlot.displayName = 'TraitSlot';

export default TraitSlot;
