'use client';
/**
 * useCanvasEffects Hook
 *
 * Manages canvas effect state (particles, sequences, overlays) and provides:
 * - `effectSpriteUrls` for preloading via useImageCache
 * - `spawnEffect(type, screenX, screenY)` to trigger effects at screen positions
 * - `drawEffects(ctx, animTime, getImage)` callback for the canvas draw loop
 * - `hasActiveEffects` to keep RAF alive while effects are rendering
 * - `screenShake` offset to apply to camera
 * - `screenFlash` color/alpha for DOM overlay
 *
 * Generalized from trait-wars: accepts EffectAssetManifest instead of
 * TraitWarsAssetManifest, and uses screen-space coordinates directly.
 */

import { useRef, useMemo, useCallback, useState } from 'react';
import type { CanvasEffectState, CombatActionType, EffectAssetManifest } from './types/effects';
import { EMPTY_EFFECT_STATE } from './types/effects';
import {
    spawnParticles,
    spawnSequence,
    spawnOverlay,
    updateEffectState,
    drawEffectState,
    hasActiveEffects as checkActive,
    getAllEffectSpriteUrls,
} from './utils/canvasEffects';
import { createCombatPresets } from './utils/combatPresets';

export interface UseCanvasEffectsOptions {
    /** Effect asset manifest (baseUrl + particles + animations) */
    manifest: EffectAssetManifest;
}

export interface UseCanvasEffectsResult {
    /** All effect sprite URLs for preloading via useImageCache */
    effectSpriteUrls: string[];
    /** Spawn a combat effect at the given screen position */
    spawnEffect: (type: CombatActionType, screenX: number, screenY: number) => void;
    /** Draw all active effects — call inside draw() after units, before ctx.restore() */
    drawEffects: (ctx: CanvasRenderingContext2D, animTime: number, getImage: (url: string) => HTMLImageElement | undefined) => void;
    /** Whether there are active effects (keeps RAF alive) */
    hasActiveEffects: boolean;
    /** Screen shake offset to apply to container transform */
    screenShake: { x: number; y: number };
    /** Screen flash overlay (null = no flash) */
    screenFlash: { color: string; alpha: number } | null;
}

export function useCanvasEffects({
    manifest,
}: UseCanvasEffectsOptions): UseCanvasEffectsResult {
    // Effect state stored in ref to avoid re-renders per frame
    const stateRef = useRef<CanvasEffectState>({ ...EMPTY_EFFECT_STATE });
    const lastTimeRef = useRef<number>(0);
    const shakeRef = useRef<{ x: number; y: number; intensity: number }>({ x: 0, y: 0, intensity: 0 });

    // Track active state in React state (updated when effects spawn/expire)
    const [active, setActive] = useState(false);
    const [screenShake, setScreenShake] = useState({ x: 0, y: 0 });
    const [screenFlash, setScreenFlash] = useState<{ color: string; alpha: number } | null>(null);

    // Precompute all effect sprite URLs for preloading
    const effectSpriteUrls = useMemo(
        () => getAllEffectSpriteUrls(manifest),
        [manifest],
    );

    // Build preset factories (memoized per manifest)
    const presets = useMemo(
        () => createCombatPresets(manifest),
        [manifest],
    );

    // Spawn a combat effect at a screen position
    const spawnEffect = useCallback((type: CombatActionType, screenX: number, screenY: number) => {
        const now = performance.now();
        const preset = presets[type](screenX, screenY);
        const state = stateRef.current;

        // Spawn particles
        for (const emitter of preset.particles) {
            state.particles.push(...spawnParticles(emitter, now));
        }

        // Spawn sequences
        for (const seqConfig of preset.sequences) {
            state.sequences.push(spawnSequence(seqConfig, now));
        }

        // Spawn overlays
        for (const ovConfig of preset.overlays) {
            state.overlays.push(spawnOverlay(ovConfig, now));
        }

        // Screen shake
        if (preset.screenShake > 0) {
            shakeRef.current.intensity = preset.screenShake;
        }

        // Screen flash
        if (preset.screenFlash) {
            const { r, g, b, duration } = preset.screenFlash;
            setScreenFlash({ color: `rgb(${r}, ${g}, ${b})`, alpha: 0.3 });
            setTimeout(() => setScreenFlash(null), duration);
        }

        setActive(true);
    }, [presets]);

    // Draw callback — called from canvas draw() after units
    const drawEffects = useCallback((
        ctx: CanvasRenderingContext2D,
        animTime: number,
        getImage: (url: string) => HTMLImageElement | undefined,
    ) => {
        // Calculate delta
        const delta = lastTimeRef.current > 0 ? animTime - lastTimeRef.current : 16;
        lastTimeRef.current = animTime;

        // Update physics
        stateRef.current = updateEffectState(stateRef.current, animTime, delta);

        // Update screen shake
        if (shakeRef.current.intensity > 0.2) {
            const i = shakeRef.current.intensity;
            shakeRef.current.x = (Math.random() - 0.5) * i * 2;
            shakeRef.current.y = (Math.random() - 0.5) * i * 2;
            shakeRef.current.intensity *= 0.85; // exponential decay
            setScreenShake({ x: shakeRef.current.x, y: shakeRef.current.y });
        } else if (shakeRef.current.intensity > 0) {
            shakeRef.current = { x: 0, y: 0, intensity: 0 };
            setScreenShake({ x: 0, y: 0 });
        }

        // Draw effects
        drawEffectState(ctx, stateRef.current, animTime, getImage);

        // Update active state
        const isActive = checkActive(stateRef.current);
        if (!isActive && active) {
            setActive(false);
        }
    }, [active]);

    return {
        effectSpriteUrls,
        spawnEffect,
        drawEffects,
        hasActiveEffects: active,
        screenShake,
        screenFlash,
    };
}
