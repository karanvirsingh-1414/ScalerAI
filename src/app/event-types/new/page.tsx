import { DashboardShell } from "@/components/dashboard-shell";
import { EventTypeForm } from "@/components/event-type-form";

export default function NewEventTypePage() {
  return (
    <DashboardShell>
      <EventTypeForm />
    </DashboardShell>
  );
}
