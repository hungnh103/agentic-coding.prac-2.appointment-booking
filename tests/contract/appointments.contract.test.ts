import { describe, expect, it } from "vitest";

import { POST as appointmentsPost } from "@/app/api/appointments/route";
import { getDefaultBookingDate } from "@/lib/appointments/booking-service";

describe("appointments contract", () => {
  it("creates an appointment with the expected response shape", async () => {
    const response = await appointmentsPost(
      new Request("http://localhost/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          doctorId: "11111111-1111-1111-1111-111111111111",
          appointmentDate: getDefaultBookingDate(),
          startTime: "09:00",
          endTime: "09:30",
          patient: {
            fullName: "Taylor Patient",
            phone: "0987654321",
            email: "taylor@example.com"
          }
        })
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.data).toMatchObject({
      id: expect.any(String),
      referenceCode: expect.stringMatching(/^APPT-/),
      status: "pending"
    });
  });
});
