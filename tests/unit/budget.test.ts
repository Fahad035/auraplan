import { describe, expect, it } from "vitest";
import { calculateBudget } from "../../src/domain/budget";
import type { BudgetItem } from "../../src/domain/schema";

const items: BudgetItem[] = [
  { id: "venue", name: "Venue", amount: 35000 },
  { id: "food", name: "Catering", amount: 30000 },
];

describe("calculateBudget", () => {
  it("reserves contingency before calculating available funds", () => {
    const result = calculateBudget(100000, 10, items);

    expect(result.contingency).toBe(10000);
    expect(result.availableForPlanning).toBe(90000);
    expect(result.allocated).toBe(65000);
    expect(result.remaining).toBe(25000);
    expect(result.isOverBudget).toBe(false);
  });

  it("flags allocations that exceed the available planning budget", () => {
    const result = calculateBudget(100000, 10, [
      ...items,
      { id: "decor", name: "Decoration", amount: 30000 },
    ]);

    expect(result.remaining).toBe(-5000);
    expect(result.isOverBudget).toBe(true);
  });

  it("rejects invalid contingency percentages", () => {
    expect(() => calculateBudget(100000, 60, items)).toThrow();
  });
});
