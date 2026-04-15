import { createEventTypeController, getEventTypesController } from "@/controllers/event-type.controller";
import { withErrorHandling } from "@/lib/api";

export async function GET() {
  return withErrorHandling(getEventTypesController);
}

export async function POST(request: Request) {
  return withErrorHandling(() => createEventTypeController(request));
}
