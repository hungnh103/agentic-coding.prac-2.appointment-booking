# Quickstart: Appointment Booking

## Purpose

This guide defines the validation path for the first implementation of the appointment-booking feature. It focuses on how to run and verify the system end to end once the application code is in place.

## Prerequisites

- Node.js 22 LTS
- `pnpm` 9 or newer
- Wrangler CLI
- A Cloudflare account with Workers enabled
- A Supabase project with PostgreSQL 16
- A configured email delivery sandbox for confirmation and reminder testing

## Expected Project Commands

The implementation should provide these commands:

```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev
pnpm cf:preview
pnpm lint
pnpm test
pnpm test:e2e
pnpm deploy
```

## Environment Setup

1. Install dependencies with `pnpm install`.
2. Configure environment variables and bindings for:
   - `DATABASE_URL` for local Drizzle migrations and local integration testing
   - Supabase pooled or direct PostgreSQL connection details for migration tooling
   - Cloudflare Hyperdrive binding for deployed Workers database access
   - `AUTH_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - email provider credentials
3. Configure `wrangler.jsonc` with the Worker name, Cron Trigger schedule, and Hyperdrive binding.
4. Generate and apply Drizzle migrations to the Supabase database.
5. Seed at least:
   - 2 active doctors
   - 1 admin user
   - baseline weekly work schedules for both doctors
6. Start the local Next.js development server with `pnpm dev`.
7. Run a Workers-compatible preview with `pnpm cf:preview` before the first deployment.

## Validation Scenarios

### Scenario 1: Patient books an available appointment

1. Open the doctor availability page.
2. Select a date with at least one visible slot.
3. Submit a booking request with valid patient information.
4. Verify the system shows an appointment summary with doctor, date, time, and `pending` status.
5. Verify a matching `Appointment` row and audit entry were created.

Expected outcome:
The appointment is stored exactly once, the chosen slot disappears from later availability responses, and the patient sees clear next-step guidance.

### Scenario 2: Concurrent booking attempts do not create duplicates

1. Open the same available slot in two browser sessions.
2. Submit both booking requests nearly simultaneously.
3. Inspect the responses and database state.

Expected outcome:
Only one active appointment is created for the slot. The second request receives a conflict message instructing the patient to choose another time.

### Scenario 3: Admin confirms an appointment

1. Sign in through the admin login page.
2. Open the appointment list and select a `pending` appointment.
3. Confirm the appointment.
4. Verify the status changes to `confirmed`.
5. Verify a confirmation notification event is queued or sent.

Expected outcome:
The appointment status updates with admin attribution, the patient-facing summary reflects the new state, and the notification log records the confirmation.

### Scenario 4: Admin cancels due to a doctor conflict

1. In the admin area, choose a pending or confirmed appointment.
2. Cancel it with a reason.
3. Verify the appointment status becomes `canceled`.
4. Verify the patient notification event is recorded as a cancellation.

Expected outcome:
The appointment is no longer considered bookable, the cancellation reason is preserved, and the patient receives clear cancellation messaging.

### Scenario 5: Schedule and leave changes affect patient availability

1. Create or edit a doctor's work schedule.
2. Add a time-off interval overlapping future slots.
3. Reload the patient availability page for the affected date.

Expected outcome:
Newly blocked slots are no longer offered. Existing overlapping appointments remain visible to admins for manual follow-up.

### Scenario 6: Reminder job skips invalid appointments

1. Prepare one confirmed appointment within the reminder window and one canceled appointment in the same window.
2. Run the reminder job manually in a non-production environment or invoke the Cron handler through the local Workers preview.
3. Inspect notification event results.

Expected outcome:
The confirmed appointment receives a reminder, while the canceled appointment is marked as skipped or ignored with no reminder sent.

## Contract References

- API routes and payloads: [contracts/appointment-booking-api.yaml](./contracts/appointment-booking-api.yaml)
- Domain entities and constraints: [data-model.md](./data-model.md)
- Feature intent and acceptance criteria: [spec.md](./spec.md)

## Release Readiness Checks

- `pnpm lint` passes
- `pnpm exec tsc --noEmit` passes
- Unit, integration, contract, and end-to-end tests pass
- Workers-compatible preview succeeds against the configured Supabase database
- Accessibility spot check completed for patient booking and admin schedule screens
- Seeded performance check confirms availability and booking thresholds from [plan.md](./plan.md)
