'use client';
/**
 * useGameCanvas3DEvents
 *
 * Event bus integration hook for GameCanvas3D.
 * Handles declarative event props (tileClickEvent, unitClickEvent, etc.)
 *
 * @packageDocumentation
 */

import { useCallback, useRef } from 'react';
import { useEventBus, useEmitEvent } from '../../../../../hooks/useEventBus';
import type { IsometricTile, IsometricUnit, IsometricFeature } from '../../types/isometric';

export interface GameCanvas3DEventConfig {
    /** Event name for tile clicks */
    tileClickEvent?: string;
    /** Event name for unit clicks */
    unitClickEvent?: string;
    /** Event name for feature clicks */
    featureClickEvent?: string;
    /** Event name for canvas clicks */
    canvasClickEvent?: string;
    /** Event name for tile hover */
    tileHoverEvent?: string;
    /** Event name for tile leave */
    tileLeaveEvent?: string;
    /** Event name for unit animation changes */
    unitAnimationEvent?: string;
    /** Event name for camera changes */
    cameraChangeEvent?: string;
}

export interface UseGameCanvas3DEventsOptions extends GameCanvas3DEventConfig {
    /** Callback for tile clicks (direct) */
    onTileClick?: (tile: IsometricTile, event: React.MouseEvent) => void;
    /** Callback for unit clicks (direct) */
    onUnitClick?: (unit: IsometricUnit, event: React.MouseEvent) => void;
    /** Callback for feature clicks (direct) */
    onFeatureClick?: (feature: IsometricFeature, event: React.MouseEvent) => void;
    /** Callback for canvas clicks (direct) */
    onCanvasClick?: (event: React.MouseEvent) => void;
    /** Callback for tile hover (direct) */
    onTileHover?: (tile: IsometricTile | null, event: React.MouseEvent) => void;
    /** Callback for unit animation changes (direct) */
    onUnitAnimation?: (unitId: string, state: string) => void;
}

export interface UseGameCanvas3DEventsReturn {
    /** Handle tile click - emits event and calls callback */
    handleTileClick: (tile: IsometricTile, event: React.MouseEvent) => void;
    /** Handle unit click - emits event and calls callback */
    handleUnitClick: (unit: IsometricUnit, event: React.MouseEvent) => void;
    /** Handle feature click - emits event and calls callback */
    handleFeatureClick: (feature: IsometricFeature, event: React.MouseEvent) => void;
    /** Handle canvas click - emits event and calls callback */
    handleCanvasClick: (event: React.MouseEvent) => void;
    /** Handle tile hover - emits event and calls callback */
    handleTileHover: (tile: IsometricTile | null, event: React.MouseEvent) => void;
    /** Handle unit animation - emits event and calls callback */
    handleUnitAnimation: (unitId: string, state: string) => void;
    /** Handle camera change - emits event */
    handleCameraChange: (position: { x: number; y: number; z: number }) => void;
}

/**
 * Hook for integrating GameCanvas3D with the event bus
 *
 * Supports both declarative event props (tileClickEvent) and
 * direct callback props (onTileClick).
 *
 * @example
 * ```tsx
 * const events = useGameCanvas3DEvents({
 *     tileClickEvent: 'TILE_SELECTED',
 *     unitClickEvent: 'UNIT_SELECTED',
 *     onTileClick: (tile) => console.log('Tile:', tile)
 * });
 *
 * // In component:
 * <TileRenderer onTileClick={events.handleTileClick} />
 * ```
 */
export function useGameCanvas3DEvents(
    options: UseGameCanvas3DEventsOptions
): UseGameCanvas3DEventsReturn {
    const {
        tileClickEvent,
        unitClickEvent,
        featureClickEvent,
        canvasClickEvent,
        tileHoverEvent,
        tileLeaveEvent,
        unitAnimationEvent,
        cameraChangeEvent,
        onTileClick,
        onUnitClick,
        onFeatureClick,
        onCanvasClick,
        onTileHover,
        onUnitAnimation,
    } = options;

    const emit = useEmitEvent();

    // Use refs to avoid stale closures
    const optionsRef = useRef(options);
    optionsRef.current = options;

    const handleTileClick = useCallback(
        (tile: IsometricTile, event: React.MouseEvent) => {
            // Emit declarative event
            if (tileClickEvent) {
                emit(tileClickEvent, {
                    tileId: tile.id,
                    x: tile.x,
                    z: tile.z ?? tile.y ?? 0,
                    type: tile.type,
                    terrain: tile.terrain,
                    elevation: tile.elevation,
                });
            }

            // Call direct callback
            optionsRef.current.onTileClick?.(tile, event);
        },
        [tileClickEvent, emit]
    );

    const handleUnitClick = useCallback(
        (unit: IsometricUnit, event: React.MouseEvent) => {
            if (unitClickEvent) {
                emit(unitClickEvent, {
                    unitId: unit.id,
                    x: unit.x,
                    z: unit.z ?? unit.y ?? 0,
                    unitType: unit.unitType,
                    name: unit.name,
                    team: unit.team,
                    faction: unit.faction,
                    health: unit.health,
                    maxHealth: unit.maxHealth,
                });
            }

            optionsRef.current.onUnitClick?.(unit, event);
        },
        [unitClickEvent, emit]
    );

    const handleFeatureClick = useCallback(
        (feature: IsometricFeature, event: React.MouseEvent) => {
            if (featureClickEvent) {
                emit(featureClickEvent, {
                    featureId: feature.id,
                    x: feature.x,
                    z: feature.z ?? feature.y ?? 0,
                    type: feature.type,
                    elevation: feature.elevation,
                });
            }

            optionsRef.current.onFeatureClick?.(feature, event);
        },
        [featureClickEvent, emit]
    );

    const handleCanvasClick = useCallback(
        (event: React.MouseEvent) => {
            if (canvasClickEvent) {
                emit(canvasClickEvent, {
                    clientX: event.clientX,
                    clientY: event.clientY,
                    button: event.button,
                });
            }

            optionsRef.current.onCanvasClick?.(event);
        },
        [canvasClickEvent, emit]
    );

    const handleTileHover = useCallback(
        (tile: IsometricTile | null, event: React.MouseEvent) => {
            if (tile) {
                if (tileHoverEvent) {
                    emit(tileHoverEvent, {
                        tileId: tile.id,
                        x: tile.x,
                        z: tile.z ?? tile.y ?? 0,
                        type: tile.type,
                    });
                }
            } else {
                if (tileLeaveEvent) {
                    emit(tileLeaveEvent, {});
                }
            }

            optionsRef.current.onTileHover?.(tile, event);
        },
        [tileHoverEvent, tileLeaveEvent, emit]
    );

    const handleUnitAnimation = useCallback(
        (unitId: string, state: string) => {
            if (unitAnimationEvent) {
                emit(unitAnimationEvent, {
                    unitId,
                    state,
                    timestamp: Date.now(),
                });
            }

            optionsRef.current.onUnitAnimation?.(unitId, state);
        },
        [unitAnimationEvent, emit]
    );

    const handleCameraChange = useCallback(
        (position: { x: number; y: number; z: number }) => {
            if (cameraChangeEvent) {
                emit(cameraChangeEvent, {
                    position,
                    timestamp: Date.now(),
                });
            }
        },
        [cameraChangeEvent, emit]
    );

    return {
        handleTileClick,
        handleUnitClick,
        handleFeatureClick,
        handleCanvasClick,
        handleTileHover,
        handleUnitAnimation,
        handleCameraChange,
    };
}

export default useGameCanvas3DEvents;
