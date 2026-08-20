import type { TranslationKey } from "@/lib/i18n";

/**
 * The lifestyle chips, as stored and as shown.
 *
 * `value` is what the API holds and what existing profiles already contain, so
 * it stays English in every language — translating it would orphan every tag
 * saved so far and change the `data-testid`s built from it. Only `label` moves.
 */
export const LIFESTYLE_TAGS: { value: string; label: TranslationKey }[] = [
  { value: "Morning person", label: "lifestyle.morningPerson" },
  { value: "Night owl", label: "lifestyle.nightOwl" },
  { value: "Homebody", label: "lifestyle.homebody" },
  { value: "Outdoor lover", label: "lifestyle.outdoorLover" },
  { value: "Coffee enthusiast", label: "lifestyle.coffeeEnthusiast" },
  { value: "Fitness focused", label: "lifestyle.fitnessFocused" },
  { value: "Foodie", label: "lifestyle.foodie" },
  { value: "Dog park regular", label: "lifestyle.dogParkRegular" },
  { value: "Weekend hiker", label: "lifestyle.weekendHiker" },
  { value: "Couch cuddler", label: "lifestyle.couchCuddler" },
  { value: "Work from home", label: "lifestyle.workFromHome" },
  { value: "Traveler", label: "lifestyle.traveler" },
];

const BY_VALUE = new Map(LIFESTYLE_TAGS.map((tag) => [tag.value, tag.label]));

/**
 * The key for a stored tag, or `undefined` for one this build doesn't know —
 * a profile saved when the list was different should still show its own words
 * rather than a blank chip.
 */
export function lifestyleTagKey(value: string): TranslationKey | undefined {
  return BY_VALUE.get(value);
}
