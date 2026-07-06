import { randomUUID } from "node:crypto";

export type DoctorRecord = {
  id: string;
  slug: string;
  fullName: string;
  specialty: string;
  bio: string;
  isActive: boolean;
};

export type WorkScheduleRecord = {
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
};

export type AppointmentRecord = {
  id: string;
  referenceCode: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "canceled";
  createdAt: string;
  updatedAt: string;
};

export type PatientRecord = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
};

const doctors: DoctorRecord[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    slug: "dr-lan-ngo",
    fullName: "Dr. Lan Ngo",
    specialty: "Dental Surgery",
    bio: "Restorative consultations and preventive treatment planning.",
    isActive: true
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    slug: "dr-minh-tran",
    fullName: "Dr. Minh Tran",
    specialty: "Maxillofacial Surgery",
    bio: "Jaw, facial, and oral surgery coordination for complex cases.",
    isActive: true
  }
];

const workSchedules: WorkScheduleRecord[] = doctors.flatMap((doctor) =>
  [1, 2, 3, 4, 5].map((day) => ({
    doctorId: doctor.id,
    dayOfWeek: day,
    startTime: "09:00",
    endTime: "16:00",
    effectiveFrom: "2026-01-01",
    isActive: true
  }))
);

const patients: PatientRecord[] = [];
const appointments: AppointmentRecord[] = [];

export function listDoctors() {
  return doctors.filter((doctor) => doctor.isActive);
}

export function getDoctorById(doctorId: string) {
  return doctors.find((doctor) => doctor.id === doctorId && doctor.isActive) ?? null;
}

export function listSchedulesForDoctor(doctorId: string) {
  return workSchedules.filter((schedule) => schedule.doctorId === doctorId && schedule.isActive);
}

export function listAppointmentsForDoctorOnDate(doctorId: string, appointmentDate: string) {
  return appointments.filter(
    (appointment) =>
      appointment.doctorId === doctorId &&
      appointment.appointmentDate === appointmentDate &&
      appointment.status !== "canceled"
  );
}

export function createPatient(input: Omit<PatientRecord, "id">) {
  const patient = {
    ...input,
    id: randomUUID()
  };
  patients.push(patient);
  return patient;
}

export function createAppointment(
  input: Omit<AppointmentRecord, "id" | "referenceCode" | "createdAt" | "updatedAt" | "status">
) {
  const now = new Date().toISOString();
  const appointment: AppointmentRecord = {
    ...input,
    id: randomUUID(),
    referenceCode: `APPT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    status: "pending",
    createdAt: now,
    updatedAt: now
  };
  appointments.push(appointment);
  return appointment;
}

export function getAppointmentById(appointmentId: string) {
  return appointments.find((appointment) => appointment.id === appointmentId) ?? null;
}

export function getPatientById(patientId: string) {
  return patients.find((patient) => patient.id === patientId) ?? null;
}

export function resetMockStore() {
  patients.splice(0, patients.length);
  appointments.splice(0, appointments.length);
}
