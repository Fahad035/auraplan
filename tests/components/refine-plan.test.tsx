import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RefinePlan from "../../src/features/operations/RefinePlan";
import { generateRecommendations } from "../../src/lib/api";
import type { EventPlan } from "../../src/domain/schema";

vi.mock("../../src/lib/api", () => ({ generateRecommendations: vi.fn() }));

const plan = {
  id: "p1",
  title: "Wedding Celebration",
  eventType: "wedding",
  eventDate: "2030-06-01",
  location: "Jaipur",
  guestCount: 150,
  totalBudget: 800000,
  contingencyPercent: 10,
  budgetItems: [{ id: "b1", name: "Venue", amount: 300000 }],
  timeline: [{ id: "t1", title: "Book venue", date: "2030-05-01", completed: true }],
  vendors: [{ id: "v1", name: "Caterer", category: "Catering", booked: true }],
  ideas: ["Old idea"],
} as unknown as EventPlan;

const revised = {
  ideas: ["Marigold mandap: fits Jaipur", "Live shehnai: welcome", "Welcome kits: sweets"],
  budgetItems: [
    { name: "Venue", amount: 250000 },
    { name: "Catering", amount: 250000 },
    { name: "Decor", amount: 220000 },
  ],
  timeline: [
    { title: "Book venue", daysBeforeEvent: 40, urgent: false },
    { title: "Send invites", daysBeforeEvent: 20, urgent: false },
    { title: "Final headcount", daysBeforeEvent: 3, urgent: false },
  ],
  vendors: [
    { name: "Caterer", category: "Catering", tip: "Ask for a tasting", bookByDaysBefore: 30, urgent: false },
    { name: "Photographer", category: "Photography", tip: "Check portfolio", bookByDaysBefore: 35, urgent: false },
    { name: "Decorator", category: "Decoration", tip: "Ask about florals", bookByDaysBefore: 25, urgent: false },
    { name: "Venue", category: "Venue", tip: "Visit in person", bookByDaysBefore: 40, urgent: false },
  ],
};

beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

describe("RefinePlan", () => {
  it("asks for a change request of valid length", async () => {
    const user = userEvent.setup();
    render(<RefinePlan plan={plan} onApply={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /refine plan/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/3 to 300 characters/i);
    expect(generateRecommendations).not.toHaveBeenCalled();
  });

  it("sends the change request and applies the revised plan", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    vi.mocked(generateRecommendations).mockResolvedValue(revised);
    render(<RefinePlan plan={plan} onApply={onApply} />);

    await user.type(screen.getByLabelText(/what would you like to change/i), "make it cheaper");
    await user.click(screen.getByRole("button", { name: /refine plan/i }));

    await waitFor(() => expect(onApply).toHaveBeenCalledOnce());

    expect(vi.mocked(generateRecommendations).mock.calls[0][0]).toMatchObject({
      eventType: "wedding",
      totalBudget: 800000,
      feedback: "make it cheaper",
    });

    const updated = onApply.mock.calls[0][0] as EventPlan;

    expect(updated.ideas).toEqual(revised.ideas);
    expect(updated.timeline.find((task) => task.title === "Book venue")?.completed).toBe(true);
    expect(updated.vendors.find((vendor) => vendor.name === "Caterer")?.booked).toBe(true);
    expect(await screen.findByText(/your plan was updated/i)).toBeInTheDocument();
  });

  it("shows the error when the request fails", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    vi.mocked(generateRecommendations).mockRejectedValue(new Error("AI service is busy."));
    render(<RefinePlan plan={plan} onApply={onApply} />);

    await user.type(screen.getByLabelText(/what would you like to change/i), "add live music");
    await user.click(screen.getByRole("button", { name: /refine plan/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/AI service is busy/i);
    expect(onApply).not.toHaveBeenCalled();
  });
});