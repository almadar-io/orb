/**
 * CombatLog Component
 *
 * Scrollable log of combat events with icons and colors.
 * Generalized from Trait Wars — removed asset manifest coupling.
 */

import React, { useRef, useEffect } from 'react';
import { Sword, Shield, Heart, Move, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Box, Typography, Badge, Card } from '../../atoms';
import { cn } from '../../../lib/cn';

export type CombatLogEventType = 'attack' | 'defend' | 'heal' | 'move' | 'special' | 'death' | 'spawn';

export interface CombatEvent {
    id: string;
    type: CombatLogEventType;
    message: string;
    timestamp: number;
    actorName?: string;
    targetName?: string;
    value?: number;
    turn?: number;
}

export interface CombatLogProps {
    events: CombatEvent[];
    maxVisible?: number;
    autoScroll?: boolean;
    showTimestamps?: boolean;
    title?: string;
    className?: string;
}

const eventIcons: Record<CombatLogEventType, LucideIcon> = {
    attack: Sword,
    defend: Shield,
    heal: Heart,
    move: Move,
    special: Zap,
    death: Sword,
    spawn: Zap,
};

const eventColors: Record<CombatLogEventType, string> = {
    attack: 'text-error',
    defend: 'text-info',
    heal: 'text-success',
    move: 'text-primary',
    special: 'text-warning',
    death: 'text-muted-foreground',
    spawn: 'text-accent',
};

const eventBadgeVariants: Record<CombatLogEventType, 'danger' | 'primary' | 'success' | 'warning' | 'secondary'> = {
    attack: 'danger',
    defend: 'primary',
    heal: 'success',
    move: 'warning',
    special: 'secondary',
    death: 'secondary',
    spawn: 'secondary',
};

export function CombatLog({
    events,
    maxVisible = 50,
    autoScroll = true,
    showTimestamps = false,
    className,
    title = 'Combat Log',
}: CombatLogProps): React.JSX.Element {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (autoScroll && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [events, autoScroll]);

    const visibleEvents = events.slice(-maxVisible);

    return (
        <Card variant="default" className={cn('flex flex-col', className)}>
            <Box padding="sm" border className="border-b-2 border-x-0 border-t-0 border-[var(--color-border)]">
                <Box display="flex" className="items-center justify-between">
                    <Typography variant="body2" className="font-bold">{title}</Typography>
                    <Badge variant="neutral" size="sm">{events.length} events</Badge>
                </Box>
            </Box>
            <Box ref={scrollRef} overflow="auto" className="flex-1 max-h-64">
                {visibleEvents.length === 0 ? (
                    <Box padding="md" className="text-center opacity-50">
                        <Typography variant="body2">No events yet</Typography>
                    </Box>
                ) : (
                    <Box padding="xs" className="space-y-1">
                        {visibleEvents.map((event) => {
                            const EventIcon = eventIcons[event.type];
                            const colorClass = eventColors[event.type];
                            return (
                                <Box key={event.id} display="flex" padding="xs" rounded="sm"
                                    className={cn('items-start gap-2 hover:bg-[var(--color-muted)] transition-colors', event.type === 'death' && 'opacity-60')}>
                                    <Box className={cn('flex-shrink-0 mt-0.5', colorClass)}>
                                        <EventIcon className="h-4 w-4" />
                                    </Box>
                                    <Box className="flex-1 min-w-0">
                                        <Typography variant="caption" className="block">{event.message}</Typography>
                                        {event.value !== undefined && (
                                            <Badge variant={eventBadgeVariants[event.type]} size="sm" className="mt-1">
                                                {event.type === 'heal' ? '+' : event.type === 'attack' ? '-' : ''}{event.value}
                                            </Badge>
                                        )}
                                    </Box>
                                    {(event.turn || showTimestamps) && (
                                        <Box className="flex-shrink-0">
                                            <Typography variant="caption" className="opacity-40">
                                                {event.turn ? `T${event.turn}` : ''}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </Box>
        </Card>
    );
}

CombatLog.displayName = 'CombatLog';
