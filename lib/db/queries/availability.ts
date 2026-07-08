import { and, eq, ne } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { appointments, workSchedules } from "@/lib/db/schema";

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
