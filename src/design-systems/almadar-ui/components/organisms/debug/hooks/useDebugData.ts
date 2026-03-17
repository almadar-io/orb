'use client';
/**
 * useDebugData - Hook that aggregates data from all debug registries
 *
 * Polls registries and provides combined data for the RuntimeDebugger.
 * Includes verification data (checks, transitions, bridge health).
 *
 * @packageDocumentation
 */

import * as React from 'react';
import {
    getAllTraits,
    subscribeToTraitChanges,
    type TraitDebugInfo
} from '../../../../lib/traitRegistry';
import {
    getAllTicks,
    subscribeToTickChanges,
    type TickExecution
} from '../../../../lib/tickRegistry';
import {
    getGuardHistory,
    subscribeToGuardChanges,
    type GuardEvaluation
} from '../../../../lib/guardRegistry';
import {
    getEntitySnapshot,
    type EntitySnapshot
} from '../../../../lib/entityDebug';
import {
    getDebugEvents,
    subscribeToDebugEvents,
    type DebugEvent
} from '../../../../lib/debugRegistry';
import {
    getAllChecks,
    getTransitions,
    getBridgeHealth,
    getSummary,
    subscribeToVerification,
    type VerificationCheck,
    type TransitionTrace,
    type BridgeHealth,
    type VerificationSummary,
} from '../../../../lib/verificationRegistry';

export interface DebugData {
    traits: TraitDebugInfo[];
    ticks: TickExecution[];
    guards: GuardEvaluation[];
    events: DebugEvent[];
    entitySnapshot: EntitySnapshot | null;
    verification: {
        checks: VerificationCheck[];
        transitions: TransitionTrace[];
        bridge: BridgeHealth | null;
        summary: VerificationSummary;
    };
    lastUpdate: number;
}

/**
 * Hook that aggregates data from all debug registries.
 * Subscribes to changes and polls entity snapshots.
 */
export function useDebugData(): DebugData {
    const [data, setData] = React.useState<DebugData>(() => ({
        traits: [],
        ticks: [],
        guards: [],
        events: [],
        entitySnapshot: null,
        verification: {
            checks: [],
            transitions: [],
            bridge: null,
            summary: { totalChecks: 0, passed: 0, failed: 0, warnings: 0, pending: 0 },
        },
        lastUpdate: Date.now(),
    }));

    // Subscribe to all registries
    React.useEffect(() => {
        // Update function
        const updateData = () => {
            setData({
                traits: getAllTraits(),
                ticks: getAllTicks(),
                guards: getGuardHistory(),
                events: getDebugEvents(),
                entitySnapshot: getEntitySnapshot(),
                verification: {
                    checks: getAllChecks(),
                    transitions: getTransitions(),
                    bridge: getBridgeHealth(),
                    summary: getSummary(),
                },
                lastUpdate: Date.now(),
            });
        };

        // Initial load
        updateData();

        // Subscribe to changes
        const unsubTraits = subscribeToTraitChanges(updateData);
        const unsubTicks = subscribeToTickChanges(updateData);
        const unsubGuards = subscribeToGuardChanges(updateData);
        const unsubEvents = subscribeToDebugEvents(updateData);
        const unsubVerification = subscribeToVerification(updateData);

        // Poll entity snapshot (entities don't have a subscription system)
        const pollInterval = setInterval(() => {
            setData(prev => ({
                ...prev,
                entitySnapshot: getEntitySnapshot(),
                lastUpdate: Date.now(),
            }));
        }, 500);

        return () => {
            unsubTraits();
            unsubTicks();
            unsubGuards();
            unsubEvents();
            unsubVerification();
            clearInterval(pollInterval);
        };
    }, []);

    return data;
}
