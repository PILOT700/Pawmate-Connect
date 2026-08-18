import { beforeEach, expect, it } from "vitest";
import request from "supertest";
import { db, blocksTable, passesTable } from "@workspace/db";
import app from "../app";
import { describeWithDb, makePet, makeUser, resetDatabase } from "../test/db";
import { sessionCookie } from "../test/session";

// Roughly the real places, so a wrong sign or a swapped latitude shows up as a
// wildly wrong distance rather than passing by luck.
const FRANKFURT = { cityLat: 50.11, cityLng: 8.68 };
const MAINZ = { cityLat: 49.99, cityLng: 8.24 }; // ~32 km from Frankfurt
const LISBON = { cityLat: 38.72, cityLng: -9.14 }; // ~1900 km away
// Frankfurt's latitude exactly, far to the east — about 800 km out. Frankfurt
// and Mainz differ by a similar amount in both coordinates, so on those two a
// formula that confused latitude with longitude would still look right.
const DUE_EAST = { cityLat: 50.11, cityLng: 20.0 };

async function feedFor(userId: string, query = "") {
  return request(app)
    .get(`/api/discover${query}`)
    .set("Cookie", await sessionCookie(userId));
}

const names = (body: { items: { firstName: string }[] }) =>
  body.items.map((i) => i.firstName).sort();

describeWithDb("the discover feed", () => {
  beforeEach(resetDatabase);

  it("leaves you out of your own feed", async () => {
    const me = await makeUser({ firstName: "Me" });
    await makeUser({ firstName: "Someone" });

    const response = await feedFor(me.id);

    expect(names(response.body)).toEqual(["Someone"]);
  });

  it("drops anyone you passed on", async () => {
    const me = await makeUser();
    const skipped = await makeUser({ firstName: "Skipped" });
    await makeUser({ firstName: "Kept" });
    await db.insert(passesTable).values({ userId: me.id, passedUserId: skipped.id });

    expect(names((await feedFor(me.id)).body)).toEqual(["Kept"]);
  });

  it("hides a block in both directions", async () => {
    const me = await makeUser();
    const blocked = await makeUser({ firstName: "Blocked" });
    const blocker = await makeUser({ firstName: "Blocker" });
    await db.insert(blocksTable).values({ blockerId: me.id, blockedUserId: blocked.id });
    await db.insert(blocksTable).values({ blockerId: blocker.id, blockedUserId: me.id });

    expect((await feedFor(me.id)).body.items).toHaveLength(0);
  });

  it("filters by the species someone keeps", async () => {
    const me = await makeUser();
    const catOwner = await makeUser({ firstName: "CatOwner" });
    const dogOwner = await makeUser({ firstName: "DogOwner" });
    await makePet(catOwner.id, "cat");
    await makePet(dogOwner.id, "dog");

    expect(names((await feedFor(me.id, "?species=cat")).body)).toEqual(["CatOwner"]);
  });

  it("keeps an unstated age inside every range", async () => {
    const me = await makeUser();
    await makeUser({ firstName: "Young", age: 22 });
    await makeUser({ firstName: "Older", age: 60 });
    await makeUser({ firstName: "Unstated", age: null });

    expect(names((await feedFor(me.id, "?ageMin=30&ageMax=50")).body)).toEqual(["Unstated"]);
  });

  it("applies the age bounds inclusively", async () => {
    const me = await makeUser();
    await makeUser({ firstName: "Exactly30", age: 30 });
    await makeUser({ firstName: "Exactly50", age: 50 });
    await makeUser({ firstName: "TooOld", age: 51 });

    expect(names((await feedFor(me.id, "?ageMin=30&ageMax=50")).body)).toEqual([
      "Exactly30",
      "Exactly50",
    ]);
  });

  it("keeps the nearby city and drops the far one", async () => {
    const me = await makeUser(FRANKFURT);
    await makeUser({ firstName: "Nearby", ...MAINZ });
    await makeUser({ firstName: "FarAway", ...LISBON });

    expect(names((await feedFor(me.id, "?maxDistanceKm=80")).body)).toEqual(["Nearby"]);
  });

  /**
   * Mainz is about 34 km from Frankfurt, so a 25 km radius must exclude it.
   * The number matters: were the radius still Earth's in miles, the same two
   * points would measure 21 and slip inside the limit. Every other distance
   * test here passes under either unit, which is how the mistake would hide.
   */
  it("measures in kilometres, not miles", async () => {
    const me = await makeUser(FRANKFURT);
    await makeUser({ firstName: "Mainz", ...MAINZ });

    expect((await feedFor(me.id, "?maxDistanceKm=25")).body.items).toHaveLength(0);
  });

  it("measures east-west distance, not just north-south", async () => {
    const me = await makeUser(FRANKFURT);
    await makeUser({ firstName: "Nearby", ...MAINZ });
    await makeUser({ firstName: "DueEast", ...DUE_EAST });

    expect(names((await feedFor(me.id, "?maxDistanceKm=80")).body)).toEqual(["Nearby"]);
  });

  it("keeps someone whose city could not be placed", async () => {
    const me = await makeUser(FRANKFURT);
    await makeUser({ firstName: "Unplaced", city: "Atlantis", cityLat: null, cityLng: null });
    await makeUser({ firstName: "FarAway", ...LISBON });

    expect(names((await feedFor(me.id, "?maxDistanceKm=80")).body)).toEqual(["Unplaced"]);
  });

  // Otherwise the one person who never filled in a city sees an empty app.
  it("shows the whole feed to a viewer with no city of their own", async () => {
    const me = await makeUser({ cityLat: null, cityLng: null });
    await makeUser({ firstName: "Nearby", ...MAINZ });
    await makeUser({ firstName: "FarAway", ...LISBON });

    expect(names((await feedFor(me.id, "?maxDistanceKm=8")).body)).toEqual([
      "FarAway",
      "Nearby",
    ]);
  });
});
