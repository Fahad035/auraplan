
import { useState, type FormEvent } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
} from "lucide-react";

import type { TimelineItem } from "../../domain/schema";
import { getTimelineProgress, sortTimeline } from "../../domain/timeline";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

type TimelinePanelProps = {
  items: TimelineItem[];
  onChange: (items: TimelineItem[]) => void;
};

export default function TimelinePanel({
  items,
  onChange,
}: TimelinePanelProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  const sortedItems = sortTimeline(items);
  const progress = getTimelineProgress(items);

  const today = new Date();
  const minimumDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("Enter a task name.");
      return;
    }

    if (trimmedTitle.length > 120) {
      setError("Task names must be 120 characters or fewer.");
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
          <label
            htmlFor="timeline-task-title"
            className="text-sm font-medium text-slate-700"
          >
            Task name
          </label>
          <input
            id="timeline-task-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Book the event venue"
            maxLength={120}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        <div>
          <label
            htmlFor="timeline-task-date"
            className="text-sm font-medium text-slate-700"
          >
            Task date
          </label>
          <input
            id="timeline-task-date"
            type="date"
            min={minimumDate}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
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

      <div
        className="mb-5 h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label="Timeline completion"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress.percentage}
      >
        <div
          className="h-full rounded-full bg-violet-600 transition-all"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      {sortedItems.length === 0 ? (
        <p className="py-4 text-sm text-slate-500">
          No tasks yet. Add your first planning milestone above.
        </p>
      ) : (
        <div className="space-y-3">
          {sortedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-xl border border-slate-100 p-3"
            >
              <button
                type="button"
                onClick={() => toggleTask(item.id)}
                aria-label={
                  item.completed
                    ? `Mark ${item.title} incomplete`
                    : `Mark ${item.title} complete`
                }
                className="mt-0.5 shrink-0 text-violet-600"
              >
                {item.completed ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <Circle size={20} />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <p
                  className={`wrap-break-word text-sm font-medium ${
                    item.completed
                      ? "text-slate-400 line-through"
                      : "text-slate-800"
                  }`}
                >
                  {item.title}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <CalendarDays size={13} />
                  {new Date(`${item.date}T00:00:00`).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    },
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => deleteTask(item.id)}
                aria-label={`Delete ${item.title}`}
                className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
