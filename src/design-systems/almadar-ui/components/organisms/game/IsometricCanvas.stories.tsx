import type { Meta, StoryObj } from '@storybook/react-vite';
import { IsometricCanvas } from './IsometricCanvas';
import type { IsometricTile, IsometricUnit, IsometricFeature } from './types/isometric';

// =============================================================================
// Helpers: generate tile grids
// =============================================================================

function generateGrid(width: number, height: number, terrainFn?: (x: number, y: number) => string): IsometricTile[] {
    const tiles: IsometricTile[] = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            tiles.push({
                x,
                y,
                terrain: terrainFn ? terrainFn(x, y) : 'grass',
                passable: true,
            });
        }
    }
    return tiles;
}

function worldMapTerrain(x: number, y: number): string {
    // Create a varied world map with water borders, mountains, stone paths
    if (x === 0 || y === 0 || x === 11 || y === 11) return 'water';
    if ((x === 3 && y >= 2 && y <= 4) || (x === 4 && y === 3)) return 'mountain';
    if ((x === 8 && y >= 7 && y <= 9) || (x === 9 && y === 8)) return 'mountain';
    if (y === 6 && x >= 2 && x <= 9) return 'stone';
    if (x === 5 && y >= 3 && y <= 9) return 'stone';
    return 'grass';
}

function battleTerrain(x: number, y: number): string {
    if ((x + y) % 7 === 0) return 'stone';
    if (x === 0 || x === 7 || y === 0 || y === 7) return 'stone';
    return 'grass';
}

function castleTerrain(x: number, y: number): string {
    if (x >= 2 && x <= 5 && y >= 2 && y <= 5) return 'stone';
    if (x === 0 || x === 7 || y === 0 || y === 7) return 'water';
    return 'grass';
}

// =============================================================================
// Sample data
// =============================================================================

const worldMapTiles = generateGrid(12, 12, worldMapTerrain);

const worldMapFeatures: IsometricFeature[] = [
    { x: 2, y: 2, type: 'castle' },
    { x: 9, y: 3, type: 'goldMine' },
    { x: 5, y: 9, type: 'portal' },
    { x: 7, y: 5, type: 'sawmill' },
    { x: 1, y: 8, type: 'crystalCavern' },
];

const worldMapUnits: IsometricUnit[] = [
    { id: 'hero-1', position: { x: 3, y: 5 }, name: 'Archmage', team: 'player', health: 120, maxHealth: 120 },
    { id: 'hero-2', position: { x: 8, y: 4 }, name: 'Warlord', team: 'enemy', health: 95, maxHealth: 100 },
    { id: 'scout', position: { x: 6, y: 8 }, name: 'Scout', team: 'neutral' },
];

const battleTiles = generateGrid(8, 8, battleTerrain);

const battleUnits: IsometricUnit[] = [
    { id: 'p1', position: { x: 1, y: 1 }, name: 'Knight', team: 'player', health: 80, maxHealth: 100 },
    { id: 'p2', position: { x: 1, y: 3 }, name: 'Archer', team: 'player', health: 60, maxHealth: 60 },
    { id: 'p3', position: { x: 2, y: 2 }, name: 'Mage', team: 'player', health: 45, maxHealth: 50 },
    { id: 'e1', position: { x: 6, y: 5 }, name: 'Orc', team: 'enemy', health: 70, maxHealth: 90 },
    { id: 'e2', position: { x: 5, y: 6 }, name: 'Goblin', team: 'enemy', health: 30, maxHealth: 40 },
    { id: 'e3', position: { x: 6, y: 6 }, name: 'Troll', team: 'enemy', health: 120, maxHealth: 150 },
];

const castleTiles = generateGrid(8, 8, castleTerrain);

const castleFeatures: IsometricFeature[] = [
    { x: 3, y: 3, type: 'castle' },
    { x: 2, y: 6, type: 'sawmill' },
    { x: 6, y: 2, type: 'goldMine' },
];

const garrisonUnits: IsometricUnit[] = [
    { id: 'g1', position: { x: 3, y: 4 }, name: 'Guardian', team: 'player', health: 100, maxHealth: 100 },
    { id: 'g2', position: { x: 4, y: 3 }, name: 'Sentinel', team: 'player', health: 85, maxHealth: 85 },
    { id: 'g3', position: { x: 4, y: 4 }, name: 'Recruit', team: 'player', health: 40, maxHealth: 40 },
];

// =============================================================================
// Meta
// =============================================================================

