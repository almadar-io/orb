'use client';
/**
 * EventFlowTab - Displays event flow and debug messages
 * Uses existing component library atoms/molecules.
 */

import * as React from 'react';
import type { DebugEvent } from '../../../../lib/debugRegistry';
import { Badge } from '../../../atoms/Badge';
import { Typography } from '../../../atoms/Typography';
import { ButtonGroup } from '../../../molecules/ButtonGroup';
import { Button } from '../../../atoms/Button';
import { Checkbox } from '../../../atoms/Checkbox';
import { EmptyState } from '../../../molecules/EmptyState';

interface EventFlowTabProps {
    events: DebugEvent[];
}

const TYPE_BADGES: Record<string, { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'; icon: string }> = {
    trait: { variant: 'primary', icon: '🔄' },
    tick: { variant: 'warning', icon: '⏱️' },
    guard: { variant: 'warning', icon: '🛡️' },
    entity: { variant: 'info', icon: '📦' },
    event: { variant: 'success', icon: '⚡' },
    state: { variant: 'danger', icon: '📊' },
};

export function EventFlowTab({ events }: EventFlowTabProps) {
    const [filter, setFilter] = React.useState<string>('all');
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [autoScroll, setAutoScroll] = React.useState(true);

    // Auto-scroll to bottom when new events arrive
    React.useEffect(() => {
        if (autoScroll && containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [events.length, autoScroll]);

    const filteredEvents = React.useMemo(() => {
        if (filter === 'all') return events;
        return events.filter(e => e.type === filter);
    }, [events, filter]);

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }) + '.' + String(date.getMilliseconds()).padStart(3, '0');
    };

    if (events.length === 0) {
        return (
            <EmptyState
                title="No events yet"
                description="Events will appear as traits, ticks, and other systems execute"
                className="py-8"
            />
        );
    }

    const eventTypes = Object.keys(TYPE_BADGES).filter(type =>
        events.some(e => e.type === type)
    );

    return (
        <div className="debug-tab debug-tab--events">
            {/* Filters */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
                <ButtonGroup>
                    <Button
                        size="sm"
                        variant={filter === 'all' ? 'primary' : 'secondary'}
                        onClick={() => setFilter('all')}
                    >
                        All ({events.length})
                    </Button>
                    {eventTypes.map(type => {
                        const count = events.filter(e => e.type === type).length;
                        const { icon } = TYPE_BADGES[type];
                        return (
                            <Button
                                key={type}
                                size="sm"
                                variant={filter === type ? 'primary' : 'secondary'}
                                onClick={() => setFilter(type)}
                            >
                                {icon} {count}
                            </Button>
                        );
                    })}
                </ButtonGroup>
                <label className="flex items-center gap-1 text-xs text-gray-500 ml-auto cursor-pointer">
                    <Checkbox
                        checked={autoScroll}
                        onChange={(e) => setAutoScroll(e.target.checked)}
                    />
                    Auto-scroll
                </label>
            </div>

            {/* Event list */}
            <div
                ref={containerRef}
                className="max-h-64 overflow-y-auto space-y-1 bg-gray-50 dark:bg-gray-800 rounded p-2"
            >
                {filteredEvents.slice(-100).map(event => {
                    const { variant, icon } = TYPE_BADGES[event.type] || { variant: 'default' as const, icon: '•' };
                    return (
                        <div
                            key={event.id}
                            className="flex items-start gap-2 text-xs py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1"
                        >
                            <Typography variant="small" className="text-gray-400 font-mono min-w-[65px]">
                                {formatTime(event.timestamp)}
                            </Typography>
                            <span>{icon}</span>
                            <Badge variant={variant} size="sm" className="min-w-[60px] justify-center">
                                {event.source}
                            </Badge>
                            <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                                {event.message}
                            </Typography>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

EventFlowTab.displayName = 'EventFlowTab';
