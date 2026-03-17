/**
 * ProgressBar Atom Component
 *
 * A progress bar component with linear, circular, and stepped variants.
 */

import React from "react";
import { cn } from "../../lib/cn";

export type ProgressBarType = "linear" | "circular" | "stepped";
export type ProgressBarVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger";
export type ProgressBarColor = ProgressBarVariant; // Alias

export interface ProgressBarProps {
  /**
   * Progress value (0-100)
   */
  value: number;

  /**
   * Maximum value (for calculating percentage)
   * @default 100
   */
  max?: number;

  /**
   * Type of the progress bar (linear, circular, stepped)
   * @default 'linear'
   */
  progressType?: ProgressBarType;

  /**
   * Variant/color of the progress bar
   * @default 'primary'
   */
  variant?: ProgressBarVariant;

  /**
   * Color variant (alias for variant)
   * @default 'primary'
   */
  color?: ProgressBarColor;

  /**
   * Show percentage text
   * @default false
   */
  showPercentage?: boolean;

  /**
   * Alias for showPercentage (pattern compatibility)
   */
  showLabel?: boolean;

  /**
   * Label text
   */
  label?: string;

  /**
   * Size (for circular variant)
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";

  /**
   * Number of steps (for stepped variant)
   * @default 5
   */
  steps?: number;

  /**
   * Additional CSS classes
   */
  className?: string;
}

const colorClasses: Record<ProgressBarVariant, string> = {
  default: "bg-[var(--color-primary)]",
  primary: "bg-[var(--color-primary)]",
  success: "bg-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]",
  danger: "bg-[var(--color-error)]",
};

const circularSizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  progressType = "linear",
  variant = "primary",
  color,
  showPercentage = false,
  showLabel = false,
  label,
  size = "md",
  steps = 5,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  // Use color if provided, else variant
  const effectiveColor = color ?? variant;
  // Use showLabel as alias for showPercentage
  const effectiveShowPercentage = showPercentage || showLabel;

  if (progressType === "linear") {
    return (
      <div className={cn("w-full", className)}>
        {label && (
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-bold text-[var(--color-foreground)]">
              {label}
            </span>
            {effectiveShowPercentage && (
              <span className="text-sm text-[var(--color-foreground)] font-medium">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        <div className="w-full h-2 bg-[var(--color-muted)] border border-[var(--color-border)] overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300 ease-out",
              colorClasses[effectiveColor],
            )}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-label={label || `Progress: ${Math.round(percentage)}%`}
          />
        </div>
      </div>
    );
  }

  if (progressType === "circular") {
    const radius = size === "sm" ? 28 : size === "md" ? 40 : 56;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div
        className={cn(
          "relative inline-flex items-center justify-center",
          className,
        )}
      >
        <svg
          className={cn("transform -rotate-90", circularSizeClasses[size])}
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-[var(--color-muted)]"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn(
              "transition-all duration-300 ease-out",
              colorClasses[effectiveColor],
            )}
          />
        </svg>
        {effectiveShowPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-[var(--color-foreground)]">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
    );
  }

  if (progressType === "stepped") {
    const stepValue = max / steps;
    const activeSteps = Math.floor(value / stepValue);
    const partialStep = (value % stepValue) / stepValue;

    return (
      <div className={cn("w-full", className)}>
        {label && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[var(--color-foreground)]">
              {label}
            </span>
            {effectiveShowPercentage && (
              <span className="text-sm text-[var(--color-muted-foreground)]">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        <div className="flex gap-1">
          {Array.from({ length: steps }).map((_, index) => {
            const isActive = index < activeSteps;
            const isPartial = index === activeSteps && partialStep > 0;

            return (
              <div
                key={index}
                className="flex-1 h-2 bg-[var(--color-muted)] border border-[var(--color-border)] overflow-hidden"
              >
                <div
                  className={cn(
                    "h-full transition-all duration-300 ease-out",
                    (isActive || isPartial) && colorClasses[effectiveColor],
                  )}
                  style={{
                    width: isPartial
                      ? `${partialStep * 100}%`
                      : isActive
                        ? "100%"
                        : "0%",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};

ProgressBar.displayName = "ProgressBar";
