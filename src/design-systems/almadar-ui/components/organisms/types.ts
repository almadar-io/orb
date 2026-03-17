/**
 * Shared types for entity-display organisms.
 *
 * All entity-display organisms (DataTable, List, Table, CardGrid, DetailPanel)
 * extend EntityDisplayProps to guarantee a uniform prop contract.
 *
 * Exception: Form manages local `formData` state for field input tracking.
 * This is the ONE allowed exception — documented here.
 */

// ── Event Name Constants ──────────────────────────────────────────────

export const EntityDisplayEvents = {
  SORT: 'SORT',
  PAGINATE: 'PAGINATE',
  SEARCH: 'SEARCH',
  FILTER: 'FILTER',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  SELECT: 'SELECT',
  DESELECT: 'DESELECT',
} as const;

// ── Event Payloads ────────────────────────────────────────────────────

export interface SortPayload {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginatePayload {
  page: number;
  pageSize?: number;
}

export interface SearchPayload {
  query: string;
}

export interface FilterPayload {
  field: string;
  operator: string;
  value: unknown;
}

export interface SelectPayload {
  ids: (string | number)[];
}

// ── Base Props ────────────────────────────────────────────────────────

export interface EntityDisplayProps<T = unknown> {
  /** Entity name (string) or data injected by the runtime (array for lists, single object for detail) */
  entity?: string | T | readonly T[];
  /** Additional CSS classes */
  className?: string;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;

  // ── Display hints (set by trait via render-ui, never written by organism) ──

  /** Current sort field */
  sortBy?: string;
  /** Current sort direction */
  sortDirection?: 'asc' | 'desc';
  /** Current search query value */
  searchValue?: string;
  /** Current page number (1-indexed) */
  page?: number;
  /** Number of items per page */
  pageSize?: number;
  /** Total number of items (for pagination display) */
  totalCount?: number;
  /** Active filters */
  activeFilters?: Record<string, unknown>;
  /** Currently selected item IDs */
  selectedIds?: readonly (string | number)[];
}
