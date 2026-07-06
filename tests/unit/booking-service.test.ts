import { describe, expect, it } from "vitest";

import { createBooking, getDefaultBookingDate } from "@/lib/appointments/booking-service";

describe("createBooking", () => {
  it("creates a pending appointment for an available slot", async () => {
    const result = await createBooking({
      doctorId: "11111111-1111-1111-1111-111111111111",
      appointmentDate: getDefaultBookingDate(),
      startTime: "09:00",
      endTime: "09:30",
      patient: {
        fullName: "Alex Patient",
        phone: "0123456789",
        email: "alex@example.com"
      }
    });

    expect(result.data.status).toBe("pending");
    expect(result.data.patient.fullName).toBe("Alex Patient");
  });
});
