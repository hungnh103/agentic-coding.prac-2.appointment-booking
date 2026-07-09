"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FormFeedback } from "@/components/ui/form-feedback";

type WorkScheduleFormProps = {
  doctorId: string;
};

export function WorkScheduleForm({ doctorId }: WorkScheduleFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    dayOfWeek: "1",
    startTime: "09:00",
    endTime: "16:00",
    effectiveFrom: new Date().toISOString().slice(0, 10),
    effectiveTo: ""
  });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(undefined);

    try {
      const response = await fetch(`/api/admin/doctors/${doctorId}/work-schedules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          dayOfWeek: Number(form.dayOfWeek),
          startTime: form.startTime,
          endTime: form.endTime,
          effectiveFrom: form.effectiveFrom,
          effectiveTo: form.effectiveTo || undefined
        })
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error?.message ?? "Unable to save schedule.");
        return;
      }

      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4 rounded-[2rem] bg-white/85 p-6 shadow-soft" onSubmit={onSubmit}>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">Work schedule</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">Add weekly availability</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-stone-700">
          Day of week
          <select
            className="rounded-2xl border bg-white px-4 py-3"
            value={form.dayOfWeek}
            onChange={(event) => setForm((current) => ({ ...current, dayOfWeek: event.target.value }))}
          >
            <option value="0">Sunday</option>
            <option value="1">Monday</option>
            <option value="2">Tuesday</option>
            <option value="3">Wednesday</option>
            <option value="4">Thursday</option>
            <option value="5">Friday</option>
            <option value="6">Saturday</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-stone-700">
          Effective from
          <input
            className="rounded-2xl border bg-white px-4 py-3"
            type="date"
            value={form.effectiveFrom}
            onChange={(event) => setForm((current) => ({ ...current, effectiveFrom: event.target.value }))}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-stone-700">
          Start time
          <input
            className="rounded-2xl border bg-white px-4 py-3"
            type="time"
            step={1800}
            value={form.startTime}
            onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-stone-700">
          End time
          <input
            className="rounded-2xl border bg-white px-4 py-3"
            type="time"
            step={1800}
            value={form.endTime}
            onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))}
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium text-stone-700">
        Effective to
        <input
          className="rounded-2xl border bg-white px-4 py-3"
          type="date"
          value={form.effectiveTo}
          onChange={(event) => setForm((current) => ({ ...current, effectiveTo: event.target.value }))}
        />
      </label>
      <FormFeedback error={error} />
      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Save schedule"}
      </Button>
    </form>
  );
}
