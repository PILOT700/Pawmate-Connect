import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ru as ruDateLocale } from "date-fns/locale";
import type { Locale as DateFnsLocale } from "date-fns";
import { makeFormatters, type Formatters } from "../format";
import { en, type Dictionary, type PluralForms } from "./dictionary";
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

/** A node is plural forms, not a group of keys, when every key is a category. */
type IsPlural<T> = [keyof T] extends [Intl.LDMLPluralRule] ? true : false;

/**
 * Follows the `a.b.c` path of a dictionary key.
 *
 * Plural nodes are addressed whole — `messages.unreadCount`, never
 * `messages.unreadCount.one` — so they are a leaf here rather than a branch,
 * and they belong to `PluralKey` instead of `TranslationKey`.
 */
type Leaves<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : IsPlural<T[K]> extends true
      ? never
      : Leaves<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

type PluralLeaves<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? never
    : IsPlural<T[K]> extends true
      ? `${Prefix}${K}`
      : PluralLeaves<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type TranslationKey = Leaves<Dictionary>;
export type PluralKey = PluralLeaves<Dictionary>;

interface I18nValue {
  language: Language;
  setLanguage: (next: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  tn: (key: PluralKey, count: number, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function lookupNode(dict: Dictionary, key: string): unknown {
  return key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) return (acc as Record<string, unknown>)[part];
    return undefined;
  }, dict);
}

function lookup(dict: Dictionary, key: string): string | undefined {
  const value = lookupNode(dict, key);
  return typeof value === "string" ? value : undefined;
}

function lookupForms(dict: Dictionary, key: string): PluralForms | undefined {
  const value = lookupNode(dict, key);
  return value && typeof value === "object" ? (value as PluralForms) : undefined;
}

/** Fills `{{name}}` placeholders, leaving any it has no value for untouched. */
function fill(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole,
  );
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
      return fill(template, vars);
    },
    [language],
  );

  /**
   * The count-dependent twin of `t`. Russian needs one/few/many where English
   * needs one/other, so the category comes from `Intl.PluralRules` for the
   * language actually being shown — never from a hand-written `n === 1`.
   *
   * `{{count}}` is filled in automatically; anything else comes from `vars`.
   */
  const tn = useCallback<I18nValue["tn"]>(
    (key, count, vars) => {
      const forms = lookupForms(DICTIONARIES[language], key) ?? lookupForms(en, key);
      if (!forms) return key;

      const rule = new Intl.PluralRules(language).select(count);
      const template = forms[rule] ?? forms.other;
      return fill(template, { count, ...vars });
    },
    [language],
  );

  const value = useMemo(() => ({ language, setLanguage, t, tn }), [language, setLanguage, t, tn]);

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

/** Shorthand for screens that only need the count-aware translate function. */
export function useTn(): I18nValue["tn"] {
  return useI18n().tn;
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

/**
 * Dates and times in the chosen language. Wraps `lib/format`, which holds the
 * day-first, 24-hour conventions this audience expects; the language only picks
 * which locale renders them.
 */
export function useFormatters(): Formatters {
  const { language } = useI18n();
  return useMemo(() => makeFormatters(language), [language]);
}

/**
 * The locale object `date-fns` wants, for the two screens that use it to say
 * things like "3 days ago" — `undefined` is its own English default.
 */
export function useDateFnsLocale(): DateFnsLocale | undefined {
  const { language } = useI18n();
  return language === "ru" ? ruDateLocale : undefined;
}
