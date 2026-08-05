import { pgTable, timestamp, uuid, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { eventCommentsTable } from "./event-comments";

export const eventCommentLikesTable = pgTable(
  "event_comment_likes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    commentId: uuid("comment_id")
      .notNull()
      .references(() => eventCommentsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.commentId, table.userId)],
);

export const insertEventCommentLikeSchema = createInsertSchema(eventCommentLikesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertEventCommentLike = z.infer<typeof insertEventCommentLikeSchema>;
export type EventCommentLike = typeof eventCommentLikesTable.$inferSelect;
