/**
 * CastleTemplate
 *
 * Thin declarative wrapper around CastleBoard organism.
 * All game logic (hover state, feature selection, etc.) lives in CastleBoard.
 *
 * Compliant with Almadar_Templates.md: no hooks, no callbacks, entity-only data flow.
 *
 * @packageDocumentation
 */

import React from 'react';
import type { TemplateProps } from './types';
import { CastleBoard } from '../organisms/game/CastleBoard';
import type { CastleEntity } from '../organisms/game/CastleBoard';

// Re-export types for backward compatibility
export type {
    CastleEntity,
    CastleSlotContext,
} from '../organisms/game/CastleBoard';

// =============================================================================
// Template Props
// =============================================================================

export interface CastleTemplateProps extends TemplateProps<CastleEntity> {
    /** Canvas render scale */
    scale?: number;
}

// =============================================================================
// Template
// =============================================================================

export function CastleTemplate({
    entity,
    scale = 0.45,
    className,
}: CastleTemplateProps): React.JSX.Element {
    return (
        <CastleBoard
            entity={entity}
            scale={scale}
            featureClickEvent="FEATURE_CLICK"
            unitClickEvent="UNIT_CLICK"
            tileClickEvent="TILE_CLICK"
            className={className}
        />
    );
}

CastleTemplate.displayName = 'CastleTemplate';

export default CastleTemplate;
