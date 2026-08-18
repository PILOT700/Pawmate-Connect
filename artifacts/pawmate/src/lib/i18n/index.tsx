import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { en, type Dictionary } from "./dictionary";
import { ru } from "./ru";

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
] as const;

export type Language = (typeof LANGUAGES)[number]["code"];

const DICTIONARIES: Record<Language, Dictionary> = { en, ru };

const STORAGE_KEY = "pawmate.language";

/**
 * The browser's preference, but only as a starting guess: a saved choice always
 * wins, because someone who picked English on a Russian laptop meant it.
 */
function detectLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "ru") return saved;
  } catch {
    // Private mode can refuse storage; fall through to the browser's setting.
  }

  const preferred = typeof navigator !== "undefined" ? navigator.languages ?? [navigator.language] : [];
  return preferred.some((l) => l?.toLowerCase().startsWith("ru")) ? "ru" : "en";
}

/** Follows the `a.b.c` path of a dictionary key. */
type Leaves<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : Leaves<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type TranslationKey = Leaves<Dictionary>;

interface I18nValue {
  language: Language;
  setLanguage: (next: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function lookup(dict: Dictionary, key: string): string | undefined {
  const value = key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) return (acc as Record<string, unknown>)[part];
    return undefined;
  }, dict);
  return typeof value === "string" ? value : undefined;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectLanguage);

  // Screen readers and the browser's own translation prompt both read this.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not being able to remember the choice is survivable; changing it is not.
    }
  }, []);

  const t = useCallback<I18nValue["t"]>(
    (key, vars) => {
      // Falls back to English rather than showing the raw key: an untranslated
      // sentence is readable, `home.ctaBody` is not.
      const template = lookup(DICTIONARIES[language], key) ?? lookup(en, key) ?? key;

      if (!vars) return template;
      return template.replace(/\{\{(\w+)\}\}/g, (whole, name: string) =>
        name in vars ? String(vars[name]) : whole,
      );
    },
    [language],
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

/** Shorthand for the common case of only needing the translate function. */
export function useT(): I18nValue["t"] {
  return useI18n().t;
}

/**
 * Picks the right wording for a count. Russian needs one/few/many where English
 * needs one/other, and the browser's own rules decide which — getting this
 * wrong is what produces "5 файла".
 */
export function usePlural() {
  const { language } = useI18n();
  return useCallback(
    (count: number, forms: Partial<Record<Intl.LDMLPluralRule, string>>) => {
      const rule = new Intl.PluralRules(language).select(count);
      const form = forms[rule] ?? forms.other ?? forms.many ?? "";
      return form.replace("{{count}}", String(count));
    },
    [language],
  );
}
