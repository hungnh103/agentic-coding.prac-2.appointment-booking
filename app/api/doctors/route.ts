import { withRouteHandler } from "@/lib/http/route-handler";
import { getActiveDoctors } from "@/lib/db/queries/doctors";

export async function GET() {
  return withRouteHandler(async () => ({
    data: await getActiveDoctors()
  }));
}

