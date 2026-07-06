import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const timeOffStatusEnum = pgEnum("time_off_status", ["scheduled", "canceled"]);

export const timeOff = pgTable("time_off", {
  id: uuid("id").defaultRandom().primaryKey(),
  doctorId: uuid("doctor_id").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  reason: text("reason").notNull(),
  status: timeOffStatusEnum("status").default("scheduled").notNull(),
  createdByAdminId: uuid("created_by_admin_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

