import type { LucideIcon } from "lucide-react";

import ProgressBar from "../../components/ui/ProgressBar";

interface ProgressSummaryCardProps {
  icon: LucideIcon;
  /** Colour classes for the icon tile, e.g. "bg-violet-100 text-violet-700". */
  iconStyle: string;
  title: string;
  detail: string;
  percentage: number;
  /** Colour classes for the percentage text. */
  percentageStyle: string;
  /** Accessible name for the progress bar. */
  progressLabel: string;
  /** Colour class for the filled part of the bar. */
  barStyle: string;
}

export default function ProgressSummaryCard({
  icon: Icon,
  iconStyle,
  title,
  detail,
  percentage,
  percentageStyle,
  progressLabel,
  barStyle,
}: ProgressSummaryCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-10 items-center justify-center rounded-xl ${iconStyle}`}
          >
            <Icon size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{title}</p>
            <p className="mt-1 text-xs text-slate-500">{detail}</p>
          </div>
        </div>
        <span className={`text-lg font-bold ${percentageStyle}`}>
          {percentage}%
        </span>
      </div>

      <ProgressBar
        label={progressLabel}
        percentage={percentage}
        barClassName={`${barStyle} duration-300`}
        className="mt-4"
      />
    </div>
  );
}