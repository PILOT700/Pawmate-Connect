/**
 * Dates and times, in one place.
 *
 * The audience is Europe and the Russian-speaking countries of the CIS, where a
 * clock runs to 24 and a date starts with the day. Every screen used
 * `en-US` with `hour12: true`, which reads "3:33 PM" and puts the month first —
 * correct in one country and confusing across the ones this is built for.
 *
 * The locale stays English because the interface is still English; only the
 * conventions change. When the interface is translated, this is the file that
 * learns the user's language.
 */
const LOCALE = "en-GB";

/** 15:33 */
export function formatTime(value: Date | string | number): string {
  return new Date(value).toLocaleTimeString(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** 16 Aug */
export function formatDayMonth(value: Date | string | number): string {
  return new Date(value).toLocaleDateString(LOCALE, { day: "numeric", month: "short" });
}

/** Sat, 16 Aug */
export function formatWeekdayDate(value: Date | string | number): string {
  return new Date(value).toLocaleDateString(LOCALE, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** 16/08/2026 */
export function formatDate(value: Date | string | number): string {
  return new Date(value).toLocaleDateString(LOCALE);
}
