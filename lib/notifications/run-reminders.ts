import { env } from "@/lib/config/env";
import {
  ConsoleEmailAdapter,
  NoopEmailAdapter,
  type EmailAdapter
} from "@/lib/notifications/email-adapter";
import { processPendingReminders } from "@/lib/notifications/reminder-service";
import { logInfo } from "@/lib/observability/logger";

function getAdapter(): EmailAdapter {
  return env.EMAIL_PROVIDER === "noop" ? new NoopEmailAdapter() : new ConsoleEmailAdapter();
}

export async function runReminders(nowIso?: string) {
  const result = await processPendingReminders(getAdapter(), nowIso);
  logInfo("notifications.reminders_processed", result);
  return result;
}
