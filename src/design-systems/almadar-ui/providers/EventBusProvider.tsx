'use client';
/**
 * EventBusProvider - React context provider for the event bus
 *
 * Provides a page-scoped event bus for trait communication.
 * Each page has its own event bus instance.
 *
 * NOTE: Selection state has been moved to SelectionProvider.
 * Use SelectionProvider for tracking selected entities.
 *
 * @packageDocumentation
 */

import React, { createContext, useCallback, useRef, useMemo, useEffect, type ReactNode } from 'react';
import type { KFlowEvent, EventListener, Unsubscribe, EventBusContextType } from '../hooks/event-bus-types';
import { setGlobalEventBus } from '../hooks/useEventBus';

// ============================================================================
// Context
// ============================================================================

/**
 * Extended context type for backward compatibility.
 *
 * @deprecated getSelectedEntity and clearSelectedEntity are deprecated.
 * Use SelectionProvider and useSelection hook instead.
 */
export interface EventBusContextTypeExtended extends EventBusContextType {
  /**
   * @deprecated Use useSelection from SelectionProvider instead.
   * This method now returns null - selection state moved to SelectionProvider.
   */
  getSelectedEntity: () => unknown | null;
  /**
   * @deprecated Use useSelection from SelectionProvider instead.
   * This method is now a no-op - selection state moved to SelectionProvider.
   */
  clearSelectedEntity: () => void;
}

export const EventBusContext = createContext<EventBusContextTypeExtended | null>(null);

// ============================================================================
// Provider Component
// ============================================================================

interface EventBusProviderProps {
  children: ReactNode;
  /** Enable debug logging in development */
  debug?: boolean;
}

/**
 * Provider component for the page event bus.
 *
 * This is a pure pub/sub event bus. For selection state,
 * use SelectionProvider which listens to events and maintains state.
 *
 * @example
 * ```tsx
 * function TaskDetailPage() {
 *   return (
 *     <EventBusProvider debug={process.env.NODE_ENV === 'development'}>
 *       <SelectionProvider>
 *         <TaskHeader />
 *         <TaskForm />
 *         <TaskActions />
 *       </SelectionProvider>
 *     </EventBusProvider>
 *   );
 * }
 * ```
 */
export function EventBusProvider({ children, debug = false }: EventBusProviderProps) {
  // Store listeners by event type
  const listenersRef = useRef<Map<string, Set<EventListener>>>(new Map());

  // Store wildcard listeners (onAny)
  const anyListenersRef = useRef<Set<EventListener>>(new Set());

  // Track if deprecation warning has been shown
  const deprecationWarningShown = useRef(false);

  /**
   * @deprecated Use useSelection from SelectionProvider instead.
   */
  const getSelectedEntity = useCallback(() => {
    if (!deprecationWarningShown.current) {
      console.warn(
        '[EventBus] getSelectedEntity is deprecated. ' +
        'Use SelectionProvider and useSelection hook instead. ' +
        'See SelectionProvider.tsx for migration guide.'
      );
      deprecationWarningShown.current = true;
    }
    return null;
  }, []);

  /**
   * @deprecated Use useSelection from SelectionProvider instead.
   */
  const clearSelectedEntity = useCallback(() => {
    if (!deprecationWarningShown.current) {
      console.warn(
        '[EventBus] clearSelectedEntity is deprecated. ' +
        'Use SelectionProvider and useSelection hook instead. ' +
        'See SelectionProvider.tsx for migration guide.'
      );
      deprecationWarningShown.current = true;
    }
  }, []);

  /**
   * Emit an event to all listeners of that type.
   */
  const emit = useCallback((type: string, payload?: Record<string, unknown>) => {
    const event: KFlowEvent = {
      type,
      payload,
      timestamp: Date.now(),
    };

    const listeners = listenersRef.current.get(type);
    const listenerCount = listeners?.size ?? 0;

    if (debug) {
      if (listenerCount > 0) {
        console.log(`[EventBus] Emit: ${type} → ${listenerCount} listener(s)`, payload);
      } else {
        console.warn(`[EventBus] Emit: ${type} (NO LISTENERS - event may be lost!)`, payload);
      }
    }

    if (listeners) {
      // Create a copy to avoid issues if listener modifies the set
      const listenersCopy = Array.from(listeners);
      for (const listener of listenersCopy) {
        try {
          listener(event);
        } catch (error) {
          console.error(`[EventBus] Error in listener for '${type}':`, error);
        }
      }
    }

    // Notify wildcard (onAny) listeners
    const anyListeners = Array.from(anyListenersRef.current);
    for (const listener of anyListeners) {
      try {
        listener(event);
      } catch (error) {
        console.error(`[EventBus] Error in onAny listener for '${type}':`, error);
      }
    }
  }, [debug]);

  /**
   * Subscribe to an event type.
   * Returns an unsubscribe function.
   */
  const on = useCallback((type: string, listener: EventListener): Unsubscribe => {
    if (!listenersRef.current.has(type)) {
      listenersRef.current.set(type, new Set());
    }

    const listeners = listenersRef.current.get(type)!;
    listeners.add(listener);

    if (debug) {
      console.log(`[EventBus] Subscribed to '${type}', total: ${listeners.size}`);
    }

    // Return unsubscribe function
    return () => {
      listeners.delete(listener);
      if (debug) {
        console.log(`[EventBus] Unsubscribed from '${type}', remaining: ${listeners.size}`);
      }
      // Clean up empty sets
      if (listeners.size === 0) {
        listenersRef.current.delete(type);
      }
    };
  }, [debug]);

  /**
   * Subscribe to an event type, but only fire once.
   */
  const once = useCallback((type: string, listener: EventListener): Unsubscribe => {
    const wrappedListener: EventListener = (event) => {
      // Remove self before calling listener
      listenersRef.current.get(type)?.delete(wrappedListener);
      listener(event);
    };

    return on(type, wrappedListener);
  }, [on]);

  /**
   * Check if there are any listeners for an event type.
   */
  const hasListeners = useCallback((type: string): boolean => {
    const listeners = listenersRef.current.get(type);
    return listeners !== undefined && listeners.size > 0;
  }, []);

  /**
   * Subscribe to ALL events regardless of type.
   */
  const onAny = useCallback((listener: EventListener): Unsubscribe => {
    anyListenersRef.current.add(listener);

    if (debug) {
      console.log(`[EventBus] onAny subscribed, total: ${anyListenersRef.current.size}`);
    }

    return () => {
      anyListenersRef.current.delete(listener);
      if (debug) {
        console.log(`[EventBus] onAny unsubscribed, remaining: ${anyListenersRef.current.size}`);
      }
    };
  }, [debug]);

  // Memoize context value
  const contextValue = useMemo(
    () => ({
      emit,
      on,
      once,
      hasListeners,
      onAny,
      getSelectedEntity,
      clearSelectedEntity,
    }),
    [emit, on, once, hasListeners, onAny, getSelectedEntity, clearSelectedEntity]
  );

  // Bridge to global event bus system.
  // Components in other packages (like shell components) use their own useEventBus hook
  // which checks for a global event bus. Setting it here allows shell components to
  // emit events to the same bus that the main app's trait state machine listens to.
  useEffect(() => {
    setGlobalEventBus(contextValue);
    return () => {
      setGlobalEventBus(null);
    };
  }, [contextValue]);

  return (
    <EventBusContext.Provider value={contextValue}>
      {children}
    </EventBusContext.Provider>
  );
}

export type { EventBusContextType };
