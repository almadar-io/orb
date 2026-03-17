/* eslint-disable almadar/organism-no-callback-props, almadar/organism-extends-entity-display */
'use client';
/**
 * BattleBoard
 *
 * Core rendering organism for turn-based battles.
 *
 * This is a **controlled-only** component: all game state (units, phase,
 * turn, gameResult, selectedUnitId) must be provided via the `entity` prop.
 * User interactions are communicated via event bus emissions so the parent
 * (typically an Orbital trait or the `useBattleState` hook) can manage
 * state transitions.
 *
 * For a self-managing version, use `UncontrolledBattleBoard` which
 * composes this component with the `useBattleState` hook.
 *
 * Animation-only state (movement interpolation, screen shake, hover) is
 * always managed locally.
 *
 * @packageDocumentation
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';
import { useTranslate } from '../../../hooks/useTranslate';
import { Box } from '../../atoms/Box';
import { Button } from '../../atoms/Button';
import { Typography } from '../../atoms/Typography';
import { VStack, HStack } from '../../atoms/Stack';
import type { EntityDisplayProps } from '../types';
import IsometricCanvas from './IsometricCanvas';
import type {
    IsometricTile,
    IsometricUnit,
    IsometricFeature,
} from './types/isometric';
import type { ResolvedFrame } from './types/spriteAnimation';
import { isoToScreen, TILE_WIDTH, FLOOR_HEIGHT } from './utils/isometric';

// =============================================================================
// Types
// =============================================================================

/** Battle phases an encounter walks through */
export type BattlePhase =
    | 'observation'
    | 'selection'
    | 'movement'
    | 'action'
    | 'enemy_turn'
    | 'game_over';

/** A unit participating in battle */
export interface BattleUnit {
    id: string;
    name: string;
    unitType?: string;
    heroId?: string;
    sprite?: string;
    /** Optional sprite sheet for animation (null = use static sprite) */
    spriteSheet?: {
        se: string;
        sw: string;
        frameWidth: number;
        frameHeight: number;
    } | null;
    team: 'player' | 'enemy';
    position: { x: number; y: number };
    health: number;
    maxHealth: number;
    movement: number;
    attack: number;
    defense: number;
    traits?: {
        name: string;
        currentState: string;
        states: string[];
        cooldown?: number;
    }[];
}

/** Minimal tile for map generation */
export interface BattleTile {
    x: number;
    y: number;
    terrain: string;
    terrainSprite?: string;
}

/** Entity prop containing all board data.
 *
 * BattleBoard is **controlled-only**: all game-state fields (`units`, `phase`,
 * `turn`, `gameResult`, `selectedUnitId`) must be provided.  Mutations are
 * communicated via event bus emissions — the component never calls `setState`
 * for game-logic values.
 *
 * For a self-managing variant, use `UncontrolledBattleBoard`.
 *
 * Animation-only state (`movingPositions`, `isShaking`, `hoveredTile`) is
 * always managed locally.
 */
export interface BattleEntity {
    id: string;
    tiles: IsometricTile[];
    features?: IsometricFeature[];
    boardWidth?: number;
    boardHeight?: number;
    assetManifest?: {
        baseUrl: string;
        terrains?: Record<string, string>;
        units?: Record<string, string>;
        features?: Record<string, string>;
        effects?: Record<string, string>;
    };
    backgroundImage?: string;

    // ── Game-state fields (required — controlled by parent) ──────────────
    /** Current unit state. */
    units: BattleUnit[];
    /** Current battle phase. */
    phase: BattlePhase;
    /** Current turn number. */
    turn: number;
    /** Game result. `null` = still in progress. */
    gameResult: 'victory' | 'defeat' | null;
    /** Currently selected unit ID. */
    selectedUnitId: string | null;
}

/** Context exposed to render-prop slots */
export interface BattleSlotContext {
    phase: BattlePhase;
    turn: number;
    selectedUnit: BattleUnit | null;
    hoveredUnit: BattleUnit | null;
    playerUnits: BattleUnit[];
    enemyUnits: BattleUnit[];
    gameResult: 'victory' | 'defeat' | null;
    onEndTurn: () => void;
    onCancel: () => void;
    onReset: () => void;
    attackTargets: Array<{ x: number; y: number }>;
    /** Resolve screen position of a tile for overlays */
    tileToScreen: (x: number, y: number) => { x: number; y: number };
}

