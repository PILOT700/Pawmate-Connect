import { Router, type IRouter } from "express";
import { and, eq, or } from "drizzle-orm";
import {
  db,
  usersTable,
  blocksTable,
  petsTable,
  userPreferencesTable,
  userSettingsTable,
  likesTable,
  passesTable,
  matchesTable,
  messagesTable,
  playdatesTable,
  communityEventsTable,
  eventRsvpsTable,
  eventSavesTable,
  eventCommentsTable,
  storiesTable,
  reportsTable,
  notificationsTable,
} from "@workspace/db";
import {
  GetMyProfileResponse,
  UpdateMyProfileBody,
  UpdateMyProfileResponse,
  GetUserProfileParams,
  GetUserProfileResponse,
} from "@workspace/api-zod";
import { HttpError } from "../lib/http-error";
import { geocodeCity } from "../lib/geocode";
import { requireAuth } from "../middlewares/require-auth";

const router: IRouter = Router();

router.get("/users/me", requireAuth, (req, res) => {
  res.json(GetMyProfileResponse.parse(req.user));
});

router.patch("/users/me", requireAuth, async (req, res) => {
  const body = UpdateMyProfileBody.parse(req.body);

  // The city drives the distance filter, so its point is refreshed whenever the
  // name changes — and cleared when the city is removed, rather than left
  // pointing at wherever they used to live.
  const location: { cityLat?: number | null; cityLng?: number | null } = {};
  if (body.city !== undefined && body.city !== req.user!.city) {
    const point = body.city ? await geocodeCity(body.city) : null;
    location.cityLat = point?.lat ?? null;
    location.cityLng = point?.lng ?? null;
  }

  const [user] = await db
    .update(usersTable)
    .set({ ...body, ...location, updatedAt: new Date() })
    .where(eq(usersTable.id, req.user!.id))
    .returning();

  res.json(UpdateMyProfileResponse.parse(user));
});

router.get("/users/me/export", requireAuth, async (req, res) => {
  const meId = req.user!.id;

  const [
    pets,
    preferences,
    settings,
    likesSent,
    passes,
    matches,
    messagesWritten,
    playdatesProposed,
    eventsCreated,
    eventRsvps,
    eventSaves,
    eventComments,
    stories,
    blocks,
    reports,
    notifications,
  ] = await Promise.all([
    db.select().from(petsTable).where(eq(petsTable.userId, meId)),
    db.select().from(userPreferencesTable).where(eq(userPreferencesTable.userId, meId)),
    db.select().from(userSettingsTable).where(eq(userSettingsTable.userId, meId)),
    db.select().from(likesTable).where(eq(likesTable.likerId, meId)),
    db.select().from(passesTable).where(eq(passesTable.userId, meId)),
    db
      .select()
      .from(matchesTable)
      .where(or(eq(matchesTable.userOneId, meId), eq(matchesTable.userTwoId, meId))),
    // Only what this member wrote. The other half of a conversation belongs to
    // the person who wrote it, and handing it over here would export them too.
    db.select().from(messagesTable).where(eq(messagesTable.senderId, meId)),
    db.select().from(playdatesTable).where(eq(playdatesTable.proposedByUserId, meId)),
    db.select().from(communityEventsTable).where(eq(communityEventsTable.organizerId, meId)),
    db.select().from(eventRsvpsTable).where(eq(eventRsvpsTable.userId, meId)),
    db.select().from(eventSavesTable).where(eq(eventSavesTable.userId, meId)),
    db.select().from(eventCommentsTable).where(eq(eventCommentsTable.authorId, meId)),
    db.select().from(storiesTable).where(eq(storiesTable.userId, meId)),
    db.select().from(blocksTable).where(eq(blocksTable.blockerId, meId)),
    db.select().from(reportsTable).where(eq(reportsTable.reporterId, meId)),
    db.select().from(notificationsTable).where(eq(notificationsTable.userId, meId)),
  ]);

  // The password hash is not the member's data in any useful sense, and handing
  // it out turns a download into an offline cracking target.
  const { passwordHash: _omitted, ...account } = req.user!;

  res
    .setHeader("Content-Disposition", 'attachment; filename="pawmate-my-data.json"')
    .json({
      exportedAt: new Date().toISOString(),
      account,
      pets,
      preferences: preferences[0] ?? null,
      settings: settings[0] ?? null,
      activity: {
        likesSent,
        passes,
        matches,
        messagesWritten,
        playdatesProposed,
        eventsCreated,
        eventRsvps,
        eventSaves,
        eventComments,
        stories,
        blocks,
        reports,
        notifications,
      },
    });
});

router.delete("/users/me", requireAuth, async (req, res) => {
  await db.delete(usersTable).where(eq(usersTable.id, req.user!.id));
  res.status(204).end();
});

router.get("/users/:userId", requireAuth, async (req, res) => {
  const { userId } = GetUserProfileParams.parse(req.params);

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

  if (!user) {
    throw HttpError.notFound("User not found");
  }

  // A block hides the pair from each other, so the profile reads as missing.
  const meId = req.user!.id;
  const [block] = await db
    .select({ id: blocksTable.id })
    .from(blocksTable)
    .where(
      or(
        and(eq(blocksTable.blockerId, meId), eq(blocksTable.blockedUserId, userId)),
        and(eq(blocksTable.blockerId, userId), eq(blocksTable.blockedUserId, meId)),
      ),
    )
    .limit(1);

  if (block) {
    throw HttpError.notFound("User not found");
  }

  res.json(GetUserProfileResponse.parse(user));
});

export default router;
