'use client';
/**
 * useGameAudio Hook
 *
 * Manages HTMLAudioElement pools for low-latency, concurrent sound playback,
 * plus a dedicated music player with crossfade transitions.
 *
 * Two separate systems:
 *   SFX pool:    play(key)  — instant, concurrent, pooled instances
 *   Music player: playMusic(key) — crossfades between looping background tracks
 *
 * Autoplay policy:
 *   Browsers block audio until a user gesture. This hook registers a one-time
 *   listener (click/keydown/touchstart) that:
 *   - Starts all `autostart: true` SFX entries
 *   - Plays any pending music that was requested before unlock
 *
 * @packageDocumentation
 */

import { useRef, useState, useCallback, useEffect } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface SoundEntry {
    /** Single path or array of paths — array picks randomly on each play */
    path: string | string[];
    /** Volume 0–1 (multiplied by masterVolume; default 1) */
    volume?: number;
    /** Whether this sound loops (background music) */
    loop?: boolean;
    /** Number of concurrent Audio instances in the pool (default 1) */
    poolSize?: number;
    /** Start automatically on first user interaction */
    autostart?: boolean;
    /** Use crossfade transitions when played via playMusic() */
    crossfade?: boolean;
    /** Crossfade duration in ms (default 1500) */
    crossfadeDurationMs?: number;
}

export type AudioManifest = Record<string, SoundEntry>;

export interface GameAudioControls {
    /** Play a sound effect (instant, pooled) */
    play: (key: string) => void;
    /** Stop all instances of a sound effect */
    stop: (key: string) => void;
    /** Stop all sounds including music */
    stopAll: () => void;
    /** Crossfade to a new music track */
    playMusic: (key: string) => void;
    /** Fade out and stop the current music */
    stopMusic: (fadeDurationMs?: number) => void;
    muted: boolean;
    setMuted: (muted: boolean) => void;
    masterVolume: number;
    setMasterVolume: (volume: number) => void;
}

export interface UseGameAudioOptions {
    /** Sound definitions keyed by logical name */
    manifest: AudioManifest;
    /** Prefix prepended to all `path` values (default '') */
    baseUrl?: string;
    /** Start muted (default false) */
    initialMuted?: boolean;
    /** Master volume 0–1 (default 1) */
    initialVolume?: number;
}

// =============================================================================
// Internal helpers
// =============================================================================

type AudioPool = HTMLAudioElement[];

function pickPath(entry: SoundEntry): string {
    if (Array.isArray(entry.path)) {
        return entry.path[Math.floor(Math.random() * entry.path.length)];
    }
    return entry.path;
}

// =============================================================================
// Hook
// =============================================================================

