import { describe, expect, it } from "vitest";
import { calculateBudget } from "../../src/domain/budget";

describe("calculateBudget validation", () => {
  it("rejects a negative or non-finite total budget", () => {
    expect(() => calculateBudget(-1, 10, [])).toThrow(
      "Total budget must be a non-negative number.",
    );
    expect(() => calculateBudget(Number.NaN, 10, [])).toThrow();
    expect(() => calculateBudget(Infinity, 10, [])).toThrow();
  });

  it("rejects negative or non-finite expense amounts", () => {
    expect(() =>
      calculateBudget(1000, 10, [{ id: "a", name: "A", amount: -5 }]),
    ).toThrow("Budget amounts must be non-negative numbers.");
    expect(() =>
      calculateBudget(1000, 10, [{ id: "a", name: "A", amount: Number.NaN }]),
    ).toThrow();
  });

  it("rejects negative contingency", () => {
    expect(() => calculateBudget(1000, -1, [])).toThrow();
  });
});
