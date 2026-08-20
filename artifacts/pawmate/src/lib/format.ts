/**
 * Dates and times, in one place.
 *
 * The audience is Europe and the Russian-speaking countries of the CIS, where a
 * clock runs to 24 and a date starts with the day. Every screen used
 * `en-US` with `hour12: true`, which reads "3:33 PM" and puts the month first —
 * correct in one country and confusing across the ones this is built for.
 *
 * Now that the interface is translated, the locale follows the chosen language:
 * a Russian screen that still said "Sat, 16 Aug" would be half-translated.
 * `useFormatters` in `lib/i18n` is how screens reach these — the bare functions
 * below stay exported for the odd caller that has no React context to read.
 */

/**
 * `ru-RU` rather than plain `ru`: the bare language tag leaves the region to
 * the browser, and a day-month order is the point of this file.
 */
const LOCALES = { en: "en-GB", ru: "ru-RU" } as const;

export type FormatLanguage = keyof typeof LOCALES;

export interface Formatters {
  /** The BCP 47 tag behind these formatters, for one-off `Intl` calls. */
  locale: string;
  /** 15:33 */
  formatTime: (value: Date | string | number) => string;
  /** 16 Aug · 16 авг. */
  formatDayMonth: (value: Date | string | number) => string;
  /** Sat, 16 Aug · сб, 16 авг. */
  formatWeekdayDate: (value: Date | string | number) => string;
  /** 16/08/2026 · 16.08.2026 */
  formatDate: (value: Date | string | number) => string;
}

export function makeFormatters(language: FormatLanguage): Formatters {
  const locale = LOCALES[language];

  return {
    locale,

    formatTime: (value) =>
      new Date(value).toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),

    formatDayMonth: (value) =>
      new Date(value).toLocaleDateString(locale, { day: "numeric", month: "short" }),

    formatWeekdayDate: (value) =>
      new Date(value).toLocaleDateString(locale, {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),

    formatDate: (value) => new Date(value).toLocaleDateString(locale),
  };
}

const english = makeFormatters("en");

export const formatTime = english.formatTime;
export const formatDayMonth = english.formatDayMonth;
export const formatWeekdayDate = english.formatWeekdayDate;
export const formatDate = english.formatDate;
