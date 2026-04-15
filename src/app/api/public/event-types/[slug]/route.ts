import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api";
import { getEventTypeBySlug } from "@/services/event-type.service";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  return withErrorHandling(async () => {
    const { slug } = await params;
    const eventType = await getEventTypeBySlug(slug);
    if (!eventType || !eventType.isActive) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 404 });
    }
    return NextResponse.json(eventType);
  });
}
