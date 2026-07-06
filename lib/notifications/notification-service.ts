import { getAppointment } from "@/lib/db/queries/appointments";
import { getDoctor } from "@/lib/db/queries/doctors";
import { getNotificationEventsForAppointment, insertNotificationEvent } from "@/lib/db/queries/notifications";
import { getPatient } from "@/lib/db/queries/patients";
import {
  buildCancellationMessage,
  buildConfirmationMessage,
  buildReminderMessage
} from "@/lib/notifications/message-builder";

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

function reminderScheduleIso(appointmentDate: string | Date, startTime: string | Date) {
  const iso = new Date(`${toDateString(appointmentDate)}T${toTimeString(startTime)}:00.000Z`);
  iso.setUTCHours(iso.getUTCHours() - 24);
  return iso.toISOString();
}

async function loadNotificationContext(appointmentId: string) {
  const appointment = await getAppointment(appointmentId);
  if (!appointment) {
    throw new Error("Appointment not found");
  }

  const [patient, doctor] = await Promise.all([
    getPatient(appointment.patientId),
    getDoctor(appointment.doctorId)
  ]);

  if (!patient || !doctor) {
    throw new Error("Notification context is incomplete");
  }

  return {
    appointment,
    patient,
    doctor
  };
}

export async function scheduleConfirmationAndReminder(appointmentId: string) {
  const { appointment } = await loadNotificationContext(appointmentId);
  const existingEvents = await getNotificationEventsForAppointment(appointmentId);

  if (!existingEvents.some((event) => event.type === "confirmation")) {
    await insertNotificationEvent({
      appointmentId,
      type: "confirmation",
      scheduledFor: new Date().toISOString()
    });
  }

  if (!existingEvents.some((event) => event.type === "reminder")) {
    await insertNotificationEvent({
      appointmentId,
      type: "reminder",
      scheduledFor: reminderScheduleIso(appointment.appointmentDate, appointment.startTime)
    });
  }
}

export async function scheduleCancellationNotice(appointmentId: string) {
  const existingEvents = await getNotificationEventsForAppointment(appointmentId);

  if (!existingEvents.some((event) => event.type === "cancellation")) {
    await insertNotificationEvent({
      appointmentId,
      type: "cancellation",
      scheduledFor: new Date().toISOString()
    });
  }
}

export async function buildNotificationPreview(appointmentId: string, type: "confirmation" | "reminder" | "cancellation") {
  const { appointment, patient, doctor } = await loadNotificationContext(appointmentId);

  const input = {
    doctorName: doctor.fullName,
    appointmentDate: toDateString(appointment.appointmentDate),
    startTime: toTimeString(appointment.startTime),
    patientName: patient.fullName,
    referenceCode: appointment.referenceCode,
    cancellationReason: appointment.cancellationReason ?? undefined
  };

  if (type === "confirmation") {
    return buildConfirmationMessage(input);
  }

  if (type === "reminder") {
    return buildReminderMessage(input);
  }

  return buildCancellationMessage(input);
}
