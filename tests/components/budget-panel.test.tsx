import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import BudgetPanel from "../../src/features/operations/BudgetPanel";
import type { BudgetItem } from "../../src/domain/schema";

const start: BudgetItem[] = [
  { id: "b1", name: "Venue", amount: 30000 },
  { id: "b2", name: "Catering", amount: 40000 },
];

function Harness({
  total = 100000,
  initial = start,
}: {
  total?: number;
  initial?: BudgetItem[];
}) {
  const [items, setItems] = useState<BudgetItem[]>(initial);

  return (
    <BudgetPanel
      totalBudget={total}
      contingencyPercent={10}
      items={items}
      onChange={setItems}
    />
  );
}

afterEach(cleanup);

describe("BudgetPanel", () => {
  it("shows the reserve and allocation progress", () => {
    render(<Harness />);

    expect(screen.getByText(/Reserve \(10%\)/)).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: /budget allocation/i }),
    ).toHaveAttribute("aria-valuenow", "78");
  });

  it("adds an expense and clears the form", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByPlaceholderText(/photography/i), "Photography");
    await user.type(screen.getByPlaceholderText("15000"), "5000");
    await user.click(screen.getByRole("button", { name: /add expense/i }));

    expect(screen.getByLabelText("Amount for Photography")).toHaveValue(5000);
    expect(screen.getByPlaceholderText(/photography/i)).toHaveValue("");
  });

  it("validates name and amount", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: /add expense/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/category name/i);

    await user.type(screen.getByPlaceholderText(/photography/i), "Music");
    await user.click(screen.getByRole("button", { name: /add expense/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      /valid, non-negative amount/i,
    );
  });

  it("edits amounts and deletes an expense", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const amount = screen.getByLabelText("Amount for Venue");
    await user.clear(amount);
    await user.type(amount, "35000");
    expect(screen.getByLabelText("Amount for Venue")).toHaveValue(35000);

    await user.click(screen.getByRole("button", { name: "Delete Venue" }));
    expect(screen.queryByLabelText("Name for Venue")).not.toBeInTheDocument();
  });

  it("warns when over budget and explains an empty list", () => {
    render(<Harness total={50000} />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      /exceed the available budget by/i,
    );

    cleanup();
    render(<Harness initial={[]} />);
    expect(screen.getByText(/no expenses yet/i)).toBeInTheDocument();
  });
});
