import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { doctors } from "@/lib/db/schema";

export async function getActiveDoctors() {
  return db.select().from(doctors).where(eq(doctors.isActive, true));
}

export async function getDoctor(doctorId: string) {
  const [doctor] = await db
    .select()
    .from(doctors)
    .where(and(eq(doctors.id, doctorId), eq(doctors.isActive, true)));

  return doctor ?? null;
}
