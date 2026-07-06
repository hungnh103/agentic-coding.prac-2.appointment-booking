import { date, index, pgEnum, pgTable, text, time, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const appointmentStatusEnum = pgEnum("appointment_status", ["pending", "confirmed", "canceled"]);

export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    referenceCode: text("reference_code").notNull().unique(),
    patientId: uuid("patient_id").notNull(),
    doctorId: uuid("doctor_id").notNull(),
    appointmentDate: date("appointment_date").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    status: appointmentStatusEnum("status").default("pending").notNull(),
    cancellationReason: text("cancellation_reason"),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    canceledAt: timestamp("canceled_at", { withTimezone: true }),
    confirmedByAdminId: uuid("confirmed_by_admin_id"),
    canceledByAdminId: uuid("canceled_by_admin_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    doctorSlotIdx: index("appointments_doctor_date_idx").on(table.doctorId, table.appointmentDate),
    uniqueDoctorSlot: uniqueIndex("appointments_active_slot_idx").on(table.doctorId, table.appointmentDate, table.startTime)
  })
);

