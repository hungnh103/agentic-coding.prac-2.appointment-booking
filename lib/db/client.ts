import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/lib/config/env";

const globalForDb = globalThis as typeof globalThis & {
  postgresClient?: ReturnType<typeof postgres>;
};

const client =
  globalForDb.postgresClient ??
  postgres(env.DATABASE_URL, {
    prepare: false
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.postgresClient = client;
}

export const db = drizzle(client);
export { client as sqlClient };
