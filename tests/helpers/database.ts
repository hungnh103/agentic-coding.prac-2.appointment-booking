import { resetDatabase, seedDatabase, setupLocalDatabase } from "@/scripts/db/shared";

let initialized = false;

export async function ensureTestDatabase() {
  if (!initialized) {
    await setupLocalDatabase();
    initialized = true;
    return;
  }

  await resetDatabase();
  await seedDatabase();
}

