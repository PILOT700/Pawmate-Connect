import { pgTable, timestamp, uuid, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const likesTable = pgTable(
  "likes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    likerId: uuid("liker_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    likedUserId: uuid("liked_user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.likerId, table.likedUserId)],
);

export const insertLikeSchema = createInsertSchema(likesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type Like = typeof likesTable.$inferSelect;
