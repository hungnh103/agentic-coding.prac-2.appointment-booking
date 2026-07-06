import type { ReactNode } from "react";
import Link from "next/link";

import { PageShell } from "@/components/ui/page-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <PageShell className="space-y-8">
      <header className="rounded-[2rem] bg-slate-950 px-6 py-5 text-white shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-200">Admin Console</p>
            <h1 className="text-2xl font-semibold">Clinic scheduling operations</h1>
          </div>
          <nav className="flex gap-4 text-sm text-white/80">
            <Link href="/admin/appointments">Appointments</Link>
            <Link href="/">Public site</Link>
          </nav>
        </div>
      </header>
      {children}
    </PageShell>
  );
}

