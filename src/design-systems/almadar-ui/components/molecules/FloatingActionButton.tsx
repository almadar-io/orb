'use client';
/**
 * FloatingActionButton Molecule Component
 *
 * A floating action button that can expand into multiple actions vertically.
 * Uses Button atom.
 */

import React, { useState, useRef, useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Plus, X } from "lucide-react";
import { Button } from "../atoms/Button";
import { Box } from "../atoms/Box";
import { HStack, VStack } from "../atoms/Stack";
import { Typography } from "../atoms/Typography";
import { cn } from "../../lib/cn";
import { useEventBus } from "../../hooks/useEventBus";
import { useTranslate } from "../../hooks/useTranslate";

export interface FloatingAction {
  /**
   * Action ID
   */
  id: string;

  /**
   * Action label
   */
  label: string;

  /**
   * Action icon
   */
  icon: LucideIcon;

  /**
   * Action click handler
   */
  onClick?: () => void;

  /** Event name to emit when clicked (for trait state machine integration) */
  event?: string;

  /**
   * Action variant
   */
  variant?: "primary" | "secondary" | "success" | "danger" | "warning";
}

export interface FloatingActionButtonProps {
  /**
   * Single action (if only one action, button will directly trigger onClick)
   */
  action?: {
    icon: LucideIcon;
    onClick: () => void;
    label?: string;
    variant?: "primary" | "secondary" | "success" | "danger" | "warning";
  };

  /**
   * Multiple actions (if provided, button will expand to show all actions)
   */
  actions?: FloatingAction[];

  /**
   * Icon name (simplified API for pattern compatibility)
   */
  icon?: string;

  /**
   * Click handler (simplified API for pattern compatibility)
   */
  onClick?: () => void;

  /**
   * Variant (simplified API for pattern compatibility)
   */
  variant?: "primary" | "secondary" | "success" | "danger" | "warning";

  /**
   * Button position
   * @default 'bottom-right'
   */
  position?:
    | "bottom-right"
    | "bottom-left"
    | "bottom-center"
    | "top-right"
    | "top-left"
    | "top-center"
    | string; // Allow string for generated code compatibility

  /**
   * Additional CSS classes
   */
  className?: string;
}

// Resolve icon name to LucideIcon component
function resolveIcon(name: string): LucideIcon {
  // Convert kebab-case or snake_case to PascalCase
  const pascalName = name
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");

  // Try direct lookup - use unknown intermediate for safe casting
  const icons = LucideIcons as unknown as Record<
    string,
    LucideIcon | undefined
  >;
  const icon = icons[pascalName];
  if (icon) {
    return icon;
  }

  // Fallback to Plus icon
  return Plus;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  action,
  actions,
  icon,
  onClick,
  variant,
  position = "bottom-right",
  className,
}) => {
  const eventBus = useEventBus();
  const { t } = useTranslate();
  // If simplified props are provided, construct action from them
  const resolvedAction =
    action ??
    (icon
      ? {
          icon: resolveIcon(icon),
          onClick: onClick ?? (() => {}),
          variant: variant,
        }
      : undefined);
  const [isExpanded, setIsExpanded] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isExpanded || !actions || actions.length <= 1) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded, actions]);

  const positionClasses: Record<string, string> = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "bottom-center": "bottom-6 left-1/2 -translate-x-1/2",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
    "top-center": "top-6 left-1/2 -translate-x-1/2",
  };

  // Single action - direct onClick
  if (resolvedAction && (!actions || actions.length === 0)) {
    return (
      <Box className={cn("fixed z-50", positionClasses[position], className)}>
        <Button
          variant={resolvedAction.variant || "primary"}
          size="lg"
          icon={resolvedAction.icon}
          onClick={resolvedAction.onClick}
          className="rounded-[var(--radius-full)] shadow-[var(--shadow-lg)]"
          aria-label={resolvedAction.label || "Action"}
        >
          {resolvedAction.label && (
            <Typography as="span" className="sr-only">{resolvedAction.label}</Typography>
          )}
        </Button>
      </Box>
    );
  }

  // Multiple actions - expandable
  if (actions && actions.length > 0) {
    const handleMainClick = () => {
      if (actions.length === 1) {
        if (actions[0].event) eventBus.emit(`UI:${actions[0].event}`, { actionId: actions[0].id });
        actions[0].onClick?.();
      } else {
        setIsExpanded(!isExpanded);
      }
    };

    return (
      <Box
        ref={fabRef}
        className={cn(
          "fixed z-50 flex flex-col items-end gap-3",
          positionClasses[position],
          position.includes("left") && "items-start",
          className,
        )}
      >
        {/* Expanded Action Buttons */}
        {isExpanded && actions.length > 1 && (
          <VStack
            className={cn(
              "gap-3",
              position.includes("left") ? "items-start" : "items-end",
            )}
          >
            {actions.map((actionItem, index) => (
              <HStack
                key={actionItem.id}
                align="center"
                gap="sm"
                className="transition-all duration-200"
                style={{
                  opacity: isExpanded ? 1 : 0,
                  transform: isExpanded ? "translateY(0)" : "translateY(10px)",
                  transitionDelay: `${index * 50}ms`,
                }}
              >
                {position.includes("right") && (
                  <Typography variant="small" className="text-[var(--color-foreground)] dark:text-[var(--color-foreground)] bg-[var(--color-card)] dark:bg-[var(--color-card)] px-2 py-1 rounded shadow-[var(--shadow-sm)] whitespace-nowrap">
                    {actionItem.label}
                  </Typography>
                )}
                <Button
                  variant={actionItem.variant || "primary"}
                  size="lg"
                  icon={actionItem.icon}
                  onClick={() => {
                    setIsExpanded(false);
                    if (actionItem.event) eventBus.emit(`UI:${actionItem.event}`, { actionId: actionItem.id });
                    actionItem.onClick?.();
                  }}
                  className="rounded-[var(--radius-full)] shadow-[var(--shadow-lg)]"
                  aria-label={actionItem.label}
                >
                  <Typography as="span" className="sr-only">{actionItem.label}</Typography>
                </Button>
                {position.includes("left") && (
                  <Typography variant="small" className="text-[var(--color-foreground)] dark:text-[var(--color-foreground)] bg-[var(--color-card)] dark:bg-[var(--color-card)] px-2 py-1 rounded shadow-[var(--shadow-sm)] whitespace-nowrap">
                    {actionItem.label}
                  </Typography>
                )}
              </HStack>
            ))}
          </VStack>
        )}

        {/* Main FAB Button */}
        <Button
          variant={isExpanded ? "secondary" : "primary"}
          size="lg"
          icon={isExpanded ? X : Plus}
          onClick={handleMainClick}
          className="rounded-[var(--radius-full)] shadow-[var(--shadow-lg)] transition-all duration-300"
          aria-label={isExpanded ? "Close actions" : "Open actions"}
          aria-expanded={isExpanded}
        >
          <Typography as="span" className="sr-only">{isExpanded ? t('common.close') : t('common.open')}</Typography>
        </Button>
      </Box>
    );
  }

  return null;
};

FloatingActionButton.displayName = "FloatingActionButton";
