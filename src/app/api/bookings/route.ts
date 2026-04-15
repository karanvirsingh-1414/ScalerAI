import { createBookingController, getBookingsController } from "@/controllers/booking.controller";
import { withErrorHandling } from "@/lib/api";

export async function GET() {
  return withErrorHandling(getBookingsController);
}

export async function POST(request: Request) {
  return withErrorHandling(() => createBookingController(request));
}
