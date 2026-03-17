'use client';
/**
 * WorldMapBoard
 *
 * Organism for the strategic world-map view.  Renders an isometric hex/iso
 * map with hero selection, movement animation, and encounter callbacks.
 * Game-specific panels (hero detail, hero lists, resource bars) are injected
 * via render-prop slots.
 *
 * **State categories (closed-circuit compliant):**
 * - Game data (hexes, heroes, selectedHeroId, features) → received via
 *   `entity` prop; the Orbital trait owns this state.
 * - Rendering state (hoveredTile, movingPositions animation) → local only.
 * - Events → emitted via `useEventBus()` for trait integration.
 *
 * This component is mostly prop-driven.  The only internal state is hover
 * tracking and movement animation interpolation, both of which are
 * rendering-only concerns that cannot (and should not) be externalised.
 *
 * @packageDocumentation
 */

/* eslint-disable almadar/organism-no-callback-props, almadar/organism-extends-entity-display */
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';
import { VStack, HStack, Stack } from '../../atoms/Stack';
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

/** A hero on the world map */
export interface MapHero {
    id: string;
    name: string;
    owner: 'player' | 'enemy' | string;
    position: { x: number; y: number };
    movement: number;
    sprite?: string;
    /** Optional sprite sheet for animation (null = use static sprite) */
    spriteSheet?: {
        se: string;
        sw: string;
        frameWidth: number;
        frameHeight: number;
    } | null;
    level?: number;
}

/** A hex on the map */
export interface MapHex {
    x: number;
    y: number;
    terrain: string;
    terrainSprite?: string;
    feature?: string;
    featureData?: Record<string, unknown>;
    passable?: boolean;
}

/** Context exposed to render-prop slots */
export interface WorldMapSlotContext {
    /** Currently hovered tile */
    hoveredTile: { x: number; y: number } | null;
    /** Hex at the hovered tile */
    hoveredHex: MapHex | null;
    /** Hero at the hovered tile */
    hoveredHero: MapHero | null;
    /** Currently selected hero */
    selectedHero: MapHero | null;
    /** Valid move tiles for selected hero */
    validMoves: Array<{ x: number; y: number }>;
    /** Selects a hero */
    selectHero: (id: string) => void;
    /** Resolve screen position of a tile for overlays */
    tileToScreen: (x: number, y: number) => { x: number; y: number };
    /** Canvas scale */
    scale: number;
}

/** Entity shape for the WorldMapBoard */
export interface WorldMapEntity {
    id: string;
    hexes: MapHex[];
    heroes: MapHero[];
    features?: IsometricFeature[];
    selectedHeroId?: string | null;
    assetManifest?: {
        baseUrl: string;
        terrains?: Record<string, string>;
        units?: Record<string, string>;
        features?: Record<string, string>;
    };
    backgroundImage?: string;
}

export interface WorldMapBoardProps extends Omit<EntityDisplayProps, 'entity'> {
    /** World map entity data */
    entity: WorldMapEntity;

    /** Canvas render scale */
    scale?: number;
    /** Unit draw-size multiplier */
    unitScale?: number;
    /** Allow selecting / moving ALL heroes (including enemy). For testing. */
    allowMoveAllHeroes?: boolean;
    /** Custom movement range validator */
    isInRange?: (from: { x: number; y: number }, to: { x: number; y: number }, range: number) => boolean;

    // -- Declarative event props --
    /** Emits UI:{heroSelectEvent} with { heroId } */
    heroSelectEvent?: string;
    /** Emits UI:{heroMoveEvent} with { heroId, toX, toY } */
    heroMoveEvent?: string;
    /** Emits UI:{battleEncounterEvent} with { attackerId, defenderId } */
    battleEncounterEvent?: string;
    /** Emits UI:{featureEnterEvent} with { heroId, feature, hex } */
    featureEnterEvent?: string;
    /** Emits UI:{tileClickEvent} with { x, y } */
    tileClickEvent?: string;

