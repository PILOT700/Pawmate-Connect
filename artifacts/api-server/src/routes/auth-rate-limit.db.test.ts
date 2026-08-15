import { beforeEach, expect, it } from "vitest";
import request from "supertest";
import { db, usersTable } from "@workspace/db";
import app from "../app";
import { hashPassword } from "../lib/password";
import {
  loginIpLimiter,
  loginAccountLimiter,
  registerLimiter,
  passwordResetRequestLimiter,
} from "../lib/rate-limit";
import { describeWithDb, resetDatabase } from "../test/db";

// The counters live for the process, so a test that did not clear them would
// inherit whatever the one before it used up.
function resetCounters() {
  for (const limiter of [
    loginIpLimiter,
    loginAccountLimiter,
    registerLimiter,
    passwordResetRequestLimiter,
  ]) {
    limiter.resetKey("::ffff:127.0.0.1");
    limiter.resetKey("127.0.0.1");
  }
}

async function makeMember(email: string, password: string) {
  await db.insert(usersTable).values({
    email,
    passwordHash: await hashPassword(password),
    firstName: "Member",
  });
}

const signIn = (email: string, password: string) =>
  request(app).post("/api/auth/login").send({ email, password });

describeWithDb("holding off repeated attempts", () => {
  beforeEach(async () => {
    await resetDatabase();
    resetCounters();
  });

  it("lets someone in on the right password after a few wrong ones", async () => {
    await makeMember("member@example.test", "correct-horse");

    for (let i = 0; i < 5; i += 1) {
      await signIn("member@example.test", "wrong");
    }

    const response = await signIn("member@example.test", "correct-horse");
    expect(response.status).toBe(200);
  });

  it("stops guessing at one account well before a password falls", async () => {
    await makeMember("target@example.test", "correct-horse");

    const codes: number[] = [];
    for (let i = 0; i < 12; i += 1) {
      codes.push((await signIn("target@example.test", `guess-${i}`)).status);
    }

    expect(codes).toContain(429);
    // Ten wrong passwords is nowhere near enough to find one by guessing.
    expect(codes.filter((c) => c === 401).length).toBeLessThanOrEqual(10);
  });

  it("keeps refusing the right password once the limit is hit", async () => {
    await makeMember("target@example.test", "correct-horse");

    for (let i = 0; i < 12; i += 1) {
      await signIn("target@example.test", `guess-${i}`);
    }

    const response = await signIn("target@example.test", "correct-horse");
    expect(response.status).toBe(429);
  });

  // Otherwise the whole defence is undone by lowercasing, or by a stray space.
  it("treats a differently-typed address as the same account", async () => {
    await makeMember("target@example.test", "correct-horse");

    for (let i = 0; i < 11; i += 1) {
      await signIn("target@example.test", `guess-${i}`);
    }

    const response = await signIn("  TARGET@Example.Test  ", "correct-horse");
    expect(response.status).toBe(429);
  });

  it("says what happened rather than failing silently", async () => {
    await makeMember("target@example.test", "correct-horse");

    let body: { message?: string } = {};
    for (let i = 0; i < 12; i += 1) {
      body = (await signIn("target@example.test", "wrong")).body;
    }

    expect(body.message).toMatch(/too many/i);
  });

  it("caps how often a reset link can be asked for", async () => {
    await makeMember("member@example.test", "correct-horse");

    const codes: number[] = [];
    for (let i = 0; i < 7; i += 1) {
      codes.push(
        (
          await request(app)
            .post("/api/auth/password-reset/request")
            .send({ email: "member@example.test" })
        ).status,
      );
    }

    expect(codes.filter((c) => c === 204).length).toBeLessThanOrEqual(5);
    expect(codes).toContain(429);
  });

  it("leaves signing out alone", async () => {
    for (let i = 0; i < 15; i += 1) {
      const response = await request(app).post("/api/auth/logout");
      expect(response.status).toBe(204);
    }
  });
});
