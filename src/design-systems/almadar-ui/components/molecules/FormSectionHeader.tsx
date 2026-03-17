/**
 * FormSectionHeader
 *
 * Header component for collapsible form sections.
 * Provides consistent styling and interaction for section headers.
 */

import React from "react";
import { cn } from "../../lib/cn";
import { Box } from "../atoms/Box";
import { HStack } from "../atoms/Stack";
import { Typography } from "../atoms/Typography";
import { Badge } from "../atoms/Badge";
import { Icon } from "../atoms/Icon";

export interface FormSectionHeaderProps {
  /** Section title */
  title: string;
  /** Section subtitle */
  subtitle?: string;
  /** Whether section is collapsed */
  isCollapsed?: boolean;
  /** Toggle collapse handler (makes header clickable) */
  onToggle?: () => void;
  /** Badge text (e.g., "3 fields", "Required", "Complete") */
  badge?: string;
  /** Badge variant */
  badgeVariant?: "default" | "primary" | "success" | "warning" | "danger";
  /** Icon name to show before title */
  icon?: string;
  /** Whether section has validation errors */
  hasErrors?: boolean;
  /** Whether section is complete */
  isComplete?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const FormSectionHeader: React.FC<FormSectionHeaderProps> = ({
  title,
  subtitle,
  isCollapsed = false,
  onToggle,
  badge,
  badgeVariant = "default",
  icon,
  hasErrors = false,
  isComplete = false,
  className,
}) => {
  const isClickable = !!onToggle;

  // Determine effective badge variant based on state
  const effectiveBadgeVariant = hasErrors
    ? "danger"
    : isComplete
      ? "success"
      : badgeVariant;

  // Determine status icon
  const statusIcon = hasErrors
    ? "alert-circle"
    : isComplete
      ? "check-circle"
      : null;

  return (
    <Box
      className={cn(
        "px-4 py-3 bg-[var(--color-muted)] rounded-t-lg",
        isClickable &&
          "cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors",
        className,
      )}
      onClick={isClickable ? onToggle : undefined}
    >
      <HStack justify="between" align="center">
        <HStack gap="sm" align="center">
          {/* Custom icon */}
          {icon && (
            <Icon
              name={icon}
              size="md"
              className="text-[var(--color-muted-foreground)]"
            />
          )}

          {/* Status icon */}
          {statusIcon && (
            <Icon
              name={statusIcon}
              size="md"
              className={
                hasErrors
                  ? "text-[var(--color-error)]"
                  : "text-[var(--color-success)]"
              }
            />
          )}

          {/* Title and subtitle */}
          <Box>
            <Typography variant="label" weight="semibold">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="muted">
                {subtitle}
              </Typography>
            )}
          </Box>
        </HStack>

        <HStack gap="sm" align="center">
          {/* Badge */}
          {badge && (
            <Badge variant={effectiveBadgeVariant} size="sm">
              {badge}
            </Badge>
          )}

          {/* Collapse indicator */}
          {isClickable && (
            <Icon
              name="chevron-down"
              size="md"
              className={cn(
                "text-[var(--color-muted-foreground)] transition-transform",
                isCollapsed && "-rotate-90",
              )}
            />
          )}
        </HStack>
      </HStack>
    </Box>
  );
};

FormSectionHeader.displayName = "FormSectionHeader";
