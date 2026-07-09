"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FormFeedback } from "@/components/ui/form-feedback";

type TimeOffFormProps = {
  doctorId: string;
};

export function TimeOffForm({ doctorId }: TimeOffFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    startsAt: "",
    endsAt: "",
    reason: ""
  });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(undefined);
    setNotice(undefined);

    try {
      const response = await fetch(`/api/admin/doctors/${doctorId}/time-off`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error?.message ?? "Unable to save leave.");
        return;
      }

      if (payload.conflicts?.length) {
        setNotice(`${payload.conflicts.length} appointment(s) overlap this leave window.`);
      }

      setForm({
        startsAt: "",
        endsAt: "",
        reason: ""
      });
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4 rounded-[2rem] bg-white/85 p-6 shadow-soft" onSubmit={onSubmit}>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">Leave management</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">Block doctor time off</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-stone-700">
          Starts at
          <input
            className="rounded-2xl border bg-white px-4 py-3"
            type="datetime-local"
            value={form.startsAt}
            onChange={(event) => setForm((current) => ({ ...current, startsAt: event.target.value }))}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-stone-700">
          Ends at
          <input
            className="rounded-2xl border bg-white px-4 py-3"
            type="datetime-local"
            value={form.endsAt}
            onChange={(event) => setForm((current) => ({ ...current, endsAt: event.target.value }))}
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium text-stone-700">
        Reason
        <textarea
          className="min-h-24 rounded-2xl border bg-white px-4 py-3"
          value={form.reason}
          onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
        />
      </label>
      {notice ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{notice}</p>
      ) : null}
      <FormFeedback error={error} />
      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Save leave"}
      </Button>
    </form>
  );
}
