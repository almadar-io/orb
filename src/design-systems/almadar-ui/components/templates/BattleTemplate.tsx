/**
 * BattleTemplate
 *
 * Thin declarative wrapper around BattleBoard organism.
 * All game logic (turn phases, movement animation, combat, etc.) lives in BattleBoard.
 *
 * Compliant with Almadar_Templates.md: no hooks, no callbacks, entity-only data flow.
 *
 * @packageDocumentation
 */

import React from 'react';
import type { TemplateProps } from './types';
import { BattleBoard } from '../organisms/game/BattleBoard';
import type { BattleEntity } from '../organisms/game/BattleBoard';

// Re-export types for backward compatibility
export type {
    BattleEntity,
    BattlePhase,
    BattleUnit,
    BattleTile,
    BattleSlotContext,
} from '../organisms/game/BattleBoard';

// =============================================================================
// Template Props
// =============================================================================

export interface BattleTemplateProps extends TemplateProps<BattleEntity> {
    /** Canvas render scale */
    scale?: number;
    /** Unit draw-size multiplier */
    unitScale?: number;
}

// =============================================================================
// Template
// =============================================================================

export function BattleTemplate({
    entity,
    scale = 0.45,
    unitScale = 1,
    className,
}: BattleTemplateProps): React.JSX.Element {
    return (
        <BattleBoard
            entity={entity}
            scale={scale}
            unitScale={unitScale}
            tileClickEvent="TILE_CLICK"
            unitClickEvent="UNIT_CLICK"
            endTurnEvent="END_TURN"
            cancelEvent="CANCEL"
            gameEndEvent="GAME_END"
            playAgainEvent="PLAY_AGAIN"
            attackEvent="ATTACK"
            className={className}
        />
    );
}

BattleTemplate.displayName = 'BattleTemplate';

export default BattleTemplate;
