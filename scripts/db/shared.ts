import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import postgres from "postgres";

const containerName = "appointment-booking-postgres";
const postgresImage = "postgres:16-alpine";
const databaseUrl =
  process.env.DATABASE_URL ?? "postgres://postgres:postgres@127.0.0.1:5432/appointment_booking";
const migrationFile = path.join(process.cwd(), "drizzle/0000_initial_schema.sql");
const seedFile = path.join(process.cwd(), "supabase/seed.sql");

export const seedIds = {
  adminUserId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  doctorLanId: "11111111-1111-1111-1111-111111111111",
  doctorMinhId: "22222222-2222-2222-2222-222222222222"
} as const;

function runDocker(args: string[]) {
  return execFileSync("docker", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();
}

export async function getSqlClient() {
  return postgres(databaseUrl, {
    prepare: false,
    max: 1,
    onnotice: () => undefined
  });
}

export function ensureDockerPostgresContainer() {
  try {
    const containerId = runDocker(["ps", "-aq", "-f", `name=^${containerName}$`]);

    if (containerId) {
      const running = runDocker([
        "inspect",
        "-f",
        "{{.State.Running}}",
        containerName
      ]);

      if (running !== "true") {
        runDocker(["start", containerName]);
      }

      return;
    }

    runDocker([
      "run",
      "-d",
      "--name",
      containerName,
      "-e",
      "POSTGRES_USER=postgres",
      "-e",
      "POSTGRES_PASSWORD=postgres",
      "-e",
      "POSTGRES_DB=appointment_booking",
      "-p",
      "5432:5432",
      postgresImage
    ]);
  } catch (error) {
    throw new Error(
      `Unable to start local Postgres container "${containerName}": ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function waitForDatabase(maxAttempts = 30) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const sql = await getSqlClient();

    try {
      await sql`select 1`;
      await sql.end();
      return;
    } catch (error) {
      lastError = error;
      await sql.end({ timeout: 0 });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new Error(
    `Database did not become ready: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`
  );
}

export async function resetDatabase() {
  const sql = await getSqlClient();
  const migrationSql = fs.readFileSync(migrationFile, "utf8");

  try {
    await sql.unsafe(`
      drop schema if exists public cascade;
      create schema public;
      grant all on schema public to postgres;
      grant all on schema public to public;
    `);
    await sql.unsafe(migrationSql);
  } finally {
    await sql.end();
  }
}

export async function seedDatabase() {
  const sql = await getSqlClient();
  const doctorSeedSql = fs.readFileSync(seedFile, "utf8");

  try {
    await sql.unsafe(`
      insert into admin_users (id, email, password_hash, display_name, role, is_active)
      values ('${seedIds.adminUserId}', 'admin@example.com', 'dev-only-password-hash', 'Clinic Admin', 'admin', true)
      on conflict (email) do nothing;
    `);

    await sql.unsafe(doctorSeedSql);

    await sql.unsafe(`
      insert into work_schedules (
        doctor_id,
        day_of_week,
        start_time,
        end_time,
        effective_from,
        is_active,
        created_by_admin_id
      )
      values
        ('${seedIds.doctorLanId}', 1, '09:00', '16:00', '2026-01-01', true, '${seedIds.adminUserId}'),
        ('${seedIds.doctorLanId}', 2, '09:00', '16:00', '2026-01-01', true, '${seedIds.adminUserId}'),
        ('${seedIds.doctorLanId}', 3, '09:00', '16:00', '2026-01-01', true, '${seedIds.adminUserId}'),
        ('${seedIds.doctorLanId}', 4, '09:00', '16:00', '2026-01-01', true, '${seedIds.adminUserId}'),
        ('${seedIds.doctorLanId}', 5, '09:00', '16:00', '2026-01-01', true, '${seedIds.adminUserId}'),
        ('${seedIds.doctorMinhId}', 1, '09:00', '16:00', '2026-01-01', true, '${seedIds.adminUserId}'),
        ('${seedIds.doctorMinhId}', 2, '09:00', '16:00', '2026-01-01', true, '${seedIds.adminUserId}'),
        ('${seedIds.doctorMinhId}', 3, '09:00', '16:00', '2026-01-01', true, '${seedIds.adminUserId}'),
        ('${seedIds.doctorMinhId}', 4, '09:00', '16:00', '2026-01-01', true, '${seedIds.adminUserId}'),
        ('${seedIds.doctorMinhId}', 5, '09:00', '16:00', '2026-01-01', true, '${seedIds.adminUserId}');
    `);
  } finally {
    await sql.end();
  }
}

export async function setupLocalDatabase() {
  ensureDockerPostgresContainer();
  await waitForDatabase();
  await resetDatabase();
  await seedDatabase();
}
