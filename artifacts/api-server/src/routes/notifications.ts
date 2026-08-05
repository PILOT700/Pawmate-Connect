import { Router, type IRouter } from "express";
import { and, count, desc, eq } from "drizzle-orm";
import { db, notificationsTable } from "@workspace/db";
import {
  ListNotificationsQueryParams,
  ListNotificationsResponse,
  MarkNotificationReadParams,
} from "@workspace/api-zod";
import { parsePagination } from "../lib/pagination";
import { HttpError } from "../lib/http-error";
import { requireAuth } from "../middlewares/require-auth";

const router: IRouter = Router();

router.get("/notifications", requireAuth, async (req, res) => {
  const query = ListNotificationsQueryParams.parse(req.query);
  const { limit, offset } = parsePagination(query);

  const where = eq(notificationsTable.userId, req.user!.id);

  const [items, [totalRow]] = await Promise.all([
    db
      .select()
      .from(notificationsTable)
      .where(where)
      .orderBy(desc(notificationsTable.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(notificationsTable).where(where),
  ]);

  res.json(ListNotificationsResponse.parse({ items, total: totalRow?.value ?? 0 }));
});

router.post("/notifications/read-all", requireAuth, async (req, res) => {
  await db
    .update(notificationsTable)
    .set({ read: true })
    .where(eq(notificationsTable.userId, req.user!.id));

  res.status(204).end();
});

router.post("/notifications/:notificationId/read", requireAuth, async (req, res) => {
  const { notificationId } = MarkNotificationReadParams.parse(req.params);

  const updated = await db
    .update(notificationsTable)
    .set({ read: true })
    .where(and(eq(notificationsTable.id, notificationId), eq(notificationsTable.userId, req.user!.id)))
    .returning({ id: notificationsTable.id });

  if (updated.length === 0) {
    throw HttpError.notFound("Notification not found");
  }

  res.status(204).end();
});

export default router;
