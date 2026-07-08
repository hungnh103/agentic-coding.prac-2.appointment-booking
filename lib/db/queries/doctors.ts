import { and, eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { doctors } from "@/lib/db/schema";

export async function getActiveDoctors() {
  const db = await getDb();
  return db.select().from(doctors).where(eq(doctors.isActive, true));
}

export async function getDoctor(doctorId: string) {
  const db = await getDb();
  const [doctor] = await db
    .select()
    .from(doctors)
    .where(and(eq(doctors.id, doctorId), eq(doctors.isActive, true)));

  return doctor ?? null;
}
