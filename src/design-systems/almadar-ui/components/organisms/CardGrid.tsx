'use client';
/**
 * CardGrid Component
 *
 * A dumb, responsive grid specifically designed for card layouts.
 * Uses CSS Grid auto-fit for automatic responsive columns.
 *
 * Data comes exclusively from the `entity` prop (injected by the runtime).
 * All user interactions emit events via useEventBus — never manages internal state
 * for pagination, filtering, or search. All state is owned by the trait state machine.
 */
import React from 'react';
import { cn } from '../../lib/cn';
import { getNestedValue } from '../../lib/getNestedValue';
import { useEventBus } from '../../hooks/useEventBus';
import { Button } from '../atoms';
import { Box } from '../atoms/Box';
import { Typography } from '../atoms/Typography';
import { VStack, HStack } from '../atoms/Stack';
import { Pagination } from '../molecules/Pagination';
import type { EntityDisplayProps } from './types';

export type CardGridGap = 'none' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Action configuration for card items (schema-driven)
 */
export interface CardItemAction {
  /** Action button label */
  label: string;
  /** Event to dispatch on click (schema metadata) */
  event?: string;
  /** Navigation URL - supports template interpolation like "/products/{{row.id}}" */
  navigatesTo?: string;
  /** Callback on click */
  onClick?: (item: unknown) => void;
  /** Action used by generated code - alternative to event */
  action?: string;
  /** Action placement - accepts string for compatibility with generated code */
  placement?: 'card' | 'footer' | 'row' | string;
  /** Button variant - accepts string for compatibility with generated code */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | string;
}

/**
 * Field definition - can be a simple string or object with key/header
 */
export type FieldDef = string | { key: string; header?: string };

/**
 * Normalize fields to simple string array
 */
function normalizeFields(fields: readonly FieldDef[] | undefined): string[] {
  if (!fields) return [];
  return fields.map((f) => (typeof f === 'string' ? f : f.key));
}

export interface CardGridProps extends EntityDisplayProps {
  /** Minimum width of each card (default: 280px) */
  minCardWidth?: number;
  /** Maximum number of columns */
  maxCols?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Gap between cards */
  gap?: CardGridGap;
  /** Align cards vertically in their cells */
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  /** Children elements (cards) - optional when using entity prop */
  children?: React.ReactNode;
  /** Fields to display - accepts string[] or {key, header}[] for unified interface */
  fields?: readonly FieldDef[];
  /** Alias for fields - backwards compatibility */
  fieldNames?: readonly string[];
  /** Alias for fields - backwards compatibility */
  columns?: readonly FieldDef[];
  /** Actions for each card item (schema-driven) */
  itemActions?: readonly CardItemAction[];
  /** Show total count in pagination */
  showTotal?: boolean;
}

const gapStyles: Record<CardGridGap, string> = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

const alignStyles = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

/**
 * CardGrid - Responsive card collection layout
 *
 * Can be used in two ways:
 * 1. With children: <CardGrid><Card>...</Card></CardGrid>
 * 2. With entity data: <CardGrid entity={tasks} fieldNames={['title']} />
 *
 * All data comes from the `entity` prop. Pagination display hints come from
 * `page`, `pageSize`, and `totalCount` props (set by the trait via render-ui).
 */
