import { afterEach, describe, expect, it, vi } from "vitest";
import crypto from "node:crypto";
import { checkPassword, isBreachedPassword } from "./password-strength";

/** Answers as the breach service would for a password it has, or hasn't, seen. */
function breachServiceKnowing(...knownPasswords: string[]) {
  const suffixes = knownPasswords.map((p) =>
    crypto.createHash("sha1").update(p).digest("hex").toUpperCase().slice(5),
  );

  return vi.fn().mockResolvedValue({
    ok: true,
    text: async () => [...suffixes.map((s) => `${s}:42`), "0000000000000000000000000000000000000:1"].join("\r\n"),
  });
}

const clean = () => vi.stubGlobal("fetch", breachServiceKnowing());

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("what a new password has to clear", () => {
  it("accepts an ordinary strong one", async () => {
    clean();
    expect(await checkPassword("correct-horse-battery")).toBeNull();
  });

  it("turns away anything under ten characters", async () => {
    clean();
    const problem = await checkPassword("short1!x");
    expect(problem?.message).toMatch(/at least 10/i);
  });

  // bcrypt reads the first 72 bytes and ignores the rest, so a longer password
  // would be silently equal to its own beginning.
  it("refuses a password longer than bcrypt actually reads", async () => {
    clean();
    const problem = await checkPassword("a1B!".repeat(30));
    expect(problem?.message).toMatch(/too long/i);
  });

  it("counts bytes, not characters, against that limit", async () => {
    clean();
    // 30 emoji are 30 characters but 120 bytes.
    const problem = await checkPassword("🐕".repeat(30));
    expect(problem?.message).toMatch(/too long/i);
  });

  it("won't let the email be the password", async () => {
    clean();
    const problem = await checkPassword("elshanElshan99", { email: "elshan@example.com" });
    expect(problem?.message).toMatch(/email/i);
  });

  it("ignores the case of the email when checking that", async () => {
    clean();
    const problem = await checkPassword("XXelshanXX99", { email: "ELSHAN@example.com" });
    expect(problem?.message).toMatch(/email/i);
  });

  it("rejects one long run of the same few characters", async () => {
    clean();
    const problem = await checkPassword("aaaaaaaaaaaaaa");
    expect(problem?.message).toMatch(/different characters/i);
  });

  it("rejects a password known to have leaked", async () => {
    vi.stubGlobal("fetch", breachServiceKnowing("Password123!"));
    const problem = await checkPassword("Password123!");
    expect(problem?.message).toMatch(/breach/i);
  });

  it("accepts one the breach service has never seen", async () => {
    vi.stubGlobal("fetch", breachServiceKnowing("something-else-entirely"));
    expect(await checkPassword("correct-horse-battery")).toBeNull();
  });
});

describe("asking the breach service", () => {
  it("sends five characters of the hash and never the password", async () => {
    const fetchMock = breachServiceKnowing();
    vi.stubGlobal("fetch", fetchMock);

    await isBreachedPassword("correct-horse-battery");

    const url = fetchMock.mock.calls[0]![0] as string;
    expect(url).not.toContain("correct-horse");
    expect(url).toMatch(/\/range\/[0-9A-F]{5}$/);
  });

  // Someone signing up should not be turned away because a third party is down.
  it("lets the password through when the service errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    expect(await isBreachedPassword("anything")).toBe(false);
  });

  it("lets the password through when the request throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timed out")));
    expect(await isBreachedPassword("anything")).toBe(false);
  });

  it("still applies the other rules when the service is down", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timed out")));
    expect((await checkPassword("short"))?.message).toMatch(/at least 10/i);
  });
});
