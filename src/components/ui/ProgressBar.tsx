interface ProgressBarProps {
  /** Accessible name describing what is being measured. */
  label: string;
  /** Completion from 0 to 100. */
  percentage: number;
  /** Tailwind colour class for the filled part. */
  barClassName?: string;
  /** Extra classes for the track, e.g. spacing. */
  className?: string;
}

export default function ProgressBar({
  label,
  percentage,
  barClassName = "bg-violet-600",
  className = "",
}: ProgressBarProps) {
  return (
    <div
      className={`h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 ${className}`.trim()}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percentage)}
    >
      <div
        className={`h-full rounded-full transition-all ${barClassName}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
