import crypto from "node:crypto";
import { Router, type IRouter } from "express";
import { and, eq, gt, isNull } from "drizzle-orm";
import {
  db,
  usersTable,
  userPreferencesTable,
  userSettingsTable,
  passwordResetTokensTable,
  sessionsTable,
} from "@workspace/db";
import {
  RegisterUserBody,
  LoginUserBody,
  LoginUserResponse,
  GetCurrentSessionResponse,
  RequestPasswordResetBody,
  ConfirmPasswordResetBody,
} from "@workspace/api-zod";
import { hashPassword, verifyPassword } from "../lib/password";
import { checkPassword } from "../lib/password-strength";
import { createSession, deleteSession, setSessionCookie, clearSessionCookie, SESSION_COOKIE_NAME } from "../lib/session";
import { HttpError } from "../lib/http-error";
import { sendMail } from "../lib/mailer";
import {
  loginIpLimiter,
  loginAccountLimiter,
  registerLimiter,
  passwordResetRequestLimiter,
  passwordResetConfirmLimiter,
} from "../lib/rate-limit";
import { logger } from "../lib/logger";
import { requireAuth } from "../middlewares/require-auth";

const router: IRouter = Router();

const RESET_TTL_MS = 60 * 60 * 1000;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

router.post("/auth/register", registerLimiter, async (req, res) => {
  const body = RegisterUserBody.parse(req.body);

  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, body.email))
    .limit(1);

  if (existing.length > 0) {
    throw HttpError.conflict("An account with this email already exists");
  }

  const problem = await checkPassword(body.password, { email: body.email });
  if (problem) {
    throw HttpError.badRequest(problem.message);
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

router.post("/auth/login", loginIpLimiter, loginAccountLimiter, async (req, res) => {
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

router.post("/auth/password-reset/request", passwordResetRequestLimiter, async (req, res) => {
  const body = RequestPasswordResetBody.parse(req.body);

  const [user] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, body.email))
    .limit(1);

  // The 204 is unconditional. Answering differently for a known address would
  // make this endpoint a way to enumerate who has an account here, which on a
  // dating app is worth more to an attacker than most passwords.
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");

    await db.insert(passwordResetTokensTable).values({
      tokenHash: hashToken(token),
      userId: user.id,
      expiresAt: new Date(Date.now() + RESET_TTL_MS),
    });

    const origin = process.env["FRONTEND_ORIGIN"] ?? "";
    const link = `${origin}/reset-password?token=${token}`;

    await sendMail({
      to: body.email,
      subject: "Reset your Pawmate password",
      text: [
        "Someone asked to reset the password on your Pawmate account.",
        "",
        `Open this link within the hour to choose a new one: ${link}`,
        "",
        "If that wasn't you, nothing has changed and you can ignore this message.",
      ].join("\n"),
    });
  }

  res.status(204).end();
});

router.post("/auth/password-reset/confirm", passwordResetConfirmLimiter, async (req, res) => {
  const body = ConfirmPasswordResetBody.parse(req.body);

  const [row] = await db
    .select()
    .from(passwordResetTokensTable)
    .where(
      and(
        eq(passwordResetTokensTable.tokenHash, hashToken(body.token)),
        gt(passwordResetTokensTable.expiresAt, new Date()),
        isNull(passwordResetTokensTable.usedAt),
      ),
    )
    .limit(1);

  if (!row) {
    throw HttpError.unauthorized("This reset link has expired or has already been used");
  }

  const problem = await checkPassword(body.password);
  if (problem) {
    throw HttpError.badRequest(problem.message);
  }

  const passwordHash = await hashPassword(body.password);

  await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, row.userId));

  // Spend the token before anything else can, and drop every other outstanding
  // one for this account — asking twice and using the older link should not
  // leave a second way in.
  await db
    .update(passwordResetTokensTable)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokensTable.userId, row.userId));

  // Whoever knew the old password is signed out everywhere. A reset is what
  // someone does when they suspect they are not the only one with access.
  await db.delete(sessionsTable).where(eq(sessionsTable.userId, row.userId));

  logger.info({ userId: row.userId }, "Password reset completed");

  res.status(204).end();
});

router.get("/auth/me", requireAuth, (req, res) => {
  res.json(GetCurrentSessionResponse.parse(req.user));
});

export default router;
