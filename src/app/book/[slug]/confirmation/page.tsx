import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BookingConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ bookingId?: string; token?: string }>;
}) {
  const { slug } = await params;
  const { bookingId, token } = await searchParams;
  const rescheduleUrl =
    bookingId && token ? `/book/${slug}/reschedule?bookingId=${bookingId}&token=${token}` : null;

  return (
    <div className="mx-auto flex min-h-screen max-w-xl items-center px-4">
      <Card className="w-full rounded-2xl border-none shadow-sm">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
            Booking confirmed
          </div>
          <CardTitle>You are all set.</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-zinc-600">
          <p>Booking ID: {bookingId}</p>
          <p>A confirmation email has been sent if SMTP is configured.</p>
          {rescheduleUrl && (
            <Link href={rescheduleUrl}>
              <Button variant="outline" className="rounded-2xl">
                Reschedule this booking
              </Button>
            </Link>
          )}
          <Link href={`/book/${slug}`}>
            <Button className="rounded-2xl">Book another slot</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
