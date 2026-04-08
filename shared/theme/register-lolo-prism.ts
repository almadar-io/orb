import './lolo-syntax.css';

// Register LOLO language with Docusaurus' Prism instance on client load.
// Mirrors the pattern used by register-orb-prism.ts.
if (typeof window !== 'undefined') {
  import('@almadar/syntax').then(({ registerLoloLanguage }) => {
    const Prism = (window as Record<string, unknown>).Prism;
    if (Prism) {
      registerLoloLanguage(Prism as Record<string, unknown>);
    }
  }).catch(() => {});
}
