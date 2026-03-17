'use client';
/**
 * DesignThemeContext - DEPRECATED
 *
 * This module is deprecated. Use the unified ThemeProvider from ThemeContext instead.
 *
 * @deprecated Use ThemeProvider and useTheme from './ThemeContext' instead
 * @packageDocumentation
 */

import {
  useTheme,
  ThemeProvider,
  BUILT_IN_THEMES,
  type ThemeDefinition,
} from "./ThemeContext";

/** @deprecated Use ThemeDefinition from ThemeContext */
export type DesignTheme = string;

/**
 * @deprecated Use ThemeProvider from ThemeContext instead
 */
export const DesignThemeProvider = ThemeProvider;

/**
 * @deprecated Use useTheme from ThemeContext instead
 *
 * This wrapper provides backward compatibility with the old API.
 */
export function useDesignTheme() {
  const { theme, setTheme, availableThemes } = useTheme();

  return {
    designTheme: theme,
    setDesignTheme: setTheme,
    availableThemes: availableThemes.map((t) => t.name),
  };
}

export default { DesignThemeProvider, useDesignTheme };
