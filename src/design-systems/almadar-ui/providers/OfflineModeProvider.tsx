'use client';
/**
 * OfflineModeProvider
 *
 * Context provider that wraps useOfflineExecutor with force-offline toggle support.
 * Enables testing offline behavior without actually disconnecting.
 *
 * @packageDocumentation
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  useOfflineExecutor,
  type UseOfflineExecutorOptions,
  type UseOfflineExecutorResult,
  type OfflineExecutorState,
} from '../renderer/offline-executor';

// ============================================================================
// Types
// ============================================================================

export interface OfflineModeContextValue extends UseOfflineExecutorResult {
  /** Force offline mode for testing */
  forceOffline: boolean;
  /** Toggle force offline mode */
  setForceOffline: (value: boolean) => void;
  /** Whether effectively offline (real or forced) */
  effectivelyOffline: boolean;
}

export interface OfflineModeProviderProps extends UseOfflineExecutorOptions {
  children: React.ReactNode;
}

// ============================================================================
// Context
// ============================================================================

const OfflineModeContext = createContext<OfflineModeContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

/**
 * OfflineModeProvider - Wraps offline executor with force-offline support.
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <OfflineModeProvider
 *       serverUrl="/api/orbitals"
 *       authToken={token}
 *       autoSync={true}
 *       renderToSlot={slotManager.render}
 *       navigate={router.push}
 *       notify={toast.show}
 *       eventBus={{ emit: bus.emit }}
 *     >
 *       <PreviewPage />
 *     </OfflineModeProvider>
 *   );
 * }
 * ```
 */
export function OfflineModeProvider({
  children,
  ...executorOptions
}: OfflineModeProviderProps): React.ReactElement {
  const [forceOffline, setForceOffline] = useState(false);

  const executor = useOfflineExecutor(executorOptions);

  // Effectively offline if actually offline OR force-offline is enabled
  const effectivelyOffline = executor.isOffline || forceOffline;

  const contextValue = useMemo<OfflineModeContextValue>(
    () => ({
      ...executor,
      forceOffline,
      setForceOffline,
      effectivelyOffline,
    }),
    [executor, forceOffline, effectivelyOffline]
  );

  return (
    <OfflineModeContext.Provider value={contextValue}>
      {children}
    </OfflineModeContext.Provider>
  );
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Access offline mode context.
 *
 * @example
 * ```tsx
 * function OfflineToggle() {
 *   const {
 *     effectivelyOffline,
 *     forceOffline,
 *     setForceOffline,
 *     pendingCount,
 *     sync,
 *   } = useOfflineMode();
 *
 *   return (
 *     <div>
 *       <Toggle
 *         checked={forceOffline}
 *         onChange={setForceOffline}
 *       >
 *         Test Offline
 *       </Toggle>
 *       {pendingCount > 0 && <Badge>{pendingCount} pending</Badge>}
 *       <Button onClick={sync}>Sync Now</Button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useOfflineMode(): OfflineModeContextValue {
  const context = useContext(OfflineModeContext);
  if (!context) {
    throw new Error('useOfflineMode must be used within OfflineModeProvider');
  }
  return context;
}

/**
 * Check if offline mode provider is available (optional usage).
 */
export function useOptionalOfflineMode(): OfflineModeContextValue | null {
  return useContext(OfflineModeContext);
}

export default OfflineModeProvider;
