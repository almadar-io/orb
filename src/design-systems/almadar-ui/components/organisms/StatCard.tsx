'use client';
import React from "react";
import { cn } from "../../lib/cn";
import { Card, Typography } from "../atoms";
import { Box } from "../atoms/Box";
import { HStack, VStack } from "../atoms/Stack";
import { Button } from "../atoms/Button";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import { useEventBus } from "../../hooks/useEventBus";
import { useTranslate } from "../../hooks/useTranslate";
import type { EntityDisplayProps } from "./types";

/**
 * Schema metric definition
 * Supports both computed metrics (with field) and static metrics (with value)
 */
export interface MetricDefinition {
  /** Field name for computed metrics (optional if value is provided) */
  field?: string;
  /** Display label */
  label: string;
  /** Static value for display (alternative to field-based computation) */
  value?: string | number;
  /** Icon name for display */
  icon?: string;
  /** Value format (e.g., 'currency', 'percent', 'number') */
  format?: "currency" | "percent" | "number" | string;
}

export interface StatCardProps extends EntityDisplayProps {
  /** Main label */
  label?: string;
  /** Title (alias for label) */
  title?: string;
  /** Primary value - accepts array/unknown from generated code (will use first element or length) */
  value?: string | number | (string | number | undefined)[] | unknown;
  /** Previous value for comparison */
  previousValue?: number;
  /** Current value as number for trend calculation */
  currentValue?: number;
  /** Manual trend percentage (overrides calculation) */
  trend?: number;
  /** Trend direction (overrides calculation) */
  trendDirection?: "up" | "down" | "neutral";
  /** Whether up is good (green) or bad (red) */
  invertTrend?: boolean;
  /** Icon to display */
  icon?: LucideIcon;
  /** Icon background color */
  iconBg?: string;
  /** Icon color */
  iconColor?: string;
  /** Subtitle or description */
  subtitle?: string;
  /** Action button */
  action?: {
    label: string;
    /** Event to dispatch via event bus (for trait state machine integration) */
    event?: string;
    /** Navigation URL - supports template interpolation */
    navigatesTo?: string;
    /** Legacy onClick callback */
    onClick?: () => void;
  };
  /** Metrics to display (schema format) - accepts readonly for compatibility with generated const arrays */
  metrics?: readonly MetricDefinition[];
}

