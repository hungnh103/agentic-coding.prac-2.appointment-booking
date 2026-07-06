import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_DATABASE_URL: z.string().url().optional(),
  AUTH_SECRET: z.string().min(16),
  AUTH_TRUST_HOST: z.string().optional(),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
  EMAIL_FROM: z.string().email(),
  EMAIL_PROVIDER: z.enum(["console", "noop"]).default("console")
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL ?? "https://example.com/database",
  DIRECT_DATABASE_URL: process.env.DIRECT_DATABASE_URL ?? "https://example.com/direct-database",
  AUTH_SECRET: process.env.AUTH_SECRET ?? "development-secret-value",
  AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "admin@example.com",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "password123",
  EMAIL_FROM: process.env.EMAIL_FROM ?? "clinic@example.com",
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER
});
