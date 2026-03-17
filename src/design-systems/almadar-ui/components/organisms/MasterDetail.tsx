'use client';
/* eslint-disable almadar/require-closed-circuit-props, almadar/organism-extends-entity-display, almadar/require-translate */
/**
 * MasterDetail Component
 *
 * A layout pattern that shows a list/table of entities.
 * This is a thin wrapper around DataTable that accepts master-detail specific props.
 *
 * The `entity` prop carries the data array (injected by the runtime).
 * The "detail" part is typically rendered separately via another render_ui effect
 * to a sidebar or detail panel when an item is selected.
 */

import React from 'react';
import { DataTable, type DataTableProps } from './DataTable';
import type { EntityDisplayProps } from './types';

export interface MasterDetailProps<T extends { id: string | number } = { id: string | number }> extends EntityDisplayProps<T> {
  /** Fields to show in the master list (maps to DataTable columns) */
  masterFields?: readonly string[];
  /** Fields for detail view (passed through but typically handled by separate render_ui) */
  detailFields?: readonly string[];
  /** Loading state (alias for isLoading) */
  loading?: boolean;
}

export function MasterDetail<T extends { id: string | number }>({
  entity,
  masterFields = [],
  detailFields: _detailFields, // Captured but not used here - detail handled separately
  loading: externalLoading,
  isLoading: externalIsLoading,
  error: externalError,
  className,
  ...rest
}: MasterDetailProps<T>): React.ReactElement {
  const loading = externalLoading ?? false;
  const isLoading = externalIsLoading ?? false;
  const error = externalError ?? null;

  return (
    <DataTable<T>
      columns={masterFields}
      entity={entity}
      isLoading={loading || isLoading}
      error={error}
      className={className}
      emptyTitle="No items found"
      emptyDescription="Create your first item to get started."
      {...(rest as Partial<DataTableProps<T>>)}
    />
  );
}

MasterDetail.displayName = 'MasterDetail';

export default MasterDetail;
