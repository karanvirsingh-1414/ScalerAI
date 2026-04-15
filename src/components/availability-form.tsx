"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { WEEK_DAYS } from "@/lib/constants";
import { apiFetch } from "@/lib/api-client";
import type { AvailabilitySlot } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type AvailabilityPayload = { timezone: string; slots: AvailabilitySlot[] };

const defaults = WEEK_DAYS.map((_, dayOfWeek) => ({
  dayOfWeek,
  startTime: "09:00",
  endTime: "17:00",
  isEnabled: dayOfWeek > 0 && dayOfWeek < 6,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
}));

export function AvailabilityForm() {
  const { data, refetch } = useQuery<AvailabilitySlot[]>({
    queryKey: ["availability"],
    queryFn: () => apiFetch("/api/availability"),
  });

  const [draft, setDraft] = useState<Record<number, AvailabilitySlot>>({});
  const baseSlots = data?.length ? data : defaults;
  const slots = baseSlots.map((slot) => draft[slot.dayOfWeek] ?? slot);

  const mutation = useMutation({
    mutationFn: (payload: AvailabilityPayload) =>
      apiFetch("/api/availability", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => {
      toast.success("Availability saved");
      refetch();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateSlot = (dayOfWeek: number, patch: Partial<AvailabilitySlot>) => {
    setDraft((current) => {
      const existing = slots.find((slot) => slot.dayOfWeek === dayOfWeek);
      if (!existing) return current;
      return { ...current, [dayOfWeek]: { ...existing, ...patch } };
    });
  };

  return (
    <Card className="rounded-2xl border-none shadow-sm">
      <CardHeader>
        <CardTitle>Weekly availability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {slots.map((slot) => (
          <div key={slot.dayOfWeek} className="grid items-center gap-2 rounded-xl border p-3 md:grid-cols-4">
            <Label>{WEEK_DAYS[slot.dayOfWeek]}</Label>
            <Input
              value={slot.startTime}
              type="time"
              className="rounded-xl"
              onChange={(e) => updateSlot(slot.dayOfWeek, { startTime: e.target.value })}
            />
            <Input
              value={slot.endTime}
              type="time"
              className="rounded-xl"
              onChange={(e) => updateSlot(slot.dayOfWeek, { endTime: e.target.value })}
            />
            <div className="flex items-center gap-2">
              <Switch
                checked={slot.isEnabled}
                onCheckedChange={(v) => updateSlot(slot.dayOfWeek, { isEnabled: v })}
              />
              <span className="text-sm text-zinc-500">Enabled</span>
            </div>
          </div>
        ))}
        <Button
          className="rounded-2xl"
          onClick={() =>
            mutation.mutate({
              timezone: slots[0]?.timezone ?? "UTC",
              slots,
            })
          }
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Saving..." : "Save availability"}
        </Button>
      </CardContent>
    </Card>
  );
}
