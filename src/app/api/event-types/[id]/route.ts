import { deleteEventTypeController, updateEventTypeController } from "@/controllers/event-type.controller";
import { withErrorHandling } from "@/lib/api";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withErrorHandling(() => updateEventTypeController(request, id));
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withErrorHandling(() => deleteEventTypeController(id));
}
