import { createRequire } from 'module';
import { dirname, join } from 'path';
const require = createRequire(import.meta.url);

// Resolve @almadar/ui dist regardless of node_modules hoisting
const uiEntry = require.resolve('@almadar/ui');
const uiDist = join(dirname(uiEntry), '..', '**', '*.js');

// @almadar/ui's DashboardLayout (sidebar / topnav / bottomnav modes) and
// several molecules use container-query Tailwind variants (`@md/dashboard:flex`,
// `@sm/dashboard:block`, etc.). Without this plugin Tailwind silently drops
// every `@*/dashboard:*` class and the chrome renders as a blank top-bar with
// action icons collapsed to the left (no nav, no search, no app title).
const containerQueries = require('@tailwindcss/container-queries');

/** @type {import('tailwindcss').Config} */
export default {
  // Single source of truth for Layer 1 + Layer 2 token mappings is
  // @almadar/ui's published preset. Don't fork a local copy — it goes
  // stale silently and breaks look variants without any build error.
  presets: [require('@almadar/ui/tailwind-preset')],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    uiDist,
  ],
  theme: {
    extend: {},
  },
  plugins: [containerQueries],
}
