/* eslint-disable almadar/require-event-bus -- DataTable is a foundational UI component; onClick handlers are internal interaction mechanics (sort, row click, action menus), not closed-circuit violations */
'use client';
import React, { useState, useMemo, useCallback } from "react";
import { cn } from "../../lib/cn";
import { getNestedValue } from "../../lib/getNestedValue";
import { Button, Input, Badge, Checkbox, Spinner } from "../atoms";
import { Box } from "../atoms/Box";
import { HStack, VStack } from "../atoms/Stack";
import { Typography } from "../atoms/Typography";
import { EmptyState, Pagination } from "../molecules";
import { useEventBus } from "../../hooks/useEventBus";
import { useTranslate } from "../../hooks/useTranslate";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  MoreHorizontal,
  LucideIcon,
} from "lucide-react";
import { EntityDisplayProps, EntityDisplayEvents } from "./types";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

/**
 * Normalize column input - accepts either Column objects or string field names.
 * String field names are converted to Column objects with auto-generated headers.
 * Accepts readonly arrays for compatibility with generated const arrays.
 */
function normalizeColumns<T>(
  columns: readonly Column<T>[] | readonly string[],
): Column<T>[] {
  return columns.map((col) => {
    if (typeof col === "string") {
      const header = col
        .replace(/([A-Z])/g, " $1")
        .replace(/_/g, " ")
        .replace(/^\w/, (c) => c.toUpperCase())
        .trim();
      return { key: col, header } as Column<T>;
    }
    return col;
  });
}

export interface RowAction<T> {
  label: string;
  icon?: LucideIcon;
  onClick: (row: T) => void;
  variant?: "default" | "danger";
  show?: (row: T) => boolean;
  event?: string;
}

export interface DataTableProps<T extends { id: string | number }>
  extends EntityDisplayProps<T> {
  /** Fields to display - accepts string[] or Column[] for unified interface. Alias for columns */
  fields?: readonly Column<T>[] | readonly string[];
  /** Columns can be Column objects or simple string field names */
  columns?: readonly Column<T>[] | readonly string[];
  /** Item actions from generated code - maps to rowActions */
  itemActions?: readonly {
    label: string;
    event?: string;
    navigatesTo?: string;
    action?: string;
    placement?: "row" | "bulk" | string;
    icon?: LucideIcon;
    variant?: "default" | "primary" | "secondary" | "ghost" | "danger" | string;
    onClick?: (row: T) => void;
  }[];
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; event?: string };

  // Selection
  selectable?: boolean;

  // Search
  searchable?: boolean;
  searchPlaceholder?: string;

  // Row actions
  rowActions?: readonly RowAction<T>[];

  // Bulk actions
  bulkActions?: ReadonlyArray<{
    label: string;
    icon?: LucideIcon;
    onClick: (selectedRows: T[]) => void;
    variant?: "default" | "danger";
  }>;

  // Header actions
  headerActions?: React.ReactNode;

  /** Show total count in pagination */
  showTotal?: boolean;
}

