/**
 * Canvas Effect Engine
 *
 * Pure functions for spawning, updating, and drawing canvas effects.
 * No React dependencies — called from the RAF loop via useCanvasEffects hook.
 *
 * Ported from trait-wars and generalized for any almadar-ui client.
 */

import type {
    CanvasParticle,
    CanvasSequence,
    CanvasOverlay,
    CanvasEffectState,
    ParticleEmitterConfig,
    SequenceConfig,
    OverlayConfig,
} from '../types/effects';

// =============================================================================
// Offscreen Canvas for Tinting
// =============================================================================

let _offscreen: OffscreenCanvas | HTMLCanvasElement | null = null;
let _offCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null = null;

function getOffscreenCtx(w: number, h: number) {
    if (!_offscreen) {
        if (typeof OffscreenCanvas !== 'undefined') {
            _offscreen = new OffscreenCanvas(w, h);
        } else {
            _offscreen = document.createElement('canvas');
        }
    }
    if (_offscreen.width < w) _offscreen.width = w;
    if (_offscreen.height < h) _offscreen.height = h;
    if (!_offCtx) {
        _offCtx = _offscreen.getContext('2d')!;
    }
    return _offCtx;
}

// =============================================================================
// Tinted Image Drawing
// =============================================================================

/**
 * Draw a sprite tinted with an RGB color onto the main canvas.
 * Uses offscreen canvas with `source-atop` compositing to recolor
 * white-on-transparent sprites.
 */
export function drawTintedImage(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement | ImageBitmap,
    x: number,
    y: number,
    w: number,
    h: number,
    tint: { r: number; g: number; b: number },
    alpha: number,
    blendMode: GlobalCompositeOperation = 'source-over',
): void {
    // Guard against zero-size images (not yet loaded)
    if (w <= 0 || h <= 0) return;
    const oc = getOffscreenCtx(w, h);
    oc.clearRect(0, 0, w, h);

    // Draw original sprite
    oc.globalCompositeOperation = 'source-over';
    oc.drawImage(img, 0, 0, w, h);

    // Tint: fill with color using source-atop (only colors opaque pixels)
    oc.globalCompositeOperation = 'source-atop';
    oc.fillStyle = `rgb(${tint.r}, ${tint.g}, ${tint.b})`;
    oc.fillRect(0, 0, w, h);

    // Draw tinted result onto main canvas
    const prevAlpha = ctx.globalAlpha;
    const prevBlend = ctx.globalCompositeOperation;
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = blendMode;
    ctx.drawImage(_offscreen!, 0, 0, w, h, x, y, w, h);
    ctx.globalAlpha = prevAlpha;
    ctx.globalCompositeOperation = prevBlend;
}

// =============================================================================
// Spawning
// =============================================================================

function randRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
}

/**
 * Spawn a burst of particles from an emitter config.
 */
export function spawnParticles(config: ParticleEmitterConfig, animTime: number): CanvasParticle[] {
    const particles: CanvasParticle[] = [];

    for (let i = 0; i < config.count; i++) {
        const angle = randRange(config.angleMin, config.angleMax);
        const speed = randRange(config.velocityMin, config.velocityMax);
        const spriteUrl = config.spriteUrls[Math.floor(Math.random() * config.spriteUrls.length)];

        particles.push({
            spriteUrl,
            x: config.originX + randRange(-config.spread, config.spread),
            y: config.originY + randRange(-config.spread, config.spread),
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            gravity: config.gravity,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: randRange(config.rotationSpeedMin ?? -2, config.rotationSpeedMax ?? 2),
            scale: randRange(config.scaleMin, config.scaleMax),
            scaleSpeed: config.scaleSpeed ?? 0,
            alpha: config.alpha ?? 1,
            fadeRate: config.fadeRate ?? -1.5,
            tint: { ...config.tint },
            blendMode: config.blendMode ?? 'source-over',
            spawnTime: animTime,
            lifetime: randRange(config.lifetimeMin, config.lifetimeMax),
        });
    }

    return particles;
}

/**
 * Spawn a frame sequence animation.
 */
export function spawnSequence(config: SequenceConfig, animTime: number): CanvasSequence {
    return {
        frameUrls: config.frameUrls,
        x: config.originX,
        y: config.originY,
        frameDuration: config.frameDuration,
        startTime: animTime,
        loop: config.loop ?? false,
        scale: config.scale ?? 1,
        tint: config.tint ?? null,
        alpha: config.alpha ?? 1,
        blendMode: config.blendMode ?? 'source-over',
    };
}

/**
 * Spawn an overlay effect.
 */
export function spawnOverlay(config: OverlayConfig, animTime: number): CanvasOverlay {
    return {
        spriteUrl: config.spriteUrl,
        x: config.originX,
        y: config.originY,
        alpha: config.alpha ?? 0.8,
        fadeRate: config.fadeRate ?? -0.5,
        pulseAmplitude: config.pulseAmplitude ?? 0,
        pulseFrequency: config.pulseFrequency ?? 2,
        scale: config.scale ?? 1,
        blendMode: config.blendMode ?? 'source-over',
        spawnTime: animTime,
        lifetime: config.lifetime ?? 2000,
    };
}

// =============================================================================
// Update (Physics)
// =============================================================================

/**
 * Advance effect state by one frame. Returns new state with expired effects removed.
 */
