'use client';
/**
 * Alert Molecule Component
 *
 * A component for displaying alert messages with different variants and actions.
 * Uses theme-aware CSS variables for styling.
 */

import React from "react";
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "../../lib/cn";
import { Box } from "../atoms/Box";
import { Icon } from "../atoms/Icon";
import { Typography } from "../atoms/Typography";
import { useEventBus } from "../../hooks/useEventBus";

export type AlertVariant = "info" | "success" | "warning" | "error";

export interface AlertProps {
  /** Alert content (children or message) */
  children?: React.ReactNode;
  /** Alert message (alias for children) */
  message?: string;
  variant?: AlertVariant;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  onClose?: () => void;
  actions?: React.ReactNode;
  className?: string;
  /** Declarative dismiss event — emits UI:{dismissEvent} via eventBus when alert is dismissed */
  dismissEvent?: string;
}

const variantBorderClasses: Record<AlertVariant, string> = {
  info: "border-[var(--color-info)]",
  success: "border-[var(--color-success)]",
  warning: "border-[var(--color-warning)]",
  error: "border-[var(--color-error)]",
};

const variantIconColors: Record<AlertVariant, string> = {
  info: "text-[var(--color-info)]",
  success: "text-[var(--color-success)]",
  warning: "text-[var(--color-warning)]",
  error: "text-[var(--color-error)]",
};

const iconMap: Record<AlertVariant, typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

export const Alert: React.FC<AlertProps> = ({
  children,
  message,
  variant = "info",
  title,
  dismissible = false,
  onDismiss,
  onClose,
  actions,
  className,
  dismissEvent,
}) => {
  const eventBus = useEventBus();
  const handleDismissCallback = onDismiss || onClose;

  const handleDismiss = () => {
    if (dismissEvent) eventBus.emit(`UI:${dismissEvent}`, {});
    handleDismissCallback?.();
  };
  // Use message if provided, else children
  const content = children ?? message;

  return (
    <Box
      bg="surface"
      border
      shadow="sm"
      padding="md"
      rounded="sm"
      className={cn(variantBorderClasses[variant], className)}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <Icon
            icon={iconMap[variant]}
            size="md"
            className={variantIconColors[variant]}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <Typography variant="h6" className="mb-1">
              {title}
            </Typography>
          )}
          <Typography variant="body2">{content}</Typography>
          {actions && <div className="mt-3 flex gap-2">{actions}</div>}
        </div>

        {/* Dismiss Button */}
        {(dismissible || dismissEvent || handleDismissCallback) && (
          <button
            type="button"
            onClick={handleDismiss}
            className={cn(
              "flex-shrink-0 p-1 transition-colors rounded-[var(--radius-sm)]",
              "hover:bg-[var(--color-muted)]",
            )}
            aria-label="Dismiss alert"
          >
            <Icon icon={X} size="sm" />
          </button>
        )}
      </div>
    </Box>
  );
};

Alert.displayName = "Alert";
