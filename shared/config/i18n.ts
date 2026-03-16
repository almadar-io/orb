export const SUPPORTED_LOCALES = ['en', 'ar', 'sl'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

export const localeConfig = {
  defaultLocale: "en" as const,
  locales: SUPPORTED_LOCALES as unknown as string[],
  localeConfigs: {
    en: { label: "English", direction: "ltr" as const, htmlLang: "en-US" },
    ar: { label: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629", direction: "rtl" as const, htmlLang: "ar" },
    sl: { label: "Sloven\u0161\u010Dina", direction: "ltr" as const, htmlLang: "sl" },
  },
};
