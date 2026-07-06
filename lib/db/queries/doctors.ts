import { getDoctorById, listDoctors } from "@/lib/db/mock-store";

export async function getActiveDoctors() {
  return listDoctors();
}

export async function getDoctor(doctorId: string) {
  return getDoctorById(doctorId);
}

