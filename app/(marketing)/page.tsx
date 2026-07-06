import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";

export default function MarketingPage() {
  return (
    <PageShell className="flex items-center">
      <section className="grid gap-8 rounded-[2rem] border border-white/60 bg-white/70 p-8 shadow-soft lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Dental and maxillofacial clinic</p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Book trusted specialist care with a calmer, clearer scheduling flow.
          </h1>
          <p className="max-w-2xl text-lg text-stone-700">
            Browse live doctor availability, request an appointment in minutes, and keep track of confirmations without phone-tag.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/doctors/11111111-1111-1111-1111-111111111111">Browse availability</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/admin/login">Admin access</Link>
            </Button>
          </div>
        </div>
        <aside className="grid gap-4 rounded-[1.75rem] bg-brand-50 p-6">
          <div className="rounded-[1.5rem] bg-white p-5">
            <p className="text-sm font-medium text-stone-500">Fast triage</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">30-minute slots</p>
          </div>
          <div className="rounded-[1.5rem] bg-white p-5">
            <p className="text-sm font-medium text-stone-500">Scheduling confidence</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">No duplicate active bookings</p>
          </div>
        </aside>
      </section>
    </PageShell>
  );
}
