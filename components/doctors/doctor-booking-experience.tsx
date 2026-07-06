"use client";

import { useState } from "react";

import { AvailabilityCalendar } from "@/components/availability/availability-calendar";
import { BookingForm } from "@/components/appointments/booking-form";
import type { SlotGridItem } from "@/components/availability/slot-grid";

type DoctorBookingExperienceProps = {
  doctorId: string;
  initialDate: string;
  initialSlot: SlotGridItem;
};

export function DoctorBookingExperience({
  doctorId,
  initialDate,
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
