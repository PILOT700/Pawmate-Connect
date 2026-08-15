import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

/**
 * Node ends the process on either of these anyway. Without a handler it prints
 * a raw stack to stderr and the structured log — the one that is actually
 * searchable — says nothing about why the server disappeared.
 *
 * Both still exit. A process that has already thrown past every catch is in an
 * unknown state, and Render will start a fresh one; staying up and serving from
 * that state is the worse option.
 */
process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught exception; shutting down");
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "Unhandled promise rejection; shutting down");
  process.exit(1);
});

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
