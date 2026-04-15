import { NextResponse } from "next/server";
import { getSlotsForDate } from "@/services/slot.service";

export async function getSlotsController(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  const eventTypeId = url.searchParams.get("eventTypeId");
  const excludeBookingId = url.searchParams.get("excludeBookingId") ?? undefined;

  if (!date || !eventTypeId) {
    return NextResponse.json({ error: "date and eventTypeId are required" }, { status: 400 });
  }

  const slots = await getSlotsForDate(date, eventTypeId, excludeBookingId);
  return NextResponse.json(slots);
}
