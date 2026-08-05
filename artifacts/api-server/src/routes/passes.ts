import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, passesTable } from "@workspace/db";
import { CreatePassBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/require-auth";

const router: IRouter = Router();

router.post("/passes", requireAuth, async (req, res) => {
  const body = CreatePassBody.parse(req.body);
  const meId = req.user!.id;

  const [pass] = await db
    .insert(passesTable)
    .values({ userId: meId, passedUserId: body.passedUserId })
    .onConflictDoNothing()
    .returning();

  const result =
    pass ??
    (
      await db
        .select()
        .from(passesTable)
        .where(and(eq(passesTable.userId, meId), eq(passesTable.passedUserId, body.passedUserId)))
        .limit(1)
    )[0];

  res.status(201).json(result);
});

export default router;
