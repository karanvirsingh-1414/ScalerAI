import { getBookingAnalyticsController } from "@/controllers/booking.controller";
import { withErrorHandling } from "@/lib/api";

export async function GET() {
  return withErrorHandling(getBookingAnalyticsController);
}
