/**
 * GameCanvas3D Templates Stories
 *
 * Storybook stories for 3D game canvas templates.
 *
 * @packageDocumentation
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { GameCanvas3DWorldMapTemplate, type WorldMap3DEntity } from '../templates/GameCanvas3DWorldMapTemplate';
import { GameCanvas3DBattleTemplate, type Battle3DEntity } from '../templates/GameCanvas3DBattleTemplate';
import { GameCanvas3DCastleTemplate, type Castle3DEntity } from '../templates/GameCanvas3DCastleTemplate';

// =============================================================================
// Sample Data Generators
// =============================================================================

function generateTiles(width: number, height: number, terrainFn?: (x: number, z: number) => string) {
    const tiles = [];
    for (let z = 0; z < height; z++) {
        for (let x = 0; x < width; x++) {
            const terrain = terrainFn ? terrainFn(x, z) : 'grass';
            tiles.push({
                id: `tile-${x}-${z}`,
                x,
                y: z,
                z,
                type: terrain,
                terrain,
                passable: terrain !== 'water' && terrain !== 'mountain',
            });
        }
    }
    return tiles;
}

function worldMapTerrain(x: number, z: number): string {
    if (x === 0 || z === 0 || x === 11 || z === 11) return 'water';
    if ((x === 3 && z >= 2 && z <= 4) || (x === 4 && z === 3)) return 'mountain';
    if ((x === 8 && z >= 7 && z <= 9) || (x === 9 && z === 8)) return 'mountain';
    if (z === 6 && x >= 2 && x <= 9) return 'stone';
    if (x === 5 && z >= 3 && z <= 9) return 'stone';
    return 'grass';
}

function battleTerrain(x: number, z: number): string {
    if ((x + z) % 7 === 0) return 'stone';
    if (x === 0 || x === 7 || z === 0 || z === 7) return 'stone';
    return 'grass';
}

function castleTerrain(x: number, z: number): string {
    if (x >= 2 && x <= 5 && z >= 2 && z <= 5) return 'stone';
    if (x === 0 || x === 7 || z === 0 || z === 7) return 'water';
    return 'grass';
}

// =============================================================================
// Sample Entities
// =============================================================================

const worldMapEntity: WorldMap3DEntity = {
    id: 'world-1',
    name: 'Kingdom of Aldoria',
    tiles: generateTiles(12, 12, worldMapTerrain),
    units: [
        { id: 'hero-1', position: { x: 3, y: 5 }, x: 3, z: 5, name: 'Archmage', faction: 'player', team: 'player', health: 120, maxHealth: 120 },
        { id: 'hero-2', position: { x: 8, y: 4 }, x: 8, z: 4, name: 'Warlord', faction: 'enemy', team: 'enemy', health: 95, maxHealth: 100 },
        { id: 'scout', position: { x: 6, y: 8 }, x: 6, z: 8, name: 'Scout', faction: 'neutral', team: 'neutral' },
    ],
    features: [
        { id: 'castle-1', x: 2, y: 2, z: 2, type: 'castle' },
        { id: 'mine-1', x: 9, y: 3, z: 3, type: 'rock' },
        { id: 'tree-1', x: 5, y: 9, z: 9, type: 'tree' },
        { id: 'tree-2', x: 7, y: 5, z: 5, type: 'tree' },
    ],
};

const battleEntity: Battle3DEntity = {
    id: 'battle-1',
    tiles: generateTiles(8, 8, battleTerrain),
    units: [
        { id: 'p1', position: { x: 1, y: 1 }, x: 1, z: 1, name: 'Knight', faction: 'player', team: 'player', health: 80, maxHealth: 100 },
        { id: 'p2', position: { x: 1, y: 3 }, x: 1, z: 3, name: 'Archer', faction: 'player', team: 'player', health: 60, maxHealth: 60 },
        { id: 'p3', position: { x: 2, y: 2 }, x: 2, z: 2, name: 'Mage', faction: 'player', team: 'player', health: 45, maxHealth: 50 },
        { id: 'e1', position: { x: 6, y: 5 }, x: 6, z: 5, name: 'Orc', faction: 'enemy', team: 'enemy', health: 70, maxHealth: 90 },
        { id: 'e2', position: { x: 5, y: 6 }, x: 5, z: 6, name: 'Goblin', faction: 'enemy', team: 'enemy', health: 30, maxHealth: 40 },
        { id: 'e3', position: { x: 6, y: 6 }, x: 6, z: 6, name: 'Troll', faction: 'enemy', team: 'enemy', health: 120, maxHealth: 150 },
    ],
    features: [
        { id: 'cover-1', x: 3, y: 3, z: 3, type: 'rock' },
        { id: 'cover-2', x: 5, y: 5, z: 5, type: 'rock' },
    ],
    currentTurn: 'player',
    round: 3,
};

const castleEntity: Castle3DEntity = {
    id: 'castle-1',
    name: 'Stormwind Keep',
    level: 5,
    owner: 'Player Faction',
    tiles: generateTiles(8, 8, castleTerrain),
    units: [
        { id: 'g1', position: { x: 3, y: 4 }, x: 3, z: 4, name: 'Guardian', faction: 'player', team: 'player', health: 100, maxHealth: 100 },
        { id: 'g2', position: { x: 4, y: 3 }, x: 4, z: 3, name: 'Sentinel', faction: 'player', team: 'player', health: 85, maxHealth: 85 },
        { id: 'g3', position: { x: 4, y: 4 }, x: 4, z: 4, name: 'Recruit', faction: 'player', team: 'player', health: 40, maxHealth: 40 },
    ],
    features: [
        { id: 'castle-main', x: 3, y: 3, z: 3, type: 'castle' },
        { id: 'tree-1', x: 2, y: 6, z: 6, type: 'tree' },
        { id: 'rock-1', x: 6, y: 2, z: 2, type: 'rock' },
    ],
};

// =============================================================================
// World Map Template Stories
// =============================================================================

const worldMapMeta: Meta<typeof GameCanvas3DWorldMapTemplate> = {
    title: 'Templates/Game/GameCanvas3DWorldMap',
    component: GameCanvas3DWorldMapTemplate,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: '3D World Map template for strategy game overviews. Features isometric camera, coordinate display, and event bus integration.',
            },
        },
    },
    tags: ['autodocs'],
    argTypes: {
        cameraMode: {
            control: 'select',
            options: ['isometric', 'perspective', 'top-down'],
        },
        showGrid: { control: 'boolean' },
        showCoordinates: { control: 'boolean' },
        showTileInfo: { control: 'boolean' },
        shadows: { control: 'boolean' },
    },
};

export default worldMapMeta;

type WorldMapStory = StoryObj<typeof GameCanvas3DWorldMapTemplate>;

export const WorldMapDefault: WorldMapStory = {
    args: {
        entity: worldMapEntity,
        cameraMode: 'isometric',
        showGrid: true,
        showCoordinates: true,
        showTileInfo: true,
        shadows: true,
        tileClickEvent: 'SELECT_TILE',
        unitClickEvent: 'SELECT_UNIT',
    },
};

export const WorldMapPerspective: WorldMapStory = {
    args: {
        entity: worldMapEntity,
        cameraMode: 'perspective',
        showGrid: true,
        showCoordinates: false,
        shadows: true,
    },
};

export const WorldMapTopDown: WorldMapStory = {
    args: {
        entity: worldMapEntity,
        cameraMode: 'top-down',
        showGrid: false,
        shadows: false,
    },
};

// =============================================================================
// Battle Template Stories
// =============================================================================

export const BattleDefault: StoryObj<typeof GameCanvas3DBattleTemplate> = {
    args: {
        entity: battleEntity,
        cameraMode: 'perspective',
        showGrid: true,
        shadows: true,
        selectedUnitId: 'p1',
        validMoves: [{ x: 2, z: 1 }, { x: 3, z: 1 }, { x: 2, z: 2 }],
        attackTargets: [{ x: 5, z: 5 }],
    },
    parameters: {
        docs: {
            description: {
                story: 'Battle scene with turn indicator and tactical highlighting.',
            },
        },
    },
};

export const BattlePlayerTurn: StoryObj<typeof GameCanvas3DBattleTemplate> = {
    args: {
        entity: { ...battleEntity, currentTurn: 'player', round: 1 },
        cameraMode: 'isometric',
        showGrid: true,
    },
};

export const BattleEnemyTurn: StoryObj<typeof GameCanvas3DBattleTemplate> = {
    args: {
        entity: { ...battleEntity, currentTurn: 'enemy', round: 5 },
        cameraMode: 'isometric',
        showGrid: true,
    },
};

// =============================================================================
// Castle Template Stories
// =============================================================================

export const CastleDefault: StoryObj<typeof GameCanvas3DCastleTemplate> = {
    args: {
        entity: castleEntity,
        cameraMode: 'isometric',
        showGrid: true,
        shadows: true,
        showHeader: true,
    },
    parameters: {
        docs: {
            description: {
                story: 'Castle management view with garrisoned units and buildings.',
            },
        },
    },
};

export const CastleWithSelection: StoryObj<typeof GameCanvas3DCastleTemplate> = {
    args: {
        entity: castleEntity,
        cameraMode: 'isometric',
        showGrid: true,
        selectedBuildingId: 'castle-main',
        availableBuildSites: [{ x: 2, z: 2 }, { x: 5, z: 5 }],
        showHeader: true,
    },
};

export const CastleTopDown: StoryObj<typeof GameCanvas3DCastleTemplate> = {
    args: {
        entity: castleEntity,
        cameraMode: 'top-down',
        showGrid: false,
        showHeader: false,
    },
};
