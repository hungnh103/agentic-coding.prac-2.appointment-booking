import { setupLocalDatabase } from "./shared";

async function main() {
  await setupLocalDatabase();
  console.log("Local Postgres container, schema, and seed data are ready.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
