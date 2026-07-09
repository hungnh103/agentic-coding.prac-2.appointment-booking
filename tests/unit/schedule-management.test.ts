import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/http/api-error";
import {
  validateTimeOffRules,
  validateWorkScheduleRules
} from "@/lib/availability/admin-schedule-service";

describe("schedule management validation", () => {
  it("accepts aligned work schedule windows", () => {
    expect(() =>
      validateWorkScheduleRules({
        startTime: "09:00",
        endTime: "12:00",
        effectiveFrom: "2026-08-01"
      })
    ).not.toThrow();
  });

  it("rejects overlapping or misaligned schedule windows", () => {
    expect(() =>
      validateWorkScheduleRules({
        startTime: "09:15",
        endTime: "12:00",
        effectiveFrom: "2026-08-01"
      })
    ).toThrowError(ApiError);

    expect(() =>
      validateWorkScheduleRules({
        startTime: "12:00",
        endTime: "09:00",
        effectiveFrom: "2026-08-01"
      })
    ).toThrowError(ApiError);
  });

  it("rejects time off ranges where the end is before the start", () => {
    expect(() =>
      validateTimeOffRules({
        startsAt: "2026-08-03T10:00:00.000Z",
        endsAt: "2026-08-03T09:00:00.000Z"
      })
    ).toThrowError(ApiError);
  });
});
