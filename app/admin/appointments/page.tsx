import { AppointmentReviewTable } from "@/components/admin/appointment-review-table";
import { Button } from "@/components/ui/button";
import { listAdminAppointmentReview } from "@/lib/appointments/appointment-status-service";

type AdminAppointmentsPageProps = {
  searchParams?: Promise<{
    status?: "pending" | "confirmed" | "canceled";
    doctorId?: string;
    date?: string;
  }>;
};

export default async function AdminAppointmentsPage({
  searchParams
}: AdminAppointmentsPageProps) {
  const filters = (await searchParams) ?? {};
  const { appointments, doctors } = await listAdminAppointmentReview(filters);

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] bg-white/80 p-8 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">Appointments</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Admin appointment review</h1>
        <p className="mt-2 text-stone-600">
          Review pending bookings, confirm or cancel them, and jump directly into schedule management when a doctor becomes unavailable.
        </p>
        <form className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto]">
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Status
            <select className="rounded-2xl border bg-white px-4 py-3" defaultValue={filters.status ?? ""} name="status">
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="canceled">Canceled</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Doctor
            <select className="rounded-2xl border bg-white px-4 py-3" defaultValue={filters.doctorId ?? ""} name="doctorId">
              <option value="">All doctors</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.fullName}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Date
            <input className="rounded-2xl border bg-white px-4 py-3" defaultValue={filters.date ?? ""} name="date" type="date" />
          </label>
          <div className="flex items-end">
            <Button type="submit">Apply filters</Button>
          </div>
        </form>
      </section>
      <AppointmentReviewTable appointments={appointments} />
    </div>
  );
}
