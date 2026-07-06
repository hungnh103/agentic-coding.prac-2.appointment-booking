import { ApiError } from "@/lib/http/api-error";
import { confirmBookingForTesting, createBooking, getDefaultBookingDate } from "@/lib/appointments/booking-service";
import { getAppointment, listAppointments } from "@/lib/db/queries/appointments";
import { getDoctor } from "@/lib/db/queries/doctors";
import { getNotificationEventsForAppointment } from "@/lib/db/queries/notifications";
import { getPatient } from "@/lib/db/queries/patients";

function mapStatusCopy(status: "pending" | "confirmed" | "canceled") {
  if (status === "confirmed") {
    return "Your appointment is confirmed and reminder-ready.";
  }

  if (status === "canceled") {
    return "This appointment was canceled. New reminders will not be sent.";
  }

  return "Your booking request is pending clinic confirmation.";
}

function toDateString(value: string | Date) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value;
}

function toTimeString(value: string | Date) {
  if (value instanceof Date) {
    return value.toISOString().slice(11, 16);
  }

  return value.slice(0, 5);
}

export async function getAppointmentDetail(appointmentId: string) {
  if (appointmentId === "demo-confirmed") {
    const existing = (await listAppointments()).find(
      (appointment) => appointment.status === "confirmed"
    );

    if (existing) {
      appointmentId = existing.id;
    } else {
      const booking = await createBooking({
        doctorId: "11111111-1111-1111-1111-111111111111",
        appointmentDate: getDefaultBookingDate(),
        startTime: "15:00",
        endTime: "15:30",
        patient: {
          fullName: "Demo Patient",
          phone: "0000000000",
          email: "demo@example.com"
        }
      });

      await confirmBookingForTesting(booking.data.id);
      appointmentId = booking.data.id;
    }
  }

  const appointment = await getAppointment(appointmentId);

  if (!appointment) {
    throw new ApiError(404, "APPOINTMENT_NOT_FOUND", "Appointment not found.");
  }

  const [patient, doctor, notifications] = await Promise.all([
    getPatient(appointment.patientId),
    getDoctor(appointment.doctorId),
    getNotificationEventsForAppointment(appointmentId)
  ]);

  if (!patient || !doctor) {
    throw new ApiError(404, "APPOINTMENT_CONTEXT_NOT_FOUND", "Appointment context is incomplete.");
  }

  return {
    ...appointment,
    appointmentDate: toDateString(appointment.appointmentDate),
    startTime: toTimeString(appointment.startTime),
    endTime: toTimeString(appointment.endTime),
    patient: {
      ...patient,
      email: patient.email ?? undefined,
      notes: patient.notes ?? undefined
    },
    doctor,
    notifications: notifications.map((event) => ({
      ...event,
      scheduledFor:
        event.scheduledFor instanceof Date
          ? event.scheduledFor.toISOString()
          : event.scheduledFor
    })),
    statusCopy: mapStatusCopy(appointment.status)
  };
}
