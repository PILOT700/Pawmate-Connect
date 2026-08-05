import { pgTable, text, date, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { matchesTable } from "./matches";
import { playdateStatusEnum } from "./enums";

export const playdatesTable = pgTable("playdates", {
  id: uuid("id").primaryKey().defaultRandom(),
  matchId: uuid("match_id")
    .notNull()
    .references(() => matchesTable.id, { onDelete: "cascade" }),
  proposedByUserId: uuid("proposed_by_user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  place: text("place").notNull(),
  placeSub: text("place_sub"),
  date: date("date").notNull(),
  timeSlot: text("time_slot").notNull(),
  status: playdateStatusEnum("status").notNull().default("proposed"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPlaydateSchema = createInsertSchema(playdatesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPlaydate = z.infer<typeof insertPlaydateSchema>;
export type Playdate = typeof playdatesTable.$inferSelect;
