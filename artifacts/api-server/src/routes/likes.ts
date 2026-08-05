import { Router, type IRouter } from "express";
import { and, count, desc, eq, inArray, or } from "drizzle-orm";
import { db, usersTable, petsTable, likesTable, matchesTable } from "@workspace/db";
import { CreateLikeBody, ListSentLikesQueryParams, ListSentLikesResponse } from "@workspace/api-zod";
import { parsePagination } from "../lib/pagination";
import { requireAuth } from "../middlewares/require-auth";

const router: IRouter = Router();

// The unique(userOneId, userTwoId) constraint is order-sensitive, so the pair is
// always stored sorted — otherwise A→B and B→A would create two separate matches.
function orderPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

router.post("/likes", requireAuth, async (req, res) => {
  const body = CreateLikeBody.parse(req.body);
  const meId = req.user!.id;

  const [like] = await db
    .insert(likesTable)
    .values({ likerId: meId, likedUserId: body.likedUserId })
    .onConflictDoNothing()
    .returning();

  const [existingLike] = like
    ? [like]
    : await db
        .select()
        .from(likesTable)
        .where(and(eq(likesTable.likerId, meId), eq(likesTable.likedUserId, body.likedUserId)))
        .limit(1);

  const [reciprocal] = await db
    .select({ id: likesTable.id })
    .from(likesTable)
    .where(and(eq(likesTable.likerId, body.likedUserId), eq(likesTable.likedUserId, meId)))
    .limit(1);

  let match;

  if (reciprocal) {
    const [userOneId, userTwoId] = orderPair(meId, body.likedUserId);

    const [created] = await db
      .insert(matchesTable)
      .values({ userOneId, userTwoId })
      .onConflictDoNothing()
      .returning();

    match =
      created ??
      (
        await db
          .select()
          .from(matchesTable)
          .where(and(eq(matchesTable.userOneId, userOneId), eq(matchesTable.userTwoId, userTwoId)))
          .limit(1)
      )[0];
  }

  res.status(201).json({ like: existingLike, isMatch: Boolean(reciprocal), match });
});

router.get("/likes/sent", requireAuth, async (req, res) => {
  const query = ListSentLikesQueryParams.parse(req.query);
  const { limit, offset } = parsePagination(query);
  const meId = req.user!.id;

  const where = eq(likesTable.likerId, meId);

  const [rows, [totalRow]] = await Promise.all([
    db
      .select({ like: likesTable, user: usersTable })
      .from(likesTable)
      .innerJoin(usersTable, eq(likesTable.likedUserId, usersTable.id))
      .where(where)
      .orderBy(desc(likesTable.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(likesTable).where(where),
  ]);

  const likedUserIds = rows.map((row) => row.user.id);

  const [pets, matches] = await Promise.all([
    likedUserIds.length ? db.select().from(petsTable).where(inArray(petsTable.userId, likedUserIds)) : [],
    likedUserIds.length
      ? db
          .select()
          .from(matchesTable)
          .where(
            or(
              and(eq(matchesTable.userOneId, meId), inArray(matchesTable.userTwoId, likedUserIds)),
              and(eq(matchesTable.userTwoId, meId), inArray(matchesTable.userOneId, likedUserIds)),
            ),
          )
      : [],
  ]);

  const matchedUserIds = new Set(
    matches.map((match) => (match.userOneId === meId ? match.userTwoId : match.userOneId)),
  );

  const items = rows.map((row) => ({
    id: row.like.id,
    likedUser: { ...row.user, pets: pets.filter((pet) => pet.userId === row.user.id) },
    likedAt: row.like.createdAt,
    mutualMatch: matchedUserIds.has(row.user.id),
  }));

  res.json(ListSentLikesResponse.parse({ items, total: totalRow?.value ?? 0 }));
});

export default router;
