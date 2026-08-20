import type { TranslationKey } from "@/lib/i18n";
import { playdatePlaceKey } from "@/lib/playdate-places";

type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string;

/** The shape this needs from a notification — the drawer's row carries more. */
export interface NotificationLike {
  type: string;
  title: string;
  body: string;
  params?: Record<string, string> | null;
}

/**
 * What a notification says, in the reader's language.
 *
 * The server stores the English it rendered plus the values behind it. When the
 * values are there the sentence is composed here, so one member reads a match
 * in Russian while the other reads the same match in English — the server never
 * decides. When they are not there — every row written before `params` existed
 * — the stored text is all there is, and showing it beats showing nothing.
 *
 * A message's body is never composed: it is what the sender typed.
 */
export function notificationText(
  n: NotificationLike,
  t: Translate,
): { title: string; body: string } {
  const p = n.params;
  if (!p) return { title: n.title, body: n.body };

  switch (n.type) {
    case "match":
      return { title: t("notifications.matchTitle"), body: t("notifications.matchBody", p) };

    case "message":
      return { title: t("notifications.messageTitle", p), body: n.body };

    case "playdate": {
      // A place we suggested has a name in both languages; one they typed does not.
      const key = p.place ? playdatePlaceKey(p.place) : undefined;
      return {
        title: t("notifications.playdateTitle"),
        body: t("notifications.playdateBody", { ...p, place: key ? t(key) : (p.place ?? "") }),
      };
    }

    default:
      return { title: n.title, body: n.body };
  }
}
