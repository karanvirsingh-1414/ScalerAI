import { notFound } from "next/navigation";
import { PublicRescheduleForm } from "@/components/public-reschedule-form";

export default async function PublicReschedulePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ bookingId?: string; token?: string }>;
}) {
  const { slug } = await params;
  const { bookingId, token } = await searchParams;
  if (!bookingId || !token) notFound();

  return (
    <div className="mx-auto min-h-screen w-full max-w-4xl px-4 py-10">
      <PublicRescheduleForm bookingId={bookingId} token={token} slug={slug} />
    </div>
  );
}
