import { describe, expect, it } from "vitest";

import {
  confirmBookingForTesting,
  createBooking,
  getDefaultBookingDate
} from "@/lib/appointments/booking-service";
import { getNotificationEventsForAppointment } from "@/lib/db/queries/notifications";

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

  it("queues confirmation and reminder notifications after confirmation", async () => {
    const result = await createBooking({
      doctorId: "11111111-1111-1111-1111-111111111111",
      appointmentDate: getDefaultBookingDate(),
      startTime: "09:30",
      endTime: "10:00",
      patient: {
        fullName: "Chris Patient",
        phone: "0123456788",
        email: "chris@example.com"
      }
    });

    await confirmBookingForTesting(result.data.id);

    const events = await getNotificationEventsForAppointment(result.data.id);

    expect(events.map((event) => event.type).sort()).toEqual(["confirmation", "reminder"]);
  });
});
