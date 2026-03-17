/**
 * GenericAppTemplate
 *
 * A simple, generic template for any application.
 * Includes a header with title and actions, and a main content area.
 * **Atomic Design**: Composed using Box, Typography, and Button atoms.
 */

import React from "react";
import { cn } from "../../lib/cn";
import { Box } from "../atoms/Box";
import { HStack } from "../atoms/Stack";
import { Typography } from "../atoms/Typography";
import { Button } from "../atoms/Button";
import type { TemplateProps } from "./types";

interface GenericAppEntity {
  id: string;
  title?: string;
  subtitle?: string;
}

export interface GenericAppTemplateProps extends TemplateProps<GenericAppEntity> {
  /** Page title */
  title: string;
  /** Subtitle or description */
  subtitle?: string;
  /** Main content */
  children: React.ReactNode;
  /** Header actions (buttons, links) */
  headerActions?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Additional class name */
  className?: string;
}

export const GenericAppTemplate: React.FC<GenericAppTemplateProps> = ({
  entity,
  title,
  subtitle,
  children,
  headerActions,
  footer,
  className,
}) => {
  return (
    <Box display="flex" fullHeight className={cn("flex-col", className)}>
      {/* Header */}
      <Box
        padding="md"
        border
        className="border-b-2 border-x-0 border-t-0 border-[var(--color-border)] flex items-center justify-between flex-shrink-0"
      >
        <Box>
          <Typography variant="h3">{title}</Typography>
          {subtitle && (
            <Typography variant="body2" color="secondary" className="mt-1">
              {subtitle}
            </Typography>
          )}
        </Box>
        {headerActions && (
          <HStack gap="sm" align="center">{headerActions}</HStack>
        )}
      </Box>

      {/* Main Content */}
      <Box fullWidth overflow="auto" className="flex-1">
        <Box padding="lg">{children}</Box>
      </Box>

      {/* Footer */}
      {footer && (
        <Box
          padding="md"
          border
          bg="muted"
          className="border-t-2 border-x-0 border-b-0 border-[var(--color-border)] flex-shrink-0"
        >
          {footer}
        </Box>
      )}
    </Box>
  );
};

GenericAppTemplate.displayName = "GenericAppTemplate";
