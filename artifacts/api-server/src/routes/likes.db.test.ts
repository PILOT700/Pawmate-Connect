import { beforeEach, expect, it } from "vitest";
import request from "supertest";
import { and, eq, or } from "drizzle-orm";
import { db, likesTable, matchesTable } from "@workspace/db";
import app from "../app";
import { describeWithDb, makeUser, resetDatabase } from "../test/db";
import { sessionCookie } from "../test/session";

describeWithDb("liking someone", () => {
  beforeEach(resetDatabase);

  it("records the like without matching a one-sided one", async () => {
    const me = await makeUser();
    const them = await makeUser();

    const response = await request(app)
      .post("/api/likes")
      .set("Cookie", await sessionCookie(me.id))
      .send({ likedUserId: them.id });

    expect(response.status).toBe(201);
    expect(response.body.isMatch).toBe(false);
    expect(await db.select().from(matchesTable)).toHaveLength(0);
  });

  it("matches the pair once the like is returned", async () => {
    const me = await makeUser();
    const them = await makeUser();

    await request(app)
      .post("/api/likes")
      .set("Cookie", await sessionCookie(them.id))
      .send({ likedUserId: me.id });

    const response = await request(app)
      .post("/api/likes")
      .set("Cookie", await sessionCookie(me.id))
      .send({ likedUserId: them.id });

    expect(response.body.isMatch).toBe(true);

    const matches = await db
      .select()
      .from(matchesTable)
      .where(
        or(
          and(eq(matchesTable.userOneId, me.id), eq(matchesTable.userTwoId, them.id)),
          and(eq(matchesTable.userOneId, them.id), eq(matchesTable.userTwoId, me.id)),
        ),
      );
    expect(matches).toHaveLength(1);
  });

  // The client can send the same like twice — a double tap, a retried request.
  it("stays at one like and one match when sent twice", async () => {
    const me = await makeUser();
    const them = await makeUser();
    const myCookie = await sessionCookie(me.id);

    await request(app)
      .post("/api/likes")
      .set("Cookie", await sessionCookie(them.id))
      .send({ likedUserId: me.id });
    await request(app).post("/api/likes").set("Cookie", myCookie).send({ likedUserId: them.id });
    await request(app).post("/api/likes").set("Cookie", myCookie).send({ likedUserId: them.id });

    expect(await db.select().from(likesTable).where(eq(likesTable.likerId, me.id))).toHaveLength(1);
    expect(await db.select().from(matchesTable)).toHaveLength(1);
  });

  it("turns away a request with no session", async () => {
    const them = await makeUser();

    const response = await request(app).post("/api/likes").send({ likedUserId: them.id });

    expect(response.status).toBe(401);
  });
});
