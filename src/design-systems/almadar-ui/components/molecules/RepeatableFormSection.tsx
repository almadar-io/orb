'use client';
/**
 * RepeatableFormSection
 *
 * A form section that can be repeated multiple times.
 * Used for collecting multiple entries (participants, findings, etc.)
 *
 * Enhanced with trackAddedInState for inspection audit trails.
 *
 * Event Contract:
 * - Emits: UI:SECTION_ADDED { sectionType, index, addedInState? }
 * - Emits: UI:SECTION_REMOVED { sectionType, index, itemId }
 */

import React, { useCallback } from "react";
import { cn } from "../../lib/cn";
import { Box } from "../atoms/Box";
import { VStack, HStack } from "../atoms/Stack";
import { Typography } from "../atoms/Typography";
import { Button } from "../atoms/Button";
import { Card } from "../atoms/Card";
import { Icon } from "../atoms/Icon";
import { useEventBus } from "../../hooks/useEventBus";
import { useTranslate } from "../../hooks/useTranslate";

export interface RepeatableItem {
  id: string;
  /** State in which this item was added (for audit trails) */
  addedInState?: string;
  /** Timestamp when item was added */
  addedAt?: string;
  [key: string]: unknown;
}

export interface RepeatableFormSectionProps {
  /** Section type identifier */
  sectionType: string;
  /** Section title */
  title: string;
  /** Items in the section */
  items: RepeatableItem[];
  /** Render function for each item */
  renderItem: (item: RepeatableItem, index: number) => React.ReactNode;
  /** Minimum items required */
  minItems?: number;
  /** Maximum items allowed */
  maxItems?: number;
  /** Allow reordering */
  allowReorder?: boolean;
  /** Add button label */
  addLabel?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Read-only mode */
  readOnly?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Add handler */
  onAdd?: () => void;
  /** Remove handler */
  onRemove?: (itemId: string, index: number) => void;
  /** Reorder handler */
  onReorder?: (fromIndex: number, toIndex: number) => void;

  // Inspection-specific enhancements
  /** Track the state in which items are added (for inspection audit) */
  trackAddedInState?: boolean;
  /** Current inspection state (used when trackAddedInState is true) */
  currentState?: string;
  /** Show audit metadata (addedInState, addedAt) */
  showAuditInfo?: boolean;
}

export const RepeatableFormSection: React.FC<RepeatableFormSectionProps> = ({
  sectionType,
  title,
  items,
  renderItem,
  minItems = 0,
  maxItems = Infinity,
  allowReorder = false,
  addLabel,
  emptyMessage,
  readOnly = false,
  className,
  onAdd,
  onRemove,
  onReorder,
  trackAddedInState = false,
  currentState,
  showAuditInfo = false,
}) => {
  const eventBus = useEventBus();
  const { t } = useTranslate();
  const resolvedAddLabel = addLabel ?? t('common.add');
  const resolvedEmptyMessage = emptyMessage ?? t('empty.noItemsAdded');

  const canAdd = !readOnly && items.length < maxItems;
  const canRemove = !readOnly && items.length > minItems;

  const handleAdd = useCallback(() => {
    onAdd?.();

    const eventPayload: Record<string, unknown> = {
      sectionType,
      index: items.length,
    };

    // Include state tracking info if enabled
    if (trackAddedInState && currentState) {
      eventPayload.addedInState = currentState;
      eventPayload.addedAt = new Date().toISOString();
    }

    eventBus.emit("UI:SECTION_ADDED", eventPayload);
  }, [
    sectionType,
    items.length,
    onAdd,
    eventBus,
    trackAddedInState,
    currentState,
  ]);

  const handleRemove = useCallback(
    (itemId: string, index: number) => {
      onRemove?.(itemId, index);
      eventBus.emit("UI:SECTION_REMOVED", { sectionType, index, itemId });
    },
    [sectionType, onRemove, eventBus],
  );

  return (
    <VStack gap="md" className={cn("w-full", className)}>
      {/* Header */}
      <HStack justify="between" align="center">
        <HStack gap="sm" align="center">
          <Typography variant="h4">{title}</Typography>
          <Typography variant="caption" color="muted">
            ({items.length}
            {maxItems !== Infinity ? `/${maxItems}` : ""})
          </Typography>
        </HStack>

        {canAdd && (
          <Button variant="secondary" size="sm" onClick={handleAdd}>
            <Icon name="plus" size="sm" className="mr-1" />
            {resolvedAddLabel}
          </Button>
        )}
      </HStack>

      {/* Items */}
      {items.length === 0 ? (
        <Card className="p-6">
          <VStack align="center" gap="sm">
            <Typography variant="body" color="muted">
              {resolvedEmptyMessage}
            </Typography>
            {canAdd && (
              <Button variant="primary" size="sm" onClick={handleAdd}>
                <Icon name="plus" size="sm" className="mr-1" />
                {resolvedAddLabel}
              </Button>
            )}
          </VStack>
        </Card>
      ) : (
        <VStack gap="sm">
          {items.map((item, index) => (
            <Card key={item.id} className="p-4">
              <VStack gap="sm">
                {/* Audit info header */}
                {showAuditInfo && (item.addedInState || item.addedAt) && (
                  <HStack
                    justify="between"
                    align="center"
                    className="pb-2 border-b border-[var(--color-border)]"
                  >
                    <HStack gap="sm" align="center">
                      {item.addedInState && (
                        <Typography variant="caption" color="muted">
                          Added in:{" "}
                          <Typography
                            as="span"
                            variant="caption"
                            weight="semibold"
                          >
                            {item.addedInState}
                          </Typography>
                        </Typography>
                      )}
                    </HStack>
                    {item.addedAt && (
                      <Typography variant="caption" color="muted">
                        {new Date(item.addedAt).toLocaleString()}
                      </Typography>
                    )}
                  </HStack>
                )}

                <HStack gap="sm" align="start">
                  {/* Drag handle */}
                  {allowReorder && !readOnly && (
                    <Box className="pt-2 cursor-move text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
                      <Icon name="grip-vertical" size="md" />
                    </Box>
                  )}

                  {/* Item content */}
                  <Box className="flex-1">{renderItem(item, index)}</Box>

                  {/* Remove button */}
                  {canRemove && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(item.id, index)}
                      className="text-[var(--color-error)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
                    >
                      <Icon name="trash-2" size="sm" />
                    </Button>
                  )}
                </HStack>
              </VStack>
            </Card>
          ))}
        </VStack>
      )}

      {/* Min items warning */}
      {items.length < minItems && (
        <Typography variant="caption" color="warning">
          At least {minItems} item{minItems !== 1 ? "s" : ""} required
        </Typography>
      )}
    </VStack>
  );
};

RepeatableFormSection.displayName = "RepeatableFormSection";
