import type { TimelineItem } from "./schema";

export function sortTimeline(items: TimelineItem[]): TimelineItem[] {
  return [...items].sort((a, b) => a.date.localeCompare(b.date));
}

export function getTimelineProgress(items: TimelineItem[]): {
  completed: number;
  total: number;
  percentage: number;
} {
  const completed = items.filter((item) => item.completed).length;
  const total = items.length;

  return {
    completed,
    total,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function isChronological(items: TimelineItem[]): boolean {
  return items.every(
    (item, index) => index === 0 || items[index - 1].date <= item.date,
  );
}
