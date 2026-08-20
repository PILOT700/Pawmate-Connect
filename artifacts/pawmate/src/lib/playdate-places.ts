import type { TranslationKey } from "@/lib/i18n";

/**
 * The suggested places for a playdate, as stored and as shown.
 *
 * The value is what goes to the API and what the *other* person reads back —
 * and the two ends of a playdate need not share a language, so it stays English
 * whoever proposed it. Only the label moves.
 *
 * This lives apart from the conversation screen because a proposed playdate is
 * also announced in the notifications drawer, and a Russian notification saying
 * "Dog Park" is the same half-translated sentence in a smaller box.
 */
export const PLAYDATE_PLACES: { id: string; value: string; label: TranslationKey }[] = [
  { id: "park", value: "Dog Park", label: "playdate.locPark" },
  { id: "cafe", value: "Pet Café", label: "playdate.locCafe" },
  { id: "beach", value: "Pet Beach", label: "playdate.locBeach" },
  { id: "trail", value: "Nature Trail", label: "playdate.locTrail" },
  { id: "plaza", value: "City Plaza", label: "playdate.locPlaza" },
];

const BY_VALUE = new Map(PLAYDATE_PLACES.map((place) => [place.value, place.label]));

/**
 * The key for a stored place, or `undefined` when somebody typed their own —
 * a place we did not suggest is their words, and stays exactly as written.
 */
export function playdatePlaceKey(place: string): TranslationKey | undefined {
  return BY_VALUE.get(place);
}
