'use client';
/**
 * Meter Organism Component
 *
 * A gauge/meter component for displaying a value within a range.
 * Supports linear, radial, and segmented display modes.
 *
 * Orbital Component Interface Compliance:
 * - Entity binding with auto-fetch when entity is a string
 * - Event emission via useEventBus (UI:* events)
 * - isLoading and error state props
 * - className for external styling
 */

import React, { useMemo, useCallback } from "react";
import { cn } from "../../lib/cn";
import { Card, Typography, Badge, Box } from "../atoms";
import { VStack, HStack } from "../atoms/Stack";
import { LoadingState } from "../molecules/LoadingState";
import { ErrorState } from "../molecules/ErrorState";
import { useEventBus } from "../../hooks/useEventBus";

export type MeterVariant = "linear" | "radial" | "segmented";

export interface MeterThreshold {
    value: number;
    color: string;
    label?: string;
}

export interface MeterAction {
    label: string;
    event?: string;
    navigatesTo?: string;
    variant?: "primary" | "secondary" | "ghost";
}

export interface MeterProps {
    /** Current value */
    value: number;
    /** Minimum value */
    min?: number;
    /** Maximum value */
    max?: number;
    /** Display label */
    label?: string;
    /** Unit suffix (e.g., '%', 'MB', 'credits') */
    unit?: string;
    /** Display variant */
    variant?: MeterVariant;
    /** Color thresholds */
    thresholds?: readonly MeterThreshold[];
    /** Number of segments (for segmented variant) */
    segments?: number;
    /** Show value text */
    showValue?: boolean;
    /** Size (for radial variant) */
    size?: "sm" | "md" | "lg";
    /** Actions */
    actions?: readonly MeterAction[];
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Additional CSS classes */
    className?: string;
}

/** Default thresholds using CSS variables */
const DEFAULT_THRESHOLDS: MeterThreshold[] = [
    { value: 30, color: "var(--color-error)" },
    { value: 70, color: "var(--color-warning)" },
    { value: 100, color: "var(--color-success)" },
];

function getColorForValue(
    value: number,
    max: number,
    thresholds: readonly MeterThreshold[],
): string {
    const percentage = (value / max) * 100;
    for (const threshold of thresholds) {
        if (percentage <= threshold.value) {
            return threshold.color;
        }
    }
    return thresholds[thresholds.length - 1]?.color ?? "var(--color-primary)";
}

const radialSizes = {
    sm: { size: 80, stroke: 6, fontSize: "12px" },
    md: { size: 120, stroke: 8, fontSize: "16px" },
    lg: { size: 160, stroke: 10, fontSize: "20px" },
};

