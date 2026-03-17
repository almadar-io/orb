'use client';
import React from "react";
import { cn } from "../../lib/cn";
import { Button } from "../atoms";
import { Box } from "../atoms/Box";
import { VStack } from "../atoms/Stack";
import { Typography } from "../atoms/Typography";
import { useEventBus } from "../../hooks/useEventBus";
import { useTranslate } from "../../hooks/useTranslate";
import {
  LucideIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Search,
  Inbox,
  FileQuestion,
} from "lucide-react";

/**
 * Common icon name to Lucide component mapping.
 * Supports schema-style string icon names (e.g., "check-circle").
 */
const ICON_MAP: Record<string, LucideIcon> = {
  "check-circle": CheckCircle,
  check: CheckCircle,
  "x-circle": XCircle,
  error: XCircle,
  "alert-circle": AlertCircle,
  warning: AlertCircle,
  info: Info,
  search: Search,
  inbox: Inbox,
  "file-question": FileQuestion,
};

export interface EmptyStateProps {
  /**
   * Icon to display. Accepts either:
   * - A Lucide icon component (LucideIcon)
   * - A string icon name (e.g., "check-circle", "x-circle")
   */
  icon?: LucideIcon | string;
  /** Primary text to display - use title or message (message is alias for backwards compat) */
  title?: string;
  /** Alias for title - used by schema patterns */
  message?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  /** Destructive styling for confirmation dialogs */
  destructive?: boolean;
  /** Variant for color styling */
  variant?: "default" | "success" | "error" | "warning" | "info";
  /** Declarative action event — emits UI:{actionEvent} via eventBus when action button is clicked */
  actionEvent?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  description,
  actionLabel,
  onAction,
  className,
  destructive,
  variant,
  actionEvent,
}) => {
  const eventBus = useEventBus();
  const { t } = useTranslate();

  const handleAction = () => {
    if (actionEvent) eventBus.emit(`UI:${actionEvent}`, {});
    onAction?.();
  };
  // Resolve icon - supports both LucideIcon component and string name
  const Icon: LucideIcon | undefined =
    typeof icon === "string" ? ICON_MAP[icon] : icon;

  // Determine color scheme based on variant or destructive flag
  const isDestructive = destructive || variant === "error";
  const isSuccess = variant === "success";

  // Support both title and message (message is alias for title)
  const displayText = title || message || t('empty.noItems');
  return (
    <VStack
      align="center"
      className={cn(
        "justify-center py-12 text-center",
        className,
      )}
    >
      {Icon && (
        <Box
          className={cn(
            "mb-4 rounded-[var(--radius-full)] p-3",
            isDestructive
              ? "bg-[var(--color-error)]/10"
              : isSuccess
                ? "bg-[var(--color-success)]/10"
                : "bg-[var(--color-muted)]",
          )}
        >
          <Icon
            className={cn(
              "h-8 w-8",
              isDestructive
                ? "text-[var(--color-error)]"
                : isSuccess
                  ? "text-[var(--color-success)]"
                  : "text-[var(--color-muted-foreground)]",
            )}
          />
        </Box>
      )}
      <Typography
        variant="h3"
        className={cn(
          "text-lg font-medium",
          isDestructive
            ? "text-[var(--color-error)]"
            : isSuccess
              ? "text-[var(--color-success)]"
              : "text-[var(--color-foreground)]",
        )}
      >
        {displayText}
      </Typography>
      {description && (
        <Typography variant="small" className="mt-1 text-[var(--color-muted-foreground)] max-w-sm">
          {description}
        </Typography>
      )}
      {actionLabel && (onAction || actionEvent) && (
        <Button
          className="mt-4"
          variant={isDestructive ? "danger" : "primary"}
          onClick={handleAction}
        >
          {actionLabel}
        </Button>
      )}
    </VStack>
  );
};

EmptyState.displayName = "EmptyState";
