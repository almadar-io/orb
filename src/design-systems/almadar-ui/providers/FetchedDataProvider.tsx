'use client';
/**
 * FetchedDataProvider
 *
 * Provides server-fetched entity data to the client runtime.
 * This context stores data returned from compiled event handlers
 * via the `data` field in EventResponse.
 *
 * Data Flow:
 * 1. Client sends event to server
 * 2. Server executes compiled handler with fetch effects
 * 3. Server returns { data: { EntityName: [...records] }, clientEffects: [...] }
 * 4. Provider stores data in this context
 * 5. Pattern components access data via useFetchedData hook
 *
 * Used by both Builder preview and compiled shell.
 *
 * @packageDocumentation
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface EntityRecord {
  id: string;
  [key: string]: unknown;
}

export interface FetchedDataState {
  /** Entity data by entity name (e.g., { Task: [...], User: [...] }) */
  data: Record<string, EntityRecord[]>;
  /** Timestamp of last fetch per entity */
  fetchedAt: Record<string, number>;
  /** Whether data is currently being fetched */
  loading: boolean;
  /** Last error message */
  error: string | null;
}

export interface FetchedDataContextValue {
  /** Get all records for an entity */
  getData: (entityName: string) => EntityRecord[];
  /** Get a single record by ID */
  getById: (entityName: string, id: string) => EntityRecord | undefined;
  /** Check if entity data exists */
  hasData: (entityName: string) => boolean;
  /** Get fetch timestamp for entity */
  getFetchedAt: (entityName: string) => number | undefined;
  /** Update data from server response */
  setData: (data: Record<string, unknown[]>) => void;
  /** Clear all fetched data */
  clearData: () => void;
  /** Clear data for specific entity */
  clearEntity: (entityName: string) => void;
  /** Current loading state */
  loading: boolean;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  /** Current error */
  error: string | null;
  /** Set error */
  setError: (error: string | null) => void;
}

// ============================================================================
// Context
// ============================================================================

export const FetchedDataContext = createContext<FetchedDataContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

export interface FetchedDataProviderProps {
  /** Initial data (optional) */
  initialData?: Record<string, unknown[]>;
  /** Children */
  children: React.ReactNode;
}

/**
 * FetchedDataProvider - Provides server-fetched entity data
 *
 * @example
 * ```tsx
 * <FetchedDataProvider>
 *   <OrbitalProvider>
 *     <App />
 *   </OrbitalProvider>
 * </FetchedDataProvider>
 * ```
 */
export function FetchedDataProvider({
  initialData,
  children,
}: FetchedDataProviderProps): React.ReactElement {
  const [state, setState] = useState<FetchedDataState>(() => ({
    data: (initialData as Record<string, EntityRecord[]>) || {},
    fetchedAt: {},
    loading: false,
    error: null,
  }));

  const getData = useCallback(
    (entityName: string): EntityRecord[] => {
      return state.data[entityName] || [];
    },
    [state.data]
  );

  const getById = useCallback(
    (entityName: string, id: string): EntityRecord | undefined => {
      const records = state.data[entityName];
      return records?.find((r) => r.id === id);
    },
    [state.data]
  );

  const hasData = useCallback(
    (entityName: string): boolean => {
      return entityName in state.data && state.data[entityName].length > 0;
    },
    [state.data]
  );

  const getFetchedAt = useCallback(
    (entityName: string): number | undefined => {
      return state.fetchedAt[entityName];
    },
    [state.fetchedAt]
  );

  const setData = useCallback((data: Record<string, unknown[]>): void => {
    const now = Date.now();
    setState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        ...(data as Record<string, EntityRecord[]>),
      },
      fetchedAt: {
        ...prev.fetchedAt,
        ...Object.keys(data).reduce(
          (acc, key) => ({ ...acc, [key]: now }),
          {}
        ),
      },
      loading: false,
      error: null,
    }));
  }, []);

  const clearData = useCallback((): void => {
    setState((prev) => ({
      ...prev,
      data: {},
      fetchedAt: {},
    }));
  }, []);

  const clearEntity = useCallback((entityName: string): void => {
    setState((prev) => {
      const newData = { ...prev.data };
      const newFetchedAt = { ...prev.fetchedAt };
      delete newData[entityName];
      delete newFetchedAt[entityName];
      return {
        ...prev,
        data: newData,
        fetchedAt: newFetchedAt,
      };
    });
  }, []);

  const setLoading = useCallback((loading: boolean): void => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null): void => {
    setState((prev) => ({ ...prev, error, loading: false }));
  }, []);

  const contextValue = useMemo<FetchedDataContextValue>(
    () => ({
      getData,
      getById,
      hasData,
      getFetchedAt,
      setData,
      clearData,
      clearEntity,
      loading: state.loading,
      setLoading,
      error: state.error,
      setError,
    }),
    [
      getData,
      getById,
      hasData,
      getFetchedAt,
      setData,
      clearData,
      clearEntity,
      state.loading,
      setLoading,
      state.error,
      setError,
    ]
  );

  return (
    <FetchedDataContext.Provider value={contextValue}>
      {children}
    </FetchedDataContext.Provider>
  );
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Access the fetched data context.
 * Returns null if not within a FetchedDataProvider.
 */
export function useFetchedDataContext(): FetchedDataContextValue | null {
  return useContext(FetchedDataContext);
}

/**
 * Access fetched data with fallback behavior.
 * If not in a provider, returns empty data.
 */
export function useFetchedData(): FetchedDataContextValue {
  const context = useContext(FetchedDataContext);
  if (!context) {
    // Return a no-op implementation when not wrapped in provider
    return {
      getData: () => [],
      getById: () => undefined,
      hasData: () => false,
      getFetchedAt: () => undefined,
      setData: () => {},
      clearData: () => {},
      clearEntity: () => {},
      loading: false,
      setLoading: () => {},
      error: null,
      setError: () => {},
    };
  }
  return context;
}

/**
 * Access fetched data for a specific entity.
 * Provides a convenient API for entity-specific operations.
 */
export function useFetchedEntity(entityName: string) {
  const context = useFetchedData();

  return {
    /** All fetched records for this entity */
    records: context.getData(entityName),
    /** Get a record by ID */
    getById: (id: string) => context.getById(entityName, id),
    /** Whether data has been fetched for this entity */
    hasData: context.hasData(entityName),
    /** When data was last fetched */
    fetchedAt: context.getFetchedAt(entityName),
    /** Whether data is loading */
    loading: context.loading,
    /** Current error */
    error: context.error,
  };
}
