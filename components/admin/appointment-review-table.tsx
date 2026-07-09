import Link from "next/link";
import type { Route } from "next";

import { AppointmentDecisionDialog } from "@/components/admin/appointment-decision-dialog";
import { StatusBadge } from "@/components/appointments/status-badge";

type AdminAppointmentRow = {
  id: string;
  referenceCode: string;
  doctorId: string;
  appointmentDate: string | Date;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "canceled";
  cancellationReason: string | null;
  patientName: string;
  patientPhone: string;
  patientEmail: string | null;
  doctorName: string;
  doctorSpecialty: string;
};

type AppointmentReviewTableProps = {
  appointments: AdminAppointmentRow[];
};

function formatDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    dateStyle: "medium"
  });
}

export function AppointmentReviewTable({ appointments }: AppointmentReviewTableProps) {
  if (appointments.length === 0) {
    return (
      <section className="rounded-[2rem] bg-white/80 p-6 shadow-soft">
        <p className="text-sm text-stone-600">No appointments match the current filter.</p>
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      {appointments.map((appointment) => (
        <article
          key={appointment.id}
          className="grid gap-5 rounded-[2rem] bg-white/85 p-6 shadow-soft lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={appointment.status} />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                {appointment.referenceCode}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">{appointment.patientName}</h2>
              <p className="text-sm text-stone-600">
                {appointment.patientPhone}
                {appointment.patientEmail ? ` • ${appointment.patientEmail}` : ""}
              </p>
            </div>
            <dl className="grid gap-3 text-sm text-stone-700 sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-slate-950">Doctor</dt>
                <dd>{appointment.doctorName}</dd>
                <dd className="text-stone-500">{appointment.doctorSpecialty}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-950">Slot</dt>
                <dd>{formatDate(appointment.appointmentDate)}</dd>
                <dd>{appointment.startTime.slice(0, 5)} - {appointment.endTime.slice(0, 5)}</dd>
              </div>
            </dl>
            {appointment.cancellationReason ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                Cancellation reason: {appointment.cancellationReason}
              </p>
            ) : null}
            <Link
              className="text-sm font-semibold text-brand-700 underline-offset-4 hover:underline"
              href={`/admin/doctors/${appointment.doctorId}/schedule` as Route}
            >
              Open doctor schedule
            </Link>
          </div>
          <AppointmentDecisionDialog
            appointmentId={appointment.id}
            status={appointment.status}
          />
        </article>
      ))}
    </section>
  );
}
