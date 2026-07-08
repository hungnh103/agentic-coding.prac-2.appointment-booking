import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/lib/config/env";

type SqlClient = ReturnType<typeof postgres>;
type DbClient = ReturnType<typeof drizzle>;
type DbRuntime = {
  db: DbClient;
  sqlClient: SqlClient;
  connectionString: string;
};

type HyperdriveBinding = {
  connectionString: string;
};

const globalForDb = globalThis as typeof globalThis & {
  dbRuntimePromise?: Promise<DbRuntime>;
};

function isCloudflareRuntime() {
  return "Cloudflare" in globalThis;
}

function createSqlClient(connectionString: string) {
  return postgres(connectionString, {
    prepare: false,
    connect_timeout: 10,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    max: "Cloudflare" in globalThis ? 3 : 10
  });
}

async function getHyperdriveConnectionString() {
  try {
    const { env: cloudflareEnv } = await getCloudflareContext({ async: true });
    const hyperdrive = (cloudflareEnv as CloudflareEnv & { HYPERDRIVE?: HyperdriveBinding }).HYPERDRIVE;
    return hyperdrive?.connectionString;
  } catch {
    return undefined;
  }
}

async function createDbRuntime(): Promise<DbRuntime> {
  const connectionString =
    (await getHyperdriveConnectionString()) ??
    process.env.HYPERDRIVE_CONNECTION_STRING ??
    env.DATABASE_URL;

  const sqlClient = createSqlClient(connectionString);

  return {
    db: drizzle(sqlClient),
    sqlClient,
    connectionString
  };
}

async function getDbRuntime() {
  if (isCloudflareRuntime()) {
    return createDbRuntime();
  }

  globalForDb.dbRuntimePromise ??= createDbRuntime();
  return globalForDb.dbRuntimePromise;
}

export async function getDb() {
  const { db } = await getDbRuntime();
  return db;
}

export async function getSqlClient() {
  const { sqlClient } = await getDbRuntime();
  return sqlClient;
}
