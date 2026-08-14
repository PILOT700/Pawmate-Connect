import { execFileSync } from "node:child_process";
import path from "node:path";

/**
 * Builds the schema in the test database once per run.
 *
 * `drizzle-kit push` is the same command used against real environments, so
 * these tests run on the schema the app actually ships rather than on a copy
 * that can drift away from it.
 */
export default function setup() {
  const url = process.env["TEST_DATABASE_URL"];
  if (!url) return;

  const dbPackage = path.resolve(import.meta.dirname, "../../../../lib/db");

  execFileSync(
    "pnpm",
    ["exec", "drizzle-kit", "push", "--force", "--config", "./drizzle.config.ts"],
    {
      cwd: dbPackage,
      env: { ...process.env, DATABASE_URL: url },
      stdio: "inherit",
    },
  );
}
