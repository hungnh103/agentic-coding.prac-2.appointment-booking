const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const doctorId = process.env.SMOKE_DOCTOR_ID ?? "11111111-1111-1111-1111-111111111111";
const date = process.env.SMOKE_DATE ?? new Date(Date.now() + 86400000).toISOString().slice(0, 10);

async function expectOk(path: string) {
  const response = await fetch(`${baseUrl}${path}`);

  if (!response.ok) {
    throw new Error(`${path} failed with status ${response.status}`);
  }

  return response;
}

async function main() {
  const doctorsResponse = await expectOk("/api/doctors");
  const doctorsPayload = await doctorsResponse.json();

  if (!Array.isArray(doctorsPayload.data) || doctorsPayload.data.length === 0) {
    throw new Error("Doctors API returned no doctors.");
  }

  const availabilityResponse = await expectOk(
    `/api/doctors/${doctorId}/availability?date=${date}`
  );
  const availabilityPayload = await availabilityResponse.json();

  if (!Array.isArray(availabilityPayload.slots)) {
    throw new Error("Availability response did not include slots.");
  }

  console.log(
    JSON.stringify(
      {
        baseUrl,
        doctorCount: doctorsPayload.data.length,
        availabilitySlots: availabilityPayload.slots.length,
        date,
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
