import { describe, expect, it } from "vitest";

import { GET as doctorsGet } from "@/app/api/doctors/route";
import { GET as availabilityGet } from "@/app/api/doctors/[doctorId]/availability/route";
import { getDefaultBookingDate } from "@/lib/appointments/booking-service";

describe("doctor contracts", () => {
  it("returns the expected doctor list shape", async () => {
    const response = await doctorsGet();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(payload.data)).toBe(true);
    expect(payload.data[0]).toMatchObject({
      id: expect.any(String),
      fullName: expect.any(String),
      specialty: expect.any(String)
    });
  });

  it("returns availability for a requested doctor and date", async () => {
    const date = getDefaultBookingDate();
    const request = new Request(`http://localhost/api/doctors/11111111-1111-1111-1111-111111111111/availability?date=${date}`);
    const response = await availabilityGet(request, {
      params: Promise.resolve({
        doctorId: "11111111-1111-1111-1111-111111111111"
      })
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      doctorId: "11111111-1111-1111-1111-111111111111",
      date
    });
    expect(Array.isArray(payload.slots)).toBe(true);
  });
});

