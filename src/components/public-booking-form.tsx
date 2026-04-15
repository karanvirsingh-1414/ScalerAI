"use client";

import { format } from "date-fns";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import type { CustomQuestion, EventType } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Slot = { label: string; value: string };

export function PublicBookingForm({ eventType }: { eventType: EventType }) {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const selectedDate = useMemo(() => (date ? format(date, "yyyy-MM-dd") : ""), [date]);
  const questions: CustomQuestion[] = Array.isArray(eventType.customQuestions)
    ? eventType.customQuestions
    : [];

  const { data: slots = [], isLoading } = useQuery<Slot[]>({
    queryKey: ["slots", selectedDate, eventType.id],
    queryFn: () => apiFetch(`/api/slots?date=${selectedDate}&eventTypeId=${eventType.id}`),
    enabled: !!selectedDate,
  });

  const mutation = useMutation<{ id: string; rescheduleToken: string }>({
    mutationFn: () =>
      apiFetch<{ id: string; rescheduleToken: string }>("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          eventTypeId: eventType.id,
          date: selectedDate,
          startTimeIso: selectedSlot,
          guestName: name,
          guestEmail: email,
          guestTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          answers,
        }),
      }),
    onSuccess: (booking) => {
      router.push(
        `/book/${eventType.slug}/confirmation?bookingId=${booking.id}&token=${booking.rescheduleToken}`
      );
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const hasMissingRequiredAnswer = questions.some((question) => {
    if (!question.required) return false;
    const key = question.label.trim();
    return !answers[key]?.trim();
  });

  return (
    <Card className="glass-surface rounded-3xl">
      <CardHeader>
        <CardTitle className="text-zinc-100">{eventType.title}</CardTitle>
        <p className="text-sm text-zinc-400">{eventType.description}</p>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-[auto_1fr]">
        <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date()} />
        <div className="space-y-4">
          <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto">
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
          <div className="space-y-2">
            <Label className="text-zinc-300">Name</Label>
            <Input className="rounded-xl" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Email</Label>
            <Input className="rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {questions.map((question) => {
            const key = question.label.trim();
            return (
              <div key={key} className="space-y-2">
                <Label className="text-zinc-300">
                  {question.label}
                  {question.required ? " *" : ""}
                </Label>
                <Input
                  className="rounded-xl"
                  value={answers[key] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                />
              </div>
            );
          })}
          <Button
            className="w-full rounded-2xl"
            disabled={
              !selectedSlot || !name || !email || mutation.isPending || hasMissingRequiredAnswer
            }
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Booking..." : "Confirm booking"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
