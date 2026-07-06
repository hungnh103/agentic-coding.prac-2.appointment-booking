import { getAppointment } from "@/lib/db/queries/appointments";
import { getDoctor } from "@/lib/db/queries/doctors";
import {
  getPendingReminderEvents,
  patchNotificationEvent
} from "@/lib/db/queries/notifications";
import { getPatient } from "@/lib/db/queries/patients";
import { buildReminderMessage } from "@/lib/notifications/message-builder";
import type { EmailAdapter } from "@/lib/notifications/email-adapter";

export function isReminderEligible(status: "pending" | "confirmed" | "canceled") {
  return status === "confirmed";
}

export async function processPendingReminders(adapter: EmailAdapter, nowIso = new Date().toISOString()) {
  const events = await getPendingReminderEvents(nowIso);
  let sent = 0;
  let skipped = 0;

  for (const event of events) {
    const appointment = await getAppointment(event.appointmentId);

    if (!appointment || !isReminderEligible(appointment.status)) {
      await patchNotificationEvent(event.id, {
        status: "skipped",
        failureReason: "Appointment is not eligible for reminders."
      });
      skipped += 1;
      continue;
    }

    const [patient, doctor] = await Promise.all([
      getPatient(appointment.patientId),
      getDoctor(appointment.doctorId)
    ]);

    if (!patient || !doctor || !patient.email) {
      await patchNotificationEvent(event.id, {
        status: "skipped",
        failureReason: "Missing patient email or doctor context."
      });
      skipped += 1;
      continue;
    }

    const message = buildReminderMessage({
      doctorName: doctor.fullName,
      appointmentDate: appointment.appointmentDate,
      startTime: appointment.startTime,
      patientName: patient.fullName,
      referenceCode: appointment.referenceCode
    });

    const result = await adapter.send({
      to: patient.email,
      subject: message.subject,
      body: message.body
    });

    await patchNotificationEvent(event.id, {
      status: "sent",
      providerMessageId: result.providerMessageId,
      sentAt: nowIso
    });
    sent += 1;
  }

  return {
    processed: events.length,
    sent,
    skipped
  };
}

