import { beforeEach, expect, it, vi, afterEach } from "vitest";
import request from "supertest";
import app from "../app";
import { logger } from "../lib/logger";
import { clientErrorLimiter } from "../lib/rate-limit";
import { describeWithDb, resetDatabase } from "../test/db";

const post = (body: object) => request(app).post("/api/client-errors").send(body);

describeWithDb("taking a crash report from a browser", () => {
  beforeEach(async () => {
    await resetDatabase();
    clientErrorLimiter.resetKey("::ffff:127.0.0.1");
    clientErrorLimiter.resetKey("127.0.0.1");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes the crash to the log", async () => {
    const errorLog = vi.spyOn(logger, "error").mockImplementation(() => {});

    await post({ kind: "render", message: "Cannot read properties of null", path: "/discover" });

    expect(errorLog).toHaveBeenCalledOnce();
    const [details, line] = errorLog.mock.calls[0]!;
    expect(line).toContain("Cannot read properties of null");
    expect(details).toMatchObject({ source: "browser", kind: "render", path: "/discover" });
  });

  // The page is already broken; telling it the report was malformed helps
  // nobody, and the endpoint is open, so a 400 would only guide someone probing.
  it("answers the same to a report it cannot read", async () => {
    vi.spyOn(logger, "warn").mockImplementation(() => {});

    const response = await post({ nonsense: true });

    expect(response.status).toBe(204);
  });

  it("needs no session, since the sign-in screen can crash too", async () => {
    vi.spyOn(logger, "error").mockImplementation(() => {});

    const response = await post({ kind: "uncaught", message: "boom" });

    expect(response.status).toBe(204);
  });

  it("stops a page stuck in a crash loop from filling the log", async () => {
    vi.spyOn(logger, "error").mockImplementation(() => {});
    vi.spyOn(logger, "warn").mockImplementation(() => {});

    const codes: number[] = [];
    for (let i = 0; i < 35; i += 1) {
      codes.push((await post({ kind: "render", message: `crash ${i}` })).status);
    }

    expect(codes).toContain(429);
    expect(codes.filter((c) => c === 204).length).toBeLessThanOrEqual(30);
  });
});
