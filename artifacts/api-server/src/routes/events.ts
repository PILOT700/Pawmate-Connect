import { Router, type IRouter } from "express";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { db, communityEventsTable, eventRsvpsTable, eventSavesTable } from "@workspace/db";
import {
  ListEventsQueryParams,
  ListEventsResponse,
  CreateEventBody,
  GetEventParams,
  GetEventResponse,
  RsvpToEventParams,
  CancelEventRsvpParams,
  SaveEventParams,
  UnsaveEventParams,
} from "@workspace/api-zod";
import { parsePagination } from "../lib/pagination";
import { HttpError } from "../lib/http-error";
import { requireAuth } from "../middlewares/require-auth";

const router: IRouter = Router();

async function assertEventExists(eventId: string): Promise<void> {
  const [event] = await db
    .select({ id: communityEventsTable.id })
    .from(communityEventsTable)
    .where(eq(communityEventsTable.id, eventId))
    .limit(1);

  if (!event) {
    throw HttpError.notFound("Event not found");
  }
}

router.get("/events", requireAuth, async (req, res) => {
  const query = ListEventsQueryParams.parse(req.query);
  const { limit, offset } = parsePagination(query);
  const meId = req.user!.id;

  const where = query.category ? eq(communityEventsTable.category, query.category) : undefined;

  const [events, [totalRow]] = await Promise.all([
    db
      .select()
      .from(communityEventsTable)
      .where(where)
      .orderBy(desc(communityEventsTable.startAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(communityEventsTable).where(where),
  ]);

  const eventIds = events.map((event) => event.id);

  const [rsvpCounts, myRsvps, mySaves] = await Promise.all([
    eventIds.length
      ? db
          .select({ eventId: eventRsvpsTable.eventId, value: count() })
          .from(eventRsvpsTable)
          .where(inArray(eventRsvpsTable.eventId, eventIds))
          .groupBy(eventRsvpsTable.eventId)
      : ([] as { eventId: string; value: number }[]),
    eventIds.length
      ? db
          .select({ eventId: eventRsvpsTable.eventId })
          .from(eventRsvpsTable)
          .where(and(inArray(eventRsvpsTable.eventId, eventIds), eq(eventRsvpsTable.userId, meId)))
      : [],
    eventIds.length
      ? db
          .select({ eventId: eventSavesTable.eventId })
          .from(eventSavesTable)
          .where(and(inArray(eventSavesTable.eventId, eventIds), eq(eventSavesTable.userId, meId)))
      : [],
  ]);

  const rsvpedIds = new Set(myRsvps.map((row) => row.eventId));
  const savedIds = new Set(mySaves.map((row) => row.eventId));

  const items = events.map((event) => ({
    ...event,
    attendeeCount: rsvpCounts.find((row) => row.eventId === event.id)?.value ?? 0,
    rsvped: rsvpedIds.has(event.id),
    saved: savedIds.has(event.id),
  }));

  res.json(ListEventsResponse.parse({ items, total: totalRow?.value ?? 0 }));
});

router.post("/events", requireAuth, async (req, res) => {
  const body = CreateEventBody.parse(req.body);

  const [event] = await db
    .insert(communityEventsTable)
    .values({ ...body, organizerId: req.user!.id })
    .returning();

  res.status(201).json(GetEventResponse.parse({ ...event, attendeeCount: 0, rsvped: false, saved: false }));
});

router.get("/events/:eventId", requireAuth, async (req, res) => {
  const { eventId } = GetEventParams.parse(req.params);
  const meId = req.user!.id;

  const [event] = await db
    .select()
    .from(communityEventsTable)
    .where(eq(communityEventsTable.id, eventId))
    .limit(1);

  if (!event) {
    throw HttpError.notFound("Event not found");
  }

  const [[attendees], myRsvp, mySave] = await Promise.all([
    db.select({ value: count() }).from(eventRsvpsTable).where(eq(eventRsvpsTable.eventId, eventId)),
    db
      .select({ id: eventRsvpsTable.id })
      .from(eventRsvpsTable)
      .where(and(eq(eventRsvpsTable.eventId, eventId), eq(eventRsvpsTable.userId, meId)))
      .limit(1),
    db
      .select({ id: eventSavesTable.id })
      .from(eventSavesTable)
      .where(and(eq(eventSavesTable.eventId, eventId), eq(eventSavesTable.userId, meId)))
      .limit(1),
  ]);

  res.json(
    GetEventResponse.parse({
      ...event,
      attendeeCount: attendees?.value ?? 0,
      rsvped: myRsvp.length > 0,
      saved: mySave.length > 0,
    }),
  );
});

router.post("/events/:eventId/rsvp", requireAuth, async (req, res) => {
  const { eventId } = RsvpToEventParams.parse(req.params);
  await assertEventExists(eventId);

  await db
    .insert(eventRsvpsTable)
    .values({ eventId, userId: req.user!.id })
    .onConflictDoNothing();

  res.status(204).end();
});

router.delete("/events/:eventId/rsvp", requireAuth, async (req, res) => {
  const { eventId } = CancelEventRsvpParams.parse(req.params);
  await assertEventExists(eventId);

  await db
    .delete(eventRsvpsTable)
    .where(and(eq(eventRsvpsTable.eventId, eventId), eq(eventRsvpsTable.userId, req.user!.id)));

  res.status(204).end();
});

router.post("/events/:eventId/save", requireAuth, async (req, res) => {
  const { eventId } = SaveEventParams.parse(req.params);
  await assertEventExists(eventId);

  await db
    .insert(eventSavesTable)
    .values({ eventId, userId: req.user!.id })
    .onConflictDoNothing();

  res.status(204).end();
});

router.delete("/events/:eventId/save", requireAuth, async (req, res) => {
  const { eventId } = UnsaveEventParams.parse(req.params);
  await assertEventExists(eventId);

  await db
    .delete(eventSavesTable)
    .where(and(eq(eventSavesTable.eventId, eventId), eq(eventSavesTable.userId, req.user!.id)));

  res.status(204).end();
});

export default router;
