/**
 * Language tabs for a `.lolo` / `.orb` fence — English, العربية, Slovenščina.
 *
 * The translation is not done here. `@almadar/syntax`'s `translateLolo` /
 * `translateOrb` own it — that package is the only one depending on BOTH
 * `@almadar/core` (the vocabulary and the position rules) and `@almadar/std`
 * (the 429 operators), so it is the one place the two halves meet. This
 * component only picks a language and hands the result to the same Docusaurus
 * CodeBlock every other fence uses, so the English tab is byte-for-byte what
 * readers see today.
 *
 * Known limit: Arabic keywords may render unhighlighted where the `lolo` Prism
 * grammar still builds its patterns with `\b`, which is ASCII-only in
 * JavaScript regex and can never match Arabic script.
 */
import React, { useMemo, useState } from 'react';
import OriginalCodeBlock from '@theme-original/CodeBlock';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { Box, HStack, Button } from '@almadar/ui/marketing';

type LanguageCode = 'en' | 'ar' | 'sl';

interface Translator {
  /** English `.lolo` source rendered in `lang`. */
  lolo: (source: string, lang: LanguageCode) => string;
  /** English `.orb` document rendered in `lang`. */
  orb: (value: unknown, lang: LanguageCode) => unknown;
  rtl: (lang: LanguageCode) => boolean;
}

/** Endonyms, from the site's own locale config — the same labels the navbar
 *  locale dropdown shows. `coreTables[…].meta.name` is the ENGLISH name
 *  ("Arabic"), which is not what a reader of that language looks for. */
function useLanguageLabels(): Record<LanguageCode, string> {
  const { i18n } = useDocusaurusContext();
  const label = (lang: LanguageCode, fallback: string): string =>
    i18n.localeConfigs[lang]?.label ?? fallback;
  return {
    en: label('en', 'English'),
    ar: label('ar', 'العربية'),
    sl: label('sl', 'Slovenščina'),
  };
}

function isFn(value: unknown): value is (...args: never[]) => unknown {
  return typeof value === 'function';
}

/**
 * Both packages gained these APIs after the versions this site pins, so a
 * deployed build may resolve an older copy. Feature-detect and fall back to a
 * plain fence rather than crashing every docs page.
 */
function loadTranslator(): Translator | undefined {
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
      const lolo = syntax.translateLolo as (s: string, l: LanguageCode) => string;
      const orb = syntax.translateOrb as (v: unknown, l: LanguageCode) => unknown;
      return { lolo, orb, rtl };
    }
    // `@almadar/syntax` too old: core alone still translates everything except
    // operators, whose table only std has. English operators parse in every
    // language, so the fallback is partial, never wrong.
    if (isFn(core.localizeLoloSource) && isFn(core.localizeOrbValue)) {
      const lolo = core.localizeLoloSource as (s: string, l: LanguageCode) => string;
      const orb = core.localizeOrbValue as (v: unknown, l: LanguageCode) => unknown;
      return { lolo, orb, rtl };
    }
  } catch {
    // neither subpath resolved — fall through to a plain fence
  }
  return undefined;
}

const ORDER: readonly LanguageCode[] = ['en', 'ar', 'sl'];

export interface LoloLanguageTabsProps {
  code: string;
  language: string;
  /** Everything else the fence carried, forwarded to the code block unchanged. */
  blockProps: Record<string, unknown>;
}

export default function LoloLanguageTabs({
  code,
  language,
  blockProps,
}: LoloLanguageTabsProps): React.ReactElement {
  const translator = useMemo(loadTranslator, []);
  const labels = useLanguageLabels();
  const [active, setActive] = useState<LanguageCode>('en');

  const rendered = useMemo(() => {
    if (translator === undefined || active === 'en') return code;
    try {
      if (language !== 'orb') return translator.lolo(code, active);
      // An `.orb` fence is JSON: translate the document, not the text.
      const parsed: unknown = JSON.parse(code);
      return JSON.stringify(translator.orb(parsed, active), null, 2);
    } catch {
      // A fence that is not a whole program — a fragment quoted in prose, or
      // an elided `…` — may not lex or parse. Showing the English source
      // beats showing an error.
      return code;
    }
  }, [translator, active, code, language]);

  if (translator === undefined) {
    return <OriginalCodeBlock {...blockProps}>{code}</OriginalCodeBlock>;
  }

  return (
    <Box className="lolo-lang-tabs">
      <HStack gap="xs" role="tablist" aria-label="Program language" className="lolo-lang-tabs__strip">
        {ORDER.map((lang) => (
          <Button
            key={lang}
            size="sm"
            variant={active === lang ? 'primary' : 'ghost'}
            role="tab"
            aria-selected={active === lang}
            lang={lang}
            dir={translator.rtl(lang) ? 'rtl' : 'ltr'}
            onClick={() => setActive(lang)}
          >
            {labels[lang]}
          </Button>
        ))}
      </HStack>
      {/* The block stays LTR in every language: `.lolo` is line- and
          indentation-structured, and RTL would reorder `(set @entity.x 1)`
          into nonsense. Only the tab labels follow their script. */}
      <Box dir="ltr">
        <OriginalCodeBlock {...blockProps} language={language}>
          {rendered}
        </OriginalCodeBlock>
      </Box>
    </Box>
  );
}
