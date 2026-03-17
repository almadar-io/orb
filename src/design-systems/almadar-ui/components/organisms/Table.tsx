'use client';
/**
 * Table Organism Component
 *
 * A dumb table component with header row, data rows, pagination, sorting, and search.
 * Emits events via useEventBus — never manages internal state for search, sort,
 * selection, or pagination. All state is owned by the trait state machine.
 *
 * Uses Pagination, SearchInput, ButtonGroup, Card, Menu molecules and Button, Icon, Checkbox, Typography, Badge, Divider atoms.
 */

import React from "react";
import { ArrowUp, ArrowDown, MoreVertical } from "lucide-react";
import { Pagination } from "../molecules/Pagination";
import { SearchInput } from "../molecules/SearchInput";
import { Card } from "../atoms/Card";
import { Menu, MenuItem } from "../molecules/Menu";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";
import { Checkbox } from "../atoms/Checkbox";
import { Typography } from "../atoms/Typography";
import { Box } from "../atoms/Box";
import { HStack } from "../atoms/Stack";
import { cn } from "../../lib/cn";
import { useTranslate } from "../../hooks/useTranslate";
import { useEventBus } from "../../hooks/useEventBus";
import type { EntityDisplayProps, EntityDisplayEvents } from "./types";

export type SortDirection = "asc" | "desc";

export interface TableColumn<T = any> {
  /**
   * Column key
   */
  key: string;

  /**
   * Column header label
   */
  label: string;

  /**
   * Sortable column
   * @default false
   */
  sortable?: boolean;

  /**
   * Custom cell renderer
   */
  render?: (value: any, row: T, index: number) => React.ReactNode;

  /**
   * Column width
   */
  width?: string;
}

export interface TableProps<T = Record<string, unknown>> extends EntityDisplayProps<T> {
  /**
   * Table columns
   */
  columns: TableColumn<T>[];

  /**
   * Enable row selection
   * @default false
   */
  selectable?: boolean;

  /**
   * Enable sorting
   * @default false
   */
  sortable?: boolean;

  /**
   * Current sort column (display hint, mapped from sortBy)
   */
  sortColumn?: string;

  /**
   * Current sort direction (display hint)
   */
  sortDirection?: SortDirection;

  /**
   * Enable search/filter
   * @default false
   */
  searchable?: boolean;

  /**
   * Search placeholder
   */
  searchPlaceholder?: string;

  /**
   * Enable pagination
   * @default false
   */
  paginated?: boolean;

  /**
   * Current page (display hint)
   */
  currentPage?: number;

  /**
   * Total pages (display hint)
   */
  totalPages?: number;

  /**
   * Row actions menu items
   */
  rowActions?: (row: T) => MenuItem[];

  /**
   * Empty state message
   */
  emptyMessage?: string;

  /**
   * Loading state
   * @default false
   */
  loading?: boolean;
}

