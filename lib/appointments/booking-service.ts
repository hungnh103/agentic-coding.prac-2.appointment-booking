import { getPublicAvailability } from "@/lib/availability/public-availability-service";
import { insertAppointment } from "@/lib/db/queries/appointments";
import { insertPatient } from "@/lib/db/queries/patients";
import { ApiError } from "@/lib/http/api-error";
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

  const appointment = await insertAppointment({
    patientId: patient.id,
    doctorId: payload.doctorId,
    appointmentDate: payload.appointmentDate,
    startTime: payload.startTime,
    endTime: payload.endTime
  });

  return {
    data: {
      ...appointment,
      patient,
      doctor: availability.doctor
    }
  };
}

export function getDefaultBookingDate() {
  const date = new Date();
  do {
    date.setDate(date.getDate() + 1);
  } while ([0, 6].includes(date.getDay()));
  return date.toISOString().slice(0, 10);
}
