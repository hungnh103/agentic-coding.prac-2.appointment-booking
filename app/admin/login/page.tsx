import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";

export default function AdminLoginPage() {
  return (
    <PageShell className="flex min-h-screen items-center justify-center">
      <section className="w-full max-w-md rounded-[2rem] bg-white/80 p-8 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">Admin access</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Clinic sign in</h1>
        <p className="mt-2 text-stone-600">
          Use the configured admin email and password from your environment variables.
        </p>
        <form className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Email
            <input className="rounded-2xl border bg-white px-4 py-3" type="email" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Password
            <input className="rounded-2xl border bg-white px-4 py-3" type="password" />
          </label>
          <Button type="submit">Sign in</Button>
        </form>
      </section>
    </PageShell>
  );
}

