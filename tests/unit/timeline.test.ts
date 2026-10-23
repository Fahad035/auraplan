import { describe, expect, it } from "vitest";
import {
  getTimelineProgress,
  isChronological,
  sortTimeline,
} from "../../src/domain/timeline";
import type { TimelineItem } from "../../src/domain/schema";

const tasks: TimelineItem[] = [
  {
    id: "invitations",
    title: "Send invitations",
    date: "2026-11-10",
    completed: false,
  },
  {
    id: "venue",
    title: "Book venue",
    date: "2026-11-01",
    completed: true,
  },
  {
    id: "vendors",
    title: "Confirm vendors",
    date: "2026-11-05",
    completed: false,
  },
];

describe("timeline utilities", () => {
  it("sorts tasks by date without modifying the original array", () => {
    const sorted = sortTimeline(tasks);

    expect(sorted.map((task) => task.id)).toEqual([
      "venue",
      "vendors",
      "invitations",
    ]);

    expect(tasks[0].id).toBe("invitations");
  });

  it("calculates timeline completion percentage", () => {
    expect(getTimelineProgress(tasks)).toEqual({
      completed: 1,
      total: 3,
      percentage: 33,
    });
  });

  it("returns zero progress for an empty timeline", () => {
    expect(getTimelineProgress([])).toEqual({
      completed: 0,
      total: 0,
      percentage: 0,
    });
  });

  it("checks chronological order", () => {
    expect(isChronological(sortTimeline(tasks))).toBe(true);
    expect(isChronological(tasks)).toBe(false);
  });
});
