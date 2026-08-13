import { pgTable, text, integer, boolean, doublePrecision, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { lookingForEnum } from "./enums";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  age: integer("age"),
  city: text("city"),
  // The city's coordinates, not the member's — looked up from the name they
  // typed, so everyone in one city sits on the same point. Good enough to sort
  // "nearby" from "far", and it keeps us from holding anyone's real location.
  cityLat: doublePrecision("city_lat"),
  cityLng: doublePrecision("city_lng"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  lookingFor: lookingForEnum("looking_for").array().notNull().default([]),
  lifestyleTags: text("lifestyle_tags").array().notNull().default([]),
  isOnline: boolean("is_online").notNull().default(false),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  language: text("language").notNull().default("en"),
  onboardingCompletedAt: timestamp("onboarding_completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
