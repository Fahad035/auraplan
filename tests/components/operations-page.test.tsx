import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import OperationsPage from "../../src/features/operations/OperationsPage";
import { downloadTextFile } from "../../src/domain/export";
import { loadEventPlans, saveEventPlans } from "../../src/lib/storage";
import type { EventPlan } from "../../src/domain/schema";

vi.mock("../../src/domain/export", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../src/domain/export")>()),
  downloadTextFile: vi.fn(),
}));

function makePlan(
  id: string,
  title: string,
  overrides: Partial<EventPlan> = {},
): EventPlan {
  return {
    id,
    title,
    eventType: "wedding",
    eventDate: "2030-06-01",
    location: "Jaipur",
    guestCount: 150,
    totalBudget: 800000,
    contingencyPercent: 10,
    budgetItems: [{ id: `${id}-b1`, name: "Venue", amount: 300000 }],
    timeline: [
      {
        id: `${id}-t1`,
        title: "Book venue",
        date: "2030-05-01",
        completed: false,
      },
    ],
    vendors: [
      { id: `${id}-v1`, name: "Caterer", category: "Catering", booked: false },
    ],
    ideas: [`${title} idea one`, `${title} idea two`, `${title} idea three`],
    ...overrides,
  } as EventPlan;
}

function renderPage(eventId?: string) {
  return render(
    <MemoryRouter
      initialEntries={[
        { pathname: "/operations", state: eventId ? { eventId } : undefined },
      ]}
    >
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/operations" element={<OperationsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("OperationsPage", () => {
  it("shows the empty state when there are no events", () => {
    renderPage();

    expect(
      screen.queryByRole("group", { name: /export and print plan/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /export json/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/your events/i)).not.toBeInTheDocument();
    expect(document.title).toBe("Operations | AuraPlan");
  });

  it("shows the latest event with its ideas, timeline and vendors", () => {
    saveEventPlans([makePlan("p1", "Wedding Celebration")]);
    renderPage();

    expect(
      screen.getByRole("heading", { level: 1, name: "Wedding Celebration" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Wedding Celebration idea one"),
    ).toBeInTheDocument();
    expect(screen.getByText("Planning timeline")).toBeInTheDocument();
    expect(screen.getByText("Vendor checklist")).toBeInTheDocument();
    expect(document.title).toBe("Wedding Celebration · Operations | AuraPlan");
  });

  it("opens the requested event and switches between events", async () => {
    const user = userEvent.setup();
    saveEventPlans([
      makePlan("p1", "Wedding Celebration"),
      makePlan("p2", "Birthday Celebration"),
    ]);
    renderPage("p1");

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Wedding Celebration",
    );

    await user.selectOptions(screen.getByLabelText(/your events/i), "p2");

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Birthday Celebration",
    );
    expect(
      screen.getByText("Birthday Celebration idea one"),
    ).toBeInTheDocument();
  });

  it("does not show the switcher for a single event", () => {
    saveEventPlans([makePlan("p1", "Wedding Celebration")]);
    renderPage();

    expect(screen.queryByLabelText(/your events/i)).not.toBeInTheDocument();
  });

  it("saves edits made in the vendor checklist", async () => {
    const user = userEvent.setup();
    saveEventPlans([makePlan("p1", "Wedding Celebration")]);
    renderPage();

    await user.click(
      screen.getByRole("button", { name: "Mark Caterer booked" }),
    );

    expect(loadEventPlans()[0].vendors[0].booked).toBe(true);
  });

  it("shows an alert instead of crashing when saving fails", async () => {
    const user = userEvent.setup();
    saveEventPlans([makePlan("p1", "Wedding Celebration")]);
    renderPage();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });

    await user.click(
      screen.getByRole("button", { name: "Mark Caterer booked" }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      /unable to save your changes/i,
    );
  });

  it("warns when expenses exceed the available budget", () => {
    saveEventPlans([
      makePlan("p1", "Wedding Celebration", {
        totalBudget: 50000,
        budgetItems: [
          { id: "b1", name: "Venue", amount: 40000 },
          { id: "b2", name: "Catering", amount: 30000 },
        ],
      }),
    ]);
    renderPage();

    expect(screen.getByText(/your event is over budget/i)).toBeInTheDocument();
  });

  it("exports JSON and Markdown and can print", async () => {
    const user = userEvent.setup();
    const print = vi.fn();
    vi.stubGlobal("print", print);
    saveEventPlans([makePlan("p1", "Wedding Celebration")]);
    renderPage();

    await user.click(screen.getByRole("button", { name: /export json/i }));
    await user.click(screen.getByRole("button", { name: /export summary/i }));
    await user.click(screen.getByRole("button", { name: /print plan/i }));

    const names = vi.mocked(downloadTextFile).mock.calls.map((call) => call[0]);

    expect(names[0]).toMatch(/\.json$/);
    expect(names[1]).toMatch(/\.md$/);
    expect(print).toHaveBeenCalledOnce();

    vi.unstubAllGlobals();
  });
});
