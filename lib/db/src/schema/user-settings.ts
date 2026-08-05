import { pgTable, boolean, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const userSettingsTable = pgTable("user_settings", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  notifyNewMatches: boolean("notify_new_matches").notNull().default(true),
  notifyMessages: boolean("notify_messages").notNull().default(true),
  notifyProfileViews: boolean("notify_profile_views").notNull().default(false),
  notifyWeeklyDigest: boolean("notify_weekly_digest").notNull().default(true),
  notifyEmail: boolean("notify_email").notNull().default(false),
  notifyPush: boolean("notify_push").notNull().default(true),
  privacyShowDistance: boolean("privacy_show_distance").notNull().default(true),
  privacyShowLastActive: boolean("privacy_show_last_active").notNull().default(false),
  privacyShowAge: boolean("privacy_show_age").notNull().default(true),
  privacyIncognito: boolean("privacy_incognito").notNull().default(false),
  privacyShareActivity: boolean("privacy_share_activity").notNull().default(true),
  darkMode: boolean("dark_mode").notNull().default(false),
  locationServicesEnabled: boolean("location_services_enabled").notNull().default(true),
  readReceiptsEnabled: boolean("read_receipts_enabled").notNull().default(true),
});

export const insertUserSettingsSchema = createInsertSchema(userSettingsTable);
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettingsTable.$inferSelect;
