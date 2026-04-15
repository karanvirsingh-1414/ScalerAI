import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const eventTypeSchema = z.object({
  title: z.string().min(3),
  description: z.string().max(1000).optional().or(z.literal("")),
  duration: z.coerce.number().int().min(5).max(480),
  bufferBefore: z.coerce.number().int().min(0).max(120).default(0),
  bufferAfter: z.coerce.number().int().min(0).max(120).default(0),
  customQuestions: z
    .array(
      z.object({
        label: z.string().min(2),
        required: z.boolean().default(false),
      })
    )
    .optional(),
});

export const availabilityEntrySchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(timeRegex),
    endTime: z.string().regex(timeRegex),
    isEnabled: z.boolean().default(true),
    timezone: z.string().min(1),
  })
  .refine((value) => value.startTime < value.endTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export const availabilitySchema = z.object({
  timezone: z.string().min(1),
  slots: z.array(availabilityEntrySchema).min(1),
});

export const bookingSchema = z.object({
  eventTypeId: z.string().min(1),
  date: z.string().min(1),
  startTimeIso: z.string().datetime(),
  guestName: z.string().min(2),
  guestEmail: z.string().email(),
  guestTimezone: z.string().min(1),
  answers: z.record(z.string(), z.string()).optional(),
});

export const rescheduleBookingSchema = z.object({
  startTimeIso: z.string().datetime(),
});
