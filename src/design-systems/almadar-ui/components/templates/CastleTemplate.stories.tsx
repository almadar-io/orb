import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { CastleTemplate } from './CastleTemplate';
import type { IsometricTile, IsometricFeature, IsometricUnit } from '../organisms/game/types/isometric';

// =============================================================================
// MOCK DATA
// =============================================================================

function generateCastleTiles(w = 10, h = 10): IsometricTile[] {
    const tiles: IsometricTile[] = [];
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const isWall = x === 0 || y === 0 || x === w - 1 || y === h - 1;
            tiles.push({
                x,
                y,
                terrain: isWall ? 'stone_wall' : 'stone_floor',
                passable: !isWall,
            });
        }
    }
    return tiles;
}

const MOCK_FEATURES: IsometricFeature[] = [
    { x: 2, y: 2, type: 'townHall' },
    { x: 5, y: 2, type: 'barracks' },
    { x: 2, y: 5, type: 'arcaneTower' },
    { x: 5, y: 5, type: 'traitForge' },
    { x: 7, y: 3, type: 'marketplace' },
];

const MOCK_UNITS: IsometricUnit[] = [
    { id: 'guard-1', position: { x: 3, y: 4 }, name: 'Guard x5', team: 'player' },
    { id: 'guard-2', position: { x: 4, y: 6 }, name: 'Mage x2', team: 'player' },
    { id: 'hero', position: { x: 4, y: 8 }, name: 'Sir Kaelen', team: 'player' },
];

// =============================================================================
// META
// =============================================================================

const meta: Meta<typeof CastleTemplate> = {
    title: 'Templates/Game/CastleTemplate',
    component: CastleTemplate,
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
            id: 'castle-default',
            tiles: generateCastleTiles(),
            features: MOCK_FEATURES,
            units: MOCK_UNITS,
        },
        scale: 0.45,
    },
};

export const MinimalNoSlots: Story = {
    args: {
        entity: {
            id: 'castle-minimal',
            tiles: generateCastleTiles(),
            features: MOCK_FEATURES,
            units: MOCK_UNITS,
        },
        scale: 0.45,
    },
};
