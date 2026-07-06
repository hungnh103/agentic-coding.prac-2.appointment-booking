import { beforeEach, describe, expect, it } from "vitest";

import { createBooking, getDefaultBookingDate } from "@/lib/appointments/booking-service";
import { ApiError } from "@/lib/http/api-error";
import { resetMockStore } from "@/lib/db/mock-store";

describe("patient booking integration", () => {
  beforeEach(() => {
    resetMockStore();
  });

  it("persists booking details for the summary view", async () => {
    const result = await createBooking({
      doctorId: "11111111-1111-1111-1111-111111111111",
      appointmentDate: getDefaultBookingDate(),
      startTime: "09:00",
      endTime: "09:30",
      patient: {
        fullName: "Jordan Patient",
        phone: "0111222333",
        email: "jordan@example.com"
      }
    });

    expect(result.data.patient.fullName).toBe("Jordan Patient");
    expect(result.data.doctor.fullName).toBe("Dr. Lan Ngo");
  });

  it("rejects a second booking attempt for the same slot", async () => {
    const payload = {
      doctorId: "11111111-1111-1111-1111-111111111111",
      appointmentDate: getDefaultBookingDate(),
      startTime: "09:00",
      endTime: "09:30",
      patient: {
        fullName: "Jordan Patient",
        phone: "0111222333",
        email: "jordan@example.com"
      }
    };

    await createBooking(payload);

    await expect(createBooking(payload)).rejects.toMatchObject({
      status: 409,
      code: "SLOT_UNAVAILABLE"
    } satisfies Partial<ApiError>);
  });
});
