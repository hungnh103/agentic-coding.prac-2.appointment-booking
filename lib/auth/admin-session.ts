import { ApiError } from "@/lib/http/api-error";

type AdminSession = {
  id: string;
  email?: string | null;
  name?: string | null;
  role: string;
};

function getTestAdminSession(request?: Request): AdminSession | null {
  if (process.env.NODE_ENV !== "test") {
    return null;
  }

  if (request?.headers.get("x-test-admin") !== "true") {
    return null;
  }

  return {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    email: "admin@example.com",
    name: "Clinic Admin",
    role: "admin"
  };
}

export async function requireAdminSession(request?: Request) {
  const testSession = getTestAdminSession(request);
  if (testSession) {
    return testSession;
  }

  const { auth } = await import("@/auth");
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user || role !== "admin") {
    throw new ApiError(401, "UNAUTHORIZED", "Admin authentication is required.");
  }

  return {
    id: session.user.id ?? "local-admin",
    email: session.user.email,
    name: session.user.name,
    role
  } satisfies AdminSession;
}
