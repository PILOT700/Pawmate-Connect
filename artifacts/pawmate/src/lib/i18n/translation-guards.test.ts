import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { en } from "./dictionary";
import { ru } from "./ru";

/**
 * The checks that a typecheck cannot make.
 *
 * The dictionary's types already guarantee that Russian has every key English
 * has — a missing one is a build error. What they cannot see is a screen that
 * never asked for a key at all, a plural missing the forms Russian needs, a
 * placeholder mistyped on one side, or a picture pointing at a file nobody
 * committed. Each of these shipped at least once:
 *
 *   - the signed-in navbar stayed English for a whole release
 *   - six landing photographs 404'd in production
 *   - every `alt` on the landing page was read aloud in English
 *
 * All three were green on `tsc` and on the test suite, and were found by
 * looking at the running app. These tests are that looking, made mechanical.
 */

/** The package root, so the paths below read the way they do in a stack trace. */
const SRC = path.resolve(import.meta.dirname, "../../..");

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "ui") continue;
      sourceFiles(full, out);
    } else if (/\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const rel = (file: string) => path.relative(SRC, file);

// ─── plurals ──────────────────────────────────────────────────────────────────

type Node = Record<string, unknown>;

const PLURAL_CATEGORIES = new Set(["zero", "one", "two", "few", "many", "other"]);

function isPluralNode(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== "object") return false;
  const keys = Object.keys(value);
  return keys.length > 0 && keys.every((k) => PLURAL_CATEGORIES.has(k));
}

function walk(node: Node, prefix = ""): { key: string; value: unknown }[] {
  const found: { key: string; value: unknown }[] = [];
  for (const [k, v] of Object.entries(node)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string" || isPluralNode(v)) found.push({ key, value: v });
    else if (v && typeof v === "object") found.push(...walk(v as Node, key));
  }
  return found;
}

const enEntries = walk(en as unknown as Node);
const ruEntries = new Map(walk(ru as unknown as Node).map((e) => [e.key, e.value]));

describe("Russian plurals", () => {
  // Russian selects `one` for 1 and 21, `few` for 2–4 and 22, `many` for 5–20
  // and 25. A form that is missing falls back to `other`, which is how "5 анкеты"
  // reaches a screen — grammatical nonsense that no type can catch.
  it("carries every form Intl will ask for", () => {
    const rules = new Intl.PluralRules("ru");
    const needed = new Set<string>();
    for (let n = 0; n <= 100; n++) needed.add(rules.select(n));

    const incomplete: string[] = [];
    for (const { key, value } of enEntries) {
      if (!isPluralNode(value)) continue;
      const forms = ruEntries.get(key);
      if (!isPluralNode(forms)) {
        incomplete.push(`${key}: missing from ru.ts entirely`);
        continue;
      }
      const missing = [...needed].filter((c) => !(c in forms));
      if (missing.length) incomplete.push(`${key}: no ${missing.join(", ")}`);
    }

    expect(incomplete, `Russian plural entries missing forms:\n  ${incomplete.join("\n  ")}`).toEqual(
      [],
    );
  });
});

// ─── placeholders ─────────────────────────────────────────────────────────────

const placeholders = (s: string) =>
  [...s.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]!).sort();

describe("placeholders", () => {
  // `t()` leaves an unknown placeholder untouched, so a typo does not throw —
  // it renders the literal "{{nmae}}" to the reader.
  it("match between English and Russian for the same key", () => {
    const mismatched: string[] = [];

    for (const { key, value } of enEntries) {
      const other = ruEntries.get(key);
      const pairs: [string, string][] =
        typeof value === "string" && typeof other === "string"
          ? [[value, other]]
          : isPluralNode(value) && isPluralNode(other)
            ? Object.keys(other).map((form) => [
                (value as Record<string, string>).other ?? "",
                other[form]!,
              ])
            : [];

      for (const [source, target] of pairs) {
        const want = placeholders(source);
        const got = placeholders(target);
        // Russian may legitimately drop a name to avoid an oblique case, but it
        // must never introduce one English does not supply a value for.
        const invented = got.filter((p) => !want.includes(p));
        if (invented.length) mismatched.push(`${key}: ru uses {{${invented.join("}}, {{")}}}`);
      }
    }

    expect(mismatched, `placeholders with no value behind them:\n  ${mismatched.join("\n  ")}`).toEqual(
      [],
    );
  });
});

