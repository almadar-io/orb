/**
 * @almadar/ui - GameCanvas3DAssets Stories
 * 
 * Storybook stories demonstrating GameCanvas3D with actual 3D assets
 * loaded from the Trait Wars CDN (https://trait-wars-assets.web.app/3d/).
 * 
 * All assets are loaded from remote CDN URLs using the GLTFLoader.
 * Preloading is handled automatically when preloadAssets is provided.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { GameCanvas3D } from './GameCanvas3D';
import type { IsometricTile, IsometricFeature, IsometricUnit } from './types/isometric';

// ── Inline 3D asset helpers (mirrors projects/trait-wars/design-system/assets-3d) ──

const DEFAULT_3D_ASSET_MANIFEST = {
    baseUrl: 'https://trait-wars-assets.web.app/3d',
    terrains: {
        'dungeon-floor': 'dungeon/floor/template-floor.glb',
        'dungeon-floor-detail': 'dungeon/floor/template-floor-detail.glb',
        'dungeon-floor-detail-a': 'dungeon/floor/template-floor-detail-a.glb',
    },
    corridors: {
        'corridor': 'dungeon/corridors/corridor.glb',
        'corridor-corner': 'dungeon/corridors/corridor-corner.glb',
        'corridor-junction': 'dungeon/corridors/corridor-junction.glb',
        'corridor-intersection': 'dungeon/corridors/corridor-intersection.glb',
        'corridor-end': 'dungeon/corridors/corridor-end.glb',
    },
    rooms: {
        'room-small': 'dungeon/rooms/room-small.glb',
        'room-large': 'dungeon/rooms/room-large.glb',
        'room-wide': 'dungeon/rooms/room-wide.glb',
        'room-corner': 'dungeon/rooms/room-corner.glb',
    },
    gates: {
        'gate': 'dungeon/gates/gate.glb',
        'gate-door': 'dungeon/gates/gate-door.glb',
    },
    stairs: { 'stairs': 'dungeon/stairs.glb' },
    props: {
        'barrels': 'medieval/props/barrels.glb',
        'crate': 'medieval/props/detail-crate.glb',
        'crate-small': 'medieval/props/detail-crate-small.glb',
        'ladder': 'medieval/props/ladder.glb',
    },
    columns: {
        'column': 'medieval/columns/column.glb',
        'column-damaged': 'medieval/columns/column-damaged.glb',
        'column-wood': 'medieval/columns/column-wood.glb',
    },
    siegeWeapons: {
        'ballista': 'castle/siege/siege-ballista.glb',
        'catapult': 'castle/siege/siege-catapult.glb',
        'ram': 'castle/siege/siege-ram.glb',
    },
    fortifications: {
        'gate': 'castle/fortifications/gate.glb',
        'bridge-straight': 'castle/fortifications/bridge-straight.glb',
        'bridge-draw': 'castle/fortifications/bridge-draw.glb',
    },
    flags: {
        'flag': 'castle/flags/flag.glb',
        'flag-banner-long': 'castle/flags/flag-banner-long.glb',
    },
    graveyard: {
        'coffin': 'graveyard/coffin.glb',
        'coffin-old': 'graveyard/coffin-old.glb',
        'cross-column': 'graveyard/cross-column.glb',
        'altar-stone': 'graveyard/altar-stone.glb',
        'candle': 'graveyard/candle.glb',
    },
};

type Manifest = typeof DEFAULT_3D_ASSET_MANIFEST;

function getUrl(category: Partial<Record<string, string>>, key: string): string | undefined {
    const p = category[key];
    return p ? `${DEFAULT_3D_ASSET_MANIFEST.baseUrl}/${p}` : undefined;
}
function get3DCorridorUrl(m: Manifest, key: string) { return getUrl(m.corridors, key); }
function get3DRoomUrl(m: Manifest, key: string) { return getUrl(m.rooms, key); }
function get3DGateUrl(m: Manifest, key: string) { return getUrl(m.gates, key); }
function get3DPropUrl(m: Manifest, key: string) { return getUrl(m.props, key); }
function get3DColumnUrl(m: Manifest, key: string) { return getUrl(m.columns, key); }
function get3DSiegeWeaponUrl(m: Manifest, key: string) { return getUrl(m.siegeWeapons, key); }
function get3DGraveyardUrl(m: Manifest, key: string) { return getUrl(m.graveyard, key); }
function getAll3DAssetUrls(m: Manifest): string[] {
    const cats: Partial<Record<string, string>>[] = [
        m.terrains, m.corridors, m.rooms, m.gates, m.stairs, m.props,
        m.columns, m.siegeWeapons, m.fortifications, m.flags, m.graveyard,
    ];
    return cats.flatMap(c => Object.values(c).filter(Boolean).map(p => `${m.baseUrl}/${p!}`));
}

// Extend IsometricFeature for stories to include rotation
type StoryFeature = IsometricFeature & { rotation?: number };

// Create asset URL helpers
const ASSETS_3D = {
    corridor: get3DCorridorUrl(DEFAULT_3D_ASSET_MANIFEST, 'corridor')!,
    corridorCorner: get3DCorridorUrl(DEFAULT_3D_ASSET_MANIFEST, 'corridor-corner')!,
    corridorEnd: get3DCorridorUrl(DEFAULT_3D_ASSET_MANIFEST, 'corridor-end')!,
    roomSmall: get3DRoomUrl(DEFAULT_3D_ASSET_MANIFEST, 'room-small')!,
    roomLarge: get3DRoomUrl(DEFAULT_3D_ASSET_MANIFEST, 'room-large')!,
    gate: get3DGateUrl(DEFAULT_3D_ASSET_MANIFEST, 'gate')!,
    gateDoor: get3DGateUrl(DEFAULT_3D_ASSET_MANIFEST, 'gate-door')!,
    barrels: get3DPropUrl(DEFAULT_3D_ASSET_MANIFEST, 'barrels')!,
    crate: get3DPropUrl(DEFAULT_3D_ASSET_MANIFEST, 'crate')!,
    crateSmall: get3DPropUrl(DEFAULT_3D_ASSET_MANIFEST, 'crate-small')!,
    ladder: get3DPropUrl(DEFAULT_3D_ASSET_MANIFEST, 'ladder')!,
    column: get3DColumnUrl(DEFAULT_3D_ASSET_MANIFEST, 'column')!,
    columnDamaged: get3DColumnUrl(DEFAULT_3D_ASSET_MANIFEST, 'column-damaged')!,
    columnWood: get3DColumnUrl(DEFAULT_3D_ASSET_MANIFEST, 'column-wood')!,
    ballista: get3DSiegeWeaponUrl(DEFAULT_3D_ASSET_MANIFEST, 'ballista')!,
    catapult: get3DSiegeWeaponUrl(DEFAULT_3D_ASSET_MANIFEST, 'catapult')!,
    ram: get3DSiegeWeaponUrl(DEFAULT_3D_ASSET_MANIFEST, 'ram')!,
    coffin: get3DGraveyardUrl(DEFAULT_3D_ASSET_MANIFEST, 'coffin')!,
    coffinOld: get3DGraveyardUrl(DEFAULT_3D_ASSET_MANIFEST, 'coffin-old')!,
    crossColumn: get3DGraveyardUrl(DEFAULT_3D_ASSET_MANIFEST, 'cross-column')!,
    altarStone: get3DGraveyardUrl(DEFAULT_3D_ASSET_MANIFEST, 'altar-stone')!,
    candle: get3DGraveyardUrl(DEFAULT_3D_ASSET_MANIFEST, 'candle')!,
};

const ALL_ASSET_URLS = getAll3DAssetUrls(DEFAULT_3D_ASSET_MANIFEST);

/**
 * Generate a simple dungeon tile grid
 */
