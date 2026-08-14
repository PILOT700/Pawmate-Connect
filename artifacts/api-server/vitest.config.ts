import { defineConfig } from "vitest/config";

// The database tests point the app's own DATABASE_URL at TEST_DATABASE_URL, so
// nothing can reach a real database by forgetting to override it. Without that
// variable they skip and the standalone tests still run.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    globalSetup: ["./src/test/global-setup.ts"],
    env: {
      DATABASE_URL: process.env["TEST_DATABASE_URL"] ?? "postgres://unused",
      // The app refuses to load without one; its value is irrelevant here as
      // long as signing and verifying use the same string.
      COOKIE_SECRET: "test-cookie-secret",
      NODE_ENV: "test",
      LOG_LEVEL: "silent",
    },
    // Each file truncates the same tables, so they cannot share a database.
    fileParallelism: false,
  },
});
