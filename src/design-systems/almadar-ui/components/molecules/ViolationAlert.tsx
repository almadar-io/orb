/**
 * ViolationAlert
 *
 * Displays inspection violations with law references and action types.
 * Used in inspection forms to show detected compliance violations.
 *
 * Action Types:
 * - measure: Corrective measure required (warning)
 * - admin: Administrative action (error)
 * - penalty: Penalty proceedings (error, severe)
 */

import React from "react";
import { cn } from "../../lib/cn";
import { Box } from "../atoms/Box";
import { VStack, HStack } from "../atoms/Stack";
import { Typography } from "../atoms/Typography";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";

export interface ViolationRecord {
  /** Unique violation identifier */
  id: string;
  /** Law reference (e.g., "ZVPOT-1") */
  law: string;
  /** Article reference (e.g., "14/1") */
  article: string;
  /** Violation message */
  message: string;
  /** Action type determines severity */
  actionType: "measure" | "admin" | "penalty";
  /** Administrative action reference (e.g., "ZVPOT-1 234/1-4") */
  adminAction?: string;
  /** Penalty action reference (e.g., "ZVPOT-1 240/1-9") */
  penaltyAction?: string;
  /** Field that triggered this violation */
  fieldId?: string;
  /** Tab/form where violation occurred */
  tabId?: string;
}

export interface ViolationAlertProps {
  /** Violation data */
  violation: ViolationRecord;
  /** Visual severity (derived from actionType if not specified) */
  severity?: "warning" | "error";
  /** Dismissible alert */
  dismissible?: boolean;
  /** Dismiss handler */
  onDismiss?: () => void;
  /** Navigate to the field that caused violation */
  onNavigateToField?: (fieldId: string) => void;
  /** Compact display mode */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const actionTypeLabels: Record<string, string> = {
  measure: "Corrective Measure",
  admin: "Administrative Action",
  penalty: "Penalty Proceedings",
};

const actionTypeIcons: Record<string, string> = {
  measure: "alert-triangle",
  admin: "alert-circle",
  penalty: "shield-alert",
};

export const ViolationAlert: React.FC<ViolationAlertProps> = ({
  violation,
  severity,
  dismissible = false,
  onDismiss,
  onNavigateToField,
  compact = false,
  className,
}) => {
  // Derive severity from actionType if not explicitly set
  const effectiveSeverity =
    severity ?? (violation.actionType === "measure" ? "warning" : "error");

  const bgColor =
    effectiveSeverity === "warning"
      ? "bg-[var(--color-warning)]/10 border-[var(--color-warning)]/30"
      : "bg-[var(--color-error)]/10 border-[var(--color-error)]/30";

  const textColor =
    effectiveSeverity === "warning"
      ? "text-[var(--color-warning)]"
      : "text-[var(--color-error)]";

  const iconColor =
    effectiveSeverity === "warning"
      ? "text-[var(--color-warning)]"
      : "text-[var(--color-error)]";

  if (compact) {
    return (
      <Box
        className={cn(
          "px-3 py-2 rounded-[var(--radius-md)] border",
          bgColor,
          className,
        )}
      >
        <HStack gap="sm" align="center" justify="between">
          <HStack gap="sm" align="center">
            <Icon
              name={actionTypeIcons[violation.actionType]}
              size="sm"
              className={iconColor}
            />
            <Typography
              variant="caption"
              className={textColor}
              weight="semibold"
            >
              {violation.law} Art. {violation.article}
            </Typography>
            <Typography variant="caption" className={textColor}>
              {violation.message}
            </Typography>
          </HStack>
          {dismissible && onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="p-1"
            >
              <Icon name="x" size="sm" className={iconColor} />
            </Button>
          )}
        </HStack>
      </Box>
    );
  }

  return (
    <Box
      className={cn(
        "p-4 rounded-[var(--radius-lg)] border",
        bgColor,
        className,
      )}
    >
      <VStack gap="sm">
        {/* Header */}
        <HStack justify="between" align="start">
          <HStack gap="sm" align="center">
            <Icon
              name={actionTypeIcons[violation.actionType]}
              size="md"
              className={iconColor}
            />
            <VStack gap="xs">
              <Typography variant="label" weight="bold" className={textColor}>
                {violation.law} Art. {violation.article}
              </Typography>
              <Typography
                variant="caption"
                className={cn(textColor, "opacity-75")}
              >
                {actionTypeLabels[violation.actionType]}
              </Typography>
            </VStack>
          </HStack>
          {dismissible && onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="p-1"
            >
              <Icon name="x" size="sm" className={iconColor} />
            </Button>
          )}
        </HStack>

        {/* Message */}
        <Typography variant="body2" className={textColor}>
          {violation.message}
        </Typography>

        {/* Action references */}
        {(violation.adminAction || violation.penaltyAction) && (
          <Box
            className={cn(
              "pt-2 border-t",
              effectiveSeverity === "warning"
                ? "border-[var(--color-warning)]/30"
                : "border-[var(--color-error)]/30",
            )}
          >
            <VStack gap="xs">
              {violation.adminAction && (
                <HStack gap="xs" align="center">
                  <Typography
                    variant="caption"
                    className={cn(textColor, "opacity-75")}
                  >
                    Admin:
                  </Typography>
                  <Typography
                    variant="caption"
                    weight="semibold"
                    className={textColor}
                  >
                    {violation.adminAction}
                  </Typography>
                </HStack>
              )}
              {violation.penaltyAction && (
                <HStack gap="xs" align="center">
                  <Typography
                    variant="caption"
                    className={cn(textColor, "opacity-75")}
                  >
                    Penalty:
                  </Typography>
                  <Typography
                    variant="caption"
                    weight="semibold"
                    className={textColor}
                  >
                    {violation.penaltyAction}
                  </Typography>
                </HStack>
              )}
            </VStack>
          </Box>
        )}

        {/* Navigate to field button */}
        {violation.fieldId && onNavigateToField && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateToField(violation.fieldId!)}
            className={cn(textColor, "self-start")}
          >
            <Icon name="arrow-right" size="sm" className="mr-1" />
            Go to field
          </Button>
        )}
      </VStack>
    </Box>
  );
};

ViolationAlert.displayName = "ViolationAlert";
