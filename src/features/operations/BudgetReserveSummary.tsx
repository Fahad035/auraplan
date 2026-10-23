import { PiggyBank, Wallet } from "lucide-react";

import type { BudgetSummary } from "../../domain/budget";
import { formatCurrency } from "../../lib/format";

interface BudgetReserveSummaryProps {
  budget: BudgetSummary;
  contingencyPercent: number;
}

export default function BudgetReserveSummary({
  budget,
  contingencyPercent,
}: BudgetReserveSummaryProps) {
  return (
    <section
      aria-label="Budget reserve summary"
      className="mt-6 grid gap-4 sm:grid-cols-2"
    >
      <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
          <PiggyBank size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800">
            Protected contingency reserve
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Funds set aside for unexpected event expenses.
          </p>
          <p className="mt-3 wrap-break-word text-lg font-bold text-slate-900">
            {formatCurrency(budget.contingency)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {contingencyPercent}% of your total budget
          </p>
        </div>
      </div>

      <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Wallet size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800">
            Available for planning
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Your spending limit after reserving contingency funds.
          </p>
          <p className="mt-3 wrap-break-word text-lg font-bold text-slate-900">
            {formatCurrency(budget.availableForPlanning)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Before subtracting planned expenses
          </p>
        </div>
      </div>
    </section>
  );
}