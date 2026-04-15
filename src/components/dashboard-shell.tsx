import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/25 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <Link href="/" className="group flex items-center gap-3 font-semibold text-zinc-100">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-lg shadow-indigo-900/40 transition-transform duration-200 group-hover:scale-105">
              <CalendarClock className="h-5 w-5" />
            </span>
            <span className="text-base tracking-tight md:text-lg">Cal Scheduler</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/availability">
              <Button
                variant="outline"
                className="rounded-2xl border-white/20 bg-white/5 text-zinc-100 shadow-sm backdrop-blur hover:bg-white/10"
              >
                Availability
              </Button>
            </Link>
            <Link href="/event-types/new">
              <Button className="rounded-2xl bg-white/90 text-zinc-900 shadow-lg shadow-black/40 hover:bg-white">
                New Event Type
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 md:px-8 md:py-12">{children}</main>
    </div>
  );
}
