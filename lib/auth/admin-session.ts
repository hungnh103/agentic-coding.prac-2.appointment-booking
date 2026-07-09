import { ApiError } from "@/lib/http/api-error";
import { env } from "@/lib/config/env";
import { z } from "zod";

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
    id: env.ADMIN_USER_ID,
    email: "admin@example.com",
    name: "Clinic Admin",
    role: "admin"
  };
}

export async function requireAdminSession(request?: Request): Promise<AdminSession> {
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

  const sessionUserId = session.user.id;
  const parsedAdminId = z.string().uuid().safeParse(sessionUserId);
  const normalizedAdminId = parsedAdminId.success ? parsedAdminId.data : env.ADMIN_USER_ID;

  return {
    id: normalizedAdminId,
    email: session.user.email,
    name: session.user.name,
    role: "admin"
  } satisfies AdminSession;
}
