import { pgTable, timestamp, uuid, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const passesTable = pgTable(
  "passes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    passedUserId: uuid("passed_user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.userId, table.passedUserId)],
);

export const insertPassSchema = createInsertSchema(passesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertPass = z.infer<typeof insertPassSchema>;
export type Pass = typeof passesTable.$inferSelect;
