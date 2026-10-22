import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Download,
  FileText,
  Printer,
  Store,
  CheckCircle2,
} from "lucide-react";

import BudgetPanel from "./BudgetPanel";
import TimelinePanel from "./TimelinePanel";
import VendorChecklist from "./VendorChecklist";
import OperationsEmptyState from "./OperationsEmptyState";
import EventDetailsPanel from "./EventDetailsPanel";
import EventOverview from "./EventOverview";
import BudgetReserveSummary from "./BudgetReserveSummary";

import Button from "../../components/ui/Button";
import PageHeader from "../../components/shared/PageHeader";
import { calculateBudget } from "../../domain/budget";
import { getTimelineProgress } from "../../domain/timeline";
import {
  downloadTextFile,
  planToJson,
  planToMarkdown,
  safeFileName,
} from "../../domain/export";
import { getVendorProgress } from "../../domain/checklist";
import type { EventPlan } from "../../domain/schema";
import { loadEventPlans, saveEventPlans } from "../../lib/storage";


const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function OperationsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [plans, setPlans] = useState<EventPlan[]>(() => loadEventPlans());

  const requestedId = location.state?.eventId as string | undefined;

  const plan =
    plans.find((item) => item.id === requestedId) ?? plans[plans.length - 1];

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
    return <OperationsEmptyState onCreateEvent={() => navigate("/")} />;
  }
  const budget = calculateBudget(
    plan.totalBudget,
    plan.contingencyPercent,
    plan.budgetItems,
  );

  const progress = getTimelineProgress(plan.timeline);
  const vendorProgress = getVendorProgress(plan.vendors);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:py-12">
      <PageHeader
        eyebrow="AuraPlan · Event operations"
        title={plan.title}
        description="Your celebration, organized in one place. Monitor spending, stay on schedule, and keep every vendor on track."
      />

      <div
        className="mt-4 flex flex-wrap gap-3 print:hidden"
        role="group"
        aria-label="Export and print plan"
      >
        <Button
          variant="secondary"
          onClick={() =>
            downloadTextFile(
              `${safeFileName(plan.title)}.json`,
              planToJson(plan),
              "application/json",
            )
          }
        >
          <Download size={16} aria-hidden="true" />
          Export JSON
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            downloadTextFile(
              `${safeFileName(plan.title)}.md`,
              planToMarkdown(plan),
              "text/markdown",
            )
          }
        >
          <FileText size={16} aria-hidden="true" />
          Export summary
        </Button>
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer size={16} aria-hidden="true" />
          Print plan
        </Button>
      </div>

      <EventDetailsPanel plan={plan} />

      <EventOverview budget={budget} progress={progress} />

      <BudgetReserveSummary
        budget={budget}
        contingencyPercent={plan.contingencyPercent}
      />

      {budget.isOverBudget && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"
        >
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              Your event is over budget
            </p>
            <p className="mt-1 text-sm leading-6 text-red-700">
              Expenses exceed the amount available after your reserve by{" "}
              <strong>{currency.format(-budget.remaining)}</strong>. Adjust your
              expenses in the budget planner below to bring your spending back
              within the limit.
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
            Changes are saved in this browser. This version does not sync across
            devices.
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