import { z } from "zod";

export const createAppointmentSchema = z.object({
  doctorId: z.string().uuid(),
  appointmentDate: z.string().date(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  patient: z.object({
    fullName: z.string().trim().min(2).max(120),
    phone: z.string().trim().min(8).max(20),
    email: z.string().trim().email().optional().or(z.literal("")),
    notes: z.string().trim().max(500).optional()
  })
});

export const appointmentIdParamsSchema = z.object({
  appointmentId: z.string().uuid()
});

export const adminAppointmentFiltersSchema = z.object({
  status: z.enum(["pending", "confirmed", "canceled"]).optional(),
  doctorId: z.string().uuid().optional(),
  date: z.string().date().optional()
});

export const cancelAppointmentSchema = z.object({
  reason: z.string().trim().min(3).max(500)
});
