import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, reportsTable } from "@workspace/db";
import { ReportUserBody } from "@workspace/api-zod";
import { HttpError } from "../lib/http-error";
import { requireAuth } from "../middlewares/require-auth";

const router: IRouter = Router();

router.post("/reports", requireAuth, async (req, res) => {
  const body = ReportUserBody.parse(req.body);
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

  // Repeat reports are kept rather than collapsed: how often someone is
  // reported, and by how many different people, is the signal worth having.
  await db.insert(reportsTable).values({
    reporterId: meId,
    reportedUserId: body.userId,
    reason: body.reason,
    details: body.details ?? null,
  });

  res.status(204).end();
});

export default router;
