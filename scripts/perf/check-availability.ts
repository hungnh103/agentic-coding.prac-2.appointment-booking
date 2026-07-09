const baseUrl = process.env.PERF_BASE_URL ?? "http://localhost:3000";
const doctorId = process.env.PERF_DOCTOR_ID ?? "11111111-1111-1111-1111-111111111111";
const date = process.env.PERF_DATE ?? new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const budgetMs = Number(process.env.PERF_BUDGET_MS ?? "1500");

async function main() {
  const startedAt = performance.now();
  const response = await fetch(`${baseUrl}/api/doctors/${doctorId}/availability?date=${date}`);
  const elapsedMs = performance.now() - startedAt;

  if (!response.ok) {
    throw new Error(`Availability request failed with status ${response.status}`);
  }

  const payload = await response.json();

  if (!Array.isArray(payload.slots)) {
    throw new Error("Availability response did not include a slots array.");
  }

  if (elapsedMs > budgetMs) {
    throw new Error(
      `Availability response exceeded budget: ${elapsedMs.toFixed(1)}ms > ${budgetMs}ms`
    );
  }

  console.log(
    JSON.stringify(
      {
        doctorId,
        date,
        slots: payload.slots.length,
        elapsedMs: Number(elapsedMs.toFixed(1)),
        budgetMs,
        status: "pass"
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

export {};
