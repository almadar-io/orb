import type { Meta, StoryObj } from '@storybook/react-vite';
import { GameCanvas3DWorldMapTemplate, type WorldMap3DEntity } from './GameCanvas3DWorldMapTemplate';

function generateWorldTiles(width: number, height: number) {
    const tiles = [];
    for (let z = 0; z < height; z++) {
        for (let x = 0; x < width; x++) {
            let terrain = 'grass';
            if (x === 0 || z === 0 || x === width - 1 || z === height - 1) terrain = 'water';
            if ((x === 3 && z >= 2 && z <= 4) || (x === 4 && z === 3)) terrain = 'mountain';
            if (z === 6 && x >= 2 && x <= 9) terrain = 'stone';
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

const worldMapEntity: WorldMap3DEntity = {
    id: 'world-1',
    name: 'Kingdom of Aldoria',
    tiles: generateWorldTiles(12, 12),
    units: [
        { id: 'hero-1', position: { x: 3, y: 5 }, x: 3, z: 5, name: 'Archmage', faction: 'player', team: 'player', health: 120, maxHealth: 120 },
        { id: 'hero-2', position: { x: 8, y: 4 }, x: 8, z: 4, name: 'Warlord', faction: 'enemy', team: 'enemy', health: 95, maxHealth: 100 },
    ],
    features: [
        { id: 'castle-1', x: 2, y: 2, z: 2, type: 'castle' },
        { id: 'tree-1', x: 5, y: 9, z: 9, type: 'tree' },
    ],
};

const meta: Meta<typeof GameCanvas3DWorldMapTemplate> = {
    title: 'Templates/Game/GameCanvas3DWorldMap',
    component: GameCanvas3DWorldMapTemplate,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
    argTypes: {
        cameraMode: { control: 'select', options: ['isometric', 'perspective', 'top-down'] },
        showGrid: { control: 'boolean' },
        showCoordinates: { control: 'boolean' },
        showTileInfo: { control: 'boolean' },
        shadows: { control: 'boolean' },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
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

export const Perspective: Story = {
    args: {
        entity: worldMapEntity,
        cameraMode: 'perspective',
        showGrid: true,
        showCoordinates: false,
        shadows: true,
    },
};

export const TopDown: Story = {
    args: {
        entity: worldMapEntity,
        cameraMode: 'top-down',
        showGrid: false,
        shadows: false,
    },
};

export const WithSelection: Story = {
    args: {
        entity: worldMapEntity,
        cameraMode: 'isometric',
        selectedUnitId: 'hero-1',
        validMoves: [{ x: 4, z: 5 }, { x: 3, z: 6 }],
    },
};
