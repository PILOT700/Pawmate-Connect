import { defineConfig } from "vitest/config";
import path from "path";

// Kept apart from vite.config.ts: that one reads PORT and throws when it is
// unset, which would make the tests depend on the dev server's environment.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  test: {
    // sessionStorage is a browser API, and the onboarding handover leans on it.
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
