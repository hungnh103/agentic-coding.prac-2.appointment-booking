import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth/admin-session";
import { createTimeOffEntry } from "@/lib/availability/admin-schedule-service";
import { withRouteHandler } from "@/lib/http/route-handler";

type RouteContext = {
  params: Promise<{
    doctorId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const response = await withRouteHandler(async () => {
    const admin = await requireAdminSession(request);
    const { doctorId } = await context.params;
    const payload = await request.json();

    return await createTimeOffEntry(
      {
        ...payload,
        doctorId
      },
      admin.id
    );
  }, { routeName: "admin-create-time-off" });

  if (!response.ok) {
    return response;
  }

  return NextResponse.json(await response.json(), { status: 201 });
}
