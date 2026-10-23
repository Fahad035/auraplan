import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  daysFromToday,
  formatLocalDate,
  todayLocalDate,
} from "../../src/domain/dates";

describe("formatLocalDate", () => {
  it("pads the month and day", () => {
    expect(formatLocalDate(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(formatLocalDate(new Date(2026, 10, 23))).toBe("2026-11-23");
  });
});

describe("date helpers relative to today", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 23, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns today's local date", () => {
    expect(todayLocalDate()).toBe("2026-10-23");
  });

  it("counts days until a future date", () => {
    expect(daysFromToday("2026-10-25")).toBe(2);
  });

  it("returns 0 for today", () => {
    expect(daysFromToday("2026-10-23")).toBe(0);
  });

  it("returns a negative number for a past date", () => {
    expect(daysFromToday("2026-10-20")).toBe(-3);
  });

  it("returns null for text that is not a date", () => {
    expect(daysFromToday("tomorrow")).toBeNull();
    expect(daysFromToday("2026-1-5")).toBeNull();
  });

  it("returns null for a date that does not exist", () => {
    expect(daysFromToday("2026-02-30")).toBeNull();
    expect(daysFromToday("2026-13-01")).toBeNull();
  });
});