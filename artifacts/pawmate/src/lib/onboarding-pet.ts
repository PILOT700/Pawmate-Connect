import type { Species } from "@workspace/api-client-react";

const KEY = "pawmate.onboarding.petSpecies";

/**
 * Onboarding asks "What's your pet?" before there is a pet on file to store the
 * answer in — the pet record is only created a screen later, in the profile
 * wizard. This carries the answer across that gap.
 *
 * It deliberately does not go through user preferences: those describe who you
 * want to be shown, not what you own.
 */
export function rememberOnboardingPetSpecies(species: Species | undefined) {
  if (!species) return;
  try {
    sessionStorage.setItem(KEY, species);
  } catch {
    // Private-mode browsers can refuse writes; the wizard just falls back to
    // its own default, which is no worse than not asking.
  }
}

export function readOnboardingPetSpecies(): Species | undefined {
  try {
    return (sessionStorage.getItem(KEY) as Species | null) ?? undefined;
  } catch {
    return undefined;
  }
}

export function clearOnboardingPetSpecies() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to clean up if the write never landed.
  }
}