export const StatCard: React.FC<StatCardProps> = ({
  label: propLabel,
  title: propTitle,
  value: propValue,
  previousValue,
  currentValue,
  trend: manualTrend,
  trendDirection: manualDirection,
  invertTrend = false,
  icon: Icon,
  iconBg = "bg-[var(--color-muted)]",
  iconColor = "text-[var(--color-foreground)]",
  subtitle,
  action,
  className,
  // Schema-based props
  entity,
  metrics,
  isLoading: externalLoading,
  error: externalError,
}) => {
  // Use title as fallback for label
  const labelToUse = propLabel ?? propTitle;
  const eventBus = useEventBus();
  const { t } = useTranslate();

  // Handle action click with event bus integration
  const handleActionClick = React.useCallback(() => {
    if (action?.event) {
      eventBus.emit(`UI:${action.event}`, {});
    }
    if (action?.onClick) {
      action.onClick();
    }
  }, [action, eventBus]);

  // Normalize entity data to array
  const data = (Array.isArray(entity) ? entity : entity ? [entity] : []) as readonly Record<
    string,
    unknown
  >[];

  // Determine loading and error state
  const isLoading = externalLoading ?? false;
  const error = externalError;

  // Helper to compute a single metric value
  const computeMetricValue = React.useCallback(
    (metric: MetricDefinition, items: readonly Record<string, unknown>[]) => {
      // If static value is provided, use it directly
      if (metric.value !== undefined) {
        return metric.value;
      }

      const field = metric.field;

      // If no field specified, return 0
      if (!field) {
        return 0;
      }

      if (field === "count") {
        return items.length;
      }

      // Handle explicit field:value format (e.g., "status:active")
      if (field.includes(":")) {
        const [fieldName, fieldValue] = field.split(":");
        return items.filter((item) => item[fieldName] === fieldValue).length;
      }

      // Check if field exists on any item
      const fieldExistsOnItems = items.some((item) => field in item);

      if (fieldExistsOnItems) {
        // Sum numeric field
        return items.reduce((acc, item) => {
          const val = item[field];
          return acc + (typeof val === "number" ? val : 0);
        }, 0);
      }

      // Auto-detect: field name might be a status value
      // Check common status field names: status, state, phase
      const statusFields = ["status", "state", "phase"];
      for (const statusField of statusFields) {
        const hasStatusField = items.some((item) => statusField in item);
        if (hasStatusField) {
          // Count items where statusField === field (the metric field is actually a value)
          const count = items.filter(
            (item) => item[statusField] === field,
          ).length;
          if (count > 0 || items.length === 0) {
            return count;
          }
        }
      }

      // Fallback: return 0
      return 0;
    },
    [],
  );

  // Schema-driven: calculate stats from data and metrics (supports multiple metrics)
  const schemaStats = React.useMemo(() => {
    if (!metrics || metrics.length === 0) return null;

    // Compute all metrics
    return metrics.map((metric) => ({
      label: metric.label,
      value: computeMetricValue(metric, data),
      format: metric.format,
    }));
  }, [metrics, data, computeMetricValue]);

  // Calculate trend (must be before early returns per Rules of Hooks)
  const calculatedTrend = React.useMemo(() => {
    if (manualTrend !== undefined) return manualTrend;
    if (previousValue === undefined || currentValue === undefined)
      return undefined;
    if (previousValue === 0) return currentValue > 0 ? 100 : 0;
    return ((currentValue - previousValue) / previousValue) * 100;
  }, [manualTrend, previousValue, currentValue]);

  // If multiple metrics, render them as a row of stats
  if (schemaStats && schemaStats.length > 1) {
    if (isLoading) {
      return (
        <Box
          className={cn("grid gap-4", className)}
          style={{ gridTemplateColumns: `repeat(${schemaStats.length}, 1fr)` }}
        >
          {schemaStats.map((_, idx) => (
            <Card key={idx} className="p-4">
              <VStack gap="xs" className="animate-pulse">
                <Box className="h-3 bg-[var(--color-muted)] rounded w-16" />
                <Box className="h-6 bg-[var(--color-muted)] rounded w-12" />
              </VStack>
            </Card>
          ))}
        </Box>
      );
    }

    return (
      <Box
        className={cn("grid gap-4", className)}
        style={{ gridTemplateColumns: `repeat(${schemaStats.length}, 1fr)` }}
      >
        {schemaStats.map((stat, idx) => (
          <Card key={idx} className="p-4">
            <Typography variant="overline" color="secondary">
              {stat.label}
            </Typography>
            <Typography variant="h4" className="text-xl">
              {stat.value}
            </Typography>
          </Card>
        ))}
      </Box>
    );
  }

  // Use schema stats if available (single metric), otherwise use props
  const label = schemaStats?.[0]?.label || labelToUse || "Stat";
  // Handle array values (use first element or array length)
  const normalizedPropValue = Array.isArray(propValue)
    ? (propValue[0] ?? propValue.length)
    : propValue;
  const value = schemaStats?.[0]?.value ?? normalizedPropValue ?? 0;

  const trendDirection =
    manualDirection ||
    (calculatedTrend === undefined || calculatedTrend === 0
      ? "neutral"
      : calculatedTrend > 0
        ? "up"
        : "down");

  const isPositive = invertTrend
    ? trendDirection === "down"
    : trendDirection === "up";

  const TrendIcon =
    trendDirection === "up"
      ? TrendingUp
      : trendDirection === "down"
        ? TrendingDown
        : Minus;

  // Show error state
  if (error) {
    return (
      <Card className={cn("p-6", className)}>
        <VStack gap="none" className="space-y-1">
          <Typography variant="overline" color="secondary">
            {label}
          </Typography>
          <Typography variant="small" color="error">
            {t('error.generic') + ": " + error.message}
          </Typography>
        </VStack>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={cn("p-6", className)}>
        <VStack gap="sm" className="animate-pulse">
          <Box className="h-4 bg-[var(--color-muted)] rounded w-24" />
          <Box className="h-8 bg-[var(--color-muted)] rounded w-32" />
          <Box className="h-4 bg-[var(--color-muted)] rounded w-20" />
        </VStack>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6", className)}>
      <HStack align="start" justify="between">
        <VStack gap="none" className="space-y-1">
          <Typography variant="overline" color="secondary">
            {label}
          </Typography>
          <Typography variant="h4" className="text-2xl">
            {value}
          </Typography>

          {/* Trend indicator */}
          {calculatedTrend !== undefined && (
            <HStack align="center" gap="xs">
              <HStack
                align="center"
                gap="none"
                className={cn(
                  "gap-0.5 text-sm font-bold",
                  isPositive
                    ? "text-[var(--color-success)]"
                    : trendDirection === "neutral"
                      ? "text-[var(--color-muted-foreground)]"
                      : "text-[var(--color-error)]",
                )}
              >
                <TrendIcon className="h-4 w-4" />
                <Typography variant="caption" as="span">{Math.abs(calculatedTrend).toFixed(1)}%</Typography>
              </HStack>
              <Typography variant="small" color="secondary" as="span">
                vs last period
              </Typography>
            </HStack>
          )}

          {subtitle && !calculatedTrend && (
            <Typography variant="small" color="secondary">
              {subtitle}
            </Typography>
          )}
        </VStack>

        {Icon && (
          <Box className={cn("p-3", iconBg)}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </Box>
        )}
      </HStack>

      {action && (
        <Button
          variant="ghost"
          onClick={handleActionClick}
          className="mt-4 text-sm font-bold text-[var(--color-foreground)] hover:underline"
        >
          {action.label} →
        </Button>
      )}
    </Card>
  );
};

StatCard.displayName = "StatCard";
