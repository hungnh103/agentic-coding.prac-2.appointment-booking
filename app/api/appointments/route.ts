import { NextResponse } from "next/server";

import { withRouteHandler } from "@/lib/http/route-handler";
import { createBooking } from "@/lib/appointments/booking-service";

export async function POST(request: Request) {
  const response = await withRouteHandler(async () => {
    const payload = await request.json();
    return createBooking(payload);
  }, { routeName: "create-appointment" });

  if (!response.ok) {
    return response;
  }

  const payload = await response.json();
  return NextResponse.json(payload, { status: 201 });
}
