/**
 * EventLog Component
 *
 * Scrolling log of events during playback in the Event Handler tier.
 * Shows the chain reaction as events cascade through objects.
 *
 * @packageDocumentation
 */

import React, { useEffect, useRef } from 'react';
import { VStack, HStack, Box, Typography } from '../../../../atoms';
import { cn } from '../../../../../lib/cn';
import { useTranslate } from '../../../../../hooks/useTranslate';

export interface EventLogEntry {
    id: string;
    timestamp: number;
    icon: string;
    message: string;
    status: 'pending' | 'active' | 'done' | 'error';
}

export interface EventLogProps {
    /** Log entries */
    entries: EventLogEntry[];
    /** Max visible height before scroll */
    maxHeight?: number;
    /** Title label */
    label?: string;
    /** Additional CSS classes */
    className?: string;
}

const STATUS_STYLES = {
    pending: 'text-muted-foreground',
    active: 'text-primary animate-pulse',
    done: 'text-success',
    error: 'text-error',
};

const STATUS_DOTS = {
    pending: '\u25CB',
    active: '\u25CF',
    done: '\u2714',
    error: '\u2717',
};

export function EventLog({
    entries,
    maxHeight = 200,
    label,
    className,
}: EventLogProps): React.JSX.Element {
    const { t } = useTranslate();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new entries
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [entries.length]);

    return (
        <VStack className={cn('p-3 rounded-lg bg-card border border-border', className)} gap="sm">
            <Typography variant="body2" className="text-muted-foreground font-medium">
                {label ?? t('eventHandler.eventLog')}
            </Typography>
            <Box
                ref={scrollRef}
                className="overflow-y-auto"
                style={{ maxHeight }}
            >
                <VStack gap="xs">
                    {entries.length === 0 && (
                        <Typography variant="caption" className="text-muted-foreground italic">
                            {t('eventHandler.noEvents')}
                        </Typography>
                    )}
                    {entries.map(entry => (
                        <HStack key={entry.id} className="items-start" gap="xs">
                            <Typography variant="caption" className={STATUS_STYLES[entry.status]}>
                                {STATUS_DOTS[entry.status]}
                            </Typography>
                            <Typography variant="caption" className="text-foreground">
                                {entry.icon}
                            </Typography>
                            <Typography variant="caption" className={cn('flex-1', STATUS_STYLES[entry.status])}>
                                {entry.message}
                            </Typography>
                        </HStack>
                    ))}
                </VStack>
            </Box>
        </VStack>
    );
}

EventLog.displayName = 'EventLog';

export default EventLog;
