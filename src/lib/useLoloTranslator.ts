/**
 * The one place the site talks to the `.lolo` / `.orb` translator.
 *
 * `@almadar/syntax`'s `translateLolo` / `translateOrb` own the translation —
 * that package is the only one depending on both `@almadar/core` (the
 * vocabulary and the position rules) and `@almadar/std` (the operators). This
 * hook only resolves them, picks the language a reader of the current page
 * should land on, and degrades when an older copy is resolved.
 *
 * Both `LoloLanguageTabs` (markdown fences) and `CodePreviewTabs` (the home
 * page and any hand-placed sample) use it, so the behaviour cannot drift
 * between the two surfaces.
 */
import { useMemo } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export type LanguageCode = 'en' | 'ar' | 'sl';

/** Tab order, English first — it is the canonical source the others render from. */
export const LANGUAGE_ORDER: readonly LanguageCode[] = ['en', 'ar', 'sl'];

export interface LoloTranslator {
  /** Render `code` in `lang`. `language` selects the `.lolo` or `.orb` surface. */
  render: (code: string, lang: LanguageCode, language: string) => string;
  /** Human name per language, from the site's own locale config. */
  labels: Record<LanguageCode, string>;
  /** The language a reader of this page should see first — the page's locale. */
  pageLanguage: LanguageCode;
  /** False when neither package resolved; callers should render a plain block. */
  available: boolean;
  rtl: (lang: LanguageCode) => boolean;
}

function isFn(value: unknown): value is (...args: never[]) => unknown {
  return typeof value === 'function';
}

interface Loaded {
  lolo: (source: string, lang: LanguageCode) => string;
  orb: (value: unknown, lang: LanguageCode) => unknown;
  rtl: (lang: LanguageCode) => boolean;
}

function load(): Loaded | undefined {
  let rtl = (lang: LanguageCode): boolean => lang === 'ar';
  try {
    const core: Record<string, unknown> = require('@almadar/core/i18n');
    const tables = core.coreTables;
    if (typeof tables === 'object' && tables !== null) {
      const byLang = tables as Record<LanguageCode, { meta: { rtl: boolean } }>;
      rtl = (lang) => byLang[lang]?.meta.rtl ?? false;
    }
    const syntax: Record<string, unknown> = require('@almadar/syntax');
    if (isFn(syntax.translateLolo) && isFn(syntax.translateOrb)) {
      return {
        lolo: syntax.translateLolo as (s: string, l: LanguageCode) => string,
        orb: syntax.translateOrb as (v: unknown, l: LanguageCode) => unknown,
        rtl,
      };
    }
    // An older `@almadar/syntax`: core alone still translates everything but
    // the operators, whose table only std carries. English operators parse in
    // every language, so this fallback is partial, never wrong.
    if (isFn(core.localizeLoloSource) && isFn(core.localizeOrbValue)) {
      return {
        lolo: core.localizeLoloSource as (s: string, l: LanguageCode) => string,
        orb: core.localizeOrbValue as (v: unknown, l: LanguageCode) => unknown,
        rtl,
      };
    }
  } catch {
    // neither subpath resolved
  }
  return undefined;
}

export function useLoloTranslator(): LoloTranslator {
  const { i18n } = useDocusaurusContext();
  const loaded = useMemo(load, []);

  const label = (lang: LanguageCode, fallback: string): string =>
    i18n.localeConfigs[lang]?.label ?? fallback;

  const current = i18n.currentLocale;
  const pageLanguage: LanguageCode = current === 'ar' || current === 'sl' ? current : 'en';

  const render = (code: string, lang: LanguageCode, language: string): string => {
    if (loaded === undefined || lang === 'en') return code;
    try {
      if (language !== 'orb') return loaded.lolo(code, lang);
      // An `.orb` sample is JSON: translate the document, not the text.
      return JSON.stringify(loaded.orb(JSON.parse(code), lang), null, 2);
    } catch {
      // A fragment quoted in prose, or an elided `…`, may not lex or parse.
      // Showing the English source beats showing an error.
      return code;
    }
  };

  return {
    render,
    labels: {
      en: label('en', 'English'),
      ar: label('ar', 'العربية'),
      sl: label('sl', 'Slovenščina'),
    },
    pageLanguage,
    available: loaded !== undefined,
    rtl: loaded?.rtl ?? ((lang) => lang === 'ar'),
  };
}
