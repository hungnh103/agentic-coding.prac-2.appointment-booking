# Tasks: Appointment Booking

**Input**: Design documents from `/specs/001-appointment-booking/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Include the test tasks required to satisfy the constitution and feature plan. Unit, integration, contract, and end-to-end coverage are all required for this feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Next.js App Router source lives at the repository root under `app/`, `components/`, `lib/`, `drizzle/`, and `tests/`
- Deployment configuration lives in `open-next.config.ts` and `wrangler.jsonc`
- Supporting scripts live in `scripts/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the application stack, Supabase and Cloudflare delivery configuration, and shared tooling.

- [X] T001 Initialize the Next.js App Router project, TypeScript config, and core scripts in `package.json`, `next.config.ts`, and `tsconfig.json`
- [X] T002 Configure Cloudflare Workers deployment, Cron Triggers, and OpenNext output settings in `open-next.config.ts` and `wrangler.jsonc`
- [X] T003 [P] Configure Tailwind CSS, PostCSS, and bright global design tokens in `postcss.config.mjs`, `tailwind.config.ts`, `app/globals.css`, and `components/ui/button.tsx`
- [X] T004 [P] Configure linting, Vitest, Playwright, and shared test commands in `eslint.config.mjs`, `vitest.config.ts`, `playwright.config.ts`, and `package.json`
- [X] T005 [P] Create application environment templates and runtime parsing in `.env.example` and `lib/config/env.ts`
- [X] T006 [P] Configure Supabase local project bootstrap, seed input, and operator defaults in `supabase/config.toml` and `supabase/seed.sql`
- [X] T007 [P] Define Cloudflare local secrets, Hyperdrive binding placeholders, and deploy-time variable templates in `.dev.vars.example` and `wrangler.jsonc`
- [X] T008 [P] Add shared seed data and performance harness scripts in `scripts/seed.ts` and `scripts/perf/check-availability.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the cross-cutting platform pieces required before user story work can begin.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T009 Create Drizzle configuration and database client bootstrap in `drizzle.config.ts` and `lib/db/client.ts`
- [X] T010 [P] Define shared database schema modules in `lib/db/schema/admin-users.ts`, `lib/db/schema/doctors.ts`, `lib/db/schema/work-schedules.ts`, `lib/db/schema/time-off.ts`, `lib/db/schema/patients.ts`, `lib/db/schema/appointments.ts`, `lib/db/schema/appointment-audit-log.ts`, `lib/db/schema/notification-events.ts`, and `lib/db/schema/index.ts`
- [X] T011 Generate the initial Drizzle migration with required indexes and constraints in `drizzle/0000_initial_schema.sql` and `drizzle/meta/_journal.json`
- [X] T012 [P] Implement Auth.js admin authentication and route protection in `lib/auth/config.ts`, `app/api/auth/[...nextauth]/route.ts`, and `middleware.ts`
- [X] T013 [P] Implement shared Zod schemas and API error helpers in `lib/validation/appointments.ts`, `lib/validation/schedules.ts`, `lib/http/api-error.ts`, and `lib/http/route-handler.ts`
- [X] T014 [P] Implement reusable slot, status, and form feedback UI primitives in `components/availability/slot-grid.tsx`, `components/appointments/status-badge.tsx`, and `components/ui/form-feedback.tsx`
- [X] T015 [P] Implement slot generation and availability rule primitives in `lib/availability/slot-generator.ts` and `lib/availability/availability-rules.ts`
- [X] T016 Create the root application layout, providers, and admin shell scaffolding in `app/layout.tsx`, `app/providers.tsx`, `app/admin/layout.tsx`, and `components/ui/page-shell.tsx`

**Checkpoint**: Foundation ready. User story work can begin in parallel.

---

## Phase 3: User Story 1 - Patient books an appointment slot (Priority: P1) 🎯 MVP

**Goal**: Let patients browse doctor availability, reserve a valid slot, and receive a clear appointment summary.

**Independent Test**: A patient can open a doctor page, view available slots for a date, submit valid contact details for one slot, and see a persisted appointment summary while a concurrent second booking attempt is rejected.

### Tests for User Story 1

- [X] T017 [P] [US1] Add contract tests for doctor listing, availability, and booking routes in `tests/contract/doctors.contract.test.ts` and `tests/contract/appointments.contract.test.ts`
- [X] T018 [P] [US1] Add integration tests for patient booking, appointment summary data, and slot conflict handling in `tests/integration/patient-booking.test.ts`
- [X] T019 [P] [US1] Add unit tests for slot generation and transactional booking safeguards in `tests/unit/availability.test.ts` and `tests/unit/booking-service.test.ts`
- [X] T020 [P] [US1] Add Playwright coverage for the responsive patient booking flow in `tests/e2e/patient-booking.spec.ts`

### Implementation for User Story 1

- [X] T021 [P] [US1] Implement doctor, schedule, and availability query modules in `lib/db/queries/doctors.ts` and `lib/db/queries/availability.ts`
- [X] T022 [P] [US1] Implement patient, appointment, and audit persistence modules in `lib/db/queries/patients.ts` and `lib/db/queries/appointments.ts`
- [X] T023 [US1] Implement public availability and booking services in `lib/availability/public-availability-service.ts` and `lib/appointments/booking-service.ts`
- [X] T024 [US1] Implement patient API routes in `app/api/doctors/route.ts`, `app/api/doctors/[doctorId]/availability/route.ts`, and `app/api/appointments/route.ts`
- [X] T025 [P] [US1] Build patient availability browsing and booking form UI in `app/(marketing)/page.tsx`, `app/doctors/[doctorId]/page.tsx`, `components/availability/availability-calendar.tsx`, and `components/appointments/booking-form.tsx`
- [X] T026 [US1] Build the patient appointment summary and resilient loading or error states in `app/appointments/[appointmentId]/page.tsx`, `app/doctors/[doctorId]/loading.tsx`, `app/doctors/[doctorId]/error.tsx`, and `components/appointments/appointment-summary.tsx`
- [X] T027 [US1] Add accessibility, copy, and availability performance assertions in `tests/e2e/patient-booking.spec.ts` and `scripts/perf/check-availability.ts`

**Checkpoint**: User Story 1 is fully functional and independently testable as the MVP.

---

## Phase 4: User Story 2 - Patient receives confirmation and reminder (Priority: P2)

**Goal**: Ensure confirmed appointments generate patient-facing confirmation details and automated reminders while canceled or invalid appointments are skipped.

**Independent Test**: Starting from seeded appointments, a confirmed appointment produces a confirmation and reminder record, a canceled appointment produces no reminder, and the patient-facing appointment page shows the current notification-aware status clearly.

### Tests for User Story 2

- [X] T028 [P] [US2] Add integration tests for confirmation delivery, cancellation notices, and reminder skipping in `tests/integration/notification-workflows.test.ts`
- [X] T029 [P] [US2] Add unit tests for notification scheduling and reminder eligibility in `tests/unit/notification-service.test.ts` and `tests/unit/reminder-service.test.ts`
- [X] T030 [P] [US2] Add Playwright coverage for patient appointment status updates and reminder-ready messaging in `tests/e2e/appointment-status.spec.ts`

### Implementation for User Story 2

- [X] T031 [P] [US2] Implement notification event queries and email adapter abstractions in `lib/db/queries/notifications.ts` and `lib/notifications/email-adapter.ts`
- [X] T032 [US2] Implement notification composition, scheduling, and reminder processing services in `lib/notifications/message-builder.ts`, `lib/notifications/notification-service.ts`, and `lib/notifications/reminder-service.ts`
- [X] T033 [US2] Implement the reminder job execution path for local preview and deployment in `app/api/cron/reminders/route.ts` and `lib/notifications/run-reminders.ts`
- [X] T034 [P] [US2] Build patient appointment status timeline UI in `app/appointments/[appointmentId]/page.tsx` and `components/appointments/appointment-status-timeline.tsx`
- [X] T035 [US2] Implement appointment detail loading with notification-aware status mapping in `lib/appointments/appointment-detail-service.ts` and `app/appointments/[appointmentId]/page.tsx`

**Checkpoint**: User Story 2 is independently testable with seeded confirmed and canceled appointments plus reminder execution.

---

## Phase 5: User Story 3 - Admin manages appointment approvals and doctor schedules (Priority: P3)

**Goal**: Let admins authenticate, review appointments, confirm or cancel them, and manage doctor working hours and leave so patient-facing availability stays accurate.

**Independent Test**: An admin signs in, updates a doctor's work schedule, adds time off, confirms one pending appointment, cancels another with a reason, and the affected patient availability updates to reflect real capacity.

### Tests for User Story 3

- [ ] T036 [P] [US3] Add contract tests for admin appointment review and doctor schedule routes in `tests/contract/admin-appointments.contract.test.ts` and `tests/contract/admin-schedules.contract.test.ts`
- [ ] T037 [P] [US3] Add integration tests for admin approval, cancellation, work schedules, and time-off conflicts in `tests/integration/admin-scheduling.test.ts`
- [ ] T038 [P] [US3] Add unit tests for schedule validation and appointment state transitions in `tests/unit/schedule-management.test.ts` and `tests/unit/appointment-status-service.test.ts`
- [ ] T039 [P] [US3] Add Playwright coverage for admin appointment review and doctor schedule management in `tests/e2e/admin-scheduling.spec.ts`

### Implementation for User Story 3

- [ ] T040 [P] [US3] Implement admin appointment and doctor schedule query modules in `lib/db/queries/admin-appointments.ts` and `lib/db/queries/admin-schedules.ts`
- [ ] T041 [US3] Implement appointment decision and schedule management services in `lib/appointments/appointment-status-service.ts` and `lib/availability/admin-schedule-service.ts`
- [ ] T042 [US3] Implement admin appointment API routes in `app/api/admin/appointments/route.ts`, `app/api/admin/appointments/[appointmentId]/confirm/route.ts`, and `app/api/admin/appointments/[appointmentId]/cancel/route.ts`
- [ ] T043 [US3] Implement admin doctor schedule API routes in `app/api/admin/doctors/[doctorId]/work-schedules/route.ts` and `app/api/admin/doctors/[doctorId]/time-off/route.ts`
- [ ] T044 [P] [US3] Build admin authentication and appointment review UI in `app/admin/login/page.tsx`, `app/admin/appointments/page.tsx`, and `components/admin/appointment-review-table.tsx`
- [ ] T045 [P] [US3] Build doctor schedule and leave management UI in `app/admin/doctors/[doctorId]/schedule/page.tsx`, `components/admin/work-schedule-form.tsx`, and `components/admin/time-off-form.tsx`
- [ ] T046 [US3] Add conflict warnings, cancellation reason UX, and mobile admin states in `components/admin/appointment-decision-dialog.tsx`, `components/admin/schedule-conflict-banner.tsx`, and `app/admin/appointments/page.tsx`

**Checkpoint**: User Story 3 is fully functional and independently testable for the admin workflow.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish release-quality validation, observability, accessibility, and operational hardening across all stories.

- [ ] T047 [P] Document local setup, Supabase provisioning, and Cloudflare release workflow in `README.md` and `docs/deploy/production.md`
- [ ] T048 Run the accessibility and UX consistency pass across patient and admin flows in `components/ui/skip-link.tsx`, `app/(marketing)/page.tsx`, and `app/admin/appointments/page.tsx`
- [ ] T049 Harden logging and global error handling for booking, notification, and admin flows in `lib/observability/logger.ts` and `app/global-error.tsx`
- [ ] T050 [P] Add quickstart smoke automation for local and Workers preview flows in `scripts/smoke/quickstart-check.ts` and `package.json`
- [ ] T051 Validate seeded load and mutation performance thresholds in `scripts/perf/check-availability.ts` and `scripts/perf/check-booking-mutation.ts`
- [ ] T052 Harden booking abuse and admin session protections in `middleware.ts` and `lib/http/rate-limit.ts`
- [ ] T053 Configure Supabase migration rollout automation and failure handling in `.github/workflows/deploy.yml` and `scripts/deploy/run-supabase-migrations.ts`
- [ ] T054 Configure Cloudflare Workers build, deploy verification, and secret handoff steps in `.github/workflows/deploy.yml` and `scripts/deploy/verify-workers-release.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user story implementation.
- **User Story 1 (Phase 3)**: Depends on Foundational completion and delivers the MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational completion and uses seeded or fixture-backed confirmed appointments for independent testing.
- **User Story 3 (Phase 5)**: Depends on Foundational completion and can integrate with the notification services from User Story 2.
- **Polish (Phase 6)**: Depends on the stories targeted for release being complete.

