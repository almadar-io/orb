/**
 * GameCanvas3D Stories
 *
 * Storybook stories for the GameCanvas3D component.
 * Demonstrates 3D canvas with various configurations.
 *
 * @packageDocumentation
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { GameCanvas3D } from './GameCanvas3D';
import type { IsometricTile, IsometricUnit, IsometricFeature } from './types/isometric';

// =============================================================================
// Helpers: generate 3D tile grids
// =============================================================================

function generateGrid3D(width: number, height: number, terrainFn?: (x: number, z: number) => string): IsometricTile[] {
    const tiles: IsometricTile[] = [];
    for (let z = 0; z < height; z++) {
        for (let x = 0; x < width; x++) {
            const terrain = terrainFn ? terrainFn(x, z) : 'grass';
            tiles.push({
                id: `tile-${x}-${z}`,
                x,
                y: z,
                type: terrain,
                terrain,
                passable: terrain !== 'water' && terrain !== 'mountain',
                z,
            });
        }
    }
    return tiles;
}

function worldMapTerrain3D(x: number, z: number): string {
    // Create a varied world map with water borders, mountains, stone paths
    if (x === 0 || z === 0 || x === 11 || z === 11) return 'water';
    if ((x === 3 && z >= 2 && z <= 4) || (x === 4 && z === 3)) return 'mountain';
    if ((x === 8 && z >= 7 && z <= 9) || (x === 9 && z === 8)) return 'mountain';
    if (z === 6 && x >= 2 && x <= 9) return 'stone';
    if (x === 5 && z >= 3 && z <= 9) return 'stone';
    return 'grass';
}

function battleTerrain3D(x: number, z: number): string {
    if ((x + z) % 7 === 0) return 'stone';
    if (x === 0 || x === 7 || z === 0 || z === 7) return 'stone';
    return 'grass';
}

function castleTerrain3D(x: number, z: number): string {
    if (x >= 2 && x <= 5 && z >= 2 && z <= 5) return 'stone';
    if (x === 0 || x === 7 || z === 0 || z === 7) return 'water';
    return 'grass';
}

// =============================================================================
// Sample data
// =============================================================================

const worldMapTiles = generateGrid3D(12, 12, worldMapTerrain3D);

const worldMapFeatures: IsometricFeature[] = [
    { id: 'castle-1', x: 2, y: 2, z: 2, type: 'castle' },
    { id: 'mine-1', x: 9, y: 3, z: 3, type: 'rock' },
    { id: 'tree-1', x: 5, y: 9, z: 9, type: 'tree' },
    { id: 'tree-2', x: 7, y: 5, z: 5, type: 'tree' },
    { id: 'rock-1', x: 1, y: 8, z: 8, type: 'rock' },
];

const worldMapUnits: IsometricUnit[] = [
    { 
        id: 'hero-1', 
        position: { x: 3, y: 5 },
        x: 3, 
        z: 5, 
        name: 'Archmage', 
        faction: 'player', 
        team: 'player',
        health: 120, 
        maxHealth: 120,
        unitType: 'mage'
    },
    { 
        id: 'hero-2', 
        position: { x: 8, y: 4 },
        x: 8, 
        z: 4, 
        name: 'Warlord', 
        faction: 'enemy', 
        team: 'enemy',
        health: 95, 
        maxHealth: 100,
        unitType: 'warrior'
    },
    { 
        id: 'scout',
        position: { x: 6, y: 8 },
        x: 6, 
        z: 8, 
        name: 'Scout', 
        faction: 'neutral', 
        team: 'neutral',
        unitType: 'scout'
    },
];

const battleTiles = generateGrid3D(8, 8, battleTerrain3D);

const battleUnits: IsometricUnit[] = [
    { id: 'p1', position: { x: 1, y: 1 }, x: 1, z: 1, name: 'Knight', faction: 'player', team: 'player', health: 80, maxHealth: 100 },
    { id: 'p2', position: { x: 1, y: 3 }, x: 1, z: 3, name: 'Archer', faction: 'player', team: 'player', health: 60, maxHealth: 60 },
    { id: 'p3', position: { x: 2, y: 2 }, x: 2, z: 2, name: 'Mage', faction: 'player', team: 'player', health: 45, maxHealth: 50 },
    { id: 'e1', position: { x: 6, y: 5 }, x: 6, z: 5, name: 'Orc', faction: 'enemy', team: 'enemy', health: 70, maxHealth: 90 },
    { id: 'e2', position: { x: 5, y: 6 }, x: 5, z: 6, name: 'Goblin', faction: 'enemy', team: 'enemy', health: 30, maxHealth: 40 },
    { id: 'e3', position: { x: 6, y: 6 }, x: 6, z: 6, name: 'Troll', faction: 'enemy', team: 'enemy', health: 120, maxHealth: 150 },
];

const castleTiles = generateGrid3D(8, 8, castleTerrain3D);

const castleFeatures: IsometricFeature[] = [
    { id: 'castle-main', x: 3, y: 3, z: 3, type: 'castle' },
    { id: 'tree-3', x: 2, y: 6, z: 6, type: 'tree' },
    { id: 'rock-2', x: 6, y: 2, z: 2, type: 'rock' },
];

const garrisonUnits: IsometricUnit[] = [
    { id: 'g1', position: { x: 3, y: 4 }, x: 3, z: 4, name: 'Guardian', faction: 'player', team: 'player', health: 100, maxHealth: 100 },
    { id: 'g2', position: { x: 4, y: 3 }, x: 4, z: 3, name: 'Sentinel', faction: 'player', team: 'player', health: 85, maxHealth: 85 },
    { id: 'g3', position: { x: 4, y: 4 }, x: 4, z: 4, name: 'Recruit', faction: 'player', team: 'player', health: 40, maxHealth: 40 },
];

// =============================================================================
// Meta
// =============================================================================

const meta: Meta<typeof GameCanvas3D> = {
    title: 'Organisms/Game/GameCanvas3D',
    component: GameCanvas3D,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: 'Three.js-powered 3D game canvas component. Supports isometric, perspective, and top-down camera modes. Mirrors the IsometricCanvas API.',
            },
        },
    },
    tags: ['autodocs'],
    argTypes: {
        cameraMode: {
            control: 'select',
            options: ['isometric', 'perspective', 'top-down'],
            description: 'Camera viewing mode',
        },
        showGrid: {
            control: 'boolean',
            description: 'Show grid helper',
        },
        shadows: {
            control: 'boolean',
            description: 'Enable shadow mapping',
        },
        backgroundColor: {
            control: 'color',
            description: 'Background color',
        },
        showCoordinates: {
            control: 'boolean',
            description: 'Show coordinate overlay on hover',
        },
        showTileInfo: {
            control: 'boolean',
            description: 'Show tile type info on hover',
        },
    },
};

export default meta;
type Story = StoryObj<typeof GameCanvas3D>;

// =============================================================================
// Stories
// =============================================================================

/**
 * World Map view with varied terrain, features, and units.
 */
