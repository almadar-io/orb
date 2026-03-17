import type { Meta, StoryObj } from '@storybook/react-vite';
import { GameCanvas3DCastleTemplate, type Castle3DEntity } from './GameCanvas3DCastleTemplate';

function generateCastleTiles(width: number, height: number) {
    const tiles = [];
    for (let z = 0; z < height; z++) {
        for (let x = 0; x < width; x++) {
            let terrain = 'grass';
            if (x >= 2 && x <= 5 && z >= 2 && z <= 5) terrain = 'stone';
            if (x === 0 || x === width - 1 || z === 0 || z === height - 1) terrain = 'water';
            tiles.push({
                id: `tile-${x}-${z}`,
                x,
                y: z,
                z,
                type: terrain,
                terrain,
                passable: terrain !== 'water',
            });
        }
    }
    return tiles;
}

const castleEntity: Castle3DEntity = {
    id: 'castle-1',
    name: 'Stormwind Keep',
    level: 5,
    owner: 'Player Faction',
    tiles: generateCastleTiles(8, 8),
    units: [
        { id: 'g1', position: { x: 3, y: 4 }, x: 3, z: 4, name: 'Guardian', faction: 'player', team: 'player', health: 100, maxHealth: 100 },
        { id: 'g2', position: { x: 4, y: 3 }, x: 4, z: 3, name: 'Sentinel', faction: 'player', team: 'player', health: 85, maxHealth: 85 },
    ],
    features: [
        { id: 'castle-main', x: 3, y: 3, z: 3, type: 'castle' },
        { id: 'tree-1', x: 2, y: 6, z: 6, type: 'tree' },
    ],
};

const meta: Meta<typeof GameCanvas3DCastleTemplate> = {
    title: 'Templates/Game/GameCanvas3DCastle',
    component: GameCanvas3DCastleTemplate,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
    argTypes: {
        cameraMode: { control: 'select', options: ['isometric', 'perspective', 'top-down'] },
        showGrid: { control: 'boolean' },
        shadows: { control: 'boolean' },
        showHeader: { control: 'boolean' },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        entity: castleEntity,
        cameraMode: 'isometric',
        showGrid: true,
        shadows: true,
        showHeader: true,
    },
};

export const WithSelection: Story = {
    args: {
        entity: castleEntity,
        cameraMode: 'isometric',
        showGrid: true,
        selectedBuildingId: 'castle-main',
        selectedTileIds: ['castle-main'],
        availableBuildSites: [{ x: 2, z: 2 }, { x: 5, z: 5 }],
        showHeader: true,
    },
};

export const TopDown: Story = {
    args: {
        entity: castleEntity,
        cameraMode: 'top-down',
        showGrid: false,
        showHeader: false,
    },
};

export const NoGarrison: Story = {
    args: {
        entity: { ...castleEntity, units: [] },
        cameraMode: 'isometric',
        showHeader: true,
    },
};
