# Appointment Booking

Appointment Booking is a Next.js App Router application for a dental and maxillofacial clinic. Patients can browse doctor availability, submit bookings, and review appointment status. Admins can sign in, confirm or cancel appointments, and manage doctor schedules and leave.

## Stack

- Next.js App Router with React 19
- TypeScript 5
- Drizzle ORM with PostgreSQL
- Supabase PostgreSQL
- Cloudflare Workers via OpenNext
- Vitest and Playwright

## Local Setup

1. Install dependencies.
2. Copy `.env.example` to `.env`.
3. Copy `.dev.vars.example` to `.dev.vars`.
4. Start the local Postgres container and seed data.
5. Run the app.

```bash
PATH="$HOME/.nvm/versions/node/v24.17.0/bin:$PATH" pnpm install
cp .env.example .env
cp .dev.vars.example .dev.vars
PATH="$HOME/.nvm/versions/node/v24.17.0/bin:$PATH" pnpm db:setup-local
PATH="$HOME/.nvm/versions/node/v24.17.0/bin:$PATH" pnpm dev
```

Default admin credentials come from `.env`:

- `ADMIN_EMAIL=admin@example.com`
- `ADMIN_PASSWORD=password123`

## Verification

```bash
PATH="$HOME/.nvm/versions/node/v24.17.0/bin:$PATH" pnpm lint
PATH="$HOME/.nvm/versions/node/v24.17.0/bin:$PATH" pnpm typecheck
PATH="$HOME/.nvm/versions/node/v24.17.0/bin:$PATH" pnpm test
PATH="$HOME/.nvm/versions/node/v24.17.0/bin:$PATH" pnpm test:e2e
PATH="$HOME/.nvm/versions/node/v24.17.0/bin:$PATH" pnpm smoke:quickstart
PATH="$HOME/.nvm/versions/node/v24.17.0/bin:$PATH" pnpm perf:availability
PATH="$HOME/.nvm/versions/node/v24.17.0/bin:$PATH" pnpm perf:booking
```

## User Flows

- Patient booking starts from `/`.
- Appointment summary pages live at `/appointments/[appointmentId]`.
- Admin review lives at `/admin/appointments`.
- Doctor schedule management lives at `/admin/doctors/[doctorId]/schedule`.

## Operations

- Local reminder job: `GET /api/cron/reminders`
- Local Workers preview: `pnpm cf:preview`
- Deployment guidance: [docs/deploy/production.md](/home/nguyenhuyhungc/workspace/learning-hub/agentic-coding.prac-2.appointment-booking/docs/deploy/production.md)
