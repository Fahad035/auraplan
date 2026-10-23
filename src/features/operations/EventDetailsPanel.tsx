import {
  CalendarDays,
  Clock3,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";

import { daysFromToday } from "../../domain/dates";
import type { EventPlan } from "../../domain/schema";
import { formatLongDate } from "../../lib/format";

interface EventDetailsPanelProps {
  plan: EventPlan;
}

function describeCountdown(days: number | null): string {
  if (days === null) return "Date unavailable";
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days === 0) return "It's event day!";

  return `${days} days to go`;
}

export default function EventDetailsPanel({
  plan,
}: EventDetailsPanelProps) {
  const detailTiles = [
    {
      label: "Event date",
      value: formatLongDate(plan.eventDate),
      icon: CalendarDays,
      iconStyle: "bg-violet-100 text-violet-700",
      wrapsLongText: true,
    },
    {
      label: "Location",
      value: plan.location,
      icon: MapPin,
      iconStyle: "bg-indigo-100 text-indigo-700",
      wrapsLongText: true,
    },
    {
      label: "Expected guests",
      value: plan.guestCount.toLocaleString("en-IN"),
      icon: Users,
      iconStyle: "bg-blue-100 text-blue-700",
      wrapsLongText: false,
    },
    {
      label: "Event countdown",
      value: describeCountdown(daysFromToday(plan.eventDate)),
      icon: Clock3,
      iconStyle: "bg-emerald-100 text-emerald-700",
      wrapsLongText: false,
    },
  ];

  return (
    <section
      aria-label="Event details"
      className="relative mt-6 overflow-hidden rounded-3xl border border-violet-100 bg-linear-to-br from-violet-50 via-white to-indigo-50 p-5 shadow-sm sm:p-7"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-16 size-48 rounded-full bg-violet-200/30 blur-3xl"
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-violet-700">
            <Sparkles size={14} />
            Your event workspace
          </div>

          <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Make every detail count.
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Keep your event details, budget, tasks, and bookings updated as
            your plans come together.
          </p>
        </div>

        <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:min-w-97.5">
          {detailTiles.map((tile) => {
            const Icon = tile.icon;

            return (
              <div
                key={tile.label}
                className="flex min-w-0 items-start gap-3 rounded-2xl border border-white bg-white/90 p-4 shadow-sm"
              >
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tile.iconStyle}`}
                >
                  <Icon size={19} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500">
                    {tile.label}
                  </p>
                  <p
                    className={`mt-1 text-sm font-semibold text-slate-900${
                      tile.wrapsLongText ? " wrap-break-word" : ""
                    }`}
                  >
                    {tile.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}