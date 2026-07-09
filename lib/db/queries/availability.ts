import { and, eq, ne } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { appointments, timeOff, workSchedules } from "@/lib/db/schema";

export async function getDoctorSchedules(doctorId: string) {
  const db = await getDb();
  return db
    .select()
    .from(workSchedules)
    .where(and(eq(workSchedules.doctorId, doctorId), eq(workSchedules.isActive, true)));
}

export async function getBookedSlots(doctorId: string, appointmentDate: string) {
  const db = await getDb();
  return db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.doctorId, doctorId),
        eq(appointments.appointmentDate, appointmentDate),
        ne(appointments.status, "canceled")
      )
    );
}

export async function getDoctorTimeOff(doctorId: string) {
  const db = await getDb();
  return db
    .select()
    .from(timeOff)
    .where(and(eq(timeOff.doctorId, doctorId), eq(timeOff.status, "scheduled")));
}
