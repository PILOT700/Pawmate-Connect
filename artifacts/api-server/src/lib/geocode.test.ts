import { afterEach, describe, expect, it, vi } from "vitest";
import { geocodeCity } from "./geocode";

function respondWith(body: unknown, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 503,
    json: async () => body,
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("turning a city name into a point", () => {
  it("reads the coordinates the geocoder returns", async () => {
    vi.stubGlobal("fetch", respondWith([{ lat: "50.1109", lon: "8.6821" }]));

    expect(await geocodeCity("Frankfurt")).toEqual({ lat: 50.1109, lng: 8.6821 });
  });

  it("identifies itself, as the geocoder's terms require", async () => {
    const fetchMock = respondWith([{ lat: "1", lon: "2" }]);
    vi.stubGlobal("fetch", fetchMock);

    await geocodeCity("Frankfurt");

    const headers = fetchMock.mock.calls[0]![1].headers;
    expect(headers["User-Agent"]).toContain("Pawmate");
  });

  it("escapes the city so a name with spaces still resolves", async () => {
    const fetchMock = respondWith([{ lat: "1", lon: "2" }]);
    vi.stubGlobal("fetch", fetchMock);

    await geocodeCity("New York");

    expect(fetchMock.mock.calls[0]![0]).toContain("New%20York");
  });

  // Everything below must return null rather than throw: this runs inside
  // saving a profile, and a third party having a bad day is not a reason to
  // refuse someone their own city.
  it("gives up quietly on an unknown city", async () => {
    vi.stubGlobal("fetch", respondWith([]));

    expect(await geocodeCity("Nowhereville")).toBeNull();
  });

  it("gives up quietly when the geocoder errors", async () => {
    vi.stubGlobal("fetch", respondWith(null, false));

    expect(await geocodeCity("Frankfurt")).toBeNull();
  });

  it("gives up quietly when the request throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timed out")));

    expect(await geocodeCity("Frankfurt")).toBeNull();
  });

  it("rejects coordinates that are not numbers", async () => {
    vi.stubGlobal("fetch", respondWith([{ lat: "not-a-number", lon: "8.68" }]));

    expect(await geocodeCity("Frankfurt")).toBeNull();
  });

  it("does not call out for a blank city", async () => {
    const fetchMock = respondWith([{ lat: "1", lon: "2" }]);
    vi.stubGlobal("fetch", fetchMock);

    expect(await geocodeCity("   ")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
