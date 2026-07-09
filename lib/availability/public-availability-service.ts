import { ApiError } from "@/lib/http/api-error";
import { filterAvailableSlots } from "@/lib/availability/availability-rules";
import { generateSlots } from "@/lib/availability/slot-generator";
import {
  getBookedSlots,
  getDoctorSchedules,
  getDoctorTimeOff
} from "@/lib/db/queries/availability";
import { getDoctor } from "@/lib/db/queries/doctors";

function getDayOfWeek(date: string) {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

export async function getPublicAvailability(doctorId: string, date: string) {
  const doctor = await getDoctor(doctorId);

  if (!doctor) {
    throw new ApiError(404, "DOCTOR_NOT_FOUND", "Doctor not found.");
  }

  const [schedules, bookedSlots, timeOffEntries] = await Promise.all([
    getDoctorSchedules(doctorId),
    getBookedSlots(doctorId, date),
    getDoctorTimeOff(doctorId)
  ]);
  const matchingSchedules = schedules.filter((schedule) => {
    const inDay = schedule.dayOfWeek === getDayOfWeek(date);
    const afterStart = schedule.effectiveFrom <= date;
    const beforeEnd = !schedule.effectiveTo || schedule.effectiveTo >= date;
    return inDay && afterStart && beforeEnd;
  });
  const dayStart = new Date(`${date}T00:00:00.000Z`);
  const dayEnd = new Date(`${date}T23:59:59.999Z`);
  const timeOffBlocks = timeOffEntries
    .filter((entry) => entry.startsAt < dayEnd && entry.endsAt > dayStart)
    .map((entry) => ({
      startTime: entry.startsAt.toISOString().slice(11, 16),
      endTime: entry.endsAt.toISOString().slice(11, 16)
    }));

  const slots = matchingSchedules.flatMap((schedule) =>
    filterAvailableSlots(
      generateSlots(schedule.startTime, schedule.endTime),
      bookedSlots.map((appointment) => ({ startTime: appointment.startTime })),
      timeOffBlocks
    )
  );

  return {
    doctor,
    date,
    slots: slots.map((slot) => ({
      ...slot,
      available: true
    }))
  };
}
