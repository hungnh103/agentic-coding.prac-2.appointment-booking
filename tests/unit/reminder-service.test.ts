import { describe, expect, it } from "vitest";

import {
  cancelBookingForTesting,
  confirmBookingForTesting,
  createBooking,
  getDefaultBookingDate
} from "@/lib/appointments/booking-service";
import { getNotificationEventsForAppointment } from "@/lib/db/queries/notifications";
import type { EmailAdapter } from "@/lib/notifications/email-adapter";
import {
  isReminderEligible,
  processPendingReminders
} from "@/lib/notifications/reminder-service";

class FakeEmailAdapter implements EmailAdapter {
  sent = 0;

  async send() {
    this.sent += 1;
    return { providerMessageId: `fake-${this.sent}` };
  }
}

describe("reminder service", () => {
  it("reports eligibility only for confirmed appointments", () => {
    expect(isReminderEligible("confirmed")).toBe(true);
    expect(isReminderEligible("pending")).toBe(false);
    expect(isReminderEligible("canceled")).toBe(false);
  });

  it("sends reminders for confirmed appointments and skips canceled ones", async () => {
    const confirmed = await createBooking({
      doctorId: "11111111-1111-1111-1111-111111111111",
      appointmentDate: getDefaultBookingDate(),
      startTime: "11:00",
      endTime: "11:30",
      patient: {
        fullName: "Pat One",
        phone: "0111000001",
        email: "one@example.com"
      }
    });

    const canceled = await createBooking({
      doctorId: "11111111-1111-1111-1111-111111111111",
      appointmentDate: getDefaultBookingDate(),
      startTime: "11:30",
      endTime: "12:00",
      patient: {
        fullName: "Pat Two",
        phone: "0111000002",
        email: "two@example.com"
      }
    });

    await confirmBookingForTesting(confirmed.data.id);
    await confirmBookingForTesting(canceled.data.id);
    await cancelBookingForTesting(canceled.data.id, "Doctor unavailable");

    const adapter = new FakeEmailAdapter();
    const result = await processPendingReminders(adapter, "9999-12-31T00:00:00.000Z");

    const confirmedEvents = await getNotificationEventsForAppointment(confirmed.data.id);
    const canceledEvents = await getNotificationEventsForAppointment(canceled.data.id);

    expect(result.sent).toBe(1);
    expect(result.skipped).toBe(1);
    expect(confirmedEvents.find((event) => event.type === "reminder")?.status).toBe("sent");
    expect(canceledEvents.find((event) => event.type === "reminder")?.status).toBe("skipped");
  });
});
