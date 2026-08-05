/**
 * The API returns `{ message }` bodies, but the shared fetch wrapper builds its
 * Error message as "HTTP 401 Unauthorized: <message>". Users shouldn't see the
 * status prefix, so prefer the raw body when it's there.
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  const data = (error as { data?: unknown } | null)?.data;

  if (data && typeof data === "object" && typeof (data as { message?: unknown }).message === "string") {
    return (data as { message: string }).message;
  }

  return error instanceof Error ? error.message : fallback;
}