### User Story Dependencies

- **US1**: No dependency on other user stories after Foundational completion.
- **US2**: No dependency on US1 implementation details beyond the shared appointment schema; it can be tested using seeded appointments and reminder execution.
- **US3**: Reuses shared appointment and availability foundations and should call the notification services from US2 when confirm or cancel actions occur.

### Within Each User Story

- Required automated tests MUST be added before implementation and should fail before the feature code is written.
- Query and schema-facing modules should land before service orchestration.
- Services should land before route handlers and UI wiring.
- UI completion must include accessibility, error-state, and responsive behavior validation before sign-off.

### Parallel Opportunities

- Setup tasks `T003` to `T008` can run in parallel after `T001` and `T002`.
- Foundational tasks `T010`, `T012`, `T013`, `T014`, and `T015` can run in parallel after `T009`.
- In US1, tests `T017` to `T020` can run in parallel, and persistence tasks `T021` and `T022` can run in parallel.
- In US2, tests `T028` to `T030` can run in parallel, and `T031` can proceed alongside patient timeline work in `T034`.
- In US3, tests `T036` to `T039` can run in parallel, and admin UI tasks `T044` and `T045` can run in parallel after services and routes stabilize.

---

## Parallel Example: User Story 1

```bash
# Launch the US1 automated coverage together
Task: "T017 Add contract tests for doctor listing, availability, and booking routes in tests/contract/doctors.contract.test.ts and tests/contract/appointments.contract.test.ts"
Task: "T018 Add integration tests for patient booking, appointment summary data, and slot conflict handling in tests/integration/patient-booking.test.ts"
Task: "T019 Add unit tests for slot generation and transactional booking safeguards in tests/unit/availability.test.ts and tests/unit/booking-service.test.ts"
Task: "T020 Add Playwright coverage for the responsive patient booking flow in tests/e2e/patient-booking.spec.ts"

# Build US1 persistence modules in parallel
Task: "T021 Implement doctor, schedule, and availability query modules in lib/db/queries/doctors.ts and lib/db/queries/availability.ts"
Task: "T022 Implement patient, appointment, and audit persistence modules in lib/db/queries/patients.ts and lib/db/queries/appointments.ts"
```

