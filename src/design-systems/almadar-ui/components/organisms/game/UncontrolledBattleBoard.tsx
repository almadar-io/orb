/**
 * UncontrolledBattleBoard
 *
 * Thin wrapper that composes `useBattleState` + `BattleBoard` for
 * self-managing game state.  Accepts `initialUnits` instead of the
 * controlled-mode fields and manages units, phase, turn, gameResult,
 * and selectedUnitId internally via the hook.
 *
 * Use this component when you want the BattleBoard to manage its own
 * game logic (e.g. in Storybook, prototypes, or simple integrations).
 * For Orbital trait integration, use `BattleBoard` directly in
 * controlled mode.
 *
 * @packageDocumentation
 */

import * as React from 'react';
import { BattleBoard, type BattleBoardProps, type BattleUnit } from './BattleBoard';
import { useBattleState } from './hooks/useBattleState';

export interface UncontrolledBattleBoardProps extends Omit<BattleBoardProps, 'entity'> {
    entity: Omit<BattleBoardProps['entity'], 'units' | 'phase' | 'turn' | 'gameResult' | 'selectedUnitId'> & {
        initialUnits: BattleUnit[];
    };
}

export function UncontrolledBattleBoard({ entity, ...rest }: UncontrolledBattleBoardProps) {
    const battleState = useBattleState(
        entity.initialUnits,
        {
            tileClickEvent: rest.tileClickEvent,
            unitClickEvent: rest.unitClickEvent,
            endTurnEvent: rest.endTurnEvent,
            cancelEvent: rest.cancelEvent,
            attackEvent: rest.attackEvent,
            gameEndEvent: rest.gameEndEvent,
            playAgainEvent: rest.playAgainEvent,
        },
        {
            onAttack: rest.onAttack,
            onGameEnd: rest.onGameEnd,
            onUnitMove: rest.onUnitMove,
            calculateDamage: rest.calculateDamage,
        },
    );

    return (
        <BattleBoard
            {...rest}
            entity={{
                ...entity,
                units: battleState.units,
                phase: battleState.phase,
                turn: battleState.turn,
                gameResult: battleState.gameResult,
                selectedUnitId: battleState.selectedUnitId,
            }}
        />
    );
}

UncontrolledBattleBoard.displayName = 'UncontrolledBattleBoard';

export default UncontrolledBattleBoard;
