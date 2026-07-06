import { notFound } from "next/navigation";

import { AppointmentStatusTimeline } from "@/components/appointments/appointment-status-timeline";
import { AppointmentSummary } from "@/components/appointments/appointment-summary";
import { PageShell } from "@/components/ui/page-shell";
import { getAppointmentDetail } from "@/lib/appointments/appointment-detail-service";

type AppointmentPageProps = {
  params: Promise<{
    appointmentId: string;
  }>;
};

export default async function AppointmentPage({ params }: AppointmentPageProps) {
  const { appointmentId } = await params;
  try {
    const appointment = await getAppointmentDetail(appointmentId);

    return (
      <PageShell className="grid gap-6">
        <AppointmentSummary appointment={appointment} />
        <AppointmentStatusTimeline
          events={appointment.notifications}
          statusCopy={appointment.statusCopy}
        />
      </PageShell>
    );
  } catch {
    notFound();
  }
}
