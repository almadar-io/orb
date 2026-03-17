/**
 * Canvas Effect Types
 *
 * Type definitions for the canvas-based particle, sequence, and overlay
 * effect system. Used by canvasEffects engine and combat presets.
 *
 * Ported from trait-wars and generalized for any almadar-ui client.
 */

// =============================================================================
// Primitive Effect Types
// =============================================================================

/**
 * A single particle in flight — rendered as a tinted sprite each frame.
 */
export interface CanvasParticle {
    /** Sprite URL (white-on-transparent particle) */
    spriteUrl: string;
    /** Current position in screen pixels */
    x: number;
    y: number;
    /** Velocity in pixels per second */
    vx: number;
    vy: number;
    /** Downward acceleration in px/s² (positive = down) */
    gravity: number;
    /** Current rotation in radians */
    rotation: number;
    /** Rotation speed in radians per second */
    rotationSpeed: number;
    /** Current scale (1.0 = original size) */
    scale: number;
    /** Scale change per second (negative = shrink) */
    scaleSpeed: number;
    /** Current alpha (0-1) */
    alpha: number;
    /** Alpha change per second (negative = fade out) */
    fadeRate: number;
    /** RGB tint color (applied via offscreen canvas compositing) */
    tint: { r: number; g: number; b: number };
    /** Canvas blend mode */
    blendMode: GlobalCompositeOperation;
    /** Time this particle was spawned (ms) */
    spawnTime: number;
    /** Maximum lifetime in ms (particle removed after) */
    lifetime: number;
}

/**
 * Configuration for spawning a burst of particles.
 */
export interface ParticleEmitterConfig {
    /** Array of sprite URLs to randomly pick from */
    spriteUrls: string[];
    /** Number of particles to spawn */
    count: number;
    /** Spawn origin in screen pixels */
    originX: number;
    originY: number;
    /** Random spread radius from origin (px) */
    spread: number;
    /** Velocity range (px/s) */
    velocityMin: number;
    velocityMax: number;
    /** Emission angle range (radians, 0 = right, PI/2 = down) */
    angleMin: number;
    angleMax: number;
    /** Gravity (px/s²) */
    gravity: number;
    /** RGB tint */
    tint: { r: number; g: number; b: number };
    /** Scale range */
    scaleMin: number;
    scaleMax: number;
    /** Scale speed (per second) */
    scaleSpeed?: number;
    /** Particle lifetime range (ms) */
    lifetimeMin: number;
    lifetimeMax: number;
    /** Fade rate (alpha per second, negative = fade out) */
    fadeRate?: number;
    /** Starting alpha */
    alpha?: number;
    /** Canvas blend mode */
    blendMode?: GlobalCompositeOperation;
    /** Rotation speed range (radians/s) */
    rotationSpeedMin?: number;
    rotationSpeedMax?: number;
}

/**
 * A frame-sequence animation (e.g., explosion, smoke puff).
 */
export interface CanvasSequence {
    /** Ordered array of frame sprite URLs */
    frameUrls: string[];
    /** Position in screen pixels (top-left of sprite) */
    x: number;
    y: number;
    /** Duration per frame in ms */
    frameDuration: number;
    /** Time this sequence started (ms) */
    startTime: number;
    /** Whether to loop the animation */
    loop: boolean;
    /** Render scale */
    scale: number;
    /** RGB tint (null = no tinting) */
    tint: { r: number; g: number; b: number } | null;
    /** Alpha (0-1) */
    alpha: number;
    /** Canvas blend mode */
    blendMode: GlobalCompositeOperation;
}

/**
 * Configuration for spawning a frame sequence.
 */
export interface SequenceConfig {
    frameUrls: string[];
    originX: number;
    originY: number;
    frameDuration: number;
    loop?: boolean;
    scale?: number;
    tint?: { r: number; g: number; b: number } | null;
    alpha?: number;
    blendMode?: GlobalCompositeOperation;
}

/**
 * A static/fading overlay image (e.g., ground scorch mark, shield circle).
 */
export interface CanvasOverlay {
    /** Sprite URL */
    spriteUrl: string;
    /** Center position in screen pixels */
    x: number;
    y: number;
    /** Current alpha (0-1) */
    alpha: number;
    /** Alpha change per second (negative = fade out) */
    fadeRate: number;
    /** Pulse amplitude (0 = no pulse, 0.3 = alpha oscillates ±0.3) */
    pulseAmplitude: number;
    /** Pulse frequency in Hz */
    pulseFrequency: number;
    /** Render scale */
    scale: number;
    /** Canvas blend mode */
    blendMode: GlobalCompositeOperation;
    /** Time this overlay was spawned (ms) */
    spawnTime: number;
    /** Maximum lifetime in ms */
    lifetime: number;
}

/**
 * Configuration for spawning an overlay.
 */
export interface OverlayConfig {
    spriteUrl: string;
    originX: number;
    originY: number;
    alpha?: number;
    fadeRate?: number;
    pulseAmplitude?: number;
    pulseFrequency?: number;
    scale?: number;
    blendMode?: GlobalCompositeOperation;
    lifetime?: number;
}

// =============================================================================
// Composite State
// =============================================================================

/**
 * Full state of all active effects on the canvas.
 */
export interface CanvasEffectState {
    particles: CanvasParticle[];
    sequences: CanvasSequence[];
    overlays: CanvasOverlay[];
}

// =============================================================================
// Combat Action Types & Presets
// =============================================================================

/**
 * Combat action types that map to effect compositions.
 * Superset of trait-wars types + almadar-ui originals.
 */
export type CombatActionType =
    | 'melee'
    | 'ranged'
    | 'magic'
    | 'heal'
    | 'defend'
    | 'hit'
    | 'death'
    | 'buff'
    | 'debuff'
    | 'shield'
    | 'aoe'
    | 'critical';

/**
 * A combat preset composes multiple effect layers.
 */
export interface CombatPreset {
    /** Particle emitter configs to spawn */
    particles: ParticleEmitterConfig[];
    /** Sequence configs to spawn */
    sequences: SequenceConfig[];
    /** Overlay configs to spawn */
    overlays: OverlayConfig[];
    /** Screen shake intensity in pixels (0 = none) */
    screenShake: number;
    /** Screen flash color and duration */
    screenFlash: { r: number; g: number; b: number; duration: number } | null;
}

// =============================================================================
// Asset Manifest (effect portion)
// =============================================================================

/**
 * Effect asset manifest — the sprites and animation frames available for
 * the particle engine. This is the `assetManifest.effects` section.
 */
export interface EffectAssetManifest {
    /** Base URL for all asset paths */
    baseUrl: string;
    /** Particle sprite groups (white-on-transparent, tinted at runtime) */
    particles?: {
        slash?: string[];
        magic?: string[];
        fire?: string[];
        flame?: string[];
        smoke?: string[];
        scorch?: string[];
        circle?: string[];
        flare?: string;
        spark?: string[];
        muzzle?: string[];
        star?: string[];
        trace?: string[];
        twirl?: string[];
        light?: string[];
        dirt?: string[];
        scratch?: string[];
        symbol?: string[];
    };
    /** Frame-sequence animations (array of frame image paths) */
    animations?: {
        explosion?: string[];
        smokePuff?: string[];
        flash?: string[];
        blackSmoke?: string[];
        gasSmoke?: string[];
        smokeExplosion?: string[];
    };
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Empty effect state constant.
 */
export const EMPTY_EFFECT_STATE: CanvasEffectState = {
    particles: [],
    sequences: [],
    overlays: [],
};
