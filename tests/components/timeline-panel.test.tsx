import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TimelinePanel from "../../src/features/operations/TimelinePanel";
import type { TimelineItem } from "../../src/domain/schema";

const start: TimelineItem[] = [
  { id: "t2", title: "Send invites", date: "2030-05-10", completed: true },
  {
    id: "t1",
    title: "Book venue",
    date: "2030-05-01",
    completed: false,
    urgent: true,
  },
];

function Harness({ initial = start }: { initial?: TimelineItem[] }) {
  const [items, setItems] = useState<TimelineItem[]>(initial);

  return <TimelinePanel items={items} onChange={setItems} />;
}

afterEach(cleanup);

describe("TimelinePanel", () => {
  it("lists tasks in date order with progress", () => {
    render(<Harness />);

    const toggles = screen.getAllByRole("button", {
      name: /^mark .* (in)?complete$/i,
    });

    expect(toggles[0]).toHaveAccessibleName("Mark Book venue complete");
    expect(toggles[1]).toHaveAccessibleName("Mark Send invites incomplete");
    expect(screen.getByText(/50% of tasks completed/)).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: /timeline completion/i }),
    ).toHaveAttribute("aria-valuenow", "50");
  });

  it("flags urgent tasks until they are completed", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    expect(screen.getByText("Do now")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Mark Book venue complete" }),
    );

    expect(screen.queryByText("Do now")).not.toBeInTheDocument();
    expect(screen.getByText(/100% of tasks completed/)).toBeInTheDocument();
  });

  it("adds a task and resets the form", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText(/task name/i), "Order cake");
    await user.type(screen.getByLabelText(/task date/i), "2099-05-05");
    await user.click(
      screen.getByRole("button", { name: /add timeline task/i }),
    );

    expect(screen.getByText("Order cake")).toBeInTheDocument();
    expect(screen.getByLabelText(/task name/i)).toHaveValue("");
  });

  it("validates the name, its length and the date", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(
      screen.getByRole("button", { name: /add timeline task/i }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/enter a task name/i);

    await user.type(screen.getByLabelText(/task name/i), "Buy balloons");
    await user.click(
      screen.getByRole("button", { name: /add timeline task/i }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/choose a date/i);
  });

  it("rejects over-long task names", async () => {
    const { fireEvent } = await import("@testing-library/react");
    const user = userEvent.setup();
    render(<Harness />);

    fireEvent.change(screen.getByLabelText(/task name/i), {
      target: { value: "x".repeat(121) },
    });
    await user.click(
      screen.getByRole("button", { name: /add timeline task/i }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      /120 characters or fewer/i,
    );
  });

  it("deletes a task and shows the empty state", async () => {
    const user = userEvent.setup();
    render(<Harness initial={[start[0]]} />);

    await user.click(
      screen.getByRole("button", { name: "Delete Send invites" }),
    );

    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
    expect(screen.getByText(/0% of tasks completed/)).toBeInTheDocument();
  });
});
