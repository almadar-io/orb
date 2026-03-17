/**
 * Game Types — Generalized
 *
 * Core type definitions for tactical game state.
 * Extracted from Trait Wars and generalized for any game project.
 */

export interface Position {
    x: number;
    y: number;
}

export interface GameUnit {
    id: string;
    name: string;
    characterType: string;
    team: 'player' | 'enemy';
    position: Position;
    health: number;
    maxHealth: number;
    movement: number;
    attack: number;
    defense: number;
    traits: UnitTrait[];
}

export interface UnitTrait {
    name: string;
    currentState: string;
    states: string[];
    cooldown: number;
}

export interface BoardTile {
    terrain: string;
    unitId?: string;
    isBlocked?: boolean;
}

export type GamePhase = 'observation' | 'planning' | 'execution' | 'tick';

export interface GameState {
    board: BoardTile[][];
    units: Record<string, GameUnit>;
    currentPhase: GamePhase;
    currentTurn: number;
    activeTeam: 'player' | 'enemy';
    selectedUnitId?: string;
    validMoves: Position[];
    attackTargets: Position[];
}

export type GameAction =
    | { type: 'SELECT_UNIT'; unitId: string }
    | { type: 'MOVE_UNIT'; from: Position; to: Position }
    | { type: 'ATTACK'; attackerId: string; targetId: string }
    | { type: 'END_TURN' }
    | { type: 'EXECUTE_TRAITS' };

export function createInitialGameState(
    width: number,
    height: number,
    units: GameUnit[],
    defaultTerrain: string = 'floorStone',
): GameState {
    const board: BoardTile[][] = Array.from({ length: height }, () =>
        Array.from({ length: width }, () => ({
            terrain: defaultTerrain,
        })),
    );

    const unitsMap: Record<string, GameUnit> = {};
    for (const unit of units) {
        unitsMap[unit.id] = unit;
        if (unit.position.y < height && unit.position.x < width) {
            board[unit.position.y][unit.position.x].unitId = unit.id;
        }
    }

    return {
        board,
        units: unitsMap,
        currentPhase: 'observation',
        currentTurn: 1,
        activeTeam: 'player',
        validMoves: [],
        attackTargets: [],
    };
}

export function calculateValidMoves(
    state: GameState,
    unitId: string,
): Position[] {
    const unit = state.units[unitId];
    if (!unit) return [];

    const moves: Position[] = [];
    const { x, y } = unit.position;
    const range = unit.movement;

    for (let dy = -range; dy <= range; dy++) {
        for (let dx = -range; dx <= range; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            const distance = Math.abs(dx) + Math.abs(dy);

            if (
                distance > 0 &&
                distance <= range &&
                ny >= 0 && ny < state.board.length &&
                nx >= 0 && nx < state.board[0].length &&
                !state.board[ny][nx].unitId &&
                !state.board[ny][nx].isBlocked
            ) {
                moves.push({ x: nx, y: ny });
            }
        }
    }

    return moves;
}

export function calculateAttackTargets(
    state: GameState,
    unitId: string,
): Position[] {
    const unit = state.units[unitId];
    if (!unit) return [];

    const targets: Position[] = [];
    const { x, y } = unit.position;
    const directions = [
        { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
        { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
    ];

    for (const { dx, dy } of directions) {
        const nx = x + dx;
        const ny = y + dy;

        if (
            ny >= 0 && ny < state.board.length &&
            nx >= 0 && nx < state.board[0].length
        ) {
            const targetTile = state.board[ny][nx];
            if (targetTile.unitId) {
                const targetUnit = state.units[targetTile.unitId];
                if (targetUnit && targetUnit.team !== unit.team) {
                    targets.push({ x: nx, y: ny });
                }
            }
        }
    }

    return targets;
}