export const WorldMap: Story = {
    args: {
        tiles: worldMapTiles,
        features: worldMapFeatures,
        units: worldMapUnits,
        cameraMode: 'isometric',
        showGrid: true,
        showCoordinates: true,
        showTileInfo: true,
        shadows: true,
        backgroundColor: '#1a1a2e',
    },
    parameters: {
        docs: {
            description: {
                story: 'A world map view demonstrating varied terrain types (grass, stone, water, mountain), features (castles, trees, rocks), and units with different factions.',
            },
        },
    },
};

/**
 * Battle scene with player vs enemy units.
 */
export const BattleScene: Story = {
    args: {
        tiles: battleTiles,
        units: battleUnits,
        cameraMode: 'perspective',
        showGrid: true,
        showCoordinates: false,
        shadows: true,
        backgroundColor: '#2a1a1a',
    },
    parameters: {
        docs: {
            description: {
                story: 'A battle scene with player and enemy units positioned for combat. Uses perspective camera for dramatic effect.',
            },
        },
    },
};

/**
 * Castle garrison view with defensive positioning.
 */
export const CastleGarrison: Story = {
    args: {
        tiles: castleTiles,
        features: castleFeatures,
        units: garrisonUnits,
        cameraMode: 'isometric',
        showGrid: true,
        shadows: true,
        backgroundColor: '#1e1e2e',
    },
    parameters: {
        docs: {
            description: {
                story: 'Castle garrison view showing defensive unit positioning around the main castle structure.',
            },
        },
    },
};

