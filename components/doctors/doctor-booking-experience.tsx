"use client";

import { useState } from "react";

import { AvailabilityCalendar } from "@/components/availability/availability-calendar";
import { BookingForm } from "@/components/appointments/booking-form";
import type { SlotGridItem } from "@/components/availability/slot-grid";

type DoctorBookingExperienceProps = {
  doctorId: string;
  initialDate: string;
  initialSlots: SlotGridItem[];
  initialSlot: SlotGridItem;
};

export function DoctorBookingExperience({
  doctorId,
  initialDate,
  initialSlots,
  initialSlot
}: DoctorBookingExperienceProps) {
  const [selection, setSelection] = useState({
    date: initialDate,
    startTime: initialSlot.startTime,
    endTime: initialSlot.endTime
  });

  return (
    <>
      <AvailabilityCalendar
        doctorId={doctorId}
        initialDate={initialDate}
        initialSlots={initialSlots}
        onSelect={(slot, date) => {
          setSelection({
            date,
            startTime: slot.startTime,
            endTime: slot.endTime
          });
        }}
      />
      <BookingForm
        doctorId={doctorId}
        appointmentDate={selection.date}
        startTime={selection.startTime}
        endTime={selection.endTime}
      />
    </>
  );
}
