import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const doctors = pgTable("doctors", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  fullName: text("full_name").notNull(),
  specialty: text("specialty").notNull(),
  bio: text("bio"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

