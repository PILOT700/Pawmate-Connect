import { pgTable, integer, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { speciesEnum, lookingForEnum } from "./enums";

export const userPreferencesTable = pgTable("user_preferences", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  maxDistanceMiles: integer("max_distance_miles").notNull().default(25),
  ageRangeMin: integer("age_range_min").notNull().default(25),
  ageRangeMax: integer("age_range_max").notNull().default(55),
  petTypePrefs: speciesEnum("pet_type_prefs").array().notNull().default([]),
  lookingForPrefs: lookingForEnum("looking_for_prefs").array().notNull().default([]),
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferencesTable);
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferencesTable.$inferSelect;
