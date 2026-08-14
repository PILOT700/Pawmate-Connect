import { describe } from "vitest";
import { sql } from "drizzle-orm";
import { db, usersTable, petsTable, type Species } from "@workspace/db";

/**
 * Tests that need a database are skipped rather than failed when there isn't
 * one. A contributor without Docker running should still get a green `pnpm
 * test` for everything that stands alone, and a clear reason for the rest.
 */
export const hasTestDatabase = Boolean(process.env["TEST_DATABASE_URL"]);

export const describeWithDb = describe.skipIf(!hasTestDatabase);

/**
 * Empties every table between tests. TRUNCATE ... CASCADE in one statement
 * keeps it independent of the order the foreign keys run in.
 */
export async function resetDatabase() {
  await db.execute(sql`
    TRUNCATE TABLE
      users, pets, sessions, password_reset_tokens,
      user_preferences, user_settings,
      likes, passes, matches, playdates, messages, message_reads,
      community_events, event_rsvps, event_saves, event_comments,
      event_comment_likes, stories, story_views, notifications,
      blocks, reports
    RESTART IDENTITY CASCADE
  `);
}

let counter = 0;

/** A saved member, with only the fields a given test cares about spelled out. */
export async function makeUser(overrides: {
  firstName?: string;
  age?: number | null;
  city?: string | null;
  cityLat?: number | null;
  cityLng?: number | null;
  lookingFor?: ("friendship" | "relationship" | "playdates" | "casual" | "open")[];
} = {}) {
  counter += 1;

  const [user] = await db
    .insert(usersTable)
    .values({
      email: `member-${counter}-${Date.now()}@example.test`,
      passwordHash: "not-a-real-hash",
      firstName: overrides.firstName ?? `Member ${counter}`,
      age: overrides.age ?? null,
      city: overrides.city ?? null,
      cityLat: overrides.cityLat ?? null,
      cityLng: overrides.cityLng ?? null,
      ...(overrides.lookingFor ? { lookingFor: overrides.lookingFor } : {}),
    })
    .returning();

  return user!;
}

export async function makePet(userId: string, species: Species, name = "Pet") {
  const [pet] = await db.insert(petsTable).values({ userId, name, species }).returning();
  return pet!;
}
