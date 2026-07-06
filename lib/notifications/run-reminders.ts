import { env } from "@/lib/config/env";
import {
  ConsoleEmailAdapter,
  NoopEmailAdapter,
  type EmailAdapter
} from "@/lib/notifications/email-adapter";
import { processPendingReminders } from "@/lib/notifications/reminder-service";

function getAdapter(): EmailAdapter {
  return env.EMAIL_PROVIDER === "noop" ? new NoopEmailAdapter() : new ConsoleEmailAdapter();
}

export async function runReminders(nowIso?: string) {
  return processPendingReminders(getAdapter(), nowIso);
}

