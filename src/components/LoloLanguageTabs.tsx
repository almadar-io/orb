/**
 * Language tabs for a `.lolo` / `.orb` markdown fence — English, العربية,
 * Slovenščina. The translation itself lives in `useLoloTranslator`; this
 * component only renders the strip and swaps the rendered source.
 *
 * The active tab starts on the PAGE's locale, so an Arabic reader sees Arabic
 * code without being asked to switch language a second time.
 */
import React, { useMemo, useState } from 'react';
import OriginalCodeBlock from '@theme-original/CodeBlock';
import { Box, Button } from '@almadar/ui/ssr';
import {
  useLoloTranslator,
  LANGUAGE_ORDER,
  type LanguageCode,
} from '../lib/useLoloTranslator';

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
  const t = useLoloTranslator();
  const [active, setActive] = useState<LanguageCode>(t.pageLanguage);

  const rendered = useMemo(
    () => t.render(code, active, language),
    [t, code, active, language],
  );

  if (!t.available) {
    return <OriginalCodeBlock {...blockProps}>{code}</OriginalCodeBlock>;
  }

  return (
    <Box className="lolo-lang-tabs">
      {/* Box, not HStack: StackProps is a closed prop list that drops every
          aria-* attribute, which would leave this tablist with no accessible
          name. Box spreads the rest onto the element. */}
      <Box
        display="flex"
        role="tablist"
        aria-label="Program language"
        className="lolo-lang-tabs__strip gap-1"
      >
        {LANGUAGE_ORDER.map((lang) => (
          <Button
            key={lang}
            size="sm"
            variant={active === lang ? 'primary' : 'ghost'}
            role="tab"
            aria-selected={active === lang}
            lang={lang}
            dir={t.rtl(lang) ? 'rtl' : 'ltr'}
            onClick={() => setActive(lang)}
          >
            {t.labels[lang]}
          </Button>
        ))}
      </Box>
      {/* Direction follows the ACTIVE tab, not the page: Arabic source renders
          RTL (owner decision 2026-09-17 — Arabic readers read right-to-left),
          English/Slovenian stay LTR. The global `pre/code { direction: ltr
          !important }` guard in shared/css still wins over the `dir`
          attribute, so the RTL case is un-blocked by a higher-specificity
          `.lolo-lang-tabs__code[dir="rtl"]` rule in ifm-bridge.css. */}
      <Box dir={t.rtl(active) ? 'rtl' : 'ltr'} className="lolo-lang-tabs__code">
        <OriginalCodeBlock {...blockProps} language={language}>
          {rendered}
        </OriginalCodeBlock>
      </Box>
    </Box>
  );
}
