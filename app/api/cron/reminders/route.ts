import { withRouteHandler } from "@/lib/http/route-handler";
import { runReminders } from "@/lib/notifications/run-reminders";

export async function GET() {
  return withRouteHandler(async () => ({
    data: await runReminders()
  }));
}

