import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { EventTypeForm } from "@/components/event-type-form";
import { getEventTypeById } from "@/services/event-type.service";

export default async function EditEventTypePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const eventType = await getEventTypeById(id);
  if (!eventType) notFound();
  const customQuestions = Array.isArray(eventType.customQuestions)
    ? eventType.customQuestions.filter(
        (item): item is { label: string; required: boolean } =>
          typeof item === "object" &&
          item !== null &&
          "label" in item &&
          "required" in item &&
          typeof item.label === "string" &&
          typeof item.required === "boolean"
      )
    : [];

  return (
    <DashboardShell>
      <EventTypeForm
        initialValues={{
          title: eventType.title,
          description: eventType.description ?? "",
          duration: eventType.duration,
          bufferBefore: eventType.bufferBefore,
          bufferAfter: eventType.bufferAfter,
          customQuestions,
        }}
        eventTypeId={eventType.id}
      />
    </DashboardShell>
  );
}
