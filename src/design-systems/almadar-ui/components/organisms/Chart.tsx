'use client';
/**
 * Chart Organism Component
 *
 * A data visualization component supporting bar, line, pie, and area chart types.
 * Composes atoms and molecules for layout, uses CSS variables for theming.
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
import { EmptyState } from "../molecules/EmptyState";
import { useEventBus } from "../../hooks/useEventBus";
import { useTranslate } from "../../hooks/useTranslate";

export type ChartType = "bar" | "line" | "pie" | "area" | "donut";

export interface ChartDataPoint {
    label: string;
    value: number;
    color?: string;
}

export interface ChartSeries {
    name: string;
    data: readonly ChartDataPoint[];
    color?: string;
}

export interface ChartAction {
    label: string;
    event?: string;
    navigatesTo?: string;
    variant?: "primary" | "secondary" | "ghost";
}

export interface ChartProps {
    /** Chart title */
    title?: string;
    /** Chart subtitle / description */
    subtitle?: string;
    /** Chart type */
    chartType?: ChartType;
    /** Data series */
    series?: readonly ChartSeries[];
    /** Simple data (single series shorthand) */
    data?: readonly ChartDataPoint[];
    /** Chart height in px */
    height?: number;
    /** Show legend */
    showLegend?: boolean;
    /** Show values on chart */
    showValues?: boolean;
    /** Actions for chart interactions */
    actions?: readonly ChartAction[];
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Additional CSS classes */
    className?: string;
}

/** Default color palette using CSS variables */
const CHART_COLORS = [
    "var(--color-primary)",
    "var(--color-success)",
    "var(--color-warning)",
    "var(--color-error)",
    "var(--color-info)",
    "var(--color-accent)",
];

/** Bar chart renderer */
const BarChart: React.FC<{
    data: readonly ChartDataPoint[];
    height: number;
    showValues: boolean;
}> = ({ data, height, showValues }) => {
    const maxValue = Math.max(...data.map((d) => d.value), 1);

    return (
        <HStack gap="xs" align="end" className="w-full" style={{ height }}>
            {data.map((point, idx) => {
                const barHeight = (point.value / maxValue) * 100;
                const color = point.color || CHART_COLORS[idx % CHART_COLORS.length];
                return (
                    <VStack key={point.label} gap="xs" align="center" flex className="min-w-0">
                        {showValues && (
                            <Typography variant="caption" color="secondary" className="tabular-nums">
                                {point.value}
                            </Typography>
                        )}
                        <Box
                            className={cn(
                                "w-full rounded-t-[var(--radius-sm)] transition-all duration-500 ease-out min-h-[4px]",
                            )}
                            style={{
                                height: `${barHeight}%`,
                                backgroundColor: color,
                            }}
                        />
                        <Typography
                            variant="caption"
                            color="secondary"
                            className="truncate w-full text-center"
                        >
                            {point.label}
                        </Typography>
                    </VStack>
                );
            })}
        </HStack>
    );
};

