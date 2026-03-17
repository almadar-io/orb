'use client';
/**
 * UISlotContext
 *
 * React context for providing the UI Slot Manager throughout the application.
 * Traits use this context to render content into slots via render_ui effects.
 *
 * Usage:
 * ```tsx
 * // In App.tsx or layout
 * <UISlotProvider>
 *   <App />
 * </UISlotProvider>
 *
 * // In trait hooks or components
 * const { render, clear } = useUISlots();
 * render({ target: 'modal', pattern: 'form-section', props: {...} });
 * ```
 *
 * @packageDocumentation
 */

import React, { createContext, useContext, useMemo } from 'react';
import {
  useUISlotManager,
  type UISlotManager,
  type UISlot,
  type SlotContent,
  type RenderUIConfig,
  type SlotAnimation,
  type SlotChangeCallback,
} from '../hooks/useUISlots';

// ============================================================================
// Context
// ============================================================================

/**
 * Context for the UI Slot Manager
 */
const UISlotContext = createContext<UISlotManager | null>(null);

// ============================================================================
// Provider
// ============================================================================

export interface UISlotProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that creates and provides the UI Slot Manager.
 *
 * Must wrap any components that use traits with render_ui effects.
 */
export function UISlotProvider({ children }: UISlotProviderProps): React.ReactElement {
  const slotManager = useUISlotManager();

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => slotManager, [slotManager]);

  return (
    <UISlotContext.Provider value={contextValue}>
      {children}
    </UISlotContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access the UI Slot Manager.
 *
 * Must be used within a UISlotProvider.
 *
 * @throws Error if used outside of UISlotProvider
 *
 * @example
 * ```tsx
 * function MyTraitHook() {
 *   const { render, clear } = useUISlots();
 *
 *   const showModal = () => {
 *     render({
 *       target: 'modal',
 *       pattern: 'form-section',
 *       props: { title: 'Create Item' },
 *     });
 *   };
 *
 *   const closeModal = () => {
 *     clear('modal');
 *   };
 *
 *   return { showModal, closeModal };
 * }
 * ```
 */
export function useUISlots(): UISlotManager {
  const context = useContext(UISlotContext);

  if (!context) {
    throw new Error(
      'useUISlots must be used within a UISlotProvider. ' +
      'Make sure your component tree is wrapped with <UISlotProvider>.'
    );
  }

  return context;
}

/**
 * Hook to get content for a specific slot.
 *
 * Useful for components that only need to read slot state.
 */
export function useSlotContent(slot: UISlot): SlotContent | null {
  const { getContent } = useUISlots();
  return getContent(slot);
}

/**
 * Hook to check if a slot has content.
 */
export function useSlotHasContent(slot: UISlot): boolean {
  const { hasContent } = useUISlots();
  return hasContent(slot);
}

// ============================================================================
// Exports
// ============================================================================

export {
  UISlotContext,
  type UISlotManager,
  type UISlot,
  type SlotContent,
  type RenderUIConfig,
  type SlotAnimation,
  type SlotChangeCallback,
};
