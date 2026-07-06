import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SlotGridItem = {
  startTime: string;
  endTime: string;
  available: boolean;
};

type SlotGridProps = {
  slots: SlotGridItem[];
  selectedStartTime?: string;
  onSelect?: (slot: SlotGridItem) => void;
};

export function SlotGrid({ slots, selectedStartTime, onSelect }: SlotGridProps) {
  if (slots.length === 0) {
    return <p className="rounded-3xl bg-white/70 p-6 text-sm text-stone-600">No bookable slots remain for this date.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {slots.map((slot) => {
        const selected = slot.startTime === selectedStartTime;

        return (
          <Button
            key={slot.startTime}
            type="button"
            variant={selected ? "primary" : "secondary"}
            className={cn("justify-between rounded-2xl px-4 py-3 text-left", !slot.available && "opacity-50")}
            disabled={!slot.available}
            onClick={() => onSelect?.(slot)}
          >
            <span>{slot.startTime}</span>
          </Button>
        );
      })}
    </div>
  );
}

