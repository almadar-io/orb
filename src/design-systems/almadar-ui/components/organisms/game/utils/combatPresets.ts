/**
 * Combat Presets
 *
 * Maps combat actions to composed effect layers (particles + sequences + overlays).
 * Each preset factory takes a screen-space origin and returns a CombatPreset.
 *
 * Generalized from trait-wars: uses EffectAssetManifest instead of TraitWarsAssetManifest.
 */

import type {
    CombatActionType,
    CombatPreset,
    ParticleEmitterConfig,
    SequenceConfig,
    OverlayConfig,
    EffectAssetManifest,
} from '../types/effects';

const PI = Math.PI;

// Helper to resolve particle URLs from manifest
function p(manifest: EffectAssetManifest, key: string): string[] {
    const particles = manifest.particles;
    if (!particles) return [];
    const val = (particles as Record<string, string[] | string | undefined>)[key];
    if (Array.isArray(val)) return val.map(v => `${manifest.baseUrl}/${v}`);
    if (typeof val === 'string') return [`${manifest.baseUrl}/${val}`];
    return [];
}

// Helper to resolve animation frame URLs from manifest
function anim(manifest: EffectAssetManifest, key: string): string[] {
    const animations = manifest.animations;
    if (!animations) return [];
    const val = (animations as Record<string, string[] | undefined>)[key];
    if (Array.isArray(val)) return val.map(v => `${manifest.baseUrl}/${v}`);
    return [];
}

type PresetFactory = (originX: number, originY: number) => CombatPreset;

/**
 * Create combat preset factories from an effect asset manifest.
 */
