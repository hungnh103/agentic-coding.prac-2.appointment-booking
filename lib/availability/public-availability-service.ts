import { ApiError } from "@/lib/http/api-error";
import { filterAvailableSlots } from "@/lib/availability/availability-rules";
import { generateSlots } from "@/lib/availability/slot-generator";
import { getBookedSlots, getDoctorSchedules } from "@/lib/db/queries/availability";
import { getDoctor } from "@/lib/db/queries/doctors";

function getDayOfWeek(date: string) {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

export async function getPublicAvailability(doctorId: string, date: string) {
  const doctor = await getDoctor(doctorId);

  if (!doctor) {
    throw new ApiError(404, "DOCTOR_NOT_FOUND", "Doctor not found.");
  }

  const schedules = await getDoctorSchedules(doctorId);
  const matchingSchedules = schedules.filter((schedule) => schedule.dayOfWeek === getDayOfWeek(date));
  const bookedSlots = await getBookedSlots(doctorId, date);

  const slots = matchingSchedules.flatMap((schedule) =>
    filterAvailableSlots(
      generateSlots(schedule.startTime, schedule.endTime),
      bookedSlots.map((appointment) => ({ startTime: appointment.startTime })),
      []
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

