'use client';
/**
 * Toast Molecule Component
 *
 * A toast notification component with auto-dismiss and action buttons.
 * Uses theme-aware CSS variables for styling.
 */

import React, { useEffect } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Icon } from "../atoms/Icon";
import { Typography } from "../atoms/Typography";
import { Button } from "../atoms/Button";
import { Badge } from "../atoms/Badge";
import { cn } from "../../lib/cn";
import { useEventBus } from "../../hooks/useEventBus";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastProps {
  /** Toast variant */
  variant?: ToastVariant;
  /** Toast message */
  message: string;
  /** Toast title (optional) */
  title?: string;
  /** Auto-dismiss duration in milliseconds (0 = no auto-dismiss) */
  duration?: number;
  /** Show dismiss button */
  dismissible?: boolean;
  /** Callback when toast is dismissed */
  onDismiss?: () => void;
  /** Action button label */
  actionLabel?: string;
  /** Action button click handler */
  onAction?: () => void;
  /** Badge count (optional) */
  badge?: string | number;
  /** Additional CSS classes */
  className?: string;
  /** Declarative dismiss event — emits UI:{dismissEvent} via eventBus when toast is dismissed */
  dismissEvent?: string;
  /** Declarative action event — emits UI:{actionEvent} via eventBus when action button is clicked */
  actionEvent?: string;
}

// Theme-aware variant styles
const variantClasses: Record<ToastVariant, string> = {
  success:
    "bg-[var(--color-card)] border-[length:var(--border-width)] border-[var(--color-success)]",
  error:
    "bg-[var(--color-card)] border-[length:var(--border-width)] border-[var(--color-error)]",
  info: "bg-[var(--color-card)] border-[length:var(--border-width)] border-[var(--color-info)]",
  warning:
    "bg-[var(--color-card)] border-[length:var(--border-width)] border-[var(--color-warning)]",
};

const iconMap: Record<ToastVariant, typeof Info> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const iconColors: Record<ToastVariant, string> = {
  success: "text-[var(--color-success)]",
  error: "text-[var(--color-error)]",
  info: "text-[var(--color-info)]",
  warning: "text-[var(--color-warning)]",
};

export const Toast: React.FC<ToastProps> = ({
  variant = "info",
  message,
  title,
  duration = 5000,
  dismissible = true,
  onDismiss,
  actionLabel,
  onAction,
  badge,
  className,
  dismissEvent,
  actionEvent,
}) => {
  const eventBus = useEventBus();

  const handleDismiss = () => {
    if (dismissEvent) eventBus.emit(`UI:${dismissEvent}`, {});
    onDismiss?.();
  };

  const handleAction = () => {
    if (actionEvent) eventBus.emit(`UI:${actionEvent}`, {});
    onAction?.();
  };
  useEffect(() => {
    if (duration <= 0 || (!onDismiss && !dismissEvent)) {
      return;
    }

    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss, dismissEvent]); // handleDismiss is stable across renders

  return (
    <div
      className={cn(
        "border-l-4 p-4 shadow-[var(--shadow-main)] min-w-[300px] max-w-md",
        "rounded-[var(--radius-sm)]",
        variantClasses[variant],
        className,
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Icon
            icon={iconMap[variant]}
            size="md"
            className={iconColors[variant]}
          />
        </div>

        <div className="flex-1 min-w-0">
          {title && (
            <Typography variant="h6" className="mb-1">
              {title}
            </Typography>
          )}
          <Typography variant="small" className="text-sm">
            {message}
          </Typography>

          {actionLabel && (onAction || actionEvent) && (
            <div className="mt-3">
              <Button variant="ghost" size="sm" onClick={handleAction}>
                {actionLabel}
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 flex-shrink-0">
          {badge !== undefined && (
            <Badge variant="default" size="sm">
              {badge}
            </Badge>
          )}
          {dismissible && (
            <button
              type="button"
              onClick={handleDismiss}
              className={cn(
                "flex-shrink-0 p-1 transition-colors rounded-[var(--radius-sm)]",
                "hover:bg-[var(--color-muted)]",
                "focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2",
              )}
              aria-label="Dismiss toast"
            >
              <Icon icon={X} size="sm" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

Toast.displayName = "Toast";
