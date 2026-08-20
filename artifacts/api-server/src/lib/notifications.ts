import { inArray } from "drizzle-orm";
import { db, notificationsTable, userSettingsTable } from "@workspace/db";
import { logger } from "./logger";

export type NotificationInput = {
  userId: string;
  type: "match" | "message" | "view" | "playdate";
  /**
   * English text, rendered here and stored as written.
   *
   * It is the fallback: a reader whose client cannot resolve `params` sees
   * this, and it is what every row created before `params` existed carries.
   * For a `message` the body is the sender's own words and is shown verbatim
   * whatever language the reader is in.
   */
  title: string;
  body: string;
  /**
   * The values behind the sentence — a name, a place. The reader's client
   * composes the wording from these in the reader's own language, so the
   * server never decides what language a notification is read in.
   */
  params?: Record<string, string>;
  relatedEntityType?: string;
  relatedEntityId?: string;
  avatarUrl?: string | null;
};

/**
 * Which per-user toggle silences each notification type. Playdates have no
 * toggle of their own, so they always go through.
 */
const SETTING_FOR_TYPE = {
  match: "notifyNewMatches",
  message: "notifyMessages",
  view: "notifyProfileViews",
  playdate: null,
} as const satisfies Record<NotificationInput["type"], keyof typeof userSettingsTable.$inferSelect | null>;

/**
 * Writes notifications for recipients who haven't switched that type off.
 *
 * Delivery is best-effort: a failure here must not fail the action that
 * triggered it, so errors are logged rather than thrown.
 */
export async function createNotifications(inputs: NotificationInput[]): Promise<void> {
  if (inputs.length === 0) return;

  try {
    const recipientIds = [...new Set(inputs.map((input) => input.userId))];

    const settings = await db
      .select()
      .from(userSettingsTable)
      .where(inArray(userSettingsTable.userId, recipientIds));

    const settingsByUser = new Map(settings.map((row) => [row.userId, row]));

    const wanted = inputs.filter((input) => {
      const key = SETTING_FOR_TYPE[input.type];
      if (key === null) return true;

      // A user with no settings row yet keeps the defaults, which are on.
      const row = settingsByUser.get(input.userId);
      return row ? row[key] : true;
    });

    if (wanted.length === 0) return;

    await db.insert(notificationsTable).values(
      wanted.map((input) => ({
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        params: input.params ?? null,
        relatedEntityType: input.relatedEntityType ?? null,
        relatedEntityId: input.relatedEntityId ?? null,
        avatarUrl: input.avatarUrl ?? null,
      })),
    );
  } catch (err) {
    logger.error({ err }, "Failed to write notifications");
  }
}
