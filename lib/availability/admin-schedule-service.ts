import {
  createTimeOff,
  createWorkSchedule,
  getAdminDoctor,
  listAdminDoctors,
  listDoctorTimeOff,
  listDoctorWorkSchedules,
  listOverlappingSchedules,
  listTimeOffConflicts
} from "@/lib/db/queries/admin-schedules";
import { ApiError } from "@/lib/http/api-error";
import { logInfo } from "@/lib/observability/logger";
import { timeOffSchema, workScheduleSchema } from "@/lib/validation/schedules";

function toMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function assertHalfHourBoundary(value: string) {
  if (toMinutes(value) % 30 !== 0) {
    throw new ApiError(400, "INVALID_TIME_ALIGNMENT", "Times must align to 30-minute boundaries.");
  }
}

export function validateWorkScheduleRules(input: {
  startTime: string;
  endTime: string;
  effectiveFrom: string;
  effectiveTo?: string;
}) {
  assertHalfHourBoundary(input.startTime);
  assertHalfHourBoundary(input.endTime);

  if (toMinutes(input.startTime) >= toMinutes(input.endTime)) {
    throw new ApiError(400, "INVALID_SCHEDULE_RANGE", "Schedule start time must be before end time.");
  }

  if (input.effectiveTo && input.effectiveTo < input.effectiveFrom) {
    throw new ApiError(400, "INVALID_SCHEDULE_RANGE", "effectiveTo must be on or after effectiveFrom.");
  }
}

export function validateTimeOffRules(input: { startsAt: string; endsAt: string }) {
  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);

  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || startsAt >= endsAt) {
    throw new ApiError(400, "INVALID_TIME_OFF_RANGE", "Time off must start before it ends.");
  }
}

export async function createWorkScheduleEntry(input: unknown, adminId: string) {
  const payload = workScheduleSchema.parse(input);
  const normalized = {
    ...payload,
    effectiveTo: payload.effectiveTo || undefined
  };

  validateWorkScheduleRules(normalized);

  const doctor = await getAdminDoctor(payload.doctorId);
  if (!doctor) {
    throw new ApiError(404, "DOCTOR_NOT_FOUND", "Doctor not found.");
  }

  const overlapping = await listOverlappingSchedules(normalized);
  if (overlapping.length > 0) {
    throw new ApiError(
      409,
      "SCHEDULE_OVERLAP",
      "This work schedule overlaps an existing active schedule."
    );
  }

  const schedule = await createWorkSchedule({
    ...normalized,
    createdByAdminId: adminId
  });
  logInfo("admin.work_schedule_created", {
    doctorId: payload.doctorId,
    scheduleId: schedule.id,
    adminId
  });

  return schedule;
}

export async function createTimeOffEntry(input: unknown, adminId: string) {
  const payload = timeOffSchema.parse(input);
  validateTimeOffRules(payload);

  const doctor = await getAdminDoctor(payload.doctorId);
  if (!doctor) {
    throw new ApiError(404, "DOCTOR_NOT_FOUND", "Doctor not found.");
  }

  const entry = await createTimeOff({
    ...payload,
    createdByAdminId: adminId
  });
  const conflicts = await listTimeOffConflicts(payload);
  logInfo("admin.time_off_created", {
    doctorId: payload.doctorId,
    timeOffId: entry.id,
    adminId,
    conflictCount: conflicts.length
  });

  return {
    data: entry,
    conflicts
  };
}

export async function getDoctorScheduleManagement(doctorId: string) {
  const doctor = await getAdminDoctor(doctorId);
  if (!doctor) {
    throw new ApiError(404, "DOCTOR_NOT_FOUND", "Doctor not found.");
  }

  const [doctors, schedules, timeOffEntries] = await Promise.all([
    listAdminDoctors(),
    listDoctorWorkSchedules(doctorId),
    listDoctorTimeOff(doctorId)
  ]);

  const conflictGroups = await Promise.all(
    timeOffEntries.map(async (entry) => ({
      timeOffId: entry.id,
      conflicts: await listTimeOffConflicts({
        doctorId,
        startsAt: entry.startsAt.toISOString(),
        endsAt: entry.endsAt.toISOString()
      })
    }))
  );

  return {
    doctor,
    doctors,
    schedules,
    timeOffEntries,
    conflictGroups
  };
}
