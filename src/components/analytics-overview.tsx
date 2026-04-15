"use client";

import { WEEK_DAYS } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { BookingAnalytics } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function AnalyticsOverview() {
  const { data, isLoading } = useQuery<BookingAnalytics>({
    queryKey: ["analytics"],
    queryFn: () => apiFetch("/api/analytics"),
  });

  if (isLoading) {
    return <p className="text-sm text-zinc-400">Loading analytics...</p>;
  }

  if (!data) {
    return <p className="text-sm text-zinc-400">No analytics available yet.</p>;
  }

  const topEventType = data.byEventType[0];
  const busiestDay = WEEK_DAYS[data.busiestDay.day] ?? "Unknown";
  const funnelMax = Math.max(data.funnel.totalRequests, data.funnel.scheduled, data.funnel.upcoming, 1);
  const funnelRows = [
    { label: "Total requests", value: data.funnel.totalRequests },
    { label: "Scheduled", value: data.funnel.scheduled },
    { label: "Upcoming", value: data.funnel.upcoming },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="glass-surface rounded-2xl lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-zinc-100">Performance snapshot</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-zinc-400">Total bookings</p>
            <p className="text-2xl font-semibold text-zinc-100">{data.totalBookings}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-zinc-400">Upcoming</p>
            <p className="text-2xl font-semibold text-zinc-100">{data.upcomingBookings}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-zinc-400">Cancellation rate</p>
            <p className="text-2xl font-semibold text-zinc-100">
              {formatPercent(data.cancellationRate)}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-zinc-400">Scheduled conversion</p>
            <p className="text-2xl font-semibold text-zinc-100">
              {formatPercent(data.conversionRate)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-surface rounded-2xl lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-zinc-100">Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-zinc-400">Most booked day</p>
            <p className="font-medium text-zinc-100">
              {busiestDay} ({data.busiestDay.count} bookings)
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-zinc-400">Top event type</p>
            <p className="font-medium text-zinc-100">
              {topEventType ? `${topEventType.title} (${topEventType.count})` : "No bookings yet"}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="mb-2 text-zinc-400">Booking funnel</p>
            <div className="space-y-2">
              {funnelRows.map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex items-center justify-between text-xs text-zinc-300">
                    <span>{row.label}</span>
                    <span>{row.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-800/80">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400"
                      style={{ width: `${(row.value / funnelMax) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
