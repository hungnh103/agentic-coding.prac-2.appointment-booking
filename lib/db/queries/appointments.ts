import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { appointments } from "@/lib/db/schema";

type CreateAppointmentInput = {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
};

function createReferenceCode() {
  return `APPT-${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export async function insertAppointment(input: CreateAppointmentInput) {
  const [appointment] = await db
    .insert(appointments)
    .values({
      ...input,
      referenceCode: createReferenceCode()
    })
    .returning();

  return appointment;
}

export async function getAppointment(appointmentId: string) {
  const [appointment] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, appointmentId));

  return appointment ?? null;
}

export async function listAppointments() {
  return db.select().from(appointments);
}

export async function updateAppointmentStatus(
  appointmentId: string,
  input: {
    status: "pending" | "confirmed" | "canceled";
    cancellationReason?: string;
  }
) {
  const values =
    input.status === "confirmed"
      ? {
          status: input.status,
          confirmedAt: new Date(),
          canceledAt: null,
          cancellationReason: null,
          updatedAt: new Date()
        }
      : input.status === "canceled"
        ? {
            status: input.status,
            canceledAt: new Date(),
            cancellationReason: input.cancellationReason ?? null,
            updatedAt: new Date()
          }
        : {
            status: input.status,
            updatedAt: new Date()
          };

  const [appointment] = await db
    .update(appointments)
    .set(values)
    .where(eq(appointments.id, appointmentId))
    .returning();

  return appointment ?? null;
}