export interface BattleBoardProps extends Omit<EntityDisplayProps, 'entity'> {
    /** Entity containing all board data */
    entity: BattleEntity;

    /** Canvas render scale */
    scale?: number;
    /** Unit draw-size multiplier */
    unitScale?: number;

    // -- Slots --
    /** Header area -- receives battle context */
    header?: (ctx: BattleSlotContext) => React.ReactNode;
    /** Sidebar content (combat log, unit roster, etc.) */
    sidebar?: (ctx: BattleSlotContext) => React.ReactNode;
    /** Floating action buttons */
    actions?: (ctx: BattleSlotContext) => React.ReactNode;
    /** Floating overlays above the canvas (damage popups, tooltips) */
    overlay?: (ctx: BattleSlotContext) => React.ReactNode;
    /** Game-over screen overlay */
    gameOverOverlay?: (ctx: BattleSlotContext) => React.ReactNode;

    // -- Callbacks --
    /** Called when a unit attacks another */
    onAttack?: (attacker: BattleUnit, target: BattleUnit, damage: number) => void;
    /** Called when battle ends */
    onGameEnd?: (result: 'victory' | 'defeat') => void;
    /** Called after a unit moves */
    onUnitMove?: (unit: BattleUnit, to: { x: number; y: number }) => void;
    /** Custom combat damage calculator */
    calculateDamage?: (attacker: BattleUnit, target: BattleUnit) => number;

    // -- Canvas pass-through --
    onDrawEffects?: (ctx: CanvasRenderingContext2D, timestamp: number) => void;
    hasActiveEffects?: boolean;
    effectSpriteUrls?: string[];
    resolveUnitFrame?: (unitId: string) => ResolvedFrame | null;

    // -- Declarative event props --
    /** Emits UI:{tileClickEvent} with { x, y } on tile click */
    tileClickEvent?: string;
    /** Emits UI:{unitClickEvent} with { unitId } on unit click */
    unitClickEvent?: string;
    /** Emits UI:{endTurnEvent} with {} on end turn */
    endTurnEvent?: string;
    /** Emits UI:{cancelEvent} with {} on cancel */
    cancelEvent?: string;
    /** Emits UI:{gameEndEvent} with { result } on game end */
    gameEndEvent?: string;
    /** Emits UI:{playAgainEvent} with {} on play again / reset */
    playAgainEvent?: string;
    /** Emits UI:{attackEvent} with { attackerId, targetId, damage } on attack */
    attackEvent?: string;

    className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function BattleBoard({
    entity,
    scale = 0.45,
    unitScale = 1,
    header,
    sidebar,
    actions,
    overlay,
    gameOverOverlay,
    onAttack,
    onGameEnd,
    onUnitMove,
    calculateDamage,
    onDrawEffects,
    hasActiveEffects = false,
    effectSpriteUrls = [],
    resolveUnitFrame,
    tileClickEvent,
    unitClickEvent,
    endTurnEvent,
    cancelEvent,
    gameEndEvent,
    playAgainEvent,
    attackEvent,
    className,
}: BattleBoardProps): React.JSX.Element {
    // -- Unpack entity --
    const tiles = entity.tiles;
    const features = entity.features ?? [];
    const boardWidth = entity.boardWidth ?? 8;
    const boardHeight = entity.boardHeight ?? 6;
    const assetManifest = entity.assetManifest;
    const backgroundImage = entity.backgroundImage;

    // ── Game state (read from entity — controlled by parent) ─────────────
    const units = entity.units;
    const selectedUnitId = entity.selectedUnitId;
    const currentPhase = entity.phase;
    const currentTurn = entity.turn;
    const gameResult = entity.gameResult;

    // -- Event bus --
    const eventBus = useEventBus();
    const { t } = useTranslate();

    // ── Rendering-only state (always local) ──────────────────────────────
    const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);
    const [isShaking, setIsShaking] = useState(false);

    // ── Derived state ───────────────────────────────────────────────────────
    const selectedUnit = useMemo(
        () => units.find(u => u.id === selectedUnitId) ?? null,
        [units, selectedUnitId],
    );

    const hoveredUnit = useMemo(() => {
        if (!hoveredTile) return null;
        return units.find(
            u => u.position.x === hoveredTile.x && u.position.y === hoveredTile.y && u.health > 0,
        ) ?? null;
    }, [hoveredTile, units]);

