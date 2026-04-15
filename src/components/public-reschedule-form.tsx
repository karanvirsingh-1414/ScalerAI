"use client";

import { format } from "date-fns";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

type Slot = { label: string; value: string };
type PublicRescheduleBooking = {
  id: string;
  guestName: string;
  guestEmail: string;
  startTime: string;
  eventType: { id: string; title: string; slug: string };
};

export function PublicRescheduleForm({
  bookingId,
  token,
  slug,
}: {
  bookingId: string;
  token: string;
  slug: string;
}) {
  const router = useRouter();
  const { data: booking, isLoading: isBookingLoading } = useQuery<PublicRescheduleBooking>({
    queryKey: ["public-reschedule-booking", bookingId, token],
    queryFn: () => apiFetch(`/api/public/bookings/${bookingId}/reschedule?token=${token}`),
  });

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const selectedDate = useMemo(() => (date ? format(date, "yyyy-MM-dd") : ""), [date]);

  const { data: slots = [], isLoading: isSlotsLoading } = useQuery<Slot[]>({
    queryKey: ["public-reschedule-slots", booking?.eventType.id, selectedDate, bookingId],
    queryFn: () =>
      apiFetch(
        `/api/slots?date=${selectedDate}&eventTypeId=${booking?.eventType.id}&excludeBookingId=${bookingId}`
      ),
    enabled: !!booking?.eventType.id && !!selectedDate,
  });

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch(`/api/public/bookings/${bookingId}/reschedule?token=${token}`, {
        method: "PATCH",
        body: JSON.stringify({ startTimeIso: selectedSlot }),
      }),
    onSuccess: () => {
      toast.success("Booking rescheduled");
      router.push(`/book/${slug}/confirmation?bookingId=${bookingId}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isBookingLoading || !booking) {
    return <p className="text-sm text-zinc-300">Loading reschedule details...</p>;
  }

  return (
    <Card className="glass-surface rounded-3xl">
      <CardHeader>
        <CardTitle className="text-zinc-100">Reschedule your booking</CardTitle>
        <p className="text-sm text-zinc-400">
          {booking.eventType.title} for {booking.guestName} ({booking.guestEmail})
        </p>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-[auto_1fr]">
        <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date()} />
        <div className="space-y-4">
          <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto">
            {isSlotsLoading && <p className="text-sm text-zinc-400">Loading slots...</p>}
            {!isSlotsLoading && slots.length === 0 && (
              <p className="col-span-2 text-sm text-zinc-400">No available slots for this date.</p>
            )}
            {slots.map((slot) => (
              <Button
                key={slot.value}
                type="button"
                variant={selectedSlot === slot.value ? "default" : "outline"}
                className="rounded-xl"
                onClick={() => setSelectedSlot(slot.value)}
              >
                {slot.label}
              </Button>
            ))}
          </div>
          <Button
            className="w-full rounded-2xl"
            disabled={!selectedSlot || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Updating..." : "Confirm reschedule"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
