'use client';
/**
 * ConfirmDialog Component
 *
 * Confirmation dialog for destructive or important actions.
 * Composes Modal molecule with Button atoms.
 *
 * Uses wireframe theme styling (high contrast, sharp edges).
 */
import React from "react";
import { AlertTriangle, Trash2, Check } from "lucide-react";
import { Modal, type ModalSize } from "../molecules/Modal";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";
import { Typography } from "../atoms/Typography";
import { Box } from "../atoms/Box";
import { HStack } from "../atoms/Stack";
import { cn } from "../../lib/cn";
import { useTranslate } from "../../hooks/useTranslate";

export type ConfirmDialogVariant = "danger" | "warning" | "info" | "default";

export interface ConfirmDialogProps {
  /** Whether the dialog is open (defaults to true when rendered by slot wrapper) */
  isOpen?: boolean;
  /** Callback when dialog is closed (injected by slot wrapper) */
  onClose?: () => void;
  /** Callback when action is confirmed (injected by slot wrapper) */
  onConfirm?: () => void;
  /** Dialog title */
  title: string;
  /** Dialog message/description */
  message?: string | React.ReactNode;
  /** Alias for message (schema compatibility) */
  description?: string | React.ReactNode;
  /** Confirm button text */
  confirmText?: string;
  /** Alias for confirmText (schema compatibility) */
  confirmLabel?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Alias for cancelText (schema compatibility) */
  cancelLabel?: string;
  /** Dialog variant */
  variant?: ConfirmDialogVariant;
  /** Dialog size */
  size?: ModalSize;
  /** Loading state for confirm button */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Additional CSS classes */
  className?: string;
}

const variantConfig = {
  danger: {
    icon: Trash2,
    iconBg: "bg-[var(--color-error)]",
    iconColor: "text-[var(--color-error-foreground)]",
    confirmVariant: "primary" as const,
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-[var(--color-warning)]",
    iconColor: "text-[var(--color-warning-foreground)]",
    confirmVariant: "primary" as const,
  },
  info: {
    icon: Check,
    iconBg: "bg-[var(--color-info)]",
    iconColor: "text-[var(--color-info-foreground)]",
    confirmVariant: "primary" as const,
  },
  default: {
    icon: Check,
    iconBg: "bg-[var(--color-primary)]",
    iconColor: "text-[var(--color-primary-foreground)]",
    confirmVariant: "primary" as const,
  },
};

/**
 * ConfirmDialog - Confirmation dialog for important actions
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen = true,
  onClose = () => {},
  onConfirm = () => {},
  title,
  message,
  description,
  confirmText,
  confirmLabel,
  cancelText,
  cancelLabel,
  variant = "danger",
  size = "sm",
  isLoading = false,
  error: _error,
  entity: _entity,
  className,
}) => {
  const config = variantConfig[variant];
  const { t } = useTranslate();

  // Resolve aliases
  const resolvedMessage = message ?? description ?? "";
  const resolvedConfirmText = confirmText ?? confirmLabel ?? t('dialog.confirm');
  const resolvedCancelText = cancelText ?? cancelLabel ?? t('dialog.cancel');

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      showCloseButton={false}
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
      className={className}
      footer={
        <HStack className="justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {resolvedCancelText}
          </Button>
          <Button
            variant={config.confirmVariant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? t('common.loading') : resolvedConfirmText}
          </Button>
        </HStack>
      }
    >
      <HStack className="gap-4">
        {/* Icon */}
        <Box
          className={cn(
            "flex-shrink-0 w-12 h-12 flex items-center justify-center",
            config.iconBg,
          )}
        >
          <Icon icon={config.icon} size="lg" className={config.iconColor} />
        </Box>

        {/* Content */}
        <Box className="flex-1">
          <Typography variant="h5" className="mb-2">
            {title}
          </Typography>
          {typeof resolvedMessage === "string" ? (
            <Typography
              variant="body2"
              className="text-[var(--color-muted-foreground)]"
            >
              {resolvedMessage}
            </Typography>
          ) : (
            resolvedMessage
          )}
        </Box>
      </HStack>
    </Modal>
  );
};

ConfirmDialog.displayName = "ConfirmDialog";

export default ConfirmDialog;
