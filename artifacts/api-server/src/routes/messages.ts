import { Router, type IRouter } from "express";
import { count, eq } from "drizzle-orm";
import { db, messagesTable, messageReadsTable } from "@workspace/db";
import {
  ListMessagesParams,
  ListMessagesQueryParams,
  ListMessagesResponse,
  SendMessageParams,
  SendMessageBody,
  MarkMatchReadParams,
} from "@workspace/api-zod";
import { parsePagination } from "../lib/pagination";
import { requireMatchParticipant } from "../lib/match-access";
import { requireAuth } from "../middlewares/require-auth";

const router: IRouter = Router();

router.get("/matches/:matchId/messages", requireAuth, async (req, res) => {
  const { matchId } = ListMessagesParams.parse(req.params);
  const query = ListMessagesQueryParams.parse(req.query);
  const { limit, offset } = parsePagination(query);

  await requireMatchParticipant(matchId, req.user!.id);

  const where = eq(messagesTable.matchId, matchId);

  const [items, [totalRow]] = await Promise.all([
    db.select().from(messagesTable).where(where).orderBy(messagesTable.sentAt).limit(limit).offset(offset),
    db.select({ value: count() }).from(messagesTable).where(where),
  ]);

  res.json(ListMessagesResponse.parse({ items, total: totalRow?.value ?? 0 }));
});

router.post("/matches/:matchId/messages", requireAuth, async (req, res) => {
  const { matchId } = SendMessageParams.parse(req.params);
  const body = SendMessageBody.parse(req.body);

  await requireMatchParticipant(matchId, req.user!.id);

  const [message] = await db
    .insert(messagesTable)
    .values({ matchId, senderId: req.user!.id, kind: "text", text: body.text })
    .returning();

  res.status(201).json(message);
});

router.post("/matches/:matchId/read", requireAuth, async (req, res) => {
  const { matchId } = MarkMatchReadParams.parse(req.params);
  const meId = req.user!.id;

  await requireMatchParticipant(matchId, meId);

  const lastReadAt = new Date();

  await db
    .insert(messageReadsTable)
    .values({ matchId, userId: meId, lastReadAt })
    .onConflictDoUpdate({
      target: [messageReadsTable.matchId, messageReadsTable.userId],
      set: { lastReadAt },
    });

  res.status(204).end();
});

export default router;
