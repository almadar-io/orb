'use client';
/**
 * CanvasEffect Component
 *
 * Renders animated visual effects using a `<canvas>` element with
 * sprite-based particles, frame-sequence animations, and overlays.
 * This is a render-ui pattern that can be placed in any slot —
 * it renders on top of whatever occupies that slot.
 *
 * Pattern: canvas-effect
 *
 * When an EffectAssetManifest is provided (via assetManifest prop),
 * the component uses the full particle engine with tinted sprites.
 * Without a manifest, it falls back to emoji-based rendering.
 *
 * **State categories (closed-circuit compliant):**
 * - Configuration (actionType, position, duration, manifest) → received via props
 * - Animation state (particles, shake, flash, RAF loop, phase timers) → local only
 * - Completion event → emitted via `useEventBus()` for trait integration
 *
 * This is an **ephemeral fire-and-forget** animation component.  All
 * internal state is rendering-only (particle physics, screen shake decay,
 * flash alpha, emoji phase timers).  No game logic lives here.
 *
 * @packageDocumentation
 */

import * as React from 'react';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';
import { Box } from '../../atoms/Box';
import type { CombatActionType, CanvasEffectState, EffectAssetManifest } from './types/effects';
import { EMPTY_EFFECT_STATE } from './types/effects';
import {
    spawnParticles,
    spawnSequence,
    spawnOverlay,
    updateEffectState,
    drawEffectState,
    hasActiveEffects,
    getAllEffectSpriteUrls,
} from './utils/canvasEffects';
import { createCombatPresets } from './utils/combatPresets';

export type { CombatActionType } from './types/effects';
export type { EffectAssetManifest } from './types/effects';

export interface CanvasEffectProps {
    /** The type of combat action to visualise */
    actionType: CombatActionType;
    /** Screen-space X position (center of the effect) */
    x: number;
    /** Screen-space Y position (center of the effect) */
    y: number;
    /** Duration in ms before auto-dismiss (default 2000 for canvas, 800 for emoji) */
    duration?: number;
    /** Optional intensity multiplier (1 = normal, 2 = double size/brightness) */
    intensity?: number;
    /** Callback when the effect animation completes */
    onComplete?: () => void;
    /** Declarative event: emits UI:{completeEvent} when the effect animation completes */
    completeEvent?: string;
    /** Additional CSS classes */
    className?: string;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;

    // --- Remote asset loading ---
    /** Sprite URL for the effect (emoji fallback mode).
     *  When set without assetManifest, renders this image instead of emoji. */
    effectSpriteUrl?: string;
    /** Base URL for remote assets. Prepended to relative effectSpriteUrl paths. */
    assetBaseUrl?: string;
    /** Full effect asset manifest for the sprite particle engine.
     *  When provided, enables the canvas-based particle system. */
    assetManifest?: EffectAssetManifest;
    /** Canvas width (default 400) */
    width?: number;
    /** Canvas height (default 300) */
    height?: number;
}

// Emoji fallback config
const ACTION_EMOJI: Record<string, { emoji: string; color: string; label: string }> = {
    melee: { emoji: '⚔️', color: 'var(--color-error)', label: 'Slash' },
    ranged: { emoji: '🏹', color: 'var(--color-warning)', label: 'Arrow' },
    magic: { emoji: '✨', color: 'var(--color-primary)', label: 'Spell' },
    heal: { emoji: '💚', color: 'var(--color-success)', label: 'Heal' },
    buff: { emoji: '⬆️', color: 'var(--color-info)', label: 'Buff' },
    debuff: { emoji: '⬇️', color: 'var(--color-warning)', label: 'Debuff' },
    shield: { emoji: '🛡️', color: 'var(--color-info)', label: 'Shield' },
    aoe: { emoji: '💥', color: 'var(--color-error)', label: 'Explosion' },
    critical: { emoji: '🔥', color: 'var(--color-error)', label: 'Critical' },
    defend: { emoji: '🛡️', color: 'var(--color-info)', label: 'Defend' },
    hit: { emoji: '💥', color: 'var(--color-error)', label: 'Hit' },
    death: { emoji: '💀', color: 'var(--color-error)', label: 'Death' },
};

