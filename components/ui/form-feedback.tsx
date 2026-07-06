type FormFeedbackProps = {
  error?: string;
  hint?: string;
  success?: string;
};

export function FormFeedback({ error, hint, success }: FormFeedbackProps) {
  if (error) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  if (success) {
    return <p className="text-sm text-emerald-700">{success}</p>;
  }

  if (hint) {
    return <p className="text-sm text-stone-600">{hint}</p>;
  }

  return null;
}

