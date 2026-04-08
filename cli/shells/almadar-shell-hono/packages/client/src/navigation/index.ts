/**
 * Navigation Module for Compiled Shells
 *
 * Re-exports schema-driven navigation from @almadar/ui/renderer.
 * This module provides unified navigation that:
 * - Finds pages by path pattern (supports :id params)
 * - Switches active page via NavigationContext
 * - Fires INIT events with merged payload (route params + explicit)
 * - Optionally updates browser URL via history.pushState
 *
 * Usage in generated pages:
 * ```tsx
 * import { useNavigateTo, useInitPayload } from '../navigation';
 *
 * function InspectionsPage() {
 *   const navigateTo = useNavigateTo();
 *   const initPayload = useInitPayload();
 *
 *   const handleRowClick = (item) => {
 *     navigateTo(`/inspection/${item.id}`, { id: item.id });
 *   };
 *
 *   // Use initPayload for INIT event handling
 * }
 * ```
 *
 * @packageDocumentation
 */

// Re-export all navigation utilities from @almadar/ui/renderer
export {
  // Context and Provider
  NavigationProvider,
  useNavigation,
  useNavigateTo,
  useNavigationState,
  useInitPayload,
  useActivePage,
  useNavigationId,
  // Path utilities
  matchPath,
  extractRouteParams,
  pathMatches,
  // Page finding utilities
  findPageByPath,
  findPageByName,
  getDefaultPage,
  getAllPages,
} from '@almadar/ui/renderer';

export type {
  NavigationState,
  NavigationContextValue,
  NavigationProviderProps,
} from '@almadar/ui/renderer';
