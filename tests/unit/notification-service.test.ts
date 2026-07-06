import { describe, expect, it } from "vitest";

import {
  confirmBookingForTesting,
  createBooking,
  getDefaultBookingDate
} from "@/lib/appointments/booking-service";
import { getNotificationEventsForAppointment } from "@/lib/db/queries/notifications";
import {
  buildNotificationPreview,
  scheduleConfirmationAndReminder
} from "@/lib/notifications/notification-service";

describe("notification service", () => {
  it("creates confirmation and reminder events once", async () => {
    const booking = await createBooking({
      doctorId: "11111111-1111-1111-1111-111111111111",
      appointmentDate: getDefaultBookingDate(),
      startTime: "09:00",
      endTime: "09:30",
      patient: {
        fullName: "Morgan Patient",
        phone: "0999888777",
        email: "morgan@example.com"
      }
    });

    await confirmBookingForTesting(booking.data.id);
    await scheduleConfirmationAndReminder(booking.data.id);

    const events = await getNotificationEventsForAppointment(booking.data.id);
    expect(events).toHaveLength(2);
    expect(events.map((event) => event.type).sort()).toEqual(["confirmation", "reminder"]);
  });

  it("builds a reminder preview message", async () => {
    const booking = await createBooking({
      doctorId: "11111111-1111-1111-1111-111111111111",
      appointmentDate: getDefaultBookingDate(),
      startTime: "10:00",
      endTime: "10:30",
      patient: {
        fullName: "Riley Patient",
        phone: "0999888776",
        email: "riley@example.com"
      }
    });

    await confirmBookingForTesting(booking.data.id);

    const preview = await buildNotificationPreview(booking.data.id, "reminder");
    expect(preview.subject).toContain("Reminder");
    expect(preview.body).toContain("Riley Patient");
  });
});
