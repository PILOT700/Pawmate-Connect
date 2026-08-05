import { pgTable, timestamp, uuid, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const matchesTable = pgTable(
  "matches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userOneId: uuid("user_one_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    userTwoId: uuid("user_two_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    matchedAt: timestamp("matched_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.userOneId, table.userTwoId)],
);

export const insertMatchSchema = createInsertSchema(matchesTable).omit({
  id: true,
  matchedAt: true,
});
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matchesTable.$inferSelect;
