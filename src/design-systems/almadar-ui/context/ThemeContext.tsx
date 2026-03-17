'use client';
/**
 * Unified ThemeContext - Single provider for theme and color mode
 *
 * Combines design theme selection (ocean, wireframe, etc.) with
 * color mode (light/dark) into a single, simple system.
 *
 * Uses a single data attribute: data-theme="ocean-light" or data-theme="ocean-dark"
 *
 * @packageDocumentation
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

/** Color mode preference */
export type ColorMode = "light" | "dark" | "system";

/** Resolved color mode (what's actually applied) */
export type ResolvedMode = "light" | "dark";

/** Theme definition */
export interface ThemeDefinition {
  /** Theme identifier (e.g., "ocean", "wireframe") */
  name: string;
  /** Display name for UI (e.g., "Ocean Blue") */
  displayName?: string;
  /** Whether this theme has light mode styles */
  hasLightMode?: boolean;
  /** Whether this theme has dark mode styles */
  hasDarkMode?: boolean;
}

/** Built-in themes available in the design system */
export const BUILT_IN_THEMES: ThemeDefinition[] = [
  {
    name: "wireframe",
    displayName: "Wireframe",
    hasLightMode: true,
    hasDarkMode: true,
  },
  {
    name: "minimalist",
    displayName: "Minimalist",
    hasLightMode: true,
    hasDarkMode: true,
  },
  {
    name: "almadar",
    displayName: "Almadar",
    hasLightMode: true,
    hasDarkMode: true,
  },
  {
    name: "trait-wars",
    displayName: "Trait Wars",
    hasLightMode: false,
    hasDarkMode: true,
  },
  // Extended themes
  {
    name: "ocean",
    displayName: "Ocean",
    hasLightMode: true,
    hasDarkMode: true,
  },
  {
    name: "forest",
    displayName: "Forest",
    hasLightMode: true,
    hasDarkMode: true,
  },
  {
    name: "sunset",
    displayName: "Sunset",
    hasLightMode: true,
    hasDarkMode: true,
  },
  {
    name: "lavender",
    displayName: "Lavender",
    hasLightMode: true,
    hasDarkMode: true,
  },
  {
    name: "rose",
    displayName: "Rose",
    hasLightMode: true,
    hasDarkMode: true,
  },
  {
    name: "slate",
    displayName: "Slate",
    hasLightMode: true,
    hasDarkMode: true,
  },
  {
    name: "ember",
    displayName: "Ember",
    hasLightMode: true,
    hasDarkMode: true,
  },
  {
    name: "midnight",
    displayName: "Midnight",
    hasLightMode: true,
    hasDarkMode: true,
  },
  {
    name: "sand",
    displayName: "Sand",
    hasLightMode: true,
    hasDarkMode: true,
  },
  {
    name: "neon",
    displayName: "Neon",
    hasLightMode: true,
    hasDarkMode: true,
  },
  {
    name: "arctic",
    displayName: "Arctic",
    hasLightMode: true,
    hasDarkMode: true,
  },
  {
    name: "copper",
    displayName: "Copper",
    hasLightMode: true,
    hasDarkMode: true,
  },
];

