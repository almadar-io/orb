/**
 * TraitsTab - Displays active traits and their state machines
 * Uses existing component library atoms/molecules.
 */

import * as React from 'react';
import type { TraitDebugInfo } from '../../../../lib/traitRegistry';
import { Accordion } from '../../../molecules/Accordion';
import { Badge } from '../../../atoms/Badge';
import { Typography } from '../../../atoms/Typography';
import { Stack } from '../../../atoms/Stack';
import { EmptyState } from '../../../molecules/EmptyState';

interface TraitsTabProps {
    traits: TraitDebugInfo[];
}

export function TraitsTab({ traits }: TraitsTabProps) {
    if (traits.length === 0) {
        return (
            <EmptyState
                title="No active traits"
                description="Traits will appear when components using them are mounted"
                className="py-8"
            />
        );
    }

    const accordionItems = traits.map(trait => ({
        id: trait.id,
        header: (
            <div className="flex items-center gap-2 w-full">
                <Typography variant="body" weight="semibold" className="text-purple-600 dark:text-purple-400">
                    {trait.name}
                </Typography>
                <Badge variant="success" size="sm">{trait.currentState}</Badge>
                <Typography variant="small" className="text-gray-500 ml-auto">
                    {trait.transitionCount} transitions
                </Typography>
            </div>
        ),
        content: (
            <Stack gap="sm">
                {/* States */}
                <div>
                    <Typography variant="small" weight="medium" className="text-gray-500 mb-2">States</Typography>
                    <div className="flex flex-wrap gap-1">
                        {trait.states.map(state => (
                            <Badge
                                key={state}
                                variant={state === trait.currentState ? 'success' : 'default'}
                                size="sm"
                            >
                                {state}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Transitions */}
                {trait.transitions.length > 0 && (
                    <div>
                        <Typography variant="small" weight="medium" className="text-gray-500 mb-2">Transitions</Typography>
                        <Stack gap="xs">
                            {trait.transitions.map((t, i) => (
                                <Typography key={i} variant="small" className="font-mono">
                                    {t.from} → {t.to} <span className="text-gray-500">({t.event})</span>
                                    {t.guard && <span className="text-amber-500"> [{t.guard}]</span>}
                                </Typography>
                            ))}
                        </Stack>
                    </div>
                )}

                {/* Guards */}
                {trait.guards.length > 0 && (
                    <div>
                        <Typography variant="small" weight="medium" className="text-gray-500 mb-2">Guards</Typography>
                        <Stack gap="xs">
                            {trait.guards.map((g, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <Typography variant="small">{g.name}</Typography>
                                    <Badge variant={g.lastResult === true ? 'success' : g.lastResult === false ? 'danger' : 'default'} size="sm">
                                        {g.lastResult === undefined ? '?' : g.lastResult ? '✓' : '✗'}
                                    </Badge>
                                </div>
                            ))}
                        </Stack>
                    </div>
                )}
            </Stack>
        ),
    }));

    return (
        <div className="debug-tab debug-tab--traits">
            <Accordion items={accordionItems} multiple />
        </div>
    );
}

TraitsTab.displayName = 'TraitsTab';
