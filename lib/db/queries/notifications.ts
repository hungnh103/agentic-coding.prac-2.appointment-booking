import { and, asc, eq, lte } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { notificationEvents } from "@/lib/db/schema";

type CreateNotificationEventInput = {
  appointmentId: string;
  type: "confirmation" | "reminder" | "cancellation";
  scheduledFor: string;
  status?: "pending" | "sent" | "failed" | "skipped";
  providerMessageId?: string;
  failureReason?: string;
  sentAt?: string;
};

export async function insertNotificationEvent(input: CreateNotificationEventInput) {
  const db = await getDb();
  const [event] = await db
    .insert(notificationEvents)
    .values({
      ...input,
      scheduledFor: new Date(input.scheduledFor),
      sentAt: input.sentAt ? new Date(input.sentAt) : undefined
    })
    .returning();
  return event;
}

export async function getNotificationEventsForAppointment(appointmentId: string) {
  const db = await getDb();
  return db
    .select()
    .from(notificationEvents)
    .where(eq(notificationEvents.appointmentId, appointmentId))
    .orderBy(asc(notificationEvents.scheduledFor));
}

export async function getPendingReminderEvents(atIso: string) {
  const db = await getDb();
  return db
    .select()
    .from(notificationEvents)
    .where(
      and(
        eq(notificationEvents.type, "reminder"),
        eq(notificationEvents.status, "pending"),
        lte(notificationEvents.scheduledFor, new Date(atIso))
      )
    );
}

export async function patchNotificationEvent(
  notificationEventId: string,
  input: Partial<{
    status: "pending" | "sent" | "failed" | "skipped";
    providerMessageId: string;
    failureReason: string;
    sentAt: string;
  }>
) {
  const db = await getDb();
  const [event] = await db
    .update(notificationEvents)
    .set({
      ...input,
      sentAt: input.sentAt ? new Date(input.sentAt) : undefined,
      updatedAt: new Date()
    })
    .where(eq(notificationEvents.id, notificationEventId))
    .returning();

  return event ?? null;
}
