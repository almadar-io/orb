'use client';
import React from "react";
import { cn } from "../../lib/cn";
import { Card } from "../atoms";
import { Box } from "../atoms/Box";
import { Typography } from "../atoms/Typography";
import { Button } from "../atoms/Button";
import { VStack, HStack } from "../atoms/Stack";
import { Icon } from "../atoms/Icon";
import { ChevronDown } from "lucide-react";
import { useTranslate } from "../../hooks/useTranslate";
import { useEventBus } from "../../hooks/useEventBus";
import type { EntityDisplayProps } from "./types";

export interface FormSectionProps extends EntityDisplayProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Form fields */
  children: React.ReactNode;
  /** Collapsible */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Use card wrapper */
  card?: boolean;
  /** Grid columns for fields */
  columns?: 1 | 2 | 3;
  /** Entity ID for fetching specific entity */
  entityId?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  collapsible = false,
  defaultCollapsed = false,
  card = false,
  columns = 1,
  className,
}) => {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const { t } = useTranslate();
  const eventBus = useEventBus();

  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  }[columns];

  const handleToggleCollapse = React.useCallback(() => {
    if (collapsible) {
      setCollapsed((prev) => !prev);
      eventBus.emit("UI:TOGGLE_COLLAPSE", { collapsed: !collapsed });
    }
  }, [collapsible, collapsed, eventBus]);

  const content = (
    <>
      {(title || description) && (
        <VStack gap="xs" className="mb-4">
          {title && (
            <HStack
              justify="between"
              align="center"
              className={cn(collapsible && "cursor-pointer")}
              action={collapsible ? "TOGGLE_COLLAPSE" : undefined}
            >
              <Typography variant="h3" weight="semibold">
                {title}
              </Typography>
              {collapsible && (
                <Button
                  variant="ghost"
                  size="sm"
                  action="TOGGLE_COLLAPSE"
                >
                  <Icon
                    icon={ChevronDown}
                    size="sm"
                    className={cn(
                      "text-[var(--color-muted-foreground)] transition-transform",
                      collapsed && "rotate-180",
                    )}
                  />
                </Button>
              )}
            </HStack>
          )}
          {description && (
            <Typography variant="small" color="secondary">
              {description}
            </Typography>
          )}
        </VStack>
      )}
      {(!collapsible || !collapsed) && (
        <Box className={cn("grid gap-4", gridClass)}>{children}</Box>
      )}
    </>
  );

  if (card) {
    return <Card className={cn("p-6", className)}>{content}</Card>;
  }

  return <Box className={className}>{content}</Box>;
};

FormSection.displayName = "FormSection";

/**
 * Form layout with multiple sections
 */
export interface FormLayoutProps extends EntityDisplayProps {
  children: React.ReactNode;
  /** Show section dividers */
  dividers?: boolean;
}

export const FormLayout: React.FC<FormLayoutProps> = ({
  children,
  dividers = true,
  className,
}) => {
  return (
    <VStack
      gap="lg"
      className={cn(
        dividers &&
          "[&>*+*]:pt-8 [&>*+*]:border-t [&>*+*]:border-[var(--color-border)]",
        className,
      )}
    >
      {children}
    </VStack>
  );
};

FormLayout.displayName = "FormLayout";

/**
 * Form actions bar (submit/cancel buttons)
 */
export interface FormActionsProps extends EntityDisplayProps {
  children: React.ReactNode;
  /** Sticky at bottom */
  sticky?: boolean;
  /** Alignment */
  align?: "left" | "right" | "between" | "center";
}

export const FormActions: React.FC<FormActionsProps> = ({
  children,
  sticky = false,
  align = "right",
  className,
}) => {
  const alignClass = {
    left: "justify-start",
    right: "justify-end",
    between: "justify-between",
    center: "justify-center",
  }[align];

  return (
    <HStack
      gap="sm"
      align="center"
      className={cn(
        "pt-6 border-t border-[var(--color-border)]",
        alignClass,
        sticky &&
          "sticky bottom-0 bg-[var(--color-card)] py-4 -mx-6 px-6 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]",
        className,
      )}
    >
      {children}
    </HStack>
  );
};

FormActions.displayName = "FormActions";