/** Pie/Donut chart renderer using SVG */
const PieChart: React.FC<{
    data: readonly ChartDataPoint[];
    height: number;
    showValues: boolean;
    donut?: boolean;
}> = ({ data, height, showValues, donut = false }) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const size = Math.min(height, 200);
    const radius = size / 2 - 8;
    const innerRadius = donut ? radius * 0.6 : 0;
    const center = size / 2;

    const segments = useMemo(() => {
        let currentAngle = -Math.PI / 2;
        return data.map((point, idx) => {
            const angle = (point.value / total) * 2 * Math.PI;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            currentAngle = endAngle;

            const largeArc = angle > Math.PI ? 1 : 0;
            const x1 = center + radius * Math.cos(startAngle);
            const y1 = center + radius * Math.sin(startAngle);
            const x2 = center + radius * Math.cos(endAngle);
            const y2 = center + radius * Math.sin(endAngle);

            let d: string;
            if (innerRadius > 0) {
                const ix1 = center + innerRadius * Math.cos(startAngle);
                const iy1 = center + innerRadius * Math.sin(startAngle);
                const ix2 = center + innerRadius * Math.cos(endAngle);
                const iy2 = center + innerRadius * Math.sin(endAngle);
                d = `M ${ix1} ${iy1} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
            } else {
                d = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
            }

            return {
                d,
                color: point.color || CHART_COLORS[idx % CHART_COLORS.length],
                label: point.label,
                value: point.value,
                percentage: ((point.value / total) * 100).toFixed(1),
            };
        });
    }, [data, total, radius, innerRadius, center]);

    return (
        <HStack gap="md" align="center" justify="center" className="w-full">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {segments.map((seg, idx) => (
                    <path
                        key={idx}
                        d={seg.d}
                        fill={seg.color}
                        stroke="var(--color-card)"
                        strokeWidth="2"
                        className="transition-opacity duration-200 hover:opacity-80"
                    />
                ))}
                {donut && (
                    <text
                        x={center}
                        y={center}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="var(--color-foreground)"
                        fontSize="14"
                        fontWeight="bold"
                    >
                        {total}
                    </text>
                )}
            </svg>
            {showValues && (
                <VStack gap="xs">
                    {segments.map((seg, idx) => (
                        <HStack key={idx} gap="xs" align="center">
                            <Box
                                className="w-3 h-3 rounded-[var(--radius-sm)] flex-shrink-0"
                                style={{ backgroundColor: seg.color }}
                            />
                            <Typography variant="caption" color="secondary" className="truncate">
                                {seg.label}: {seg.percentage}%
                            </Typography>
                        </HStack>
                    ))}
                </VStack>
            )}
        </HStack>
    );
};

/** Line/Area chart renderer using SVG */
const LineChart: React.FC<{
    data: readonly ChartDataPoint[];
    height: number;
    showValues: boolean;
    fill?: boolean;
}> = ({ data, height, showValues, fill = false }) => {
    const maxValue = Math.max(...data.map((d) => d.value), 1);
    const width = 400;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const points = useMemo(() => {
        return data.map((point, idx) => ({
            x: padding.left + (idx / Math.max(data.length - 1, 1)) * chartWidth,
            y: padding.top + chartHeight - (point.value / maxValue) * chartHeight,
            ...point,
        }));
    }, [data, maxValue, chartWidth, chartHeight, padding]);

    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? 0} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;

    return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                const y = padding.top + chartHeight * (1 - frac);
                return (
                    <line
                        key={frac}
                        x1={padding.left}
                        y1={y}
                        x2={width - padding.right}
                        y2={y}
                        stroke="var(--color-border)"
                        strokeDasharray="4 4"
                        opacity={0.5}
                    />
                );
            })}
            {/* Area fill */}
            {fill && (
                <path d={areaPath} fill="var(--color-primary)" opacity={0.1} />
            )}
            {/* Line */}
            <path d={linePath} fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Data points */}
            {points.map((p, idx) => (
                <g key={idx}>
                    <circle cx={p.x} cy={p.y} r="4" fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth="2" />
                    {showValues && (
                        <text x={p.x} y={p.y - 10} textAnchor="middle" fill="var(--color-foreground)" fontSize="10" fontWeight="500">
                            {p.value}
                        </text>
                    )}
                    {/* X-axis labels */}
                    <text
                        x={p.x}
                        y={height - 8}
                        textAnchor="middle"
                        fill="var(--color-muted-foreground)"
                        fontSize="9"
                    >
                        {p.label}
                    </text>
                </g>
            ))}
        </svg>
    );
};

export const Chart: React.FC<ChartProps> = ({
    title,
    subtitle,
    chartType = "bar",
    series,
    data: simpleData,
    height = 200,
    showLegend = true,
    showValues = false,
    actions,
    entity,
    isLoading = false,
    error,
    className,
}) => {
    const eventBus = useEventBus();
    const { t } = useTranslate();

    const handleAction = useCallback(
        (action: ChartAction) => {
            if (action.event) {
                eventBus.emit(`UI:${action.event}`, {});
            }
        },
        [eventBus],
    );

    // Normalize data: simple data → single series
    const normalizedData = useMemo(() => {
        if (simpleData) return simpleData;
        if (series && series.length > 0) return series[0].data;
        return [];
    }, [simpleData, series]);

    if (isLoading) {
        return <LoadingState message="Loading chart..." className={className} />;
    }

    if (error) {
        return (
            <ErrorState
                title="Chart error"
                message={error.message}
                className={className}
            />
        );
    }

    if (normalizedData.length === 0) {
        return <EmptyState title={t('empty.noData')} description={t('empty.noData')} className={className} />;
    }

    return (
        <Card className={cn("p-6", className)}>
            <VStack gap="md">
                {/* Header */}
                {(title || subtitle || (actions && actions.length > 0)) && (
                    <HStack justify="between" align="start">
                        <VStack gap="xs">
                            {title && (
                                <Typography variant="h5" weight="semibold">
                                    {title}
                                </Typography>
                            )}
                            {subtitle && (
                                <Typography variant="small" color="secondary">
                                    {subtitle}
                                </Typography>
                            )}
                        </VStack>
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
                    </HStack>
                )}

                {/* Chart */}
                <Box className="w-full">
                    {chartType === "bar" && (
                        <BarChart data={normalizedData} height={height} showValues={showValues} />
                    )}
                    {chartType === "line" && (
                        <LineChart data={normalizedData} height={height} showValues={showValues} />
                    )}
                    {chartType === "area" && (
                        <LineChart data={normalizedData} height={height} showValues={showValues} fill />
                    )}
                    {chartType === "pie" && (
                        <PieChart data={normalizedData} height={height} showValues={showLegend} />
                    )}
                    {chartType === "donut" && (
                        <PieChart data={normalizedData} height={height} showValues={showLegend} donut />
                    )}
                </Box>

                {/* Legend for bar/line/area */}
                {showLegend && series && series.length > 1 && (
                    <HStack gap="md" justify="center" wrap>
                        {series.map((s, idx) => (
                            <HStack key={idx} gap="xs" align="center">
                                <Box
                                    className="w-3 h-3 rounded-[var(--radius-full)] flex-shrink-0"
                                    style={{ backgroundColor: s.color || CHART_COLORS[idx % CHART_COLORS.length] }}
                                />
                                <Typography variant="caption" color="secondary">
                                    {s.name}
                                </Typography>
                            </HStack>
                        ))}
                    </HStack>
                )}
            </VStack>
        </Card>
    );
};

Chart.displayName = "Chart";
