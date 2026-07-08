import { PageShell } from "@/components/ui/page-shell";
import { DoctorBookingExperience } from "@/components/doctors/doctor-booking-experience";
import { getDefaultBookingDate } from "@/lib/appointments/booking-service";
import { getPublicAvailability } from "@/lib/availability/public-availability-service";

type DoctorPageProps = {
  params: Promise<{
    doctorId: string;
  }>;
};

export default async function DoctorPage({ params }: DoctorPageProps) {
  const { doctorId } = await params;
  const defaultDate = getDefaultBookingDate();
  const availability = await getPublicAvailability(doctorId, defaultDate);
  const initialSlot = availability.slots[0] ?? { startTime: "09:00", endTime: "09:30", available: true };

  return (
    <PageShell className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-6">
        <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-200">Doctor availability</p>
          <h1 className="mt-3 text-4xl font-semibold">{availability.doctor.fullName}</h1>
          <p className="mt-2 text-lg text-white/75">{availability.doctor.specialty}</p>
          <p className="mt-4 max-w-2xl text-white/70">{availability.doctor.bio}</p>
        </div>
        <DoctorBookingExperience
          doctorId={doctorId}
          initialDate={defaultDate}
          initialSlots={availability.slots}
          initialSlot={initialSlot}
        />
      </section>
    </PageShell>
  );
}
