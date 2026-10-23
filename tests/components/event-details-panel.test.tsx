import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import EventDetailsPanel from "../../src/features/operations/EventDetailsPanel";
import { samplePlan } from "../fixtures/samplePlan";

function renderWithDate(eventDate: string) {
  return render(<EventDetailsPanel plan={{ ...samplePlan, eventDate }} />);
}

describe("EventDetailsPanel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 23, 12, 0, 0));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("shows the event details", () => {
    renderWithDate("2026-12-01");

    expect(screen.getByText("Hyderabad")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText(/December 2026/)).toBeInTheDocument();
  });

  it("counts the days to go for an upcoming event", () => {
    renderWithDate("2026-10-26");

    expect(screen.getByText("3 days to go")).toBeInTheDocument();
  });

  it("celebrates on the day of the event", () => {
    renderWithDate("2026-10-23");

    expect(screen.getByText("It's event day!")).toBeInTheDocument();
  });

  it("shows how long ago a past event was", () => {
    renderWithDate("2026-10-20");

    expect(screen.getByText("3 days ago")).toBeInTheDocument();
  });

  it("handles a date that does not exist", () => {
    renderWithDate("2026-02-30");

    expect(screen.getByText("Date unavailable")).toBeInTheDocument();
  });
});