export function DataTable<T extends { id: string | number }>({
  fields,
  columns,
  entity,
  itemActions,
  isLoading = false,
  error,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  selectable = false,
  selectedIds = [],
  sortBy,
  sortDirection = "asc",
  searchable = false,
  searchValue = "",
  searchPlaceholder,
  page,
  pageSize,
  totalCount,
  rowActions: externalRowActions,
  bulkActions,
  headerActions,
  showTotal = true,
  className,
}: DataTableProps<T>) {
  const [openActionMenu, setOpenActionMenu] = useState<string | number | null>(
    null,
  );
  const eventBus = useEventBus();
  const { t } = useTranslate();

  const resolvedEmptyTitle = emptyTitle ?? t("table.empty.title");
  const resolvedEmptyDescription =
    emptyDescription ?? t("table.empty.description");
  const resolvedSearchPlaceholder =
    searchPlaceholder ?? t("common.search");

  // Normalize entity data to array
  const items = useMemo(
    () => (Array.isArray(entity) ? entity : []) as readonly T[],
    [entity],
  );

  // Pagination display info
  const currentPage = page ?? 1;
  const currentPageSize = pageSize ?? 20;
  const total = totalCount ?? items.length;
  const totalPages = Math.ceil(total / currentPageSize);

  // Convert itemActions to rowActions format if provided
  const rowActions =
    externalRowActions ??
    (itemActions
      ?.filter((a) => a.placement !== "bulk")
      .map((action) => ({
        label: action.label,
        icon: action.icon,
        variant: action.variant,
        event: action.event,
        onClick: (row: T) => {
          if (action.navigatesTo) {
            const url = action.navigatesTo
              .replace(/:id\b/g, String((row as { id: string | number }).id))
              .replace(
                /\{\{id\}\}/g,
                String((row as { id: string | number }).id),
              );
            eventBus.emit('UI:NAVIGATE', { url, row });
            return;
          }
          if (action.event) {
            eventBus.emit(`UI:${action.event}`, {
              row,
            });
          }
        },
      })) as RowAction<T>[] | undefined);

  // Find VIEW action or navigatesTo action from itemActions for row click behavior
  const viewAction = itemActions?.find(
    (a) => a.event === "VIEW" || a.navigatesTo,
  );

  const handleRowClick = useCallback(
    (row: T) => {
      if (viewAction) {
        if (viewAction.navigatesTo) {
          const url = viewAction.navigatesTo
            .replace(/:id\b/g, String((row as { id: string | number }).id))
            .replace(
              /\{\{id\}\}/g,
              String((row as { id: string | number }).id),
            );
          eventBus.emit('UI:NAVIGATE', { url, row, entity });
          return;
        }
        eventBus.emit("UI:VIEW", { row });
      }
    },
    [viewAction, eventBus],
  );

  const isRowClickable = !!viewAction;

  // Support fields and columns (alias) - normalize to Column objects
  const effectiveColumns = fields ?? columns ?? [];
  const normalizedColumns: Column<T>[] = useMemo(
    () => normalizeColumns<T>(effectiveColumns),
    [effectiveColumns],
  );

  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      eventBus.emit(`UI:${EntityDisplayEvents.DESELECT}`, {
        ids: [],
      });
    } else {
      eventBus.emit(`UI:${EntityDisplayEvents.SELECT}`, {
        ids: items.map((row) => row.id),
      });
    }
  }, [allSelected, items, eventBus]);

  const handleSelectRow = useCallback(
    (id: string | number) => {
      if (selectedIds.includes(id)) {
        eventBus.emit(`UI:${EntityDisplayEvents.DESELECT}`, {
          ids: selectedIds.filter((i) => i !== id),
        });
      } else {
        eventBus.emit(`UI:${EntityDisplayEvents.SELECT}`, {
          ids: [...selectedIds, id],
        });
      }
    },
    [selectedIds, eventBus],
  );

  const handleSort = useCallback(
    (key: string) => {
      const newDirection =
        sortBy === key && sortDirection === "asc" ? "desc" : "asc";
      eventBus.emit(`UI:${EntityDisplayEvents.SORT}`, {
        field: key,
        direction: newDirection,
      });
    },
    [sortBy, sortDirection, eventBus],
  );

  const handleSearch = useCallback(
    (value: string) => {
      eventBus.emit(`UI:${EntityDisplayEvents.SEARCH}`, {
        query: value,
      });
    },
    [eventBus],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      eventBus.emit(`UI:${EntityDisplayEvents.PAGINATE}`, {
        page: newPage,
        pageSize: currentPageSize,
      });
    },
    [eventBus, currentPageSize],
  );

  const selectedRows = useMemo(
    () => items.filter((row) => selectedIds.includes(row.id)),
    [items, selectedIds],
  );

  return (
    <Box
      className={cn(
        "bg-[var(--color-card)] border-2 border-[var(--color-border)] rounded-none overflow-hidden",
        className,
      )}
    >
      {/* Header */}
      {(searchable || bulkActions || headerActions) && (
        <HStack className="px-4 py-3 border-b-2 border-[var(--color-border)] flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <HStack className="flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {searchable && (
              <Box className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted-foreground)]" />
                <Input
                  type="search"
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={resolvedSearchPlaceholder}
                  className="pl-9 w-full sm:w-64"
                />
              </Box>
            )}

            {/* Bulk actions */}
            {bulkActions && selectedIds.length > 0 && (
              <HStack className="items-center gap-2 pl-0 sm:pl-3 border-l-0 sm:border-l border-[var(--color-border)]">
                <Typography
                  variant="small"
                  className="text-[var(--color-muted-foreground)] whitespace-nowrap"
                >
                  {t("table.bulk.selected", {
                    count: String(selectedIds.length),
                  })}
                </Typography>
                <HStack className="flex-wrap gap-2">
                  {bulkActions.map((action, idx) => (
                    <Button
                      key={idx}
                      variant={
                        action.variant === "danger" ? "danger" : "secondary"
                      }
                      size="sm"
                      leftIcon={
                        action.icon && <action.icon className="h-4 w-4" />
                      }
                      onClick={() => action.onClick(selectedRows)}
                    >
                      {action.label}
                    </Button>
                  ))}
                </HStack>
              </HStack>
            )}
          </HStack>

          <Box className="flex sm:ml-auto">{headerActions}</Box>
        </HStack>
      )}

      {/* Table */}
      <Box className="overflow-x-auto">
        {/* eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements in DataTable */}
        <table className="w-full">
          {/* eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements in DataTable */}
          <thead className="bg-[var(--color-table-header)] border-b-2 border-[var(--color-border)]">
            {/* eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements in DataTable */}
            <tr>
              {selectable && (
                // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements in DataTable
                <th className="w-12 px-4 py-3">
                  <Checkbox
                    checked={allSelected}
                    // @ts-ignore - indeterminate not in types
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {normalizedColumns.map((col) => (
                // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements in DataTable
                <th
                  key={String(col.key)}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-bold text-[var(--color-foreground)] uppercase tracking-wider whitespace-nowrap",
                    col.sortable &&
                      "cursor-pointer select-none hover:bg-[var(--color-table-row-hover)]",
                  )}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <HStack className="items-center gap-1">
                    {col.header}
                    {col.sortable &&
                      sortBy === col.key &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                  </HStack>
                </th>
              ))}
              {/* eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements in DataTable */}
              {rowActions && <th className="w-12 px-4 py-3" />}
            </tr>
          </thead>
          {/* eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements in DataTable */}
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements in DataTable
              <tr>
                {/* eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements in DataTable */}
                <td
                  colSpan={
                    normalizedColumns.length +
                    (selectable ? 1 : 0) +
                    (rowActions ? 1 : 0)
                  }
                  className="px-4 py-12 text-center"
                >
                  <VStack className="items-center gap-2">
                    <Spinner size="lg" />
                    <Typography
                      variant="small"
                      className="text-[var(--color-muted-foreground)]"
                    >
                      {t("common.loading")}
                    </Typography>
                  </VStack>
                </td>
              </tr>
            ) : error ? (
              // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements in DataTable
              <tr>
                {/* eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements in DataTable */}
                <td
                  colSpan={
                    normalizedColumns.length +
                    (selectable ? 1 : 0) +
                    (rowActions ? 1 : 0)
                  }
                  className="px-4 py-12 text-center text-[var(--color-error)]"
                >
                  {t("error.generic") + ": "}
                  {error.message}
                </td>
              </tr>
            ) : items.length === 0 ? (
              // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements in DataTable
              <tr>
                {/* eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements in DataTable */}
                <td
                  colSpan={
                    normalizedColumns.length +
                    (selectable ? 1 : 0) +
                    (rowActions ? 1 : 0)
                  }
                  className="px-4 py-12"
                >
                  <EmptyState
                    icon={emptyIcon}
                    title={resolvedEmptyTitle}
                    description={resolvedEmptyDescription}
                    actionLabel={emptyAction?.label}
                    actionEvent={emptyAction?.event}
                  />
                </td>
              </tr>
            ) : (
              items.map((row, rowIndex) => (
                // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements in DataTable
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-[var(--color-table-border)] last:border-0 hover:bg-[var(--color-table-row-hover)] transition-colors",
                    selectedIds.includes(row.id) &&
                      "bg-[var(--color-primary)]/10 font-medium",
                    isRowClickable && "cursor-pointer",
                  )}
                  onClick={() => isRowClickable && handleRowClick(row)}
                >
                  {selectable && (
                    // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements in DataTable
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedIds.includes(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                      />
                    </td>
                  )}
                  {normalizedColumns.map((col) => {
                    const cellValue = getNestedValue(
                      row as Record<string, unknown>,
                      String(col.key),
                    );
                    return (
                      // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements in DataTable
                      <td
                        key={String(col.key)}
                        className="px-4 py-3 text-sm text-[var(--color-foreground)] whitespace-nowrap sm:whitespace-normal"
                      >
                        {col.render
                          ? col.render(cellValue, row, rowIndex)
                          : String(cellValue ?? "")}
                      </td>
                    );
                  })}
                  {rowActions && (
                    // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements in DataTable
                    <td className="px-4 py-3 relative">
                      <Button
                        variant="ghost"
                        className="p-1 rounded hover:bg-[var(--color-muted)]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionMenu(
                            openActionMenu === row.id ? null : row.id,
                          );
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4 text-[var(--color-muted-foreground)]" />
                      </Button>
                      {openActionMenu === row.id && (
                        <>
                          <Box
                            className="fixed inset-0 z-40"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionMenu(null);
                            }}
                          />
                          <VStack className="absolute right-0 mt-1 w-48 bg-[var(--color-card)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-[var(--color-border)] py-1 z-50">
                            {rowActions
                              .filter(
                                (action) => !action.show || action.show(row),
                              )
                              .map((action, idx) => (
                                <Button
                                  key={idx}
                                  variant="ghost"
                                  data-event={action.event}
                                  data-testid={
                                    action.event
                                      ? `action-${action.event}`
                                      : undefined
                                  }
                                  className={cn(
                                    "w-full flex items-center gap-2 px-4 py-2 text-sm",
                                    action.variant === "danger"
                                      ? "text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
                                      : "text-[var(--color-foreground)] hover:bg-[var(--color-muted)]",
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    action.onClick(row);
                                    setOpenActionMenu(null);
                                  }}
                                >
                                  {action.icon && (
                                    <action.icon className="h-4 w-4" />
                                  )}
                                  {action.label}
                                </Button>
                              ))}
                          </VStack>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Box>

      {/* Pagination (display-only — trait controls the state) */}
      {totalCount !== undefined && totalPages > 1 && (
        <Box className="px-4 py-3 border-t-2 border-[var(--color-border)]">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showTotal={showTotal}
            totalItems={total}
          />
        </Box>
      )}
    </Box>
  );
}

DataTable.displayName = "DataTable";
