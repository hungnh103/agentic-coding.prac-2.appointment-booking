import { and, asc, desc, eq, sql } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import {
  appointmentAuditLog,
  appointments,
  doctors,
  patients,
  timeOff
} from "@/lib/db/schema";

type AdminAppointmentFilters = {
  status?: "pending" | "confirmed" | "canceled";
  doctorId?: string;
  date?: string;
};

type AdminAppointmentStatus = "pending" | "confirmed" | "canceled";

function buildAdminAppointmentWhere(filters: AdminAppointmentFilters) {
  const conditions = [];

  if (filters.status) {
    conditions.push(eq(appointments.status, filters.status));
  }

  if (filters.doctorId) {
    conditions.push(eq(appointments.doctorId, filters.doctorId));
  }

  if (filters.date) {
    conditions.push(eq(appointments.appointmentDate, filters.date));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

export async function listAdminAppointments(filters: AdminAppointmentFilters = {}) {
  const db = await getDb();
  const where = buildAdminAppointmentWhere(filters);

  return db
    .select({
      id: appointments.id,
      referenceCode: appointments.referenceCode,
      doctorId: appointments.doctorId,
      patientId: appointments.patientId,
      appointmentDate: appointments.appointmentDate,
      startTime: appointments.startTime,
      endTime: appointments.endTime,
      status: appointments.status,
      cancellationReason: appointments.cancellationReason,
      confirmedAt: appointments.confirmedAt,
      canceledAt: appointments.canceledAt,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
      patientName: patients.fullName,
      patientPhone: patients.phone,
      patientEmail: patients.email,
      doctorName: doctors.fullName,
      doctorSpecialty: doctors.specialty
    })
    .from(appointments)
    .innerJoin(patients, eq(patients.id, appointments.patientId))
    .innerJoin(doctors, eq(doctors.id, appointments.doctorId))
    .where(where)
    .orderBy(desc(appointments.appointmentDate), asc(appointments.startTime));
}

export async function getAdminAppointment(appointmentId: string) {
  const db = await getDb();
  const [appointment] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, appointmentId));

  return appointment ?? null;
}

export async function updateAppointmentStatusByAdmin(
  appointmentId: string,
  input: {
    status: AdminAppointmentStatus;
    adminId: string;
    cancellationReason?: string;
  }
) {
  const db = await getDb();
  const values =
    input.status === "confirmed"
      ? {
          status: input.status,
          confirmedAt: new Date(),
          confirmedByAdminId: input.adminId,
          canceledAt: null,
          canceledByAdminId: null,
          cancellationReason: null,
          updatedAt: new Date()
        }
      : {
          status: input.status,
          canceledAt: new Date(),
          canceledByAdminId: input.adminId,
          cancellationReason: input.cancellationReason ?? null,
          updatedAt: new Date()
        };

  const [appointment] = await db
    .update(appointments)
    .set(values)
    .where(eq(appointments.id, appointmentId))
    .returning();

  return appointment ?? null;
}

export async function insertAppointmentAuditEntry(input: {
  appointmentId: string;
  actorType: "patient" | "admin" | "system";
  actorId?: string;
  action: string;
  details?: Record<string, unknown>;
}) {
  const db = await getDb();
  const [auditEntry] = await db
    .insert(appointmentAuditLog)
    .values({
      appointmentId: input.appointmentId,
      actorType: input.actorType,
      actorId: input.actorId,
      action: input.action,
      details: input.details
    })
    .returning();

  return auditEntry;
}

export async function hasBlockingTimeOff(appointmentId: string) {
  const db = await getDb();
  const [result] = await db
    .select({
      count: sql<number>`count(*)::int`
    })
    .from(appointments)
    .innerJoin(
      timeOff,
      and(
        eq(timeOff.doctorId, appointments.doctorId),
        eq(timeOff.status, "scheduled"),
        sql`${timeOff.startsAt} < (${appointments.appointmentDate}::text || 'T' || ${appointments.endTime}::text || ':00Z')::timestamptz`,
        sql`${timeOff.endsAt} > (${appointments.appointmentDate}::text || 'T' || ${appointments.startTime}::text || ':00Z')::timestamptz`
      )
    )
    .where(eq(appointments.id, appointmentId));

  return (result?.count ?? 0) > 0;
}
