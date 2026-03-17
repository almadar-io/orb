'use client';
/**
 * useSpriteAnimations Hook
 *
 * Manages per-unit sprite sheet animation state for the canvas draw loop.
 * Follows the useCanvasEffects pattern: mutable state in refs, pure functions
 * in utils, no re-renders per frame.
 *
 * Project-agnostic: accepts generic sprite sheet resolution callbacks
 * rather than a project-specific asset manifest.
 *
 * @packageDocumentation
 */

import { useCallback, useRef } from 'react';
import type { IsometricUnit } from '../types/isometric';
import type {
    AnimationName,
    FacingDirection,
    ResolvedFrame,
    UnitAnimationState,
    SpriteFrameDims,
    SpriteSheetUrls,
} from '../types/spriteAnimation';
import {
    createUnitAnimationState,
    inferDirection,
    transitionAnimation,
    tickAnimationState,
    resolveFrame,
} from '../utils/spriteAnimation';

export interface UseSpriteAnimationsResult {
    /**
     * Sync unit list and advance all animation timers.
     * Call once per animation frame. Auto-detects movement
     * and infers direction from position deltas.
     */
    syncUnits: (units: IsometricUnit[], deltaMs: number) => void;

    /**
     * Explicitly set a unit's animation (for combat: attack, hit, death).
     * Optionally override direction.
     */
    setUnitAnimation: (unitId: string, animation: AnimationName, direction?: FacingDirection) => void;

    /**
     * Resolve the current frame for a unit. Returns null if no sprite sheet
     * is available for this unit (falls back to static sprite in canvas).
     * Pass this to IsometricCanvas.resolveUnitFrame.
     */
    resolveUnitFrame: (unitId: string) => ResolvedFrame | null;
}

export interface UseSpriteAnimationsOptions {
    /** Playback speed multiplier. 1.0 = baseline, 2.0 = double speed. Default: 1. */
    speed?: number;
}

/**
 * Resolve sprite sheet URLs for a unit. Return null if no sheet available.
 * This is the project-agnostic callback version — projects pass manifest-specific logic.
 */
export type SheetUrlResolver = (unit: IsometricUnit) => SpriteSheetUrls | null;

/**
 * Resolve frame dimensions for a unit's sprite sheet.
 * Projects pass manifest-specific logic.
 */
export type FrameDimsResolver = (unit: IsometricUnit) => SpriteFrameDims | null;

/**
 * Hook for managing per-unit sprite sheet animations.
 *
 * @param getSheetUrls - Callback to resolve sprite sheet URLs for a unit
 * @param getFrameDims - Callback to resolve frame dimensions for a unit
 * @param options - Playback speed options
 */
export function useSpriteAnimations(
    getSheetUrls: SheetUrlResolver,
    getFrameDims: FrameDimsResolver,
    options: UseSpriteAnimationsOptions = {},
): UseSpriteAnimationsResult {
    const speed = options.speed ?? 1;
    const animStatesRef = useRef<Map<string, UnitAnimationState>>(new Map());
    const prevPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
    const unitDataRef = useRef<Map<string, IsometricUnit>>(new Map());
    const walkHoldRef = useRef<Map<string, number>>(new Map());

    /** Minimum time (ms) to hold the walk animation after a position change. */
    const WALK_HOLD_MS = 600;

    const syncUnits = useCallback((units: IsometricUnit[], deltaMs: number) => {
        const scaledDelta = deltaMs * speed;
        const states = animStatesRef.current;
        const prevPos = prevPositionsRef.current;
        const unitData = unitDataRef.current;
        const walkHold = walkHoldRef.current;
        const currentIds = new Set<string>();

        for (const unit of units) {
            currentIds.add(unit.id);
            unitData.set(unit.id, unit);

            // Get or create animation state
            let state = states.get(unit.id);
            if (!state) {
                state = createUnitAnimationState(unit.id);
                states.set(unit.id, state);
            }

            // Skip animation if no sprite sheet for this unit
            const sheetUrls = getSheetUrls(unit);
            if (!sheetUrls) continue;

            // Detect movement and infer direction
            const prev = prevPos.get(unit.id);
            if (prev && unit.position) {
                const dx = unit.position.x - prev.x;
                const dy = unit.position.y - prev.y;

                if (dx !== 0 || dy !== 0) {
                    const dir = inferDirection(dx, dy);
                    // Don't interrupt combat animations
                    if (state.animation !== 'attack' && state.animation !== 'hit' && state.animation !== 'death') {
                        state = transitionAnimation(state, 'walk', dir);
                        walkHold.set(unit.id, WALK_HOLD_MS);
                    }
                } else if (state.animation === 'walk') {
                    const remaining = (walkHold.get(unit.id) ?? 0) - scaledDelta;
                    if (remaining <= 0) {
                        walkHold.delete(unit.id);
                        state = transitionAnimation(state, 'idle');
                    } else {
                        walkHold.set(unit.id, remaining);
                    }
                }
            }
            if (unit.position) {
                prevPos.set(unit.id, { x: unit.position.x, y: unit.position.y });
            }

            // Tick animation forward
            state = tickAnimationState(state, scaledDelta);
            states.set(unit.id, state);
        }

        // Clean up removed units
        for (const id of states.keys()) {
            if (!currentIds.has(id)) {
                states.delete(id);
                prevPos.delete(id);
                unitData.delete(id);
                walkHold.delete(id);
            }
        }
    }, [getSheetUrls, speed]);

    const setUnitAnimation = useCallback((
        unitId: string,
        animation: AnimationName,
        direction?: FacingDirection,
    ) => {
        const states = animStatesRef.current;
        let state = states.get(unitId);
        if (!state) {
            state = createUnitAnimationState(unitId);
        }
        state = transitionAnimation(state, animation, direction);
        states.set(unitId, state);
    }, []);

    const resolveUnitFrame = useCallback((unitId: string): ResolvedFrame | null => {
        const state = animStatesRef.current.get(unitId);
        if (!state) return null;

        const unit = unitDataRef.current.get(unitId);
        if (!unit) return null;

        const sheetUrls = getSheetUrls(unit);
        const frameDims = getFrameDims(unit);
        if (!sheetUrls || !frameDims) return null;

        // Idle: return frozen frame 0 with breathing flag
        if (state.animation === 'idle') {
            const idleState = { ...state, elapsed: 0, frame: 0 };
            const frame = resolveFrame(sheetUrls, frameDims, idleState);
            return frame ? { ...frame, applyBreathing: true } : null;
        }

        return resolveFrame(sheetUrls, frameDims, state);
    }, [getSheetUrls, getFrameDims]);

    return { syncUnits, setUnitAnimation, resolveUnitFrame };
}
