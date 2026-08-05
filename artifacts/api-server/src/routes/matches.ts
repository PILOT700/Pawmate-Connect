import { Router, type IRouter } from "express";
import { and, count, desc, eq, gt, inArray, isNull, ne, or } from "drizzle-orm";
import { db, usersTable, petsTable, matchesTable, messagesTable, messageReadsTable } from "@workspace/db";
import { ListMatchesQueryParams, ListMatchesResponse } from "@workspace/api-zod";
import { parsePagination } from "../lib/pagination";
import { requireAuth } from "../middlewares/require-auth";

const router: IRouter = Router();

router.get("/matches", requireAuth, async (req, res) => {
  const query = ListMatchesQueryParams.parse(req.query);
  const { limit, offset } = parsePagination(query);
  const meId = req.user!.id;

  const where = or(eq(matchesTable.userOneId, meId), eq(matchesTable.userTwoId, meId));

  const [matches, [totalRow]] = await Promise.all([
    db.select().from(matchesTable).where(where).orderBy(desc(matchesTable.matchedAt)).limit(limit).offset(offset),
    db.select({ value: count() }).from(matchesTable).where(where),
  ]);

  if (matches.length === 0) {
    res.json(ListMatchesResponse.parse({ items: [], total: totalRow?.value ?? 0 }));
    return;
  }

  const matchIds = matches.map((match) => match.id);
  const otherUserIds = matches.map((match) => (match.userOneId === meId ? match.userTwoId : match.userOneId));

  const [otherUsers, pets, lastMessages, unreadRows] = await Promise.all([
    db.select().from(usersTable).where(inArray(usersTable.id, otherUserIds)),
    db.select().from(petsTable).where(inArray(petsTable.userId, otherUserIds)),
    db
      .selectDistinctOn([messagesTable.matchId])
      .from(messagesTable)
      .where(inArray(messagesTable.matchId, matchIds))
      .orderBy(messagesTable.matchId, desc(messagesTable.sentAt)),
    db
      .select({ matchId: messagesTable.matchId, value: count() })
      .from(messagesTable)
      .leftJoin(
        messageReadsTable,
        and(eq(messageReadsTable.matchId, messagesTable.matchId), eq(messageReadsTable.userId, meId)),
      )
      .where(
        and(
          inArray(messagesTable.matchId, matchIds),
          ne(messagesTable.senderId, meId),
          or(isNull(messageReadsTable.lastReadAt), gt(messagesTable.sentAt, messageReadsTable.lastReadAt)),
        ),
      )
      .groupBy(messagesTable.matchId),
  ]);

  const items = matches.map((match) => {
    const otherUserId = match.userOneId === meId ? match.userTwoId : match.userOneId;
    const lastMessage = lastMessages.find((msg) => msg.matchId === match.id);

    return {
      id: match.id,
      matchedAt: match.matchedAt,
      otherUser: otherUsers.find((user) => user.id === otherUserId),
      otherPet: pets.find((pet) => pet.userId === otherUserId),
      lastMessage: lastMessage?.text ?? null,
      lastMessageAt: lastMessage?.sentAt ?? null,
      unreadCount: unreadRows.find((row) => row.matchId === match.id)?.value ?? 0,
    };
  });

  res.json(ListMatchesResponse.parse({ items, total: totalRow?.value ?? 0 }));
});

export default router;
