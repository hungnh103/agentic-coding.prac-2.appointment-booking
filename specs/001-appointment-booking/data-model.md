# Data Model: Appointment Booking

## Overview

The system stores clinic scheduling data in Supabase-hosted PostgreSQL and derives patient-facing availability from doctor schedules, time off, and active appointments. The first release supports a single clinic and fixed 30-minute appointment slots, with schema ownership and migrations managed through Drizzle.

## Infrastructure Notes

- Supabase is used as the managed PostgreSQL provider in v1.
- The application uses Drizzle for schema definition, migrations, and queries.
- Admin authentication remains in the Next.js application via Auth.js rather than using Supabase Auth in the first release.
- Deployed Cloudflare Workers should access the database through Hyperdrive-backed pooled connections.

## Entities

### Patient

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | UUID | Yes | Primary key |
| `fullName` | text | Yes | Patient display name |
| `phone` | text | Yes | Primary reminder/contact channel |
| `email` | text | No | Optional secondary notification channel |
| `notes` | text | No | Optional patient-entered booking note |
| `createdAt` | timestamptz | Yes | Creation timestamp |
| `updatedAt` | timestamptz | Yes | Last update timestamp |

**Validation rules**

- `fullName` must be 2-120 characters after trimming.
- `phone` must match the clinic-supported phone format and remain present for reminders.
- `email`, when provided, must be syntactically valid.

### AdminUser

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | UUID | Yes | Primary key |
| `email` | text | Yes | Login identifier |
| `passwordHash` | text | Yes | Stored credential hash |
| `displayName` | text | Yes | Audit display name |
| `role` | enum(`admin`) | Yes | Single internal role for v1 |
| `isActive` | boolean | Yes | Controls login eligibility |
| `createdAt` | timestamptz | Yes | Creation timestamp |
| `updatedAt` | timestamptz | Yes | Last update timestamp |

### Doctor

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | UUID | Yes | Primary key |
| `slug` | text | Yes | URL-safe public identifier |
| `fullName` | text | Yes | Doctor name |
| `specialty` | text | Yes | Dental or maxillofacial specialty label |
| `bio` | text | No | Short public summary |
| `isActive` | boolean | Yes | Controls public visibility |
| `createdAt` | timestamptz | Yes | Creation timestamp |
| `updatedAt` | timestamptz | Yes | Last update timestamp |

**Validation rules**

- `slug` must be unique and URL-safe.
- `fullName` must be 2-120 characters.

### WorkSchedule

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | UUID | Yes | Primary key |
| `doctorId` | UUID | Yes | FK to `Doctor` |
| `dayOfWeek` | integer | Yes | 0-6 for recurring weekly schedule |
| `startTime` | time | Yes | Working window start |
| `endTime` | time | Yes | Working window end |
| `effectiveFrom` | date | Yes | First active date |
| `effectiveTo` | date | No | Optional end date |
| `isActive` | boolean | Yes | Soft deactivation |
| `createdByAdminId` | UUID | Yes | FK to `AdminUser` |
| `createdAt` | timestamptz | Yes | Creation timestamp |
| `updatedAt` | timestamptz | Yes | Last update timestamp |

**Validation rules**

- `startTime` must be before `endTime`.
- Schedule boundaries must align to the 30-minute slot size.
- Overlapping active schedule rows for the same doctor and weekday should be rejected or normalized during admin editing.

### TimeOff

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | UUID | Yes | Primary key |
| `doctorId` | UUID | Yes | FK to `Doctor` |
| `startsAt` | timestamptz | Yes | Unavailable period start |
| `endsAt` | timestamptz | Yes | Unavailable period end |
| `reason` | text | Yes | Admin-facing reason |
| `status` | enum(`scheduled`, `canceled`) | Yes | Allows withdrawn leave records |
| `createdByAdminId` | UUID | Yes | FK to `AdminUser` |
| `createdAt` | timestamptz | Yes | Creation timestamp |
| `updatedAt` | timestamptz | Yes | Last update timestamp |

**Validation rules**

- `startsAt` must be before `endsAt`.
- Time off that overlaps existing appointments must trigger a warning and follow-up admin decisions.