    const playerUnits = useMemo(() => units.filter(u => u.team === 'player' && u.health > 0), [units]);
    const enemyUnits = useMemo(() => units.filter(u => u.team === 'enemy' && u.health > 0), [units]);

    // ── Valid moves ─────────────────────────────────────────────────────────
    const validMoves = useMemo(() => {
        if (!selectedUnit || currentPhase !== 'movement') return [];
        const moves: Array<{ x: number; y: number }> = [];
        const range = selectedUnit.movement;
        for (let dy = -range; dy <= range; dy++) {
            for (let dx = -range; dx <= range; dx++) {
                const nx = selectedUnit.position.x + dx;
                const ny = selectedUnit.position.y + dy;
                const dist = Math.abs(dx) + Math.abs(dy);
                if (
                    dist > 0 &&
                    dist <= range &&
                    nx >= 0 && nx < boardWidth &&
                    ny >= 0 && ny < boardHeight &&
                    !units.some(u => u.position.x === nx && u.position.y === ny && u.health > 0)
                ) {
                    moves.push({ x: nx, y: ny });
                }
            }
        }
        return moves;
    }, [selectedUnit, currentPhase, units, boardWidth, boardHeight]);

    // ── Attack Targets ──────────────────────────────────────────────────────
    const attackTargets = useMemo(() => {
        if (!selectedUnit || currentPhase !== 'action') return [];
        return units
            .filter(u => u.team !== selectedUnit.team && u.health > 0)
            .filter(u => {
                const dx = Math.abs(u.position.x - selectedUnit.position.x);
                const dy = Math.abs(u.position.y - selectedUnit.position.y);
                return dx <= 1 && dy <= 1 && dx + dy > 0;
            })
            .map(u => u.position);
    }, [selectedUnit, currentPhase, units]);

    // ── Movement animation ──────────────────────────────────────────────────
    interface MovementAnim {
        unitId: string;
        from: { x: number; y: number };
        to: { x: number; y: number };
        elapsed: number;
        duration: number;
        onComplete: () => void;
    }

    const MOVE_SPEED_MS_PER_TILE = 300;
    const movementAnimRef = useRef<MovementAnim | null>(null);
    const [movingPositions, setMovingPositions] = useState<Map<string, { x: number; y: number }>>(new Map());

    const startMoveAnimation = useCallback((
        unitId: string,
        from: { x: number; y: number },
        to: { x: number; y: number },
        onComplete: () => void,
    ) => {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const duration = dist * MOVE_SPEED_MS_PER_TILE;
        movementAnimRef.current = { unitId, from, to, elapsed: 0, duration, onComplete };
    }, []);

    // ── Tick movement animation (~60fps) ────────────────────────────────────
    useEffect(() => {
        const interval = setInterval(() => {
            const anim = movementAnimRef.current;
            if (!anim) return;

            anim.elapsed += 16;
            const t = Math.min(anim.elapsed / anim.duration, 1);
            const eased = 1 - (1 - t) * (1 - t); // ease-out quadratic
            const cx = anim.from.x + (anim.to.x - anim.from.x) * eased;
            const cy = anim.from.y + (anim.to.y - anim.from.y) * eased;

            if (t >= 1) {
                movementAnimRef.current = null;
                setMovingPositions(prev => {
                    const next = new Map(prev);
                    next.delete(anim.unitId);
                    return next;
                });
                anim.onComplete();
            } else {
                setMovingPositions(prev => {
                    const next = new Map(prev);
                    next.set(anim.unitId, { x: cx, y: cy });
                    return next;
                });
            }
        }, 16);
        return () => clearInterval(interval);
    }, []);

    // ── Visual units (with interpolated positions) ──────────────────────────
    const isoUnits: IsometricUnit[] = useMemo(() => {
        return units
            .filter(u => u.health > 0)
            .map(unit => {
                const pos = movingPositions.get(unit.id) ?? unit.position;
                return {
                    id: unit.id,
                    position: pos,
                    name: unit.name,
                    team: unit.team,
                    health: unit.health,
                    maxHealth: unit.maxHealth,
                    unitType: unit.unitType,
                    heroId: unit.heroId,
                    sprite: unit.sprite,
                    traits: unit.traits?.map(t => ({
                        name: t.name,
                        currentState: t.currentState,
                        states: t.states,
                        cooldown: t.cooldown ?? 0,
                    })),
                };
            });
    }, [units, movingPositions]);

