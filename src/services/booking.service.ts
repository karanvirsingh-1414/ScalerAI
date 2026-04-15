import { BookingStatus } from "@prisma/client";
import { addMinutes, format } from "date-fns";
import { prisma } from "@/lib/prisma";
import {
  createDefaultRescheduleToken,
  verifyRescheduleToken,
} from "@/lib/reschedule-token";
import { bookingSchema, rescheduleBookingSchema } from "@/lib/validators";
import { isPastTime } from "@/lib/time";
import { getDefaultUser } from "./user.service";
import { getEventTypeById } from "./event-type.service";

async function sendBookingEmail(to: string, subject: string, body: string) {
  if (!process.env.SMTP_HOST) return;
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? "587"),
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? "noreply@calclone.dev",
    to,
    subject,
    text: body,
  });
}

function getAppUrl() {
  return process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function getRescheduleUrl(eventSlug: string, bookingId: string, token: string) {
  const base = getAppUrl().replace(/\/$/, "");
  return `${base}/book/${eventSlug}/reschedule?bookingId=${bookingId}&token=${token}`;
}

function computeNoShowRisk(startTime: Date, guestCancelledRatio: number) {
  const hoursUntil = (startTime.getTime() - Date.now()) / (1000 * 60 * 60);
  let score = 10;
  const reasons: string[] = [];

  if (hoursUntil < 2) score += 40;
  else if (hoursUntil < 12) score += 25;
  else if (hoursUntil < 24) score += 15;
  else if (hoursUntil < 48) score += 8;
  if (hoursUntil < 24) reasons.push("Short notice");

  score += Math.round(guestCancelledRatio * 45);
  if (guestCancelledRatio >= 0.4) reasons.push("Frequent cancellations");

  const hour = startTime.getHours();
  if (hour < 9 || hour >= 19) {
    score += 10;
    reasons.push("Off-hours schedule");
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    reasons,
  };
}

export async function listBookings() {
  const user = await getDefaultUser();
  const now = new Date();
  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: { eventType: true },
    orderBy: { startTime: "asc" },
  });
  const guestStats = bookings.reduce<Record<string, { total: number; cancelled: number }>>(
    (acc, booking) => {
      const key = booking.guestEmail.toLowerCase();
      const existing = acc[key] ?? { total: 0, cancelled: 0 };
      existing.total += 1;
      if (booking.status === BookingStatus.CANCELLED) existing.cancelled += 1;
      acc[key] = existing;
      return acc;
    },
    {}
  );

  const withRisk = bookings.map((booking) => {
    const stats = guestStats[booking.guestEmail.toLowerCase()] ?? { total: 1, cancelled: 0 };
    const cancelRatio = stats.total > 0 ? stats.cancelled / stats.total : 0;
    const risk = computeNoShowRisk(booking.startTime, cancelRatio);
    return {
      ...booking,
      noShowRiskScore: risk.score,
      noShowRiskReasons: risk.reasons,
    };
  });

  return {
    upcoming: withRisk.filter((b) => b.startTime >= now && b.status === BookingStatus.SCHEDULED),
    past: withRisk.filter((b) => b.startTime < now || b.status === BookingStatus.CANCELLED),
  };
}

