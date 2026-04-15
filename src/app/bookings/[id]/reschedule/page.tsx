import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { RescheduleForm } from "@/components/reschedule-form";
import { getBookingById } from "@/services/booking.service";

export default async function RescheduleBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await getBookingById(id).catch(() => null);
  if (!booking) notFound();

  return (
    <DashboardShell>
      <RescheduleForm booking={booking} />
    </DashboardShell>
  );
}
