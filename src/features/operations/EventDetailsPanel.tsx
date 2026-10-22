
import {
  CalendarDays,
  Clock3,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";

import type { EventPlan } from "../../domain/schema";

interface EventDetailsPanelProps {
  plan: EventPlan;
}

function formatEventDate(value: string) {
  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getDaysUntilEvent(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    return null;
  }

  const eventDate = Date.UTC(year, month - 1, day);
  const today = new Date();
  const todayDate = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return Math.round(
    (eventDate - todayDate) / (1000 * 60 * 60 * 24),
  );
}

export default function EventDetailsPanel({
  plan,
}: EventDetailsPanelProps) {
  const daysUntilEvent = getDaysUntilEvent(plan.eventDate);

  const countdown =
    daysUntilEvent === null
      ? "Date unavailable"
      : daysUntilEvent < 0
        ? `${Math.abs(daysUntilEvent)} days ago`
        : daysUntilEvent === 0
          ? "It's event day!"
          : `${daysUntilEvent} days to go`;

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
          <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-white bg-white/90 p-4 shadow-sm">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <CalendarDays size={19} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">
                Event date
              </p>
              <p className="mt-1 wrap-break-word text-sm font-semibold text-slate-900">
                {formatEventDate(plan.eventDate)}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-white bg-white/90 p-4 shadow-sm">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <MapPin size={19} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">
                Location
              </p>
              <p className="mt-1 wrap-break-word text-sm font-semibold text-slate-900">
                {plan.location}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-white bg-white/90 p-4 shadow-sm">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Users size={19} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">
                Expected guests
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {plan.guestCount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-white bg-white/90 p-4 shadow-sm">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Clock3 size={19} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">
                Event countdown
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {countdown}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
