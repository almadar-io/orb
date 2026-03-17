'use client';
/**
 * GameAudioToggle
 *
 * A small mute/unmute button for game HUDs.
 * Must be rendered inside a <GameAudioProvider> tree.
 *
 * Shows 🔊 when sound is on and 🔇 when muted.
 *
 * @packageDocumentation
 */

import React, { useCallback } from 'react';
import { Button } from '../../atoms';
import { cn } from '../../../lib/cn';
import { useGameAudioContext } from './GameAudioProvider';

// =============================================================================
// Props
// =============================================================================

export interface GameAudioToggleProps {
    /** Button size */
    size?: 'sm' | 'md' | 'lg';
    /** Additional CSS classes */
    className?: string;
    /** Loading state (passed through) */
    isLoading?: boolean;
    /** Error state (passed through) */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
}

// =============================================================================
// Component
// =============================================================================

// eslint-disable-next-line almadar/require-translate -- emoji only, no translatable text
export function GameAudioToggle({
    size = 'sm',
    className,
}: GameAudioToggleProps): React.JSX.Element {
    const { muted, setMuted } = useGameAudioContext();

    const handleToggle = useCallback(() => {
        setMuted(!muted);
    }, [muted, setMuted]);

    return (
        <Button
            variant="ghost"
            size={size}
            onClick={handleToggle}
            className={cn('text-lg leading-none px-2', className)}
            aria-pressed={muted}
        >
            {muted ? '\uD83D\uDD07' : '\uD83D\uDD0A'}
        </Button>
    );
}

GameAudioToggle.displayName = 'GameAudioToggle';

export default GameAudioToggle;
