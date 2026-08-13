# Pawmate Connect — deployment

Three hosts, each doing one thing:

| Piece | Runs on | Notes |
| --- | --- | --- |
| Frontend (`artifacts/pawmate`) | Vercel | Static Vite build |
| API (`artifacts/api-server`) | Render | Express 5, one web service |
| Database | Neon | Postgres, reached over the standard protocol |

Both hosts build from GitHub `main`, so a push deploys.

## How the browser reaches the API

The frontend never calls Render directly. [`vercel.json`](vercel.json) rewrites
`/api/*` to the Render service, which keeps API calls same-origin — the
generated client's fetch never sets `credentials`, and fetch drops cookies on
cross-origin requests, so the session cookie would be lost otherwise. The same
file sends every non-file path to `index.html` so client-side routes survive a
refresh.

Because of that rewrite there is **no `VITE_API_URL`**. The only build-time
variables the frontend reads are the two Cloudinary ones below.

## Environment variables

### Render (API)

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes — throws on boot without it | Neon connection string, keep `?sslmode=require` |
| `COOKIE_SECRET` | yes — throws on boot without it | `openssl rand -hex 32` |
| `PORT` | yes — throws on boot without it | No default in the code |
| `FRONTEND_ORIGIN` | in practice | CORS origin, and the base of the password-reset link. Falls back to `http://localhost:8080` for CORS and to an empty string in the reset link, which would send a broken link |
| `NODE_ENV` | yes for production | Drives secure cookies, `sameSite=none`, and whether mail failures are logged loudly |
| `RESEND_API_KEY` | only for email | Without it, password-reset mail is not sent |
| `MAIL_FROM` | only for email | Verified sender address |

### Vercel (frontend)

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_CLOUDINARY_CLOUD_NAME` | for photo upload | Avatar and pet photos fail without it |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | for photo upload | Unsigned preset |

## Database changes

Schema lives in `lib/db/src/schema`. There are no migration files — the schema
is pushed directly:

```bash
pnpm --filter @workspace/db run push
```

Run it with `DATABASE_URL` pointing at the target database, **before** deploying
code that depends on a new table. Render does not run it for you.

## Local development

The API needs a Postgres and a set of variables; without them it refuses to
start rather than guessing. `docker-compose.yml` brings up a local Postgres if
you want one.

```bash
pnpm install
pnpm --filter @workspace/api-server run dev   # needs DATABASE_URL, COOKIE_SECRET, PORT
pnpm --filter @workspace/pawmate run dev      # http://localhost:8080
```

The dev server proxies `/api` to `http://localhost:5050`. Point it elsewhere
with `API_PROXY_TARGET` — for example at the deployed Render service if you only
want to work on the frontend.

Without a database and those variables the frontend still builds and serves, but
every screen behind sign-in stays on its loading state and the proxy logs
`ECONNREFUSED`.

## Checks before shipping

```bash
pnpm run typecheck   # every package
pnpm test            # frontend unit tests
pnpm run build       # typecheck + build
```

## Verifying a deploy landed

Asset hashes differ between local and Vercel builds because Vercel inlines
`VITE_*` variables the local build does not have — comparing them proves
nothing. Grep the deployed bundle for something the change introduced instead:

```bash
curl -s https://pawmate-frontend-seven.vercel.app/ | grep -o 'assets/index-[A-Za-z0-9_-]*\.js'
```

For the API:

```bash
curl -s https://pawmate-frontend-seven.vercel.app/api/healthz
```

## Known gaps

- **No Terms or Privacy pages.** The signup form still links both to `#`.
- **No error tracking.** Render's logs are the only signal.
- **Tests cover the frontend only** — nothing exercises the API, which would
  need a database the local environment does not have.
