'use client';
/**
 * DetailPanel Organism Component
 *
 * Composes atoms and molecules to create a professional detail view.
 *
 * Data is provided by the runtime via the `entity` prop.
 * See EntityDisplayProps in ./types.ts for base prop contract.
 */

import React, { useCallback } from "react";
import {
  Calendar,
  Tag,
  TrendingUp,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  FileText,
  Package,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Card,
  Badge,
  Typography,
  Icon,
  Avatar,
  Button,
  Divider,
  ProgressBar,
} from "../atoms";
import { Box } from "../atoms/Box";
import { VStack, HStack } from "../atoms/Stack";
import { SimpleGrid } from "../molecules/SimpleGrid";
import { LoadingState } from "../molecules/LoadingState";
import { ErrorState } from "../molecules/ErrorState";
import { EmptyState } from "../molecules/EmptyState";
import { cn } from "../../lib/cn";
import { getNestedValue } from "../../lib/getNestedValue";
import { useEventBus } from "../../hooks/useEventBus";
import { useTranslate } from "../../hooks/useTranslate";
import type { EntityDisplayProps } from "./types";

function getFieldIcon(fieldName: string): LucideIcon {
  const name = fieldName.toLowerCase();
  if (name.includes("date") || name.includes("time")) return Calendar;
  if (name.includes("status")) return Tag;
  if (name.includes("priority")) return AlertCircle;
  if (name.includes("progress") || name.includes("percent")) return TrendingUp;
  if (
    name.includes("assignee") ||
    name.includes("owner") ||
    name.includes("user") ||
    name.includes("member")
  )
    return User;
  if (name.includes("due")) return Clock;
  if (name.includes("complete")) return CheckCircle2;
  if (
    name.includes("budget") ||
    name.includes("cost") ||
    name.includes("price")
  )
    return DollarSign;
  if (
    name.includes("description") ||
    name.includes("note") ||
    name.includes("comment")
  )
    return FileText;
  return Package;
}

function getBadgeVariant(
  fieldName: string,
  value: string,
): "default" | "success" | "warning" | "danger" | "info" {
  const name = fieldName.toLowerCase();
  const val = String(value).toLowerCase();

  if (name.includes("status")) {
    if (
      val.includes("complete") ||
      val.includes("done") ||
      val.includes("active")
    )
      return "success";
    if (val.includes("progress") || val.includes("pending")) return "warning";
    if (val.includes("block") || val.includes("cancel")) return "danger";
    return "info";
  }

  if (name.includes("priority")) {
    if (val.includes("high") || val.includes("urgent")) return "danger";
    if (val.includes("medium") || val.includes("normal")) return "warning";
    if (val.includes("low")) return "info";
  }

  return "default";
}

function formatFieldLabel(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}

function formatFieldValue(value: unknown, fieldName: string): string {
  if (typeof value === "number") {
    if (
      fieldName.toLowerCase().includes("progress") ||
      fieldName.toLowerCase().includes("percent")
    ) {
      return `${value}%`;
    }
    if (
      fieldName.toLowerCase().includes("budget") ||
      fieldName.toLowerCase().includes("cost")
    ) {
      return `$${value.toLocaleString()}`;
    }
    return value.toLocaleString();
  }
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  return String(value);
}

export interface DetailField {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  copyable?: boolean;
}

export interface DetailSection {
  title: string;
  fields: (DetailField | string)[];
}

/**
 * Action definition for DetailPanel
 */
export interface DetailPanelAction {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  /** Event to emit via event bus */
  event?: string;
  /** Navigation URL */
  navigatesTo?: string;
  /** Button variant (primary for main action, others for secondary) */
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

/**
 * Field definition for unified interface - can be a simple string or object
 */
export type FieldDef = string | { key: string; header?: string };

/**
 * Normalize fields to simple string array
 */
function normalizeFieldDefs(fields: readonly FieldDef[] | undefined): string[] {
  if (!fields) return [];
  return fields.map((f) => (typeof f === "string" ? f : f.key));
}

export interface DetailPanelProps extends EntityDisplayProps {
  title?: string;
  subtitle?: string;
  status?: {
    label: string;
    variant?: "default" | "success" | "warning" | "danger" | "info";
  };
  avatar?: React.ReactNode;
  sections?: readonly DetailSection[];
  /** Unified actions array - first action with variant='primary' is the main action */
  actions?: readonly DetailPanelAction[];
  footer?: React.ReactNode;
  slideOver?: boolean;

