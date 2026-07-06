import { resetDatabase, seedDatabase, waitForDatabase } from "./shared";

async function main() {
  await waitForDatabase();
  await resetDatabase();
  await seedDatabase();
  console.log("Local database reset and seeded.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
