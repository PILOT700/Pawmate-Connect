import { logger } from "./logger";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

function config() {
  return {
    apiKey: process.env["RESEND_API_KEY"],
    from: process.env["MAIL_FROM"],
  };
}

export function isMailConfigured(): boolean {
  const { apiKey, from } = config();
  return Boolean(apiKey && from);
}

/**
 * Sends through Resend when it is configured, and otherwise does the only
 * honest thing an unconfigured mailer can do: say so.
 *
 * Outside production the message is written to the log so the flow can be
 * exercised without a mail account. It is never logged in production — a reset
 * link is a bearer credential, and log retention would outlive the token.
 */
export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  const { apiKey, from } = config();

  if (!apiKey || !from) {
    if (process.env["NODE_ENV"] === "production") {
      logger.error(
        { to: opts.to, subject: opts.subject },
        "Mail is not configured; message dropped. Set RESEND_API_KEY and MAIL_FROM.",
      );
    } else {
      logger.warn(
        { to: opts.to, subject: opts.subject, body: opts.text },
        "Mail is not configured; printing the message instead of sending it.",
      );
    }
    return;
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [opts.to], subject: opts.subject, text: opts.text }),
  });

  if (!response.ok) {
    // Deliberately not surfaced to the caller's HTTP response: whether an
    // address bounced is not something an anonymous request should learn.
    logger.error(
      { to: opts.to, status: response.status, body: await response.text().catch(() => "") },
      "Mail provider rejected the message",
    );
  }
}
