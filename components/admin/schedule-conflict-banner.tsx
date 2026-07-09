type ScheduleConflictBannerProps = {
  conflicts: Array<{
    id: string;
    referenceCode: string;
    appointmentDate: string | Date;
    startTime: string;
    endTime: string;
    status: string;
  }>;
};

function formatDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    dateStyle: "medium"
  });
}

export function ScheduleConflictBanner({ conflicts }: ScheduleConflictBannerProps) {
  if (conflicts.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[2rem] border border-amber-300 bg-amber-50 p-5 text-amber-950 shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.24em]">Conflict warning</p>
      <p className="mt-2 text-sm">
        Existing appointments overlap at least one scheduled leave block and may need manual follow-up.
      </p>
      <ul className="mt-4 grid gap-2 text-sm">
        {conflicts.map((conflict) => (
          <li key={conflict.id} className="rounded-2xl bg-white px-4 py-3">
            {conflict.referenceCode} • {formatDate(conflict.appointmentDate)} •{" "}
            {conflict.startTime.slice(0, 5)} - {conflict.endTime.slice(0, 5)} • {conflict.status}
          </li>
        ))}
      </ul>
    </section>
  );
}
