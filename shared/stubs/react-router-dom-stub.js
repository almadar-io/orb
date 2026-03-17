/**
 * Shim for react-router-dom: re-exports real v5 module (by absolute path
 * to avoid circular alias) and adds v6-only stubs for @almadar/ui.
 */

let real = {};
try {
  // Use the resolved react-router-dom — Node finds it in any ancestor node_modules
  real = require('react-router-dom/index.js');
} catch (e) {
  try { real = require('react-router-dom'); } catch (e2) { /* SSR safe fallback */ }
}

// Re-export all real v5 exports
module.exports = {
  ...real,
  // v6-only stubs (used by @almadar/ui but never rendered in the website)
  Outlet: function Outlet() { return null; },
  RouterProvider: function RouterProvider() { return null; },
  createBrowserRouter: function createBrowserRouter() { return {}; },
  createRoutesFromElements: function createRoutesFromElements() { return []; },
  useNavigate: function useNavigate() { return function noop() {}; },
  useSearchParams: function useSearchParams() { return [new URLSearchParams(), function noop() {}]; },
};
