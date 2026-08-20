import { pgTable, text, boolean, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { notificationTypeEnum } from "./enums";

export const notificationsTable = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  /**
   * The English text, as it was rendered when the notification was written.
   *
   * Kept because it is what rows created before `params` existed carry, and
   * because a `message` notification's body is the member's own words, which
   * are never translated. New rows fill it as a fallback for any reader that
   * cannot resolve `params`.
   */
  title: text("title").notNull(),
  body: text("body").notNull(),
  /**
   * The values behind the text — a name, a place — so the reader's own client
   * can compose the sentence in the reader's own language. Null on every row
   * written before this column existed; those keep showing `title` and `body`.
   */
  params: jsonb("params").$type<Record<string, string>>(),
  relatedEntityType: text("related_entity_type"),
  relatedEntityId: uuid("related_entity_id"),
  avatarUrl: text("avatar_url"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notificationsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notificationsTable.$inferSelect;