// =============================================================================
// Canvas-based Particle Renderer
// =============================================================================

function CanvasEffectEngine({
    actionType,
    x,
    y,
    duration = 2000,
    intensity = 1,
    onComplete,
    className,
    assetManifest,
    width = 400,
    height = 300,
}: CanvasEffectProps & { assetManifest: EffectAssetManifest }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stateRef = useRef<CanvasEffectState>({ ...EMPTY_EFFECT_STATE });
    const lastTimeRef = useRef<number>(0);
    const rafRef = useRef<number>(0);
    const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
    const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });
    const [flash, setFlash] = useState<{ color: string; alpha: number } | null>(null);
    const shakeRef = useRef<{ x: number; y: number; intensity: number }>({ x: 0, y: 0, intensity: 0 });

    const presets = useMemo(() => createCombatPresets(assetManifest), [assetManifest]);

    // Preload all sprite URLs
    const spriteUrls = useMemo(() => getAllEffectSpriteUrls(assetManifest), [assetManifest]);

    useEffect(() => {
        const cache = imageCacheRef.current;
        for (const url of spriteUrls) {
            if (!cache.has(url)) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = url;
                cache.set(url, img);
            }
        }
    }, [spriteUrls]);

    const getImage = useCallback((url: string) => {
        const img = imageCacheRef.current.get(url);
        return img?.complete ? img : undefined;
    }, []);

    // Spawn effect on mount
    useEffect(() => {
        const now = performance.now();
        // Effect position relative to canvas center
        const effectX = x || width / 2;
        const effectY = y || height / 2;
        const scaledX = effectX * intensity;
        const scaledY = effectY;

        const preset = presets[actionType](effectX, effectY);
        const state = stateRef.current;

        for (const emitter of preset.particles) {
            // Scale particle count by intensity
            const scaledEmitter = { ...emitter, count: Math.round(emitter.count * intensity) };
            state.particles.push(...spawnParticles(scaledEmitter, now));
        }
        for (const seqConfig of preset.sequences) {
            state.sequences.push(spawnSequence(seqConfig, now));
        }
        for (const ovConfig of preset.overlays) {
            state.overlays.push(spawnOverlay(ovConfig, now));
        }

        if (preset.screenShake > 0) {
            shakeRef.current.intensity = preset.screenShake * intensity;
        }
        if (preset.screenFlash) {
            const { r, g, b, duration: flashDur } = preset.screenFlash;
            setFlash({ color: `rgb(${r}, ${g}, ${b})`, alpha: 0.3 });
            setTimeout(() => setFlash(null), flashDur);
        }

        // Auto-dismiss
        const timer = setTimeout(() => {
            onComplete?.();
        }, duration);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // RAF loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        function loop(animTime: number) {
            const delta = lastTimeRef.current > 0 ? animTime - lastTimeRef.current : 16;
            lastTimeRef.current = animTime;

            // Update physics
            stateRef.current = updateEffectState(stateRef.current, animTime, delta);

            // Screen shake
            if (shakeRef.current.intensity > 0.2) {
                const i = shakeRef.current.intensity;
                shakeRef.current.x = (Math.random() - 0.5) * i * 2;
                shakeRef.current.y = (Math.random() - 0.5) * i * 2;
                shakeRef.current.intensity *= 0.85;
                setShakeOffset({ x: shakeRef.current.x, y: shakeRef.current.y });
            } else if (shakeRef.current.intensity > 0) {
                shakeRef.current = { x: 0, y: 0, intensity: 0 };
                setShakeOffset({ x: 0, y: 0 });
            }

            // Clear and draw
            ctx!.clearRect(0, 0, width, height);
            drawEffectState(ctx!, stateRef.current, animTime, getImage);

            if (hasActiveEffects(stateRef.current)) {
                rafRef.current = requestAnimationFrame(loop);
            }
        }

        rafRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafRef.current);
    }, [width, height, getImage]);

    const shakeStyle: React.CSSProperties = (shakeOffset.x !== 0 || shakeOffset.y !== 0)
        ? { transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px)` }
        : {};

    return (
        <Box
            className={cn('absolute inset-0 pointer-events-none z-10', className)}
            style={shakeStyle}
        >
            {flash && (
                <Box
                    className="absolute inset-0 z-20 pointer-events-none rounded-lg"
                    style={{ backgroundColor: flash.color, opacity: flash.alpha }}
                />
            )}
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="absolute inset-0 w-full h-full"
                style={{ imageRendering: 'pixelated' }}
            />
        </Box>
    );
}

// =============================================================================
// Emoji Fallback Renderer
// =============================================================================

function EmojiEffect({
    actionType,
    x,
    y,
    duration = 800,
    intensity = 1,
    onComplete,
    className,
    effectSpriteUrl,
    assetBaseUrl,
}: CanvasEffectProps) {
    const [visible, setVisible] = useState(true);
    const [phase, setPhase] = useState<'enter' | 'active' | 'exit'>('enter');

    useEffect(() => {
        const enterTimer = setTimeout(() => setPhase('active'), 100);
        const exitTimer = setTimeout(() => setPhase('exit'), duration * 0.7);
        const doneTimer = setTimeout(() => {
            setVisible(false);
            onComplete?.();
        }, duration);

        return () => {
            clearTimeout(enterTimer);
            clearTimeout(exitTimer);
            clearTimeout(doneTimer);
        };
    }, [duration, onComplete]);

    if (!visible) return null;

    const config = ACTION_EMOJI[actionType] ?? ACTION_EMOJI.melee;
    const scaleVal = phase === 'enter' ? 0.3 : phase === 'active' ? intensity : 0.5;
    const opacity = phase === 'exit' ? 0 : 1;

    const resolvedSpriteUrl = effectSpriteUrl
        ? (effectSpriteUrl.startsWith('http') || effectSpriteUrl.startsWith('/'))
            ? effectSpriteUrl
            : assetBaseUrl
                ? `${assetBaseUrl.replace(/\/$/, '')}/${effectSpriteUrl}`
                : effectSpriteUrl
        : undefined;

    return (
        <Box
            className={cn(
                'fixed pointer-events-none z-50 flex items-center justify-center',
                'transition-all ease-out',
                className,
            )}
            style={{
                left: x,
                top: y,
                transform: `translate(-50%, -50%) scale(${scaleVal})`,
                opacity,
                transitionDuration: phase === 'enter' ? '100ms' : '300ms',
            }}
        >
            <Box
                className="absolute rounded-full animate-ping"
                style={{
                    width: 48 * intensity,
                    height: 48 * intensity,
                    backgroundColor: config.color,
                    opacity: 0.25,
                }}
            />
            {resolvedSpriteUrl ? (
                <img
                    src={resolvedSpriteUrl}
                    alt={config.label}
                    className="relative drop-shadow-lg"
                    style={{
                        width: `${3 * intensity}rem`,
                        height: `${3 * intensity}rem`,
                        objectFit: 'contain',
                        imageRendering: 'pixelated',
                    }}
                />
            ) : (
                <span
                    className="relative text-3xl drop-shadow-lg"
                    style={{ fontSize: `${2 * intensity}rem` }}
                    role="img"
                    aria-label={config.label}
                >
                    {config.emoji}
                </span>
            )}
        </Box>
    );
}

// =============================================================================
// Main Export — delegates to canvas engine or emoji fallback
// =============================================================================

export function CanvasEffect(props: CanvasEffectProps): React.JSX.Element | null {
    const eventBus = useEventBus();
    const { completeEvent, onComplete, ...rest } = props;

    const handleComplete = useCallback(() => {
        if (completeEvent) eventBus.emit(`UI:${completeEvent}`, {});
        onComplete?.();
    }, [completeEvent, eventBus, onComplete]);

    const enhancedProps = { ...rest, onComplete: handleComplete };

    if (props.assetManifest) {
        return <CanvasEffectEngine {...enhancedProps} assetManifest={props.assetManifest} />;
    }
    return <EmojiEffect {...enhancedProps} />;
}

CanvasEffect.displayName = 'CanvasEffect';

export default CanvasEffect;
