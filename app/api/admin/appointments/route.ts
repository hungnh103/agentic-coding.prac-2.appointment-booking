import { requireAdminSession } from "@/lib/auth/admin-session";
import { listAdminAppointmentReview } from "@/lib/appointments/appointment-status-service";
import { withRouteHandler } from "@/lib/http/route-handler";
import { adminAppointmentFiltersSchema } from "@/lib/validation/appointments";

export async function GET(request: Request) {
  return withRouteHandler(async () => {
    await requireAdminSession(request);

    const { searchParams } = new URL(request.url);
    const filters = adminAppointmentFiltersSchema.parse({
      status: searchParams.get("status") ?? undefined,
      doctorId: searchParams.get("doctorId") ?? undefined,
      date: searchParams.get("date") ?? undefined
    });
    const { appointments } = await listAdminAppointmentReview(filters);

    return {
      data: appointments
    };
  }, { routeName: "admin-list-appointments" });
}
