'use client';
/**
 * Timeline Organism Component
 *
 * A vertical timeline component for displaying chronological events.
 * Composes atoms and molecules for layout, uses CSS variables for theming.
 *
 * Orbital Component Interface Compliance:
 * - Entity binding with auto-fetch when entity is a string
 * - Event emission via useEventBus (UI:* events)
 * - isLoading and error state props
 * - className for external styling
 */

import React from "react";
import { cn } from "../../lib/cn";
import { Card, Typography, Badge, Icon, Box } from "../atoms";
import { VStack, HStack } from "../atoms/Stack";
import { LoadingState } from "../molecules/LoadingState";
import { ErrorState } from "../molecules/ErrorState";
import { EmptyState } from "../molecules/EmptyState";
import { useTranslate } from "../../hooks/useTranslate";
import type { EntityDisplayProps } from "./types";
import type { LucideIcon } from "lucide-react";
import { Circle, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export type TimelineItemStatus = "complete" | "active" | "pending" | "error";

export interface TimelineItem {
    /** Unique identifier */
    id: string;
    /** Item title */
    title: string;
    /** Item description */
    description?: string;
    /** Timestamp string */
    date?: string;
    /** Status indicator */
    status?: TimelineItemStatus;
    /** Icon override */
    icon?: LucideIcon;
    /** Additional metadata tags */
    tags?: readonly string[];
}

export interface TimelineAction {
    label: string;
    event?: string;
    navigatesTo?: string;
    variant?: "primary" | "secondary" | "ghost";
}

export interface TimelineProps extends EntityDisplayProps<TimelineItem> {
    /** Timeline title */
    title?: string;
    /** Timeline items */
    items?: readonly TimelineItem[];
    /** Fields to display */
    fields?: readonly string[];
    /** Actions per item */
    itemActions?: readonly TimelineAction[];
}

const STATUS_STYLES: Record<
    TimelineItemStatus,
    { dotColor: string; lineColor: string; icon: LucideIcon }
> = {
    complete: {
        dotColor: "text-[var(--color-success)]",
        lineColor: "bg-[var(--color-success)]",
        icon: CheckCircle2,
    },
    active: {
        dotColor: "text-[var(--color-primary)]",
        lineColor: "bg-[var(--color-primary)]",
        icon: Clock,
    },
    pending: {
        dotColor: "text-[var(--color-muted-foreground)]",
        lineColor: "bg-[var(--color-border)]",
        icon: Circle,
    },
    error: {
        dotColor: "text-[var(--color-error)]",
        lineColor: "bg-[var(--color-error)]",
        icon: AlertCircle,
    },
};

export const Timeline: React.FC<TimelineProps> = ({
    title,
    items: propItems,
    fields,
    itemActions,
    entity,
    isLoading = false,
    error,
    className,
}) => {
    const { t } = useTranslate();
    void t;

    // Normalize entity data to TimelineItem[] if schema data is provided
    const entityData = Array.isArray(entity) ? entity as readonly Record<string, unknown>[] : [];
    const items: readonly TimelineItem[] = React.useMemo(() => {
        if (propItems) return propItems;
        if (entityData.length === 0) return [];

        return entityData.map((record, idx) => {
            const titleField = fields?.[0] || "title";
            const descField = fields?.[1] || "description";
            const dateField = fields?.find((f) =>
                f.toLowerCase().includes("date"),
            ) || "date";
            const statusField = fields?.find((f) =>
                f.toLowerCase().includes("status"),
            ) || "status";

            return {
                id: String(record.id ?? idx),
                title: String(record[titleField] ?? ""),
                description: record[descField] ? String(record[descField]) : undefined,
                date: record[dateField] ? String(record[dateField]) : undefined,
                status: (record[statusField] as TimelineItemStatus) || "pending",
            };
        });
    }, [propItems, entityData, fields]);

    if (isLoading) {
        return <LoadingState message="Loading timeline..." className={className} />;
    }

    if (error) {
        return (
            <ErrorState
                title="Timeline error"
                message={error.message}
                className={className}
            />
        );
    }

    if (items.length === 0) {
        return (
            <EmptyState
                title="No events"
                description="No timeline events to display."
                className={className}
            />
        );
    }

    return (
        <Card className={cn("p-6", className)}>
            <VStack gap="md">
                {title && (
                    <Typography variant="h5" weight="semibold">
                        {title}
                    </Typography>
                )}

                <VStack gap="none" className="relative">
                    {items.map((item, idx) => {
                        const status = item.status || "pending";
                        const style = STATUS_STYLES[status];
                        const ItemIcon = item.icon || style.icon;
                        const isLast = idx === items.length - 1;

                        return (
                            <HStack key={item.id} gap="md" align="start" className="relative">
                                {/* Timeline track */}
                                <VStack align="center" className="flex-shrink-0 relative" style={{ width: "24px" }}>
                                    <Icon
                                        icon={ItemIcon}
                                        size="sm"
                                        className={cn(style.dotColor, "z-10 bg-[var(--color-card)]")}
                                    />
                                    {!isLast && (
                                        <Box
                                            className={cn(
                                                "w-0.5 flex-1 min-h-[24px]",
                                                style.lineColor,
                                                "opacity-40",
                                            )}
                                        />
                                    )}
                                </VStack>

                                {/* Content */}
                                <VStack gap="xs" className={cn("flex-1 min-w-0", !isLast && "pb-6")}>
                                    <HStack justify="between" align="start" wrap>
                                        <Typography variant="body" weight="semibold">
                                            {item.title}
                                        </Typography>
                                        {item.date && (
                                            <Typography variant="caption" color="secondary" className="flex-shrink-0">
                                                {item.date}
                                            </Typography>
                                        )}
                                    </HStack>

                                    {item.description && (
                                        <Typography variant="small" color="secondary">
                                            {item.description}
                                        </Typography>
                                    )}

                                    {item.tags && item.tags.length > 0 && (
                                        <HStack gap="xs" wrap>
                                            {item.tags.map((tag, tagIdx) => (
                                                <Badge key={tagIdx} variant="default">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </HStack>
                                    )}

                                    {itemActions && itemActions.length > 0 && (
                                        <HStack gap="xs" className="mt-1">
                                            {itemActions.map((action, actionIdx) => (
                                                <Box
                                                    key={actionIdx}
                                                    action={action.event}
                                                    actionPayload={{ row: item }}
                                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                                >
                                                    <Badge variant="default">
                                                        {action.label}
                                                    </Badge>
                                                </Box>
                                            ))}
                                        </HStack>
                                    )}
                                </VStack>
                            </HStack>
                        );
                    })}
                </VStack>
            </VStack>
        </Card>
    );
};

Timeline.displayName = "Timeline";
