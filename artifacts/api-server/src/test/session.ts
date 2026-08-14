import { sign } from "cookie-signature";
import { createSession, SESSION_COOKIE_NAME } from "../lib/session";

/**
 * A Cookie header that the app accepts as a signed-in member.
 *
 * It goes through the real `createSession` and the same signing cookie-parser
 * does, so requests are authenticated the way a browser's would be — a test
 * that bypassed the middleware would not be testing the route as it ships.
 */
export async function sessionCookie(userId: string): Promise<string> {
  const token = await createSession(userId);
  const signed = `s:${sign(token, process.env["COOKIE_SECRET"]!)}`;
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(signed)}`;
}
