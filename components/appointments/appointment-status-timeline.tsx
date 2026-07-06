type AppointmentStatusTimelineProps = {
  events: Array<{
    id: string;
    type: "confirmation" | "reminder" | "cancellation";
    status: "pending" | "sent" | "failed" | "skipped";
    scheduledFor: string;
  }>;
  statusCopy: string;
};

export function AppointmentStatusTimeline({
  events,
  statusCopy
}: AppointmentStatusTimelineProps) {
  return (
    <section className="grid gap-4 rounded-[2rem] bg-white/80 p-8 shadow-soft">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
          Status timeline
        </p>
        <p className="mt-2 text-stone-700">{statusCopy}</p>
      </div>
      <ol className="grid gap-3">
        {events.length === 0 ? (
          <li className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-stone-700">
            No notifications have been queued yet.
          </li>
        ) : (
          events.map((event) => (
            <li
              key={event.id}
              className="rounded-2xl border bg-white px-4 py-3 text-sm text-stone-700"
            >
              <span className="font-semibold capitalize">{event.type}</span> scheduled for{" "}
              {new Date(event.scheduledFor).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short"
              })}
              . Current state: <span className="font-semibold capitalize">{event.status}</span>.
            </li>
          ))
        )}
      </ol>
    </section>
  );
}
