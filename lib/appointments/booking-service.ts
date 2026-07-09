import { getPublicAvailability } from "@/lib/availability/public-availability-service";
import {
  insertAppointment,
  updateAppointmentStatus
} from "@/lib/db/queries/appointments";
import { insertPatient } from "@/lib/db/queries/patients";
import { ApiError } from "@/lib/http/api-error";
import { scheduleConfirmationAndReminder } from "@/lib/notifications/notification-service";
import { logInfo } from "@/lib/observability/logger";
import { createAppointmentSchema } from "@/lib/validation/appointments";

function isPastDate(date: string) {
  const today = new Date();
  const target = new Date(`${date}T00:00:00`);
  today.setHours(0, 0, 0, 0);
  return target < today;
}

export async function createBooking(input: unknown) {
  const payload = createAppointmentSchema.parse(input);

  if (isPastDate(payload.appointmentDate)) {
    throw new ApiError(400, "INVALID_DATE", "Appointments must be booked for today or a future date.");
  }

  const availability = await getPublicAvailability(payload.doctorId, payload.appointmentDate);
  const selectedSlot = availability.slots.find((slot) => slot.startTime === payload.startTime);

  if (!selectedSlot) {
    throw new ApiError(409, "SLOT_UNAVAILABLE", "The chosen slot is no longer available.");
  }

  const patient = await insertPatient({
    fullName: payload.patient.fullName,
    phone: payload.patient.phone,
    email: payload.patient.email || undefined,
    notes: payload.patient.notes
  });

  let appointment;

  try {
    appointment = await insertAppointment({
      patientId: patient.id,
      doctorId: payload.doctorId,
      appointmentDate: payload.appointmentDate,
      startTime: payload.startTime,
      endTime: payload.endTime
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      throw new ApiError(409, "SLOT_UNAVAILABLE", "The chosen slot is no longer available.");
    }

    throw error;
  }

  logInfo("booking.created", {
    appointmentId: appointment.id,
    doctorId: appointment.doctorId,
    appointmentDate: appointment.appointmentDate,
    startTime: appointment.startTime
  });

  return {
    data: {
      ...appointment,
      patient,
      doctor: availability.doctor
    }
  };
}

export async function confirmBookingForTesting(appointmentId: string) {
  const appointment = await updateAppointmentStatus(appointmentId, {
    status: "confirmed"
  });

  if (!appointment) {
    throw new ApiError(404, "APPOINTMENT_NOT_FOUND", "Appointment not found.");
  }

  await scheduleConfirmationAndReminder(appointmentId);
  logInfo("booking.confirmed_for_testing", { appointmentId });

  return appointment;
}

export async function cancelBookingForTesting(appointmentId: string, reason: string) {
  const appointment = await updateAppointmentStatus(appointmentId, {
    status: "canceled",
    cancellationReason: reason
  });

  if (!appointment) {
    throw new ApiError(404, "APPOINTMENT_NOT_FOUND", "Appointment not found.");
  }

  logInfo("booking.canceled_for_testing", { appointmentId, reason });
  return appointment;
}

export function getDefaultBookingDate() {
  const date = new Date();
  do {
    date.setDate(date.getDate() + 1);
  } while ([0, 6].includes(date.getDay()));
  return date.toISOString().slice(0, 10);
}
