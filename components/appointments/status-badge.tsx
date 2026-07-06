import { cn } from "@/lib/utils";

const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  canceled: "bg-stone-200 text-stone-700"
} as const;

type AppointmentStatus = keyof typeof statusStyles;

type StatusBadgeProps = {
  status: AppointmentStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]", statusStyles[status])}>
      {status}
    </span>
  );
}

