import { pgTable, timestamp, uuid, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { storiesTable } from "./stories";

export const storyViewsTable = pgTable(
  "story_views",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storyId: uuid("story_id")
      .notNull()
      .references(() => storiesTable.id, { onDelete: "cascade" }),
    viewerId: uuid("viewer_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    viewedAt: timestamp("viewed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.storyId, table.viewerId)],
);

export const insertStoryViewSchema = createInsertSchema(storyViewsTable).omit({
  id: true,
  viewedAt: true,
});
export type InsertStoryView = z.infer<typeof insertStoryViewSchema>;
export type StoryView = typeof storyViewsTable.$inferSelect;
