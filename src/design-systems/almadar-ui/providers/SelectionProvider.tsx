'use client';
/**
 * SelectionProvider - Manages selected entity state
 *
 * Separates selection state from the EventBusProvider to maintain
 * clean architecture (event bus stays pure pub/sub).
 *
 * This provider:
 * - Listens to UI:VIEW and UI:SELECT events to track selected entity
 * - Listens to UI:CLOSE, UI:DESELECT, UI:CANCEL to clear selection
 * - Provides the selected entity to any component that needs it
 *
 * @packageDocumentation
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useEventBus, type KFlowEvent } from '../hooks/useEventBus';

// ============================================================================
// Types
// ============================================================================

export interface SelectionContextType<T = unknown> {
  /** The currently selected entity */
  selected: T | null;
  /** Manually set the selected entity */
  setSelected: (entity: T | null) => void;
  /** Clear the selection */
  clearSelection: () => void;
  /** Check if an entity is selected */
  isSelected: (entity: T) => boolean;
}

// ============================================================================
// Context
// ============================================================================

const SelectionContext = createContext<SelectionContextType | null>(null);

// ============================================================================
// Provider
// ============================================================================

interface SelectionProviderProps {
  children: ReactNode;
  /** Enable debug logging */
  debug?: boolean;
  /** Custom comparison function for isSelected */
  compareEntities?: (a: unknown, b: unknown) => boolean;
}

/**
 * Default entity comparison - compares by id field
 */
const defaultCompareEntities = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  if (typeof a === 'object' && typeof b === 'object') {
    const aId = (a as Record<string, unknown>).id;
    const bId = (b as Record<string, unknown>).id;
    return aId !== undefined && aId === bId;
  }
  return false;
};

/**
 * Provider component for selection state.
 *
 * Must be used within an EventBusProvider.
 *
 * @example
 * ```tsx
 * function OrderListPage() {
 *   return (
 *     <EventBusProvider>
 *       <SelectionProvider debug={process.env.NODE_ENV === 'development'}>
 *         <OrderTable />
 *         <OrderDetailDrawer />
 *       </SelectionProvider>
 *     </EventBusProvider>
 *   );
 * }
 * ```
 */
export function SelectionProvider({
  children,
  debug = false,
  compareEntities = defaultCompareEntities,
}: SelectionProviderProps) {
  const eventBus = useEventBus();
  const [selected, setSelectedState] = useState<unknown | null>(null);

  /**
   * Set the selected entity
   */
  const setSelected = useCallback(
    (entity: unknown | null) => {
      setSelectedState(entity);
      if (debug) {
        console.log('[SelectionProvider] Selection set:', entity);
      }
    },
    [debug]
  );

  /**
   * Clear the selection
   */
  const clearSelection = useCallback(() => {
    setSelectedState(null);
    if (debug) {
      console.log('[SelectionProvider] Selection cleared');
    }
  }, [debug]);

  /**
   * Check if an entity is selected
   */
  const isSelected = useCallback(
    (entity: unknown): boolean => {
      return compareEntities(selected, entity);
    },
    [selected, compareEntities]
  );

  /**
   * Listen to event bus for selection events
   */
  useEffect(() => {
    // Handle selection events
    const handleSelect = (event: KFlowEvent) => {
      const row = event.payload?.row;
      if (row) {
        setSelected(row);
        if (debug) {
          console.log(`[SelectionProvider] ${event.type} received:`, row);
        }
      }
    };

    // Handle deselection events
    const handleDeselect = (event: KFlowEvent) => {
      clearSelection();
      if (debug) {
        console.log(`[SelectionProvider] ${event.type} received - clearing selection`);
      }
    };

    // Subscribe to selection events
    const unsubView = eventBus.on('UI:VIEW', handleSelect);
    const unsubSelect = eventBus.on('UI:SELECT', handleSelect);

    // Subscribe to deselection events
    const unsubClose = eventBus.on('UI:CLOSE', handleDeselect);
    const unsubDeselect = eventBus.on('UI:DESELECT', handleDeselect);
    const unsubCancel = eventBus.on('UI:CANCEL', handleDeselect);

    return () => {
      unsubView();
      unsubSelect();
      unsubClose();
      unsubDeselect();
      unsubCancel();
    };
  }, [eventBus, setSelected, clearSelection, debug]);

  const contextValue: SelectionContextType = {
    selected,
    setSelected,
    clearSelection,
    isSelected,
  };

  return (
    <SelectionContext.Provider value={contextValue}>
      {children}
    </SelectionContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access selection state.
 *
 * @throws Error if used outside SelectionProvider
 *
 * @example
 * ```tsx
 * function OrderDetailDrawer() {
 *   const { selected, clearSelection } = useSelection<Order>();
 *
 *   if (!selected) return null;
 *
 *   return (
 *     <Drawer onClose={clearSelection}>
 *       <OrderDetail order={selected} />
 *     </Drawer>
 *   );
 * }
 * ```
 */
export function useSelection<T = unknown>(): SelectionContextType<T> {
  const context = useContext(SelectionContext);

  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }

  return context as SelectionContextType<T>;
}

/**
 * Hook to access selection state with fallback for components
 * that may be used outside SelectionProvider.
 *
 * Returns null if no SelectionProvider is found.
 */
export function useSelectionOptional<T = unknown>(): SelectionContextType<T> | null {
  const context = useContext(SelectionContext);
  return context as SelectionContextType<T> | null;
}

export { SelectionContext };
