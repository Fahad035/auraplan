import type { ReactNode } from "react";
import { CheckCircle2, Circle, Trash2 } from "lucide-react";

interface ChecklistRowProps {
  /** Whether the item is done (task completed, vendor booked). */
  checked: boolean;
  /** Accessible name for the toggle button, e.g. "Mark Book venue complete". */
  toggleLabel: string;
  onToggle: () => void;
  /** Accessible name for the delete button. */
  deleteLabel: string;
  onDelete: () => void;
  /** Optional content shown above the delete button, e.g. a status badge. */
  aside?: ReactNode;
  /** The item's own details. */
  children: ReactNode;
}

/** One toggleable, deletable row, shared by the timeline and vendor lists. */
export default function ChecklistRow({
  checked,
  toggleLabel,
  onToggle,
  deleteLabel,
  onDelete,
  aside,
  children,
}: ChecklistRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 p-3">
      <button
        type="button"
        onClick={onToggle}
        aria-label={toggleLabel}
        className="mt-0.5 shrink-0 text-violet-600"
      >
        {checked ? <CheckCircle2 size={20} /> : <Circle size={20} />}
      </button>

      <div className="min-w-0 flex-1">{children}</div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        {aside}

        <button
          type="button"
          onClick={onDelete}
          aria-label={deleteLabel}
          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}