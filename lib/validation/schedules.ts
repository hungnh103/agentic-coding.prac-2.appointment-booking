import { z } from "zod";

export const workScheduleSchema = z.object({
  doctorId: z.string().uuid(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  effectiveFrom: z.string().date(),
  effectiveTo: z.string().date().optional().or(z.literal(""))
});

export const timeOffSchema = z.object({
  doctorId: z.string().uuid(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  reason: z.string().trim().min(3).max(500)
});
