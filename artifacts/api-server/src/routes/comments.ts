import { Router, type IRouter } from "express";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { db, usersTable, communityEventsTable, eventCommentsTable, eventCommentLikesTable } from "@workspace/db";
import {
  ListEventCommentsParams,
  ListEventCommentsQueryParams,
  ListEventCommentsResponse,
  CreateEventCommentParams,
  CreateEventCommentBody,
  LikeEventCommentParams,
  UnlikeEventCommentParams,
} from "@workspace/api-zod";
import { parsePagination } from "../lib/pagination";
import { HttpError } from "../lib/http-error";
import { requireAuth } from "../middlewares/require-auth";

const router: IRouter = Router();

async function assertEventExists(eventId: string): Promise<void> {
  const [event] = await db
    .select({ id: communityEventsTable.id })
    .from(communityEventsTable)
    .where(eq(communityEventsTable.id, eventId))
    .limit(1);

  if (!event) {
    throw HttpError.notFound("Event not found");
  }
}

async function assertCommentExists(commentId: string): Promise<void> {
  const [comment] = await db
    .select({ id: eventCommentsTable.id })
    .from(eventCommentsTable)
    .where(eq(eventCommentsTable.id, commentId))
    .limit(1);

  if (!comment) {
    throw HttpError.notFound("Comment not found");
  }
}

router.get("/events/:eventId/comments", requireAuth, async (req, res) => {
  const { eventId } = ListEventCommentsParams.parse(req.params);
  const query = ListEventCommentsQueryParams.parse(req.query);
  const { limit, offset } = parsePagination(query);
  const meId = req.user!.id;

  await assertEventExists(eventId);

  const where = eq(eventCommentsTable.eventId, eventId);

  const [rows, [totalRow]] = await Promise.all([
    db
      .select({ comment: eventCommentsTable, author: usersTable })
      .from(eventCommentsTable)
      .innerJoin(usersTable, eq(eventCommentsTable.authorId, usersTable.id))
      .where(where)
      .orderBy(desc(eventCommentsTable.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(eventCommentsTable).where(where),
  ]);

  const commentIds = rows.map((row) => row.comment.id);

  const [likeCounts, myLikes] = await Promise.all([
    commentIds.length
      ? db
          .select({ commentId: eventCommentLikesTable.commentId, value: count() })
          .from(eventCommentLikesTable)
          .where(inArray(eventCommentLikesTable.commentId, commentIds))
          .groupBy(eventCommentLikesTable.commentId)
      : ([] as { commentId: string; value: number }[]),
    commentIds.length
      ? db
          .select({ commentId: eventCommentLikesTable.commentId })
          .from(eventCommentLikesTable)
          .where(
            and(
              inArray(eventCommentLikesTable.commentId, commentIds),
              eq(eventCommentLikesTable.userId, meId),
            ),
          )
      : [],
  ]);

  const likedIds = new Set(myLikes.map((row) => row.commentId));

  const items = rows.map((row) => ({
    id: row.comment.id,
    eventId: row.comment.eventId,
    author: row.author,
    text: row.comment.text,
    likeCount: likeCounts.find((like) => like.commentId === row.comment.id)?.value ?? 0,
    liked: likedIds.has(row.comment.id),
    createdAt: row.comment.createdAt,
  }));

  res.json(ListEventCommentsResponse.parse({ items, total: totalRow?.value ?? 0 }));
});

router.post("/events/:eventId/comments", requireAuth, async (req, res) => {
  const { eventId } = CreateEventCommentParams.parse(req.params);
  const body = CreateEventCommentBody.parse(req.body);

  await assertEventExists(eventId);

  const [comment] = await db
    .insert(eventCommentsTable)
    .values({ eventId, authorId: req.user!.id, text: body.text })
    .returning();

  res.status(201).json({
    id: comment!.id,
    eventId: comment!.eventId,
    author: req.user,
    text: comment!.text,
    likeCount: 0,
    liked: false,
    createdAt: comment!.createdAt,
  });
});

router.post("/comments/:commentId/like", requireAuth, async (req, res) => {
  const { commentId } = LikeEventCommentParams.parse(req.params);
  await assertCommentExists(commentId);

  await db
    .insert(eventCommentLikesTable)
    .values({ commentId, userId: req.user!.id })
    .onConflictDoNothing();

  res.status(204).end();
});

router.delete("/comments/:commentId/like", requireAuth, async (req, res) => {
  const { commentId } = UnlikeEventCommentParams.parse(req.params);
  await assertCommentExists(commentId);

  await db
    .delete(eventCommentLikesTable)
    .where(
      and(eq(eventCommentLikesTable.commentId, commentId), eq(eventCommentLikesTable.userId, req.user!.id)),
    );

  res.status(204).end();
});

export default router;