  /** Fields to display - accepts string[], {key, header}[], or DetailField[] */
  fields?: readonly (FieldDef | DetailField)[];
  /** Alias for fields - backwards compatibility */
  fieldNames?: readonly string[];
  /** Initial data for edit mode (passed by compiler) */
  initialData?: Record<string, unknown> | unknown;
  /** Display mode (passed by compiler) */
  mode?: string;
  /** Panel position (for drawer/sidebar placement) */
  position?: "left" | "right";
  /** Panel width (CSS value, e.g., '400px', '50%') */
  width?: string;
  /** Entity ID for fetching specific entity */
  entityId?: string;
  /** Display fields (alias for fields) */
  displayFields?: readonly string[];
  /** Show actions flag */
  showActions?: boolean;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({
  title: propTitle,
  subtitle,
  status,
  avatar,
  sections: propSections,
  actions,
  footer,
  slideOver = false,
  className,
  entity,
  fields: propFields,
  fieldNames,
  initialData,
  isLoading = false,
  error,
}) => {
  const eventBus = useEventBus();
  const { t } = useTranslate();

  // Support fields and fieldNames (alias) - normalize to string array
  // Check if propFields contains FieldDef (string or {key}) or DetailField (has label/value)
  const isFieldDefArray = (
    arr: readonly unknown[] | undefined,
  ): arr is readonly FieldDef[] => {
    if (!arr || arr.length === 0) return false;
    const first = arr[0];
    return (
      typeof first === "string" ||
      (typeof first === "object" && first !== null && "key" in first)
    );
  };

  const effectiveFieldNames = isFieldDefArray(propFields)
    ? normalizeFieldDefs(propFields)
    : fieldNames;

  // Handle action click with event bus and navigation support
  const handleActionClick = useCallback(
    (action: DetailPanelAction, data?: Record<string, unknown>) => {
      if (action.navigatesTo) {
        // Replace template variables in URL
        const url = action.navigatesTo.replace(/\{\{(\w+)\}\}/g, (_, key) =>
          String(data?.[key] ?? ""),
        );
        eventBus.emit('UI:NAVIGATE', { url, row: data });
        return;
      }
      if (action.event) {
        eventBus.emit(`UI:${action.event}`, { row: data });
      }
      if (action.onClick) {
        action.onClick();
      }
    },
    [eventBus],
  );

  // Handle close via event bus (closed circuit pattern)
  const handleClose = useCallback(() => {
    eventBus.emit('UI:CLOSE', {});
  }, [eventBus]);

  // entity is now the data itself (single record or first element of array)
  const entityRecord = Array.isArray(entity) ? entity[0] : entity;
  const data = entityRecord ?? initialData;

  let title = propTitle;
  // Use a mutable array for building sections, but accept readonly from props
  let sections: DetailSection[] | undefined = propSections
    ? [...propSections]
    : undefined;

  // Normalize data to Record type for indexing
  const normalizedData =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : undefined;

  // Resolve string fields in sections using entity data
  if (sections && normalizedData) {
    sections = sections.map((section) => ({
      ...section,
      fields: section.fields.map((field) => {
        if (typeof field === "string") {
          const value = getNestedValue(normalizedData, field);
          return {
            label: formatFieldLabel(field),
            value: formatFieldValue(value, field),
            icon: getFieldIcon(field),
          };
        }
        return field;
      }),
    }));
  }

  // Build sections from schema if provided
  if (normalizedData && effectiveFieldNames) {
    const primaryField = effectiveFieldNames[0];
    if (!title && primaryField && normalizedData[primaryField]) {
      title = String(normalizedData[primaryField]);
    }

    // Categorize fields
    const statusFields = effectiveFieldNames.filter(
      (f) =>
        f.toLowerCase().includes("status") ||
        f.toLowerCase().includes("priority"),
    );
    const progressFields = effectiveFieldNames.filter(
      (f) =>
        f.toLowerCase().includes("progress") ||
        f.toLowerCase().includes("percent"),
    );
    const metricFields = effectiveFieldNames.filter(
      (f) =>
        (f.toLowerCase().includes("budget") ||
          f.toLowerCase().includes("cost") ||
          f.toLowerCase().includes("count")) &&
        !progressFields.includes(f),
    );
    const dateFields = effectiveFieldNames.filter(
      (f) =>
        f.toLowerCase().includes("date") || f.toLowerCase().includes("time"),
    );
    const descriptionFields = effectiveFieldNames.filter(
      (f) =>
        f.toLowerCase().includes("description") ||
        f.toLowerCase().includes("note"),
    );
    const otherFields = effectiveFieldNames.filter(
      (f) =>
        f !== primaryField &&
        !statusFields.includes(f) &&
        !progressFields.includes(f) &&
        !metricFields.includes(f) &&
        !dateFields.includes(f) &&
        !descriptionFields.includes(f),
    );

    sections = [];

    // Overview section
    if (statusFields.length > 0 || otherFields.length > 0) {
      const overviewFields: DetailField[] = [];

      [...statusFields, ...otherFields.slice(0, 3)].forEach((field) => {
        const value = getNestedValue(normalizedData, field);
        if (value !== undefined && value !== null) {
          overviewFields.push({
            label: formatFieldLabel(field),
            value: formatFieldValue(value, field),
            icon: getFieldIcon(field),
          });
        }
      });

      if (overviewFields.length > 0) {
        sections.push({ title: "Overview", fields: overviewFields });
      }
    }

    // Metrics section
    if (progressFields.length > 0 || metricFields.length > 0) {
      const metricsFields: DetailField[] = [];

      [...progressFields, ...metricFields].forEach((field) => {
        const value = getNestedValue(normalizedData, field);
        if (value !== undefined && value !== null) {
          metricsFields.push({
            label: formatFieldLabel(field),
            value: formatFieldValue(value, field),
            icon: getFieldIcon(field),
          });
        }
      });

      if (metricsFields.length > 0) {
        sections.push({ title: "Metrics", fields: metricsFields });
      }
    }

    // Timeline section
    if (dateFields.length > 0) {
      const timelineFields: DetailField[] = [];

      dateFields.forEach((field) => {
        const value = getNestedValue(normalizedData, field);
        if (value !== undefined && value !== null) {
          timelineFields.push({
            label: formatFieldLabel(field),
            value: formatFieldValue(value, field),
            icon: getFieldIcon(field),
          });
        }
      });

      if (timelineFields.length > 0) {
        sections.push({ title: "Timeline", fields: timelineFields });
      }
    }

    // Description section
    if (descriptionFields.length > 0) {
      const descFields: DetailField[] = [];

      descriptionFields.forEach((field) => {
        const value = getNestedValue(normalizedData, field);
        if (value !== undefined && value !== null) {
          descFields.push({
            label: formatFieldLabel(field),
            value: String(value),
            icon: getFieldIcon(field),
          });
        }
      });

      if (descFields.length > 0) {
        sections.push({ title: "Details", fields: descFields });
      }
    }
  }

  if (isLoading) {
    return (
      <LoadingState
        message="Loading details..."
        className={className}
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title={t("error.loadingData")}
        message={error.message || t("error.genericLoad")}
        retryEvent="RETRY"
        className={className}
      />
    );
  }

  if (
    !normalizedData &&
    !isLoading &&
    effectiveFieldNames &&
    effectiveFieldNames.length > 0
  ) {
    return (
      <EmptyState
        title="Not Found"
        description="The requested item could not be found."
        className={className}
      />
    );
  }

  const content = (
    <VStack gap="lg">
      {/* Header Card */}
      <Card variant="elevated">
        <VStack gap="md" className="p-6">
          <HStack justify="between" align="start">
            <VStack gap="sm" flex className="min-w-0">
              {avatar}

              <Typography variant="h2" weight="bold">
                {title || "Details"}
              </Typography>

              {subtitle && (
                <Typography variant="body" color="secondary">
                  {subtitle}
                </Typography>
              )}

              {/* Status badges */}
              {normalizedData && effectiveFieldNames && (
                <HStack gap="xs" wrap>
                  {effectiveFieldNames
                    .filter(
                      (f) =>
                        f.toLowerCase().includes("status") ||
                        f.toLowerCase().includes("priority"),
                    )
                    .map((field) => {
                      const value = getNestedValue(normalizedData, field);
                      if (!value) return null;
                      return (
                        <Badge
                          key={field}
                          variant={getBadgeVariant(field, String(value))}
                        >
                          {String(value)}
                        </Badge>
                      );
                    })}
                </HStack>
              )}

              {status && (
                <Badge variant={status.variant ?? "default"}>
                  {status.label}
                </Badge>
              )}
            </VStack>

            {slideOver && (
              <Button variant="ghost" size="sm" onClick={handleClose} icon={X} />
            )}
          </HStack>

          {/* Progress bars */}
          {normalizedData &&
            effectiveFieldNames &&
            effectiveFieldNames
              .filter(
                (f) =>
                  f.toLowerCase().includes("progress") ||
                  f.toLowerCase().includes("percent"),
              )
              .map((field) => {
                const value = getNestedValue(normalizedData, field);
                if (
                  value === undefined ||
                  value === null ||
                  typeof value !== "number"
                )
                  return null;
                return (
                  <VStack key={field} gap="xs" className="w-full">
                    <HStack justify="between">
                      <Typography variant="small" color="secondary">
                        {formatFieldLabel(field)}
                      </Typography>
                      <Typography variant="small" weight="medium">
                        {value}%
                      </Typography>
                    </HStack>
                    <ProgressBar value={value} />
                  </VStack>
                );
              })}

          {/* Actions */}
          {actions && actions.length > 0 && (
            <>
              <Divider />
              <HStack gap="sm">
                {actions.map((action, idx) => (
                  <Button
                    key={idx}
                    variant={action.variant || "secondary"}
                    action={action.event}
                    actionPayload={{ row: normalizedData }}
                    icon={action.icon}
                  >
                    {action.label}
                  </Button>
                ))}
              </HStack>
            </>
          )}
        </VStack>
      </Card>

      {/* Sections */}
      {sections &&
        sections.map((section, sectionIdx) => (
          <Card key={sectionIdx} variant="bordered">
            <VStack gap="md" className="p-6">
              <Typography variant="h4" weight="semibold">
                {section.title}
              </Typography>

              <Divider />

              <SimpleGrid minChildWidth="250px" maxCols={2} gap="lg">
                {section.fields.map((field, fieldIdx) => {
                  const resolved: DetailField = typeof field === "string"
                    ? { label: formatFieldLabel(field), value: normalizedData ? formatFieldValue(getNestedValue(normalizedData, field), field) : "—", icon: getFieldIcon(field) }
                    : field;
                  return (
                  <HStack key={fieldIdx} gap="sm" align="start">
                    {resolved.icon && (
                      <Icon
                        icon={resolved.icon}
                        size="md"
                        className="text-[var(--color-muted-foreground)] mt-1"
                      />
                    )}

                    <VStack gap="xs" flex className="min-w-0">
                      <Typography
                        variant="small"
                        color="secondary"
                        weight="medium"
                      >
                        {resolved.label}
                      </Typography>

                      <Typography variant="body" className="break-words">
                        {resolved.value || "—"}
                      </Typography>
                    </VStack>
                  </HStack>
                  );
                })}
              </SimpleGrid>
            </VStack>
          </Card>
        ))}

      {/* Footer */}
      {footer && <Card variant="bordered">{footer}</Card>}
    </VStack>
  );

  return (
    <Box
      className={cn(
        slideOver &&
          "fixed inset-y-0 right-0 w-full max-w-2xl bg-[var(--color-card)] shadow-[var(--shadow-lg)] z-50 overflow-y-auto p-6",
        className,
      )}
    >
      {content}
    </Box>
  );
};

DetailPanel.displayName = "DetailPanel";