export function updateEffectState(
    state: CanvasEffectState,
    animTime: number,
    deltaMs: number,
): CanvasEffectState {
    const dt = deltaMs / 1000; // convert to seconds

    // Update particles
    const particles = state.particles
        .map(p => ({
            ...p,
            x: p.x + p.vx * dt,
            y: p.y + p.vy * dt,
            vy: p.vy + p.gravity * dt,
            rotation: p.rotation + p.rotationSpeed * dt,
            scale: Math.max(0, p.scale + p.scaleSpeed * dt),
            alpha: Math.max(0, p.alpha + p.fadeRate * dt),
        }))
        .filter(p => p.alpha > 0.01 && (animTime - p.spawnTime) < p.lifetime);

    // Update sequences — remove completed non-looping ones
    const sequences = state.sequences.filter(s => {
        const elapsed = animTime - s.startTime;
        const totalDuration = s.frameUrls.length * s.frameDuration;
        return s.loop || elapsed < totalDuration;
    });

    // Update overlays
    const overlays = state.overlays
        .map(o => ({
            ...o,
            alpha: Math.max(0, o.alpha + o.fadeRate * dt),
        }))
        .filter(o => o.alpha > 0.01 && (animTime - o.spawnTime) < o.lifetime);

    return { particles, sequences, overlays };
}

// =============================================================================
// Drawing
// =============================================================================

type GetImageFn = (url: string) => HTMLImageElement | undefined;

/**
 * Draw all active effects onto the canvas.
 */
export function drawEffectState(
    ctx: CanvasRenderingContext2D,
    state: CanvasEffectState,
    animTime: number,
    getImage: GetImageFn,
): void {
    // Draw overlays first (ground layer)
    for (const o of state.overlays) {
        const img = getImage(o.spriteUrl);
        if (!img) continue;

        // Calculate alpha with pulse
        let alpha = o.alpha;
        if (o.pulseAmplitude > 0) {
            const elapsed = (animTime - o.spawnTime) / 1000;
            alpha += Math.sin(elapsed * o.pulseFrequency * Math.PI * 2) * o.pulseAmplitude;
            alpha = Math.max(0, Math.min(1, alpha));
        }

        const w = img.naturalWidth * o.scale;
        const h = img.naturalHeight * o.scale;

        const prevAlpha = ctx.globalAlpha;
        const prevBlend = ctx.globalCompositeOperation;
        ctx.globalAlpha = alpha;
        ctx.globalCompositeOperation = o.blendMode;
        ctx.drawImage(img, o.x - w / 2, o.y - h / 2, w, h);
        ctx.globalAlpha = prevAlpha;
        ctx.globalCompositeOperation = prevBlend;
    }

    // Draw sequences (mid layer)
    for (const s of state.sequences) {
        const elapsed = animTime - s.startTime;
        let frameIndex = Math.floor(elapsed / s.frameDuration);

        if (s.loop) {
            frameIndex = frameIndex % s.frameUrls.length;
        } else if (frameIndex >= s.frameUrls.length) {
            continue;
        }

        const img = getImage(s.frameUrls[frameIndex]);
        if (!img) continue;

        const w = img.naturalWidth * s.scale;
        const h = img.naturalHeight * s.scale;

        if (s.tint) {
            drawTintedImage(ctx, img, s.x - w / 2, s.y - h / 2, w, h, s.tint, s.alpha, s.blendMode);
        } else {
            const prevAlpha = ctx.globalAlpha;
            const prevBlend = ctx.globalCompositeOperation;
            ctx.globalAlpha = s.alpha;
            ctx.globalCompositeOperation = s.blendMode;
            ctx.drawImage(img, s.x - w / 2, s.y - h / 2, w, h);
            ctx.globalAlpha = prevAlpha;
            ctx.globalCompositeOperation = prevBlend;
        }
    }

    // Draw particles (top layer)
    for (const p of state.particles) {
        const img = getImage(p.spriteUrl);
        if (!img) continue;

        const w = img.naturalWidth * p.scale;
        const h = img.naturalHeight * p.scale;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        drawTintedImage(ctx, img, -w / 2, -h / 2, w, h, p.tint, p.alpha, p.blendMode);

        ctx.restore();
    }
}

// =============================================================================
// Convenience: check if state has any active effects
// =============================================================================

export function hasActiveEffects(state: CanvasEffectState): boolean {
    return state.particles.length > 0 || state.sequences.length > 0 || state.overlays.length > 0;
}

// =============================================================================
// Image preloading helper
// =============================================================================

/**
 * Collect all sprite URLs from an EffectAssetManifest for preloading.
 */
export function getAllEffectSpriteUrls(manifest: { baseUrl: string; particles?: Record<string, string[] | string | undefined>; animations?: Record<string, string[] | undefined> }): string[] {
    const urls: string[] = [];
    const base = manifest.baseUrl;

    if (manifest.particles) {
        for (const value of Object.values(manifest.particles)) {
            if (Array.isArray(value)) {
                value.forEach(v => urls.push(`${base}/${v}`));
            } else if (typeof value === 'string') {
                urls.push(`${base}/${value}`);
            }
        }
    }

    if (manifest.animations) {
        for (const frames of Object.values(manifest.animations)) {
            if (Array.isArray(frames)) {
                frames.forEach(f => urls.push(`${base}/${f}`));
            }
        }
    }

    return urls;
}
