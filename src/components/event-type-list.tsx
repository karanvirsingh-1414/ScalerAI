"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import type { EventType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EventTypeList() {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery<EventType[]>({
    queryKey: ["event-types"],
    queryFn: () => apiFetch("/api/event-types"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiFetch(`/api/event-types/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Event type deleted");
      queryClient.invalidateQueries({ queryKey: ["event-types"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading) return <p className="text-sm text-zinc-500">Loading event types...</p>;

  return (
    <div className="grid gap-4">
      {data.map((eventType) => (
        <Card
          key={eventType.id}
          className="glass-surface rounded-3xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
        >
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg text-zinc-100">{eventType.title}</CardTitle>
              <p className="mt-1 text-sm text-zinc-400">{eventType.description || "No description added yet."}</p>
            </div>
            <Badge className="rounded-xl border-white/15 bg-white/10 px-3 py-1 text-zinc-100">
              {eventType.duration}m
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-xl border border-white/10 bg-white/7 px-2.5 py-1.5 text-zinc-200">
              /book/{eventType.slug}
            </span>
            <Link href={`/book/${eventType.slug}`} target="_blank">
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl border-white/20 bg-white/5 text-zinc-100 shadow-sm hover:bg-white/10"
              >
                Open
              </Button>
            </Link>
            <Link href={`/event-types/${eventType.id}/edit`}>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl border-white/20 bg-white/5 text-zinc-100 shadow-sm hover:bg-white/10"
              >
                Edit
              </Button>
            </Link>
            <Button
              size="sm"
              variant="destructive"
              className="rounded-xl border border-red-400/30 bg-red-500/15 text-red-200 shadow-sm hover:bg-red-500/25"
              onClick={() => deleteMutation.mutate(eventType.id)}
            >
              Delete
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
