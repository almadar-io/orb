/**
 * Analytics consent banner (Docusaurus client module).
 *
 * Consent Mode v2 defaults to denied + gtag is loaded in the site's headTags,
 * so GA4 stays off until the visitor opts in. This module only renders the
 * banner and flips consent on the visitor's choice, persisting it to a shared
 * `.almadar.io` cookie so one decision applies across every almadar.io site.
 */

type GtagFn = (
  command: 'js' | 'config' | 'consent' | 'event' | 'set',
  ...params: Array<string | Date | Record<string, string>>
) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
  }
}

export {};

const COOKIE = 'almadar_analytics_consent';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
const PRIVACY_URL = 'https://almadar.io/privacy';

function getConsent(): 'granted' | 'denied' | null {
  const match = document.cookie.split('; ').find((c) => c.startsWith(`${COOKIE}=`));
  const value = match?.slice(COOKIE.length + 1);
  return value === 'granted' || value === 'denied' ? value : null;
}

function storeConsent(value: 'granted' | 'denied'): void {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  const domain = location.hostname.endsWith('almadar.io') ? '; Domain=.almadar.io' : '';
  document.cookie = `${COOKIE}=${value}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax${secure}${domain}`;
}

function updateGtag(granted: boolean): void {
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', { analytics_storage: granted ? 'granted' : 'denied' });
  }
}

function renderBanner(): void {
  const bar = document.createElement('div');
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Analytics consent');
  bar.style.cssText =
    'position:fixed;left:0;right:0;bottom:0;z-index:9999;display:flex;flex-wrap:wrap;gap:1rem;' +
    'align-items:center;justify-content:center;padding:0.75rem 1rem;font-size:0.9rem;' +
    'color:var(--ifm-font-color-base);background:var(--ifm-background-surface-color,#fff);' +
    'border-top:1px solid var(--ifm-color-emphasis-300,#ddd);box-shadow:0 -2px 12px rgba(0,0,0,0.12);';

  const text = document.createElement('span');
  text.textContent =
    'We use Google Analytics to understand usage. It sets cookies and stays off until you allow it. ';
  const link = document.createElement('a');
  link.href = PRIVACY_URL;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'Learn more';
  link.style.textDecoration = 'underline';
  text.appendChild(link);

  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;gap:0.5rem;';
  const decline = document.createElement('button');
  decline.type = 'button';
  decline.textContent = 'Decline';
  decline.className = 'button button--secondary button--sm';
  const allow = document.createElement('button');
  allow.type = 'button';
  allow.textContent = 'Allow analytics';
  allow.className = 'button button--primary button--sm';

  const dismiss = (granted: boolean) => {
    storeConsent(granted ? 'granted' : 'denied');
    updateGtag(granted);
    bar.remove();
  };
  decline.addEventListener('click', () => dismiss(false));
  allow.addEventListener('click', () => dismiss(true));

  actions.append(decline, allow);
  bar.append(text, actions);
  document.body.appendChild(bar);
}

if (typeof document !== 'undefined' && getConsent() === null) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderBanner);
  } else {
    renderBanner();
  }
}
