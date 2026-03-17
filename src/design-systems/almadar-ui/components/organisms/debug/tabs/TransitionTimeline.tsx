'use client';
/**
 * TransitionTimeline - Visual timeline of state machine transitions
 *
 * Shows each transition with:
 * - Trait name, from → to state, triggering event
 * - Guard result (if any)
 * - Effect execution results (green = executed, red = failed)
 * - Timestamp
 */

import * as React from 'react';
import type { TransitionTrace, EffectTrace } from '../../../../lib/verificationRegistry';
import { Badge } from '../../../atoms/Badge';
import { Typography } from '../../../atoms/Typography';
import { EmptyState } from '../../../molecules/EmptyState';
import { Checkbox } from '../../../atoms/Checkbox';

interface TransitionTimelineProps {
    transitions: TransitionTrace[];
}

const EFFECT_STATUS_VARIANT: Record<string, 'success' | 'danger' | 'warning' | 'default'> = {
    executed: 'success',
    failed: 'danger',
    skipped: 'warning',
};

function EffectBadge({ effect }: { effect: EffectTrace }) {
    const variant = EFFECT_STATUS_VARIANT[effect.status] || 'default';
    const icon = effect.status === 'executed' ? '\u2713' : effect.status === 'failed' ? '\u2717' : '-';

    return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-gray-100 dark:bg-gray-700 rounded px-1.5 py-0.5">
            <Badge variant={variant} size="sm" className="!text-[9px] !px-1 !py-0">
                {icon}
            </Badge>
            <span className="text-gray-600 dark:text-gray-400">{effect.type}</span>
            {effect.error && (
                <span className="text-red-500 truncate max-w-[120px]" title={effect.error}>
                    {effect.error}
                </span>
            )}
        </span>
    );
}

export function TransitionTimeline({ transitions }: TransitionTimelineProps) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [autoScroll, setAutoScroll] = React.useState(true);
    const [expandedId, setExpandedId] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (autoScroll && containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [transitions.length, autoScroll]);

    if (transitions.length === 0) {
        return (
            <EmptyState
                title="No transitions recorded"
                description="Transitions will appear as the state machine processes events"
                className="py-8"
            />
        );
    }

    const formatTime = (ts: number) => {
        const d = new Date(ts);
        return d.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }) + '.' + String(d.getMilliseconds()).padStart(3, '0');
    };

    // Show most recent first in display, but timeline goes top=oldest, bottom=newest
    const sorted = [...transitions].reverse();

    return (
        <div className="debug-tab debug-tab--timeline">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <Typography variant="small" className="text-gray-500">
                    {transitions.length} transitions recorded
                </Typography>
                <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                    <Checkbox
                        checked={autoScroll}
                        onChange={(e) => setAutoScroll(e.target.checked)}
                    />
                    Auto-scroll
                </label>
            </div>

            {/* Timeline */}
            <div
                ref={containerRef}
                className="max-h-80 overflow-y-auto space-y-0"
            >
                {sorted.map((trace, idx) => {
                    const isExpanded = expandedId === trace.id;
                    const hasFailedEffects = trace.effects.some(e => e.status === 'failed');
                    const allPassed = trace.effects.length > 0 && trace.effects.every(e => e.status === 'executed');

                    return (
                        <div
                            key={trace.id}
                            className={`
                                relative pl-6 pb-3 border-l-2 cursor-pointer
                                hover:bg-gray-50 dark:hover:bg-gray-800 rounded-r
                                ${hasFailedEffects ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'}
                            `}
                            onClick={() => setExpandedId(isExpanded ? null : trace.id)}
                        >
                            {/* Timeline dot */}
                            <div className={`
                                absolute left-[-5px] top-1 w-2 h-2 rounded-full
                                ${hasFailedEffects ? 'bg-red-500' : allPassed ? 'bg-green-500' : 'bg-gray-400'}
                            `} />

                            {/* Main row */}
                            <div className="flex items-center gap-2 text-xs py-1 px-2">
                                <Typography variant="small" className="text-gray-400 font-mono min-w-[65px]">
                                    {formatTime(trace.timestamp)}
                                </Typography>
                                <Badge variant="primary" size="sm" className="min-w-[60px] justify-center">
                                    {trace.traitName}
                                </Badge>
                                <Typography variant="small" className="font-mono text-gray-600 dark:text-gray-400">
                                    {trace.from} <span className="text-gray-400">{'\u2192'}</span> {trace.to}
                                </Typography>
                                <Badge variant="info" size="sm">
                                    {trace.event}
                                </Badge>
                                {trace.guardResult !== undefined && (
                                    <Badge
                                        variant={trace.guardResult ? 'success' : 'danger'}
                                        size="sm"
                                    >
                                        guard: {trace.guardResult ? '\u2713' : '\u2717'}
                                    </Badge>
                                )}
                                <Typography variant="small" className="text-gray-400 ml-auto">
                                    {trace.effects.length} effects
                                </Typography>
                            </div>

                            {/* Expanded effects detail */}
                            {isExpanded && trace.effects.length > 0 && (
                                <div className="ml-2 mt-1 mb-2 pl-2 border-l border-gray-200 dark:border-gray-700 space-y-1">
                                    {trace.effects.map((effect, eIdx) => (
                                        <div key={eIdx} className="flex items-center gap-1">
                                            <EffectBadge effect={effect} />
                                            {effect.args.length > 0 && (
                                                <Typography variant="small" className="text-gray-400 font-mono text-[10px] truncate max-w-[200px]">
                                                    {JSON.stringify(effect.args)}
                                                </Typography>
                                            )}
                                            {effect.durationMs !== undefined && (
                                                <Typography variant="small" className="text-gray-400 text-[10px]">
                                                    {effect.durationMs}ms
                                                </Typography>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

TransitionTimeline.displayName = 'TransitionTimeline';
