import { describe, expect, it } from "vitest";

import { POST as timeOffPost } from "@/app/api/admin/doctors/[doctorId]/time-off/route";
import { POST as workSchedulePost } from "@/app/api/admin/doctors/[doctorId]/work-schedules/route";

function adminRequest(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    headers: {
      "x-test-admin": "true",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

describe("admin schedules contract", () => {
  it("creates work schedules with the expected response shape", async () => {
    const response = await workSchedulePost(
      adminRequest("http://localhost/api/admin/doctors/11111111-1111-1111-1111-111111111111/work-schedules", {
        dayOfWeek: 6,
        startTime: "09:00",
        endTime: "12:00",
        effectiveFrom: "2026-08-01"
      }),
      {
        params: Promise.resolve({
          doctorId: "11111111-1111-1111-1111-111111111111"
        })
      }
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.data).toMatchObject({
      doctorId: "11111111-1111-1111-1111-111111111111",
      dayOfWeek: 6,
      startTime: "09:00:00",
      endTime: "12:00:00"
    });
  });

  it("creates time off with the expected response shape", async () => {
    const response = await timeOffPost(
      adminRequest("http://localhost/api/admin/doctors/11111111-1111-1111-1111-111111111111/time-off", {
        startsAt: "2026-08-03T09:00:00.000Z",
        endsAt: "2026-08-03T10:00:00.000Z",
        reason: "Conference"
      }),
      {
        params: Promise.resolve({
          doctorId: "11111111-1111-1111-1111-111111111111"
        })
      }
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.data).toMatchObject({
      doctorId: "11111111-1111-1111-1111-111111111111",
      reason: "Conference",
      status: "scheduled"
    });
  });
});
