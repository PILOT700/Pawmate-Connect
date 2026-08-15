import rateLimit, { type Options } from "express-rate-limit";
import type { Request } from "express";
import { logger } from "./logger";

const MINUTE = 60 * 1000;

/**
 * Counters live in this process's memory. On a single Render instance that is
 * the whole picture; the day the API runs on more than one, each would keep its
 * own tally and the effective limit would multiply by the instance count. Moving
 * to a shared store is the fix at that point.
 */
function make(opts: {
  windowMs: number;
  limit: number;
  message: string;
  keyGenerator?: Options["keyGenerator"];
}) {
  return rateLimit({
    windowMs: opts.windowMs,
    limit: opts.limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    ...(opts.keyGenerator ? { keyGenerator: opts.keyGenerator } : {}),
    handler: (req, res) => {
      logger.warn({ path: req.path, ip: req.ip }, "Rate limit reached");
      res.status(429).json({ message: opts.message });
    },
  });
}

/** Normalised so "Me@Example.com " and "me@example.com" share a bucket. */
function emailKey(req: Request): string {
  const email = (req.body as { email?: unknown } | undefined)?.email;
  return typeof email === "string" ? email.trim().toLowerCase() : (req.ip ?? "unknown");
}

/**
 * Guessing a password from one address. Generous enough that someone who
 * genuinely cannot remember theirs is not locked out on a bad afternoon.
 */
export const loginIpLimiter = make({
  windowMs: 15 * MINUTE,
  limit: 20,
  message: "Too many sign-in attempts. Please wait a few minutes and try again.",
});

/**
 * Keyed by the address being tried rather than by who is trying, so spreading
 * the guesses across many IPs does not buy an attacker more attempts at one
 * account.
 */
export const loginAccountLimiter = make({
  windowMs: 15 * MINUTE,
  limit: 10,
  message: "Too many sign-in attempts for this account. Please wait a few minutes.",
  keyGenerator: emailKey,
});

/** Registration is a write; there is no reason for a burst of them. */
export const registerLimiter = make({
  windowMs: 60 * MINUTE,
  limit: 10,
  message: "Too many accounts created from here. Please try again later.",
});

/**
 * This endpoint sends mail to an address the sender does not have to own, which
 * makes an unthrottled version a way to bury someone's inbox.
 */
export const passwordResetRequestLimiter = make({
  windowMs: 60 * MINUTE,
  limit: 5,
  message: "Too many reset requests. Please check your inbox, or try again later.",
});

/** A reset token is 32 random bytes; this only rules out grinding at it. */
export const passwordResetConfirmLimiter = make({
  windowMs: 15 * MINUTE,
  limit: 10,
  message: "Too many attempts. Please request a fresh link.",
});
