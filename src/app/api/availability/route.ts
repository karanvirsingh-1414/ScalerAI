import { getAvailabilityController, saveAvailabilityController } from "@/controllers/availability.controller";
import { withErrorHandling } from "@/lib/api";

export async function GET() {
  return withErrorHandling(getAvailabilityController);
}

export async function POST(request: Request) {
  return withErrorHandling(() => saveAvailabilityController(request));
}
