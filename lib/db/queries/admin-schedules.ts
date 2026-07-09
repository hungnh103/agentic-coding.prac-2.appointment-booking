import { and, asc, eq, sql } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { appointments, doctors, timeOff, workSchedules } from "@/lib/db/schema";

type CreateWorkScheduleInput = {
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  effectiveFrom: string;
  effectiveTo?: string;
  createdByAdminId: string;
};

type CreateTimeOffInput = {
  doctorId: string;
  startsAt: string;
  endsAt: string;
  reason: string;
  createdByAdminId: string;
};

export async function listAdminDoctors() {
  const db = await getDb();
  return db.select().from(doctors).where(eq(doctors.isActive, true)).orderBy(asc(doctors.fullName));
}

export async function getAdminDoctor(doctorId: string) {
  const db = await getDb();
  const [doctor] = await db
    .select()
    .from(doctors)
    .where(eq(doctors.id, doctorId));

  return doctor ?? null;
}

export async function listDoctorWorkSchedules(doctorId: string) {
  const db = await getDb();
  return db
    .select()
    .from(workSchedules)
    .where(and(eq(workSchedules.doctorId, doctorId), eq(workSchedules.isActive, true)))
    .orderBy(asc(workSchedules.dayOfWeek), asc(workSchedules.startTime));
}

export async function listDoctorTimeOff(doctorId: string) {
  const db = await getDb();
  return db
    .select()
    .from(timeOff)
    .where(and(eq(timeOff.doctorId, doctorId), eq(timeOff.status, "scheduled")))
    .orderBy(asc(timeOff.startsAt));
}

export async function createWorkSchedule(input: CreateWorkScheduleInput) {
  const db = await getDb();
  const [schedule] = await db
    .insert(workSchedules)
    .values({
      ...input,
      effectiveTo: input.effectiveTo || null
    })
    .returning();

  return schedule;
}

export async function createTimeOff(input: CreateTimeOffInput) {
  const db = await getDb();
  const [entry] = await db
    .insert(timeOff)
    .values({
      ...input,
      startsAt: new Date(input.startsAt),
      endsAt: new Date(input.endsAt)
    })
    .returning();

  return entry;
}

export async function listOverlappingSchedules(input: {
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  effectiveFrom: string;
  effectiveTo?: string;
}) {
  const db = await getDb();
  const newEffectiveTo = input.effectiveTo ?? "9999-12-31";

  return db
    .select()
    .from(workSchedules)
    .where(
      and(
        eq(workSchedules.doctorId, input.doctorId),
        eq(workSchedules.dayOfWeek, input.dayOfWeek),
        eq(workSchedules.isActive, true),
        sql`${workSchedules.startTime} < ${input.endTime}::time`,
        sql`${workSchedules.endTime} > ${input.startTime}::time`,
        sql`${workSchedules.effectiveFrom} <= ${newEffectiveTo}::date`,
        sql`coalesce(${workSchedules.effectiveTo}, '9999-12-31'::date) >= ${input.effectiveFrom}::date`
      )
    );
}

export async function listTimeOffConflicts(input: {
  doctorId: string;
  startsAt: string;
  endsAt: string;
}) {
  const db = await getDb();
  const appointmentsForDoctor = await db
    .select({
      id: appointments.id,
      referenceCode: appointments.referenceCode,
      appointmentDate: appointments.appointmentDate,
      startTime: appointments.startTime,
      endTime: appointments.endTime,
      status: appointments.status
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.doctorId, input.doctorId),
        sql`${appointments.status} <> 'canceled'`
      )
    )
    .orderBy(asc(appointments.appointmentDate), asc(appointments.startTime));

  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);

  return appointmentsForDoctor.filter((appointment) => {
    const appointmentStart = new Date(`${appointment.appointmentDate}T${appointment.startTime}:00.000Z`);
    const appointmentEnd = new Date(`${appointment.appointmentDate}T${appointment.endTime}:00.000Z`);

    return appointmentStart < endsAt && appointmentEnd > startsAt;
  });
}
