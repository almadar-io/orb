import { createRouteListener } from '@almadar/analytics/docusaurus';

declare global {
  interface Window {
    __ALMADAR_ANALYTICS_ENDPOINT__?: string;
  }
}

const endpoint =
  typeof window !== 'undefined' ? (window.__ALMADAR_ANALYTICS_ENDPOINT__ ?? '') : '';

export const onRouteDidUpdate = endpoint ? createRouteListener({ endpoint }) : () => {};
