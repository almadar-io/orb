/**
 * Tailwind config for the Almadar website.
 *
 * Self-contained — does NOT import from monorepo paths so the website
 * can build standalone in CI (almadar repo is separate from the monorepo).
 *
 * The theme extension mirrors packages/almadar-ui/tailwind.config.js
 * using CSS variable references so any @almadar/ui theme works.
 */

import { fileURLToPath } from 'url';
import path from 'path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // Synced design systems (source of truth for both local dev and CI)
    './src/design-systems/**/*.{js,ts,jsx,tsx}',
    // Storybook dev
    './.storybook/**/*.{js,ts,jsx,tsx}',
    // Website source
    './src/**/*.{js,ts,jsx,tsx}',
    // Individual site sources
    './sites/main/src/**/*.{js,ts,jsx,tsx}',
    './sites/studio/src/**/*.{js,ts,jsx,tsx}',
    './sites/services/src/**/*.{js,ts,jsx,tsx}',
    './sites/orb/src/**/*.{js,ts,jsx,tsx}',
    // Shared modules used across sites
    './shared/**/*.{js,ts,jsx,tsx}',
    // @almadar/ui components (absolute path, needed because Docusaurus CWD differs from config location)
    path.resolve(__dirname, 'node_modules/@almadar/ui/dist/**/*.js'),
  ],
  darkMode: 'class',
  theme: {
    fontFamily: {
      sans: ['var(--font-family)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      mono: ['var(--font-family-mono, ui-monospace)', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--color-primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          foreground: 'var(--color-secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--color-muted)',
          foreground: 'var(--color-muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          foreground: 'var(--color-accent-foreground)',
        },
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        card: {
          DEFAULT: 'var(--color-card)',
          foreground: 'var(--color-card-foreground)',
        },
        border: 'var(--color-border)',
        input: 'var(--color-input)',
        ring: 'var(--color-ring)',
      },
      borderRadius: {
        none: 'var(--radius-none)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-main)',
        lg: 'var(--shadow-lg)',
        inner: 'var(--shadow-inner)',
      },
      fontWeight: {
        normal: 'var(--font-weight-normal)',
        medium: 'var(--font-weight-medium)',
        bold: 'var(--font-weight-bold)',
      },
      transitionDuration: {
        fast: 'var(--transition-fast)',
        normal: 'var(--transition-normal)',
        slow: 'var(--transition-slow)',
      },
    },
  },
  plugins: [],
};
