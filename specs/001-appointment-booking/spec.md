# Feature Specification: Appointment Booking

**Feature Branch**: `[001-appointment-booking]`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Build a simple personal project named 'Appointment Booking'. The project's purpose is to support appointment scheduling for a dental and maxillofacial clinic. Core features: patients can view doctors' available schedules and book appointments by time slot; the system provides appointment confirmation and reminders as the appointment date approaches; system admins can confirm or cancel patient bookings when the doctor cannot meet the scheduled appointment due to unexpected conflicts or health issues; admins can manage doctors' leave schedules and working schedules; the UI should be modern, bright, and responsive."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Patient books an appointment slot (Priority: P1)

A patient views a doctor's available schedule by date and time slot, selects a suitable slot, enters the required information, and submits a request to book a dental appointment.

**Why this priority**: This is the core value flow of the product. Without the ability to view availability and book appointments, the system provides no practical value to either patients or the clinic.

**Independent Test**: This can be tested independently by having a patient choose a doctor, view available slots, book a valid time slot, and receive a clear appointment status.

**UX Consistency Notes**: The booking flow should use patient-friendly language, clearly show whether a time slot is available or unavailable, work well on phones and tablets, and provide understandable feedback when schedule data changes or a slot becomes unavailable during the interaction.

**Acceptance Scenarios**:

1. **Given** a patient is viewing a doctor's open working schedule, **When** the patient selects an available time slot and submits a booking request with all required information, **Then** the system creates a new appointment with either a pending confirmation status or a confirmed status according to the clinic's operating rules.
2. **Given** a patient is viewing a doctor's schedule, **When** a time slot is no longer available, **Then** the system does not allow the patient to book that slot and displays a message guiding them to choose another time.
3. **Given** a patient has successfully submitted a booking request, **When** the action is completed, **Then** the system displays an appointment summary including the doctor, date and time, current status, and next-step guidance.

---

### User Story 2 - Patient receives confirmation and reminder (Priority: P2)

A patient receives confirmation after an appointment is approved and receives a reminder before the visit date to reduce missed or mistimed appointments.

**Why this priority**: After booking, confirmation and reminders help increase on-time attendance and reduce the clinic's need for manual follow-up.

**Independent Test**: This can be tested independently by creating a valid appointment, moving it to a confirmed state, and verifying that the patient receives both confirmation details and a reminder before the appointment.

**UX Consistency Notes**: Confirmation and reminder content should be concise and easy to understand, use the same terminology as the booking screens, clearly state the appointment date, time, and doctor, and avoid confusion between pending and confirmed states.

**Acceptance Scenarios**:

1. **Given** an appointment has been confirmed, **When** the system sends a confirmation notice, **Then** the patient receives the appointment date and time, the assigned doctor, and the current appointment status.
2. **Given** an appointment is approaching its scheduled time based on the clinic's reminder threshold, **When** the reminder time is reached, **Then** the system sends a clear and consistent reminder to the patient.
3. **Given** an appointment is canceled or changed before the reminder is sent, **When** the system processes reminders, **Then** it does not send an incorrect reminder for an invalid or outdated appointment state.

---

### User Story 3 - Admin manages appointment approvals and doctor schedules (Priority: P3)

An administrator reviews booked appointments, confirms or cancels them when a doctor cannot accommodate the schedule, and manages doctor working hours and leave so that patient-facing availability always reflects real capacity.

**Why this priority**: This flow keeps schedule availability accurate, helps the clinic handle operational changes, and prevents appointments from being accepted beyond a doctor's actual capacity.

**Independent Test**: This can be tested independently by having an admin update working hours, create a leave period, confirm a valid appointment, and cancel a conflicting one, then verify that patients only see truly available slots.

**UX Consistency Notes**: The admin interface should prioritize clarity, show the reason for cancellations or changes, warn when actions affect existing appointments, and remain easy to use on both large screens and mobile devices.

**Acceptance Scenarios**:

1. **Given** an admin is managing a doctor's schedule, **When** the admin adds or edits working hours and leave periods, **Then** the system updates the set of bookable slots so patients do not see times outside actual service capacity.
2. **Given** an appointment is pending or already booked, **When** an admin confirms the appointment, **Then** the system updates the appointment status and records who performed the action and when.
3. **Given** a doctor cannot provide care at the scheduled time, **When** an admin cancels the appointment, **Then** the system updates the status to canceled, records the cancellation reason, and notifies the patient that the appointment is no longer valid.

---

### Edge Cases

