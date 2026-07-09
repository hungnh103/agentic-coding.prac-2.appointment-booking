const baseUrl = process.env.PERF_BASE_URL ?? "http://localhost:3000";
const doctorId = process.env.PERF_DOCTOR_ID ?? "11111111-1111-1111-1111-111111111111";
const budgetMs = Number(process.env.PERF_BOOKING_BUDGET_MS ?? "800");

function getNextBusinessDate() {
  const date = new Date();

  do {
    date.setDate(date.getDate() + 1);
  } while ([0, 6].includes(date.getDay()));

  return date.toISOString().slice(0, 10);
}

async function main() {
  const uniqueSuffix = Date.now();
  const body = {
    doctorId,
    appointmentDate: process.env.PERF_BOOKING_DATE ?? getNextBusinessDate(),
    startTime: process.env.PERF_BOOKING_START_TIME ?? "15:00",
    endTime: process.env.PERF_BOOKING_END_TIME ?? "15:30",
    patient: {
      fullName: `Perf Patient ${uniqueSuffix}`,
      phone: `0900${String(uniqueSuffix).slice(-6)}`,
      email: `perf-${uniqueSuffix}@example.com`
    }
  };

  const startedAt = performance.now();
  const response = await fetch(`${baseUrl}/api/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const elapsedMs = performance.now() - startedAt;
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error?.message ?? `Booking request failed with status ${response.status}`);
  }

  if (elapsedMs > budgetMs) {
    throw new Error(`Booking mutation exceeded budget: ${elapsedMs.toFixed(1)}ms > ${budgetMs}ms`);
  }

  console.log(
    JSON.stringify(
      {
        appointmentId: payload.data.id,
        referenceCode: payload.data.referenceCode,
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