    // -- Slots --
    /** Header / top bar */
    header?: (ctx: WorldMapSlotContext) => React.ReactNode;
    /** Side panel (hero detail, hero lists, etc.) */
    sidePanel?: (ctx: WorldMapSlotContext) => React.ReactNode;
    /** Canvas overlay (tooltips, popups) */
    overlay?: (ctx: WorldMapSlotContext) => React.ReactNode;
    /** Footer */
    footer?: (ctx: WorldMapSlotContext) => React.ReactNode;

    // -- Callbacks --
    onHeroSelect?: (heroId: string) => void;
    onHeroMove?: (heroId: string, toX: number, toY: number) => void;
    /** Called when hero clicks an enemy hero tile */
    onBattleEncounter?: (attackerId: string, defenderId: string) => void;
    /** Called when hero enters a feature hex (castle, resource, etc.) */
    onFeatureEnter?: (heroId: string, hex: MapHex) => void;

    // -- Canvas pass-through --
    /** Override for the diamond-top Y offset within tile sprites (default: 374). */
    diamondTopY?: number;
    /** Disable pan/zoom camera (default: true). Set false for fixed maps where overlay labels need stable positions. */
    enableCamera?: boolean;
    effectSpriteUrls?: string[];
    resolveUnitFrame?: (unitId: string) => ResolvedFrame | null;

    className?: string;
}

// =============================================================================
// Helpers
// =============================================================================

/** Default Manhattan-distance range check */
function defaultIsInRange(
    from: { x: number; y: number },
    to: { x: number; y: number },
    range: number,
): boolean {
    return Math.abs(from.x - to.x) + Math.abs(from.y - to.y) <= range;
}

// =============================================================================
// Component
// =============================================================================

