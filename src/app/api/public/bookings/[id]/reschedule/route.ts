import {
  getPublicRescheduleBookingController,
  publicRescheduleBookingController,
} from "@/controllers/booking.controller";
import { withErrorHandling } from "@/lib/api";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = new URL(request.url).searchParams.get("token");
  return withErrorHandling(async () => {
    if (!token) throw new Error("Missing reschedule token");
    return getPublicRescheduleBookingController(id, token);
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = new URL(request.url).searchParams.get("token");
  return withErrorHandling(async () => {
    if (!token) throw new Error("Missing reschedule token");
    return publicRescheduleBookingController(request, id, token);
  });
}
