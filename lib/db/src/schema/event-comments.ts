import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { communityEventsTable } from "./community-events";

export const eventCommentsTable = pgTable("event_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => communityEventsTable.id, { onDelete: "cascade" }),
  authorId: uuid("author_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEventCommentSchema = createInsertSchema(eventCommentsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertEventComment = z.infer<typeof insertEventCommentSchema>;
export type EventComment = typeof eventCommentsTable.$inferSelect;
