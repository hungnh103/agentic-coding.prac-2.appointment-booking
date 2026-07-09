import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";

type AdminLoginPageProps = {
  searchParams?: Promise<{
    callbackUrl?: string;
    error?: string;
  }>;
};

async function loginAction(formData: FormData) {
  "use server";

  const callbackUrl = String(formData.get("callbackUrl") ?? "/admin/appointments");

  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: callbackUrl
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/admin/login?error=CredentialsSignin&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }

    throw error;
  }
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const session = await auth();
  if (session?.user) {
    redirect("/admin/appointments");
  }

  const params = (await searchParams) ?? {};
  const callbackUrl = params.callbackUrl ?? "/admin/appointments";

  return (
    <PageShell className="flex min-h-screen items-center justify-center">
      <section className="w-full max-w-md rounded-[2rem] bg-white/80 p-8 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">Admin access</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Clinic sign in</h1>
        <p className="mt-2 text-stone-600">
          Use the configured admin email and password from your environment variables.
        </p>
        <form className="mt-6 grid gap-4" action={loginAction}>
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Email
            <input className="rounded-2xl border bg-white px-4 py-3" type="email" name="email" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Password
            <input className="rounded-2xl border bg-white px-4 py-3" type="password" name="password" />
          </label>
          {params.error ? (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Invalid credentials. Check the configured admin email and password.
            </p>
          ) : null}
          <Button type="submit">Sign in</Button>
        </form>
      </section>
    </PageShell>
  );
}
