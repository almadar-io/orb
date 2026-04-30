/**
 * Docusaurus client module: registers the Orb language with Prism.
 *
 * Loaded via clientModules in docusaurus config.
 * Must run before any code blocks render.
 */

import './orb-syntax.css';

// Prism is available globally in Docusaurus
if (typeof window !== 'undefined') {
  // Dynamic import to avoid SSR issues
  import('@almadar/syntax').then(({ registerOrbLanguage }) => {
    const Prism = (window as unknown as { Prism?: Record<string, unknown> }).Prism;
    if (Prism) {
      registerOrbLanguage(Prism);
    }
  }).catch(() => {
    // Silently fail if @almadar/syntax isn't available yet
  });
}