export const Meter: React.FC<MeterProps> = ({
    value,
    min = 0,
    max = 100,
    label,
    unit,
    variant = "linear",
    thresholds = DEFAULT_THRESHOLDS,
    segments = 5,
    showValue = true,
    size = "md",
    actions,
    entity,
    isLoading = false,
    error,
    className,
}) => {
    const eventBus = useEventBus();

    const handleAction = useCallback(
        (action: MeterAction) => {
            if (action.event) {
                eventBus.emit(`UI:${action.event}`, { value });
            }
        },
        [eventBus, value],
    );

    const percentage = useMemo(() => {
        const range = max - min;
        if (range <= 0) return 0;
        return Math.min(Math.max(((value - min) / range) * 100, 0), 100);
    }, [value, min, max]);

    const activeColor = useMemo(
        () => getColorForValue(value, max, thresholds),
        [value, max, thresholds],
    );

    const displayValue = useMemo(() => {
        const formatted = Number.isInteger(value) ? value : value.toFixed(1);
        return unit ? `${formatted}${unit}` : `${formatted}`;
    }, [value, unit]);

    if (isLoading) {
        return <LoadingState message="Loading meter..." className={className} />;
    }

    if (error) {
        return (
            <ErrorState
                title="Meter error"
                message={error.message}
                className={className}
            />
        );
    }

    if (variant === "radial") {
        const dims = radialSizes[size];
        const radius = (dims.size - dims.stroke * 2) / 2;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        const center = dims.size / 2;

        return (
            <Card className={cn("p-4", className)}>
                <VStack gap="sm" align="center">
                    {label && (
                        <Typography variant="small" color="secondary" weight="medium">
                            {label}
                        </Typography>
                    )}
                    <Box className="relative inline-flex items-center justify-center">
                        <svg
                            width={dims.size}
                            height={dims.size}
                            viewBox={`0 0 ${dims.size} ${dims.size}`}
                            className="transform -rotate-90"
                        >
                            <circle
                                cx={center}
                                cy={center}
                                r={radius}
                                fill="none"
                                stroke="var(--color-muted)"
                                strokeWidth={dims.stroke}
                            />
                            <circle
                                cx={center}
                                cy={center}
                                r={radius}
                                fill="none"
                                stroke={activeColor}
                                strokeWidth={dims.stroke}
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                                className="transition-all duration-500 ease-out"
                            />
                        </svg>
                        {showValue && (
                            <Box className="absolute inset-0 flex items-center justify-center">
                                <Typography
                                    variant="h5"
                                    weight="bold"
                                    className="tabular-nums"
                                    style={{ fontSize: dims.fontSize }}
                                >
                                    {displayValue}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    {actions && actions.length > 0 && (
                        <HStack gap="xs">
                            {actions.map((action, idx) => (
                                <Badge
                                    key={idx}
                                    variant="default"
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => handleAction(action)}
                                >
                                    {action.label}
                                </Badge>
                            ))}
                        </HStack>
                    )}
                </VStack>
            </Card>
        );
    }

    if (variant === "segmented") {
        const segmentWidth = 100 / segments;
        const activeSegments = Math.round((percentage / 100) * segments);

        return (
            <Card className={cn("p-4", className)}>
                <VStack gap="sm">
                    {(label || showValue) && (
                        <HStack justify="between" align="center">
                            {label && (
                                <Typography variant="small" color="secondary" weight="medium">
                                    {label}
                                </Typography>
                            )}
                            {showValue && (
                                <Typography variant="small" weight="bold" className="tabular-nums">
                                    {displayValue}
                                </Typography>
                            )}
                        </HStack>
                    )}
                    <HStack gap="xs" className="w-full">
                        {Array.from({ length: segments }).map((_, idx) => {
                            const isActive = idx < activeSegments;
                            const segColor = isActive
                                ? getColorForValue(((idx + 1) / segments) * max, max, thresholds)
                                : undefined;
                            return (
                                <Box
                                    key={idx}
                                    className={cn(
                                        "h-2 flex-1 rounded-[var(--radius-sm)] transition-all duration-300",
                                        !isActive && "bg-[var(--color-muted)]",
                                    )}
                                    style={isActive ? { backgroundColor: segColor } : undefined}
                                />
                            );
                        })}
                    </HStack>
                    {/* Threshold labels */}
                    {thresholds.some((t) => t.label) && (
                        <HStack justify="between" className="w-full">
                            {thresholds.map((t, idx) => (
                                <Typography key={idx} variant="caption" color="secondary">
                                    {t.label || ""}
                                </Typography>
                            ))}
                        </HStack>
                    )}
                </VStack>
            </Card>
        );
    }

    // Default: linear
    return (
        <Card className={cn("p-4", className)}>
            <VStack gap="sm">
                {(label || showValue) && (
                    <HStack justify="between" align="center">
                        {label && (
                            <Typography variant="small" color="secondary" weight="medium">
                                {label}
                            </Typography>
                        )}
                        {showValue && (
                            <Typography variant="small" weight="bold" className="tabular-nums">
                                {displayValue}
                            </Typography>
                        )}
                    </HStack>
                )}
                <Box className="w-full h-3 bg-[var(--color-muted)] rounded-[var(--radius-full)] overflow-hidden">
                    <Box
                        className="h-full rounded-[var(--radius-full)] transition-all duration-500 ease-out"
                        style={{
                            width: `${percentage}%`,
                            backgroundColor: activeColor,
                        }}
                    />
                </Box>
                {/* Min/Max labels */}
                <HStack justify="between" className="w-full">
                    <Typography variant="caption" color="secondary">
                        {min}
                        {unit ? ` ${unit}` : ""}
                    </Typography>
                    <Typography variant="caption" color="secondary">
                        {max}
                        {unit ? ` ${unit}` : ""}
                    </Typography>
                </HStack>
                {actions && actions.length > 0 && (
                    <HStack gap="xs">
                        {actions.map((action, idx) => (
                            <Badge
                                key={idx}
                                variant="default"
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => handleAction(action)}
                            >
                                {action.label}
                            </Badge>
                        ))}
                    </HStack>
                )}
            </VStack>
        </Card>
    );
};

Meter.displayName = "Meter";
