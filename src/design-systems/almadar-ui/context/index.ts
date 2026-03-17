/**
 * Context barrel export
 */

export {
  UISlotProvider,
  useUISlots,
  useSlotContent,
  useSlotHasContent,
  UISlotContext,
  type UISlotManager,
  type UISlot,
  type SlotContent,
  type RenderUIConfig,
  type SlotAnimation,
  type SlotChangeCallback,
} from "./UISlotContext";

export {
  ThemeProvider,
  useTheme,
  BUILT_IN_THEMES,
  type ThemeDefinition,
  type ThemeProviderProps,
  type ColorMode,
  type ResolvedMode,
  type DesignTheme,
} from "./ThemeContext";
export { default as ThemeContext } from "./ThemeContext";

export { DesignThemeProvider, useDesignTheme } from "./DesignThemeContext";

export {
  UserProvider,
  UserContext,
  useUser,
  useHasRole,
  useHasPermission,
  useUserForEvaluation,
  ANONYMOUS_USER,
  type UserData,
  type UserContextValue,
  type UserProviderProps,
} from "./UserContext";
