# Research: Appointment Booking

## Decision 1: Deploy a single Next.js App Router application to Cloudflare Workers

- **Decision**: Implement the project as one Next.js application with App Router, server components for read-heavy screens, and route handlers or server actions for mutations, then deploy it to Cloudflare Workers through the OpenNext Cloudflare adapter.
- **Rationale**: The system is a single-clinic product with tightly related patient and admin workflows. A unified application keeps routing, design tokens, authentication, and deployment simpler, while Cloudflare Workers matches the app's SSR and API needs better than a static Pages deployment.
- **Alternatives considered**:
  - Cloudflare Pages for the full application: rejected because the project is a full-stack SSR Next.js app rather than a static export.
  - Separate frontend and backend projects: rejected because it adds deployment and contract overhead before the product needs that complexity.
  - SPA with a separate API server: rejected because server rendering and server-side data access are a better fit for appointment availability pages and secure admin mutations.

## Decision 2: Use Supabase as the managed PostgreSQL provider and Drizzle as the application data layer

- **Decision**: Host the transactional database in Supabase PostgreSQL, manage schema changes with Drizzle migrations, and keep application queries inside the Next.js codebase rather than using Supabase client APIs as the main data access layer.
- **Rationale**: Supabase provides a fast, well-supported managed PostgreSQL setup for a personal project, while Drizzle preserves type-safe schema ownership in code. This keeps the implementation aligned with the chosen stack and avoids splitting domain logic across multiple abstractions.
- **Alternatives considered**:
  - Self-managed PostgreSQL: rejected because it increases operational burden for a first release.
  - Using Supabase Auth and generated data clients as the primary backend layer: rejected for now because admin authentication is already planned around Auth.js and the feature does not need a separate auth platform yet.

## Decision 3: Connect Cloudflare Workers to Supabase PostgreSQL through Hyperdrive

- **Decision**: In deployed environments, route database traffic from Cloudflare Workers to Supabase PostgreSQL through Cloudflare Hyperdrive for pooled connections and lower connection overhead.
- **Rationale**: Workers are short-lived and should avoid opening fresh database connections per request. Hyperdrive improves operational safety and runtime efficiency for Postgres-backed Workers workloads.
- **Alternatives considered**:
  - Direct database connections from Workers to Supabase without pooling: rejected because connection churn is riskier under serverless concurrency.
  - Moving the database away from Supabase to a Cloudflare-native database: rejected because the user explicitly chose PostgreSQL on Supabase and the domain model fits relational storage well.

## Decision 4: Model bookable availability from working schedules, time off, and appointments with fixed 30-minute slots

- **Decision**: Represent doctor capacity using working schedule windows plus time-off intervals, and derive patient-facing availability in 30-minute slots at query time.
- **Rationale**: The spec already assumes standard appointment slots defined by the clinic. Fixed 30-minute slots are simple to reason about, straightforward to validate, and enough for an initial clinic-focused release.
- **Alternatives considered**:
  - Persist every future slot as rows: rejected because it increases maintenance and synchronization complexity when schedules change.
  - Variable slot duration per doctor: rejected for v1 because it complicates admin UX, availability generation, and booking validation without a current requirement.

## Decision 5: Enforce booking conflict safety with PostgreSQL constraints plus transactional checks

- **Decision**: Prevent duplicate active appointments by combining an application-level transaction with a Supabase PostgreSQL unique constraint or partial unique index covering doctor, appointment date, start time, and active statuses.
- **Rationale**: Race conditions are explicitly called out in the spec. Database-backed conflict prevention is the most reliable way to guarantee `FR-004` under concurrent booking attempts.
- **Alternatives considered**:
  - In-memory locking only: rejected because it fails across multiple processes or deployments.
  - First-write-wins logic without a DB constraint: rejected because it is too easy to bypass during concurrent requests.

## Decision 6: Send confirmations and reminders through an email-first notification pipeline

- **Decision**: Deliver confirmation, cancellation, and reminder notifications through an email adapter, and record all delivery attempts in a notification events table.
- **Rationale**: Email is the lowest-friction channel for a personal project, works well for confirmations and reminders, and supports auditability without introducing SMS provider complexity. An adapter boundary keeps future channel expansion open.
- **Alternatives considered**:
  - SMS-first notifications: rejected because provider setup and delivery cost add complexity not required by the spec.
  - No delivery log: rejected because failed reminders and canceled-send prevention need observable state.

## Decision 7: Process reminders with a Cloudflare Cron Trigger every 15 minutes

- **Decision**: Run a Cloudflare Cron Trigger every 15 minutes to select eligible appointments, send reminders, and mark notification outcomes.
- **Rationale**: The product only needs near-term reminders, not second-level precision. A Cron Trigger fits naturally with the Cloudflare Workers deployment model and is easier to operate than a distributed queue for the expected clinic scale.
- **Alternatives considered**:
  - Per-appointment delayed jobs: rejected because it adds queue infrastructure before the system needs it.
  - Manual reminder triggers: rejected because it does not satisfy automated reminder requirements.

## Decision 8: Use credentials-based admin authentication with a single internal admin role

- **Decision**: Protect admin routes with a credentials-based Auth.js flow and a single `admin` role in the initial release.
- **Rationale**: The spec defines admins as trusted internal users and does not require finer-grained permissions. A single role keeps authorization understandable while still protecting schedule and appointment actions.
- **Alternatives considered**:
  - No authentication in v1: rejected because admin schedule and cancellation actions must be attributable and protected.
  - Multi-role RBAC from day one: rejected because the current scope does not justify the added permission model complexity.

## Decision 9: Use layered automated coverage aligned to booking risk

- **Decision**: Combine unit tests for domain rules, integration tests against a Supabase-compatible PostgreSQL test database, contract validation for route handlers, and Playwright coverage for the primary patient and admin journeys, plus a Workers-compatible preview smoke test before deployment.
- **Rationale**: Booking conflicts, reminders, and schedule changes are stateful and cross-cutting. The chosen coverage layers match the constitution and provide high confidence where regressions would be most damaging.
- **Alternatives considered**:
  - End-to-end tests only: rejected because they are slower and make conflict diagnosis harder.
  - Unit tests only: rejected because booking and notification correctness depend on database behavior and route contracts.