export function useGameAudio({
    manifest,
    baseUrl = '',
    initialMuted = false,
    initialVolume = 1,
}: UseGameAudioOptions): GameAudioControls {
    const [muted, setMutedState] = useState(initialMuted);
    const [masterVolume, setMasterVolumeState] = useState(initialVolume);

    // Refs avoid stale closures in RAF / setTimeout / interval callbacks
    const mutedRef = useRef(muted);
    const volumeRef = useRef(masterVolume);
    const manifestRef = useRef(manifest);
    mutedRef.current = muted;
    volumeRef.current = masterVolume;
    manifestRef.current = manifest;

    // -------------------------------------------------------------------------
    // SFX pool
    // -------------------------------------------------------------------------

    const poolsRef = useRef(new Map<string, AudioPool>());

    const getOrCreateElement = useCallback((key: string): HTMLAudioElement | null => {
        const entry = manifestRef.current[key];
        if (!entry) return null;

        let pool = poolsRef.current.get(key);
        if (!pool) {
            pool = [];
            poolsRef.current.set(key, pool);
        }

        const maxSize = entry.poolSize ?? 1;

        // Prefer a finished/idle element
        for (const audio of pool) {
            if (audio.paused && (audio.ended || audio.currentTime === 0)) {
                return audio;
            }
        }

        // Create a new element if pool isn't at capacity
        if (pool.length < maxSize) {
            const src = baseUrl + pickPath(entry);
            const audio = new Audio(src);
            audio.loop = entry.loop ?? false;
            pool.push(audio);
            return audio;
        }

        // Pool full: for non-looping sounds, reuse the furthest-along one
        if (!entry.loop) {
            let oldest = pool[0];
            for (const audio of pool) {
                if (audio.currentTime > oldest.currentTime) {
                    oldest = audio;
                }
            }
            oldest.pause();
            oldest.currentTime = 0;
            return oldest;
        }

        // Looping sound already playing — don't interrupt
        return null;
    }, [baseUrl]);

    const play = useCallback((key: string) => {
        if (mutedRef.current) return;
        const entry = manifestRef.current[key];
        if (!entry) return;

        const audio = getOrCreateElement(key);
        if (!audio) return;

        audio.volume = Math.min(1, (entry.volume ?? 1) * volumeRef.current);
        if (!entry.loop) {
            audio.currentTime = 0;
        }

        const promise = audio.play();
        if (promise) {
            promise.catch(() => {
                // Autoplay blocked — silently ignored. The unlock mechanism
                // will start autostart sounds after the first user gesture.
            });
        }
    }, [getOrCreateElement]);

    const stop = useCallback((key: string) => {
        const pool = poolsRef.current.get(key);
        if (!pool) return;
        for (const audio of pool) {
            audio.pause();
            audio.currentTime = 0;
        }
    }, []);

    // -------------------------------------------------------------------------
    // Music player (crossfade)
    // -------------------------------------------------------------------------

    const currentMusicKeyRef = useRef<string | null>(null);
    const currentMusicElRef = useRef<HTMLAudioElement | null>(null);
    const musicFadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
    /** Music key requested before browser unlock — played on first gesture */
    const pendingMusicKeyRef = useRef<string | null>(null);

    const clearMusicFade = useCallback(() => {
        if (musicFadeRef.current) {
            clearInterval(musicFadeRef.current);
            musicFadeRef.current = null;
        }
    }, []);

    const playMusic = useCallback((key: string) => {
        if (key === currentMusicKeyRef.current) return;
        pendingMusicKeyRef.current = key;

        const entry = manifestRef.current[key];
        if (!entry) return;

        const fadeDurationMs = entry.crossfadeDurationMs ?? 1500;
        const stepMs = 50;
        const totalSteps = Math.max(1, fadeDurationMs / stepMs);
        const targetVolume = Math.min(1, (entry.volume ?? 1) * volumeRef.current);

        clearMusicFade();

        // Create new music element
        const src = baseUrl + (Array.isArray(entry.path) ? entry.path[0] : entry.path);
        const incoming = new Audio(src);
        incoming.loop = true;
        incoming.volume = 0;

        const outgoing = currentMusicElRef.current;
        const outgoingStartVol = outgoing?.volume ?? 0;

        currentMusicKeyRef.current = key;
        currentMusicElRef.current = incoming;

        if (!mutedRef.current) {
            incoming.play().catch(() => {
                // Blocked — will retry when user interacts (pendingMusicKeyRef is set)
                currentMusicKeyRef.current = null;
                currentMusicElRef.current = outgoing;
            });
        }

        let step = 0;
        musicFadeRef.current = setInterval(() => {
            step++;
            const progress = Math.min(step / totalSteps, 1);

            // Fade in incoming
            incoming.volume = Math.min(1, targetVolume * progress);

            // Fade out outgoing
            if (outgoing) {
                outgoing.volume = Math.max(0, outgoingStartVol * (1 - progress));
            }

            if (progress >= 1) {
                clearMusicFade();
                if (outgoing) {
                    outgoing.pause();
                    outgoing.src = '';
                }
            }
        }, stepMs);
    }, [baseUrl, clearMusicFade]);

    const stopMusic = useCallback((fadeDurationMs = 1000) => {
        const outgoing = currentMusicElRef.current;
        if (!outgoing) return;

        currentMusicKeyRef.current = null;
        currentMusicElRef.current = null;
        pendingMusicKeyRef.current = null;
        clearMusicFade();

        const startVolume = outgoing.volume;
        const stepMs = 50;
        const totalSteps = Math.max(1, fadeDurationMs / stepMs);
        let step = 0;

        musicFadeRef.current = setInterval(() => {
            step++;
            const progress = step / totalSteps;
            outgoing.volume = Math.max(0, startVolume * (1 - progress));
            if (progress >= 1) {
                clearMusicFade();
                outgoing.pause();
                outgoing.src = '';
            }
        }, stepMs);
    }, [clearMusicFade]);

    // -------------------------------------------------------------------------
    // Mute / volume controls
    // -------------------------------------------------------------------------

    const stopAll = useCallback(() => {
        for (const pool of poolsRef.current.values()) {
            for (const audio of pool) {
                audio.pause();
                audio.currentTime = 0;
            }
        }
        stopMusic(0);
    }, [stopMusic]);

    const setMuted = useCallback((value: boolean) => {
        setMutedState(value);
        if (value) {
            // Pause all looping SFX
            for (const [key, pool] of poolsRef.current.entries()) {
                if (manifestRef.current[key]?.loop) {
                    for (const audio of pool) {
                        if (!audio.paused) audio.pause();
                    }
                }
            }
            // Pause music
            currentMusicElRef.current?.pause();
        } else {
            // Resume looping autostart SFX
            for (const [key, pool] of poolsRef.current.entries()) {
                const entry = manifestRef.current[key];
                if (entry?.loop && entry?.autostart) {
                    for (const audio of pool) {
                        if (audio.paused) audio.play().catch(() => {});
                    }
                }
            }
            // Resume music
            const musicEl = currentMusicElRef.current;
            if (musicEl) {
                musicEl.play().catch(() => {});
            }
        }
    }, []);

    const setMasterVolume = useCallback((volume: number) => {
        const clamped = Math.max(0, Math.min(1, volume));
        setMasterVolumeState(clamped);
        // Update all SFX elements
        for (const [key, pool] of poolsRef.current.entries()) {
            const entryVol = manifestRef.current[key]?.volume ?? 1;
            for (const audio of pool) {
                audio.volume = Math.min(1, entryVol * clamped);
            }
        }
        // Update music element (only if not mid-fade)
        if (!musicFadeRef.current && currentMusicElRef.current) {
            const key = currentMusicKeyRef.current;
            const entryVol = key ? (manifestRef.current[key]?.volume ?? 1) : 1;
            currentMusicElRef.current.volume = Math.min(1, entryVol * clamped);
        }
    }, []);

    // -------------------------------------------------------------------------
    // Autoplay unlock (first user gesture)
    // -------------------------------------------------------------------------

    const unlockedRef = useRef(false);

    useEffect(() => {
        const autoKeys = Object.keys(manifest).filter(k => manifest[k].autostart);
        const hasPendingMusic = () => pendingMusicKeyRef.current !== null;
        const hasAutoStart = autoKeys.length > 0;

        if (!hasAutoStart && !hasPendingMusic()) return;

        const unlock = () => {
            if (unlockedRef.current) return;
            unlockedRef.current = true;

            if (!mutedRef.current) {
                // Play autostart SFX
                for (const key of autoKeys) {
                    play(key);
                }
                // Play pending music (requested before unlock)
                const pending = pendingMusicKeyRef.current;
                if (pending && pending !== currentMusicKeyRef.current) {
                    playMusic(pending);
                }
            }
        };

        document.addEventListener('click', unlock, { once: true });
        document.addEventListener('keydown', unlock, { once: true });
        document.addEventListener('touchstart', unlock, { once: true });

        return () => {
            document.removeEventListener('click', unlock);
            document.removeEventListener('keydown', unlock);
            document.removeEventListener('touchstart', unlock);
        };
    }, [manifest, play, playMusic]);

    // -------------------------------------------------------------------------
    // Cleanup on unmount
    // -------------------------------------------------------------------------

    useEffect(() => {
        return () => {
            clearMusicFade();
            for (const pool of poolsRef.current.values()) {
                for (const audio of pool) {
                    audio.pause();
                    audio.src = '';
                }
            }
            poolsRef.current.clear();
            if (currentMusicElRef.current) {
                currentMusicElRef.current.pause();
                currentMusicElRef.current.src = '';
                currentMusicElRef.current = null;
            }
        };
    }, [clearMusicFade]);

    return {
        play, stop, stopAll,
        playMusic, stopMusic,
        muted, setMuted,
        masterVolume, setMasterVolume,
    };
}

useGameAudio.displayName = 'useGameAudio';
