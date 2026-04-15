import {
  cancelBookingController,
  getBookingController,
  rescheduleBookingController,
} from "@/controllers/booking.controller";
import { withErrorHandling } from "@/lib/api";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withErrorHandling(() => getBookingController(id));
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withErrorHandling(() => cancelBookingController(id));
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withErrorHandling(() => rescheduleBookingController(request, id));
}
