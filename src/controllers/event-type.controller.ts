import { NextResponse } from "next/server";
import {
  createEventType,
  deleteEventType,
  listEventTypes,
  updateEventType,
} from "@/services/event-type.service";

export async function getEventTypesController() {
  const data = await listEventTypes();
  return NextResponse.json(data);
}

export async function createEventTypeController(request: Request) {
  const body = await request.json();
  const data = await createEventType(body);
  return NextResponse.json(data, { status: 201 });
}

export async function updateEventTypeController(request: Request, id: string) {
  const body = await request.json();
  const data = await updateEventType(id, body);
  return NextResponse.json(data);
}

export async function deleteEventTypeController(id: string) {
  await deleteEventType(id);
  return NextResponse.json({ success: true });
}