export const CardGrid: React.FC<CardGridProps> = ({
  minCardWidth = 280,
  maxCols,
  gap = 'md',
  alignItems = 'stretch',
  className,
  children,
  // EntityDisplayProps
  entity,
  isLoading = false,
  error = null,
  page,
  pageSize,
  totalCount,
  // CardGrid-specific
  fields,
  fieldNames,
  columns,
  itemActions,
  showTotal = true,
}) => {
  const eventBus = useEventBus();

  // Support fields, fieldNames, and columns (aliases) - normalize to string[]
  const effectiveFieldNames =
    normalizeFields(fields).length > 0
      ? normalizeFields(fields)
      : (fieldNames ?? normalizeFields(columns));

  // Build the grid-template-columns value
  const gridTemplateColumns = `repeat(auto-fit, minmax(min(${minCardWidth}px, 100%), 1fr))`;

  // Normalize entity data to array
  const normalizedData = Array.isArray(entity) ? entity : entity ? [entity] : [];

  // Compute pagination display hints from EntityDisplayProps
  const resolvedPage = page ?? 1;
  const resolvedTotalPages = totalCount && pageSize ? Math.ceil(totalCount / pageSize) : 1;

  // Handle page change — emit event, trait owns the state
  const handlePageChange = (newPage: number) => {
    eventBus.emit('UI:PAGINATE', { page: newPage, pageSize });
  };

  // Handle card click — emit UI:VIEW event
  const handleCardClick = (itemData: Record<string, unknown>) => {
    eventBus.emit('UI:VIEW', { row: itemData });
  };

  // Render data-bound cards if data is provided
  const renderContent = () => {
    if (children) {
      return children;
    }

    // Show loading state
    if (isLoading) {
      return (
        <Box className="col-span-full text-center py-8 text-[var(--color-muted-foreground)]">
          <Typography variant="body" color="secondary">Loading items...</Typography>
        </Box>
      );
    }

    // Show error state
    if (error) {
      return (
        <Box className="col-span-full text-center py-8 text-[var(--color-error)]">
          <Typography variant="body" color="error">Error loading items: {error.message}</Typography>
        </Box>
      );
    }

    if (normalizedData.length === 0) {
      return (
        <Box className="col-span-full text-center py-8 text-[var(--color-muted-foreground)]">
          <Typography variant="body" color="secondary">No items found</Typography>
        </Box>
      );
    }

    return normalizedData.map((item, index) => {
      const itemData = item as Record<string, unknown>;
      const id = (itemData.id as string) || String(index);
      const cardFields = effectiveFieldNames || Object.keys(itemData).slice(0, 3);

      // Handle action click - navigate, dispatch event, or call callback
      const handleActionClick = (action: CardItemAction) => (e: React.MouseEvent) => {
        e.stopPropagation();

        // Handle navigation with template interpolation
        if (action.navigatesTo) {
          const url = action.navigatesTo.replace(/\{\{row\.(\w+(?:\.\w+)*)\}\}/g, (_, field) => {
            const value = getNestedValue(itemData, field);
            return value !== undefined && value !== null ? String(value) : '';
          });
          eventBus.emit('UI:NAVIGATE', { url, row: itemData });
          return;
        }

        if (action.event) {
          eventBus.emit(`UI:${action.event}`, { row: itemData });
        }
        if (action.onClick) {
          action.onClick(itemData);
        }
      };

      return (
        <Box
          key={id}
          className={cn(
            'bg-[var(--color-card)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4 shadow-[var(--shadow-sm)]',
            'cursor-pointer hover:border-[var(--color-primary)] transition-colors'
          )}
          onClick={() => handleCardClick(itemData)}
        >
          {cardFields.map((field) => {
            const value = getNestedValue(itemData, field);
            if (value === undefined || value === null) return null;
            return (
              <Box key={field} className="mb-2 last:mb-0">
                <Typography variant="caption" color="secondary" className="uppercase">
                  {field}
                </Typography>
                <Typography variant="small">{String(value)}</Typography>
              </Box>
            );
          })}
          {/* Item Actions */}
          {itemActions && itemActions.length > 0 && (
            <HStack gap="sm" className="mt-3 pt-3 border-t border-[var(--color-border)]">
              {itemActions.map((action, actionIdx) => {
                // Cast variant to Button's expected type, defaulting to 'secondary'
                const buttonVariant = (action.variant || 'secondary') as
                  | 'primary'
                  | 'secondary'
                  | 'ghost'
                  | 'danger'
                  | 'success'
                  | 'warning';
                return (
                  <Button
                    key={actionIdx}
                    variant={buttonVariant}
                    size="sm"
                    onClick={handleActionClick(action)}
                  >
                    {action.label}
                  </Button>
                );
              })}
            </HStack>
          )}
        </Box>
      );
    });
  };

  return (
    <VStack gap="md">
      <Box
        className={cn(
          'grid',
          gapStyles[gap],
          alignStyles[alignItems],
          maxCols === 1 && 'grid-cols-1',
          maxCols === 2 && 'sm:grid-cols-2',
          maxCols === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
          maxCols === 4 && 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
          maxCols === 5 && 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
          maxCols === 6 && 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
          className
        )}
        style={!maxCols ? { gridTemplateColumns } : undefined}
      >
        {renderContent()}
      </Box>

      {/* Pagination controls — displayed when trait provides pagination hints */}
      {totalCount !== undefined && pageSize !== undefined && resolvedTotalPages > 1 && (
        <Pagination
          currentPage={resolvedPage}
          totalPages={resolvedTotalPages}
          onPageChange={handlePageChange}
          showTotal={showTotal}
          totalItems={totalCount}
        />
      )}
    </VStack>
  );
};

CardGrid.displayName = 'CardGrid';
