import { createRequire } from 'module';
import { dirname, join } from 'path';
const require = createRequire(import.meta.url);

// Resolve @almadar/ui dist regardless of node_modules hoisting
const uiEntry = require.resolve('@almadar/ui');
const uiDist = join(dirname(uiEntry), '..', '**', '*.js');

/** @type {import('tailwindcss').Config} */
export default {
  presets: [require('./tailwind-preset.cjs')],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    uiDist,
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