function generateDungeonMap(width: number, height: number): IsometricTile[] {
    const tiles: IsometricTile[] = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            tiles.push({
                id: `tile-${x}-${y}`,
                x,
                y,
                z: 0,
                type: 'floor',
                terrain: 'stone',
                passable: true,
            });
        }
    }
    return tiles;
}

/**
 * Helper to create tile data
 */
const createTile = (id: string, q: number, r: number, elevation = 0, passable = true): IsometricTile => ({
    id,
    x: q,
    y: r,
    z: 0,
    elevation,
    passable,
    terrain: 'stone',
});

/**
 * Dungeon map with corridor and room
 */
const dungeonTiles: IsometricTile[] = [
    // Corridor path
    createTile('c1', 0, 0, 0),
    createTile('c2', 1, 0, 0),
    createTile('c3', 2, 0, 0),
    createTile('c4', 3, 0, 0),
    createTile('c5', 4, 0, 0),
    // Side room
    createTile('r1', 2, 1, 0),
    createTile('r2', 2, 2, 0),
    createTile('r3', 3, 1, 0),
    createTile('r4', 3, 2, 0),
    // Corner
    createTile('corner1', 5, 0, 0),
    createTile('corner2', 5, 1, 0),
    createTile('corner3', 6, 1, 0),
];

