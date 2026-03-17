'use client';
/**
 * OrbitalProvider
 *
 * Unified provider that combines all required contexts for Orbital applications.
 * Provides a single import for both Builder preview and compiled shell.
 *
 * Combines:
 * - ThemeProvider - Theme and color mode management
 * - EventBusProvider - Page-scoped event pub/sub
 * - SelectionProvider - Selected entity tracking
 * - FetchedDataProvider - Server-fetched entity data
 *
 * @packageDocumentation
 */

import React, { type ReactNode, useMemo } from 'react';
import { ThemeProvider, type ThemeProviderProps, type ThemeDefinition } from '../context/ThemeContext';
import { EventBusProvider } from './EventBusProvider';
import { SelectionProvider } from './SelectionProvider';
import { FetchedDataProvider, useFetchedData } from './FetchedDataProvider';
import { EntityDataProvider, type EntityDataAdapter } from '../hooks/useEntityData';
import { SuspenseConfigProvider, type SuspenseConfig } from '../components/organisms/UISlotRenderer';
import { VerificationProvider } from './VerificationProvider';

// ============================================================================
// Types
// ============================================================================

export interface OrbitalProviderProps {
  children: ReactNode;

  // Theme options
  /** Custom themes (merged with built-in themes) */
  themes?: ThemeDefinition[];
  /** Default theme name */
  defaultTheme?: string;
  /** Default color mode */
  defaultMode?: 'light' | 'dark' | 'system';
  /** Optional target element ref for scoped theme application */
  targetRef?: React.RefObject<HTMLElement>;
  /** Skip ThemeProvider (use when already inside a themed container like shadow DOM) */
  skipTheme?: boolean;

  // Debug options
  /** Enable debug logging for all providers */
  debug?: boolean;

  // Data options
  /** Initial fetched data */
  initialData?: Record<string, unknown[]>;

  // Suspense options
  /**
   * Enable Suspense mode. When true, UISlotRenderer wraps each slot in
   * `<ErrorBoundary><Suspense>` with Skeleton fallbacks.
   * Opt-in — existing isLoading prop pattern still works when false/absent.
   */
  suspense?: boolean;

  // Verification options
  /**
   * Enable verification wiring for visual testing.
   * When true, lifecycle events are recorded and exposed via
   * `window.__orbitalVerification` for Playwright/automation.
   * Default: true in development, false in production.
   */
  verification?: boolean;
}

// ============================================================================
// FetchedData → EntityData Bridge
// ============================================================================

/**
 * Bridges FetchedDataContext (builder-specific) to EntityDataContext (generic).
 * Must be rendered inside FetchedDataProvider.
 */
function FetchedDataBridge({ children }: { children: ReactNode }) {
  const fetchedData = useFetchedData();

  const adapter: EntityDataAdapter = useMemo(() => ({
    getData: (entity: string) => fetchedData.getData(entity) as Record<string, unknown>[],
    getById: (entity: string, id: string) => fetchedData.getById(entity, id) as Record<string, unknown> | undefined,
    isLoading: fetchedData.loading,
    error: fetchedData.error,
  }), [fetchedData.getData, fetchedData.getById, fetchedData.loading, fetchedData.error]);

  return (
    <EntityDataProvider adapter={adapter}>
      {children}
    </EntityDataProvider>
  );
}

// ============================================================================
// Provider Component
// ============================================================================

/**
 * OrbitalProvider - Unified context provider for Orbital applications
 *
 * Wraps your application with all required providers in the correct order.
 *
 * @example
 * ```tsx
 * // Basic usage
 * function App() {
 *   return (
 *     <OrbitalProvider>
 *       <Router>
 *         <Routes />
 *       </Router>
 *     </OrbitalProvider>
 *   );
 * }
 *
 * // With configuration
 * function App() {
 *   return (
 *     <OrbitalProvider
 *       defaultTheme="minimalist"
 *       defaultMode="dark"
 *       debug={process.env.NODE_ENV === 'development'}
 *     >
 *       <Router>
 *         <Routes />
 *       </Router>
 *     </OrbitalProvider>
 *   );
 * }
 *
 * // With custom themes from schema
 * import { THEMES } from './generated/theme-manifest';
 *
 * function App() {
 *   return (
 *     <OrbitalProvider themes={THEMES} defaultTheme="ocean">
 *       <Router>
 *         <Routes />
 *       </Router>
 *     </OrbitalProvider>
 *   );
 * }
 * ```
 */
export function OrbitalProvider({
  children,
  themes,
  defaultTheme = 'wireframe',
  defaultMode = 'system',
  targetRef,
  skipTheme = false,
  debug = false,
  initialData,
  suspense = false,
  verification,
}: OrbitalProviderProps): React.ReactElement {
  const suspenseConfig: SuspenseConfig = useMemo(
    () => ({ enabled: suspense }),
    [suspense],
  );

  const inner = (
    <FetchedDataProvider initialData={initialData}>
      <FetchedDataBridge>
        <EventBusProvider debug={debug}>
          <VerificationProvider enabled={verification}>
            <SelectionProvider debug={debug}>
              <SuspenseConfigProvider config={suspenseConfig}>
                {children}
              </SuspenseConfigProvider>
            </SelectionProvider>
          </VerificationProvider>
        </EventBusProvider>
      </FetchedDataBridge>
    </FetchedDataProvider>
  );

  if (skipTheme) {
    return inner;
  }

  return (
    <ThemeProvider
      themes={themes}
      defaultTheme={defaultTheme}
      defaultMode={defaultMode}
      targetRef={targetRef}
    >
      {inner}
    </ThemeProvider>
  );
}

OrbitalProvider.displayName = 'OrbitalProvider';

// ============================================================================
// Re-exports for convenience
// ============================================================================

export { ThemeProvider } from '../context/ThemeContext';
export { EventBusProvider } from './EventBusProvider';
export { SelectionProvider } from './SelectionProvider';
export { FetchedDataProvider } from './FetchedDataProvider';
