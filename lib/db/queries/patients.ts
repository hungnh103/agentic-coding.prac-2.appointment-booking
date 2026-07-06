import { createPatient, getPatientById } from "@/lib/db/mock-store";

type CreatePatientInput = {
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
};

export async function insertPatient(input: CreatePatientInput) {
  return createPatient(input);
}

export async function getPatient(patientId: string) {
  return getPatientById(patientId);
}

