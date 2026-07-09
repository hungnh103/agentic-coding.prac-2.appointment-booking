import { requireAdminSession } from "@/lib/auth/admin-session";
import { cancelAppointmentByAdmin } from "@/lib/appointments/appointment-status-service";
import { withRouteHandler } from "@/lib/http/route-handler";
import {
  appointmentIdParamsSchema,
  cancelAppointmentSchema
} from "@/lib/validation/appointments";

type RouteContext = {
  params: Promise<{
    appointmentId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  return withRouteHandler(async () => {
    const admin = await requireAdminSession(request);
    const params = appointmentIdParamsSchema.parse(await context.params);
    const payload = cancelAppointmentSchema.parse(await request.json());

    return {
      data: await cancelAppointmentByAdmin(params.appointmentId, payload.reason, admin.id)
    };
  }, { routeName: "admin-cancel-appointment" });
}
