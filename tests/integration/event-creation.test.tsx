import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import EventCreationForm from "../../src/features/assistant/EventCreationForm";
import { generateRecommendations } from "../../src/lib/api";
import { loadEventPlans } from "../../src/lib/storage";

vi.mock("../../src/lib/api", () => ({
  generateRecommendations: vi.fn(),
}));

function OperationsPage() {
  const location = useLocation();
  const state = location.state as { eventId?: string } | null;

  return (
    <div>
      <h1>Operations page</h1>
      <p data-testid="event-id">{state?.eventId ?? "missing-event-id"}</p>
    </div>
  );
}

function renderEventCreationForm() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<EventCreationForm />} />
        <Route path="/operations" element={<OperationsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

const mockRecommendations = {
  ideas: [
    "Choose a personalized birthday theme",
    "Arrange decorations to match the theme",
    "Create a guest-friendly celebration space",
  ],
  budgetItems: [
    { name: "Venue", amount: 15000 },
    { name: "Food and catering", amount: 20000 },
    { name: "Decorations", amount: 10000 },
  ],
  timeline: [
    { title: "Confirm venue", daysBeforeEvent: 30 },
    { title: "Finalize catering", daysBeforeEvent: 7 },
    { title: "Prepare decorations", daysBeforeEvent: 1 },
  ],
};

describe("Event creation integration", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("creates an event, saves the plan, and navigates to operations", async () => {
    const user = userEvent.setup();

    vi.mocked(generateRecommendations).mockResolvedValue(mockRecommendations);

    renderEventCreationForm();

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 40);

    const eventDate = [
      futureDate.getFullYear(),
      String(futureDate.getMonth() + 1).padStart(2, "0"),
      String(futureDate.getDate()).padStart(2, "0"),
    ].join("-");

    await user.selectOptions(screen.getByLabelText(/event type/i), "birthday");
    await user.type(screen.getByLabelText(/event date/i), eventDate);
    await user.type(
      screen.getByLabelText(/event location/i),
      "Hyderabad, Telangana",
    );

    await user.clear(screen.getByLabelText(/expected guests/i));
    await user.type(screen.getByLabelText(/expected guests/i), "50");

    await user.clear(screen.getByLabelText(/total budget/i));
    await user.type(screen.getByLabelText(/total budget/i), "50000");

    await user.click(
      screen.getByRole("button", { name: /generate ai event plan/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /operations page/i }),
      ).toBeInTheDocument();
    });

    expect(generateRecommendations).toHaveBeenCalledOnce();

    expect(generateRecommendations).toHaveBeenCalledWith({
      eventType: "birthday",
      eventDate: "2026-12-01",
      location: "Hyderabad, Telangana",
      guestCount: 50,
      totalBudget: 50000,
    });

    const savedPlans = loadEventPlans();

    expect(savedPlans).toHaveLength(1);
    expect(savedPlans[0]).toMatchObject({
      title: "Birthday Celebration",
      eventType: "birthday",
      eventDate,
      location: "Hyderabad, Telangana",
      guestCount: 50,
      totalBudget: 50000,
      contingencyPercent: 10,
      vendors: expect.arrayContaining([
        expect.objectContaining({
          category: "Venue",
          name: "Venue",
          booked: false,
        }),
        expect.objectContaining({
          category: "Catering",
          name: "Caterer or bakery",
          booked: false,
        }),
        expect.objectContaining({
          category: "Decoration",
          name: "Decorator",
          booked: false,
        }),
        expect.objectContaining({
          category: "Entertainment",
          name: "Entertainer",
          booked: false,
        }),
        expect.objectContaining({
          category: "Photography",
          name: "Photographer",
          booked: false,
        }),
      ]),
      ideas: mockRecommendations.ideas,
    });

    expect(savedPlans[0].budgetItems).toHaveLength(3);
    expect(savedPlans[0].timeline).toHaveLength(3);
    expect(savedPlans[0].timeline.every((item) => !item.completed)).toBe(true);

    expect(screen.getByTestId("event-id")).toHaveTextContent(savedPlans[0].id);
  });

  it("shows a validation error for an invalid guest count", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <EventCreationForm />
      </MemoryRouter>,
    );

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const eventDate = [
      futureDate.getFullYear(),
      String(futureDate.getMonth() + 1).padStart(2, "0"),
      String(futureDate.getDate()).padStart(2, "0"),
    ].join("-");

    fireEvent.change(screen.getByLabelText(/event date/i), {
      target: { value: eventDate },
    });

    await user.type(screen.getByLabelText(/event location/i), "Hyderabad");

    fireEvent.change(screen.getByLabelText(/expected guests/i), {
      target: { value: "0" },
    });

    // Dispatch submit directly to test the component's own validation.
    fireEvent.submit(
      screen
        .getByRole("button", {
          name: /generate AI event plan/i,
        })
        .closest("form")!,
    );

    expect(
      await screen.findByRole("alert").then((element) => element.textContent),
    ).toMatch(/valid guest count/i);

    expect(generateRecommendations).not.toHaveBeenCalled();
  });

  it("shows an API error and does not save a plan", async () => {
    const user = userEvent.setup();

    vi.mocked(generateRecommendations).mockRejectedValue(
      new Error("AI service is temporarily unavailable."),
    );

    renderEventCreationForm();

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 40);

    const eventDate = [
      futureDate.getFullYear(),
      String(futureDate.getMonth() + 1).padStart(2, "0"),
      String(futureDate.getDate()).padStart(2, "0"),
    ].join("-");

    await user.type(screen.getByLabelText(/event date/i), eventDate);
    await user.type(
      screen.getByLabelText(/event location/i),
      "Hyderabad, Telangana",
    );

    await user.click(
      screen.getByRole("button", { name: /generate ai event plan/i }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /AI service is temporarily unavailable/i,
    );

    expect(loadEventPlans()).toHaveLength(0);
    expect(
      screen.getByRole("button", { name: /generate ai event plan/i }),
    ).toBeEnabled();
  });

  it("shows a loading state while recommendations are pending", async () => {
    const user = userEvent.setup();

    let resolveRecommendations!: (value: typeof mockRecommendations) => void;

    vi.mocked(generateRecommendations).mockReturnValue(
      new Promise((resolve) => {
        resolveRecommendations = resolve;
      }),
    );

    renderEventCreationForm();

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 40);

    const eventDate = [
      futureDate.getFullYear(),
      String(futureDate.getMonth() + 1).padStart(2, "0"),
      String(futureDate.getDate()).padStart(2, "0"),
    ].join("-");

    await user.type(screen.getByLabelText(/event date/i), eventDate);
    await user.type(
      screen.getByLabelText(/event location/i),
      "Hyderabad, Telangana",
    );

    await user.click(
      screen.getByRole("button", { name: /generate ai event plan/i }),
    );

    expect(
      screen.getByRole("button", {
        name: /generating your AI event plan/i,
      }),
    ).toBeDisabled();

    expect(screen.getByRole("status")).toHaveTextContent(
      /preparing your ideas/i,
    );

    resolveRecommendations(mockRecommendations);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /operations page/i }),
      ).toBeInTheDocument();
    });
  });
});
