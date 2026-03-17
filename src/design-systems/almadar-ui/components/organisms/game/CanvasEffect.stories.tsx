import React, { useState, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CanvasEffect } from './CanvasEffect';
import type { CombatActionType, EffectAssetManifest } from './types/effects';

const meta: Meta<typeof CanvasEffect> = {
    title: 'Organisms/Game/CanvasEffect',
    component: CanvasEffect,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
    },
    tags: ['autodocs'],
    argTypes: {
        actionType: {
            control: 'select',
            options: ['melee', 'ranged', 'magic', 'heal', 'defend', 'hit', 'death', 'buff', 'debuff', 'shield', 'aoe', 'critical'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof CanvasEffect>;

// =============================================================================
// Effect Asset Manifest for stories (using Firebase CDN)
// =============================================================================

const STORY_MANIFEST: EffectAssetManifest = {
    baseUrl: 'https://trait-wars-assets.web.app',
    particles: {
        slash: Array.from({ length: 4 }, (_, i) => `effects/particles/slash_0${i + 1}.png`),
        magic: Array.from({ length: 5 }, (_, i) => `effects/particles/magic_0${i + 1}.png`),
        fire: Array.from({ length: 2 }, (_, i) => `effects/particles/fire_0${i + 1}.png`),
        flame: Array.from({ length: 6 }, (_, i) => `effects/particles/flame_0${i + 1}.png`),
        smoke: Array.from({ length: 10 }, (_, i) => `effects/particles/smoke_${String(i + 1).padStart(2, '0')}.png`),
        scorch: Array.from({ length: 3 }, (_, i) => `effects/particles/scorch_0${i + 1}.png`),
        circle: Array.from({ length: 5 }, (_, i) => `effects/particles/circle_0${i + 1}.png`),
        flare: 'effects/particles/flare_01.png',
        spark: Array.from({ length: 7 }, (_, i) => `effects/particles/spark_0${i + 1}.png`),
        muzzle: Array.from({ length: 5 }, (_, i) => `effects/particles/muzzle_0${i + 1}.png`),
        star: Array.from({ length: 9 }, (_, i) => `effects/particles/star_0${i + 1}.png`),
        trace: Array.from({ length: 7 }, (_, i) => `effects/particles/trace_0${i + 1}.png`),
        twirl: Array.from({ length: 3 }, (_, i) => `effects/particles/twirl_0${i + 1}.png`),
        light: Array.from({ length: 3 }, (_, i) => `effects/particles/light_0${i + 1}.png`),
        dirt: Array.from({ length: 3 }, (_, i) => `effects/particles/dirt_0${i + 1}.png`),
        scratch: ['effects/particles/scratch_01.png'],
        symbol: Array.from({ length: 2 }, (_, i) => `effects/particles/symbol_0${i + 1}.png`),
    },
    animations: {
        explosion: Array.from({ length: 9 }, (_, i) => `effects/explosions/regular/regularExplosion0${i}.png`),
        flash: Array.from({ length: 9 }, (_, i) => `effects/flash/flash0${i}.png`),
        blackSmoke: Array.from({ length: 25 }, (_, i) => `effects/black-smoke/blackSmoke${String(i).padStart(2, '0')}.png`),
        gasSmoke: Array.from({ length: 9 }, (_, i) => `effects/gas/gas0${i}.png`),
        smokeExplosion: Array.from({ length: 9 }, (_, i) => `effects/explosions/smoke-explosion/explosion0${i}.png`),
    },
};

// =============================================================================
// Emoji Fallback Stories (no manifest)
// =============================================================================

/** Default emoji-based effect (no asset manifest) */
export const Default: Story = {
    args: {
        actionType: 'magic',
        x: 200,
        y: 150,
        duration: 60000,
        intensity: 1.5,
    },
};

/** All 9 combat actions rendered with emoji fallback */
export const AllEmoji: Story = {
    render: () => {
        const types: CombatActionType[] = ['melee', 'ranged', 'magic', 'heal', 'buff', 'debuff', 'shield', 'aoe', 'critical'];
        return (
            <div style={{ position: 'relative', width: 900, height: 400 }}>
                {types.map((type, i) => {
                    const col = i % 3;
                    const row = Math.floor(i / 3);
                    return (
                        <div key={type}>
                            <span style={{ color: '#94a3b8', fontSize: '0.7rem', position: 'absolute', left: 80 + col * 250, top: 15 + row * 130, zIndex: 100 }}>
                                {type}
                            </span>
                            <CanvasEffect
                                actionType={type}
                                x={100 + col * 250}
                                y={60 + row * 130}
                                duration={60000}
                                intensity={1}
                            />
                        </div>
                    );
                })}
            </div>
        );
    },
};

// =============================================================================
// Canvas Particle Engine Stories (with manifest)
// =============================================================================

/** Single melee effect using sprite particle engine */
export const SpriteParticleEffect: Story = {
    args: {
        actionType: 'melee',
        x: 200,
        y: 150,
        duration: 60000,
        intensity: 1.5,
        assetManifest: STORY_MANIFEST,
        width: 400,
        height: 300,
    },
};

/** Interactive showcase — click buttons to spawn effects */
function EffectShowcase() {
    const ALL_TYPES: CombatActionType[] = ['melee', 'ranged', 'magic', 'heal', 'defend', 'hit', 'death', 'buff', 'debuff', 'shield', 'aoe', 'critical'];
    const [effects, setEffects] = useState<Array<{ id: number; type: CombatActionType }>>([]);
    const nextId = React.useRef(0);

    const spawn = useCallback((type: CombatActionType) => {
        const id = nextId.current++;
        setEffects(prev => [...prev, { id, type }]);
        // Auto-remove after 3s
        setTimeout(() => setEffects(prev => prev.filter(e => e.id !== id)), 3000);
    }, []);

    const COLORS: Record<string, string> = {
        melee: '#dc2626', ranged: '#ca8a04', magic: '#9333ea', heal: '#16a34a',
        defend: '#2563eb', hit: '#ea580c', death: '#4b5563', buff: '#d97706',
        debuff: '#7c3aed', shield: '#0891b2', aoe: '#ef4444', critical: '#f97316',
    };

    return (
        <div style={{ padding: '1rem', background: '#111827', borderRadius: '0.75rem', maxWidth: 550 }}>
            <p style={{ color: '#e5e7eb', fontWeight: 600, marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                Canvas Effect Showcase
            </p>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '1rem' }}>
                Click a button to spawn a particle effect. Each uses real sprites from Firebase CDN.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                {ALL_TYPES.map(type => (
                    <button
                        key={type}
                        onClick={() => spawn(type)}
                        style={{
                            background: COLORS[type], color: '#fff', border: 'none', borderRadius: '0.375rem',
                            padding: '0.3rem 0.7rem', fontSize: '0.75rem', cursor: 'pointer', textTransform: 'capitalize',
                        }}
                    >
                        {type}
                    </button>
                ))}
            </div>
            <div style={{ position: 'relative', width: 500, height: 350, background: '#1f2937', borderRadius: '0.5rem', overflow: 'hidden' }}>
                {effects.map(({ id, type }) => (
                    <CanvasEffect
                        key={id}
                        actionType={type}
                        x={250}
                        y={175}
                        duration={2500}
                        intensity={1.2}
                        assetManifest={STORY_MANIFEST}
                        width={500}
                        height={350}
                    />
                ))}
            </div>
        </div>
    );
}

export const InteractiveShowcase: Story = {
    render: () => <EffectShowcase />,
};

/** Grid showing all 12 effects simultaneously */
export const AllSpriteEffects: Story = {
    render: () => {
        const types: CombatActionType[] = ['melee', 'ranged', 'magic', 'heal', 'defend', 'hit', 'death', 'buff', 'debuff', 'shield', 'aoe', 'critical'];
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', padding: '1rem', background: '#111827', borderRadius: '0.75rem' }}>
                {types.map(type => (
                    <div key={type} style={{ position: 'relative', width: 180, height: 140, background: '#1f2937', borderRadius: '0.5rem', overflow: 'hidden' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.65rem', position: 'absolute', top: 4, left: 8, zIndex: 30, textTransform: 'capitalize' }}>
                            {type}
                        </span>
                        <CanvasEffect
                            actionType={type}
                            x={90}
                            y={80}
                            duration={60000}
                            intensity={0.8}
                            assetManifest={STORY_MANIFEST}
                            width={180}
                            height={140}
                        />
                    </div>
                ))}
            </div>
        );
    },
};
