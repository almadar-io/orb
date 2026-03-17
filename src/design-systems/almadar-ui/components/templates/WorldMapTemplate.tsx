/**
 * WorldMapTemplate
 *
 * Thin declarative wrapper around WorldMapBoard organism.
 * All game logic (hero movement, encounters, hex conversion, etc.) lives in WorldMapBoard.
 *
 * Compliant with Almadar_Templates.md: no hooks, no callbacks, entity-only data flow.
 *
 * @packageDocumentation
 */

import React from 'react';
import type { TemplateProps } from './types';
import { WorldMapBoard } from '../organisms/game/WorldMapBoard';
import type { WorldMapEntity } from '../organisms/game/WorldMapBoard';

// Re-export types for backward compatibility
export type {
    WorldMapEntity,
    MapHero,
    MapHex,
    WorldMapSlotContext,
} from '../organisms/game/WorldMapBoard';

// =============================================================================
// Template Props
// =============================================================================

export interface WorldMapTemplateProps extends TemplateProps<WorldMapEntity> {
    /** Canvas render scale */
    scale?: number;
    /** Unit draw-size multiplier */
    unitScale?: number;
    /** Override for the diamond-top Y offset within tile sprites (default: 374). */
    diamondTopY?: number;
    /** Allow selecting / moving ALL heroes (including enemy). For testing. */
    allowMoveAllHeroes?: boolean;
}

// =============================================================================
// Template
// =============================================================================

export function WorldMapTemplate({
    entity,
    scale = 0.4,
    unitScale = 2.5,
    diamondTopY,
    allowMoveAllHeroes = false,
    className,
}: WorldMapTemplateProps): React.JSX.Element {
    return (
        <WorldMapBoard
            entity={entity}
            scale={scale}
            unitScale={unitScale}
            diamondTopY={diamondTopY}
            allowMoveAllHeroes={allowMoveAllHeroes}
            heroSelectEvent="HERO_SELECT"
            heroMoveEvent="HERO_MOVE"
            battleEncounterEvent="BATTLE_ENCOUNTER"
            featureEnterEvent="FEATURE_ENTER"
            className={className}
        />
    );
}

WorldMapTemplate.displayName = 'WorldMapTemplate';

export default WorldMapTemplate;
