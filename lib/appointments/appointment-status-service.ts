import { scheduleCancellationNotice, scheduleConfirmationAndReminder } from "@/lib/notifications/notification-service";
import {
  getAdminAppointment,
  hasBlockingTimeOff,
  insertAppointmentAuditEntry,
  listAdminAppointments,
  updateAppointmentStatusByAdmin
} from "@/lib/db/queries/admin-appointments";
import { listAdminDoctors } from "@/lib/db/queries/admin-schedules";
import { ApiError } from "@/lib/http/api-error";
import { logInfo } from "@/lib/observability/logger";

type AppointmentStatus = "pending" | "confirmed" | "canceled";

export function assertValidAppointmentTransition(
  currentStatus: AppointmentStatus,
  nextStatus: "confirmed" | "canceled"
) {
  if (currentStatus === "canceled") {
    throw new ApiError(409, "INVALID_STATUS_TRANSITION", "Canceled appointments cannot be changed.");
  }

  if (currentStatus === "confirmed" && nextStatus === "confirmed") {
    throw new ApiError(409, "INVALID_STATUS_TRANSITION", "Appointment is already confirmed.");
  }

  if (currentStatus === "pending" || nextStatus === "canceled") {
    return;
  }

  throw new ApiError(409, "INVALID_STATUS_TRANSITION", "Appointment cannot move to the requested status.");
}

export async function listAdminAppointmentReview(filters: {
  status?: AppointmentStatus;
  doctorId?: string;
  date?: string;
} = {}) {
  const [appointments, doctors] = await Promise.all([
    listAdminAppointments(filters),
    listAdminDoctors()
  ]);

  return {
    appointments,
    doctors
  };
}

export async function confirmAppointmentByAdmin(appointmentId: string, adminId: string) {
  const appointment = await getAdminAppointment(appointmentId);
  if (!appointment) {
    throw new ApiError(404, "APPOINTMENT_NOT_FOUND", "Appointment not found.");
  }

  assertValidAppointmentTransition(appointment.status, "confirmed");

  if (await hasBlockingTimeOff(appointmentId)) {
    throw new ApiError(
      409,
      "DOCTOR_UNAVAILABLE",
      "This appointment overlaps doctor time off and cannot be confirmed."
    );
  }

  const updated = await updateAppointmentStatusByAdmin(appointmentId, {
    status: "confirmed",
    adminId
  });

  if (!updated) {
    throw new ApiError(404, "APPOINTMENT_NOT_FOUND", "Appointment not found.");
  }

  await insertAppointmentAuditEntry({
    appointmentId,
    actorType: "admin",
    actorId: adminId,
    action: "confirmed"
  });
  await scheduleConfirmationAndReminder(appointmentId);
  logInfo("admin.appointment_confirmed", { appointmentId, adminId });

  return updated;
}

export async function cancelAppointmentByAdmin(
  appointmentId: string,
  reason: string,
  adminId: string
) {
  const appointment = await getAdminAppointment(appointmentId);
  if (!appointment) {
    throw new ApiError(404, "APPOINTMENT_NOT_FOUND", "Appointment not found.");
  }

  assertValidAppointmentTransition(appointment.status, "canceled");

  const updated = await updateAppointmentStatusByAdmin(appointmentId, {
    status: "canceled",
    adminId,
    cancellationReason: reason
  });

  if (!updated) {
    throw new ApiError(404, "APPOINTMENT_NOT_FOUND", "Appointment not found.");
  }

  await insertAppointmentAuditEntry({
    appointmentId,
    actorType: "admin",
    actorId: adminId,
    action: "canceled",
    details: {
      reason
    }
  });
  await scheduleCancellationNotice(appointmentId);
  logInfo("admin.appointment_canceled", { appointmentId, adminId });

  return updated;
}
