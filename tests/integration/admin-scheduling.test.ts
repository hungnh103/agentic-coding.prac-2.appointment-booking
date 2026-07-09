import { describe, expect, it } from "vitest";

import {
  cancelAppointmentByAdmin,
  confirmAppointmentByAdmin
} from "@/lib/appointments/appointment-status-service";
import { createBooking, getDefaultBookingDate } from "@/lib/appointments/booking-service";
import { getPublicAvailability } from "@/lib/availability/public-availability-service";
import {
  createTimeOffEntry,
  createWorkScheduleEntry
} from "@/lib/availability/admin-schedule-service";

const adminId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const doctorId = "11111111-1111-1111-1111-111111111111";

describe("admin scheduling integration", () => {
  it("confirms and cancels appointments with admin attribution", async () => {
    const booking = await createBooking({
      doctorId,
      appointmentDate: getDefaultBookingDate(),
      startTime: "13:00",
      endTime: "13:30",
      patient: {
        fullName: "Admin Integration",
        phone: "0900777888",
        email: "admin.integration@example.com"
      }
    });

    const confirmed = await confirmAppointmentByAdmin(booking.data.id, adminId);
    expect(confirmed.status).toBe("confirmed");
    expect(confirmed.confirmedByAdminId).toBe(adminId);

    const canceled = await cancelAppointmentByAdmin(booking.data.id, "Doctor unavailable", adminId);
    expect(canceled.status).toBe("canceled");
    expect(canceled.canceledByAdminId).toBe(adminId);
    expect(canceled.cancellationReason).toBe("Doctor unavailable");
  });

  it("creates schedule entries and removes slots blocked by time off", async () => {
    await createWorkScheduleEntry(
      {
        doctorId,
        dayOfWeek: 6,
        startTime: "09:00",
        endTime: "11:00",
        effectiveFrom: "2026-08-01"
      },
      adminId
    );

    const beforeTimeOff = await getPublicAvailability(doctorId, "2026-08-01");
    expect(beforeTimeOff.slots.some((slot) => slot.startTime === "09:00")).toBe(true);

    const result = await createTimeOffEntry(
      {
        doctorId,
        startsAt: "2026-08-01T09:00:00.000Z",
        endsAt: "2026-08-01T10:00:00.000Z",
        reason: "Morning leave"
      },
      adminId
    );
    expect(result.conflicts).toEqual([]);

    const afterTimeOff = await getPublicAvailability(doctorId, "2026-08-01");
    expect(afterTimeOff.slots.some((slot) => slot.startTime === "09:00")).toBe(false);
    expect(afterTimeOff.slots.some((slot) => slot.startTime === "10:00")).toBe(true);
  });
});
