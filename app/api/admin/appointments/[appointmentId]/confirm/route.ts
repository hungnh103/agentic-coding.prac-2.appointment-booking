import { requireAdminSession } from "@/lib/auth/admin-session";
import { confirmAppointmentByAdmin } from "@/lib/appointments/appointment-status-service";
import { withRouteHandler } from "@/lib/http/route-handler";
import { appointmentIdParamsSchema } from "@/lib/validation/appointments";

type RouteContext = {
  params: Promise<{
    appointmentId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  return withRouteHandler(async () => {
    const admin = await requireAdminSession(request);
    const params = appointmentIdParamsSchema.parse(await context.params);

    return {
      data: await confirmAppointmentByAdmin(params.appointmentId, admin.id)
    };
  }, { routeName: "admin-confirm-appointment" });
}