// eslint-disable-next-line almadar/require-translate -- renders no text; all content via render-prop slots (header, sidePanel, overlay, footer)
export function WorldMapBoard({
    entity,
    scale = 0.4,
    unitScale = 2.5,
    allowMoveAllHeroes = false,
    isInRange = defaultIsInRange,
    heroSelectEvent,
    heroMoveEvent,
    battleEncounterEvent,
    featureEnterEvent,
    tileClickEvent,
    header,
    sidePanel,
    overlay,
    footer,
    onHeroSelect,
    onHeroMove,
    onBattleEncounter,
    onFeatureEnter,
    diamondTopY,
    enableCamera,
    effectSpriteUrls = [],
    resolveUnitFrame,
    className,
}: WorldMapBoardProps): React.JSX.Element {
    const eventBus = useEventBus();

    // Destructure entity for convenience
    const hexes = entity.hexes;
    const heroes = entity.heroes;
    const features = entity.features ?? [];
    const selectedHeroId = entity.selectedHeroId;
    const assetManifest = entity.assetManifest;
    const backgroundImage = entity.backgroundImage;

    const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);

    // -- Selected hero --------------------------------------------------------
    const selectedHero = useMemo(
        () => heroes.find(h => h.id === selectedHeroId) ?? null,
        [heroes, selectedHeroId],
    );

    // -- Convert hexes -> IsometricTile[] -------------------------------------
    const tiles: IsometricTile[] = useMemo(
        () => hexes.map(hex => ({
            x: hex.x,
            y: hex.y,
            terrain: hex.terrain,
            terrainSprite: hex.terrainSprite,
        })),
        [hexes],
    );

    // -- Convert heroes -> IsometricUnit[] ------------------------------------
    const baseUnits: IsometricUnit[] = useMemo(
        () => heroes.map(hero => ({
            id: hero.id,
            position: hero.position,
            name: hero.name,
            team: (hero.owner === 'enemy' ? 'enemy' : 'player') as 'player' | 'enemy',
            health: 100,
            maxHealth: 100,
            sprite: hero.sprite,
        })),
        [heroes],
    );

    // -- Movement animation ---------------------------------------------------
    interface MovementAnim {
        heroId: string;
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
        heroId: string,
        from: { x: number; y: number },
        to: { x: number; y: number },
        onComplete: () => void,
    ) => {
        const dist = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y));
        movementAnimRef.current = { heroId, from, to, elapsed: 0, duration: dist * MOVE_SPEED_MS_PER_TILE, onComplete };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const anim = movementAnimRef.current;
            if (!anim) return;
            anim.elapsed += 16;
            const t = Math.min(anim.elapsed / anim.duration, 1);
            const eased = 1 - (1 - t) * (1 - t);
            const cx = anim.from.x + (anim.to.x - anim.from.x) * eased;
            const cy = anim.from.y + (anim.to.y - anim.from.y) * eased;
            if (t >= 1) {
                movementAnimRef.current = null;
                setMovingPositions(prev => { const n = new Map(prev); n.delete(anim.heroId); return n; });
                anim.onComplete();
            } else {
                setMovingPositions(prev => { const n = new Map(prev); n.set(anim.heroId, { x: cx, y: cy }); return n; });
            }
        }, 16);
        return () => clearInterval(interval);
    }, []);

    // -- Visual units with interpolated positions -----------------------------
    const isoUnits: IsometricUnit[] = useMemo(() => {
        if (movingPositions.size === 0) return baseUnits;
        return baseUnits.map(u => {
            const pos = movingPositions.get(u.id);
            return pos ? { ...u, position: pos } : u;
        });
    }, [baseUnits, movingPositions]);

    // -- Valid moves ----------------------------------------------------------
    const validMoves = useMemo(() => {
        if (!selectedHero || selectedHero.movement <= 0) return [];
        const moves: Array<{ x: number; y: number }> = [];
        hexes.forEach(hex => {
            if (hex.passable === false) return;
            if (hex.x === selectedHero.position.x && hex.y === selectedHero.position.y) return;
            if (!isInRange(selectedHero.position, { x: hex.x, y: hex.y }, selectedHero.movement)) return;
            // Don't overlap friendly heroes
            if (heroes.some(h => h.position.x === hex.x && h.position.y === hex.y && h.owner === selectedHero.owner)) return;
            moves.push({ x: hex.x, y: hex.y });
        });
        return moves;
    }, [selectedHero, hexes, heroes, isInRange]);

    // -- Attack targets -------------------------------------------------------
    const attackTargets = useMemo(() => {
        if (!selectedHero || selectedHero.movement <= 0) return [];
        return heroes
            .filter(h => h.owner !== selectedHero.owner)
            .filter(h => isInRange(selectedHero.position, h.position, selectedHero.movement))
            .map(h => h.position);
    }, [selectedHero, heroes, isInRange]);

    // -- Tile-to-screen helper ------------------------------------------------
    const maxY = Math.max(...hexes.map(h => h.y), 0);
    const baseOffsetX = (maxY + 1) * (TILE_WIDTH * scale / 2);
    const tileToScreen = useCallback(
        (tx: number, ty: number) => isoToScreen(tx, ty, scale, baseOffsetX),
        [scale, baseOffsetX],
    );

    // -- Hovered info ---------------------------------------------------------
    const hoveredHex = useMemo(
        () => hoveredTile ? hexes.find(h => h.x === hoveredTile.x && h.y === hoveredTile.y) ?? null : null,
        [hoveredTile, hexes],
    );
    const hoveredHero = useMemo(
        () => hoveredTile ? heroes.find(h => h.position.x === hoveredTile.x && h.position.y === hoveredTile.y) ?? null : null,
        [hoveredTile, heroes],
    );

    // -- Handle tile click ----------------------------------------------------
    const handleTileClick = useCallback((x: number, y: number) => {
        if (movementAnimRef.current) return;
        const hex = hexes.find(h => h.x === x && h.y === y);
        if (!hex) return;

        // Emit declarative tile click event
        if (tileClickEvent) {
            eventBus.emit(`UI:${tileClickEvent}`, { x, y });
        }

        if (selectedHero && validMoves.some(m => m.x === x && m.y === y)) {
            startMoveAnimation(selectedHero.id, { ...selectedHero.position }, { x, y }, () => {
                onHeroMove?.(selectedHero.id, x, y);
                if (heroMoveEvent) {
                    eventBus.emit(`UI:${heroMoveEvent}`, { heroId: selectedHero.id, toX: x, toY: y });
                }
                if (hex.feature && hex.feature !== 'none') {
                    onFeatureEnter?.(selectedHero.id, hex);
                    if (featureEnterEvent) {
                        eventBus.emit(`UI:${featureEnterEvent}`, { heroId: selectedHero.id, feature: hex.feature, hex });
                    }
                }
            });
            return;
        }

        // Check for battle encounter
        const enemy = heroes.find(h => h.position.x === x && h.position.y === y && h.owner === 'enemy');
        if (selectedHero && enemy && attackTargets.some(t => t.x === x && t.y === y)) {
            onBattleEncounter?.(selectedHero.id, enemy.id);
            if (battleEncounterEvent) {
                eventBus.emit(`UI:${battleEncounterEvent}`, { attackerId: selectedHero.id, defenderId: enemy.id });
            }
        }
    }, [hexes, heroes, selectedHero, validMoves, attackTargets, startMoveAnimation, onHeroMove, onFeatureEnter, onBattleEncounter, eventBus, tileClickEvent, heroMoveEvent, featureEnterEvent, battleEncounterEvent]);

    // -- Handle unit click ----------------------------------------------------
    const handleUnitClick = useCallback((unitId: string) => {
        const hero = heroes.find(h => h.id === unitId);
        if (hero && (hero.owner === 'player' || allowMoveAllHeroes)) {
            onHeroSelect?.(unitId);
            if (heroSelectEvent) {
                eventBus.emit(`UI:${heroSelectEvent}`, { heroId: unitId });
            }
        }
    }, [heroes, onHeroSelect, allowMoveAllHeroes, eventBus, heroSelectEvent]);

    const selectHero = useCallback((id: string) => {
        onHeroSelect?.(id);
        if (heroSelectEvent) {
            eventBus.emit(`UI:${heroSelectEvent}`, { heroId: id });
        }
    }, [onHeroSelect, eventBus, heroSelectEvent]);

    // -- Slot context ---------------------------------------------------------
    const ctx: WorldMapSlotContext = useMemo(
        () => ({
            hoveredTile,
            hoveredHex,
            hoveredHero,
            selectedHero,
            validMoves,
            selectHero,
            tileToScreen,
            scale,
        }),
        [hoveredTile, hoveredHex, hoveredHero, selectedHero, validMoves, selectHero, tileToScreen, scale],
    );

    return (
        <VStack className={cn('world-map-board min-h-screen bg-[var(--color-background)]', className)} gap="none">
            {/* Header slot */}
            {header && header(ctx)}

            {/* Main area */}
            <HStack className="flex-1 overflow-hidden" gap="none">
                {/* Canvas column */}
                <Stack className="flex-1 overflow-auto p-4 relative">
                    <IsometricCanvas
                        tiles={tiles}
                        units={isoUnits}
                        features={features}
                        selectedUnitId={selectedHeroId}
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
                        effectSpriteUrls={effectSpriteUrls}
                        resolveUnitFrame={resolveUnitFrame}
                        unitScale={unitScale}
                        diamondTopY={diamondTopY}
                        enableCamera={enableCamera}
                    />

                    {/* Overlay slot */}
                    {overlay && overlay(ctx)}
                </Stack>

                {/* Side panel slot */}
                {sidePanel && (
                    <Stack className="w-80 shrink-0 border-l border-[var(--color-border)] bg-[var(--color-surface)] overflow-y-auto p-4">
                        {sidePanel(ctx)}
                    </Stack>
                )}
            </HStack>

            {/* Footer slot */}
            {footer && footer(ctx)}
        </VStack>
    );
}

WorldMapBoard.displayName = 'WorldMapBoard';

export default WorldMapBoard;
