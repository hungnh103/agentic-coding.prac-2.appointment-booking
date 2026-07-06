import { createAppointment, getAppointmentById } from "@/lib/db/mock-store";

type CreateAppointmentInput = {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
};

export async function insertAppointment(input: CreateAppointmentInput) {
  return createAppointment(input);
}

export async function getAppointment(appointmentId: string) {
  return getAppointmentById(appointmentId);
}

