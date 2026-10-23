import type { BudgetItem } from "./schema";

export interface BudgetSummary {
  totalBudget: number;
  contingency: number;
  availableForPlanning: number;
  allocated: number;
  remaining: number;
  isOverBudget: boolean;
}

export function calculateBudget(
  totalBudget: number,
  contingencyPercent: number,
  items: BudgetItem[],
): BudgetSummary {
  if (!Number.isFinite(totalBudget) || totalBudget < 0) {
    throw new Error("Total budget must be a non-negative number.");
  }

  if (
    !Number.isFinite(contingencyPercent) ||
    contingencyPercent < 0 ||
    contingencyPercent > 50
  ) {
    throw new Error("Contingency must be between 0% and 50%.");
  }

  const contingency = Math.round(
    totalBudget * (contingencyPercent / 100),
  );

  const allocated = items.reduce((sum, item) => {
    if (!Number.isFinite(item.amount) || item.amount < 0) {
      throw new Error("Budget amounts must be non-negative numbers.");
    }

    return sum + item.amount;
  }, 0);

  const availableForPlanning = totalBudget - contingency;
  const remaining = availableForPlanning - allocated;

  return {
    totalBudget,
    contingency,
    availableForPlanning,
    allocated,
    remaining,
    isOverBudget: remaining < 0,
  };
}

/** Share of the planning budget already allocated, from 0 to 100. */
export function budgetUsedPercent(
  budget: Pick<BudgetSummary, "availableForPlanning" | "allocated">,
): number {
  if (budget.availableForPlanning <= 0) {
    return budget.allocated > 0 ? 100 : 0;
  }

  return Math.min(
    100,
    (budget.allocated / budget.availableForPlanning) * 100,
  );
}