import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, userSettingsTable } from "@workspace/db";
import { GetMySettingsResponse, UpdateMySettingsBody, UpdateMySettingsResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/require-auth";

const router: IRouter = Router();

router.get("/users/me/settings", requireAuth, async (req, res) => {
  const [settings] = await db
    .select()
    .from(userSettingsTable)
    .where(eq(userSettingsTable.userId, req.user!.id))
    .limit(1);

  res.json(GetMySettingsResponse.parse(settings));
});

router.patch("/users/me/settings", requireAuth, async (req, res) => {
  const body = UpdateMySettingsBody.parse(req.body);

  const [settings] = await db
    .insert(userSettingsTable)
    .values({ ...body, userId: req.user!.id })
    .onConflictDoUpdate({ target: userSettingsTable.userId, set: body })
    .returning();

  res.json(UpdateMySettingsResponse.parse(settings));
});

export default router;
