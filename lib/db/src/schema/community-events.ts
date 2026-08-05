import { pgTable, text, integer, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { eventCategoryEnum } from "./enums";

export const communityEventsTable = pgTable("community_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizerId: uuid("organizer_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  category: eventCategoryEnum("category").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  endAt: timestamp("end_at", { withTimezone: true }).notNull(),
  maxAttendees: integer("max_attendees"),
  tags: text("tags").array().notNull().default([]),
  featured: boolean("featured").notNull().default(false),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCommunityEventSchema = createInsertSchema(communityEventsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCommunityEvent = z.infer<typeof insertCommunityEventSchema>;
export type CommunityEvent = typeof communityEventsTable.$inferSelect;