export async function createBooking(input: unknown) {
  const payload = bookingSchema.parse(input);
  const eventType = await getEventTypeById(payload.eventTypeId);
  if (!eventType) throw new Error("Invalid event type");

  const startTime = new Date(payload.startTimeIso);
  if (isPastTime(startTime)) throw new Error("Cannot book past times");

  const endTime = addMinutes(startTime, eventType.duration);
  const user = await getDefaultUser();

  const booking = await prisma.$transaction(async (tx) => {
    const overlapCount = await tx.booking.count({
      where: {
        eventTypeId: eventType.id,
        status: "SCHEDULED",
        OR: [
          { startTime: { lt: endTime, gte: startTime } },
          { endTime: { gt: startTime, lte: endTime } },
          { startTime: { lte: startTime }, endTime: { gte: endTime } },
        ],
      },
    });
    if (overlapCount > 0) throw new Error("This slot was just booked");

    return tx.booking.create({
      data: {
        eventTypeId: eventType.id,
        userId: user.id,
        guestName: payload.guestName,
        guestEmail: payload.guestEmail,
        guestTimezone: payload.guestTimezone,
        startTime,
        endTime,
        answers: payload.answers ?? {},
      },
      include: { eventType: true },
    });
  });

  const rescheduleToken = createDefaultRescheduleToken(booking.id, booking.guestEmail);
  const rescheduleUrl = getRescheduleUrl(booking.eventType.slug, booking.id, rescheduleToken);

  await sendBookingEmail(
    booking.guestEmail,
    `Booking confirmed: ${booking.eventType.title}`,
    [
      `${booking.eventType.title} on ${format(booking.startTime, "PPP p")}`,
      "",
      "Need to change the time?",
      `Reschedule here: ${rescheduleUrl}`,
    ].join("\n")
  );

  return {
    ...booking,
    rescheduleToken,
  };
}

export async function cancelBooking(id: string) {
  const user = await getDefaultUser();
  const existing = await prisma.booking.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("Booking not found");
  return prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED", cancellationReason: "Cancelled from dashboard" },
  });
}

export async function getBookingById(id: string) {
  const user = await getDefaultUser();
  const booking = await prisma.booking.findFirst({
    where: { id, userId: user.id },
    include: { eventType: true },
  });
  if (!booking) throw new Error("Booking not found");
  return booking;
}

export async function getBookingForPublicReschedule(id: string, token: string) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { eventType: true },
  });
  if (!booking) throw new Error("Booking not found");
  if (booking.status === BookingStatus.CANCELLED) throw new Error("Cancelled booking");
  const verification = verifyRescheduleToken(token, booking.id, booking.guestEmail);
  if (!verification.valid) throw new Error("Invalid or expired reschedule token");
  return {
    id: booking.id,
    guestName: booking.guestName,
    guestEmail: booking.guestEmail,
    guestTimezone: booking.guestTimezone,
    startTime: booking.startTime,
    eventType: {
      id: booking.eventType.id,
      title: booking.eventType.title,
      slug: booking.eventType.slug,
      duration: booking.eventType.duration,
    },
  };
}

export async function rescheduleBooking(id: string, input: unknown) {
  const user = await getDefaultUser();
  const payload = rescheduleBookingSchema.parse(input);
  const existing = await prisma.booking.findFirst({
    where: { id, userId: user.id },
    include: { eventType: true },
  });
  if (!existing) throw new Error("Booking not found");
  if (existing.status === BookingStatus.CANCELLED) {
    throw new Error("Cancelled bookings cannot be rescheduled");
  }

  const startTime = new Date(payload.startTimeIso);
  if (isPastTime(startTime)) throw new Error("Cannot reschedule to past times");
  const endTime = addMinutes(startTime, existing.eventType.duration);

  const overlapCount = await prisma.booking.count({
    where: {
      id: { not: existing.id },
      eventTypeId: existing.eventTypeId,
      status: BookingStatus.SCHEDULED,
      OR: [
        { startTime: { lt: endTime, gte: startTime } },
        { endTime: { gt: startTime, lte: endTime } },
        { startTime: { lte: startTime }, endTime: { gte: endTime } },
      ],
    },
  });
  if (overlapCount > 0) throw new Error("Selected slot is no longer available");

  const updated = await prisma.booking.update({
    where: { id: existing.id },
    data: { startTime, endTime },
    include: { eventType: true },
  });
  const rescheduleToken = createDefaultRescheduleToken(updated.id, updated.guestEmail);
  const rescheduleUrl = getRescheduleUrl(updated.eventType.slug, updated.id, rescheduleToken);

  await sendBookingEmail(
    updated.guestEmail,
    `Booking rescheduled: ${updated.eventType.title}`,
    [
      `${updated.eventType.title} moved to ${format(updated.startTime, "PPP p")}`,
      "",
      "Need another change?",
      `Reschedule here: ${rescheduleUrl}`,
    ].join("\n")
  );

  return updated;
}

