import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearOnboardingPetSpecies,
  readOnboardingPetSpecies,
  rememberOnboardingPetSpecies,
} from "./onboarding-pet";

describe("the onboarding pet handover", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("hands the chosen species to the profile form", () => {
    rememberOnboardingPetSpecies("cat");

    expect(readOnboardingPetSpecies()).toBe("cat");
  });

  it("reads as unset before onboarding has answered", () => {
    expect(readOnboardingPetSpecies()).toBeUndefined();
  });

  it("ignores an empty answer rather than storing one", () => {
    rememberOnboardingPetSpecies(undefined);

    expect(readOnboardingPetSpecies()).toBeUndefined();
  });

  it("stops handing over the answer once the pet exists", () => {
    rememberOnboardingPetSpecies("rabbit");
    clearOnboardingPetSpecies();

    expect(readOnboardingPetSpecies()).toBeUndefined();
  });

  // Private-mode browsers throw on sessionStorage. The wizard should fall back
  // to its own default rather than take the whole form down with it.
  it("survives a browser that refuses to store anything", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });

    expect(() => rememberOnboardingPetSpecies("dog")).not.toThrow();
  });

  it("survives a browser that refuses to be read", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("SecurityError");
    });

    expect(readOnboardingPetSpecies()).toBeUndefined();
  });
});
