/**
 * Shim for react-router-dom: re-exports real v5 module (by absolute path
 * to avoid circular alias) and adds v6-only stubs for @almadar/ui.
 */

const real = require('../../node_modules/react-router-dom/index.js');

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
