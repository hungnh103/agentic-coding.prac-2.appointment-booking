"use client";

import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[linear-gradient(180deg,#fffdf8_0%,#fff6ea_100%)]">
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-start justify-center gap-5 px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
            Something went wrong
          </p>
          <h1 className="text-4xl font-semibold text-slate-950">
            The clinic dashboard hit an unexpected error.
          </h1>
          <p className="max-w-xl text-stone-700">
            Try the action again. If the problem continues, inspect the server logs for the request that failed.
          </p>
          <button
            className="rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-soft"
            type="button"
            onClick={() => reset()}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
