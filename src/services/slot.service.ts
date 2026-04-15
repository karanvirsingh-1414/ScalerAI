import { addMinutes, format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { fromMinutes, isPastTime, toMinutes, utcToZonedTimeLabel, zonedDateTimeToUtc } from "@/lib/time";
import { getEventTypeById } from "./event-type.service";

export async function getSlotsForDate(date: string, eventTypeId: string, excludeBookingId?: string) {
  const eventType = await getEventTypeById(eventTypeId);
  if (!eventType) {
    throw new Error("Invalid event type");
  }

  const host = await prisma.user.findUnique({ where: { id: eventType.userId } });
  if (!host) return [];

  const requestedDate = new Date(`${date}T00:00:00`);
  const weekday = requestedDate.getDay();

  const blockedDate = await prisma.dateOverride.findFirst({
    where: { userId: host.id, date: requestedDate, isBlocked: true },
  });
  if (blockedDate) return [];

  const availability = await prisma.availability.findMany({
    where: { userId: host.id, dayOfWeek: weekday, isEnabled: true },
    orderBy: { startTime: "asc" },
  });

  if (!availability.length) return [];

  const bookings = await prisma.booking.findMany({
    where: {
      eventTypeId,
      status: "SCHEDULED",
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      startTime: {
        gte: new Date(`${date}T00:00:00.000Z`),
        lt: new Date(`${date}T23:59:59.999Z`),
      },
    },
    orderBy: { startTime: "asc" },
  });

  const slots: { label: string; value: string }[] = [];
  for (const window of availability) {
    const startMinutes = toMinutes(window.startTime);
    const endMinutes = toMinutes(window.endTime);
    const step = eventType.duration;

    for (let cursor = startMinutes; cursor + step <= endMinutes; cursor += step) {
      const slotStart = fromMinutes(cursor);
      const startUtc = zonedDateTimeToUtc(date, slotStart, window.timezone);
      const endUtc = addMinutes(startUtc, step);
      if (isPastTime(startUtc)) continue;

      const overlaps = bookings.some((booking) => {
        const bufferedBookingStart = addMinutes(booking.startTime, -eventType.bufferBefore);
        const bufferedBookingEnd = addMinutes(booking.endTime, eventType.bufferAfter);
        return startUtc < bufferedBookingEnd && endUtc > bufferedBookingStart;
      });

      if (!overlaps) {
        slots.push({
          label: utcToZonedTimeLabel(startUtc, window.timezone),
          value: startUtc.toISOString(),
        });
      }
    }
  }

  return slots.sort((a, b) => (a.value > b.value ? 1 : -1));
}

export function getDateParamIso(date: string) {
  return format(new Date(`${date}T00:00:00`), "yyyy-MM-dd");
}