/** Theme context value */
interface ThemeContextValue {
  /** Current theme name */
  theme: string;
  /** Current color mode setting (may be 'system') */
  mode: ColorMode;
  /** Resolved color mode (always 'light' or 'dark') */
  resolvedMode: ResolvedMode;
  /** Set the theme */
  setTheme: (theme: string) => void;
  /** Set the color mode */
  setMode: (mode: ColorMode) => void;
  /** Toggle between light and dark modes */
  toggleMode: () => void;
  /** Available themes */
  availableThemes: ThemeDefinition[];
  /** The full theme string applied to data-theme (e.g., "ocean-light") */
  appliedTheme: string;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/** Storage keys */
const THEME_STORAGE_KEY = "theme";
const MODE_STORAGE_KEY = "theme-mode";

/**
 * Get the system preferred color scheme
 */
function getSystemMode(): ResolvedMode {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Resolve the color mode (handle 'system' preference)
 */
function resolveMode(mode: ColorMode): ResolvedMode {
  if (mode === "system") {
    return getSystemMode();
  }
  return mode;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  /** Available themes (will be merged with built-in themes) */
  themes?: readonly ThemeDefinition[] | ThemeDefinition[];
  /** Default theme name */
  defaultTheme?: string;
  /** Default color mode */
  defaultMode?: ColorMode;
  /** Optional target element ref — when provided, theme attributes are applied to this element instead of document.documentElement */
  targetRef?: React.RefObject<HTMLElement>;
}

/**
 * Unified ThemeProvider component
 *
 * @example
 * ```tsx
 * // Basic usage with built-in themes
 * <ThemeProvider defaultTheme="wireframe" defaultMode="light">
 *   <App />
 * </ThemeProvider>
 *
 * // With custom themes from orbital schema
 * import { THEMES } from './generated/theme-manifest';
 * <ThemeProvider themes={THEMES} defaultTheme="ocean" defaultMode="system">
 *   <App />
 * </ThemeProvider>
 * ```
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  themes = [],
  defaultTheme = "wireframe",
  defaultMode = "system",
  targetRef,
}) => {
  // Merge built-in themes with custom themes
  const availableThemes = useMemo(() => {
    const themeMap = new Map<string, ThemeDefinition>();
    // Add built-in themes first
    BUILT_IN_THEMES.forEach((t) => themeMap.set(t.name, t));
    // Custom themes override built-in if same name
    themes.forEach((t) => themeMap.set(t.name, t));
    return Array.from(themeMap.values());
  }, [themes]);

  // When targetRef is provided, this is a scoped (embedded) provider — skip localStorage
  const isScoped = !!targetRef;

  // Initialize theme from storage or default
  const [theme, setThemeState] = useState<string>(() => {
    if (isScoped || typeof window === "undefined") return defaultTheme;
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    // Validate stored theme exists
    const validThemes = [
      ...BUILT_IN_THEMES.map((t) => t.name),
      ...themes.map((t) => t.name),
    ];
    if (stored && validThemes.includes(stored)) {
      return stored;
    }
    return defaultTheme;
  });

  // Initialize mode from storage or default
  const [mode, setModeState] = useState<ColorMode>(() => {
    if (isScoped || typeof window === "undefined") return defaultMode;
    const stored = localStorage.getItem(MODE_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
    return defaultMode;
  });

  // Resolved mode (handles 'system' preference)
  const [resolvedMode, setResolvedMode] = useState<ResolvedMode>(() =>
    resolveMode(mode),
  );

  // The applied theme string (e.g., "ocean-light")
  const appliedTheme = useMemo(
    () => `${theme}-${resolvedMode}`,
    [theme, resolvedMode],
  );

  // Update resolved mode when mode changes or system preference changes
  useEffect(() => {
    const updateResolved = () => {
      setResolvedMode(resolveMode(mode));
    };

    updateResolved();

    // Listen for system theme changes
    if (mode === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => updateResolved();
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    return undefined;
  }, [mode]);

  // Apply theme to target element (or document root if no targetRef)
  useEffect(() => {
    // When scoped, only apply to the target element — never touch document root
    if (isScoped) {
      if (targetRef?.current) {
        targetRef.current.setAttribute("data-theme", appliedTheme);
        targetRef.current.classList.remove("light", "dark");
        targetRef.current.classList.add(resolvedMode);
      }
      return;
    }
    const root = document.documentElement;
    root.setAttribute("data-theme", appliedTheme);

    // Also set class for Tailwind dark: variant compatibility
    root.classList.remove("light", "dark");
    root.classList.add(resolvedMode);
  }, [appliedTheme, resolvedMode, targetRef, isScoped]);

  // Set theme
  const setTheme = useCallback(
    (newTheme: string) => {
      const validTheme = availableThemes.find((t) => t.name === newTheme);
      if (validTheme) {
        setThemeState(newTheme);
        if (!isScoped && typeof window !== "undefined") {
          localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        }
      } else {
        console.warn(
          `Theme "${newTheme}" not found. Available: ${availableThemes.map((t) => t.name).join(", ")}`,
        );
      }
    },
    [availableThemes],
  );

  // Set mode
  const setMode = useCallback((newMode: ColorMode) => {
    setModeState(newMode);
    if (!isScoped && typeof window !== "undefined") {
      localStorage.setItem(MODE_STORAGE_KEY, newMode);
    }
  }, []);

  // Toggle between light and dark
  const toggleMode = useCallback(() => {
    const newMode: ColorMode = resolvedMode === "dark" ? "light" : "dark";
    setMode(newMode);
  }, [resolvedMode, setMode]);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme,
      mode,
      resolvedMode,
      setTheme,
      setMode,
      toggleMode,
      availableThemes,
      appliedTheme,
    }),
    [
      theme,
      mode,
      resolvedMode,
      setTheme,
      setMode,
      toggleMode,
      availableThemes,
      appliedTheme,
    ],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook for accessing theme context
 *
 * @returns Theme context value
 *
 * @example
 * ```tsx
 * const { theme, resolvedMode, toggleMode, setTheme } = useTheme();
 *
 * // Toggle dark mode
 * <button onClick={toggleMode}>
 *   {resolvedMode === 'dark' ? 'Light' : 'Dark'}
 * </button>
 *
 * // Change theme
 * <select value={theme} onChange={(e) => setTheme(e.target.value)}>
 *   {availableThemes.map(t => (
 *     <option key={t.name} value={t.name}>{t.displayName || t.name}</option>
 *   ))}
 * </select>
 * ```
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return a default implementation for storybook/testing
    return {
      theme: "wireframe",
      mode: "light",
      resolvedMode: "light",
      setTheme: () => {},
      setMode: () => {},
      toggleMode: () => {},
      availableThemes: BUILT_IN_THEMES,
      appliedTheme: "wireframe-light",
    };
  }
  return context;
}

// Legacy exports for backward compatibility
export type Theme = ColorMode;
export type ResolvedTheme = ResolvedMode;
export type DesignTheme = ThemeDefinition;

export default ThemeContext;
