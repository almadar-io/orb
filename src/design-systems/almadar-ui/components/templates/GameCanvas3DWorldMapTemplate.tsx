/**
 * GameCanvas3DWorldMapTemplate
 *
 * Pure declarative template wrapper for 3D world map.
 * No hooks, no callbacks, no local state -- just entity data and config props.
 *
 * Page: WorldMap3DPage
 * Entity: WorldMap3D
 * ViewType: detail
 *
 * Events Emitted:
 * - TILE_SELECTED - When a tile is clicked ({ tileId, x, z, type })
 * - UNIT_SELECTED - When a unit is clicked ({ unitId, x, z, name })
 * - FEATURE_SELECTED - When a feature is clicked ({ featureId, x, z, type })
 * - TILE_HOVERED - When hovering over a tile ({ tileId, x, z })
 * - TILE_LEAVE - When leaving a tile ({})
 * - CAMERA_CHANGED - When camera position changes ({ position })
 *
 * @packageDocumentation
 */

import React from 'react';
import { GameCanvas3D, type GameCanvas3DProps } from '../organisms/game/GameCanvas3D';
import type { IsometricTile, IsometricUnit, IsometricFeature } from '../organisms/game/types/isometric';
import type { TemplateProps } from './types';

export interface WorldMap3DEntity {
    /** Map tiles */
    tiles: IsometricTile[];
    /** Units on the map */
    units: IsometricUnit[];
    /** Map features (castles, resources, etc.) */
    features: IsometricFeature[];
    /** Entity ID */
    id: string;
    /** Entity name */
    name?: string;
}

export interface GameCanvas3DWorldMapTemplateProps extends TemplateProps<WorldMap3DEntity> {
    /** 3D camera mode */
    cameraMode?: 'isometric' | 'perspective' | 'top-down';
    /** Show grid helper */
    showGrid?: boolean;
    /** Show coordinate overlay */
    showCoordinates?: boolean;
    /** Show tile info on hover */
    showTileInfo?: boolean;
    /** Enable shadows */
    shadows?: boolean;
    /** Background color */
    backgroundColor?: string;
    /** Event name for tile clicks */
    tileClickEvent?: string;
    /** Event name for unit clicks */
    unitClickEvent?: string;
    /** Event name for feature clicks */
    featureClickEvent?: string;
    /** Event name for tile hover */
    tileHoverEvent?: string;
    /** Event name for tile leave */
    tileLeaveEvent?: string;
    /** Event name for camera changes */
    cameraChangeEvent?: string;
    /** Exit/back event name */
    exitEvent?: string;
    /** Currently selected unit ID */
    selectedUnitId?: string | null;
    /** Valid move positions for selected unit */
    validMoves?: Array<{ x: number; z: number }>;
    /** Attack target positions */
    attackTargets?: Array<{ x: number; z: number }>;
}

/**
 * GameCanvas3DWorldMapTemplate Component
 *
 * Template for 3D world map view.
 *
 * @example
 * ```tsx
 * <GameCanvas3DWorldMapTemplate
 *     entity={worldMapEntity}
 *     cameraMode="isometric"
 *     tileClickEvent="SELECT_TILE"
 *     unitClickEvent="SELECT_UNIT"
 *     showCoordinates={true}
 * />
 * ```
 */
export function GameCanvas3DWorldMapTemplate({
    entity,
    cameraMode = 'isometric',
    showGrid = true,
    showCoordinates = true,
    showTileInfo = true,
    shadows = true,
    backgroundColor = '#1a1a2e',
    tileClickEvent,
    unitClickEvent,
    featureClickEvent,
    tileHoverEvent,
    tileLeaveEvent,
    cameraChangeEvent,
    selectedUnitId,
    validMoves,
    attackTargets,
    className,
}: GameCanvas3DWorldMapTemplateProps): React.JSX.Element {
    return (
        <GameCanvas3D
            tiles={entity.tiles}
            units={entity.units}
            features={entity.features}
            cameraMode={cameraMode}
            showGrid={showGrid}
            showCoordinates={showCoordinates}
            showTileInfo={showTileInfo}
            shadows={shadows}
            backgroundColor={backgroundColor}
            tileClickEvent={tileClickEvent}
            unitClickEvent={unitClickEvent}
            featureClickEvent={featureClickEvent}
            tileHoverEvent={tileHoverEvent}
            tileLeaveEvent={tileLeaveEvent}
            cameraChangeEvent={cameraChangeEvent}
            selectedUnitId={selectedUnitId}
            validMoves={validMoves}
            attackTargets={attackTargets}
            className={className}
        />
    );
}

GameCanvas3DWorldMapTemplate.displayName = 'GameCanvas3DWorldMapTemplate';

export default GameCanvas3DWorldMapTemplate;