const meta: Meta<typeof IsometricCanvas> = {
    title: 'Organisms/Game/IsometricCanvas',
    component: IsometricCanvas,
    parameters: {
        layout: 'fullscreen',
    },
    decorators: [
        (Story) => (
            <div style={{ width: '100%', height: '600px', background: '#0a0a1a' }}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// Stories
// =============================================================================

/** Large isometric world map with features, units, and minimap */
export const WorldMap: Story = {
    args: {
        tiles: worldMapTiles,
        units: worldMapUnits,
        features: worldMapFeatures,
        scale: 0.35,
        showMinimap: true,
        enableCamera: true,
        debug: false,
    },
};

/** Tactical battle grid with player and enemy units, valid moves, and attack targets */
export const Battle: Story = {
    args: {
        tiles: battleTiles,
        units: battleUnits,
        selectedUnitId: 'p1',
        validMoves: [
            { x: 2, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 0 }, { x: 0, y: 1 },
            { x: 3, y: 1 }, { x: 1, y: 0 }, { x: 3, y: 2 },
        ],
        attackTargets: [
            { x: 6, y: 5 }, { x: 5, y: 6 },
        ],
        scale: 0.5,
        showMinimap: true,
        enableCamera: true,
    },
};

/** Castle view with garrison, buildings, and surrounding terrain */
export const Castle: Story = {
    args: {
        tiles: castleTiles,
        units: garrisonUnits,
        features: castleFeatures,
        scale: 0.5,
        showMinimap: false,
        enableCamera: true,
    },
};

/** Empty canvas with no data — dark background with nothing rendered */
export const Empty: Story = {
    args: {
        tiles: [],
        units: [],
        features: [],
    },
};

/** Loading state — shows the LoadingState component */
export const Loading: Story = {
    args: {
        isLoading: true,
        tiles: [],
    },
};

/** Error state — shows the ErrorState component with retry option */
export const ErrorStory: Story = {
    name: 'Error',
    args: {
        error: new Error('Failed to load map data. Network request timed out.'),
        tiles: [],
    },
};

/** Debug mode enabled — shows tile coordinates and grid lines */
export const Debug: Story = {
    args: {
        tiles: generateGrid(6, 6),
        units: [
            { id: 'u1', position: { x: 2, y: 3 }, name: 'Unit A', team: 'player', health: 70, maxHealth: 100 },
        ],
        debug: true,
        scale: 0.6,
        showMinimap: false,
    },
};

/** Small 4×4 grid at large scale to inspect tile rendering */
export const SmallGrid: Story = {
    args: {
        tiles: generateGrid(4, 4, (x, y) => (x + y) % 3 === 0 ? 'stone' : 'grass'),
        features: [{ x: 1, y: 1, type: 'goldMine' }],
        units: [{ id: 's1', position: { x: 2, y: 2 }, name: 'Hero', team: 'player', health: 50, maxHealth: 50 }],
        scale: 1.0,
        showMinimap: false,
        enableCamera: false,
    },
};

/** Unit with movement trail ghost */
export const MovementTrail: Story = {
    args: {
        tiles: generateGrid(6, 6),
        units: [
            {
                id: 'moving',
                position: { x: 4, y: 3 },
                previousPosition: { x: 2, y: 1 },
                name: 'Ranger',
                team: 'player',
                health: 60,
                maxHealth: 80,
            },
        ],
        scale: 0.6,
        showMinimap: false,
    },
};

/** Demonstrates remote asset loading via assetBaseUrl + assetManifest.
 *  When deployed, sprites load from Firebase CDN instead of local static files. */
export const RemoteAssets: Story = {
    args: {
        tiles: generateGrid(6, 6, (x, y) => {
            if (x === 0 || y === 0 || x === 5 || y === 5) return 'water';
            if ((x + y) % 3 === 0) return 'stone';
            return 'grass';
        }),
        units: [
            { id: 'u1', position: { x: 2, y: 2 }, name: 'Archivist', unitType: 'archivist', team: 'player', health: 80, maxHealth: 100 },
            { id: 'u2', position: { x: 4, y: 3 }, name: 'Guardian', unitType: 'guardian', team: 'player', health: 100, maxHealth: 100 },
            { id: 'u3', position: { x: 3, y: 4 }, name: 'Glitch', unitType: 'glitch', team: 'enemy', health: 60, maxHealth: 80 },
        ],
        features: [
            { x: 1, y: 1, type: 'town_hall' },
            { x: 4, y: 1, type: 'barracks' },
        ],
        assetBaseUrl: 'https://trait-wars-assets.web.app',
        assetManifest: {
            terrains: {
                grass: '/isometric-dungeon/Isometric/stone_N.png',
                water: '/isometric-dungeon/Isometric/bridgeBroken_N.png',
                stone: '/isometric-dungeon/Isometric/barrel_N.png',
            },
            units: {
                archivist: '/units/archivist.png',
                guardian: '/units/guardian.png',
                glitch: '/units/glitch.png',
            },
            features: {
                town_hall: '/buildings/town_hall.png',
                barracks: '/buildings/barracks.png',
            },
        },
        scale: 0.5,
        showMinimap: false,
        enableCamera: true,
    },
};
