'use client';
/**
 * Drawer Molecule Component
 *
 * A slide-in drawer component for displaying secondary content.
 * Used by the UI Slot system for render_ui effects targeting the drawer slot.
 *
 * Features:
 * - Left/right positioning
 * - Configurable width
 * - Overlay backdrop
 * - Click-outside to dismiss
 * - Slide animation
 * - Escape key to close
 *
 * @packageDocumentation
 */

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Icon } from "../atoms/Icon";
import { Box } from "../atoms/Box";
import { Typography } from "../atoms/Typography";
import { Overlay } from "../atoms/Overlay";
import { cn } from "../../lib/cn";
import { useEventBus } from "../../hooks/useEventBus";

// ============================================================================
// Types
// ============================================================================

export type DrawerPosition = "left" | "right";
export type DrawerSize = "sm" | "md" | "lg" | "xl" | "full";

export interface DrawerProps {
  /** Whether the drawer is open (defaults to true when rendered by slot wrapper) */
  isOpen?: boolean;
  /** Callback when drawer should close (injected by slot wrapper) */
  onClose?: () => void;
  /** Drawer title */
  title?: string;
  /** Drawer content (can be empty if using slot content) */
  children?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Position (left or right) */
  position?: DrawerPosition;
  /** Width (CSS value or preset size) */
  width?: string | DrawerSize;
  /** Show close button */
  showCloseButton?: boolean;
  /** Close on overlay click */
  closeOnOverlayClick?: boolean;
  /** Close on escape key */
  closeOnEscape?: boolean;
  /** Additional class name */
  className?: string;
  /** Declarative close event — emits UI:{closeEvent} via eventBus when drawer should close */
  closeEvent?: string;
}

// ============================================================================
// Size Presets
// ============================================================================

const sizeWidths: Record<DrawerSize, string> = {
  sm: "w-80", // 320px
  md: "w-96", // 384px
  lg: "w-[480px]", // 480px
  xl: "w-[640px]", // 640px
  full: "w-screen",
};

// ============================================================================
// Component
// ============================================================================

export const Drawer: React.FC<DrawerProps> = ({
  isOpen = true,
  onClose = () => {},
  title,
  children = null,
  footer,
  position = "right",
  width = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  closeEvent,
}) => {
  const eventBus = useEventBus();
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      const focusableElements = drawerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements?.[0] as HTMLElement;
      firstElement?.focus();
    } else {
      previousActiveElement.current?.focus();
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (closeEvent) eventBus.emit(`UI:${closeEvent}`, {});
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose, closeEvent, eventBus]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (closeEvent) eventBus.emit(`UI:${closeEvent}`, {});
    onClose();
  };

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Resolve width
  const widthClass = width in sizeWidths ? sizeWidths[width as DrawerSize] : "";
  const widthStyle = width in sizeWidths ? undefined : { width };

  // Position classes
  const positionClasses =
    position === "right" ? "right-0 border-l" : "left-0 border-r";

  // Animation classes
  const animationClasses =
    position === "right" ? "animate-slide-in-right" : "animate-slide-in-left";

  return (
    <>
      {/* Overlay */}
      <Overlay
        isVisible={isOpen}
        onClick={handleOverlayClick}
        className="z-40"
      />

      {/* Drawer */}
      <Box
        ref={drawerRef}
        bg="surface"
        border
        shadow="xl"
        className={cn(
          "fixed top-0 bottom-0 z-50",
          "flex flex-col max-h-screen",
          positionClasses,
          widthClass,
          animationClasses,
          className,
        )}
        style={widthStyle}
        role="dialog"
        aria-modal="true"
        {...(title && { "aria-labelledby": "drawer-title" })}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            className={cn(
              "px-6 py-4 flex items-center justify-between shrink-0",
              "border-b-[length:var(--border-width)] border-[var(--color-border)]",
            )}
          >
            {title && (
              <Typography variant="h4" as="h2" id="drawer-title">
                {title}
              </Typography>
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={handleClose}
                className={cn(
                  "p-1 transition-colors rounded-[var(--radius-sm)]",
                  "hover:bg-[var(--color-muted)]",
                  !title && "ml-auto",
                )}
                aria-label="Close drawer"
              >
                <Icon icon={X} size="md" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div
            className={cn(
              "px-6 py-4 shrink-0 bg-[var(--color-muted)]",
              "border-t-[length:var(--border-width)] border-[var(--color-border)]",
            )}
          >
            {footer}
          </div>
        )}
      </Box>

      {/* Animation styles */}
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes slide-in-left {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

Drawer.displayName = "Drawer";
