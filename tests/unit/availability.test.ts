import { describe, expect, it } from "vitest";

import { filterAvailableSlots } from "@/lib/availability/availability-rules";
import { generateSlots } from "@/lib/availability/slot-generator";

describe("generateSlots", () => {
  it("creates fixed 30 minute slots", () => {
    expect(generateSlots("09:00", "10:30")).toEqual([
      { startTime: "09:00", endTime: "09:30" },
      { startTime: "09:30", endTime: "10:00" },
      { startTime: "10:00", endTime: "10:30" }
    ]);
  });
});

describe("filterAvailableSlots", () => {
  it("removes occupied and time off slots", () => {
    const slots = generateSlots("09:00", "11:00");

    expect(
      filterAvailableSlots(
        slots,
        [{ startTime: "09:30" }],
        [{ startTime: "10:00", endTime: "10:30" }]
      )
    ).toEqual([
      { startTime: "09:00", endTime: "09:30" },
      { startTime: "10:30", endTime: "11:00" }
    ]);
  });
});
