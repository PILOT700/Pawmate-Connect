# Pawmate Connect

A dating app for people with pets: profiles cover both the person and their
animal, likes turn into matches, and matches turn into conversations, playdates
and community events.

## Run & Operate

- `pnpm --filter @workspace/pawmate run dev` — frontend on port 8080, proxying `/api` to `http://localhost:5050` (override with `API_PROXY_TARGET`)
- `pnpm --filter @workspace/api-server run dev` — API server; **requires `PORT`, `DATABASE_URL` and `COOKIE_SECRET`** and throws without them
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm test` — unit tests; API tests needing Postgres skip unless `TEST_DATABASE_URL` is set (see [DEPLOYMENT.md](DEPLOYMENT.md))
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18, Vite 7, wouter, TanStack Query, Tailwind 4, Radix UI
- API: Express 5
- DB: PostgreSQL (Neon in production) + Drizzle ORM over the `pg` driver
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Tests: Vitest + jsdom
- Hosting: Vercel (frontend), Render (API), Neon (database) — see [DEPLOYMENT.md](DEPLOYMENT.md)

## Where things live

- `lib/api-spec/openapi.yaml` — **the API contract**. Endpoints start here, then `codegen`; never hand-edit `lib/api-zod/src/generated` or `lib/api-client-react/src/generated`
- `lib/db/src/schema/` — the DB schema, one file per table, re-exported from `index.ts`
- `artifacts/api-server/src/routes/` — one router per resource, registered in `routes/index.ts`
- `artifacts/pawmate/src/pages/` — one file per route, wired in `src/App.tsx`
- `artifacts/pawmate/src/components/ui/` — shadcn-style primitives; app components sit a level up

## Architecture decisions

- **The frontend calls the API same-origin.** In production Vercel rewrites `/api/*` to Render; in dev Vite proxies it. The generated client never sets `credentials`, and fetch drops cookies cross-origin, so the session cookie would be lost without this. There is no `VITE_API_URL`.
- **Sessions are opaque tokens in a signed, httpOnly cookie**, stored in `sessions`. Password reset tokens live in their own table and are stored **hashed** — that table is not a way into an account if it leaks.
- **Preferences describe who you want to see, not what you own.** `petTypePrefs` is the pets you want shown; the pet you have is a `pets` row. They were conflated once and it caused real confusion.
- **Discover seeds its filters from preferences only when unambiguous** — a single preferred species or intent. A filter holds one value, so anything broader keeps the full feed rather than picking arbitrarily. A manual choice stops the preference reaching in.
- **The compatibility score is symmetric** and tops out at 92; both sides come from real profile data with no assumed baseline for the viewer.

## Product

Sign up, then onboarding asks what pet you have, who you want to meet, what
you're looking for, distance and age range. The profile wizard collects your
details, photo and your pet's. Discover shows filtered profiles with a daily
highlighted one; likes become matches when they're returned. Matches unlock
messaging and playdate proposals. Alongside that: stories on profiles, community
events with RSVPs and comments, notifications, and blocking and reporting from
any profile.

## Gotchas

- **Schema changes need `db run push` before the code that uses them deploys.** There are no migration files, and Render will not run it.
- **The API refuses to start without `PORT`, `DATABASE_URL` and `COOKIE_SECRET`.** This is deliberate, but it means "just run the server" does not work from a clean checkout.
- **Photo upload needs the two `VITE_CLOUDINARY_*` variables** at build time, or it throws a configured-environment error.
- **Password reset mail needs `RESEND_API_KEY` and `MAIL_FROM`.** Without them the flow works but nothing is sent; outside production the message is logged, in production it is dropped with an error.
- **Editing the OpenAPI spec without running `codegen` leaves the client stale** — the generated files are committed.

## Known gaps

- No Terms or Privacy pages; the signup form links both to `#`.
- No error tracking; Render's logs are it.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
