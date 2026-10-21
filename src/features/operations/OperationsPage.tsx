import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  IndianRupee,
  MapPin,
  PiggyBank,
  Sparkles,
  Store,
  Users,
  Wallet,
} from "lucide-react";

import BudgetPanel from "./BudgetPanel";
import TimelinePanel from "./TimelinePanel";
import VendorChecklist from "./VendorChecklist";

import PageHeader from "../../components/shared/PageHeader";
import Button from "../../components/ui/Button";

import { calculateBudget } from "../../domain/budget";
import { getTimelineProgress } from "../../domain/timeline";
import { getVendorProgress } from "../../domain/checklist";
import type { EventPlan } from "../../domain/schema";
import { loadEventPlans, saveEventPlans } from "../../lib/storage";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatEventDate(value: string) {
  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getDaysUntilEvent(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const eventDate = Date.UTC(year, month - 1, day);
  const today = new Date();
  const todayDate = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const difference = Math.round(
    (eventDate - todayDate) / (1000 * 60 * 60 * 24),
  );

  return difference;
}

export default function OperationsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [plans, setPlans] = useState<EventPlan[]>(() => loadEventPlans());

  const requestedId = location.state?.eventId as string | undefined;

  const plan =
    plans.find((item) => item.id === requestedId) ??
    plans[plans.length - 1];

  function updatePlan(updatedPlan: EventPlan) {
    const updatedPlans = plans.map((item) =>
      item.id === updatedPlan.id ? updatedPlan : item,
    );

    try {
      saveEventPlans(updatedPlans);
      setPlans(updatedPlans);
    } catch {
      window.alert(
        "Unable to save your changes. Check available browser storage.",
      );
    }
  }

  if (!plan) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:py-16">
        <div className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm">
          <div className="bg-linear-to-br from-violet-50 via-white to-indigo-50 px-6 py-12 text-center sm:px-12 sm:py-16">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 ring-8 ring-violet-50">
              <Sparkles size={28} />
            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
              Your event journey starts here
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Every celebration,
              <span className="block text-violet-600">
                beautifully planned.
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
              Bring your ideas to life with AI-generated recommendations,
              a practical budget, an organized timeline, and vendor tracking
              in one workspace.
            </p>

            <div className="mt-8 flex justify-center">
              <Button onClick={() => navigate("/")}>
                Create your first event
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>

          <div className="grid gap-4 border-t border-slate-100 p-5 sm:grid-cols-3 sm:p-7">
            <div className="rounded-2xl bg-slate-50 p-4">
              <Wallet className="size-5 text-violet-600" />
              <h2 className="mt-3 text-sm font-semibold text-slate-800">
                Budget planning
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Organize expenses and protect your contingency reserve.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <CalendarDays className="size-5 text-violet-600" />
              <h2 className="mt-3 text-sm font-semibold text-slate-800">
                Planning timeline
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Track milestones and stay on top of your tasks.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <Store className="size-5 text-violet-600" />
              <h2 className="mt-3 text-sm font-semibold text-slate-800">
                Vendor management
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Keep vendor details and booking progress organized.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const budget = calculateBudget(
    plan.totalBudget,
    plan.contingencyPercent,
    plan.budgetItems,
  );

  const progress = getTimelineProgress(plan.timeline);
  const vendorProgress = getVendorProgress(plan.vendors);
  const daysUntilEvent = getDaysUntilEvent(plan.eventDate);

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
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:py-12">
      <PageHeader
        eyebrow="AuraPlan · Event operations"
        title={plan.title}
        description="Your celebration, organized in one place. Monitor spending, stay on schedule, and keep every vendor on track."
      />

      <section
        aria-label="Event details"
        className="relative mt-6 overflow-hidden rounded-3xl border border-violet-100 bg-linear-to-br from-violet-50 via-white to-indigo-50 p-5 shadow-sm sm:p-7"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 size-48 rounded-full bg-violet-200/30 blur-3xl"
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-violet-700">
              <Sparkles size={14} />
              Your event workspace
            </div>

            <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Make every detail count.
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Keep your event details, budget, tasks, and bookings updated as
              your plans come together.
            </p>
          </div>

          <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:min-w-97.5">
            <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-white bg-white/90 p-4 shadow-sm">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <CalendarDays size={19} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">
                  Event date
                </p>
                <p className="mt-1 wrap-break-word text-sm font-semibold text-slate-900">
                  {formatEventDate(plan.eventDate)}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-white bg-white/90 p-4 shadow-sm">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <MapPin size={19} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">
                  Location
                </p>
                <p className="mt-1 wrap-break-word text-sm font-semibold text-slate-900">
                  {plan.location}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-white bg-white/90 p-4 shadow-sm">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Users size={19} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">
                  Expected guests
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {plan.guestCount.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-white bg-white/90 p-4 shadow-sm">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Clock3 size={19} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">
                  Event countdown
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {daysUntilEvent === null
                    ? "Date unavailable"
                    : daysUntilEvent < 0
                      ? `${Math.abs(daysUntilEvent)} days ago`
                      : daysUntilEvent === 0
                        ? "It's event day!"
                        : `${daysUntilEvent} days to go`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              {currency.format(budget.contingency)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {plan.contingencyPercent}% of your total budget
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
              {currency.format(budget.availableForPlanning)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Before subtracting planned expenses
            </p>
          </div>
        </div>
      </section>

      {budget.isOverBudget && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"
        >
          <AlertTriangle
            size={20}
            className="mt-0.5 shrink-0 text-red-600"
          />
          <div>
            <p className="text-sm font-semibold text-red-800">
              Your event is over budget
            </p>
            <p className="mt-1 text-sm leading-6 text-red-700">
              Expenses exceed the amount available after your reserve by{" "}
              <strong>{currency.format(-budget.remaining)}</strong>. Adjust
              your expenses in the budget planner below to bring your spending
              back within the limit.
            </p>
          </div>
        </div>
      )}

      <section aria-label="Budget management" className="mt-8">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
            Financial planning
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            Manage your budget
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Review your expenses, protect your reserve, and adjust allocations
            whenever your plans change.
          </p>
        </div>

        <BudgetPanel
          totalBudget={plan.totalBudget}
          contingencyPercent={plan.contingencyPercent}
          items={plan.budgetItems}
          onChange={(items) => updatePlan({ ...plan, budgetItems: items })}
        />
      </section>

      <section aria-label="Planning and vendor management" className="mt-8">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
            Execution workspace
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            Keep everything on track
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Complete your planning tasks and monitor vendor bookings as your
            event approaches.
          </p>
        </div>

        <div className="mb-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Planning progress
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {progress.completed} of {progress.total} tasks completed
                  </p>
                </div>
              </div>
              <span className="text-lg font-bold text-violet-700">
                {progress.percentage}%
              </span>
            </div>

            <div
              className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label="Overall planning progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress.percentage}
            >
              <div
                className="h-full rounded-full bg-violet-600 transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Store size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Vendor bookings
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {vendorProgress.booked} of {vendorProgress.total} vendors
                    booked
                  </p>
                </div>
              </div>
              <span className="text-lg font-bold text-emerald-700">
                {vendorProgress.percentage}%
              </span>
            </div>

            <div
              className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label="Overall vendor booking progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={vendorProgress.percentage}
            >
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${vendorProgress.percentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <TimelinePanel
            items={plan.timeline}
            onChange={(timeline) => updatePlan({ ...plan, timeline })}
          />

          <VendorChecklist
            vendors={plan.vendors}
            onChange={(vendors) => updatePlan({ ...plan, vendors })}
          />
        </div>
      </section>

      <footer className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700">
            Your event workspace, always within reach.
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Changes are saved in this browser. This version does not sync
            across devices.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
          <CheckCircle2 size={16} />
          Browser storage enabled
        </div>
      </footer>
    </main>
  );
}