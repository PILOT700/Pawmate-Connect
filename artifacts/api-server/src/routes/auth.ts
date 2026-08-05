import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, userPreferencesTable, userSettingsTable } from "@workspace/db";
import {
  RegisterUserBody,
  LoginUserBody,
  LoginUserResponse,
  GetCurrentSessionResponse,
} from "@workspace/api-zod";
import { hashPassword, verifyPassword } from "../lib/password";
import { createSession, deleteSession, setSessionCookie, clearSessionCookie, SESSION_COOKIE_NAME } from "../lib/session";
import { HttpError } from "../lib/http-error";
import { requireAuth } from "../middlewares/require-auth";

const router: IRouter = Router();

router.post("/auth/register", async (req, res) => {
  const body = RegisterUserBody.parse(req.body);

  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, body.email))
    .limit(1);

  if (existing.length > 0) {
    throw HttpError.conflict("An account with this email already exists");
  }

  const passwordHash = await hashPassword(body.password);

  const [user] = await db
    .insert(usersTable)
    .values({ email: body.email, passwordHash, firstName: body.firstName })
    .returning();

  if (!user) {
    throw new Error("Failed to create user");
  }

  await db.insert(userPreferencesTable).values({ userId: user.id });
  await db.insert(userSettingsTable).values({ userId: user.id });

  const token = await createSession(user.id);
  setSessionCookie(res, token);

  // registerUser's 201 response is the same `User` shape as loginUser's 200
  // response — Orval doesn't generate a distinct named schema for 201s that
  // reference a shared component, so we reuse LoginUserResponse here.
  res.status(201).json(LoginUserResponse.parse(user));
});

router.post("/auth/login", async (req, res) => {
  const body = LoginUserBody.parse(req.body);

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, body.email)).limit(1);

  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    throw HttpError.unauthorized("Incorrect email or password");
  }

  const token = await createSession(user.id);
  setSessionCookie(res, token);

  res.json(LoginUserResponse.parse(user));
});

router.post("/auth/logout", async (req, res) => {
  const token = req.signedCookies?.[SESSION_COOKIE_NAME];

  if (typeof token === "string") {
    await deleteSession(token);
  }

  clearSessionCookie(res);
  res.status(204).end();
});

router.get("/auth/me", requireAuth, (req, res) => {
  res.json(GetCurrentSessionResponse.parse(req.user));
});

export default router;
