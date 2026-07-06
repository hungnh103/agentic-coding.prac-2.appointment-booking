import { jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const appointmentActorTypeEnum = pgEnum("appointment_actor_type", ["patient", "admin", "system"]);

export const appointmentAuditLog = pgTable("appointment_audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  appointmentId: uuid("appointment_id").notNull(),
  actorType: appointmentActorTypeEnum("actor_type").notNull(),
  actorId: uuid("actor_id"),
  action: text("action").notNull(),
  details: jsonb("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

