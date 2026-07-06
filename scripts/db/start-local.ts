import { ensureDockerPostgresContainer, waitForDatabase } from "./shared";

async function main() {
  ensureDockerPostgresContainer();
  await waitForDatabase();
  console.log("Local Postgres is ready at postgres://postgres:postgres@127.0.0.1:5432/appointment_booking");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
