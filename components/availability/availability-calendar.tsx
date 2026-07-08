"use client";

import { useEffect, useState } from "react";

import { SlotGrid, type SlotGridItem } from "@/components/availability/slot-grid";
import { Button } from "@/components/ui/button";
import { FormFeedback } from "@/components/ui/form-feedback";

type AvailabilityCalendarProps = {
  doctorId: string;
  initialDate: string;
  initialSlots: SlotGridItem[];
  onSelect: (slot: SlotGridItem, date: string) => void;
};

export function AvailabilityCalendar({ doctorId, initialDate, initialSlots, onSelect }: AvailabilityCalendarProps) {
  const [date, setDate] = useState(initialDate);
  const [slots, setSlots] = useState<SlotGridItem[]>(initialSlots);
  const [error, setError] = useState<string>();
  const [selectedStartTime, setSelectedStartTime] = useState<string>(initialSlots[0]?.startTime);

  useEffect(() => {
    if (date === initialDate) {
      setSlots(initialSlots);
      return;
    }

    const controller = new AbortController();

    async function loadAvailability() {
      setError(undefined);
      const response = await fetch(`/api/doctors/${doctorId}/availability?date=${date}`, {
        signal: controller.signal
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message ?? "Unable to load availability.");
        return;
      }

      setSlots(data.slots);
    }

    loadAvailability().catch(() => {
      setError("Unable to load availability.");
    });

    return () => controller.abort();
  }, [date, doctorId, initialDate, initialSlots]);

  return (
    <section className="space-y-4 rounded-[1.75rem] bg-white/80 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label className="grid gap-2 text-sm font-medium text-stone-700">
          Appointment date
          <input
            type="date"
            value={date}
            min={initialDate}
            className="rounded-2xl border bg-white px-4 py-3"
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
        <Button type="button" variant="ghost" onClick={() => setDate(initialDate)}>
          Reset to next available day
        </Button>
      </div>
      <FormFeedback error={error} hint="Choose a slot to prefill the booking request." />
      <SlotGrid
        slots={slots}
        selectedStartTime={selectedStartTime}
        onSelect={(slot) => {
          setSelectedStartTime(slot.startTime);
          onSelect(slot, date);
        }}
      />
    </section>
  );
}
