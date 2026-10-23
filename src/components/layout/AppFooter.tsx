
import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";

function DigitalClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const updateTime = () => setNow(new Date());

    updateTime();
    const intervalId = window.setInterval(updateTime, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const time = now
    ? new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now)
    : "--:--:--";

  const date = now
    ? new Intl.DateTimeFormat("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(now)
    : "";

  return (
    <div
      aria-label={`AuraPlan live local time: ${time}`}
      className="flex items-center gap-3 rounded-xl border border-violet-400/20 bg-slate-900/80 px-3 py-2 shadow-lg shadow-violet-950/20 sm:px-4"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
        <Clock3 className="size-4" />
      </span>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-semibold tabular-nums tracking-tight text-white sm:text-xl">
            {time}
          </span>

          <span className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-emerald-300">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
            Live
          </span>
        </div>

        <p className="text-[10px] text-slate-400">{date}</p>
      </div>
    </div>
  );
}


export default function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-violet-300/15 bg-linear-to-r from-[#090d24] via-[#35116b] to-[#160d35] text-white">
      {/* Subtle ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 left-1/3 size-40 rounded-full bg-fuchsia-500/15 blur-3xl"
      />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-4 sm:flex-row sm:px-6">
        <p className="text-center text-xs text-violet-100/75 sm:text-left">
          © {currentYear} AuraPlan. All rights reserved.
        </p>

        <DigitalClock />
      </div>
    </footer>
  );
}