- What happens when two patients select the same time slot almost simultaneously before either booking is fully completed?
- How does the system handle a situation where an admin marks a doctor as unavailable during a period that already contains previously created appointments?
- The experience must remain understandable when schedule availability loads slowly, is temporarily unavailable, or a confirmation/reminder message fails on the first attempt.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow patients to view each doctor's available working schedule by date and time slot.
- **FR-002**: The system MUST show patients only those time slots that remain available based on working hours, leave schedules, and existing appointments.
- **FR-003**: Patients MUST be able to select an available time slot and submit a booking request with the required identity and contact information.
- **FR-004**: The system MUST prevent two active appointments from being created for the same doctor in the same time slot.
- **FR-005**: The system MUST assign each appointment a clear lifecycle status, including at minimum pending confirmation, confirmed, and canceled.
- **FR-006**: The system MUST show patients the booking result with an appointment summary that includes the doctor, date and time, and current status.
- **FR-007**: The system MUST send a confirmation to the patient when an appointment is validly confirmed.
- **FR-008**: The system MUST send appointment reminders to patients before the appointment date according to the clinic's standard reminder timing rule.
- **FR-009**: The system MUST not send reminders for appointments that have already been canceled or are no longer valid at send time.
- **FR-010**: Admins MUST be able to view appointment lists, processing status, patient information, doctor information, and appointment times.
- **FR-011**: Admins MUST be able to confirm appointments when the doctor can accommodate the selected time slot.
- **FR-012**: Admins MUST be able to cancel appointments when the doctor cannot accommodate them and record a cancellation reason for patient follow-up.
- **FR-013**: The system MUST notify patients when an appointment is canceled by an admin or when another important status change occurs.
- **FR-014**: Admins MUST be able to create, update, and deactivate doctor working schedules by date or time slot.
- **FR-015**: Admins MUST be able to create and manage doctor leave schedules to block time slots that cannot accept patients.
- **FR-016**: The system MUST reflect working schedule or leave schedule changes in the list of time slots visible to patients within a timeframe appropriate for daily clinic operations.
- **FR-017**: The system MUST preserve or intentionally update existing UX patterns, terminology, visual feedback, accessibility behavior, and responsive behavior for patient and admin journeys affected by booking, confirmation, cancellation, and schedule management.
- **FR-018**: The system MUST provide clear empty states, error states, and guidance messages for schedule availability, booking, appointment administration, and doctor schedule administration screens.
- **FR-019**: The system MUST support a responsive interface so that the primary patient and admin tasks remain completable on mobile and desktop screens.
- **FR-020**: The system MUST define the automated test coverage needed to validate booking conflicts, state transitions, schedule visibility, reminder eligibility, and the most important patient and admin flows before release.

### Key Entities *(include if feature involves data)*

- **Patient**: The person booking a clinic appointment, including basic identity and contact information used for confirmations and reminders.
- **Doctor**: A dentist or maxillofacial specialist at the clinic, with identity details, working schedules, and leave periods that affect appointment availability.
- **Appointment**: A record of a scheduled visit between a patient and a doctor at a specific date and time, including status, contact details, creation time, and important processing history.
- **Doctor Availability Slot**: A bookable time slot derived from a doctor's working schedule, leave schedule, and existing appointments.
- **Work Schedule**: A rule or record that defines when a doctor is working and available to receive patients.
- **Time Off**: A record that defines when a doctor is on leave or temporarily unavailable to receive patients.
- **Notification Event**: A record of a confirmation or reminder associated with an appointment, used to track purpose, send time, and delivery status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% of patients can complete the process of viewing availability and submitting their first appointment request in no more than 3 minutes.
- **SC-002**: 100% of newly created appointments display a clear status to both patients and admins immediately after the action is completed.
- **SC-003**: 95% of appointment confirmation or cancellation changes are reflected to patients within 5 minutes after admin processing.
- **SC-004**: 95% of valid appointment reminders are sent before the appointment time according to the clinic's configured reminder rule.
- **SC-005**: The rate of successfully created duplicate bookings for the same doctor and the same time slot is 0% in testing and normal operations.
- **SC-006**: 90% of test users on mobile and desktop can complete core tasks without zooming, horizontal scrolling, or switching devices.

## Assumptions

- The first version is scoped for a single dental and maxillofacial clinic with a small to medium number of doctors and appointments.
- Each appointment is associated with one doctor and one standard appointment slot defined in advance by the clinic.
- Patients provide enough contact information for confirmation and reminders, but electronic medical records are out of scope for this feature.
- The clinic uses one shared reminder rule across the system in the initial phase rather than separate reminder rules for each doctor.
- Admin is a trusted internal role with permission to manage doctor working schedules, leave schedules, and appointment statuses.
- When doctor schedule changes affect existing appointments, the clinic prioritizes updating the appointment status and clearly notifying the patient rather than automatically moving the appointment to another slot.
