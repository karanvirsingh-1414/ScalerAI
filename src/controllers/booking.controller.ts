import { NextResponse } from "next/server";
import {
  cancelBooking,
  createBooking,
  getBookingAnalytics,
  getBookingById,
  getBookingForPublicReschedule,
  listBookings,
  rescheduleBooking,
  rescheduleBookingWithToken,
} from "@/services/booking.service";

export async function getBookingsController() {
  const data = await listBookings();
  return NextResponse.json(data);
}

export async function createBookingController(request: Request) {
  const body = await request.json();
  const data = await createBooking(body);
  return NextResponse.json(data, { status: 201 });
}

export async function cancelBookingController(id: string) {
  await cancelBooking(id);
  return NextResponse.json({ success: true });
}

export async function getBookingController(id: string) {
  const data = await getBookingById(id);
  return NextResponse.json(data);
}

export async function rescheduleBookingController(request: Request, id: string) {
  const body = await request.json();
  const data = await rescheduleBooking(id, body);
  return NextResponse.json(data);
}

export async function getBookingAnalyticsController() {
  const data = await getBookingAnalytics();
  return NextResponse.json(data);
}

export async function getPublicRescheduleBookingController(id: string, token: string) {
  const data = await getBookingForPublicReschedule(id, token);
  return NextResponse.json(data);
}

export async function publicRescheduleBookingController(request: Request, id: string, token: string) {
  const body = await request.json();
  const data = await rescheduleBookingWithToken(id, token, body);
  return NextResponse.json(data);
}
