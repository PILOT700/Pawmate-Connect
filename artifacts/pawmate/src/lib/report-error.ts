import { reportClientError, type ClientErrorReport } from "@workspace/api-client-react";

/**
 * Sends a browser crash to the server, where it lands in the same log as
 * everything else. Without this a crash is visible only to the person it
 * happened to, who sees a blank page and closes the tab.
 */
export function reportError(
  error: unknown,
  kind: ClientErrorReport["kind"],
): void {
  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown error";

  const report: ClientErrorReport = {
    kind,
    message: message.slice(0, 500),
    // The path only, never the query string: reset tokens travel in one, and a
    // crash report is not a reason to write a working credential to the log.
    path: window.location.pathname.slice(0, 200),
    ...(error instanceof Error && error.stack ? { stack: error.stack.slice(0, 4000) } : {}),
  };

  // Nothing is awaited and nothing is retried. If reporting the failure fails
  // too, there is nowhere useful left to say so.
  void reportClientError(report).catch(() => {});
}

let installed = false;

/** Catches what React's error boundary cannot: async failures and stray throws. */
export function installGlobalErrorReporting(): void {
  if (installed) return;
  installed = true;

  window.addEventListener("error", (event) => {
    reportError(event.error ?? event.message, "uncaught");
  });

  window.addEventListener("unhandledrejection", (event) => {
    reportError(event.reason, "unhandled_rejection");
  });
}