// ─── assets ───────────────────────────────────────────────────────────────────

describe("landing photographs", () => {
  // Vite's dev server answers a missing image with index.html, so a broken path
  // looks like a 200 locally and only 404s once it is in front of members.
  it("all point at files that are actually committed", () => {
    const source = readFileSync(path.join(SRC, "src/lib/landing-images.ts"), "utf8");
    const referenced = [...source.matchAll(/\$\{DIR\}\/([A-Za-z0-9_.-]+)/g)].map((m) => m[1]!);

    expect(referenced.length).toBeGreaterThan(0);

    const missing = [...new Set(referenced)].filter(
      (file) => !existsSync(path.join(SRC, "public/landing", file)),
    );

    expect(missing, `referenced but not in public/landing:\n  ${missing.join("\n  ")}`).toEqual([]);
  });
});

// ─── untranslated text ────────────────────────────────────────────────────────

/**
 * `error-boundary` mounts outside the language provider precisely so it can
 * catch that provider failing, and `not-found` is a developer's message.
 */
const EXEMPT = new Set(["src/components/error-boundary.tsx", "src/pages/not-found.tsx"]);

/** Brand names and words that are the same in both languages. */
const ALLOWED = /^(PawMate|Pawmate|App Store|Google Play|JSON|RSVP|Enter|v\d[\d.]*)$/;

describe("user-facing text", () => {
  it("is never a hard-coded English sentence in JSX", () => {
    const offenders: string[] = [];

    for (const file of sourceFiles(path.join(SRC, "src"))) {
      if (EXEMPT.has(rel(file))) continue;
      const source = readFileSync(file, "utf8");

      // Two things this pattern has to get right, both learned the hard way:
      // newlines belong in the class, because JSX text sits on its own indented
      // line and a line-anchored pattern misses it — that is how the signed-in
      // navbar stayed English; and the text must end at a *closing* tag, or the
      // match runs from one generic's `>` to the next one's `<` and swallows
      // whole functions.
      for (const m of source.matchAll(/>([^<>{}]*[A-Za-z]{3,}[^<>{}]*)<\//g)) {
        const text = m[1]!.replace(/\s+/g, " ").trim();
        if (!text || ALLOWED.test(text) || /^[a-z-]+$/.test(text)) continue;
        // `(data: X) => Promise<void>` is a type annotation, not a tag: the `>`
        // that opened this match belongs to an arrow, and the `<` to a generic.
        if (source[m.index - 1] === "=") continue;
        // Cyrillic means it came from a dictionary the wrong way round, which
        // the next check catches; here we only want raw English.
        if (/[а-яА-ЯёЁ]/.test(text)) continue;
        const line = source.slice(0, m.index).split("\n").length;
        offenders.push(`${rel(file)}:${line}  ${text}`);
      }
    }

    expect(
      offenders,
      `English written straight into JSX — give it a dictionary key:\n  ${offenders.join("\n  ")}`,
    ).toEqual([]);
  });

  it("is never a hard-coded English attribute a reader would hear or see", () => {
    const offenders: string[] = [];
    const ATTRS = /\b(placeholder|title|alt|aria-label)="([^"]*[A-Za-z]{3,}[^"]*)"/g;

    for (const file of sourceFiles(path.join(SRC, "src"))) {
      if (EXEMPT.has(rel(file))) continue;
      const source = readFileSync(file, "utf8");

      for (const m of source.matchAll(ATTRS)) {
        const text = m[2]!.trim();
        if (ALLOWED.test(text) || /[а-яА-ЯёЁ]/.test(text)) continue;
        // An email example reads the same in both languages.
        if (/^[\w.+-]+@[\w.-]+$/.test(text)) continue;
        const line = source.slice(0, m.index).split("\n").length;
        offenders.push(`${rel(file)}:${line}  ${m[1]}="${text}"`);
      }
    }

    expect(
      offenders,
      `English in an attribute — screen readers read these:\n  ${offenders.join("\n  ")}`,
    ).toEqual([]);
  });
});
