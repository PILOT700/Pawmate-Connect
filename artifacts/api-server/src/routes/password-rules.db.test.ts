import { beforeEach, expect, it, vi, afterEach } from "vitest";
import request from "supertest";
import { db, usersTable } from "@workspace/db";
import app from "../app";
import { hashPassword } from "../lib/password";
import { loginIpLimiter, loginAccountLimiter, registerLimiter } from "../lib/rate-limit";
import { describeWithDb, resetDatabase } from "../test/db";

// The breach service is not called from tests; it always answers "never seen".
const neverBreached = () =>
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, text: async () => "0000000000000000000000000000000000000:1" }),
  );

function resetCounters() {
  for (const limiter of [loginIpLimiter, loginAccountLimiter, registerLimiter]) {
    limiter.resetKey("::ffff:127.0.0.1");
    limiter.resetKey("127.0.0.1");
  }
}

const signUp = (body: Record<string, string>) =>
  request(app).post("/api/auth/register").send(body);

describeWithDb("the password rules at registration", () => {
  beforeEach(async () => {
    await resetDatabase();
    resetCounters();
    neverBreached();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates the account when the password is a good one", async () => {
    const response = await signUp({
      email: "new@example.test",
      password: "correct-horse-battery",
      firstName: "New",
    });

    expect(response.status).toBe(201);
  });

  // Caught by the contract's own schema before the strength rules run. Worth
  // asserting anyway: it is what proves the published minimum and the enforced
  // one are the same number.
  it("refuses a short password and says why", async () => {
    const response = await signUp({
      email: "new@example.test",
      password: "short1!x",
      firstName: "New",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/at least 10/i);
    expect(await db.select().from(usersTable)).toHaveLength(0);
  });

  // Long enough for the schema, so this one reaches the strength rules and is
  // turned away by them rather than by the contract.
  it("refuses a long password made of two characters", async () => {
    const response = await signUp({
      email: "new@example.test",
      password: "abababababab",
      firstName: "New",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/different characters/i);
    expect(await db.select().from(usersTable)).toHaveLength(0);
  });

  it("refuses a password built from the email", async () => {
    const response = await signUp({
      email: "elshan@example.test",
      password: "elshanelshan",
      firstName: "New",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/email/i);
  });

  /**
   * The rules apply to passwords being *set*. Someone who chose a six-character
   * one before they existed keeps their account and their password — tightening
   * the rules must not lock out the people already here.
   */
  it("still signs in an account whose old password predates the rules", async () => {
    await db.insert(usersTable).values({
      email: "existing@example.test",
      passwordHash: await hashPassword("old123"),
      firstName: "Existing",
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "existing@example.test", password: "old123" });

    expect(response.status).toBe(200);
  });
});
