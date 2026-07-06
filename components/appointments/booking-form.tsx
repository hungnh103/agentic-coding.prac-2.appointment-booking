"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { FormFeedback } from "@/components/ui/form-feedback";
import { createAppointmentSchema } from "@/lib/validation/appointments";

type BookingFormValues = {
  doctorId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  patient: {
    fullName: string;
    phone: string;
    email?: string;
    notes?: string;
  };
};

type BookingFormProps = {
  doctorId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
};

export function BookingForm({ doctorId, appointmentDate, startTime, endTime }: BookingFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string>();
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: {
      doctorId,
      appointmentDate,
      startTime,
      endTime,
      patient: {
        fullName: "",
        phone: "",
        email: "",
        notes: ""
      }
    }
  });

  useEffect(() => {
    form.setValue("doctorId", doctorId);
    form.setValue("appointmentDate", appointmentDate);
    form.setValue("startTime", startTime);
    form.setValue("endTime", endTime);
  }, [appointmentDate, doctorId, endTime, form, startTime]);

  async function onSubmit(values: BookingFormValues) {
    setSubmitError(undefined);
    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });
    const result = await response.json();

    if (!response.ok) {
      setSubmitError(result.error?.message ?? "Unable to create booking.");
      return;
    }

    router.push(`/appointments/${result.data.id}`);
  }

  return (
    <form className="space-y-4 rounded-[1.75rem] bg-white/80 p-6" onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">Booking request</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Reserve this appointment</h2>
      </div>
      <input type="hidden" {...form.register("doctorId")} value={doctorId} />
      <input type="hidden" {...form.register("appointmentDate")} value={appointmentDate} />
      <input type="hidden" {...form.register("startTime")} value={startTime} />
      <input type="hidden" {...form.register("endTime")} value={endTime} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-stone-700">
          Full name
          <input className="rounded-2xl border bg-white px-4 py-3" {...form.register("patient.fullName")} />
          <FormFeedback error={form.formState.errors.patient?.fullName?.message} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-stone-700">
          Phone
          <input className="rounded-2xl border bg-white px-4 py-3" {...form.register("patient.phone")} />
          <FormFeedback error={form.formState.errors.patient?.phone?.message} />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium text-stone-700">
        Email
        <input className="rounded-2xl border bg-white px-4 py-3" {...form.register("patient.email")} />
        <FormFeedback error={form.formState.errors.patient?.email?.message} />
      </label>
      <label className="grid gap-2 text-sm font-medium text-stone-700">
        Notes
        <textarea className="min-h-28 rounded-2xl border bg-white px-4 py-3" {...form.register("patient.notes")} />
      </label>
      <div className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-stone-700">
        Requested slot: <span className="font-semibold">{appointmentDate}</span> at <span className="font-semibold">{startTime}</span>
      </div>
      <FormFeedback error={submitError} />
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Submitting..." : "Book appointment"}
      </Button>
    </form>
  );
}
