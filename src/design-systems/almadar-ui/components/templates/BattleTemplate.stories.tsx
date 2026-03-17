import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { BattleTemplate } from './BattleTemplate';
import type { BattleUnit } from './BattleTemplate';
import type { IsometricTile } from '../organisms/game/types/isometric';

// =============================================================================
// MOCK DATA
// =============================================================================

/** Generate a simple 8×6 dungeon grid */
function generateMockTiles(w = 8, h = 6): IsometricTile[] {
    const tiles: IsometricTile[] = [];
    const terrains = ['stone_floor', 'cobblestone', 'dirt'];
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            tiles.push({
                x,
                y,
                terrain: terrains[(x + y) % terrains.length],
            });
        }
    }
    return tiles;
}

const MOCK_UNITS: BattleUnit[] = [
    {
        id: 'hero-1',
        name: 'Iron Sentinel',
        team: 'player',
        position: { x: 1, y: 2 },
        health: 80,
        maxHealth: 100,
        movement: 3,
        attack: 12,
        defense: 6,
    },
    {
        id: 'hero-2',
        name: 'Crystal Mage',
        team: 'player',
        position: { x: 2, y: 4 },
        health: 60,
        maxHealth: 60,
        movement: 2,
        attack: 18,
        defense: 3,
    },
    {
        id: 'enemy-1',
        name: 'Dark Golem',
        team: 'enemy',
        position: { x: 5, y: 1 },
        health: 100,
        maxHealth: 100,
        movement: 2,
        attack: 10,
        defense: 8,
    },
    {
        id: 'enemy-2',
        name: 'Shadow Stalker',
        team: 'enemy',
        position: { x: 6, y: 3 },
        health: 50,
        maxHealth: 50,
        movement: 4,
        attack: 14,
        defense: 4,
    },
];

// =============================================================================
// META
// =============================================================================

const meta: Meta<typeof BattleTemplate> = {
    title: 'Templates/Game/BattleTemplate',
    component: BattleTemplate,
    parameters: {
        layout: 'fullscreen',
    },
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
            id: 'battle-default',
            units: MOCK_UNITS,
            tiles: generateMockTiles(),
            phase: 'selection',
            turn: 1,
            gameResult: null,
            selectedUnitId: null,
        },
        scale: 0.45,
    },
};

export const MinimalNoSlots: Story = {
    args: {
        entity: {
            id: 'battle-minimal',
            units: MOCK_UNITS,
            tiles: generateMockTiles(),
            phase: 'selection',
            turn: 1,
            gameResult: null,
            selectedUnitId: null,
        },
        scale: 0.45,
    },
};

export const LargeMap: Story = {
    args: {
        entity: {
            id: 'battle-large',
            units: [
                ...MOCK_UNITS,
                {
                    id: 'hero-3',
                    name: 'Storm Knight',
                    team: 'player' as const,
                    position: { x: 3, y: 6 },
                    health: 90,
                    maxHealth: 90,
                    movement: 3,
                    attack: 15,
                    defense: 5,
                },
                {
                    id: 'enemy-3',
                    name: 'Plague Drone',
                    team: 'enemy' as const,
                    position: { x: 9, y: 2 },
                    health: 40,
                    maxHealth: 40,
                    movement: 5,
                    attack: 8,
                    defense: 2,
                },
            ],
            tiles: generateMockTiles(12, 8),
            boardWidth: 12,
            boardHeight: 8,
            phase: 'selection',
            turn: 1,
            gameResult: null,
            selectedUnitId: null,
        },
        scale: 0.35,
    },
};
