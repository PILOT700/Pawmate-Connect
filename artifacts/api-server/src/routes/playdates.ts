import { Router, type IRouter } from "express";
import { count, desc, eq, inArray, or } from "drizzle-orm";
import { db, matchesTable, playdatesTable, messagesTable, usersTable } from "@workspace/db";
import {
  ProposePlaydateParams,
  ProposePlaydateBody,
  ListPlaydatesQueryParams,
  ListPlaydatesResponse,
  RespondToPlaydateParams,
  RespondToPlaydateBody,
  RespondToPlaydateResponse,
} from "@workspace/api-zod";
import { parsePagination } from "../lib/pagination";
import { requireMatchParticipant } from "../lib/match-access";
import { createNotifications } from "../lib/notifications";
import { HttpError } from "../lib/http-error";
import { requireAuth } from "../middlewares/require-auth";

const router: IRouter = Router();

// The `date` column is a Postgres DATE; drizzle takes/returns it as YYYY-MM-DD,
// while the generated schema coerces it to a Date.
function toDateColumn(date: Date): string {
  return date.toISOString().slice(0, 10);
}

router.post("/matches/:matchId/playdates", requireAuth, async (req, res) => {
  const { matchId } = ProposePlaydateParams.parse(req.params);
  const body = ProposePlaydateBody.parse(req.body);
  const meId = req.user!.id;

  const match = await requireMatchParticipant(matchId, meId);

  const [playdate] = await db
    .insert(playdatesTable)
    .values({
      matchId,
      proposedByUserId: meId,
      place: body.place,
      placeSub: body.placeSub,
      date: toDateColumn(body.date),
      timeSlot: body.timeSlot,
    })
    .returning();

  await db
    .insert(messagesTable)
    .values({ matchId, senderId: meId, kind: "playdate", playdateId: playdate!.id });

  const recipientId = match.userOneId === meId ? match.userTwoId : match.userOneId;

  const [proposer] = await db
    .select({ firstName: usersTable.firstName, avatarUrl: usersTable.avatarUrl })
    .from(usersTable)
    .where(eq(usersTable.id, meId))
    .limit(1);

  await createNotifications([
    {
      userId: recipientId,
      type: "playdate",
      title: "Playdate invite",
      body: `${proposer?.firstName ?? "Your match"} suggested ${body.place}.`,
      ...(proposer?.firstName ? { params: { name: proposer.firstName, place: body.place } } : {}),
      relatedEntityType: "match",
      relatedEntityId: matchId,
      avatarUrl: proposer?.avatarUrl ?? null,
    },
  ]);

  res.status(201).json(RespondToPlaydateResponse.parse(playdate));
});

router.get("/playdates", requireAuth, async (req, res) => {
  const query = ListPlaydatesQueryParams.parse(req.query);
  const { limit, offset } = parsePagination(query);
  const meId = req.user!.id;

  const myMatches = await db
    .select({ id: matchesTable.id })
    .from(matchesTable)
    .where(or(eq(matchesTable.userOneId, meId), eq(matchesTable.userTwoId, meId)));

  const matchIds = myMatches.map((match) => match.id);

  if (matchIds.length === 0) {
    res.json(ListPlaydatesResponse.parse({ items: [], total: 0 }));
    return;
  }

  const where = inArray(playdatesTable.matchId, matchIds);

  const [items, [totalRow]] = await Promise.all([
    db.select().from(playdatesTable).where(where).orderBy(desc(playdatesTable.date)).limit(limit).offset(offset),
    db.select({ value: count() }).from(playdatesTable).where(where),
  ]);

  res.json(ListPlaydatesResponse.parse({ items, total: totalRow?.value ?? 0 }));
});

router.patch("/playdates/:playdateId", requireAuth, async (req, res) => {
  const { playdateId } = RespondToPlaydateParams.parse(req.params);
  const body = RespondToPlaydateBody.parse(req.body);

  const [existing] = await db.select().from(playdatesTable).where(eq(playdatesTable.id, playdateId)).limit(1);

  if (!existing) {
    throw HttpError.notFound("Playdate not found");
  }

  await requireMatchParticipant(existing.matchId, req.user!.id);

  const [playdate] = await db
    .update(playdatesTable)
    .set({ status: body.status, updatedAt: new Date() })
    .where(eq(playdatesTable.id, playdateId))
    .returning();

  res.json(RespondToPlaydateResponse.parse(playdate));
});

export default router;
