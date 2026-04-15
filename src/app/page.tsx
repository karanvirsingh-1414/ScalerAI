import { DashboardShell } from "@/components/dashboard-shell";
import { EventTypeList } from "@/components/event-type-list";
import { BookingsList } from "@/components/bookings-list";
import { AnalyticsOverview } from "@/components/analytics-overview";
import Link from "next/link";
import { CalendarDays, Clock3, Link2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <DashboardShell>
      <section className="glass-surface mb-8 overflow-hidden rounded-3xl p-6 md:p-8">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div className="space-y-4">
            <p className="inline-flex rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-medium uppercase tracking-wider text-zinc-300">
              Cal Scheduler Dashboard
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-100 md:text-5xl">
              Manage event types, availability and bookings
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-zinc-300 md:text-base">
              Create public booking links for each event type, configure weekly availability, and
              track upcoming and past bookings from one place.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link href="/event-types/new">
                <Button className="rounded-2xl bg-white/95 px-5 text-zinc-900 hover:bg-white">
                  Create event type
                </Button>
              </Link>
              <Link href="/availability">
                <Button
                  variant="outline"
                  className="rounded-2xl border-white/20 bg-white/5 px-5 text-zinc-100 hover:bg-white/10"
                >
                  Set availability
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid gap-3 text-sm">
            <div className="rounded-2xl border border-white/10 bg-white/6 p-3 backdrop-blur">
              <p className="text-zinc-400">Event types</p>
              <p className="text-lg font-semibold text-zinc-100">Create, edit and share links</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/6 p-3 backdrop-blur">
              <p className="text-zinc-400">Availability</p>
              <p className="text-lg font-semibold text-zinc-100">Weekly slots per day</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/6 p-3 backdrop-blur">
              <p className="text-zinc-400">Bookings</p>
              <p className="text-lg font-semibold text-zinc-100">Upcoming + past tracking</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10 grid gap-4 md:grid-cols-3">
        <article className="glass-surface rounded-2xl p-4">
          <div className="mb-3 inline-flex rounded-xl border border-white/15 bg-white/8 p-2 text-zinc-200">
            <CalendarDays className="h-4 w-4" />
          </div>
          <h3 className="text-base font-semibold text-zinc-100">Easy date flow</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Guests can open the public event page, select a date, and book in available slots.
          </p>
        </article>
        <article className="glass-surface rounded-2xl p-4">
          <div className="mb-3 inline-flex rounded-xl border border-white/15 bg-white/8 p-2 text-zinc-200">
            <Clock3 className="h-4 w-4" />
          </div>
          <h3 className="text-base font-semibold text-zinc-100">Smart slot timing</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Slot generation respects event duration, buffers, and existing bookings.
          </p>
        </article>
        <article className="glass-surface rounded-2xl p-4">
          <div className="mb-3 inline-flex rounded-xl border border-white/15 bg-white/8 p-2 text-zinc-200">
            <Link2 className="h-4 w-4" />
          </div>
          <h3 className="text-base font-semibold text-zinc-100">Shareable links</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Each event type includes its own `/book/[slug]` URL for direct scheduling.
          </p>
        </article>
      </section>

      <section className="mb-10 space-y-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-100 md:text-3xl">Analytics</h2>
          <p className="text-sm text-zinc-400">
            Track booking performance and see which event type gets the most traction.
          </p>
        </div>
        <AnalyticsOverview />
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-100 md:text-3xl">Event types</h2>
            <p className="text-sm text-zinc-400">Create and manage your booking event links.</p>
          </div>
          <span className="hidden items-center gap-1 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs text-zinc-300 md:inline-flex">
            <Sparkles className="h-3.5 w-3.5" />
            live event links
          </span>
        </div>
        <EventTypeList />
      </section>
      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-100 md:text-3xl">
          Recent bookings
        </h2>
        <BookingsList />
      </section>
    </DashboardShell>
  );
}
