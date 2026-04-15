import { getSlotsController } from "@/controllers/slot.controller";
import { withErrorHandling } from "@/lib/api";

export async function GET(request: Request) {
  return withErrorHandling(() => getSlotsController(request));
}
