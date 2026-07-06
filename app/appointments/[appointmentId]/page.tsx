import { notFound } from "next/navigation";

import { AppointmentSummary } from "@/components/appointments/appointment-summary";
import { PageShell } from "@/components/ui/page-shell";
import { getAppointment } from "@/lib/db/queries/appointments";
import { getDoctor } from "@/lib/db/queries/doctors";
import { getPatient } from "@/lib/db/queries/patients";

type AppointmentPageProps = {
  params: Promise<{
    appointmentId: string;
  }>;
};

export default async function AppointmentPage({ params }: AppointmentPageProps) {
  const { appointmentId } = await params;
  const appointment = await getAppointment(appointmentId);

  if (!appointment) {
    notFound();
  }

  const [patient, doctor] = await Promise.all([
    getPatient(appointment.patientId),
    getDoctor(appointment.doctorId)
  ]);

  if (!patient || !doctor) {
    notFound();
  }

  return (
    <PageShell>
      <AppointmentSummary
        appointment={{
          ...appointment,
          patient,
          doctor
        }}
      />
    </PageShell>
  );
}

