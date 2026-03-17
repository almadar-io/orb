/**
 * TicksTab - Displays tick execution timing and status
 * Uses existing component library atoms/molecules.
 */

import * as React from 'react';
import type { TickExecution } from '../../../../lib/tickRegistry';
import { Badge } from '../../../atoms/Badge';
import { Typography } from '../../../atoms/Typography';
import { Stack } from '../../../atoms/Stack';
import { Card } from '../../../atoms/Card';
import { EmptyState } from '../../../molecules/EmptyState';

interface TicksTabProps {
    ticks: TickExecution[];
}

export function TicksTab({ ticks }: TicksTabProps) {
    const activeTicks = ticks.filter(t => t.active);
    const inactiveTicks = ticks.filter(t => !t.active);

    if (ticks.length === 0) {
        return (
            <EmptyState
                title="No ticks registered"
                description="Ticks will appear when trait tick handlers are running"
                className="py-8"
            />
        );
    }

    const formatTime = (ms: number) => {
        if (ms === 0) return 'never';
        const seconds = Math.floor((Date.now() - ms) / 1000);
        if (seconds < 1) return 'just now';
        if (seconds < 60) return `${seconds}s ago`;
        return `${Math.floor(seconds / 60)}m ago`;
    };

    const TickCard = ({ tick, active }: { tick: TickExecution; active: boolean }) => (
        <Card className={`p-3 ${!active ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${active ? 'bg-green-500' : 'bg-gray-400'}`} />
                <Typography variant="body" weight="semibold" className="text-amber-600 dark:text-amber-400">
                    {tick.name}
                </Typography>
                <Typography variant="small" className="text-gray-500">
                    {tick.traitName}
                </Typography>
            </div>
            <div className="flex gap-3 text-xs text-gray-500">
                <span>{tick.interval}ms</span>
                <span>{tick.runCount} runs</span>
                <span>{tick.executionTime.toFixed(1)}ms exec</span>
                <span>{formatTime(tick.lastRun)}</span>
            </div>
            {tick.guardName && (
                <div className="mt-2">
                    <Badge variant={tick.guardPassed ? 'success' : 'danger'} size="sm">
                        {tick.guardName}: {tick.guardPassed ? '✓' : '✗'}
                    </Badge>
                </div>
            )}
        </Card>
    );

    return (
        <div className="debug-tab debug-tab--ticks">
            {/* Active ticks */}
            {activeTicks.length > 0 && (
                <div className="mb-4">
                    <Typography variant="small" weight="medium" className="text-gray-500 mb-2">
                        Active ({activeTicks.length})
                    </Typography>
                    <Stack gap="sm">
                        {activeTicks.map(tick => (
                            <TickCard key={tick.id} tick={tick} active />
                        ))}
                    </Stack>
                </div>
            )}

            {/* Inactive ticks */}
            {inactiveTicks.length > 0 && (
                <div>
                    <Typography variant="small" weight="medium" className="text-gray-400 mb-2">
                        Inactive ({inactiveTicks.length})
                    </Typography>
                    <Stack gap="sm">
                        {inactiveTicks.map(tick => (
                            <TickCard key={tick.id} tick={tick} active={false} />
                        ))}
                    </Stack>
                </div>
            )}
        </div>
    );
}

TicksTab.displayName = 'TicksTab';
