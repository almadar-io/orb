import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { WorldMapTemplate } from './WorldMapTemplate';
import type { MapHero, MapHex } from './WorldMapTemplate';
import type { IsometricFeature } from '../organisms/game/types/isometric';

// =============================================================================
// MOCK DATA
// =============================================================================

function generateWorldHexes(w = 10, h = 8): MapHex[] {
    const terrains = ['grass', 'forest', 'plains', 'mountain', 'swamp'];
    const hexes: MapHex[] = [];
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const t = terrains[(x * 3 + y * 7) % terrains.length];
            hexes.push({
                x,
                y,
                terrain: t,
                passable: t !== 'mountain',
                feature: (x === 3 && y === 2) ? 'goldMine'
                    : (x === 7 && y === 1) ? 'resonanceCrystal'
                        : (x === 5 && y === 5) ? 'castle'
                            : undefined,
                featureData: (x === 3 && y === 2) ? { resourceType: 'gold', resourceAmount: 300 }
                    : (x === 7 && y === 1) ? { resourceType: 'resonance', resourceAmount: 150 }
                        : (x === 5 && y === 5) ? { castleId: 'castle-1' }
                            : undefined,
            });
        }
    }
    return hexes;
}

const MOCK_HEROES: MapHero[] = [
    { id: 'hero-1', name: 'Sir Kaelen', owner: 'player', position: { x: 1, y: 1 }, movement: 4, level: 5 },
    { id: 'hero-2', name: 'Lady Lumina', owner: 'player', position: { x: 2, y: 5 }, movement: 3, level: 3 },
    { id: 'enemy-1', name: 'Overlord Vexx', owner: 'enemy', position: { x: 8, y: 3 }, movement: 3, level: 6 },
    { id: 'enemy-2', name: 'Dread Scout', owner: 'enemy', position: { x: 6, y: 6 }, movement: 5, level: 2 },
];

const MOCK_FEATURES: IsometricFeature[] = [
    { x: 3, y: 2, type: 'goldMine' },
    { x: 7, y: 1, type: 'resonanceCrystal' },
    { x: 5, y: 5, type: 'castle' },
];

// =============================================================================
// META
// =============================================================================

const meta: Meta<typeof WorldMapTemplate> = {
    title: 'Templates/Game/WorldMapTemplate',
    component: WorldMapTemplate,
    parameters: { layout: 'fullscreen' },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// STORIES
// =============================================================================

export const Default: Story = {
    args: {
        entity: {
            id: 'world-default',
            hexes: generateWorldHexes(),
            heroes: MOCK_HEROES,
            features: MOCK_FEATURES,
        },
        scale: 0.4,
    },
};

export const MinimalNoSlots: Story = {
    args: {
        entity: {
            id: 'world-minimal',
            hexes: generateWorldHexes(),
            heroes: MOCK_HEROES,
            features: MOCK_FEATURES,
        },
        scale: 0.4,
    },
};

export const LargeMap: Story = {
    args: {
        entity: {
            id: 'world-large',
            hexes: generateWorldHexes(16, 12),
            heroes: [
                ...MOCK_HEROES,
                { id: 'hero-3', name: 'Sage Elara', owner: 'player', position: { x: 4, y: 9 }, movement: 2, level: 4 },
            ],
            features: [
                ...MOCK_FEATURES,
                { x: 10, y: 6, type: 'portal' },
                { x: 13, y: 9, type: 'treasure' },
            ],
        },
        scale: 0.3,
    },
};
