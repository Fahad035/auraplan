
import {
  CheckCircle2,
  IndianRupee,
  PiggyBank,
  Wallet,
} from "lucide-react";

import type { BudgetSummary } from "../../domain/budget";
type TimelineProgress = ReturnType<typeof getTimelineProgress>;
import { getTimelineProgress } from "../../domain/timeline";

interface EventOverviewProps {
  budget: BudgetSummary;
  progress: TimelineProgress;
}

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function EventOverview({
  budget,
  progress,
}: EventOverviewProps) {
  const planningBudgetUsed =
    budget.availableForPlanning > 0
      ? Math.min(
          100,
          (budget.allocated / budget.availableForPlanning) * 100,
        )
      : budget.allocated > 0
        ? 100
        : 0;

  const budgetCards = [
    {
      label: "Total budget",
      value: currency.format(budget.totalBudget),
      note: "Your overall spending limit",
      icon: IndianRupee,
      iconStyle: "bg-violet-100 text-violet-700",
      barStyle: "bg-violet-500",
      barWidth: 100,
    },
    {
      label: "Planned expenses",
      value: currency.format(budget.allocated),
      note: `${Math.round(planningBudgetUsed)}% of the spendable budget`,
      icon: Wallet,
      iconStyle: "bg-blue-100 text-blue-700",
      barStyle: budget.isOverBudget ? "bg-red-500" : "bg-blue-500",
      barWidth: planningBudgetUsed,
    },
    {
      label: "Available balance",
      value: currency.format(budget.remaining),
      note: budget.isOverBudget
        ? "Expenses exceed your spending limit"
        : "Available after protecting your reserve",
      icon: PiggyBank,
      iconStyle: budget.isOverBudget
        ? "bg-red-100 text-red-700"
        : "bg-emerald-100 text-emerald-700",
      barStyle: budget.isOverBudget ? "bg-red-500" : "bg-emerald-500",
      barWidth:
        budget.availableForPlanning > 0
          ? Math.max(
              0,
              Math.min(
                100,
                (budget.remaining / budget.availableForPlanning) * 100,
              ),
            )
          : 0,
    },
    {
      label: "Tasks completed",
      value: `${progress.completed}/${progress.total}`,
      note: `${progress.percentage}% of planning tasks finished`,
      icon: CheckCircle2,
      iconStyle: "bg-amber-100 text-amber-700",
      barStyle: "bg-amber-500",
      barWidth: progress.percentage,
    },
  ];

  return (
    <section aria-label="Event overview" className="mt-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
            At a glance
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            Event overview
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Updated as you manage your event
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {budgetCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="group min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-3 wrap-break-word text-2xl font-bold tracking-tight text-slate-900">
                    {stat.value}
                  </p>
                </div>

                <div
                  className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${stat.iconStyle}`}
                >
                  <Icon size={21} />
                </div>
              </div>

              <div
                className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100"
                aria-hidden="true"
              >
                <div
                  className={`h-full rounded-full transition-all duration-300 ${stat.barStyle}`}
                  style={{ width: `${stat.barWidth}%` }}
                />
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                {stat.note}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
