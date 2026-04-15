import { notFound } from "next/navigation";
import { PublicBookingForm } from "@/components/public-booking-form";
import { getEventTypeBySlug } from "@/services/event-type.service";

export default async function PublicBookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const eventType = await getEventTypeBySlug(slug);

  if (!eventType) notFound();

  return (
    <div className="mx-auto min-h-screen w-full max-w-4xl px-4 py-10">
      <PublicBookingForm eventType={eventType} />
    </div>
  );
}
