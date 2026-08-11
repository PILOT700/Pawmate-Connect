import { Router, type IRouter } from "express";
import { and, desc, eq, or } from "drizzle-orm";
import { db, usersTable, blocksTable, matchesTable } from "@workspace/db";
import {
  BlockUserBody,
  ListBlockedUsersResponse,
  UnblockUserParams,
} from "@workspace/api-zod";
import { HttpError } from "../lib/http-error";
import { requireAuth } from "../middlewares/require-auth";

const router: IRouter = Router();

// Matches store their pair sorted, so the same ordering is needed to find one.
function orderPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

router.get("/blocks", requireAuth, async (req, res) => {
  const rows = await db
    .select({
      id: usersTable.id,
      firstName: usersTable.firstName,
      avatarUrl: usersTable.avatarUrl,
      blockedAt: blocksTable.createdAt,
    })
    .from(blocksTable)
    .innerJoin(usersTable, eq(blocksTable.blockedUserId, usersTable.id))
    .where(eq(blocksTable.blockerId, req.user!.id))
    .orderBy(desc(blocksTable.createdAt));

  res.json(ListBlockedUsersResponse.parse(rows));
});

router.post("/blocks", requireAuth, async (req, res) => {
  const body = BlockUserBody.parse(req.body);
  const meId = req.user!.id;

  if (body.userId === meId) {
    throw HttpError.notFound("User not found");
  }

  const [target] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.id, body.userId))
    .limit(1);

  if (!target) {
    throw HttpError.notFound("User not found");
  }

  await db
    .insert(blocksTable)
    .values({ blockerId: meId, blockedUserId: body.userId })
    .onConflictDoNothing();

  // Blocking ends the relationship: the match goes, taking its messages,
  // playdates, and read markers with it.
  const [userOneId, userTwoId] = orderPair(meId, body.userId);

  await db
    .delete(matchesTable)
    .where(and(eq(matchesTable.userOneId, userOneId), eq(matchesTable.userTwoId, userTwoId)));

  res.status(204).end();
});

router.delete("/blocks/:userId", requireAuth, async (req, res) => {
  const { userId } = UnblockUserParams.parse(req.params);

  const deleted = await db
    .delete(blocksTable)
    .where(and(eq(blocksTable.blockerId, req.user!.id), eq(blocksTable.blockedUserId, userId)))
    .returning({ id: blocksTable.id });

  if (deleted.length === 0) {
    throw HttpError.notFound("Block not found");
  }

  res.status(204).end();
});

export default router;
