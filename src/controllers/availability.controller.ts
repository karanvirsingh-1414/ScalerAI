import { NextResponse } from "next/server";
import { getAvailability, saveAvailability } from "@/services/availability.service";

export async function getAvailabilityController() {
  const data = await getAvailability();
  return NextResponse.json(data);
}

export async function saveAvailabilityController(request: Request) {
  const body = await request.json();
  await saveAvailability(body);
  return NextResponse.json({ success: true });
}