    // ── Tile-to-screen helper ───────────────────────────────────────────────
    const maxY = Math.max(...tiles.map(t => t.y), 0);
    const baseOffsetX = (maxY + 1) * (TILE_WIDTH * scale / 2);
    const tileToScreen = useCallback(
        (tx: number, ty: number) => isoToScreen(tx, ty, scale, baseOffsetX),
        [scale, baseOffsetX],
    );

    // ── Check game end (emit only — state managed by parent) ───────────────
    const checkGameEnd = useCallback(() => {
        const pa = units.filter(u => u.team === 'player' && u.health > 0);
        const ea = units.filter(u => u.team === 'enemy' && u.health > 0);
        if (pa.length === 0) {
            onGameEnd?.('defeat');
            if (gameEndEvent) {
                eventBus.emit(`UI:${gameEndEvent}`, { result: 'defeat' });
            }
        } else if (ea.length === 0) {
            onGameEnd?.('victory');
            if (gameEndEvent) {
                eventBus.emit(`UI:${gameEndEvent}`, { result: 'victory' });
            }
        }
    }, [units, onGameEnd, gameEndEvent, eventBus]);

    // ── Handle unit click (emit only — state managed by parent) ────────────
    const handleUnitClick = useCallback((unitId: string) => {
        const unit = units.find(u => u.id === unitId);
        if (!unit) return;

        if (unitClickEvent) {
            eventBus.emit(`UI:${unitClickEvent}`, { unitId });
        }

        // Screen shake on attack hit (rendering-only state)
        if (currentPhase === 'action' && selectedUnit) {
            if (
                unit.team === 'enemy' &&
                attackTargets.some(t => t.x === unit.position.x && t.y === unit.position.y)
            ) {
                const damage = calculateDamage
                    ? calculateDamage(selectedUnit, unit)
                    : Math.max(1, selectedUnit.attack - unit.defense);

                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 300);

                onAttack?.(selectedUnit, unit, damage);
                if (attackEvent) {
                    eventBus.emit(`UI:${attackEvent}`, {
                        attackerId: selectedUnit.id,
                        targetId: unit.id,
                        damage,
                    });
                }

                setTimeout(checkGameEnd, 100);
            }
        }
    }, [currentPhase, selectedUnit, attackTargets, units, checkGameEnd, onAttack, calculateDamage, unitClickEvent, attackEvent, eventBus]);

    // ── Handle tile click (emit + animation — no state mutation) ───────────
    const handleTileClick = useCallback((x: number, y: number) => {
        if (tileClickEvent) {
            eventBus.emit(`UI:${tileClickEvent}`, { x, y });
        }

        if (currentPhase === 'movement' && selectedUnit) {
            if (movementAnimRef.current) return; // block during animation
            if (validMoves.some(m => m.x === x && m.y === y)) {
                const from = { ...selectedUnit.position };
                const to = { x, y };
                startMoveAnimation(selectedUnit.id, from, to, () => {
                    onUnitMove?.(selectedUnit, to);
                });
            }
        }
    }, [currentPhase, selectedUnit, validMoves, startMoveAnimation, onUnitMove, tileClickEvent, eventBus]);

    // ── Phase controls (emit only — state managed by parent) ───────────────
    const handleEndTurn = useCallback(() => {
        if (endTurnEvent) {
            eventBus.emit(`UI:${endTurnEvent}`, {});
        }
    }, [endTurnEvent, eventBus]);

    const handleCancel = useCallback(() => {
        if (cancelEvent) {
            eventBus.emit(`UI:${cancelEvent}`, {});
        }
    }, [cancelEvent, eventBus]);

    const handleReset = useCallback(() => {
        if (playAgainEvent) {
            eventBus.emit(`UI:${playAgainEvent}`, {});
        }
    }, [playAgainEvent, eventBus]);

    // ── Slot context ────────────────────────────────────────────────────────
    const ctx: BattleSlotContext = useMemo(
        () => ({
            phase: currentPhase,
            turn: currentTurn,
            selectedUnit,
            hoveredUnit,
            playerUnits,
            enemyUnits,
            gameResult,
            onEndTurn: handleEndTurn,
            onCancel: handleCancel,
            onReset: handleReset,
            attackTargets,
            tileToScreen,
        }),
        [
            currentPhase, currentTurn, selectedUnit, hoveredUnit,
            playerUnits, enemyUnits, gameResult,
            handleEndTurn, handleCancel, handleReset, attackTargets, tileToScreen,
        ],
    );

    // ── Shake style ─────────────────────────────────────────────────────────
    const shakeStyle: React.CSSProperties = isShaking
        ? { animation: 'battle-shake 0.3s ease-in-out' }
        : {};

    return (
        <VStack className={cn('battle-board relative min-h-[600px] bg-[var(--color-background)]', className)} gap="none">
            {/* Shake keyframes */}
            <style>{`
                @keyframes battle-shake {
                    0%, 100% { transform: translate(0, 0); }
                    10% { transform: translate(-3px, -2px); }
                    20% { transform: translate(3px, 1px); }
                    30% { transform: translate(-2px, 3px); }
                    40% { transform: translate(2px, -1px); }
                    50% { transform: translate(-3px, 2px); }
                    60% { transform: translate(3px, -2px); }
                    70% { transform: translate(-1px, 3px); }
                    80% { transform: translate(2px, -3px); }
                    90% { transform: translate(-2px, 1px); }
                }
            `}</style>

            {/* Header slot */}
            {header && <Box className="p-4">{header(ctx)}</Box>}

            {/* Main area */}
            <HStack className="flex-1 gap-4 p-4 pt-0" gap="none">
                {/* Canvas column */}
                <Box className="relative flex-1" style={shakeStyle}>
                    <IsometricCanvas
                        tiles={tiles}
                        units={isoUnits}
                        features={features}
                        selectedUnitId={selectedUnitId}
                        validMoves={validMoves}
                        attackTargets={attackTargets}
                        hoveredTile={hoveredTile}
                        onTileClick={handleTileClick}
                        onUnitClick={handleUnitClick}
                        onTileHover={(x, y) => setHoveredTile({ x, y })}
                        onTileLeave={() => setHoveredTile(null)}
                        scale={scale}
                        assetBaseUrl={assetManifest?.baseUrl}
                        assetManifest={assetManifest}
                        backgroundImage={backgroundImage}
                        onDrawEffects={onDrawEffects}
                        hasActiveEffects={hasActiveEffects}
                        effectSpriteUrls={effectSpriteUrls}
                        resolveUnitFrame={resolveUnitFrame}
                        unitScale={unitScale}
                    />

                    {/* Overlay slot (damage popups, tooltips, etc.) */}
                    {overlay && overlay(ctx)}
                </Box>

                {/* Sidebar slot */}
                {sidebar && (
                    <Box className="w-80 shrink-0">
                        {sidebar(ctx)}
                    </Box>
                )}
            </HStack>

            {/* Floating actions slot */}
            {actions
                ? actions(ctx)
                : currentPhase !== 'game_over' && (
                    <HStack className="fixed bottom-6 right-6 z-50" gap="sm">
                        {(currentPhase === 'movement' || currentPhase === 'action') && (
                            <Button
                                variant="secondary"
                                className="shadow-xl"
                                onClick={handleCancel}
                            >
                                {t('battle.cancel')}
                            </Button>
                        )}
                        <Button
                            variant="primary"
                            className="shadow-xl"
                            onClick={handleEndTurn}
                        >
                            {t('battle.endTurn')}
                        </Button>
                    </HStack>
                )}

            {/* Game Over overlay */}
            {gameResult && (
                gameOverOverlay
                    ? gameOverOverlay(ctx)
                    : (
                        <Box className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl">
                            <VStack className="text-center p-8" gap="lg">
                                <Typography
                                    variant="h2"
                                    className={cn(
                                        'text-4xl font-black tracking-widest uppercase',
                                        gameResult === 'victory' ? 'text-yellow-400' : 'text-red-500',
                                    )}
                                >
                                    {gameResult === 'victory' ? t('battle.victory') : t('battle.defeat')}
                                </Typography>
                                <Typography variant="body1" className="text-gray-300">
                                    {t('battle.turnsPlayed')}: {currentTurn}
                                </Typography>
                                <Button
                                    variant="primary"
                                    className="px-8 py-3 font-semibold"
                                    onClick={handleReset}
                                >
                                    {t('battle.playAgain')}
                                </Button>
                            </VStack>
                        </Box>
                    )
            )}
        </VStack>
    );
}

BattleBoard.displayName = 'BattleBoard';

export default BattleBoard;
