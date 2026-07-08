import { ApiError } from "@/lib/http/api-error";
import { withRouteHandler } from "@/lib/http/route-handler";
import { getPublicAvailability } from "@/lib/availability/public-availability-service";

type RouteContext = {
  params: Promise<{
    doctorId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  return withRouteHandler(async () => {
    const params = await context.params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      throw new ApiError(400, "INVALID_DATE", "date is required");
    }

    const availability = await getPublicAvailability(params.doctorId, date);

    return {
      doctorId: availability.doctor.id,
      date: availability.date,
      slots: availability.slots
    };
  }, { routeName: "doctor-availability" });
}
