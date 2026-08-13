import { describe, expect, it } from "vitest";
import { calcCompatScore } from "./compatibility-score";

const base = {
  myLifestyle: [],
  myLookingFor: [],
  theirLifestyle: [],
  theirLookingFor: [],
} as const;

describe("the compatibility score", () => {
  it("rates a shared species highest", () => {
    const same = calcCompatScore({ ...base, myPetSpecies: "cat", theirPetSpecies: "cat" });
    const different = calcCompatScore({ ...base, myPetSpecies: "cat", theirPetSpecies: "fish" });

    expect(same.petScore).toBeGreaterThan(different.petScore);
  });

  it("falls back to neutral when either side has no pet", () => {
    const neither = calcCompatScore(base);
    const onlyMine = calcCompatScore({ ...base, myPetSpecies: "dog" });

    expect(neither.petScore).toBe(65);
    expect(onlyMine.petScore).toBe(65);
  });

  it("rewards lifestyle you actually share", () => {
    const overlapping = calcCompatScore({
      ...base,
      myLifestyle: ["Foodie", "Traveler"],
      theirLifestyle: ["Foodie", "Traveler"],
    });
    const disjoint = calcCompatScore({
      ...base,
      myLifestyle: ["Foodie", "Traveler"],
      theirLifestyle: ["Night owl", "Gamer"],
    });

    expect(overlapping.lifestyleScore).toBeGreaterThan(disjoint.lifestyleScore);
  });

  it("counts one shared intent as agreement", () => {
    const shared = calcCompatScore({
      ...base,
      myLookingFor: ["friendship", "relationship"],
      theirLookingFor: ["relationship"],
    });
    const apart = calcCompatScore({
      ...base,
      myLookingFor: ["friendship"],
      theirLookingFor: ["relationship"],
    });

    expect(shared.intentScore).toBe(92);
    expect(apart.intentScore).toBe(70);
  });

  // A profile is scored from both sides' real data, so swapping the two
  // members must not change the number either of them is shown.
  it("reads the same from either side", () => {
    const mine = calcCompatScore({
      myPetSpecies: "dog",
      myLifestyle: ["Foodie"],
      myLookingFor: ["friendship"],
      theirPetSpecies: "cat",
      theirLifestyle: ["Foodie", "Night owl"],
      theirLookingFor: ["friendship"],
    });
    const theirs = calcCompatScore({
      myPetSpecies: "cat",
      myLifestyle: ["Foodie", "Night owl"],
      myLookingFor: ["friendship"],
      theirPetSpecies: "dog",
      theirLifestyle: ["Foodie"],
      theirLookingFor: ["friendship"],
    });

    expect(mine.total).toBe(theirs.total);
  });

  // Pins the weighting. The best pairing the inputs allow comes to 91.5 and
  // rounds to 92, which is also why the Math.min(total, 99) guard in the
  // source can never fire — nothing reaches it.
  it("tops out at 92 for the best pairing there is", () => {
    const best = calcCompatScore({
      myPetSpecies: "cat",
      myLifestyle: ["Foodie", "Traveler"],
      myLookingFor: ["relationship"],
      theirPetSpecies: "cat",
      theirLifestyle: ["Foodie", "Traveler"],
      theirLookingFor: ["relationship"],
      theirTraits: ["Playful", "Calm", "Curious"],
    });

    expect(best.total).toBe(92);
  });

  it("moves the total when any one part improves", () => {
    const worse = calcCompatScore({ ...base, myPetSpecies: "cat", theirPetSpecies: "fish" });
    const better = calcCompatScore({ ...base, myPetSpecies: "cat", theirPetSpecies: "cat" });

    expect(better.total).toBeGreaterThan(worse.total);
  });
});