const dungeonFeatures: StoryFeature[] = [
    // Corridor pieces
    { id: 'corridor-1', x: 1, y: 0, z: 0, type: 'corridor', assetUrl: ASSETS_3D.corridor },
    { id: 'corridor-2', x: 2, y: 0, z: 0, type: 'corridor', assetUrl: ASSETS_3D.corridor },
    { id: 'corridor-3', x: 3, y: 0, z: 0, type: 'corridor', assetUrl: ASSETS_3D.corridor },
    // Corner
    { id: 'corner-1', x: 5, y: 0, z: 0, type: 'corridor', assetUrl: ASSETS_3D.corridorCorner, rotation: 90 },
    { id: 'corner-2', x: 5, y: 1, z: 0, type: 'corridor', assetUrl: ASSETS_3D.corridorCorner, rotation: 180 },
    // Room
    { id: 'room-1', x: 2.5, y: 1.5, z: 0, type: 'room', assetUrl: ASSETS_3D.roomSmall },
    // Props
    { id: 'barrels-1', x: 1, y: 1, z: 0, type: 'prop', assetUrl: ASSETS_3D.barrels, rotation: 45 },
    { id: 'column-1', x: 0, y: 0, z: 0, type: 'prop', assetUrl: ASSETS_3D.column },
    { id: 'gate-1', x: 0, y: 0, z: 0, type: 'gate', assetUrl: ASSETS_3D.gate, rotation: -90 },
];

/**
 * Sample units for demonstration
 */
const sampleUnits: IsometricUnit[] = [
    {
        id: 'hero-1',
        x: 1,
        y: 0,
        z: 0,
        unitType: 'hero',
        faction: 'player',
        name: 'Hero',
    },
    {
        id: 'monster-1',
        x: 4,
        y: 0,
        z: 0,
        unitType: 'monster',
        faction: 'enemy',
        name: 'Goblin',
    },
];

