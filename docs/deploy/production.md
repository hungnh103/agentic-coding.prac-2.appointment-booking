# Production Deployment

## Overview

This project deploys a Next.js application to Cloudflare Workers and uses Supabase PostgreSQL as the system of record. Runtime database access in deployed environments should go through Cloudflare Hyperdrive.

## Required Configuration

Populate these values before deploying:

- `DATABASE_URL`
- `DIRECT_DATABASE_URL`
- `AUTH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `EMAIL_FROM`
- `EMAIL_PROVIDER`
- Cloudflare Hyperdrive binding `HYPERDRIVE`

## Release Workflow

1. Install dependencies and run `pnpm lint`, `pnpm typecheck`, and `pnpm test`.
2. Apply Drizzle migrations to the target Supabase database.
3. Verify `wrangler.jsonc` has the correct Worker name, cron schedule, and Hyperdrive binding.
4. Build the Worker bundle with `pnpm deploy`.
5. Smoke test:
   - `GET /api/doctors`
   - `GET /api/doctors/{doctorId}/availability?date=YYYY-MM-DD`
   - admin sign-in at `/admin/login`
   - `GET /api/cron/reminders`
6. Run `pnpm smoke:quickstart` and the perf scripts against the deployed base URL when feasible.

## Supabase Notes

- Use `DIRECT_DATABASE_URL` for migration tooling when a direct Postgres connection is required.
- Keep Drizzle migrations in sync with the deployed database before releasing the Worker.
- Seed data should never be applied to production unchanged.

## Cloudflare Notes

- Cron triggers should keep running every 15 minutes for reminder processing.
- The Worker should expose observability in `wrangler.jsonc`.
- Store production secrets with Wrangler secret management or an equivalent managed secret source.
