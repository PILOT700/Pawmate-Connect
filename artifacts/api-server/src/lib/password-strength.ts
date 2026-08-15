import crypto from "node:crypto";
import { registerUserBodyPasswordMin } from "@workspace/api-zod";
import { logger } from "./logger";

/**
 * Taken from the API contract rather than restated, so the spec and this file
 * cannot drift apart and start disagreeing about what "long enough" means.
 *
 * The contract's own schema rejects a short password before any of this runs;
 * the check below is the second line, and the one that still applies to
 * anything reaching these rules by another route.
 */
export const MIN_PASSWORD_LENGTH = registerUserBodyPasswordMin;

/**
 * bcrypt hashes the first 72 bytes and silently ignores the rest, so anything
 * longer only looks stronger than it is. Refusing past that is honest; quietly
 * truncating would mean a 200-character passphrase and its first 72 characters
 * open the same account.
 */
export const MAX_PASSWORD_BYTES = 72;

const HIBP_RANGE = "https://api.pwnedpasswords.com/range";
const TIMEOUT_MS = 3000;

/**
 * Asks Have I Been Pwned whether a password appears in known breaches, without
 * telling it the password: only the first five characters of the SHA-1 go over
 * the wire, and the answer — every hash starting with those five — is searched
 * here. The service cannot tell which of the several hundred was being asked
 * about.
 */
export async function isBreachedPassword(password: string): Promise<boolean> {
  const hash = crypto.createHash("sha1").update(password).digest("hex").toUpperCase();
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  try {
    const response = await fetch(`${HIBP_RANGE}/${prefix}`, {
      headers: { "Add-Padding": "true" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      logger.warn({ status: response.status }, "Breach check refused; letting the password through");
      return false;
    }

    const body = await response.text();
    return body
      .split("\n")
      .some((line) => line.split(":")[0]?.trim().toUpperCase() === suffix);
  } catch (err) {
    // Failing open is the deliberate choice: the other rules still apply, and
    // turning away someone's registration because a third party is down would
    // cost more than the breach check is worth on any single signup.
    logger.warn({ err }, "Breach check failed; letting the password through");
    return false;
  }
}

export interface PasswordProblem {
  message: string;
}

/**
 * The rules a new password has to clear. Existing passwords are never
 * re-checked — someone who set a short one before these rules existed can still
 * sign in, and only meets them when they next choose a new password.
 */
export async function checkPassword(
  password: string,
  context: { email?: string } = {},
): Promise<PasswordProblem | null> {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { message: `Please use at least ${MIN_PASSWORD_LENGTH} characters.` };
  }

  if (Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES) {
    return { message: "That password is too long. Please keep it under 72 characters." };
  }

  const local = context.email?.split("@")[0]?.trim().toLowerCase();
  if (local && local.length >= 3 && password.toLowerCase().includes(local)) {
    return { message: "Please don't use your email address in your password." };
  }

  // "aaaaaaaaaa" and "1111111111" clear a length rule while being trivial.
  if (new Set(password).size < 4) {
    return { message: "Please mix in a few more different characters." };
  }

  if (await isBreachedPassword(password)) {
    return {
      message:
        "That password has appeared in a known data breach, so it's among the first ones tried. Please choose another.",
    };
  }

  return null;
}