/**
 * Top-down tactical view.
 */
export const TopDownTactical: Story = {
    args: {
        tiles: battleTiles,
        units: battleUnits,
        features: [
            { id: 'cover-1', x: 3, y: 3, z: 3, type: 'rock' },
            { id: 'cover-2', x: 5, y: 5, z: 5, type: 'rock' },
        ],
        cameraMode: 'top-down',
        showGrid: true,
        shadows: false,
        backgroundColor: '#0a0a1a',
    },
    parameters: {
        docs: {
            description: {
                story: 'Top-down tactical view ideal for strategy and planning. Shows the entire battlefield from above.',
            },
        },
    },
};

/**
 * Loading state demonstration.
 */
export const LoadingState: Story = {
    args: {
        tiles: [],
        units: [],
        features: [],
        isLoading: true,
        cameraMode: 'isometric',
    },
    parameters: {
        docs: {
            description: {
                story: 'Loading state with animated spinner and progress indicator.',
            },
        },
    },
};

/**
 * Error state demonstration.
 */
export const ErrorState: Story = {
    args: {
        tiles: [],
        units: [],
        features: [],
        error: 'Failed to load 3D assets: Network error',
        cameraMode: 'isometric',
    },
    parameters: {
        docs: {
            description: {
                story: 'Error state with error details and retry options.',
            },
        },
    },
};

/**
 * With valid moves and attack targets highlighted.
 */
export const WithHighlights: Story = {
    args: {
        tiles: battleTiles,
        units: battleUnits,
        selectedUnitId: 'p1',
        validMoves: [
            { x: 2, z: 1 },
            { x: 3, z: 1 },
            { x: 2, z: 2 },
            { x: 1, z: 2 },
        ],
        attackTargets: [
            { x: 5, z: 5 },
            { x: 6, z: 6 },
        ],
        cameraMode: 'isometric',
        showGrid: true,
        shadows: true,
        backgroundColor: '#1a1a2e',
    },
    parameters: {
        docs: {
            description: {
                story: 'Demonstrates valid move highlighting (green) and attack target highlighting (red). Selected unit has a yellow selection ring.',
            },
        },
    },
};

/**
 * Empty grid for testing.
 */
export const EmptyGrid: Story = {
    args: {
        tiles: generateGrid3D(10, 10),
        cameraMode: 'isometric',
        showGrid: true,
        shadows: true,
        backgroundColor: '#1a1a2e',
    },
    parameters: {
        docs: {
            description: {
                story: 'Empty 10x10 grid for testing basic rendering performance.',
            },
        },
    },
};

/**
 * Large map stress test.
 */
export const LargeMap: Story = {
    args: {
        tiles: generateGrid3D(30, 30, (x, z) => {
            if (x === 0 || z === 0 || x === 29 || z === 29) return 'water';
            if (Math.random() > 0.9) return 'mountain';
            if (Math.random() > 0.8) return 'stone';
            return 'grass';
        }),
        features: Array.from({ length: 50 }, (_, i) => {
            const z = Math.floor(Math.random() * 28) + 1;
            return {
                id: `feature-${i}`,
                x: Math.floor(Math.random() * 28) + 1,
                y: z,
                z,
                type: Math.random() > 0.5 ? 'tree' : 'rock',
            };
        }),
        units: Array.from({ length: 20 }, (_, i) => {
            const z = Math.floor(Math.random() * 28) + 1;
            return {
                id: `unit-${i}`,
                x: Math.floor(Math.random() * 28) + 1,
                y: z,
                z,
                name: `Unit ${i}`,
                faction: Math.random() > 0.5 ? 'player' : 'enemy',
                team: Math.random() > 0.5 ? 'player' : 'enemy',
                health: Math.floor(Math.random() * 100),
                maxHealth: 100,
            };
        }),
        cameraMode: 'isometric',
        showGrid: false,
        shadows: true,
        backgroundColor: '#1a1a2e',
        useInstancing: true,
    },
    parameters: {
        docs: {
            description: {
                story: 'Large 30x30 map with 50 features and 20 units. Tests instancing performance and frustum culling.',
            },
        },
    },
};
