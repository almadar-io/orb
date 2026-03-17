/**
 * ActionPalette Component
 *
 * Grid of draggable ActionTile components for the Sequencer tier.
 * Kids pick from these to build their sequence.
 *
 * @packageDocumentation
 */

import React from 'react';
import { HStack, Typography, VStack } from '../../../../atoms';
import { cn } from '../../../../../lib/cn';
import { useTranslate } from '../../../../../hooks/useTranslate';
import type { SlotItemData } from '../../TraitSlot';
import { ActionTile } from './ActionTile';

export interface ActionPaletteProps {
    /** Available actions */
    actions: SlotItemData[];
    /** IDs of actions that are already used (shown as disabled) */
    usedActionIds?: string[];
    /** Whether each action can be used multiple times */
    allowDuplicates?: boolean;
    /** Category → color mapping */
    categoryColors?: Record<string, { bg: string; border: string }>;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Label above the palette */
    label?: string;
    /** Additional CSS classes */
    className?: string;
}

export function ActionPalette({
    actions,
    usedActionIds = [],
    allowDuplicates = true,
    categoryColors,
    size = 'md',
    label,
    className,
}: ActionPaletteProps): React.JSX.Element {
    const { t } = useTranslate();

    return (
        <VStack className={cn('p-3 rounded-lg bg-card border border-border', className)} gap="sm">
            <Typography variant="body2" className="text-muted-foreground font-medium">
                {label ?? t('sequencer.actions')}
            </Typography>
            <HStack className="flex-wrap" gap="sm">
                {actions.map(action => (
                    <ActionTile
                        key={action.id}
                        action={action}
                        size={size}
                        categoryColors={categoryColors}
                        disabled={!allowDuplicates && usedActionIds.includes(action.id)}
                    />
                ))}
            </HStack>
        </VStack>
    );
}

ActionPalette.displayName = 'ActionPalette';

export default ActionPalette;
