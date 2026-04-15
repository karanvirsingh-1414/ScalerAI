"use client";

import { format } from "date-fns";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

type Slot = { label: string; value: string };
type RescheduleBooking = {
  id: string;
  guestName: string;
  guestEmail: string;
  startTime: string | Date;
  eventType: { id: string; title: string };
};

export function RescheduleForm({ booking }: { booking: RescheduleBooking }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [date, setDate] = useState<Date | undefined>(new Date(booking.startTime));
  const [selectedSlot, setSelectedSlot] = useState(new Date(booking.startTime).toISOString());
  const selectedDate = useMemo(() => (date ? format(date, "yyyy-MM-dd") : ""), [date]);

  const { data: slots = [], isLoading } = useQuery<Slot[]>({
    queryKey: ["slots", selectedDate, booking.eventType.id, booking.id],
    queryFn: () =>
      apiFetch(
        `/api/slots?date=${selectedDate}&eventTypeId=${booking.eventType.id}&excludeBookingId=${booking.id}`
      ),
    enabled: !!selectedDate,
  });

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        body: JSON.stringify({ startTimeIso: selectedSlot }),
      }),
    onSuccess: () => {
      toast.success("Booking rescheduled");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      router.push("/");
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Card className="glass-surface rounded-3xl">
      <CardHeader>
        <CardTitle className="text-zinc-100">Reschedule booking</CardTitle>
        <p className="text-sm text-zinc-400">
          {booking.eventType.title} for {booking.guestName} ({booking.guestEmail})
        </p>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-[auto_1fr]">
        <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date()} />
        <div className="space-y-4">
          <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto">
            {isLoading && <p className="text-sm text-zinc-400">Loading slots...</p>}
            {!isLoading && slots.length === 0 && (
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
