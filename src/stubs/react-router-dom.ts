/**
 * Stub for react-router-dom in the Docusaurus orb site.
 *
 * @almadar/ui templates (DashboardLayout, AuthLayout) import from react-router-dom,
 * but the playground doesn't render those templates. Without this stub, the barrel
 * export chain pulls in `Link`/`useLocation` which crash because Docusaurus uses
 * react-router v5 and its `<Router>` context isn't available in the playground page.
 *
 * This stub provides no-op implementations so the modules load without errors.
 */

import React from 'react';

export function Link(props: Record<string, unknown>) {
  return React.createElement('a', { href: props.to as string }, props.children as React.ReactNode);
}

export function useLocation() {
  return { pathname: '/', search: '', hash: '', state: null, key: 'stub' };
}

export function useNavigate() {
  return () => {};
}

export function Outlet() {
  return null;
}

export function useParams() {
  return {};
}

export function MemoryRouter({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}

export function Routes({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}

export function Route() {
  return null;
}
