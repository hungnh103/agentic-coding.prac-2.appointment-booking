import { index, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const notificationTypeEnum = pgEnum("notification_type", ["confirmation", "reminder", "cancellation"]);
export const notificationChannelEnum = pgEnum("notification_channel", ["email"]);
export const notificationStatusEnum = pgEnum("notification_status", ["pending", "sent", "failed", "skipped"]);

export const notificationEvents = pgTable(
  "notification_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    appointmentId: uuid("appointment_id").notNull(),
    type: notificationTypeEnum("type").notNull(),
    channel: notificationChannelEnum("channel").default("email").notNull(),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull(),
    status: notificationStatusEnum("status").default("pending").notNull(),
    providerMessageId: text("provider_message_id"),
    failureReason: text("failure_reason"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    statusScheduleIdx: index("notification_events_status_schedule_idx").on(table.status, table.scheduledFor)
  })
);

