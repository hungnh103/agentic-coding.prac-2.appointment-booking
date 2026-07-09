"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FormFeedback } from "@/components/ui/form-feedback";

type AppointmentDecisionDialogProps = {
  appointmentId: string;
  status: "pending" | "confirmed" | "canceled";
};

export function AppointmentDecisionDialog({
  appointmentId,
  status
}: AppointmentDecisionDialogProps) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState<"confirm" | "cancel" | null>(null);
  const disabled = status === "canceled" || submitting !== null;

  async function submit(endpoint: "confirm" | "cancel") {
    setSubmitting(endpoint);
    setError(undefined);

    try {
      const response = await fetch(`/api/admin/appointments/${appointmentId}/${endpoint}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: endpoint === "cancel" ? JSON.stringify({ reason }) : undefined
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error?.message ?? "Request failed.");
        return;
      }

      setReason("");
      router.refresh();
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="grid gap-3 rounded-[1.5rem] bg-brand-50 p-4">
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={disabled || status === "confirmed"}
          onClick={() => void submit("confirm")}
        >
          {submitting === "confirm" ? "Confirming..." : "Confirm"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={disabled || reason.trim().length < 3}
          onClick={() => void submit("cancel")}
        >
          {submitting === "cancel" ? "Canceling..." : "Cancel"}
        </Button>
      </div>
      <label className="grid gap-2 text-sm font-medium text-stone-700">
        Cancellation reason
        <textarea
          className="min-h-24 rounded-2xl border bg-white px-4 py-3"
          disabled={disabled}
          placeholder="Explain why this slot can no longer be honored."
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </label>
      <FormFeedback error={error} />
    </div>
  );
}
