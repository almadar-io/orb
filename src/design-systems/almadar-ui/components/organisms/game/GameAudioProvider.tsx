'use client';
/**
 * GameAudioProvider
 *
 * Context provider that wires the audio system to the Almadar event bus.
 * Wrap your game organism with this provider, then emit:
 *
 *   emit('UI:PLAY_SOUND', { key: 'footstep' })
 *
 * from anywhere inside the tree and the corresponding sound will play.
 *
 * The provider also exposes `muted`/`setMuted` and `masterVolume`/
 * `setMasterVolume` via the `GameAudioContext` for toggle buttons.
 *
 * Closed-circuit props (`className`, `isLoading`, `error`, `entity`) are
 * accepted but intentionally unused — the provider renders only its children.
 *
 * @packageDocumentation
 */

import React, { createContext, useContext, useEffect } from 'react';
import { useEventBus } from '../../../hooks/useEventBus';
import { useGameAudio, type AudioManifest, type GameAudioControls } from './hooks/useGameAudio';

// =============================================================================
// Context
// =============================================================================

export type GameAudioContextValue = Pick<GameAudioControls,
    'muted' | 'setMuted' | 'masterVolume' | 'setMasterVolume' | 'play' | 'playMusic' | 'stopMusic'
>;

// eslint-disable-next-line almadar/require-translate -- createContext is not a React component, no translatable text
export const GameAudioContext = createContext<GameAudioContextValue | null>(null);
GameAudioContext.displayName = 'GameAudioContext';

/**
 * Access the game audio context.
 * Must be called from within a `<GameAudioProvider>` tree.
 */
export function useGameAudioContext(): GameAudioContextValue {
    const ctx = useContext(GameAudioContext);
    if (!ctx) {
        throw new Error('useGameAudioContext must be used inside <GameAudioProvider>');
    }
    return ctx;
}

// =============================================================================
// Props
// =============================================================================

export interface GameAudioProviderProps {
    /** Sound manifest — keys mapped to SoundEntry definitions */
    manifest: AudioManifest;
    /** Base URL prepended to all sound paths (default '') */
    baseUrl?: string;
    /** Children to render */
    children: React.ReactNode;
    /** Initial muted state */
    initialMuted?: boolean;
    /** Closed-circuit props (unused, accepted for runtime compatibility) */
    className?: string;
    isLoading?: boolean;
    error?: Error | null;
    entity?: string;
}

// =============================================================================
// Component
// =============================================================================

export function GameAudioProvider({
    manifest,
    baseUrl = '',
    children,
    initialMuted = false,
}: GameAudioProviderProps): React.JSX.Element {
    const eventBus = useEventBus();
    const { play, stop, stopAll, playMusic, stopMusic, muted, setMuted, masterVolume, setMasterVolume } =
        useGameAudio({ manifest, baseUrl, initialMuted });

    // Listen to events emitted from anywhere in the tree
    useEffect(() => {
        const unsubPlay = eventBus.on('UI:PLAY_SOUND', (event) => {
            const key = event.payload?.key as string | undefined;
            if (key) play(key);
        });

        const unsubStop = eventBus.on('UI:STOP_SOUND', (event) => {
            const key = event.payload?.key as string | undefined;
            if (key) {
                stop(key);
            } else {
                stopAll();
            }
        });

        const unsubChangeMusic = eventBus.on('UI:CHANGE_MUSIC', (event) => {
            const key = event.payload?.key as string | undefined;
            if (key) {
                playMusic(key);
            } else {
                stopMusic();
            }
        });

        const unsubStopMusic = eventBus.on('UI:STOP_MUSIC', () => {
            stopMusic();
        });

        return () => {
            unsubPlay();
            unsubStop();
            unsubChangeMusic();
            unsubStopMusic();
        };
    }, [eventBus, play, stop, stopAll, playMusic, stopMusic]);

    const value: GameAudioContextValue = { muted, setMuted, masterVolume, setMasterVolume, play, playMusic, stopMusic };

    return (
        <GameAudioContext.Provider value={value}>
            {children}
        </GameAudioContext.Provider>
    );
}

GameAudioProvider.displayName = 'GameAudioProvider';

export default GameAudioProvider;
