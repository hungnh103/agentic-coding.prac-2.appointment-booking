# Implementation Plan: Appointment Booking

**Branch**: `[master]` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-appointment-booking/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a responsive appointment-booking web application for a dental and maxillofacial clinic where patients can browse doctor availability, submit booking requests, and receive confirmations and reminders, while admins manage approvals, cancellations, working schedules, and leave. The implementation will use a single Next.js application managed with `pnpm` and deployed to Cloudflare Workers via the OpenNext Cloudflare adapter, Supabase-hosted PostgreSQL for transactional scheduling data, Drizzle ORM for schema and query safety, and Tailwind CSS for a bright, modern UI, with server-side availability calculation, Cloudflare Cron-based reminder processing, and database-enforced protection against duplicate active bookings.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 22 LTS

**Primary Dependencies**: Next.js App Router, React 19, Tailwind CSS, Drizzle ORM, Drizzle Kit, Zod, Auth.js for admin authentication, Wrangler, OpenNext Cloudflare adapter, Cloudflare Hyperdrive for pooled database connectivity, and a provider-agnostic email adapter for confirmations and reminders

**Storage**: Supabase PostgreSQL 16 for operational data and notification logs, accessed from Cloudflare Workers through Hyperdrive in deployed environments

**Testing**: Vitest for unit/integration tests, React Testing Library for component behavior, Playwright for end-to-end flows, OpenAPI schema validation for contract coverage

**Target Platform**: Modern desktop and mobile browsers, deployed as a server-rendered Next.js application on Cloudflare Workers with Cloudflare Cron Triggers for scheduled jobs

**Project Type**: Web application

**Performance Goals**: Availability pages render initial data in under 1.5 seconds p95 on standard broadband, booking and admin decision mutations complete in under 800 ms p95 worker execution time excluding remote database latency spikes, patient-visible schedule changes propagate within 5 minutes, reminder dispatch completes within 5 minutes of each Cloudflare Cron execution window

**Constraints**: Duplicate active bookings for the same doctor and slot must remain impossible at the database level, patient and admin flows must remain usable at 360 px mobile width, accessibility must cover keyboard navigation and screen-reader labels, all server-side code must stay compatible with the Cloudflare Workers runtime, Supabase is used as the managed PostgreSQL provider rather than as the primary application auth layer, and the feature excludes electronic medical records and multi-clinic tenancy

**Scale/Scope**: Single clinic, up to 50 doctors, up to 10 admins, and roughly 5,000 appointments per month in the first release

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Code Quality**: Planned source modules include `app/` routes and pages, `components/` UI building blocks, `lib/availability/`, `lib/appointments/`, `lib/notifications/`, `lib/auth/`, `lib/db/`, and deployment config files such as `wrangler.jsonc` and `open-next.config.ts`. Quality gates are `pnpm lint`, `pnpm exec tsc --noEmit`, generated Drizzle migration review, and a deployment smoke check through local Workers-compatible preview. No architectural deviation is required; a single app is sufficient for patient and admin flows.
- **Testing**: Unit coverage is required for slot generation, appointment state transitions, reminder eligibility, and validation schemas. Integration coverage is required for booking submission, admin confirm/cancel actions, schedule/time-off management, and notification dispatch orchestration against a Supabase-backed PostgreSQL test database. Contract coverage is required for public route handlers documented in `contracts/appointment-booking-api.yaml`. End-to-end coverage is required for the highest-value patient booking flow and the admin scheduling flow. No layer is intentionally omitted.
- **User Experience Consistency**: Impacted journeys are patient availability browsing, patient booking confirmation, admin appointment review, and admin schedule maintenance. Shared patterns must include consistent status badges, form validation messages, loading states, and empty/error states across patient and admin screens. Accessibility expectations include semantic headings, labeled fields, focus-visible states, and non-color-only availability indicators. A reusable calendar-slot grid pattern and an appointment status badge pattern must be documented and reused.
- **Performance**: Temporary thresholds are defined in this plan because no baseline exists yet. Validation will include seeded-load checks for availability queries, duplicate-booking race-condition tests, browser-based responsiveness checks on mobile and desktop, and a Cloudflare Worker preview check to confirm database access stays within acceptable latency when routed to Supabase through Hyperdrive.

## Project Structure

### Documentation (this feature)

```text
specs/001-appointment-booking/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── appointment-booking-api.yaml
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── (marketing)/
├── appointments/
│   ├── page.tsx
│   └── [appointmentId]/page.tsx
├── doctors/
│   └── [doctorId]/page.tsx
├── admin/
│   ├── appointments/page.tsx
│   ├── doctors/[doctorId]/schedule/page.tsx
│   └── login/page.tsx
├── api/
│   ├── doctors/route.ts
│   ├── doctors/[doctorId]/availability/route.ts
│   ├── appointments/route.ts
│   └── admin/...
└── layout.tsx

components/
├── appointments/
├── availability/
├── admin/
└── ui/

lib/
├── auth/
├── db/
│   ├── client.ts
│   ├── schema/
│   └── migrations/
├── availability/
├── appointments/
├── notifications/
└── validation/

drizzle/
open-next.config.ts
wrangler.jsonc

tests/
├── contract/
├── integration/
├── unit/
└── e2e/
```

**Structure Decision**: Use a single Next.js application with App Router so patient and admin experiences share one design system, one deployment unit, and one Supabase PostgreSQL-backed domain model. Route handlers under `app/api/` expose the contracts defined in this feature, while domain logic stays in `lib/`, Drizzle schema and migrations stay in `lib/db/` and `drizzle/`, and Cloudflare deployment concerns stay in `wrangler.jsonc` plus the OpenNext adapter configuration.

## Complexity Tracking

No constitution violations or justified complexity exceptions were identified during planning.
