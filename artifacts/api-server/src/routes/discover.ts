import { Router, type IRouter } from "express";
import { and, count, desc, eq, inArray, ne, notInArray, sql } from "drizzle-orm";
import { db, usersTable, petsTable, likesTable, passesTable, blocksTable } from "@workspace/db";
import { ListDiscoverProfilesQueryParams, ListDiscoverProfilesResponse } from "@workspace/api-zod";
import { parsePagination } from "../lib/pagination";
import { requireAuth } from "../middlewares/require-auth";

const router: IRouter = Router();

router.get("/discover", requireAuth, async (req, res) => {
  const query = ListDiscoverProfilesQueryParams.parse(req.query);
  const { limit, offset } = parsePagination(query);
  const meId = req.user!.id;

  const likedIds = db.select({ id: likesTable.likedUserId }).from(likesTable).where(eq(likesTable.likerId, meId));
  const passedIds = db.select({ id: passesTable.passedUserId }).from(passesTable).where(eq(passesTable.userId, meId));

  // A block hides the pair from each other, so both directions are excluded.
  const blockedIds = db
    .select({ id: blocksTable.blockedUserId })
    .from(blocksTable)
    .where(eq(blocksTable.blockerId, meId));
  const blockedMeIds = db
    .select({ id: blocksTable.blockerId })
    .from(blocksTable)
    .where(eq(blocksTable.blockedUserId, meId));

  const filters = [
    ne(usersTable.id, meId),
    notInArray(usersTable.id, likedIds),
    notInArray(usersTable.id, passedIds),
    notInArray(usersTable.id, blockedIds),
    notInArray(usersTable.id, blockedMeIds),
  ];

  if (query.lookingFor) {
    filters.push(sql`${usersTable.lookingFor} @> ARRAY[${query.lookingFor}]::looking_for[]`);
  }

  if (query.species) {
    filters.push(
      sql`EXISTS (SELECT 1 FROM ${petsTable} WHERE ${petsTable.userId} = ${usersTable.id} AND ${petsTable.species} = ${query.species})`,
    );
  }

  const where = and(...filters);

  const [candidates, [totalRow]] = await Promise.all([
    db.select().from(usersTable).where(where).orderBy(desc(usersTable.createdAt)).limit(limit).offset(offset),
    db.select({ value: count() }).from(usersTable).where(where),
  ]);

  const candidateIds = candidates.map((c) => c.id);
  const pets = candidateIds.length
    ? await db.select().from(petsTable).where(inArray(petsTable.userId, candidateIds))
    : [];

  const items = candidates.map((candidate) => ({
    ...candidate,
    pets: pets.filter((pet) => pet.userId === candidate.id),
  }));

  res.json(ListDiscoverProfilesResponse.parse({ items, total: totalRow?.value ?? 0 }));
});

export default router;
