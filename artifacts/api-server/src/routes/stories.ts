import { Router, type IRouter } from "express";
import { and, desc, eq, gt, inArray, isNull, or } from "drizzle-orm";
import { db, storiesTable, storyViewsTable } from "@workspace/db";
import {
  ListUserStoriesParams,
  ListUserStoriesResponse,
  ListUserStoriesResponseItem,
  CreateStoryBody,
  MarkStoryViewedParams,
} from "@workspace/api-zod";
import { HttpError } from "../lib/http-error";
import { requireAuth } from "../middlewares/require-auth";

const router: IRouter = Router();

router.get("/users/:userId/stories", requireAuth, async (req, res) => {
  const { userId } = ListUserStoriesParams.parse(req.params);
  const meId = req.user!.id;

  const stories = await db
    .select()
    .from(storiesTable)
    .where(
      and(
        eq(storiesTable.userId, userId),
        or(isNull(storiesTable.expiresAt), gt(storiesTable.expiresAt, new Date())),
      ),
    )
    .orderBy(desc(storiesTable.createdAt));

  const storyIds = stories.map((story) => story.id);

  const views = storyIds.length
    ? await db
        .select({ storyId: storyViewsTable.storyId })
        .from(storyViewsTable)
        .where(and(inArray(storyViewsTable.storyId, storyIds), eq(storyViewsTable.viewerId, meId)))
    : [];

  const viewedIds = new Set(views.map((view) => view.storyId));

  res.json(
    ListUserStoriesResponse.parse(
      stories.map((story) => ({ ...story, viewed: viewedIds.has(story.id) })),
    ),
  );
});

router.post("/stories", requireAuth, async (req, res) => {
  const body = CreateStoryBody.parse(req.body);

  const [story] = await db
    .insert(storiesTable)
    .values({ ...body, userId: req.user!.id })
    .returning();

  res.status(201).json(ListUserStoriesResponseItem.parse({ ...story, viewed: false }));
});

router.post("/stories/:storyId/view", requireAuth, async (req, res) => {
  const { storyId } = MarkStoryViewedParams.parse(req.params);

  const [story] = await db
    .select({ id: storiesTable.id })
    .from(storiesTable)
    .where(eq(storiesTable.id, storyId))
    .limit(1);

  if (!story) {
    throw HttpError.notFound("Story not found");
  }

  await db
    .insert(storyViewsTable)
    .values({ storyId, viewerId: req.user!.id })
    .onConflictDoNothing();

  res.status(204).end();
});

export default router;
