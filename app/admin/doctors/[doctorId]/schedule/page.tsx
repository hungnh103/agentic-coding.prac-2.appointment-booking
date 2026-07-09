import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";

import { ScheduleConflictBanner } from "@/components/admin/schedule-conflict-banner";
import { TimeOffForm } from "@/components/admin/time-off-form";
import { WorkScheduleForm } from "@/components/admin/work-schedule-form";
import { getDoctorScheduleManagement } from "@/lib/availability/admin-schedule-service";

type AdminDoctorSchedulePageProps = {
  params: Promise<{
    doctorId: string;
  }>;
};

function formatDateTime(value: Date) {
  return value.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

const weekdayLabel = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function AdminDoctorSchedulePage({
  params
}: AdminDoctorSchedulePageProps) {
  const { doctorId } = await params;

  try {
    const data = await getDoctorScheduleManagement(doctorId);
    const conflictAppointments = data.conflictGroups.flatMap((group) => group.conflicts);

    return (
      <div className="grid gap-6">
        <section className="rounded-[2rem] bg-white/85 p-8 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">Doctor scheduling</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">{data.doctor.fullName}</h1>
          <p className="mt-2 text-stone-600">{data.doctor.specialty}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link className="font-semibold text-brand-700 underline-offset-4 hover:underline" href="/admin/appointments">
              Back to appointments
            </Link>
            {data.doctors.map((doctor) => (
              <Link
                key={doctor.id}
                className="rounded-full border border-brand-200 px-4 py-2 text-stone-700"
                href={`/admin/doctors/${doctor.id}/schedule` as Route}
              >
                {doctor.fullName}
              </Link>
            ))}
          </div>
        </section>
        <ScheduleConflictBanner conflicts={conflictAppointments} />
        <section className="grid gap-6 xl:grid-cols-2">
          <WorkScheduleForm doctorId={doctorId} />
          <TimeOffForm doctorId={doctorId} />
        </section>
        <section className="grid gap-6 xl:grid-cols-2">
          <article className="rounded-[2rem] bg-white/85 p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-950">Current work schedules</h2>
            <ul className="mt-4 grid gap-3">
              {data.schedules.map((schedule) => (
                <li key={schedule.id} className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-stone-700">
                  {weekdayLabel[schedule.dayOfWeek]} • {schedule.startTime.slice(0, 5)} -{" "}
                  {schedule.endTime.slice(0, 5)} • active from {schedule.effectiveFrom}
                  {schedule.effectiveTo ? ` until ${schedule.effectiveTo}` : ""}
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-[2rem] bg-white/85 p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-950">Upcoming leave</h2>
            <ul className="mt-4 grid gap-3">
              {data.timeOffEntries.length === 0 ? (
                <li className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-stone-700">
                  No leave blocks have been scheduled.
                </li>
              ) : (
                data.timeOffEntries.map((entry) => (
                  <li key={entry.id} className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-stone-700">
                    {formatDateTime(entry.startsAt)} to {formatDateTime(entry.endsAt)} • {entry.reason}
                  </li>
                ))
              )}
            </ul>
          </article>
        </section>
      </div>
    );
  } catch {
    notFound();
  }
}
