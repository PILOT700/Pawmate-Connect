import { defineConfig } from "vitest/config";

// Node environment and no database: only the pieces that stand alone are
// covered here. Anything touching Drizzle needs a Postgres to talk to.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
