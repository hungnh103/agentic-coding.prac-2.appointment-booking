import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth/admin-session";
import { createWorkScheduleEntry } from "@/lib/availability/admin-schedule-service";
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

    return {
      data: await createWorkScheduleEntry(
        {
          ...payload,
          doctorId
        },
        admin.id
      )
    };
  }, { routeName: "admin-create-work-schedule" });

  if (!response.ok) {
    return response;
  }

  return NextResponse.json(await response.json(), { status: 201 });
}
