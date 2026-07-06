import { StatusBadge } from "@/components/appointments/status-badge";

type AppointmentSummaryProps = {
  appointment: {
    referenceCode: string;
    appointmentDate: string;
    startTime: string;
    status: "pending" | "confirmed" | "canceled";
    patient: {
      fullName: string;
      phone: string;
      email?: string;
    };
    doctor: {
      fullName: string;
      specialty: string;
    };
  };
};

export function AppointmentSummary({ appointment }: AppointmentSummaryProps) {
  return (
    <section className="grid gap-6 rounded-[2rem] bg-white/80 p-8 shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">Appointment summary</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">{appointment.doctor.fullName}</h1>
          <p className="text-stone-600">{appointment.doctor.specialty}</p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[1.5rem] bg-brand-50 p-5">
          <dt className="text-sm text-stone-600">Reference</dt>
          <dd className="mt-1 text-xl font-semibold text-slate-950">{appointment.referenceCode}</dd>
        </div>
        <div className="rounded-[1.5rem] bg-brand-50 p-5">
          <dt className="text-sm text-stone-600">Date and time</dt>
          <dd className="mt-1 text-xl font-semibold text-slate-950">
            {appointment.appointmentDate} at {appointment.startTime}
          </dd>
        </div>
        <div className="rounded-[1.5rem] bg-white p-5 ring-1 ring-brand-100">
          <dt className="text-sm text-stone-600">Patient</dt>
          <dd className="mt-1 text-lg font-semibold text-slate-950">{appointment.patient.fullName}</dd>
        </div>
        <div className="rounded-[1.5rem] bg-white p-5 ring-1 ring-brand-100">
          <dt className="text-sm text-stone-600">Contact</dt>
          <dd className="mt-1 text-lg font-semibold text-slate-950">{appointment.patient.phone}</dd>
        </div>
        {appointment.patient.email ? (
          <div className="rounded-[1.5rem] bg-white p-5 ring-1 ring-brand-100">
            <dt className="text-sm text-stone-600">Email</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-950">{appointment.patient.email}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
