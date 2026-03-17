import type { Meta, StoryObj } from '@storybook/react-vite';
import { GameCanvas3DBattleTemplate, type Battle3DEntity } from './GameCanvas3DBattleTemplate';

function generateBattleTiles(width: number, height: number) {
    const tiles = [];
    for (let z = 0; z < height; z++) {
        for (let x = 0; x < width; x++) {
            const terrain = (x + z) % 7 === 0 || x === 0 || x === width - 1 || z === 0 || z === height - 1
                ? 'stone'
                : 'grass';
            tiles.push({
                id: `tile-${x}-${z}`,
                x,
                y: z,
                z,
                type: terrain,
                terrain,
                passable: true,
            });
        }
    }
    return tiles;
}

const battleEntity: Battle3DEntity = {
    id: 'battle-1',
    tiles: generateBattleTiles(8, 8),
    units: [
        { id: 'p1', position: { x: 1, y: 1 }, x: 1, z: 1, name: 'Knight', faction: 'player', team: 'player', health: 80, maxHealth: 100 },
        { id: 'p2', position: { x: 1, y: 3 }, x: 1, z: 3, name: 'Archer', faction: 'player', team: 'player', health: 60, maxHealth: 60 },
        { id: 'e1', position: { x: 6, y: 5 }, x: 6, z: 5, name: 'Orc', faction: 'enemy', team: 'enemy', health: 70, maxHealth: 90 },
        { id: 'e2', position: { x: 5, y: 6 }, x: 5, z: 6, name: 'Goblin', faction: 'enemy', team: 'enemy', health: 30, maxHealth: 40 },
    ],
    features: [
        { id: 'cover-1', x: 3, y: 3, z: 3, type: 'rock' },
        { id: 'cover-2', x: 5, y: 5, z: 5, type: 'rock' },
    ],
    currentTurn: 'player',
    round: 3,
};

const meta: Meta<typeof GameCanvas3DBattleTemplate> = {
    title: 'Templates/Game/GameCanvas3DBattle',
    component: GameCanvas3DBattleTemplate,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
    argTypes: {
        cameraMode: { control: 'select', options: ['isometric', 'perspective', 'top-down'] },
        showGrid: { control: 'boolean' },
        shadows: { control: 'boolean' },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        entity: battleEntity,
        cameraMode: 'perspective',
        showGrid: true,
        shadows: true,
    },
};

export const PlayerTurn: Story = {
    args: {
        entity: { ...battleEntity, currentTurn: 'player', round: 1 },
        cameraMode: 'isometric',
        selectedUnitId: 'p1',
        validMoves: [{ x: 2, z: 1 }, { x: 3, z: 1 }],
    },
};

export const EnemyTurn: Story = {
    args: {
        entity: { ...battleEntity, currentTurn: 'enemy', round: 5 },
        cameraMode: 'isometric',
    },
};

export const WithAttackTargets: Story = {
    args: {
        entity: battleEntity,
        selectedUnitId: 'p1',
        validMoves: [{ x: 2, z: 1 }],
        attackTargets: [{ x: 5, z: 5 }],
    },
};
