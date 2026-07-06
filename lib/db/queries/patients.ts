import { eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { patients } from "@/lib/db/schema";

type CreatePatientInput = {
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
};

export async function insertPatient(input: CreatePatientInput) {
  const [patient] = await db.insert(patients).values(input).returning();
  return patient;
}

export async function getPatient(patientId: string) {
  const [patient] = await db.select().from(patients).where(eq(patients.id, patientId));
  return patient ?? null;
}
