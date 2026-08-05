import { pgTable, timestamp, uuid, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { communityEventsTable } from "./community-events";

export const eventSavesTable = pgTable(
  "event_saves",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => communityEventsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.eventId, table.userId)],
);

export const insertEventSaveSchema = createInsertSchema(eventSavesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertEventSave = z.infer<typeof insertEventSaveSchema>;
export type EventSave = typeof eventSavesTable.$inferSelect;
