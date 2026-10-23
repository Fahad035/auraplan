import { useState, type FormEvent } from "react";
import { CalendarDays, Plus } from "lucide-react";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ChecklistRow from "../../components/ui/ChecklistRow";
import { inputClass, labelClass } from "../../components/ui/fieldStyles";
import ProgressBar from "../../components/ui/ProgressBar";
import { todayLocalDate } from "../../domain/dates";
import type { TimelineItem } from "../../domain/schema";
import { getTimelineProgress, sortTimeline } from "../../domain/timeline";
import { formatShortDate } from "../../lib/format";

const MAX_TASK_TITLE_LENGTH = 120;

type TimelinePanelProps = {
  items: TimelineItem[];
  onChange: (items: TimelineItem[]) => void;
};

export default function TimelinePanel({ items, onChange }: TimelinePanelProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  const sortedItems = sortTimeline(items);
  const progress = getTimelineProgress(items);

  const minimumDate = todayLocalDate();

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("Enter a task name.");
      return;
    }

    if (trimmedTitle.length > MAX_TASK_TITLE_LENGTH) {
      setError(
        `Task names must be ${MAX_TASK_TITLE_LENGTH} characters or fewer.`,
      );
      return;
    }

    if (!date) {
      setError("Choose a date for this task.");
      return;
    }

    const newTask: TimelineItem = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      date,
      completed: false,
    };

    onChange([...items, newTask]);
    setTitle("");
    setDate("");
  }

  function toggleTask(id: string) {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    );
  }

  function deleteTask(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  return (
    <Card
      title="Planning timeline"
      description={`${progress.percentage}% of tasks completed`}
    >
      <form onSubmit={addTask} className="mb-6 space-y-3">
        <div>
          <label htmlFor="timeline-task-title" className={labelClass}>
            Task name
          </label>
          <input
            id="timeline-task-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Book the event venue"
            maxLength={MAX_TASK_TITLE_LENGTH}
            className={`mt-2 ${inputClass}`}
          />
        </div>

        <div>
          <label htmlFor="timeline-task-date" className={labelClass}>
            Task date
          </label>
          <input
            id="timeline-task-date"
            type="date"
            min={minimumDate}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className={`mt-2 ${inputClass}`}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full">
          <Plus size={16} />
          Add timeline task
        </Button>
      </form>

      <ProgressBar
        label="Timeline completion"
        percentage={progress.percentage}
        className="mb-5"
      />

      {sortedItems.length === 0 ? (
        <p className="py-4 text-sm text-slate-500">
          No tasks yet. Add your first planning milestone above.
        </p>
      ) : (
        <div className="space-y-3">
          {sortedItems.map((item) => (
            <ChecklistRow
              key={item.id}
              checked={item.completed}
              toggleLabel={
                item.completed
                  ? `Mark ${item.title} incomplete`
                  : `Mark ${item.title} complete`
              }
              onToggle={() => toggleTask(item.id)}
              deleteLabel={`Delete ${item.title}`}
              onDelete={() => deleteTask(item.id)}
            >
              <p
                className={`wrap-break-word text-sm font-medium ${
                  item.completed
                    ? "text-slate-400 line-through"
                    : "text-slate-800"
                }`}
              >
                {item.title}
                {item.urgent && !item.completed && (
                  <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
                    Do now
                  </span>
                )}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <CalendarDays size={13} />
                {formatShortDate(item.date)}
              </p>
            </ChecklistRow>
          ))}
        </div>
      )}
    </Card>
  );
}