export function createCombatPresets(
    manifest: EffectAssetManifest,
): Record<CombatActionType, PresetFactory> {
    return {
        // =====================================================================
        // MELEE — slash (red) + dirt + scratch + flash sequence
        // =====================================================================
        melee: (originX, originY) => {
            const particles: ParticleEmitterConfig[] = [
                {
                    spriteUrls: p(manifest, 'slash'),
                    count: 6,
                    originX, originY,
                    spread: 8,
                    velocityMin: 40, velocityMax: 120,
                    angleMin: -PI * 0.8, angleMax: -PI * 0.2,
                    gravity: 0,
                    tint: { r: 255, g: 60, b: 40 },
                    scaleMin: 0.3, scaleMax: 0.6,
                    lifetimeMin: 300, lifetimeMax: 500,
                    fadeRate: -2.5,
                },
                {
                    spriteUrls: p(manifest, 'dirt'),
                    count: 4,
                    originX, originY: originY + 10,
                    spread: 12,
                    velocityMin: 20, velocityMax: 60,
                    angleMin: -PI * 0.9, angleMax: -PI * 0.1,
                    gravity: 120,
                    tint: { r: 180, g: 140, b: 90 },
                    scaleMin: 0.15, scaleMax: 0.3,
                    lifetimeMin: 400, lifetimeMax: 700,
                    fadeRate: -1.8,
                },
                {
                    spriteUrls: p(manifest, 'scratch'),
                    count: 2,
                    originX, originY,
                    spread: 5,
                    velocityMin: 10, velocityMax: 30,
                    angleMin: -PI * 0.7, angleMax: -PI * 0.3,
                    gravity: 0,
                    tint: { r: 255, g: 200, b: 150 },
                    scaleMin: 0.25, scaleMax: 0.4,
                    lifetimeMin: 200, lifetimeMax: 400,
                    fadeRate: -3,
                },
            ];
            const sequences: SequenceConfig[] = [];
            const flashFrames = anim(manifest, 'flash');
            if (flashFrames.length > 0) {
                sequences.push({
                    frameUrls: flashFrames,
                    originX, originY,
                    frameDuration: 35,
                    scale: 0.4,
                });
            }
            return {
                particles: particles.filter(pc => pc.spriteUrls.length > 0),
                sequences,
                overlays: [],
                screenShake: 4,
                screenFlash: null,
            };
        },

        // =====================================================================
        // RANGED — muzzle + trace + smoke + explosion sequence
        // =====================================================================
        ranged: (originX, originY) => {
            const particles: ParticleEmitterConfig[] = [
                {
                    spriteUrls: p(manifest, 'muzzle'),
                    count: 3,
                    originX, originY,
                    spread: 4,
                    velocityMin: 60, velocityMax: 150,
                    angleMin: -PI * 0.6, angleMax: -PI * 0.4,
                    gravity: 0,
                    tint: { r: 255, g: 220, b: 100 },
                    scaleMin: 0.2, scaleMax: 0.4,
                    lifetimeMin: 200, lifetimeMax: 400,
                    fadeRate: -3,
                },
                {
                    spriteUrls: p(manifest, 'trace'),
                    count: 5,
                    originX, originY,
                    spread: 3,
                    velocityMin: 100, velocityMax: 200,
                    angleMin: -PI * 0.55, angleMax: -PI * 0.45,
                    gravity: 0,
                    tint: { r: 255, g: 200, b: 80 },
                    scaleMin: 0.15, scaleMax: 0.3,
                    lifetimeMin: 150, lifetimeMax: 300,
                    fadeRate: -4,
                },
                {
                    spriteUrls: p(manifest, 'smoke').slice(0, 3),
                    count: 3,
                    originX, originY: originY + 5,
                    spread: 6,
                    velocityMin: 10, velocityMax: 30,
                    angleMin: -PI * 0.8, angleMax: -PI * 0.2,
                    gravity: -20,
                    tint: { r: 200, g: 200, b: 200 },
                    scaleMin: 0.2, scaleMax: 0.35,
                    lifetimeMin: 500, lifetimeMax: 800,
                    fadeRate: -1.5,
                },
            ];
            const sequences: SequenceConfig[] = [];
            const explosionFrames = anim(manifest, 'smokeExplosion');
            if (explosionFrames.length > 0) {
                sequences.push({
                    frameUrls: explosionFrames,
                    originX, originY,
                    frameDuration: 50,
                    scale: 0.35,
                });
            }
            return {
                particles: particles.filter(pc => pc.spriteUrls.length > 0),
                sequences,
                overlays: [],
                screenShake: 2,
                screenFlash: null,
            };
        },

        // =====================================================================
        // MAGIC — twirl (purple) + spark (purple) + star
        // =====================================================================
        magic: (originX, originY) => {
            const particles: ParticleEmitterConfig[] = [
                {
                    spriteUrls: p(manifest, 'twirl'),
                    count: 5,
                    originX, originY,
                    spread: 15,
                    velocityMin: 20, velocityMax: 80,
                    angleMin: 0, angleMax: PI * 2,
                    gravity: -30,
                    tint: { r: 180, g: 80, b: 255 },
                    scaleMin: 0.2, scaleMax: 0.5,
                    lifetimeMin: 500, lifetimeMax: 900,
                    fadeRate: -1.2,
                    blendMode: 'lighter',
                    rotationSpeedMin: -4, rotationSpeedMax: 4,
                },
                {
                    spriteUrls: p(manifest, 'spark'),
                    count: 8,
                    originX, originY,
                    spread: 20,
                    velocityMin: 30, velocityMax: 100,
                    angleMin: 0, angleMax: PI * 2,
                    gravity: -15,
                    tint: { r: 200, g: 120, b: 255 },
                    scaleMin: 0.1, scaleMax: 0.25,
                    lifetimeMin: 300, lifetimeMax: 600,
                    fadeRate: -2,
                    blendMode: 'lighter',
                },
                {
                    spriteUrls: p(manifest, 'star'),
                    count: 4,
                    originX, originY,
                    spread: 10,
                    velocityMin: 15, velocityMax: 50,
                    angleMin: -PI, angleMax: 0,
                    gravity: -40,
                    tint: { r: 220, g: 180, b: 255 },
                    scaleMin: 0.15, scaleMax: 0.3,
                    lifetimeMin: 600, lifetimeMax: 1000,
                    fadeRate: -1,
                    blendMode: 'lighter',
                },
            ];
            const overlays: OverlayConfig[] = [];
            const circleUrls = p(manifest, 'circle');
            if (circleUrls.length > 0) {
                overlays.push({
                    spriteUrl: circleUrls[0],
                    originX, originY,
                    alpha: 0.5,
                    fadeRate: -0.6,
                    pulseAmplitude: 0.2,
                    pulseFrequency: 3,
                    scale: 0.5,
                    blendMode: 'lighter',
                    lifetime: 1200,
                });
            }
            return {
                particles: particles.filter(pc => pc.spriteUrls.length > 0),
                sequences: [],
                overlays,
                screenShake: 0,
                screenFlash: null,
            };
        },

        // =====================================================================
        // HEAL — circle (green) + star (green) + light (green, pulse)
        // =====================================================================
        heal: (originX, originY) => {
            const particles: ParticleEmitterConfig[] = [
                {
                    spriteUrls: p(manifest, 'circle'),
                    count: 6,
                    originX, originY,
                    spread: 15,
                    velocityMin: 10, velocityMax: 40,
                    angleMin: -PI, angleMax: -PI * 0.3,
                    gravity: -50,
                    tint: { r: 80, g: 255, b: 120 },
                    scaleMin: 0.15, scaleMax: 0.35,
                    lifetimeMin: 600, lifetimeMax: 1000,
                    fadeRate: -0.8,
                    blendMode: 'lighter',
                },
                {
                    spriteUrls: p(manifest, 'star'),
                    count: 5,
                    originX, originY,
                    spread: 12,
                    velocityMin: 15, velocityMax: 50,
                    angleMin: -PI * 0.9, angleMax: -PI * 0.1,
                    gravity: -60,
                    tint: { r: 100, g: 255, b: 140 },
                    scaleMin: 0.1, scaleMax: 0.2,
                    lifetimeMin: 500, lifetimeMax: 800,
                    fadeRate: -1.2,
                    blendMode: 'lighter',
                },
            ];
            const overlays: OverlayConfig[] = [];
            const lightUrls = p(manifest, 'light');
            if (lightUrls.length > 0) {
                overlays.push({
                    spriteUrl: lightUrls[0],
                    originX, originY,
                    alpha: 0.6,
                    fadeRate: -0.4,
                    pulseAmplitude: 0.25,
                    pulseFrequency: 2.5,
                    scale: 0.6,
                    blendMode: 'lighter',
                    lifetime: 1500,
                });
            }
            return {
                particles: particles.filter(pc => pc.spriteUrls.length > 0),
                sequences: [],
                overlays,
                screenShake: 0,
                screenFlash: null,
            };
        },

        // =====================================================================
        // DEFEND / SHIELD — star (blue) + circle (blue, pulse)
        // =====================================================================
        defend: (originX, originY) => {
            const particles: ParticleEmitterConfig[] = [
                {
                    spriteUrls: p(manifest, 'star'),
                    count: 8,
                    originX, originY,
                    spread: 18,
                    velocityMin: 10, velocityMax: 35,
                    angleMin: 0, angleMax: PI * 2,
                    gravity: 0,
                    tint: { r: 80, g: 160, b: 255 },
                    scaleMin: 0.12, scaleMax: 0.25,
                    lifetimeMin: 600, lifetimeMax: 1000,
                    fadeRate: -0.8,
                    blendMode: 'lighter',
                    rotationSpeedMin: -1, rotationSpeedMax: 1,
                },
            ];
            const overlays: OverlayConfig[] = [];
            const circleUrls = p(manifest, 'circle');
            if (circleUrls.length > 0) {
                overlays.push({
                    spriteUrl: circleUrls[0],
                    originX, originY,
                    alpha: 0.6,
                    fadeRate: -0.3,
                    pulseAmplitude: 0.2,
                    pulseFrequency: 2,
                    scale: 0.6,
                    blendMode: 'lighter',
                    lifetime: 1500,
                });
            }
            return {
                particles: particles.filter(pc => pc.spriteUrls.length > 0),
                sequences: [],
                overlays,
                screenShake: 0,
                screenFlash: null,
            };
        },

        // shield aliases to defend
        shield: (originX, originY) => {
            const particles: ParticleEmitterConfig[] = [
                {
                    spriteUrls: p(manifest, 'star'),
                    count: 10,
                    originX, originY,
                    spread: 20,
                    velocityMin: 8, velocityMax: 30,
                    angleMin: 0, angleMax: PI * 2,
                    gravity: 0,
                    tint: { r: 60, g: 180, b: 255 },
                    scaleMin: 0.1, scaleMax: 0.22,
                    lifetimeMin: 700, lifetimeMax: 1200,
                    fadeRate: -0.7,
                    blendMode: 'lighter',
                    rotationSpeedMin: -0.8, rotationSpeedMax: 0.8,
                },
            ];
            const overlays: OverlayConfig[] = [];
            const circleUrls = p(manifest, 'circle');
            if (circleUrls.length > 0) {
                overlays.push({
                    spriteUrl: circleUrls[0],
                    originX, originY,
                    alpha: 0.7,
                    fadeRate: -0.25,
                    pulseAmplitude: 0.25,
                    pulseFrequency: 1.8,
                    scale: 0.7,
                    blendMode: 'lighter',
                    lifetime: 1800,
                });
            }
            return {
                particles: particles.filter(pc => pc.spriteUrls.length > 0),
                sequences: [],
                overlays,
                screenShake: 0,
                screenFlash: null,
            };
        },

        // =====================================================================
        // HIT — spark (orange) + flash (5 frames) + screen shake/flash
        // =====================================================================
        hit: (originX, originY) => {
            const particles: ParticleEmitterConfig[] = [
                {
                    spriteUrls: p(manifest, 'spark'),
                    count: 10,
                    originX, originY,
                    spread: 8,
                    velocityMin: 50, velocityMax: 150,
                    angleMin: 0, angleMax: PI * 2,
                    gravity: 80,
                    tint: { r: 255, g: 180, b: 50 },
                    scaleMin: 0.08, scaleMax: 0.2,
                    lifetimeMin: 200, lifetimeMax: 500,
                    fadeRate: -2.5,
                },
            ];
            const sequences: SequenceConfig[] = [];
            const flashFrames = anim(manifest, 'flash');
            if (flashFrames.length > 0) {
                sequences.push({
                    frameUrls: flashFrames.slice(0, 5),
                    originX, originY,
                    frameDuration: 40,
                    scale: 0.3,
                });
            }
            return {
                particles: particles.filter(pc => pc.spriteUrls.length > 0),
                sequences,
                overlays: [],
                screenShake: 3,
                screenFlash: { r: 255, g: 50, b: 50, duration: 150 },
            };
        },

        // critical aliases to hit with bigger shake
        critical: (originX, originY) => {
            const particles: ParticleEmitterConfig[] = [
                {
                    spriteUrls: p(manifest, 'flame'),
                    count: 8,
                    originX, originY,
                    spread: 12,
                    velocityMin: 60, velocityMax: 180,
                    angleMin: 0, angleMax: PI * 2,
                    gravity: 60,
                    tint: { r: 255, g: 120, b: 30 },
                    scaleMin: 0.15, scaleMax: 0.4,
                    lifetimeMin: 300, lifetimeMax: 600,
                    fadeRate: -2,
                },
                {
                    spriteUrls: p(manifest, 'spark'),
                    count: 12,
                    originX, originY,
                    spread: 10,
                    velocityMin: 80, velocityMax: 200,
                    angleMin: 0, angleMax: PI * 2,
                    gravity: 100,
                    tint: { r: 255, g: 200, b: 60 },
                    scaleMin: 0.06, scaleMax: 0.18,
                    lifetimeMin: 200, lifetimeMax: 400,
                    fadeRate: -3,
                },
            ];
            const sequences: SequenceConfig[] = [];
            const flashFrames = anim(manifest, 'flash');
            if (flashFrames.length > 0) {
                sequences.push({
                    frameUrls: flashFrames,
                    originX, originY,
                    frameDuration: 30,
                    scale: 0.5,
                });
            }
            return {
                particles: particles.filter(pc => pc.spriteUrls.length > 0),
                sequences,
                overlays: [],
                screenShake: 6,
                screenFlash: { r: 255, g: 80, b: 0, duration: 200 },
            };
        },

        // =====================================================================
        // DEATH — dirt (gray) + explosion + black smoke + scorch (ground)
        // =====================================================================
        death: (originX, originY) => {
            const particles: ParticleEmitterConfig[] = [
                {
                    spriteUrls: p(manifest, 'dirt'),
                    count: 8,
                    originX, originY,
                    spread: 10,
                    velocityMin: 30, velocityMax: 100,
                    angleMin: 0, angleMax: PI * 2,
                    gravity: 100,
                    tint: { r: 140, g: 140, b: 140 },
                    scaleMin: 0.15, scaleMax: 0.35,
                    lifetimeMin: 500, lifetimeMax: 900,
                    fadeRate: -1.2,
                },
            ];
            const sequences: SequenceConfig[] = [];
            const explosionFrames = anim(manifest, 'explosion');
            if (explosionFrames.length > 0) {
                sequences.push({
                    frameUrls: explosionFrames,
                    originX, originY,
                    frameDuration: 60,
                    scale: 0.5,
                });
            }
            const blackSmokeFrames = anim(manifest, 'blackSmoke');
            if (blackSmokeFrames.length > 0) {
                sequences.push({
                    frameUrls: blackSmokeFrames,
                    originX, originY: originY - 10,
                    frameDuration: 50,
                    scale: 0.4,
                    alpha: 0.7,
                });
            }
            const overlays: OverlayConfig[] = [];
            const scorchUrls = p(manifest, 'scorch');
            if (scorchUrls.length > 0) {
                overlays.push({
                    spriteUrl: scorchUrls[0],
                    originX, originY: originY + 10,
                    alpha: 0.6,
                    fadeRate: -0.15,
                    scale: 0.4,
                    lifetime: 4000,
                });
            }
            return {
                particles: particles.filter(pc => pc.spriteUrls.length > 0),
                sequences,
                overlays,
                screenShake: 0,
                screenFlash: null,
            };
        },

        // =====================================================================
        // BUFF — star (gold) + symbol + flare (gold, pulse)
        // =====================================================================
        buff: (originX, originY) => {
            const particles: ParticleEmitterConfig[] = [
                {
                    spriteUrls: p(manifest, 'star'),
                    count: 6,
                    originX, originY,
                    spread: 15,
                    velocityMin: 15, velocityMax: 50,
                    angleMin: -PI, angleMax: 0,
                    gravity: -30,
                    tint: { r: 255, g: 215, b: 50 },
                    scaleMin: 0.12, scaleMax: 0.25,
                    lifetimeMin: 600, lifetimeMax: 1000,
                    fadeRate: -0.8,
                    blendMode: 'lighter',
                },
                {
                    spriteUrls: p(manifest, 'symbol'),
                    count: 2,
                    originX, originY: originY - 10,
                    spread: 8,
                    velocityMin: 5, velocityMax: 20,
                    angleMin: -PI * 0.7, angleMax: -PI * 0.3,
                    gravity: -20,
                    tint: { r: 255, g: 230, b: 100 },
                    scaleMin: 0.2, scaleMax: 0.35,
                    lifetimeMin: 800, lifetimeMax: 1200,
                    fadeRate: -0.6,
                    blendMode: 'lighter',
                },
            ];
            const overlays: OverlayConfig[] = [];
            const flareUrls = p(manifest, 'flare');
            if (flareUrls.length > 0) {
                overlays.push({
                    spriteUrl: flareUrls[0],
                    originX, originY,
                    alpha: 0.5,
                    fadeRate: -0.3,
                    pulseAmplitude: 0.3,
                    pulseFrequency: 2,
                    scale: 0.5,
                    blendMode: 'lighter',
                    lifetime: 1500,
                });
            }
            return {
                particles: particles.filter(pc => pc.spriteUrls.length > 0),
                sequences: [],
                overlays,
                screenShake: 0,
                screenFlash: null,
            };
        },

        // =====================================================================
        // DEBUFF — scorch (dark) + smoke (purple tint)
        // =====================================================================
        debuff: (originX, originY) => {
            const particles: ParticleEmitterConfig[] = [
                {
                    spriteUrls: p(manifest, 'scorch'),
                    count: 4,
                    originX, originY,
                    spread: 12,
                    velocityMin: 15, velocityMax: 40,
                    angleMin: -PI, angleMax: 0,
                    gravity: -20,
                    tint: { r: 120, g: 40, b: 160 },
                    scaleMin: 0.15, scaleMax: 0.3,
                    lifetimeMin: 500, lifetimeMax: 800,
                    fadeRate: -1,
                },
                {
                    spriteUrls: p(manifest, 'smoke').slice(0, 3),
                    count: 3,
                    originX, originY,
                    spread: 10,
                    velocityMin: 8, velocityMax: 25,
                    angleMin: -PI * 0.8, angleMax: -PI * 0.2,
                    gravity: -15,
                    tint: { r: 100, g: 50, b: 140 },
                    scaleMin: 0.2, scaleMax: 0.35,
                    lifetimeMin: 600, lifetimeMax: 1000,
                    fadeRate: -0.8,
                },
            ];
            const overlays: OverlayConfig[] = [];
            const circleUrls = p(manifest, 'circle');
            if (circleUrls.length > 0) {
                overlays.push({
                    spriteUrl: circleUrls[0],
                    originX, originY,
                    alpha: 0.4,
                    fadeRate: -0.4,
                    pulseAmplitude: 0.15,
                    pulseFrequency: 2,
                    scale: 0.45,
                    lifetime: 1200,
                });
            }
            return {
                particles: particles.filter(pc => pc.spriteUrls.length > 0),
                sequences: [],
                overlays,
                screenShake: 0,
                screenFlash: null,
            };
        },

        // =====================================================================
        // AOE — explosion (large) + flame + spark (radial) + screen shake
        // =====================================================================
        aoe: (originX, originY) => {
            const particles: ParticleEmitterConfig[] = [
                {
                    spriteUrls: p(manifest, 'flame'),
                    count: 10,
                    originX, originY,
                    spread: 20,
                    velocityMin: 40, velocityMax: 140,
                    angleMin: 0, angleMax: PI * 2,
                    gravity: 40,
                    tint: { r: 255, g: 140, b: 30 },
                    scaleMin: 0.2, scaleMax: 0.5,
                    lifetimeMin: 400, lifetimeMax: 800,
                    fadeRate: -1.5,
                },
                {
                    spriteUrls: p(manifest, 'spark'),
                    count: 15,
                    originX, originY,
                    spread: 15,
                    velocityMin: 60, velocityMax: 200,
                    angleMin: 0, angleMax: PI * 2,
                    gravity: 60,
                    tint: { r: 255, g: 180, b: 60 },
                    scaleMin: 0.06, scaleMax: 0.15,
                    lifetimeMin: 200, lifetimeMax: 500,
                    fadeRate: -2.5,
                },
            ];
            const sequences: SequenceConfig[] = [];
            const explosionFrames = anim(manifest, 'explosion');
            if (explosionFrames.length > 0) {
                sequences.push({
                    frameUrls: explosionFrames,
                    originX, originY,
                    frameDuration: 50,
                    scale: 0.6,
                });
            }
            return {
                particles: particles.filter(pc => pc.spriteUrls.length > 0),
                sequences,
                overlays: [],
                screenShake: 5,
                screenFlash: { r: 255, g: 160, b: 0, duration: 180 },
            };
        },
    };
}