### Appointment

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | UUID | Yes | Primary key |
| `referenceCode` | text | Yes | Human-friendly lookup code |
| `patientId` | UUID | Yes | FK to `Patient` |
| `doctorId` | UUID | Yes | FK to `Doctor` |
| `appointmentDate` | date | Yes | Calendar date |
| `startTime` | time | Yes | Slot start |
| `endTime` | time | Yes | Slot end |
| `status` | enum(`pending`, `confirmed`, `canceled`) | Yes | Appointment lifecycle |
| `cancellationReason` | text | No | Required when status becomes `canceled` by admin |
| `confirmedAt` | timestamptz | No | Set when appointment is confirmed |
| `canceledAt` | timestamptz | No | Set when appointment is canceled |
| `confirmedByAdminId` | UUID | No | FK to `AdminUser` |
| `canceledByAdminId` | UUID | No | FK to `AdminUser` |
| `createdAt` | timestamptz | Yes | Booking creation time |
| `updatedAt` | timestamptz | Yes | Last update timestamp |

**Validation rules**

- `(doctorId, appointmentDate, startTime)` must be unique for active appointments.
- `endTime - startTime` must equal 30 minutes in v1.
- `cancellationReason` is required when an admin cancels an appointment.
- Appointments cannot be created for past times, outside work schedules, during time off, or for inactive doctors.

**State transitions**

| From | To | Trigger |
|------|----|---------|
| `pending` | `confirmed` | Admin confirms a valid booking |
| `pending` | `canceled` | Admin cancels due to conflict, leave, or other clinic issue |
| `confirmed` | `canceled` | Admin cancels because the doctor becomes unavailable |

Transitions from `canceled` to another state are not allowed in v1; a replacement appointment should be created instead.

### AppointmentAuditLog

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | UUID | Yes | Primary key |
| `appointmentId` | UUID | Yes | FK to `Appointment` |
| `actorType` | enum(`patient`, `admin`, `system`) | Yes | Origin of the action |
| `actorId` | UUID | No | Admin ID when applicable |
| `action` | text | Yes | Example: `created`, `confirmed`, `canceled`, `notification_queued` |
| `details` | jsonb | No | Structured metadata for auditing |
| `createdAt` | timestamptz | Yes | Event timestamp |

### NotificationEvent

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | UUID | Yes | Primary key |
| `appointmentId` | UUID | Yes | FK to `Appointment` |
| `type` | enum(`confirmation`, `reminder`, `cancellation`) | Yes | Notification purpose |
| `channel` | enum(`email`) | Yes | V1 delivery channel |
| `scheduledFor` | timestamptz | Yes | Intended send time |
| `status` | enum(`pending`, `sent`, `failed`, `skipped`) | Yes | Delivery state |
| `providerMessageId` | text | No | External delivery reference |
| `failureReason` | text | No | Last failure details |
| `sentAt` | timestamptz | No | Actual send time |
| `createdAt` | timestamptz | Yes | Creation timestamp |
| `updatedAt` | timestamptz | Yes | Last update timestamp |

**Validation rules**

- Reminder events are eligible only for appointments still in `confirmed` status at send time.
- Cancellation events should be sent at most once per appointment status change.

## Relationships

- One `Doctor` has many `WorkSchedule`, `TimeOff`, and `Appointment` records.
- One `Patient` has many `Appointment` records.
- One `Appointment` has many `AppointmentAuditLog` and `NotificationEvent` records.
- One `AdminUser` can create many schedules, time-off records, and appointment decisions.

## Derived Availability Rules

Availability is computed for a doctor on a requested date by:

1. Selecting active `WorkSchedule` rows matching the day of week and effective date range.
2. Expanding schedule windows into 30-minute slots.
3. Removing slots blocked by active `TimeOff` intervals.
4. Removing slots already occupied by `pending` or `confirmed` appointments.
5. Returning the remaining slots ordered by start time with an `available` status.

## Indexing Notes

- Unique index on doctor plus slot coordinates for active appointment states.
- Composite indexes on `Appointment(doctorId, appointmentDate)` and `NotificationEvent(status, scheduledFor)`.
- Supporting indexes on `WorkSchedule(doctorId, dayOfWeek, effectiveFrom, effectiveTo)` and `TimeOff(doctorId, startsAt, endsAt)`.
