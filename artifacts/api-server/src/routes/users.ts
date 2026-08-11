import { Router, type IRouter } from "express";
import { and, eq, or } from "drizzle-orm";
import { db, usersTable, blocksTable } from "@workspace/db";
import {
  GetMyProfileResponse,
  UpdateMyProfileBody,
  UpdateMyProfileResponse,
  GetUserProfileParams,
  GetUserProfileResponse,
} from "@workspace/api-zod";
import { HttpError } from "../lib/http-error";
import { requireAuth } from "../middlewares/require-auth";

const router: IRouter = Router();

router.get("/users/me", requireAuth, (req, res) => {
  res.json(GetMyProfileResponse.parse(req.user));
});

router.patch("/users/me", requireAuth, async (req, res) => {
  const body = UpdateMyProfileBody.parse(req.body);

  const [user] = await db
    .update(usersTable)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(usersTable.id, req.user!.id))
    .returning();

  res.json(UpdateMyProfileResponse.parse(user));
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