export async function rescheduleBookingWithToken(id: string, token: string, input: unknown) {
  const payload = rescheduleBookingSchema.parse(input);
  const existing = await prisma.booking.findUnique({
    where: { id },
    include: { eventType: true },
  });
  if (!existing) throw new Error("Booking not found");
  if (existing.status === BookingStatus.CANCELLED) {
    throw new Error("Cancelled bookings cannot be rescheduled");
  }
  const verification = verifyRescheduleToken(token, existing.id, existing.guestEmail);
  if (!verification.valid) throw new Error("Invalid or expired reschedule token");

  const startTime = new Date(payload.startTimeIso);
  if (isPastTime(startTime)) throw new Error("Cannot reschedule to past times");
  const endTime = addMinutes(startTime, existing.eventType.duration);

  const overlapCount = await prisma.booking.count({
    where: {
      id: { not: existing.id },
      eventTypeId: existing.eventTypeId,
      status: BookingStatus.SCHEDULED,
      OR: [
        { startTime: { lt: endTime, gte: startTime } },
        { endTime: { gt: startTime, lte: endTime } },
        { startTime: { lte: startTime }, endTime: { gte: endTime } },
      ],
    },
  });
  if (overlapCount > 0) throw new Error("Selected slot is no longer available");

  const updated = await prisma.booking.update({
    where: { id: existing.id },
    data: { startTime, endTime },
    include: { eventType: true },
  });

  await sendBookingEmail(
    updated.guestEmail,
    `Booking rescheduled: ${updated.eventType.title}`,
    [
      `${updated.eventType.title} moved to ${format(updated.startTime, "PPP p")}`,
      "",
      "Need another change?",
      `Reschedule here: ${getRescheduleUrl(updated.eventType.slug, updated.id, token)}`,
    ].join("\n")
  );

  return updated;
}

export async function getBookingAnalytics() {
  const user = await getDefaultUser();
  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: { eventType: true },
    orderBy: { createdAt: "asc" },
  });

  const total = bookings.length;
  const scheduled = bookings.filter((booking) => booking.status === BookingStatus.SCHEDULED);
  const cancelled = bookings.filter((booking) => booking.status === BookingStatus.CANCELLED);
  const now = new Date();
  const future = scheduled.filter((booking) => booking.startTime >= now);
  const conversionRate = total > 0 ? (scheduled.length / total) * 100 : 0;

  const byEventTypeMap = new Map<string, { title: string; count: number }>();
  const byWeekday = Array.from({ length: 7 }, (_, day) => ({ day, count: 0 }));

  for (const booking of scheduled) {
    const existingType = byEventTypeMap.get(booking.eventTypeId);
    if (existingType) {
      existingType.count += 1;
    } else {
      byEventTypeMap.set(booking.eventTypeId, { title: booking.eventType.title, count: 1 });
    }
    byWeekday[booking.startTime.getDay()].count += 1;
  }

  const byEventType = Array.from(byEventTypeMap.values()).sort((a, b) => b.count - a.count);
  const busiestDay = [...byWeekday].sort((a, b) => b.count - a.count)[0] ?? { day: 0, count: 0 };
  const funnel = {
    totalRequests: total,
    scheduled: scheduled.length,
    upcoming: future.length,
  };

  return {
    totalBookings: total,
    scheduledBookings: scheduled.length,
    cancelledBookings: cancelled.length,
    upcomingBookings: future.length,
    cancellationRate: total > 0 ? (cancelled.length / total) * 100 : 0,
    conversionRate,
    busiestDay,
    byEventType,
    funnel,
  };
}
