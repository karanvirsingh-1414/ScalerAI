"use client";

import { format } from "date-fns";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Booking } from "@/lib/types";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type BookingsResponse = { upcoming: Booking[]; past: Booking[] };

export function BookingsList() {
  const queryClient = useQueryClient();
  const { data } = useQuery<BookingsResponse>({
    queryKey: ["bookings"],
    queryFn: () => apiFetch("/api/bookings"),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/bookings/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Booking cancelled");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="glass-surface rounded-3xl">
        <CardHeader>
          <CardTitle className="text-zinc-100">Upcoming bookings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data?.upcoming?.length ? (
            data.upcoming.map((booking) => (
              <div
                key={booking.id}
                className="rounded-2xl border border-white/10 bg-white/6 p-3 shadow-sm backdrop-blur"
              >
                <p className="font-medium text-zinc-100">{booking.eventType.title}</p>
                <p className="text-sm text-zinc-400">{format(booking.startTime, "PPP p")}</p>
                <p className="text-sm text-zinc-300">{booking.guestName}</p>
                <div className="mt-2">
                  <Badge
                    className={
                      booking.noShowRiskScore && booking.noShowRiskScore >= 70
                        ? "bg-red-500/20 text-red-200"
                        : booking.noShowRiskScore && booking.noShowRiskScore >= 40
                          ? "bg-amber-500/20 text-amber-200"
                          : "bg-emerald-500/20 text-emerald-200"
                    }
                  >
                    No-show risk: {booking.noShowRiskScore ?? 0}%
                  </Badge>
                  {!!booking.noShowRiskReasons?.length && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {booking.noShowRiskReasons.map((reason) => (
                        <Badge key={`${booking.id}-${reason}`} variant="outline" className="text-xs">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 rounded-xl border-white/20 bg-white/5 text-zinc-100 shadow-sm hover:bg-white/10"
                  onClick={() => cancelMutation.mutate(booking.id)}
                >
                  Cancel
                </Button>
                <Link href={`/bookings/${booking.id}/reschedule`} className="ml-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 rounded-xl border-white/20 bg-white/5 text-zinc-100 shadow-sm hover:bg-white/10"
                  >
                    Reschedule
                  </Button>
                </Link>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-400">No upcoming bookings</p>
          )}
        </CardContent>
      </Card>
      <Card className="glass-surface rounded-3xl">
        <CardHeader>
          <CardTitle className="text-zinc-100">Past bookings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data?.past?.length ? (
            data.past.map((booking) => (
              <div
                key={booking.id}
                className="rounded-2xl border border-white/10 bg-white/6 p-3 shadow-sm backdrop-blur"
              >
                <p className="font-medium text-zinc-100">{booking.eventType.title}</p>
                <p className="text-sm text-zinc-400">{format(booking.startTime, "PPP p")}</p>
                <p className="text-sm text-zinc-300">{booking.guestName}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-400">No past bookings</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
