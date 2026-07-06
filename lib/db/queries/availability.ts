import { listAppointmentsForDoctorOnDate, listSchedulesForDoctor } from "@/lib/db/mock-store";

export async function getDoctorSchedules(doctorId: string) {
  return listSchedulesForDoctor(doctorId);
}

export async function getBookedSlots(doctorId: string, appointmentDate: string) {
  return listAppointmentsForDoctorOnDate(doctorId, appointmentDate);
}

