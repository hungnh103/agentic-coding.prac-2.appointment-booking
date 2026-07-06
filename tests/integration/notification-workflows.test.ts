import { describe, expect, it } from "vitest";

import {
  cancelBookingForTesting,
  confirmBookingForTesting,
  createBooking,
  getDefaultBookingDate
} from "@/lib/appointments/booking-service";
import { getAppointmentDetail } from "@/lib/appointments/appointment-detail-service";
import { getNotificationEventsForAppointment } from "@/lib/db/queries/notifications";
import { runReminders } from "@/lib/notifications/run-reminders";
import { scheduleCancellationNotice } from "@/lib/notifications/notification-service";

describe("notification workflows", () => {
  it("queues confirmation and reminder records for confirmed appointments", async () => {
    const booking = await createBooking({
      doctorId: "11111111-1111-1111-1111-111111111111",
      appointmentDate: getDefaultBookingDate(),
      startTime: "13:00",
      endTime: "13:30",
      patient: {
        fullName: "Casey Patient",
        phone: "0222333444",
        email: "casey@example.com"
      }
    });

    await confirmBookingForTesting(booking.data.id);

    const events = await getNotificationEventsForAppointment(booking.data.id);
    expect(events.map((event) => event.type).sort()).toEqual(["confirmation", "reminder"]);
  });

  it("queues cancellation notices and skips reminders for canceled appointments", async () => {
    const booking = await createBooking({
      doctorId: "11111111-1111-1111-1111-111111111111",
      appointmentDate: getDefaultBookingDate(),
      startTime: "14:00",
      endTime: "14:30",
      patient: {
        fullName: "Avery Patient",
        phone: "0222333555",
        email: "avery@example.com"
      }
    });

    await confirmBookingForTesting(booking.data.id);
    await cancelBookingForTesting(booking.data.id, "Doctor conflict");
    await scheduleCancellationNotice(booking.data.id);
    await runReminders("9999-12-31T00:00:00.000Z");

    const detail = await getAppointmentDetail(booking.data.id);
    const reminderEvent = detail.notifications.find((event) => event.type === "reminder");
    const cancellationEvent = detail.notifications.find((event) => event.type === "cancellation");

    expect(detail.status).toBe("canceled");
    expect(detail.statusCopy).toContain("canceled");
    expect(reminderEvent?.status).toBe("skipped");
    expect(cancellationEvent?.type).toBe("cancellation");
  });
});
