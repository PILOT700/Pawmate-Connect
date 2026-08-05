import { Router, type IRouter } from "express";
import { and, eq, isNull } from "drizzle-orm";
import { db, userPreferencesTable, usersTable } from "@workspace/db";
import { GetMyPreferencesResponse, UpdateMyPreferencesBody, UpdateMyPreferencesResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/require-auth";

const router: IRouter = Router();

router.get("/users/me/preferences", requireAuth, async (req, res) => {
  const [prefs] = await db
    .select()
    .from(userPreferencesTable)
    .where(eq(userPreferencesTable.userId, req.user!.id))
    .limit(1);

  res.json(GetMyPreferencesResponse.parse(prefs));
});

router.put("/users/me/preferences", requireAuth, async (req, res) => {
  const body = UpdateMyPreferencesBody.parse(req.body);

  const [prefs] = await db
    .insert(userPreferencesTable)
    .values({ ...body, userId: req.user!.id })
    .onConflictDoUpdate({ target: userPreferencesTable.userId, set: body })
    .returning();

  // Saving preferences is the last step of onboarding, so this is where the
  // user stops being "new" — used to decide where to land them after login.
  await db
    .update(usersTable)
    .set({ onboardingCompletedAt: new Date() })
    .where(and(eq(usersTable.id, req.user!.id), isNull(usersTable.onboardingCompletedAt)));

  res.json(UpdateMyPreferencesResponse.parse(prefs));
});

export default router;