const meta: Meta<typeof GameCanvas3D> = {
    title: 'Game/GameCanvas3D/With Assets',
    component: GameCanvas3D,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: `
GameCanvas3D stories with actual 3D assets loaded from CDN.

## Asset Sources

All assets are loaded from the Trait Wars CDN:
\`\`\`
https://trait-wars-assets.web.app/3d/
\`\`\`

Available asset categories:
- **Corridors**: corridor, corridorCorner, corridorEnd
- **Rooms**: roomSmall, roomLarge
- **Gates**: gate
- **Props**: barrels, crate, chest, ladder, bridge
- **Columns**: column, columnDamaged, wallCorner, wallGate
- **Siege**: ballista, catapult
- **Graveyard**: coffin, coffinLid, coffinOld, crossColumn, crossWood, gravestone, plate, shovel

## Preloading

Assets are automatically preloaded using useGLTF.preload() when
\`preloadAssets\` is provided. This ensures smooth rendering without
loading flicker.

## Usage

\`\`\`tsx
import { ASSETS_3D } from '@almadar/trait-wars/assets';

<GameCanvas3D
    features={[
        { id: 'f1', x: 0, y: 0, z: 0, type: 'corridor', assetUrl: ASSETS_3D.corridor },
    ]}
    preloadAssets={[ASSETS_3D.corridor]}
/>
\`\`\`
                `,
            },
        },
    },
    argTypes: {
        cameraMode: {
            control: 'select',
            options: ['isometric', 'top-down', 'perspective'],
        },
        shadows: {
            control: 'boolean',
        },
        showGrid: {
            control: 'boolean',
        },
        isLoading: {
            control: 'boolean',
        },
    },
    decorators: [
        (Story) => (
            <div style={{ width: '100vw', height: '100vh', background: '#1a1a2e' }}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof GameCanvas3D>;

/**
 * Default story - Dungeon corridor with actual 3D assets
 */
export const Default: Story = {
    args: {
        tiles: dungeonTiles,
        features: dungeonFeatures,
        units: sampleUnits,
        cameraMode: 'isometric',
        showGrid: true,
        shadows: true,
        preloadAssets: ALL_ASSET_URLS,
    },
};

/**
 * Full Asset Gallery - Shows all available 3D assets
 */
export const AssetGallery: Story = {
    args: {
        tiles: generateDungeonMap(12, 8),
        features: [
            // Row 1: Corridors
            { id: 'gallery-corridor', x: 0, y: 0, z: 0, type: 'corridor', assetUrl: ASSETS_3D.corridor } as StoryFeature,
            { id: 'gallery-corridorCorner', x: 2, y: 0, z: 0, type: 'corridor', assetUrl: ASSETS_3D.corridorCorner } as StoryFeature,
            { id: 'gallery-corridorEnd', x: 4, y: 0, z: 0, type: 'corridor', assetUrl: ASSETS_3D.corridorEnd } as StoryFeature,
            
            // Row 2: Rooms
            { id: 'gallery-roomSmall', x: 0, y: 2, z: 0, type: 'room', assetUrl: ASSETS_3D.roomSmall } as StoryFeature,
            { id: 'gallery-roomLarge', x: 3, y: 2, z: 0, type: 'room', assetUrl: ASSETS_3D.roomLarge } as StoryFeature,
            
            // Row 3: Gates
            { id: 'gallery-gate', x: 0, y: 4, z: 0, type: 'gate', assetUrl: ASSETS_3D.gate } as StoryFeature,
            
            // Row 4: Props
            { id: 'gallery-barrels', x: 0, y: 6, z: 0, type: 'prop', assetUrl: ASSETS_3D.barrels } as StoryFeature,
            { id: 'gallery-crate', x: 1, y: 6, z: 0, type: 'prop', assetUrl: ASSETS_3D.crate } as StoryFeature,
            { id: 'gallery-crateSmall', x: 2, y: 6, z: 0, type: 'prop', assetUrl: ASSETS_3D.crateSmall } as StoryFeature,
            { id: 'gallery-ladder', x: 3, y: 6, z: 0, type: 'prop', assetUrl: ASSETS_3D.ladder } as StoryFeature,
            { id: 'gallery-ram', x: 4, y: 6, z: 0, type: 'prop', assetUrl: ASSETS_3D.ram } as StoryFeature,
            
            // Row 5: Columns
            { id: 'gallery-column', x: 0, y: 8, z: 0, type: 'prop', assetUrl: ASSETS_3D.column } as StoryFeature,
            { id: 'gallery-columnDamaged', x: 1, y: 8, z: 0, type: 'prop', assetUrl: ASSETS_3D.columnDamaged } as StoryFeature,
            { id: 'gallery-columnWood', x: 2, y: 8, z: 0, type: 'prop', assetUrl: ASSETS_3D.columnWood } as StoryFeature,
            { id: 'gallery-gateDoor', x: 3, y: 8, z: 0, type: 'prop', assetUrl: ASSETS_3D.gateDoor } as StoryFeature,
            
            // Row 6: Siege
            { id: 'gallery-ballista', x: 0, y: 10, z: 0, type: 'prop', assetUrl: ASSETS_3D.ballista } as StoryFeature,
            { id: 'gallery-catapult', x: 2, y: 10, z: 0, type: 'prop', assetUrl: ASSETS_3D.catapult } as StoryFeature,
        ],
        units: [],
        cameraMode: 'top-down',
        showGrid: true,
        shadows: true,
        preloadAssets: ALL_ASSET_URLS,
    },
    parameters: {
        docs: {
            description: {
                story: 'Gallery showing all available 3D asset types from the Trait Wars CDN.',
            },
        },
    },
};

/**
 * Graveyard Theme
 */
export const GraveyardTheme: Story = {
    args: {
        tiles: generateDungeonMap(8, 6),
        features: [
            // Graveyard props
            { id: 'coffin-main', x: 0, y: 0, z: 0, type: 'prop', assetUrl: ASSETS_3D.coffin } as StoryFeature,
            { id: 'coffin-2', x: 1, y: 1, z: 0, type: 'prop', assetUrl: ASSETS_3D.coffin, rotation: 45 } as StoryFeature,
            { id: 'coffin-1', x: 2, y: 0, z: 0, type: 'prop', assetUrl: ASSETS_3D.coffin } as StoryFeature,
            { id: 'coffin-old-2', x: 3, y: 0, z: 0, type: 'prop', assetUrl: ASSETS_3D.coffinOld, rotation: 90 } as StoryFeature,
            { id: 'altar-stone', x: 4, y: 1, z: 0, type: 'prop', assetUrl: ASSETS_3D.altarStone } as StoryFeature,
            { id: 'candle', x: 5, y: 0, z: 0, type: 'prop', assetUrl: ASSETS_3D.candle } as StoryFeature,
            { id: 'coffin-old', x: 1, y: 2, z: 0, type: 'prop', assetUrl: ASSETS_3D.coffinOld } as StoryFeature,
            { id: 'cross-column', x: 3, y: 2, z: 0, type: 'prop', assetUrl: ASSETS_3D.crossColumn } as StoryFeature,
            { id: 'altar-stone-2', x: 4, y: 3, z: 0, type: 'prop', assetUrl: ASSETS_3D.altarStone } as StoryFeature,
        ],
        units: [],
        cameraMode: 'isometric',
        showGrid: true,
        shadows: true,
        backgroundColor: '#2d1b2e', // Dark purple for graveyard
        preloadAssets: [
            ASSETS_3D.coffin,
            ASSETS_3D.coffinOld,
            ASSETS_3D.crossColumn,
            ASSETS_3D.altarStone,
            ASSETS_3D.candle,
        ],
    },
    parameters: {
        docs: {
            description: {
                story: 'Graveyard theme using coffin, gravestone, and cross assets.',
            },
        },
    },
};

/**
 * Siege Weapons
 */
export const SiegeWeapons: Story = {
    args: {
        tiles: generateDungeonMap(8, 6),
        features: [
            { id: 'ballista-1', x: 0, y: 0, z: 0, type: 'prop', assetUrl: ASSETS_3D.ballista } as StoryFeature,
            { id: 'catapult-1', x: 3, y: 0, z: 0, type: 'prop', assetUrl: ASSETS_3D.catapult } as StoryFeature,
            { id: 'ballista-2', x: 1, y: 2, z: 0, type: 'prop', assetUrl: ASSETS_3D.ballista, rotation: 45 } as StoryFeature,
        ],
        units: [],
        cameraMode: 'isometric',
        showGrid: true,
        shadows: true,
        preloadAssets: [ASSETS_3D.ballista, ASSETS_3D.catapult],
    },
};

/**
 * Loading state demonstration with actual assets
 */
export const AssetLoadingState: Story = {
    args: {
        tiles: dungeonTiles,
        features: dungeonFeatures,
        units: [],
        isLoading: true,
        cameraMode: 'isometric',
        preloadAssets: ALL_ASSET_URLS,
        loadingMessage: 'Loading dungeon assets from CDN...',
    },
};

/**
 * Single asset test - Corridor
 */
export const SingleAssetTest: Story = {
    args: {
        tiles: generateDungeonMap(4, 4),
        features: [
            { id: 'single-corridor', x: 1, y: 1, z: 0, type: 'corridor', assetUrl: ASSETS_3D.corridor } as StoryFeature,
        ],
        cameraMode: 'isometric',
        showGrid: true,
        shadows: true,
        preloadAssets: [ASSETS_3D.corridor],
    },
};

/**
 * Performance test - Many assets
 */
export const PerformanceTest: Story = {
    args: {
        tiles: generateDungeonMap(10, 10),
        features: Array.from({ length: 20 }, (_, i) => {
            const x = Math.floor(Math.random() * 8) + 1;
            const y = Math.floor(Math.random() * 8) + 1;
            const assetKeys = ['barrels', 'crate', 'column', 'columnDamaged', 'ladder'] as const;
            const assetKey = assetKeys[i % assetKeys.length];
            return {
                id: `prop-${i}`,
                x,
                y,
                z: 0,
                type: assetKey,
                assetUrl: ASSETS_3D[assetKey],
            } as StoryFeature;
        }),
        cameraMode: 'isometric',
        showGrid: false,
        shadows: true,
        useInstancing: true,
        preloadAssets: [
            ASSETS_3D.barrels,
            ASSETS_3D.crate,
            ASSETS_3D.column,
            ASSETS_3D.columnDamaged,
            ASSETS_3D.ladder,
        ],
    },
};

/**
 * Error handling - Invalid asset URL
 */
export const InvalidAssetHandling: Story = {
    args: {
        tiles: generateDungeonMap(4, 4),
        features: [
            // Valid asset
            { id: 'valid', x: 1, y: 1, z: 0, type: 'corridor', assetUrl: ASSETS_3D.corridor } as StoryFeature,
            // Invalid asset (will show fallback)
            { id: 'invalid', x: 2, y: 1, z: 0, type: 'prop', assetUrl: 'https://invalid-url.glb' } as StoryFeature,
        ],
        cameraMode: 'isometric',
        showGrid: true,
        shadows: true,
        preloadAssets: [ASSETS_3D.corridor],
    },
    parameters: {
        docs: {
            description: {
                story: 'Demonstrates error handling when asset fails to load. Shows fallback geometry.',
            },
        },
    },
};
