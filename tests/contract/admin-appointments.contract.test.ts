import { describe, expect, it } from "vitest";

import { PATCH as cancelAppointmentPatch } from "@/app/api/admin/appointments/[appointmentId]/cancel/route";
import { PATCH as confirmAppointmentPatch } from "@/app/api/admin/appointments/[appointmentId]/confirm/route";
import { GET as adminAppointmentsGet } from "@/app/api/admin/appointments/route";
import { createBooking, getDefaultBookingDate } from "@/lib/appointments/booking-service";

function adminRequest(url: string, init?: RequestInit) {
  return new Request(url, {
    ...init,
    headers: {
      "x-test-admin": "true",
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });
}

describe("admin appointments contract", () => {
  it("returns the expected appointment review list shape", async () => {
    await createBooking({
      doctorId: "11111111-1111-1111-1111-111111111111",
      appointmentDate: getDefaultBookingDate(),
      startTime: "12:00",
      endTime: "12:30",
      patient: {
        fullName: "Admin Contract",
        phone: "0900111222",
        email: "contract@example.com"
      }
    });

    const response = await adminAppointmentsGet(adminRequest("http://localhost/api/admin/appointments"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data[0]).toMatchObject({
      id: expect.any(String),
      referenceCode: expect.stringMatching(/^APPT-/),
      doctorId: expect.any(String),
      patientName: expect.any(String),
      status: expect.stringMatching(/pending|confirmed|canceled/)
    });
  });

  it("confirms and cancels appointments with the expected response shape", async () => {
    const booking = await createBooking({
      doctorId: "11111111-1111-1111-1111-111111111111",
      appointmentDate: getDefaultBookingDate(),
      startTime: "12:30",
      endTime: "13:00",
      patient: {
        fullName: "Admin Contract Action",
        phone: "0900111333",
        email: "action@example.com"
      }
    });

    const confirmResponse = await confirmAppointmentPatch(
      adminRequest(`http://localhost/api/admin/appointments/${booking.data.id}/confirm`, {
        method: "PATCH"
      }),
      {
        params: Promise.resolve({ appointmentId: booking.data.id })
      }
    );
    const confirmPayload = await confirmResponse.json();

    expect(confirmResponse.status).toBe(200);
    expect(confirmPayload.data).toMatchObject({
      id: booking.data.id,
      status: "confirmed"
    });

    const cancelResponse = await cancelAppointmentPatch(
      adminRequest(`http://localhost/api/admin/appointments/${booking.data.id}/cancel`, {
        method: "PATCH",
        body: JSON.stringify({ reason: "Doctor conflict" })
      }),
      {
        params: Promise.resolve({ appointmentId: booking.data.id })
      }
    );
    const cancelPayload = await cancelResponse.json();

    expect(cancelResponse.status).toBe(200);
    expect(cancelPayload.data).toMatchObject({
      id: booking.data.id,
      status: "canceled",
      cancellationReason: "Doctor conflict"
    });
  });
});
