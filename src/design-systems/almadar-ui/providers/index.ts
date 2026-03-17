/**
 * Providers barrel export
 *
 * Unified providers for Orbital applications.
 * Use OrbitalProvider for most cases - it combines all required providers.
 */

// Main unified provider
export { OrbitalProvider, type OrbitalProviderProps } from './OrbitalProvider';

// Re-export ThemeDefinition for generated theme configs
export type { ThemeDefinition } from '../context/ThemeContext';

// Individual providers (for advanced use cases)
export { EventBusProvider, EventBusContext } from './EventBusProvider';
export { SelectionProvider, SelectionContext, useSelection, useSelectionOptional } from './SelectionProvider';
export type { SelectionContextType } from './SelectionProvider';

export {
  FetchedDataProvider,
  FetchedDataContext,
  useFetchedDataContext,
  useFetchedData,
  useFetchedEntity,
} from './FetchedDataProvider';
export type {
  FetchedDataProviderProps,
  FetchedDataContextValue,
  FetchedDataState,
  EntityRecord,
} from './FetchedDataProvider';

// Verification provider
export { VerificationProvider } from './VerificationProvider';
export type { VerificationProviderProps } from './VerificationProvider';

// Offline mode provider
export {
  OfflineModeProvider,
  useOfflineMode,
  useOptionalOfflineMode,
} from './OfflineModeProvider';
export type {
  OfflineModeContextValue,
  OfflineModeProviderProps,
} from './OfflineModeProvider';

// Note: EventBusContextType is exported from hooks/event-bus-types to avoid duplicate exports
// Note: ThemeProvider and UISlotProvider are exported from context/ directory
