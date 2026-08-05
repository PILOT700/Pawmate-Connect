import { and, eq, or } from "drizzle-orm";
import { db, matchesTable, type Match } from "@workspace/db";
import { HttpError } from "./http-error";

export async function requireMatchParticipant(matchId: string, userId: string): Promise<Match> {
  const [match] = await db
    .select()
    .from(matchesTable)
    .where(
      and(
        eq(matchesTable.id, matchId),
        or(eq(matchesTable.userOneId, userId), eq(matchesTable.userTwoId, userId)),
      ),
    )
    .limit(1);

  if (!match) {
    throw HttpError.notFound("Match not found");
  }

  return match;
}