## Parallel Example: User Story 2

```bash
# Launch the US2 verification work together
Task: "T028 Add integration tests for confirmation delivery, cancellation notices, and reminder skipping in tests/integration/notification-workflows.test.ts"
Task: "T029 Add unit tests for notification scheduling and reminder eligibility in tests/unit/notification-service.test.ts and tests/unit/reminder-service.test.ts"
Task: "T030 Add Playwright coverage for patient appointment status updates and reminder-ready messaging in tests/e2e/appointment-status.spec.ts"

# Split notification infrastructure and patient-facing status UI
Task: "T031 Implement notification event queries and email adapter abstractions in lib/db/queries/notifications.ts and lib/notifications/email-adapter.ts"
Task: "T034 Build patient appointment status timeline UI in app/appointments/[appointmentId]/page.tsx and components/appointments/appointment-status-timeline.tsx"
```

## Parallel Example: User Story 3

```bash
# Launch the US3 automated coverage together
Task: "T036 Add contract tests for admin appointment review and doctor schedule routes in tests/contract/admin-appointments.contract.test.ts and tests/contract/admin-schedules.contract.test.ts"
Task: "T037 Add integration tests for admin approval, cancellation, work schedules, and time-off conflicts in tests/integration/admin-scheduling.test.ts"
Task: "T038 Add unit tests for schedule validation and appointment state transitions in tests/unit/schedule-management.test.ts and tests/unit/appointment-status-service.test.ts"
Task: "T039 Add Playwright coverage for admin appointment review and doctor schedule management in tests/e2e/admin-scheduling.spec.ts"

# Build the two admin surfaces in parallel after routes are ready
Task: "T044 Build admin authentication and appointment review UI in app/admin/login/page.tsx, app/admin/appointments/page.tsx, and components/admin/appointment-review-table.tsx"
Task: "T045 Build doctor schedule and leave management UI in app/admin/doctors/[doctorId]/schedule/page.tsx, components/admin/work-schedule-form.tsx, and components/admin/time-off-form.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate the MVP with `T017` to `T020` plus the quickstart booking scenarios.
5. Demo or deploy the patient booking workflow before moving on.

### Incremental Delivery

1. Deliver Setup and Foundational work to establish the platform.
2. Deliver US1 as the first releasable patient booking increment.
3. Deliver US2 to add confirmations and reminders without destabilizing booking.
4. Deliver US3 to unlock admin operations and full clinic schedule management.
5. Finish with cross-cutting release hardening in Phase 6.

### Parallel Team Strategy

1. One developer can own setup and deployment wiring while another owns testing configuration during Phase 1.
2. During Phase 2, database, auth, validation, and shared UI foundations can be split across teammates.
3. After Foundational completion, separate developers can own US1, US2, and US3, coordinating through shared contracts and services.

---

## Notes

- All tasks follow the required checklist format: checkbox, task ID, optional `[P]`, required story label for story phases, and exact file paths.
- User story phases are ordered by priority P1 → P2 → P3 while preserving the ability to test each story independently.
- Contract coverage is scoped to the documented HTTP routes in `contracts/appointment-booking-api.yaml`.