export const Table = <T extends Record<string, any>>({
  columns,
  // EntityDisplayProps
  entity,
  className,
  isLoading,
  error,
  sortBy,
  sortDirection: entitySortDirection,
  searchValue,
  page,
  pageSize,
  totalCount,
  selectedIds,
  // Table-specific props
  selectable = false,
  sortable = false,
  sortColumn: sortColumnProp,
  sortDirection: sortDirectionProp,
  searchable = false,
  searchPlaceholder,
  paginated = false,
  currentPage: currentPageProp,
  totalPages: totalPagesProp,
  rowActions,
  emptyMessage,
  loading = false,
}: TableProps<T>) => {
  const { t } = useTranslate();
  const eventBus = useEventBus();
  const resolvedEmptyMessage = emptyMessage ?? t('empty.noData');
  const resolvedSearchPlaceholder = searchPlaceholder ?? t('common.search');

  // Resolve data from entity prop
  const resolvedData: T[] = Array.isArray(entity)
    ? (entity as T[])
    : [];

  // Resolve display hints — prefer explicit Table props, fall back to EntityDisplayProps
  const resolvedSortColumn = sortColumnProp ?? sortBy;
  const resolvedSortDirection = sortDirectionProp ?? (entitySortDirection as SortDirection) ?? undefined;
  const resolvedCurrentPage = currentPageProp ?? page ?? 1;
  const resolvedTotalPages = totalPagesProp ?? (totalCount && pageSize ? Math.ceil(totalCount / pageSize) : 1);
  const selectedRows: string[] = selectedIds ? selectedIds.map(String) : [];

  const handleSort = (column: string) => {
    if (!sortable) return;

    const newDirection: SortDirection | undefined =
      resolvedSortColumn === column && resolvedSortDirection === "asc"
        ? "desc"
        : resolvedSortColumn === column && resolvedSortDirection === "desc"
          ? undefined
          : "asc";

    if (newDirection) {
      eventBus.emit('UI:SORT', { field: column, direction: newDirection });
    } else {
      // Clear sort — reset to default ascending
      eventBus.emit('UI:SORT', { field: column, direction: 'asc' });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (!selectable) return;
    if (checked) {
      const allIds = resolvedData.map((row) => (row as Record<string, any>).id ?? '');
      eventBus.emit('UI:SELECT', { ids: allIds });
    } else {
      eventBus.emit('UI:DESELECT', { ids: selectedRows });
    }
  };

  const handleSelectRow = (rowKey: string, checked: boolean) => {
    if (!selectable) return;
    if (checked) {
      eventBus.emit('UI:SELECT', { ids: [rowKey] });
    } else {
      eventBus.emit('UI:DESELECT', { ids: [rowKey] });
    }
  };

  const handlePageChange = (newPage: number) => {
    eventBus.emit('UI:PAGINATE', { page: newPage });
  };

  const handleSearch = (query: string) => {
    eventBus.emit('UI:SEARCH', { query });
  };

  const allSelected =
    selectable &&
    resolvedData.length > 0 &&
    resolvedData.every((row) =>
      selectedRows.includes(String((row as Record<string, any>).id)),
    );

  return (
    <Box className={cn("w-full", className)}>
      {/* Search */}
      {searchable && (
        <Box className="mb-4">
          <SearchInput
            placeholder={resolvedSearchPlaceholder}
            onSearch={handleSearch}
            className="max-w-md"
          />
        </Box>
      )}

      {/* Table */}
      <Card>
        <Box className="overflow-x-auto">
          {/* eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements needed */}
          <table className="w-full">
            {/* eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements needed */}
            <thead>
              {/* eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements needed */}
              <tr className="border-b-[length:var(--border-width)] border-[var(--color-table-border)]">
                {selectable && (
                  // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements needed
                  <th className="px-4 py-3 text-left bg-[var(--color-table-header)]">
                    <Checkbox
                      checked={allSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                )}
                {columns.map((column) => (
                  // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements needed
                  <th
                    key={column.key}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-bold text-[var(--color-foreground)] uppercase tracking-wider bg-[var(--color-table-header)]",
                      sortable &&
                        column.sortable &&
                        "cursor-pointer hover:bg-[var(--color-table-row-hover)]",
                    )}
                    style={{ width: column.width }}
                    // eslint-disable-next-line almadar/require-event-bus -- native th element; handleSort already emits UI:SORT via eventBus
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <HStack className="flex items-center gap-2">
                      <Typography variant="small" weight="semibold">
                        {column.label}
                      </Typography>
                      {sortable &&
                        column.sortable &&
                        resolvedSortColumn === column.key && (
                          <Icon
                            icon={resolvedSortDirection === "asc" ? ArrowUp : ArrowDown}
                            size="sm"
                          />
                        )}
                    </HStack>
                  </th>
                ))}
                {rowActions && (
                  // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements needed
                  <th className="px-4 py-3 text-right">Actions</th>
                )}
              </tr>
            </thead>
            {/* eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements needed */}
            <tbody>
              {loading || isLoading ? (
                // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements needed
                <tr>
                  {/* eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements needed */}
                  <td
                    colSpan={
                      columns.length +
                      (selectable ? 1 : 0) +
                      (rowActions ? 1 : 0)
                    }
                    className="px-4 py-8 text-center"
                  >
                    <Typography variant="body" color="secondary">
                      {t('common.loading')}
                    </Typography>
                  </td>
                </tr>
              ) : resolvedData.length === 0 ? (
                // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements needed
                <tr>
                  {/* eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements needed */}
                  <td
                    colSpan={
                      columns.length +
                      (selectable ? 1 : 0) +
                      (rowActions ? 1 : 0)
                    }
                    className="px-4 py-8 text-center"
                  >
                    <Typography variant="body" color="secondary">
                      {resolvedEmptyMessage}
                    </Typography>
                  </td>
                </tr>
              ) : (
                resolvedData.map((row, index) => {
                  const rowKey = String((row as Record<string, any>).id ?? index);
                  const isSelected = selectedRows.includes(rowKey);
                  return (
                    // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements needed
                    <tr
                      key={rowKey}
                      className={cn(
                        "border-b border-[var(--color-table-border)] last:border-b-0",
                        "hover:bg-[var(--color-table-row-hover)]",
                        isSelected &&
                          "bg-[var(--color-table-header)] font-medium",
                      )}
                    >
                      {selectable && (
                        // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements needed
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) =>
                              handleSelectRow(rowKey, e.target.checked)
                            }
                          />
                        </td>
                      )}
                      {columns.map((column) => (
                        // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements needed
                        <td key={column.key} className="px-4 py-3">
                          {column.render ? (
                            column.render(row[column.key], row, index)
                          ) : (
                            <Typography variant="body">
                              {row[column.key]?.toString() || "-"}
                            </Typography>
                          )}
                        </td>
                      ))}
                      {rowActions && (
                        // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements needed
                        <td className="px-4 py-3 text-right">
                          <Menu
                            trigger={
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={MoreVertical}
                              >
                                Actions
                              </Button>
                            }
                            items={rowActions(row)}
                            position="bottom-right"
                          />
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </Box>
      </Card>

      {/* Pagination */}
      {paginated && resolvedTotalPages > 1 && (
        <Box className="mt-4">
          <Pagination
            currentPage={resolvedCurrentPage}
            totalPages={resolvedTotalPages}
            onPageChange={handlePageChange}
          />
        </Box>
      )}
    </Box>
  );
};

Table.displayName = "Table";
